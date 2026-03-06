import crypto from 'crypto';
import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import {
  cleanupE2eArtifacts,
  createE2eArtifacts,
} from './helpers/artifacts';
import {
  adminCredentialsMissing,
  apiBaseUrl,
  apiSecret,
  signInAsAdmin,
} from './helpers/auth';

const missingEnv = adminCredentialsMissing || !apiSecret;

const ensureHomeCategoryId = async (
  request: APIRequestContext
) => {
  const res = await request.get(`${apiBaseUrl}/api/categories`);
  expect(res.ok()).toBeTruthy();
  const categories = (await res.json()) as Array<{ id: string; slug: string }>;
  const home = categories.find((category) => category.slug === 'home');
  if (home) return home.id;

  const createRes = await request.post(`${apiBaseUrl}/api/categories`, {
    data: { name: 'Home', description: 'Home' },
    headers: { 'content-type': 'application/json' },
  });
  expect(createRes.ok()).toBeTruthy();
  const created = (await createRes.json()) as { id: string };
  return created.id;
};

const sendWebhookImage = async (
  request: APIRequestContext,
  {
    publicId,
    title,
  }: {
    publicId: string;
    title: string;
  }
) => {
  const now = Date.now();
  const payload = {
    public_id: publicId,
    secure_url: `https://res.cloudinary.com/demo/image/upload/v${now}/sample.jpg`,
    original_filename: title,
    width: 1200,
    height: 800,
    context: {
      custom: {
        title,
      },
    },
  };

  const rawBody = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = crypto
    .createHash('sha1')
    .update(`${rawBody}${timestamp}${apiSecret}`)
    .digest('hex');

  const res = await request.post(`${apiBaseUrl}/api/cloudinary/webhook`, {
    data: rawBody,
    headers: {
      'content-type': 'application/json',
      'x-cld-signature': signature,
      'x-cld-timestamp': timestamp,
    },
  });
  expect(res.ok()).toBeTruthy();
};

const findImageIdByTitle = async (request: APIRequestContext, title: string) => {
  const res = await request.get(
    `${apiBaseUrl}/api/images?search=${encodeURIComponent(title)}`
  );
  expect(res.ok()).toBeTruthy();
  const payload = (await res.json()) as { images?: Array<{ id: string; title?: string | null }> };
  const image = payload.images?.find((img) => img.title === title) ?? payload.images?.[0];
  if (!image?.id) {
    throw new Error('Unable to locate image by title');
  }
  return image.id;
};

test.describe('Category delete keeps images in Home', () => {
  test.skip(missingEnv, 'Missing admin credentials or API_SECRET');

  test('deleting a category does not orphan images from Home', async ({ page }) => {
    await signInAsAdmin(page);
    const authRequest = page.request;

    const artifacts = createE2eArtifacts();
    const now = Date.now();
    const title = `E2E Delete ${now}`;
    const publicId = `e2e/delete/${now}-${Math.random().toString(16).slice(2)}`;
    artifacts.imagePublicIds.add(publicId);

    try {
      const homeCategoryId = await ensureHomeCategoryId(authRequest);
      await sendWebhookImage(authRequest, {
        publicId,
        title,
      });

      const imageId = await findImageIdByTitle(authRequest, title);
      artifacts.imageIds.add(imageId);

      const createCategoryRes = await authRequest.post(`${apiBaseUrl}/api/categories`, {
        data: { name: `E2E Delete Cat ${now}`, description: 'delete test' },
        headers: { 'content-type': 'application/json' },
      });
      expect(createCategoryRes.ok()).toBeTruthy();
      const category = (await createCategoryRes.json()) as { id: string };
      artifacts.categoryIds.add(category.id);

      const attachRes = await authRequest.post(
        `${apiBaseUrl}/api/categories/${category.id}/images`,
        {
          data: { imageIds: [imageId] },
          headers: { 'content-type': 'application/json' },
        }
      );
      expect(attachRes.ok()).toBeTruthy();

      const deleteRes = await authRequest.delete(`${apiBaseUrl}/api/categories/${category.id}`);
      expect(deleteRes.ok()).toBeTruthy();
      artifacts.categoryIds.delete(category.id);

      const homeDetailRes = await authRequest.get(
        `${apiBaseUrl}/api/categories/${homeCategoryId}`
      );
      expect(homeDetailRes.ok()).toBeTruthy();
      const homeDetail = (await homeDetailRes.json()) as { images?: Array<{ title?: string | null }> };
      const found = homeDetail.images?.some((img) => img.title === title);
      expect(found).toBeTruthy();
    } finally {
      await cleanupE2eArtifacts({
        request: authRequest,
        artifacts,
        apiBaseUrl,
      });
    }
  });
});
