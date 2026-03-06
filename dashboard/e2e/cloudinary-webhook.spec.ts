import crypto from 'crypto';
import { test, expect } from '@playwright/test';
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

test.describe('Cloudinary webhook round-trip', () => {
  test.skip(missingEnv, 'Missing admin credentials or API_SECRET');

  test('webhook inserts image and shows in dashboard', async ({ page }) => {
    await signInAsAdmin(page);
    const authRequest = page.request;

    const artifacts = createE2eArtifacts();

    const now = Date.now();
    const title = `E2E ${now}`;
    const publicId = `e2e/${now}-${Math.random().toString(16).slice(2)}`;
    artifacts.imagePublicIds.add(publicId);

    try {
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

      const webhookRes = await authRequest.post(
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

      await page.goto('/images');
      await page.getByPlaceholder('Search').fill(title);
      await page.waitForTimeout(1100);

      await expect(page.getByRole('img', { name: title })).toBeVisible();
    } finally {
      await cleanupE2eArtifacts({
        request: authRequest,
        artifacts,
        apiBaseUrl,
      });
    }
  });
});
