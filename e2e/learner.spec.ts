import { expect, test } from '@playwright/test';

import { mockApi } from './mockApi';

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('accept invite, sign in, finish a round and see progress', async ({ page }) => {
  await page.goto('/invite/invite-token');
  await page.getByLabel('New password').fill('a-brand-new-password');
  await page.getByLabel('Confirm password').fill('a-brand-new-password');
  await page.getByRole('button', { name: 'Set password' }).click();

  await expect(page.getByText('Your password is set')).toBeVisible();
  await page.getByLabel('Username').fill('newbie');
  await page.getByLabel('Password').fill('a-brand-new-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('button', { name: /Start practice/ }).click();
  await expect(page.getByRole('heading', { name: 'te-form (て形)' })).toBeVisible();

  const answer = page.getByRole('textbox');
  await expect(answer).toBeFocused();
  await answer.fill('およいで');
  await answer.press('Enter');
  await expect(page.getByText(/Correct$/)).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'casual past (た形)' })).toBeVisible();
  await page.getByRole('textbox').fill('およんだ');
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByText('Not quite')).toBeVisible();
  // Continuing is briefly locked after a mistake; then the missed card comes back.
  await page.waitForTimeout(700);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Try again')).toBeVisible();
  await page.getByRole('textbox').fill('およいだ');
  await page.getByRole('textbox').press('Enter');
  await expect(page.getByText(/Correct$/)).toBeVisible();
  await page.getByRole('button', { name: 'See results' }).click();

  await expect(page.getByRole('heading', { name: '1 / 2' })).toBeVisible();
  await expect(page.getByText('およんだ')).toBeVisible();
  await expect(page.getByText('ぐ → いだ (泳ぐ → 泳いだ)')).toBeVisible();

  await page.getByRole('link', { name: 'Progress' }).first().click();
  await expect(page.getByRole('heading', { name: 'Progress' })).toBeVisible();
  await expect(page.getByText('te-form (て形)').filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Progress CSV' })).toHaveAttribute(
    'href',
    '/api/progress/export?format=csv',
  );
  await expect(page.getByRole('link', { name: 'Mistakes CSV' })).toHaveAttribute(
    'href',
    '/api/progress/export/mistakes',
  );
});

test('leaving mid-round asks for confirmation', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Username').fill('learner');
  await page.getByLabel('Password').fill('learner-password-123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: /Start practice/ }).click();
  await expect(page.getByRole('heading', { name: 'te-form (て形)' })).toBeVisible();

  await page.getByRole('link', { name: 'Quit' }).click();
  const dialog = page.getByRole('dialog', { name: 'Leave this round?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Keep practising' }).click();
  await expect(page.getByRole('heading', { name: 'te-form (て形)' })).toBeVisible();

  await page.getByRole('link', { name: 'Quit' }).click();
  await page.getByRole('button', { name: 'Leave round' }).click();
  await expect(page.getByRole('button', { name: /Start practice/ })).toBeVisible();
});

test('a learner cannot open admin routes', async ({ page }) => {
  await page.goto('/admin/users');
  await page.getByLabel('Username').fill('learner');
  await page.getByLabel('Password').fill('learner-password-123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/admin\/users$/);
  await expect(page.getByRole('heading', { name: 'Not allowed' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);

  await page.goto('/admin/verbs');
  await expect(page.getByRole('heading', { name: 'Not allowed' })).toBeVisible();
});
