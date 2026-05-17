import { expect, test } from '@playwright/test'

test('opens and drives the full-screen RelativityStream POV view', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  await page.goto('/')

  await expect(page).toHaveTitle('RelativityStream')
  await expect(
    page.getByRole('heading', { name: 'RelativityStream' }),
  ).toBeVisible()
  await expect(page.getByRole('region', { name: 'Earth POV', exact: true })).toBeVisible()
  await expect(page.getByLabel('Traveler POV picture in picture')).toBeVisible()
  await expect(page.getByLabel('Signal propagation view')).toBeVisible()
  await expect(page.getByText('later')).toBeVisible()
  await expect(page.getByText('farther from Earth')).toBeVisible()
  await expect(page.getByText('0.0 y / 222.2 y')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  await expect(page.getByRole('button', { name: '1x' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )

  const mainCanvas = page.getByLabel('Earth 3D tree aged to 0.0 y').locator('canvas')
  const pipCanvas = page.getByLabel('Traveler 3D tree aged to 0.0 y').locator('canvas')
  await expect(mainCanvas).toBeVisible()
  await expect(pipCanvas).toBeVisible()

  await page.getByRole('slider', { name: 'Timeline' }).fill('6')
  await expect(page.getByText('6.0 y / 222.2 y')).toBeVisible()
  await expect(page.getByText(/Received ship 1.4 y at 2.84 ly/)).toBeVisible()
  await page.getByRole('slider', { name: 'Timeline' }).fill('111.2')
  await expect(page.getByText('turnaround signal')).toBeVisible()
  await page.getByRole('slider', { name: 'Timeline' }).fill('6')

  await page.getByRole('button', { name: '1x' }).click()
  await page.getByRole('button', { name: '2x' }).click()
  await expect(page.getByRole('button', { name: '2x' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )

  await page.getByRole('button', { name: '0.90 c' }).click()
  await page.getByRole('slider', { name: 'Velocity' }).fill('0.85')
  await expect(page.getByRole('button', { name: '0.85 c' })).toBeVisible()
  await expect(page.getByText('6.4 y / 235.3 y')).toBeVisible()

  await page.getByRole('button', { name: '100.0 ly' }).click()
  await page.getByRole('spinbutton', { name: 'Turnaround distance value' }).fill('10')
  await page.getByRole('spinbutton', { name: 'Turnaround distance value' }).press('Enter')
  await expect(page.getByRole('button', { name: '10.0 ly' })).toBeVisible()

  const pip = page.getByLabel('Traveler POV picture in picture')
  const pipStartBox = await pip.boundingBox()
  expect(pipStartBox).not.toBeNull()
  if (!pipStartBox) {
    throw new Error('Missing PIP bounding box')
  }
  await page.mouse.move(pipStartBox.x + 30, pipStartBox.y + 30)
  await page.mouse.down()
  await page.mouse.move(pipStartBox.x + 70, pipStartBox.y + 52)
  await page.mouse.up()
  await expect(page.getByRole('region', { name: 'Earth POV', exact: true })).toBeVisible()

  const pipMovedBox = await pip.boundingBox()
  expect(pipMovedBox).not.toBeNull()
  if (!pipMovedBox) {
    throw new Error('Missing moved PIP bounding box')
  }
  expect(pipMovedBox.x).toBeGreaterThan(pipStartBox.x + 10)

  await page.mouse.move(pipMovedBox.x + pipMovedBox.width - 4, pipMovedBox.y + pipMovedBox.height - 4)
  await page.mouse.down()
  await page.mouse.move(pipMovedBox.x + pipMovedBox.width + 45, pipMovedBox.y + pipMovedBox.height + 30)
  await page.mouse.up()
  const pipResizedBox = await pip.boundingBox()
  expect(pipResizedBox).not.toBeNull()
  if (!pipResizedBox) {
    throw new Error('Missing resized PIP bounding box')
  }
  expect(pipResizedBox.width).toBeGreaterThan(pipMovedBox.width + 20)

  await pip.click()
  await expect(page.getByRole('region', { name: 'Traveler POV', exact: true })).toBeVisible()
  await expect(page.getByLabel('Earth POV picture in picture')).toBeVisible()
  await expect(page.getByText(/Received Earth stream from/)).toBeVisible()

  await page.getByRole('button', { name: 'Reset' }).click()
  await expect(page.getByText('0.0 y / 23.5 y')).toBeVisible()

  expect(consoleErrors).toEqual([])
})

test('keeps the signal overlay ship marker aligned for low-speed short-distance scenarios', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  await page.goto('/')

  await page.getByRole('button', { name: '0.90 c' }).click()
  await page.getByRole('spinbutton', { name: 'Velocity value' }).fill('0.01')
  await page.getByRole('spinbutton', { name: 'Velocity value' }).press('Enter')
  await page.getByRole('button', { name: '100.0 ly' }).click()
  await page.getByRole('spinbutton', { name: 'Turnaround distance value' }).fill('0.5')
  await page.getByRole('spinbutton', { name: 'Turnaround distance value' }).press('Enter')
  await page.getByRole('slider', { name: 'Timeline' }).fill('50')

  await expect(page.getByText('50.0 y / 100.0 y')).toBeVisible()
  const lowSpeedOverlay = await page.locator('.signal-overlay').evaluate((overlay) => {
    const ship = overlay.querySelector('.overlay-ship')
    const turn = Array.from(overlay.querySelectorAll('text')).find((node) => node.textContent === 'turn')

    return {
      shipCx: Number(ship?.getAttribute('cx')),
      turnX: Number(turn?.getAttribute('x')),
    }
  })
  expect(lowSpeedOverlay.shipCx).toBeCloseTo(lowSpeedOverlay.turnX + 70)
  expect(consoleErrors).toEqual([])
})
