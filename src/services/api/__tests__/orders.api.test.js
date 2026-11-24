// ═══════════ اختبارات عقد (Contract) لوحدة orders API — المستفيد والمزود ═══════════
import { describe, it, expect, vi, afterEach } from 'vitest'
import { ordersApi } from '../modules/orders.api'

const jsonResponse = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const ok = (data, meta) =>
  jsonResponse(meta ? { success: true, data, meta } : { success: true, data })

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ordersApi — إنشاء وجلب وإلغاء طلبات المستفيد', () => {
  it('createOrder → POST /api/v1/orders مع بيانات الجلسة والحمولة الكاملة', async () => {
    const sampleOrder = {
      id: 'c7a1b2c3-d4e5-6789-abcd-ef0123456789',
      order_number: 'ORD-20261124-A1B2C3D4',
      status: 'pending',
      total_price: 15000,
    }
    const fetchMock = vi.fn(async () => ok(sampleOrder))
    vi.stubGlobal('fetch', fetchMock)

    const payload = {
      stock_id: 'e4226f8b-f41e-42ef-8ba0-04470295cb45',
      unit_id: 1,
      quantity: 2,
      address_id: '9f1c2d3e-4a5b-6789-0123-abcdef123456',
      consumer_type: 'home',
      notes: 'Call on arrival',
    }
    const res = await ordersApi.createOrder(payload)

    expect(res).toEqual(sampleOrder)
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/orders')
    expect(opts.method).toBe('POST')
    expect(opts.credentials).toBe('include')
    expect(opts.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(opts.body)).toEqual(payload)
  })

  it('listMyOrders → GET /api/v1/orders/me مع الفلاتر والترقيم ويرجع { data, meta }', async () => {
    const fetchMock = vi.fn(async () =>
      ok([{ id: 'o1', order_number: 'ORD-1' }], { page: 2, per_page: 10, total: 12, total_pages: 2 })
    )
    vi.stubGlobal('fetch', fetchMock)

    const res = await ordersApi.listMyOrders({
      status: 'pending',
      stock_id: 'e4226f8b-f41e-42ef-8ba0-04470295cb45',
      consumer_type: 'home',
      page: 2,
      page_size: 10,
    })

    const [url, opts] = fetchMock.mock.calls[0]
    expect(opts.method).toBe('GET')
    expect(opts.credentials).toBe('include')
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.pathname).toBe('/api/v1/orders/me')
    expect(parsed.searchParams.get('status')).toBe('pending')
    expect(parsed.searchParams.get('stock_id')).toBe('e4226f8b-f41e-42ef-8ba0-04470295cb45')
    expect(parsed.searchParams.get('consumer_type')).toBe('home')
    expect(parsed.searchParams.get('page')).toBe('2')
    expect(parsed.searchParams.get('page_size')).toBe('10')
    expect(res.data).toHaveLength(1)
    expect(res.meta).toEqual({ page: 2, per_page: 10, total: 12, total_pages: 2 })
  })

  it('listMyOrders يرجع [] عند غياب data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ success: true, meta: { page: 1, per_page: 10, total: 0, total_pages: 0 } }))
    )

    const res = await ordersApi.listMyOrders()
    expect(res.data).toEqual([])
  })

  it('getMyOrder → GET /api/v1/orders/me/:order_id', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 'ord-123', status: 'accepted' }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await ordersApi.getMyOrder('ord-123')

    expect(res).toEqual({ id: 'ord-123', status: 'accepted' })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/orders/me/ord-123')
    expect(fetchMock.mock.calls[0][1].method).toBe('GET')
  })

  it('cancelOrder → PATCH /api/v1/orders/me/:order_id/cancel مع سبب اختياري', async () => {
    const fetchMock = vi.fn(async () =>
      ok({ id: 'ord-123', status: 'cancelled', reason: 'Ordered by mistake' })
    )
    vi.stubGlobal('fetch', fetchMock)

    const res = await ordersApi.cancelOrder('ord-123', { reason: 'Ordered by mistake' })

    expect(res.status).toBe('cancelled')
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/orders/me/ord-123/cancel')
    expect(opts.method).toBe('PATCH')
    expect(JSON.parse(opts.body)).toEqual({ reason: 'Ordered by mistake' })
  })

  it('يرمي ApiError بالكود الصحيح عند فشل انتقال الحالة (1805)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ success: false, error: { code: 1805, message: 'order is no longer pending' } }, 409)
      )
    )

    await expect(ordersApi.cancelOrder('ord-123')).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 1805,
    })
  })
})

