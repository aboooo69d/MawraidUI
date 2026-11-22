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

describe('stockApi — مسارات وطرق الطلب (Multi-Stock)', () => {
  it('getMyStocks → GET /api/v1/stocks مع بيانات الجلسة', async () => {
    const fetchMock = vi.fn(async () => ok([{ id: 's1', available: 0 }]))
    vi.stubGlobal('fetch', fetchMock)

    const res = await stockApi.getMyStocks()

    expect(res).toEqual([{ id: 's1', available: 0 }])
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/stocks')
    expect(opts.method).toBe('GET')
    expect(opts.credentials).toBe('include')
    expect(url).not.toContain('/api/v1/api/v1')
  })

  it('getMyStocks يرجع [] عند غياب مفتاح data بسبب omitempty', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ success: true }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await stockApi.getMyStocks()
    expect(res).toEqual([])
  })

  it('getStockTypes → GET /api/v1/stocks/types ويرجع [] عند غياب data', async () => {
    const fetchMock = vi.fn(async () =>
      ok([{ id: 1, name: 'غاز منزلي', slug: 'gaz', provider_type_id: 1 }])
    )
    vi.stubGlobal('fetch', fetchMock)

    const res = await stockApi.getStockTypes()
    expect(res).toHaveLength(1)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/stocks/types')

    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true }))
    const emptyRes = await stockApi.getStockTypes()
    expect(emptyRes).toEqual([])
  })

  it('createStock → POST /api/v1/stocks بالبنية الجديدة', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 's1', available: 0 }))
    vi.stubGlobal('fetch', fetchMock)

    const payload = {
      stock_type_id: 1,
      stock_type: 'gaz',
      address: 'صنعاء - شارع الستين الشمالي بجانب جولة عمران',
      location: { lat: 15.3694, lng: 44.191 },
      units: [
        { name: 'اسطوانة', rate: 1, is_main: true },
        { name: 'شبك', rate: 10, is_main: false },
      ],
      stock_details: { gaz_stock_type: 'exchange' },
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

  it('يتعامل بأمان مع غياب data في سجل الحركات الفارغ', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ success: true, meta: { page: 1, per_page: 20, total: 0, total_pages: 0 } })
    )
    vi.stubGlobal('fetch', fetchMock)

    const res = await stockApi.getStockTransactions('abc', {})
    expect(res.data).toEqual([])
  })
})

describe('stockApi — أغلفة الأخطاء الجديدة', () => {
  it('يرمي ApiError بالاعتماد على HTTP status و error.code (بدون status داخل error)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ success: false, error: { code: 1612, message: 'stock type does not match the selected stock type' } }, 400)
      )
    )

    await expect(
      stockApi.createStock({ stock_type_id: 1, stock_type: 'wrong' })
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 1612,
      message: 'stock type does not match the selected stock type',
    })
  })

  it('يرمي ApiError بcode 1106 عند انتهاء الجلسة', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ success: false, error: { code: 1106, message: 'unauthorized access, please log in' } }, 401)
      )
    )

    await expect(stockApi.getMyStocks()).rejects.toMatchObject({ status: 401, code: 1106 })
  })

  it('يرمي ApiError بcode 1602 عند نفاد الرصيد', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ success: false, error: { code: 1602, message: 'insufficient stock' } }, 409)
      )
    )

    await expect(
      stockApi.createStockTransaction('abc', { amount: 100, unit_id: 10, is_in: false })
    ).rejects.toMatchObject({ status: 409, code: 1602 })
  })
})
