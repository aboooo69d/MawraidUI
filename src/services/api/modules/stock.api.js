// ═══════════ Stock API Endpoints — ميزة المخزون (Nova) ═══════════
// جميع المسارات نسبية إلى ENV.API_BASE_URL (/api/v1) — بدون تكرار البادئة.
// الجلسة تُرسل تلقائياً عبر cookies (credentials: 'include') داخل request().
import { request } from '../client'

export const stockApi = {
  // قائمة مخازن المزود الحالي (GET /api/v1/stocks)
  getMyStocks: async () => (await request('/stocks')) ?? [],

  // تصنيفات المخزون (GET /api/v1/stocks/types)
  getStockTypes: async () => (await request('/stocks/types')) ?? [],

  // إنشاء مخزون جديد (POST /api/v1/stocks)
  createStock: (payload) => request('/stocks', { method: 'POST', body: payload }),

  // جلب مخزون بالمعرّف (GET /api/v1/stocks/:stock_id)
  getStockById: (stockId) => request(`/stocks/${stockId}`),

  // تسجيل حركة وارد/منصرف (POST /api/v1/stocks/:stock_id/transactions)
  createStockTransaction: (stockId, payload) =>
    request(`/stocks/${stockId}/transactions`, { method: 'POST', body: payload }),

  // سجل الحركات مع الترقيم (GET /api/v1/stocks/:stock_id/transactions?page&page_size&is_in)
  // يُرجع { data, meta } لأن الترقيم في meta.
  getStockTransactions: async (stockId, { page = 1, page_size = 20, is_in } = {}) => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('page_size', String(page_size))
    if (is_in !== undefined && is_in !== null && is_in !== '') params.set('is_in', String(is_in))
    const res = await request(`/stocks/${stockId}/transactions?${params.toString()}`, { withMeta: true })
    return {
      data: Array.isArray(res?.data) ? res.data : [],
      meta: res?.meta || null,
    }
  },

  // إضافة وحدة فرعية (POST /api/v1/stocks/:stock_id/units)
  addStockUnit: (stockId, payload) =>
    request(`/stocks/${stockId}/units`, { method: 'POST', body: payload }),

  // تعديل وحدة (PATCH /api/v1/stocks/:stock_id/units/:unit_id)
  updateStockUnit: (stockId, unitId, payload) =>
    request(`/stocks/${stockId}/units/${unitId}`, { method: 'PATCH', body: payload }),
}
