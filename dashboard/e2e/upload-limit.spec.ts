import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const adminEmail =
  process.env.AUTH_EMAIL ??
  process.env.DASHBOARD_EMAIL ??
  process.env.E2E_ADMIN_EMAIL;
const adminPassword =
  process.env.AUTH_PASSWORD ??
  process.env.DASHBOARD_PASSWORD ??
  process.env.E2E_ADMIN_PASSWORD;

const missingEnv = !adminEmail || !adminPassword;

const signIn = async (page: Page) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(adminEmail!);
  await page.getByLabel('Password').fill(adminPassword!);
  await page.getByRole('button', { name: 'Sign in' }).click();
};

test.describe('Upload limit', () => {
  test.skip(missingEnv, 'Missing admin credentials');

  test('caps selected files at 10', async ({ page }) => {
    await signIn(page);
    await page.goto('/images/upload');

    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a9QAAAAASUVORK5CYII=',
      'base64'
    );

    const files = Array.from({ length: 11 }, (_, index) => ({
      name: `upload-limit-${index}.png`,
      mimeType: 'image/png',
      buffer: png,
    }));

    await page.locator('input[type="file"]').first().setInputFiles(files);

    await expect(
      page.getByRole('button', { name: /10 files chosen/i })
    ).toBeVisible();
  });
});
