import { expect, test, type Page } from '@playwright/test';

import { mockApi } from './mockApi';

const usedNotice = 'This link has already been used or has expired. Ask for a new one.';

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

async function setPassword(page: Page, button: string, password = 'a-brand-new-password') {
  await page.getByLabel('New password').fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: button }).click();
}

async function expectBouncedToSignIn(page: Page) {
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole('status')).toHaveText(usedNotice);
  await expect(page.getByLabel('New password')).toHaveCount(0);
}

test('a used invite link sends the user to sign in instead of the password form', async ({
  page,
}) => {
  await page.goto('/invite/invite-token');
  await setPassword(page, 'Set password');
  await expect(page.getByText('Your password is set')).toBeVisible();

  await page.goto('/invite/invite-token');
  await expectBouncedToSignIn(page);
});

test('an unknown or reset link opened as invite is refused', async ({ page }) => {
  await page.goto('/invite/made-up-token');
  await expectBouncedToSignIn(page);

  await page.goto('/invite/reset-token');
  await expectBouncedToSignIn(page);
});

test('a used reset link sends the user to sign in', async ({ page }) => {
  await page.goto('/reset/reset-token');
  await setPassword(page, 'Reset password');
  await expect(page.getByText('Your password has been reset')).toBeVisible();

  await page.goto('/reset/reset-token');
  await expectBouncedToSignIn(page);
  await page.goto('/reset/invite-token');
  await expectBouncedToSignIn(page);
});

test('a signed-in user opening a used link lands on the home page', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Username').fill('learner');
  await page.getByLabel('Password').fill('learner-password-123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('button', { name: /Start practice/ })).toBeVisible();

  await page.goto('/invite/made-up-token');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name: /Start practice/ })).toBeVisible();
  await expect(page.getByLabel('New password')).toHaveCount(0);
});

test('a failed link check shows the error, not the form', async ({ page }) => {
  await page.route('**/api/auth/check-invite', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ statusCode: 500, error: 'Error', message: 'Something broke' }),
    }),
  );
  await page.goto('/invite/invite-token');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByLabel('New password')).toHaveCount(0);
});
