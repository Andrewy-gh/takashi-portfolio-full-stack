import { expect, type Page } from '@playwright/test';

export const adminEmail =
  process.env.E2E_ADMIN_EMAIL ??
  process.env.AUTH_EMAIL ??
  process.env.DASHBOARD_EMAIL;
export const adminPassword =
  process.env.E2E_ADMIN_PASSWORD ??
  process.env.AUTH_PASSWORD ??
  process.env.DASHBOARD_PASSWORD;
export const apiBaseUrl = process.env.E2E_API_BASE_URL ?? 'http://localhost:3000';
export const apiSecret = process.env.API_SECRET ?? process.env.CLOUDINARY_API_SECRET;

export const adminCredentialsMissing = !adminEmail || !adminPassword;

export const signInAsAdmin = async (page: Page) => {
  if (!adminEmail || !adminPassword) {
    throw new Error(
      'Missing admin credentials: set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD'
    );
  }

  await page.goto('/sign-in');
  await page.getByLabel('Email').fill(adminEmail);
  await page.getByLabel('Password').fill(adminPassword);
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).not.toHaveURL(/\/sign-in$/);
};
