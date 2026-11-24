// ═══════════ Orders API Endpoints — طلبات المستفيدين ومزودي الخدمة ═══════════
// جميع المسارات نسبية إلى ENV.API_BASE_URL (/api/v1).
// الجلسة تُرسل تلقائياً عبر cookies (credentials: 'include') داخل request().
import { request } from '../client'

const ORDERS = '/orders'
const ORDERS_ME = '/orders/me'
const ORDERS_PROVIDER = '/orders/provider'

function buildOrderQueryParams(filters = {}) {
  const params = new URLSearchParams()

  if (typeof filters.status === 'string' && filters.status.trim()) {
    params.set('status', filters.status.trim())
  }
  if (typeof filters.stock_id === 'string' && filters.stock_id.trim()) {
    params.set('stock_id', filters.stock_id.trim())
  }
  if (typeof filters.consumer_type === 'string' && filters.consumer_type.trim()) {
    params.set('consumer_type', filters.consumer_type.trim())
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

  return params.toString()
}

export const ordersApi = {
  // ── مسارات المستفيد (Consumer) ──

  // إنشاء طلب جديد وحجز الكمية فوراً (POST /api/v1/orders)
  createOrder: (payload) =>
    request(ORDERS, { method: 'POST', body: payload }),

  // قائمة طلبات المستفيد الحالي مع الفلاتر والترقيم (GET /api/v1/orders/me)
  listMyOrders: async (filters = {}) => {
    const qs = buildOrderQueryParams(filters)
    const res = await request(qs ? `${ORDERS_ME}?${qs}` : ORDERS_ME, { withMeta: true })
    return {
      data: Array.isArray(res?.data) ? res.data : [],
      meta: res?.meta || null,
    }
  },

  // تفاصيل طلب واحد للمستفيد (GET /api/v1/orders/me/:order_id)
  getMyOrder: (orderId) =>
    request(`${ORDERS_ME}/${encodeURIComponent(orderId)}`),

  // إلغاء طلب قيد الانتظار واستعادة المخزون (PATCH /api/v1/orders/me/:order_id/cancel)
  cancelOrder: (orderId, payload = {}) =>
    request(`${ORDERS_ME}/${encodeURIComponent(orderId)}/cancel`, {
      method: 'PATCH',
      body: payload ?? {},
    }),

  // ── مسارات مزود الخدمة (Provider) ──

  // قائمة الطلبات الواردة للمزود مع الفلاتر والترقيم (GET /api/v1/orders/provider)
  listProviderOrders: async (filters = {}) => {
    const qs = buildOrderQueryParams(filters)
    const res = await request(qs ? `${ORDERS_PROVIDER}?${qs}` : ORDERS_PROVIDER, { withMeta: true })
    return {
      data: Array.isArray(res?.data) ? res.data : [],
      meta: res?.meta || null,
    }
  },

  // تفاصيل طلب وارد واحد للمزود (GET /api/v1/orders/provider/:order_id)
  getProviderOrder: (orderId) =>
    request(`${ORDERS_PROVIDER}/${encodeURIComponent(orderId)}`),

  // قبول طلب قيد الانتظار (PATCH /api/v1/orders/provider/:order_id/accept)
  acceptProviderOrder: (orderId) =>
    request(`${ORDERS_PROVIDER}/${encodeURIComponent(orderId)}/accept`, {
      method: 'PATCH',
    }),

  // رفض طلب قيد الانتظار واستعادة المخزون (PATCH /api/v1/orders/provider/:order_id/reject)
  rejectProviderOrder: (orderId, payload = {}) =>
    request(`${ORDERS_PROVIDER}/${encodeURIComponent(orderId)}/reject`, {
      method: 'PATCH',
      body: payload ?? {},
    }),

  // إتمام طلب مقبول وتأكيد التسليم والتحصيل (PATCH /api/v1/orders/provider/:order_id/complete)
  completeProviderOrder: (orderId) =>
    request(`${ORDERS_PROVIDER}/${encodeURIComponent(orderId)}/complete`, {
      method: 'PATCH',
    }),
}
