import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import {
  cleanupE2eArtifacts,
  createE2eArtifacts,
} from './helpers/artifacts';
import {
  adminCredentialsMissing,
  apiBaseUrl,
  signInAsAdmin,
} from './helpers/auth';

const missingEnv = adminCredentialsMissing;

const fetchHomeCategoryId = async (request: APIRequestContext) => {
  const res = await request.get(`${apiBaseUrl}/api/categories`);
  expect(res.ok()).toBeTruthy();
  const categories = (await res.json()) as Array<{ id: string; slug: string }>;
  const home = categories.find((category) => category.slug === 'home');
  if (!home) {
    throw new Error('Home category not found');
  }
  return home.id;
};

const categoryHasImageTitle = async (
  request: APIRequestContext,
  categoryId: string,
  title: string
) => {
  const res = await request.get(`${apiBaseUrl}/api/categories/${categoryId}`);
  if (!res.ok()) {
    return false;
  }

  const detail = (await res.json()) as {
    images?: Array<{ title?: string | null }>;
  };
  return detail.images?.some((img) => img.title === title) ?? false;
};

test.describe('Edit Image category', () => {
  test.skip(missingEnv, 'Missing admin credentials');

  test('can assign an image to a category and keep it in Home', async ({
    page,
  }) => {
    await signInAsAdmin(page);
    const authRequest = page.request;

    const artifacts = createE2eArtifacts();
    const now = Date.now();
    try {
      const createCategory = async (suffix: string) => {
        const res = await authRequest.post(`${apiBaseUrl}/api/categories`, {
          data: {
            name: `E2E Edit Cat ${now} ${suffix}`,
            description: 'edit-image-category',
          },
          headers: { 'content-type': 'application/json' },
        });
        expect(res.ok()).toBeTruthy();
        return (await res.json()) as { id: string; name: string };
      };

      const categoryA = await createCategory('A');
      artifacts.categoryIds.add(categoryA.id);
      const categoryB = await createCategory('B');
      artifacts.categoryIds.add(categoryB.id);

      const title = `E2E Image Edit Cat ${now}`;
      const publicId = `e2e/edit-cat/${now}-${Math.random().toString(16).slice(2)}`;
      artifacts.imagePublicIds.add(publicId);
      const fromCloudinaryRes = await authRequest.post(
        `${apiBaseUrl}/api/images/from-cloudinary`,
        {
          data: {
            cloudinaryId: publicId,
            url: `https://res.cloudinary.com/demo/image/upload/v${now}/sample.jpg`,
            title,
            width: 1200,
            height: 800,
          },
          headers: { 'content-type': 'application/json' },
        }
      );
      expect(fromCloudinaryRes.ok()).toBeTruthy();
      const createdImage = (await fromCloudinaryRes.json()) as { id?: string };
      if (!createdImage.id) {
        throw new Error('Missing id in /api/images/from-cloudinary response');
      }
      artifacts.imageIds.add(createdImage.id);

      await page.goto(`/images/${createdImage.id}`);

      const categoriesField = page.locator('[aria-label="Categories"]').first();
      await expect(categoriesField).toBeVisible();
      await categoriesField.click();

      const clickItem = async (name: string) => {
        const item = page.locator('[cmdk-item]').filter({ hasText: name }).first();
        await expect(item).toBeVisible();
        await item.click();
      };

      await clickItem(categoryA.name);
      await clickItem(categoryB.name);

      await page.getByRole('button', { name: 'Submit' }).click();

      await expect
        .poll(() => categoryHasImageTitle(authRequest, categoryA.id, title))
        .toBe(true);

      await expect
        .poll(() => categoryHasImageTitle(authRequest, categoryB.id, title))
        .toBe(true);

      const homeId = await fetchHomeCategoryId(authRequest);
      await expect
        .poll(() => categoryHasImageTitle(authRequest, homeId, title))
        .toBe(true);
    } finally {
      await cleanupE2eArtifacts({
        request: authRequest,
        artifacts,
        apiBaseUrl,
      });
    }
  });
});
