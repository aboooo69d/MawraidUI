// ═══════════ اختبارات عقد (Contract) لوحدة stock API — مع mock على fetch ═══════════
// تتحقق من المسارات والطرق والحمولات وسلوك الغلاف والترقيم — دون اتصال بالخادم.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { stockApi } from '../modules/stock.api'

const jsonResponse = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const ok = (data, meta) => jsonResponse(meta ? { success: true, data, meta } : { success: true, data })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('stockApi — مسارات وطرق الطلب', () => {
  it('getMyStock → GET /api/v1/user/me/stock مع بيانات الجلسة', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 's1', available: 0 }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await stockApi.getMyStock()

    expect(res).toEqual({ id: 's1', available: 0 })
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/user/me/stock')
    expect(opts.method).toBe('GET')
    expect(opts.credentials).toBe('include')
    expect(url).not.toContain('/api/v1/api/v1') // لا تكرار للبادئة
  })

  it('getStockTypes → GET /api/v1/stocks/types', async () => {
    const fetchMock = vi.fn(async () => ok([{ id: 1, name: 'مواد غذائية' }]))
    vi.stubGlobal('fetch', fetchMock)

    const res = await stockApi.getStockTypes()

    expect(res).toHaveLength(1)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/stocks/types')
  })

  it('createStock → POST /api/v1/stocks مع الحمول الموثّق', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 's1', available: 0 }))
    vi.stubGlobal('fetch', fetchMock)

    const payload = {
      stock_type_id: 1,
      units: [
        { name: 'حبة', rate: 1, is_main: true },
        { name: 'كرتون', rate: 12, is_main: false },
      ],
    }
    await stockApi.createStock(payload)

    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/stocks')
    expect(opts.method).toBe('POST')
    expect(opts.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(opts.body)).toEqual(payload)
  })

  it('getStockById → GET /api/v1/stocks/:stock_id', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 'abc' }))
    vi.stubGlobal('fetch', fetchMock)

    await stockApi.getStockById('abc')

    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/stocks/abc')
  })

  it('createStockTransaction → POST /api/v1/stocks/:id/transactions', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 't1' }))
    vi.stubGlobal('fetch', fetchMock)

    const payload = { amount: 5, unit_id: 11, is_in: true, description: 'توريد 5 كراتين' }
    await stockApi.createStockTransaction('abc', payload)

    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/stocks/abc/transactions')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual(payload)
  })

  it('addStockUnit → POST /api/v1/stocks/:id/units (وحدة فرعية)', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 12 }))
    vi.stubGlobal('fetch', fetchMock)

    await stockApi.addStockUnit('abc', { name: 'طرد', rate: 24, is_main: false })

    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/stocks/abc/units')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ name: 'طرد', rate: 24, is_main: false })
  })

  it('updateStockUnit → PATCH /api/v1/stocks/:id/units/:unit_id', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 11 }))
    vi.stubGlobal('fetch', fetchMock)

    await stockApi.updateStockUnit('abc', 11, { name: 'كرتون كبير', rate: 15 })

    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/stocks/abc/units/11')
    expect(opts.method).toBe('PATCH')
    expect(JSON.parse(opts.body)).toEqual({ name: 'كرتون كبير', rate: 15 })
  })
})

describe('stockApi — سجل الحركات والترقيم', () => {
  it('يمرّر page وpage_size وis_in ويُرجع { data, meta }', async () => {
    const fetchMock = vi.fn(async () =>
      ok([{ id: 't1' }], { page: 2, per_page: 20, total: 45, total_pages: 3 })
    )
    vi.stubGlobal('fetch', fetchMock)

    const res = await stockApi.getStockTransactions('abc', { page: 2, page_size: 20, is_in: true })

    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/stocks/abc/transactions?page=2&page_size=20&is_in=true')
    expect(res.data).toHaveLength(1)
    expect(res.meta).toEqual({ page: 2, per_page: 20, total: 45, total_pages: 3 })
  })

  it('يمرّر is_in=false للمنصرف فقط', async () => {
    const fetchMock = vi.fn(async () => ok([], { page: 1, per_page: 20, total: 0, total_pages: 0 }))
    vi.stubGlobal('fetch', fetchMock)

    await stockApi.getStockTransactions('abc', { is_in: false })

    expect(fetchMock.mock.calls[0][0]).toContain('is_in=false')
  })

  it('يتجاهل is_in عند عرض الكل (الافتراضي صفحة 1 و20)', async () => {
    const fetchMock = vi.fn(async () => ok([], { page: 1, per_page: 20, total: 0, total_pages: 0 }))
    vi.stubGlobal('fetch', fetchMock)

    await stockApi.getStockTransactions('abc', {})

    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/stocks/abc/transactions?page=1&page_size=20')
    expect(fetchMock.mock.calls[0][0]).not.toContain('is_in')
  })
})

describe('stockApi — أغلفة الأخطاء', () => {
  it('يرمي ApiError بحالة وكود التطبيق عند الفشل', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ success: false, error: { status: 404, code: 1600, message: 'stock not found' } }, 404)
      )
    )

    await expect(stockApi.getMyStock()).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 1600,
      message: 'stock not found',
    })
  })

  it('يرمي ApiError بcode 1611 عند تعارض إنشاء مخزون موجود', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ success: false, error: { status: 409, code: 1611, message: 'stock already exists' } }, 409)
      )
    )

    await expect(
      stockApi.createStock({ stock_type_id: 1, units: [{ name: 'حبة', rate: 1, is_main: true }] })
    ).rejects.toMatchObject({ status: 409, code: 1611 })
  })

  it('يرمي ApiError بcode 1602 عند نفاد الرصيد', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ success: false, error: { status: 409, code: 1602, message: 'insufficient stock' } }, 409)
      )
    )

    await expect(
      stockApi.createStockTransaction('abc', { amount: 100, unit_id: 10, is_in: false })
    ).rejects.toMatchObject({ status: 409, code: 1602 })
  })
})
