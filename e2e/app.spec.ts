import { expect, test } from '@playwright/test';

test('navigates between translate and history', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Linguo').first()).toBeVisible();

  await page.getByRole('link', { name: 'History' }).click();
  await expect(page.getByText('History page placeholder.')).toBeVisible();

  await page.locator('ion-back-button').click();
  await expect(page.getByText('Translate page placeholder.')).toBeVisible();
});
