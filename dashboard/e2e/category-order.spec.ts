import crypto from 'crypto';
import { expect, test } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';

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

const missingLoginEnv = !adminEmail || !adminPassword;
const missingWebhookEnv = missingLoginEnv || !apiSecret;

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

const createCategory = async (
  request: APIRequestContext,
  token: string,
  name: string
) => {
  const res = await request.post(`${apiBaseUrl}/api/categories`, {
    data: { name, description: `E2E seed for ${name}` },
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  expect(res.ok()).toBeTruthy();
  return await res.json();
};

const fetchCategoryTable = async (
  request: APIRequestContext
) => {
  const res = await request.get(`${apiBaseUrl}/api/categories/table`);
  expect(res.ok()).toBeTruthy();
  return await res.json();
};

const fetchHomeCategoryId = async (
  request: APIRequestContext
) => {
  const res = await request.get(`${apiBaseUrl}/api/categories`);
  expect(res.ok()).toBeTruthy();
  const categories = (await res.json()) as Array<{
    id: string;
    slug: string;
  }>;
  const home = categories.find((category) => category.slug === 'home');
  if (!home) {
    throw new Error('Home category not found');
  }
  return home.id;
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

const fetchCategoryDetail = async (
  request: APIRequestContext,
  categoryId: string
) => {
  const res = await request.get(
    `${apiBaseUrl}/api/categories/${categoryId}`
  );
  expect(res.ok()).toBeTruthy();
  return await res.json();
};

test.describe('Category ordering', () => {
  test.skip(missingLoginEnv, 'Missing admin credentials');

  test('can reorder categories and save', async ({ page, request }) => {
    const now = Date.now();
    const token = await getAdminToken(request);
    const categoryA = await createCategory(
      request,
      token,
      `E2E Order ${now} A`
    );
    const categoryB = await createCategory(
      request,
      token,
      `E2E Order ${now} B`
    );

    await signIn(page);
    await page.goto('/categories/order');

    const rowA = page.getByRole('row', { name: new RegExp(categoryA.name) });
    const rowB = page.getByRole('row', { name: new RegExp(categoryB.name) });
    await expect(rowA).toBeVisible();
    await expect(rowB).toBeVisible();

    await rowA.getByRole('button').click();
    await rowB.getByRole('button').click();

    await expect(rowA.locator('td').nth(4)).not.toHaveText('');
    await expect(rowB.locator('td').nth(4)).not.toHaveText('');

    const dragHandle = rowB.locator('button').first();
    await dragHandle.dragTo(rowA);

    await page.getByRole('button', { name: 'Save' }).click();

    await expect
      .poll(async () => {
        const table = (await fetchCategoryTable(request)) as Array<{
          id: string;
          sequence: number | null;
        }>;
        const rowAfterA = table.find((row) => row.id === categoryA.id);
        const rowAfterB = table.find((row) => row.id === categoryB.id);
        if (!rowAfterA || !rowAfterB) return false;
        if (rowAfterA.sequence === null || rowAfterB.sequence === null) {
          return false;
        }
        return rowAfterB.sequence < rowAfterA.sequence;
      })
      .toBe(true);

    const table = (await fetchCategoryTable(request)) as Array<{
      id: string;
      sequence: number | null;
    }>;
    const rowAfterA = table.find((row) => row.id === categoryA.id);
    const rowAfterB = table.find((row) => row.id === categoryB.id);
    if (!rowAfterA || !rowAfterB) {
      throw new Error('Category rows not found in table response');
    }
    if (rowAfterA.sequence === null || rowAfterB.sequence === null) {
      throw new Error('Category sequences not persisted');
    }
    expect(rowAfterB.sequence).toBeLessThan(rowAfterA.sequence);
  });
});

test.describe('Image ordering', () => {
  test.skip(missingWebhookEnv, 'Missing admin credentials or API_SECRET');

  test('saves custom image order for home category', async ({
    page,
    request,
  }) => {
    const now = Date.now();
    const titleA = `E2E Image ${now} A`;
    const titleB = `E2E Image ${now} B`;
    await sendWebhookImage(request, {
      publicId: `e2e/${now}-a`,
      title: titleA,
    });
    await sendWebhookImage(request, {
      publicId: `e2e/${now}-b`,
      title: titleB,
    });

    const homeCategoryId = await fetchHomeCategoryId(request);

    await signIn(page);
    await page.goto(`/categories/${homeCategoryId}/project-order`);

    const rowA = page.getByRole('listitem', { name: new RegExp(titleA) });
    const rowB = page.getByRole('listitem', { name: new RegExp(titleB) });
    await expect(rowA).toBeVisible();
    await expect(rowB).toBeVisible();

    const getPosition = async (row: typeof rowA) => {
      const text = await row.getByText(/Position/).innerText();
      const match = text.match(/Position (\d+)/);
      if (!match) {
        throw new Error(`Unable to parse position from "${text}"`);
      }
      return Number(match[1]);
    };

    const posA = await getPosition(rowA);
    const posB = await getPosition(rowB);
    if (posA < posB) {
      await rowB.getByTitle('Move up').click();
    } else {
      await rowA.getByTitle('Move up').click();
    }
    const movedTitle = posA < posB ? titleB : titleA;
    const movedFromPosition = posA < posB ? posB : posA;

    await page.getByRole('button', { name: 'Save Order' }).click();

    await expect
      .poll(async () => {
        const detail = (await fetchCategoryDetail(request, homeCategoryId)) as {
          sortMode?: string | null;
        };
        return detail.sortMode;
      })
      .toBe('custom');

    await expect
      .poll(async () => {
        const detail = (await fetchCategoryDetail(request, homeCategoryId)) as {
          images?: Array<{ title?: string | null; position?: number | null }>;
        };
        const moved = detail.images?.find((img) => img.title === movedTitle);
        return moved?.position ?? null;
      })
      .toBe(movedFromPosition - 1);
  });
});

