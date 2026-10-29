import { expect, test } from '@playwright/test';

import { mockApi } from './mockApi';

test('admin creates a user and copies the invite link', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-only');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await mockApi(page);

  await page.goto('/sign-in');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin-password-123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await page.getByRole('button', { name: 'Invite learner' }).click();
  await page.getByLabel('Username').fill('Kenji');
  await page.getByLabel('Email').fill('kenji@example.com');
  await page.getByRole('button', { name: 'Create user' }).click();

  const link = page.getByRole('textbox', { name: 'Invite link for kenji' });
  await expect(link).toHaveValue(/\/invite\/token-/);
  await expect(page.getByText(/^Expires /)).toBeVisible();
  await expect(page.getByText('kenji@example.com')).toBeVisible();

  await page.getByRole('button', { name: 'Copy' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(await link.inputValue());
});