describe('ordersApi — إدارة الطلبات الواردة لمزود الخدمة', () => {
  it('listProviderOrders → GET /api/v1/orders/provider مع الفلاتر والترقيم', async () => {
    const fetchMock = vi.fn(async () =>
      ok([{ id: 'p-ord-1', status: 'pending' }], { page: 1, per_page: 10, total: 1, total_pages: 1 })
    )
    vi.stubGlobal('fetch', fetchMock)

    const res = await ordersApi.listProviderOrders({
      status: 'pending',
      stock_id: 'stock-uuid-1',
      consumer_type: 'business',
      page: 1,
      page_size: 10,
    })

    const [url, opts] = fetchMock.mock.calls[0]
    expect(opts.method).toBe('GET')
    expect(opts.credentials).toBe('include')
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.pathname).toBe('/api/v1/orders/provider')
    expect(parsed.searchParams.get('status')).toBe('pending')
    expect(parsed.searchParams.get('stock_id')).toBe('stock-uuid-1')
    expect(parsed.searchParams.get('consumer_type')).toBe('business')
    expect(res.data).toHaveLength(1)
  })

  it('getProviderOrder → GET /api/v1/orders/provider/:order_id', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 'p-ord-1', status: 'pending' }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await ordersApi.getProviderOrder('p-ord-1')

    expect(res.id).toBe('p-ord-1')
    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/orders/provider/p-ord-1')
    expect(fetchMock.mock.calls[0][1].method).toBe('GET')
  })

  it('acceptProviderOrder → PATCH /api/v1/orders/provider/:order_id/accept بدون body', async () => {
    const fetchMock = vi.fn(async () => ok({ id: 'p-ord-1', status: 'accepted' }))
    vi.stubGlobal('fetch', fetchMock)

    const res = await ordersApi.acceptProviderOrder('p-ord-1')

    expect(res.status).toBe('accepted')
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/orders/provider/p-ord-1/accept')
    expect(opts.method).toBe('PATCH')
    expect(opts.body).toBeUndefined()
  })

  it('rejectProviderOrder → PATCH /api/v1/orders/provider/:order_id/reject مع سبب الرفض', async () => {
    const fetchMock = vi.fn(async () =>
      ok({ id: 'p-ord-1', status: 'rejected', reason: 'Out of delivery range' })
    )
    vi.stubGlobal('fetch', fetchMock)

    const res = await ordersApi.rejectProviderOrder('p-ord-1', {
      reason: 'Out of delivery range',
    })

    expect(res.status).toBe('rejected')
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/orders/provider/p-ord-1/reject')
    expect(opts.method).toBe('PATCH')
    expect(JSON.parse(opts.body)).toEqual({ reason: 'Out of delivery range' })
  })

  it('completeProviderOrder → PATCH /api/v1/orders/provider/:order_id/complete بدون body', async () => {
    const fetchMock = vi.fn(async () =>
      ok({ id: 'p-ord-1', status: 'completed', payment_status: 'paid' })
    )
    vi.stubGlobal('fetch', fetchMock)

    const res = await ordersApi.completeProviderOrder('p-ord-1')

    expect(res.status).toBe('completed')
    expect(res.payment_status).toBe('paid')
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/v1/orders/provider/p-ord-1/complete')
    expect(opts.method).toBe('PATCH')
    expect(opts.body).toBeUndefined()
  })
})
