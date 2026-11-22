import { expect, test } from '@playwright/test'

// Auth and API responses are fixtures. Real Leaflet runs from the production bundle.
// Deterministic tiles avoid external-service dependencies and OSM traffic in tests.
async function openStationForm(page) {
  const posts = []
  const errors = []
  page.on('pageerror', (err) => errors.push(err.message))
  await page.addInitScript(() => {
    window.__gpsCalls = 0
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
      getCurrentPosition: (_success, error) => { window.__gpsCalls += 1; error({ code: 1 }) },
    } })
    window.turnstile = {
      render: (_element, options) => { queueMicrotask(() => options.callback('test-token')); return 'test-widget' },
      remove: () => {}, reset: () => {},
    }
  })
  await page.route('https://challenges.cloudflare.com/**', (route) => route.fulfill({ body: '', contentType: 'application/javascript' }))
  await page.route('https://tile.openstreetmap.org/**', (route) => route.fulfill({
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#e6eddf"/><path d="M0 128H256M128 0V256" stroke="#fff" stroke-width="12"/></svg>',
  }))
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    let data = {}
    if (path === '/api/v1/auth/login') data = { id: 'provider', name: 'محطة اختبار', phone: '770000001', role_name: 'provider' }
    else if (path === '/api/v1/stocks/types') data = [{ id: 1, name: 'غاز منزلي', slug: 'gaz' }]
    else if (path === '/api/v1/stocks' && request.method() === 'POST') {
      posts.push(request.postDataJSON())
      data = { id: 'station-test' }
    } else if (path === '/api/v1/stocks') data = []
    await route.fulfill({ json: { success: true, data } })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).last().click()
  await page.getByLabel('رقم الجوال المسجل', { exact: false }).fill('770000001')
  await page.locator('#password').fill('test-password-only')
  await page.getByRole('button', { name: 'تسجيل الدخول للمنصة', exact: true }).click()
  await page.getByRole('button', { name: 'إضافة مخزون جديد', exact: true }).click()
  await page.getByRole('button', { name: 'اختيار مركز الخريطة', exact: true }).waitFor()
  await page.getByLabel('نوع المخزون', { exact: false }).selectOption('1')
  await page.getByLabel('نوع مخزون الغاز', { exact: false }).selectOption('exchange')
  await page.locator('#stock-address').fill('تعز - شارع جمال بجانب جولة المسبح')
  await page.getByPlaceholder('مثال: حبة').fill('اسطوانة')
  return { posts, errors }
}

for (const width of [320, 375, 390, 430, 768, 1280]) {
  test(`selects, drags, confirms and saves station coordinates at ${width}px RTL`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    const { posts, errors } = await openStationForm(page)
    expect(await page.evaluate(() => window.__gpsCalls)).toBe(0)
    await expect(page.locator('#stock-lat')).toHaveAttribute('readonly', '')
    await expect(page.locator('#stock-lng')).toHaveAttribute('readonly', '')
    const map = page.getByRole('region', { name: 'خريطة اختيار موقع المحطة', exact: true })
    await map.scrollIntoViewIfNeeded()
    await map.tap({ position: { x: 120, y: 120 } })
    await expect(page.locator('#stock-lat')).not.toHaveValue('')
    const marker = page.locator('.leaflet-marker-icon')
    await expect(marker).toBeVisible()
    await marker.click({ trial: true }) // Wait for Leaflet's pan animation to finish.
    const before = await page.locator('#stock-lng').inputValue()
    const bounds = await marker.boundingBox()
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    await page.mouse.down()
    await page.mouse.move(bounds.x + bounds.width / 2 + 35, bounds.y + bounds.height / 2 + 30, { steps: 8 })
    await page.mouse.up()
    await expect(page.locator('#stock-lng')).not.toHaveValue(before)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const section = page.getByRole('region', { name: 'موقع المحطة الفعلي', exact: true })
    await expect(section).toHaveAttribute('dir', 'rtl')
    await section.screenshot({ path: testInfo.outputPath(`station-${width}.png`) })

    await page.getByRole('button', { name: 'إنشاء المخزون', exact: true }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'يرجى تأكيد موقع المحطة' })).toBeVisible()
    expect(posts).toHaveLength(0)
    await page.getByRole('button', { name: 'تأكيد موقع المحطة', exact: true }).click()
    const lat = Number(await page.locator('#stock-lat').inputValue())
    const lng = Number(await page.locator('#stock-lng').inputValue())
    await page.getByRole('button', { name: 'إنشاء المخزون', exact: true }).click()
    await expect.poll(() => posts.length).toBe(1)
    expect(posts[0].location).toEqual({ lat, lng })
    expect(errors).toEqual([])
  })
}

test('GPS denial permits a keyboard-selected map correction and confirmation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const { errors } = await openStationForm(page)
  await page.getByRole('button', { name: 'تحديد موقعي الحالي (GPS)', exact: true }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'تم رفض إذن' })).toBeVisible()
  expect(await page.evaluate(() => window.__gpsCalls)).toBe(1)
  const map = page.getByRole('region', { name: 'خريطة اختيار موقع المحطة', exact: true })
  await map.focus()
  await page.keyboard.press('ArrowRight')
  await page.getByRole('button', { name: 'اختيار مركز الخريطة', exact: true }).click()
  await expect(page.locator('#stock-lat')).not.toHaveValue('')
  await expect(page.getByRole('alert').filter({ hasText: 'تم رفض إذن' })).toHaveCount(0)
  await page.getByRole('button', { name: 'تأكيد موقع المحطة', exact: true }).click()
  await expect(page.getByText('تم تأكيد موقع المحطة. سيُحفظ عند إرسال النموذج.')).toBeVisible()
  expect(errors).toEqual([])
})
