import crypto from 'crypto';
import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

const adminEmail =
  process.env.AUTH_EMAIL ??
  process.env.DASHBOARD_EMAIL ??
  process.env.E2E_ADMIN_EMAIL;
const adminPassword =
  process.env.AUTH_PASSWORD ??
  process.env.DASHBOARD_PASSWORD ??
  process.env.E2E_ADMIN_PASSWORD;
const apiSecret = process.env.API_SECRET ?? process.env.CLOUDINARY_API_SECRET;
const apiBaseUrl = process.env.E2E_API_BASE_URL ?? 'http://localhost:3000';

const missingEnv = !adminEmail || !adminPassword || !apiSecret;

const getAdminToken = async (request: APIRequestContext) => {
  const res = await request.post(`${apiBaseUrl}/api/auth/login`, {
    data: { email: adminEmail, password: adminPassword },
    headers: { 'content-type': 'application/json' },
  });
  expect(res.ok()).toBeTruthy();
  const payload = (await res.json()) as { token?: string };
  if (!payload.token) {
    throw new Error('Missing token in /api/auth/login response');
  }
  return payload.token;
};

const ensureHomeCategoryId = async (
  request: APIRequestContext,
  token: string
) => {
  const res = await request.get(`${apiBaseUrl}/api/categories`);
  expect(res.ok()).toBeTruthy();
  const categories = (await res.json()) as Array<{ id: string; slug: string }>;
  const home = categories.find((category) => category.slug === 'home');
  if (home) return home.id;

  const createRes = await request.post(`${apiBaseUrl}/api/categories`, {
    data: { name: 'Home', description: 'Home' },
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
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

  test('deleting a category does not orphan images from Home', async ({ request }) => {
    const token = await getAdminToken(request);
    const homeCategoryId = await ensureHomeCategoryId(request, token);

    const now = Date.now();
    const title = `E2E Delete ${now}`;
    await sendWebhookImage(request, {
      publicId: `e2e/delete/${now}-${Math.random().toString(16).slice(2)}`,
      title,
    });

    const imageId = await findImageIdByTitle(request, title);

    const createCategoryRes = await request.post(`${apiBaseUrl}/api/categories`, {
      data: { name: `E2E Delete Cat ${now}`, description: 'delete test' },
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    expect(createCategoryRes.ok()).toBeTruthy();
    const category = (await createCategoryRes.json()) as { id: string };

    const attachRes = await request.post(
      `${apiBaseUrl}/api/categories/${category.id}/images`,
      {
        data: { imageIds: [imageId] },
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(attachRes.ok()).toBeTruthy();

    const deleteRes = await request.delete(`${apiBaseUrl}/api/categories/${category.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(deleteRes.ok()).toBeTruthy();

    const homeDetailRes = await request.get(
      `${apiBaseUrl}/api/categories/${homeCategoryId}`
    );
    expect(homeDetailRes.ok()).toBeTruthy();
    const homeDetail = (await homeDetailRes.json()) as { images?: Array<{ title?: string | null }> };
    const found = homeDetail.images?.some((img) => img.title === title);
    expect(found).toBeTruthy();
  });
});

