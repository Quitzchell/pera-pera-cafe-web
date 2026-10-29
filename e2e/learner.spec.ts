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
  await page.getByLabel('Email').fill('newbie@example.com');
  await page.getByLabel('Password').fill('a-brand-new-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('button', { name: /Standard round/ }).click();
  await expect(page.getByRole('heading', { name: 'te-form (て形)' })).toBeVisible();

  const answer = page.getByLabel(/your answer/i);
  await expect(answer).toBeFocused();
  await answer.fill('およいで');
  await answer.press('Enter');
  await expect(page.getByText(/Correct$/)).toBeVisible();
  await expect(page.getByText('1 / 2')).toBeVisible();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { name: 'past (た形)' })).toBeVisible();
  await page.getByLabel(/your answer/i).fill('およんだ');
  await page.getByRole('button', { name: 'Check' }).click();
  await expect(page.getByText('Not quite')).toBeVisible();
  await page.getByRole('button', { name: 'See results' }).click();

  await expect(page.getByRole('heading', { name: '1 / 2' })).toBeVisible();
  await expect(page.getByText('およんだ')).toBeVisible();
  await expect(page.getByText('ぐ → いだ (泳ぐ → 泳いだ)')).toBeVisible();

  await page.getByRole('link', { name: 'Progress' }).first().click();
  await expect(page.getByRole('heading', { name: 'Progress' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'te-form (て形)' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Export CSV' })).toHaveAttribute(
    'href',
    '/api/progress/export?format=csv',
  );
});

test('leaving mid-round asks for confirmation', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('learner@example.com');
  await page.getByLabel('Password').fill('learner-password-123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: /Standard round/ }).click();
  await expect(page.getByRole('heading', { name: 'te-form (て形)' })).toBeVisible();

  await page.getByRole('link', { name: 'Quit' }).click();
  const dialog = page.getByRole('dialog', { name: 'Leave this round?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Keep practising' }).click();
  await expect(page.getByRole('heading', { name: 'te-form (て形)' })).toBeVisible();

  await page.getByRole('link', { name: 'Quit' }).click();
  await page.getByRole('button', { name: 'Leave round' }).click();
  await expect(page.getByRole('button', { name: /Standard round/ })).toBeVisible();
});

test('a learner cannot open admin routes', async ({ page }) => {
  await page.goto('/admin/users');
  await page.getByLabel('Email').fill('learner@example.com');
  await page.getByLabel('Password').fill('learner-password-123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/admin\/users$/);
  await expect(page.getByRole('heading', { name: 'Not allowed' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Users' })).toHaveCount(0);

  await page.goto('/admin/verbs');
  await expect(page.getByRole('heading', { name: 'Not allowed' })).toBeVisible();
});
