import { expect, test } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';
import {
  cleanupE2eArtifacts,
  createE2eArtifacts,
} from './helpers/artifacts';

const adminEmail =
  process.env.AUTH_EMAIL ??
  process.env.DASHBOARD_EMAIL ??
  process.env.E2E_ADMIN_EMAIL;
const adminPassword =
  process.env.AUTH_PASSWORD ??
  process.env.DASHBOARD_PASSWORD ??
  process.env.E2E_ADMIN_PASSWORD;
const apiBaseUrl = process.env.E2E_API_BASE_URL ?? 'http://localhost:3000';

const missingEnv = !adminEmail || !adminPassword;

const signIn = async (page: Page) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(adminEmail!);
  await page.getByLabel('Password').fill(adminPassword!);
  await page.getByRole('button', { name: 'Sign in' }).click();
};

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
    request,
  }) => {
    const artifacts = createE2eArtifacts();
    const now = Date.now();
    const token = await getAdminToken(request);
    try {
      const createCategory = async (suffix: string) => {
        const res = await request.post(`${apiBaseUrl}/api/categories`, {
          data: {
            name: `E2E Edit Cat ${now} ${suffix}`,
            description: 'edit-image-category',
          },
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
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
      const fromCloudinaryRes = await request.post(
        `${apiBaseUrl}/api/images/from-cloudinary`,
        {
          data: {
            cloudinaryId: publicId,
            url: `https://res.cloudinary.com/demo/image/upload/v${now}/sample.jpg`,
            title,
            width: 1200,
            height: 800,
          },
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      expect(fromCloudinaryRes.ok()).toBeTruthy();
      const createdImage = (await fromCloudinaryRes.json()) as { id?: string };
      if (!createdImage.id) {
        throw new Error('Missing id in /api/images/from-cloudinary response');
      }
      artifacts.imageIds.add(createdImage.id);

      await signIn(page);
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
        .poll(() => categoryHasImageTitle(request, categoryA.id, title))
        .toBe(true);

      await expect
        .poll(() => categoryHasImageTitle(request, categoryB.id, title))
        .toBe(true);

      const homeId = await fetchHomeCategoryId(request);
      await expect
        .poll(() => categoryHasImageTitle(request, homeId, title))
        .toBe(true);
    } finally {
      await cleanupE2eArtifacts({
        request,
        token,
        artifacts,
        apiBaseUrl,
      });
    }
  });
});
