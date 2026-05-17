import { expect, test } from '@playwright/test'

test('opens and drives the visual RelativityStream model view', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('RelativityStream')
  await expect(
    page.getByRole('heading', { name: 'RelativityStream' }),
  ).toBeVisible()
  await expect(page.getByLabel('Earth view')).toBeVisible()
  await expect(page.getByLabel('Traveler view')).toBeVisible()
  await expect(page.getByLabel('Signal propagation view')).toBeVisible()
  await expect(page.getByLabel('How to read signal propagation')).toBeVisible()
  await expect(page.getByText('later')).toBeVisible()
  await expect(page.getByText('farther from Earth')).toBeVisible()
  await expect(page.getByText('0.0 y / 12.0 y')).toBeVisible()
  await expect(page.getByText('Traveler reunion')).toBeVisible()
  await expect(page.getByText('7.2 y')).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Turnaround distance' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Earth POV' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByRole('button', { name: '1x' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await page.getByRole('slider', { name: 'Timeline' }).fill('12')
  await page.getByRole('button', { name: 'Play' }).click()
  await expect(page.getByText('0.0 y / 12.0 y')).toBeVisible()
  await page.getByRole('button', { name: 'Pause' }).click()

  await page.getByRole('button', { name: 'Play' }).click()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  await page.getByRole('button', { name: '2x' }).click()
  await expect(page.getByRole('button', { name: '2x' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await page.getByRole('slider', { name: 'Timeline' }).fill('6')
  await page.getByRole('slider', { name: 'Velocity' }).fill('0.85')
  await expect(page.getByText('0.85 c')).toBeVisible()
  await expect(page.getByText('5.6 y / 11.3 y')).toBeVisible()

  await page.getByRole('button', { name: 'Reset' }).click()
  await expect(page.getByText('0.85 c')).toBeVisible()
  await expect(page.getByText('4.8 ly')).toBeVisible()
  await expect(page.getByText('0.0 y / 11.3 y')).toBeVisible()

  await page.getByRole('slider', { name: 'Timeline' }).fill('5.6')
  await page.getByRole('button', { name: 'Traveler POV' }).click()
  await expect(page.getByText('Received Earth stream from 0.8 y')).toBeVisible()
  await expect(page.getByText('Ship clock 2.9 y')).toBeVisible()
})
