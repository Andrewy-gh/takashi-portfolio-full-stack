import crypto from 'crypto';
import { test, expect } from '@playwright/test';

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

test.describe('Cloudinary webhook round-trip', () => {
  test.skip(missingEnv, 'Missing admin credentials or API_SECRET');

  test('webhook inserts image and shows in dashboard', async ({
    page,
    request,
  }) => {
    const now = Date.now();
    const title = `E2E ${now}`;
    const publicId = `e2e/${now}-${Math.random().toString(16).slice(2)}`;
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

    const webhookRes = await request.post(
      `${apiBaseUrl}/api/cloudinary/webhook`,
      {
        data: rawBody,
        headers: {
          'content-type': 'application/json',
          'x-cld-signature': signature,
          'x-cld-timestamp': timestamp,
        },
      }
    );

    expect(webhookRes.ok()).toBeTruthy();

    await page.goto('/sign-in');
    await page.getByLabel('Email').fill(adminEmail!);
    await page.getByLabel('Password').fill(adminPassword!);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.goto('/images');
    await page.getByPlaceholder('Search').fill(title);
    await page.waitForTimeout(1100);

    await expect(page.getByRole('img', { name: title })).toBeVisible();
  });
});
