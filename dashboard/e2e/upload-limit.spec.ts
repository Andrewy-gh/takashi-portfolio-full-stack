import { expect, test } from '@playwright/test';
import { adminCredentialsMissing, signInAsAdmin } from './helpers/auth';

const missingEnv = adminCredentialsMissing;

test.describe('Upload limit', () => {
  test.skip(missingEnv, 'Missing admin credentials');

  test('caps selected files at 10', async ({ page }) => {
    await signInAsAdmin(page);
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
