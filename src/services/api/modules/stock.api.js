// ═══════════ Stock API Endpoints — ميزة المخزون (Nova) ═══════════
// جميع المسارات نسبية إلى ENV.API_BASE_URL (/api/v1) — بدون تكرار البادئة.
// الجلسة تُرسل تلقائياً عبر cookies (credentials: 'include') داخل request().
import { request } from '../client'

const STOCKS_ME = '/stocks/me'

export const stockApi = {
  // قائمة مخازن المزود الحالي (GET /api/v1/stocks/me)
  getMyStocks: async () => (await request(STOCKS_ME)) ?? [],

  // تصنيفات المخزون (GET /api/v1/stocks/types)
  getStockTypes: async () => (await request('/stocks/types')) ?? [],

  // إنشاء مخزون جديد (POST /api/v1/stocks/me)
  createStock: (payload) => request(STOCKS_ME, { method: 'POST', body: payload }),

  // جلب مخزون بالمعرّف (GET /api/v1/stocks/me/:stock_id)
  getStockById: (stockId) => request(`${STOCKS_ME}/${stockId}`),

  // تسجيل حركة وارد/منصرف (POST /api/v1/stocks/me/:stock_id/transactions)
  createStockTransaction: (stockId, payload) =>
    request(`${STOCKS_ME}/${stockId}/transactions`, { method: 'POST', body: payload }),

  // سجل الحركات مع الترقيم (GET /api/v1/stocks/me/:stock_id/transactions?page&page_size&is_in)
  // يُرجع { data, meta } لأن الترقيم في meta.
  getStockTransactions: async (stockId, { page = 1, page_size = 20, is_in } = {}) => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('page_size', String(page_size))
    if (is_in !== undefined && is_in !== null && is_in !== '') params.set('is_in', String(is_in))
    const res = await request(`${STOCKS_ME}/${stockId}/transactions?${params.toString()}`, { withMeta: true })
    return {
      data: Array.isArray(res?.data) ? res.data : [],
      meta: res?.meta || null,
    }
  },

  // إضافة وحدة فرعية (POST /api/v1/stocks/me/:stock_id/units)
  addStockUnit: (stockId, payload) =>
    request(`${STOCKS_ME}/${stockId}/units`, { method: 'POST', body: payload }),

  // تعديل وحدة (PATCH /api/v1/stocks/me/:stock_id/units/:unit_id)
  updateStockUnit: (stockId, unitId, payload) =>
    request(`${STOCKS_ME}/${stockId}/units/${unitId}`, { method: 'PATCH', body: payload }),

  // جلب مخزون بالمعرّف للمستفيدين والإدارة (GET /api/v1/stocks/:stock_id)
  getConsumerStockById: (stockId) => request(`/stocks/${encodeURIComponent(stockId)}`),

  // استكشاف المخزون المتاح للمستفيدين والإدارة (GET /api/v1/stocks)
  // يُرجع { data, meta } مع دعم الفلاتر والفرز الجغرافي.
  getStocks: async (filters = {}) => {
    const params = new URLSearchParams()

    if (typeof filters.name === 'string' && filters.name.trim()) {
      params.set('name', filters.name.trim())
    }
    if (typeof filters.stock_type === 'string' && filters.stock_type.trim()) {
      params.set('stock_type', filters.stock_type.trim())
    }
    if (filters.stock_type_id !== undefined && filters.stock_type_id !== null && filters.stock_type_id !== '') {
      const typeId = Number(filters.stock_type_id)
      if (Number.isInteger(typeId) && typeId > 0) {
        params.set('stock_type_id', String(typeId))
      }
    }
    if (typeof filters.in_stock === 'boolean') {
      params.set('in_stock', String(filters.in_stock))
    }

    // يجب إرسال lat و lng معاً لتجنب 400 Bad Request
    const hasLat = typeof filters.lat === 'number' && Number.isFinite(filters.lat)
    const hasLng = typeof filters.lng === 'number' && Number.isFinite(filters.lng)
    if (hasLat && hasLng) {
      params.set('lat', String(filters.lat))
      params.set('lng', String(filters.lng))

      const maxDist = Number(filters.max_distance)
      if (Number.isFinite(maxDist) && maxDist > 0) {
        params.set('max_distance', String(maxDist))
      }
    }

    if (filters.page !== undefined && filters.page !== null) {
      const page = Number(filters.page)
      if (Number.isInteger(page) && page >= 1) {
        params.set('page', String(page))
      }
    }
    if (filters.page_size !== undefined && filters.page_size !== null) {
      const pageSize = Number(filters.page_size)
      if (Number.isInteger(pageSize) && pageSize >= 1) {
        params.set('page_size', String(Math.min(pageSize, 100)))
      }
    }

    const qs = params.toString()
    const res = await request(qs ? `/stocks?${qs}` : '/stocks', { withMeta: true })
    return {
      data: Array.isArray(res?.data) ? res.data : [],
      meta: res?.meta || null,
    }
  },
}
