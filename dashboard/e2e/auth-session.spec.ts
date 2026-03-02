import { expect, test } from '@playwright/test';
import { adminCredentialsMissing, signInAsAdmin } from './helpers/auth';

test.describe('Auth session guard', () => {
  test.skip(adminCredentialsMissing, 'Missing admin credentials');

  test('redirects to /sign-in after session becomes invalid', async ({
    context,
    page,
  }) => {
    await signInAsAdmin(page);
    await page.goto('/images');
    await expect(page).not.toHaveURL(/\/sign-in$/);

    await context.clearCookies();

    await page.goto('/categories');
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});
