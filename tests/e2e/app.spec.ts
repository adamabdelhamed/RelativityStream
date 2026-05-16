import { expect, test } from '@playwright/test'

test('opens the RelativityStream skeleton', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('RelativityStream')
  await expect(
    page.getByRole('heading', { name: 'RelativityStream' }),
  ).toBeVisible()
  await expect(page.getByText('Earth view')).toBeVisible()
  await expect(page.getByText('Astronaut view')).toBeVisible()
  await expect(page.getByText('Signal propagation')).toBeVisible()

  await page.getByRole('button', { name: 'Play' }).click()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()

  await page.getByRole('button', { name: 'Faster' }).click()
  await expect(page.getByText('0.85 c')).toBeVisible()
})
