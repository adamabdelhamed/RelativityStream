import { expect, test } from '@playwright/test'

test('opens and drives the full-screen RelativityStream POV view', async ({ page }) => {
  test.setTimeout(45000)
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  await page.goto('/')

  await expect(page).toHaveTitle('RelativityStream')
  await expect(page.getByText('Relativity Simulator')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Earth POV', exact: true })).toBeVisible()
  await expect(page.getByText('Traveler appears normal')).toBeVisible()
  await expect(page.getByText(/Local clock/)).toHaveCount(0)
  await expect(page.getByText(/Received ship/)).toHaveCount(0)
  await expect(page.getByLabel('Traveler POV Telescope view of traveler picture in picture')).toBeVisible()
  await expect(page.getByLabel('Signal propagation view')).toBeVisible()
  await expect(page.getByText('later')).toBeVisible()
  await expect(page.getByText('farther from Earth')).toBeVisible()
  await expect(page.getByText('0.0 y / 222.2 y')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reset' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Enter full screen' })).toBeVisible()
  await expect(page.getByRole('button', { name: '1x' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )

  const mainCanvas = page.getByLabel('Earth 3D tree aged to 0.0 y').locator('canvas')
  const pipCanvas = page.getByLabel('Traveler 3D tree aged to 0.0 y').locator('canvas')
  await expect(mainCanvas).toBeVisible()
  await expect(pipCanvas).toBeVisible()
  await expect(page.getByLabel('Traveler 3D tree aged to 0.0 y')).toHaveAttribute('data-nearby-planet', 'visible')
  await expect(page.getByLabel('Traveler 3D tree aged to 0.0 y')).toHaveAttribute('data-nearby-planet-scale', '1.000')
  await expect(page.getByLabel('Traveler 3D tree aged to 0.0 y')).toHaveAttribute('data-signal-shift', 'neutral')
  await expect(page.getByLabel('Traveler 3D tree aged to 0.0 y')).toHaveAttribute('data-star-motion', 'stopped')
  await expect(page.getByLabel('Earth 3D tree aged to 0.0 y')).toHaveAttribute('data-decay-pile-generations', '')

  await page.getByRole('slider', { name: 'Timeline' }).fill('6')
  await expect(page.getByRole('slider', { name: 'Timeline' })).toHaveValue('6')
  await expect(page.getByText('Turnaround not visible yet')).toBeVisible()
  await expect(page.getByText('Traveler appears to age slowly')).toBeVisible()
  await expect(page.getByLabel('Traveler 3D tree aged to 1.4 y')).toHaveAttribute('data-signal-shift', 'redshift')
  await expect(page.getByLabel('Traveler 3D tree aged to 1.4 y')).toHaveAttribute('data-nearby-planet', 'hidden')
  await page.getByRole('slider', { name: 'Timeline' }).fill('40')
  await expect(page.getByLabel('Traveler 3D tree aged to 9.2 y')).toHaveAttribute('data-nearby-planet', 'hidden')
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
  await expect(page.getByRole('slider', { name: 'Timeline' })).toHaveValue('6.4')

  await page.getByRole('button', { name: '100.0 ly' }).click()
  await page.getByRole('spinbutton', { name: 'Turnaround distance value' }).fill('10')
  await page.getByRole('spinbutton', { name: 'Turnaround distance value' }).press('Enter')
  await expect(page.getByRole('button', { name: '10.0 ly' })).toBeVisible()

  const pip = page.getByLabel('Traveler POV Telescope view of traveler picture in picture')
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

  const signal = page.getByLabel('Signal propagation view')
  const signalStartBox = await signal.boundingBox()
  expect(signalStartBox).not.toBeNull()
  if (!signalStartBox) {
    throw new Error('Missing signal overlay bounding box')
  }
  await page.mouse.move(signalStartBox.x + 28, signalStartBox.y + 22)
  await page.mouse.down()
  await page.mouse.move(signalStartBox.x + 78, signalStartBox.y + 47)
  await page.mouse.up()
  const signalMovedBox = await signal.boundingBox()
  expect(signalMovedBox).not.toBeNull()
  if (!signalMovedBox) {
    throw new Error('Missing moved signal overlay bounding box')
  }
  expect(signalMovedBox.x).toBeGreaterThan(signalStartBox.x + 20)

  await page.mouse.move(signalMovedBox.x + signalMovedBox.width - 4, signalMovedBox.y + signalMovedBox.height - 4)
  await page.mouse.down()
  await page.mouse.move(signalMovedBox.x + signalMovedBox.width + 48, signalMovedBox.y + signalMovedBox.height + 32)
  await page.mouse.up()
  const signalResizedBox = await signal.boundingBox()
  expect(signalResizedBox).not.toBeNull()
  if (!signalResizedBox) {
    throw new Error('Missing resized signal overlay bounding box')
  }
  expect(signalResizedBox.width).toBeGreaterThan(signalMovedBox.width + 20)

  await pip.click()
  await expect(page.getByRole('region', { name: 'Traveler POV', exact: true })).toBeVisible()
  await expect(page.getByLabel('Earth POV Telescope view of earth picture in picture')).toBeVisible()
  await expect(page.getByText(/Received Earth stream from/)).toBeVisible()

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

  await expect(page.getByRole('slider', { name: 'Timeline' })).toHaveValue('50')
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

test('continues tree generations after the visible pool is exceeded', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  await page.goto('/')

  await page.getByRole('button', { name: '100.0 ly' }).click()
  await page.getByRole('spinbutton', { name: 'Turnaround distance value' }).fill('1000')
  await page.getByRole('spinbutton', { name: 'Turnaround distance value' }).press('Enter')
  await page.getByRole('slider', { name: 'Timeline' }).fill('675')

  await expect(page.getByRole('slider', { name: 'Timeline' })).toHaveValue('675')
  const earthTree = page.getByLabel('Earth 3D tree aged to 675.0 y')
  await expect(earthTree.locator('canvas')).toBeVisible()
  await expect(earthTree).toHaveAttribute('data-visual-tree-year', '675.0')
  await expect(earthTree).toHaveAttribute('data-visible-generations', '2,3,4,5,6,7,8,9')
  await expect(earthTree).toHaveAttribute('data-decay-pile-generations', '0,1,2,3,4,5,6,7,8')
  await expect(page.getByText('NaN')).toHaveCount(0)
  expect(consoleErrors).toEqual([])
})

test('collapses secondary controls behind more menu in portrait mobile', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Timeline' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'More controls' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Telescope' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Signal' })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByLabel('Traveler POV Telescope view of traveler picture in picture')).toBeVisible()
  await expect(page.getByLabel('Signal propagation view')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '1x' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: '0.90 c' })).toHaveCount(0)

  const railLayout = await page.locator('.control-rail').evaluate((rail) => {
    const timeline = rail.querySelector('input[aria-label="Timeline"]')
    const play = rail.querySelector('.play-button')
    const more = rail.querySelector('.more-popover')
    const timelineBox = timeline?.getBoundingClientRect()
    const playBox = play?.getBoundingClientRect()
    const moreBox = more?.getBoundingClientRect()

    return {
      moreRight: moreBox?.right,
      playLeft: playBox?.left,
      timelineWidth: timelineBox?.width,
    }
  })
  expect(railLayout.timelineWidth).toBeGreaterThan(240)
  expect(railLayout.playLeft).toBeLessThan(railLayout.moreRight ?? 0)

  await page.getByRole('button', { name: 'More controls' }).click()
  await expect(page.getByText('Play speed')).toBeVisible()
  await expect(page.getByRole('button', { name: '2x' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Velocity' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Turnaround distance' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Enter full screen' })).toBeVisible()

  await page.getByRole('button', { name: '2x' }).click()
  await expect(page.getByRole('button', { name: 'More controls' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )

  await page.getByRole('button', { name: 'Signal' }).click()
  await expect(page.getByRole('button', { name: 'Signal' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByLabel('Signal propagation view')).toBeVisible()
  await expect(page.locator('.overlay-heading span', { hasText: 'signal' })).toBeVisible()
  await expect(page.getByText('drag / resize')).toHaveCount(0)

  const portraitLayout = await page.locator('.immersive-stage').evaluate((stage) => {
    const primary = stage.querySelector('.three-tree-scene')
    const secondary = stage.querySelector('.signal-overlay')
    const controls = stage.querySelector('.control-rail')
    const primaryBox = primary?.getBoundingClientRect()
    const secondaryBox = secondary?.getBoundingClientRect()
    const controlBox = controls?.getBoundingClientRect()

    return {
      controlTop: controlBox?.top,
      layoutMode: stage.getAttribute('data-layout-mode'),
      primaryHeight: primaryBox?.height,
      secondaryBottom: secondaryBox?.bottom,
      secondaryTop: secondaryBox?.top,
    }
  })
  expect(portraitLayout.layoutMode).toBe('mobile-portrait')
  expect(portraitLayout.primaryHeight).toBeGreaterThan(800)
  expect(portraitLayout.secondaryTop).toBeGreaterThan(450)
  expect(portraitLayout.secondaryBottom).toBeLessThan(portraitLayout.controlTop ?? 0)
  expect(consoleErrors).toEqual([])
})

test('places the mobile landscape secondary view on the right without resize controls', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })

  await page.setViewportSize({ width: 667, height: 375 })
  await page.goto('/')

  await expect(page.locator('.immersive-stage')).toHaveAttribute('data-layout-mode', 'mobile-landscape')
  await expect(page.getByRole('button', { name: 'Telescope' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'Signal' })).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByRole('button', { name: '1x' })).toBeVisible()
  await expect(page.getByLabel('Traveler POV Telescope view of traveler picture in picture')).toBeVisible()
  await expect(page.getByLabel('Signal propagation view')).toHaveCount(0)

  const streamLayout = await page.getByLabel('Traveler POV Telescope view of traveler picture in picture').evaluate((panel) => {
    const box = panel.getBoundingClientRect()

    return {
      height: box.height,
      left: box.left,
      right: box.right,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    }
  })
  expect(streamLayout.left).toBeGreaterThan(streamLayout.viewportWidth * 0.5)
  expect(streamLayout.right).toBeLessThanOrEqual(streamLayout.viewportWidth - 8)
  expect(streamLayout.height).toBeGreaterThan(streamLayout.viewportHeight * 0.47)
  expect(streamLayout.height).toBeLessThan(streamLayout.viewportHeight * 0.58)

  await page.getByLabel('Traveler POV Telescope view of traveler picture in picture').click()
  await expect(page.getByRole('region', { name: 'Traveler POV', exact: true })).toBeVisible()
  await expect(page.getByLabel('Earth POV Telescope view of earth picture in picture')).toBeVisible()

  await page.getByRole('button', { name: 'Signal' }).click()
  await expect(page.getByLabel('Signal propagation view')).toBeVisible()
  await expect(page.locator('.overlay-heading span', { hasText: 'signal' })).toBeVisible()
  await expect(page.locator('.signal-overlay .resize-corner')).toHaveCount(0)
  await expect(page.getByText('drag / resize')).toHaveCount(0)

  const telescopeLayout = await page.getByLabel('Signal propagation view').evaluate((panel) => {
    const box = panel.getBoundingClientRect()

    return {
      height: box.height,
      left: box.left,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    }
  })
  expect(telescopeLayout.left).toBeGreaterThan(telescopeLayout.viewportWidth * 0.5)
  expect(telescopeLayout.height).toBeGreaterThan(telescopeLayout.viewportHeight * 0.47)
  expect(telescopeLayout.height).toBeLessThan(telescopeLayout.viewportHeight * 0.58)
  expect(consoleErrors).toEqual([])
})
