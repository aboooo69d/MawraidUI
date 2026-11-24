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
  it('getMyStocks → GET /api/v1/stocks/me مع بيانات الجلسة', async () => {
    const fetchMock = vi.fn(async () => ok([{ id: 's1', available: 0 }]))
    vi.stubGlobal('fetch', fetchMock)

    const res = await stockApi.getMyStocks()

    expect(res).toEqual([{ id: 's1', available: 0 }])
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/stocks/me')
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

  it('createStock → POST /api/v1/stocks/me بالبنية الجديدة', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 's1', available: 0 }))
    vi.stubGlobal('fetch', fetchMock)

    const payload = {
      stock_type_id: 1,
      stock_type: 'gaz',
      address: 'صنعاء - شارع الستين الشمالي بجانب جولة عمران',
      location: { lat: 15.3694, lng: 44.191 },
      units: [
        { name: 'اسطوانة', rate: 1, price: 7500, is_main: true },
        { name: 'شبك', rate: 10, price: 70000, is_main: false },
      ],
      stock_details: { gaz_stock_type: 'exchange' },
    }
    await stockApi.createStock(payload)

    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/stocks/me')
    expect(opts.method).toBe('POST')
    expect(opts.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(opts.body)).toEqual(payload)
  })

  it('getStockById → GET /api/v1/stocks/me/:stock_id', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 'abc' }))
    vi.stubGlobal('fetch', fetchMock)

    await stockApi.getStockById('abc')

    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/stocks/me/abc')
  })

  it('createStockTransaction → POST /api/v1/stocks/me/:id/transactions', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 't1' }))
    vi.stubGlobal('fetch', fetchMock)

    const payload = { amount: 5, unit_id: 11, is_in: true, description: 'توريد 5 كراتين' }
    await stockApi.createStockTransaction('abc', payload)

    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/stocks/me/abc/transactions')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual(payload)
  })

  it('addStockUnit → POST /api/v1/stocks/me/:id/units (وحدة فرعية)', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 12 }))
    vi.stubGlobal('fetch', fetchMock)

    await stockApi.addStockUnit('abc', { name: 'طرد', rate: 24, price: 150000, is_main: false })

    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/stocks/me/abc/units')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ name: 'طرد', rate: 24, price: 150000, is_main: false })
  })

  it('updateStockUnit → PATCH /api/v1/stocks/me/:id/units/:unit_id', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 11 }))
    vi.stubGlobal('fetch', fetchMock)

    await stockApi.updateStockUnit('abc', 11, { name: 'كرتون كبير', rate: 15, price: 85000 })

    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/stocks/me/abc/units/11')
    expect(opts.method).toBe('PATCH')
    expect(JSON.parse(opts.body)).toEqual({ name: 'كرتون كبير', rate: 15, price: 85000 })
  })
})

describe('stockApi — سجل الحركات والترقيم', () => {
  it('يمرّر page وpage_size وis_in ويُرجع { data, meta }', async () => {
    const fetchMock = vi.fn(async () =>
      ok([{ id: 't1' }], { page: 2, per_page: 20, total: 45, total_pages: 3 })
    )
    vi.stubGlobal('fetch', fetchMock)

    const res = await stockApi.getStockTransactions('abc', { page: 2, page_size: 20, is_in: true })

    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/stocks/me/abc/transactions?page=2&page_size=20&is_in=true')
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

describe('stockApi.getStocks — استكشاف المخزون للمستفيدين', () => {
  it('يرسل جميع فلاتر البحث والموقع والترقيم ويرجع { data, meta }', async () => {
    const fetchMock = vi.fn(async () =>
      ok([{ id: 's1', available: 40 }], { page: 2, per_page: 10, total: 25, total_pages: 3 })
    )
    vi.stubGlobal('fetch', fetchMock)

    const res = await stockApi.getStocks({
      name: '  المنصور  ',
      stock_type: 'gaz',
      stock_type_id: 1,
      in_stock: true,
      lat: 13.5795,
      lng: 44.0209,
      max_distance: 5000,
      page: 2,
      page_size: 10,
    })

    const [url, opts] = fetchMock.mock.calls[0]
    expect(opts.method).toBe('GET')
    expect(opts.credentials).toBe('include')
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.pathname).toBe('/api/v1/stocks')
    expect(parsed.searchParams.get('name')).toBe('المنصور')
    expect(parsed.searchParams.get('stock_type')).toBe('gaz')
    expect(parsed.searchParams.get('stock_type_id')).toBe('1')
    expect(parsed.searchParams.get('in_stock')).toBe('true')
    expect(parsed.searchParams.get('lat')).toBe('13.5795')
    expect(parsed.searchParams.get('lng')).toBe('44.0209')
    expect(parsed.searchParams.get('max_distance')).toBe('5000')
    expect(parsed.searchParams.get('page')).toBe('2')
    expect(parsed.searchParams.get('page_size')).toBe('10')
    expect(res.data).toHaveLength(1)
    expect(res.meta).toEqual({ page: 2, per_page: 10, total: 25, total_pages: 3 })
  })

  it('لا يرسل lat أو lng أو max_distance إذا كان أحد الإحداثيين مفقوداً (تفادياً لـ 400)', async () => {
    const fetchMock = vi.fn(async () => ok([], { page: 1, per_page: 10, total: 0, total_pages: 0 }))
    vi.stubGlobal('fetch', fetchMock)

    await stockApi.getStocks({ lat: 13.5795, max_distance: 5000 })

    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/stocks')
  })

  it('يتعامل بأمان مع غياب data ويرمي 403 للمزود', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ success: false, error: { code: 1107, message: 'forbidden' } }, 403)
      )
    )

    await expect(stockApi.getStocks()).rejects.toMatchObject({ status: 403, code: 1107 })
  })
})
