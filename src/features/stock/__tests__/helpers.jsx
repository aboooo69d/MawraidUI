// ═══════════ أدوات مساعدة لاختبارات المخزون (mock على fetch — بلا خادم) ═══════════
import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { AuthProvider } from '../../../app/providers/AuthProvider'

// إغفال JSON خام — تُستخدم فقط داخل apiError (الذي يبني الغلاف بنفسه)
export const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

// نجاح مغلّف بغلاف Nova: { success: true, data, meta? }
export const ok = (data, meta) =>
  json(meta !== undefined && meta !== null ? { success: true, data, meta } : { success: true, data })

// الخادم يُرسل HTTP status في الترويسة فقط و { code, message } في error
export const apiError = (status, code, message) =>
  json({ success: false, error: { code, message } }, status)

// مخزون نموذقي مطابق لعقد Multi-Stock المحدّث
export const STOCK = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  available: 120,
  address: 'تعز - شارع جمال بجانب جولة المسبح',
  location: { lat: 13.5795, lng: 44.0209 },
  type: { id: 1, name: 'غاز منزلي', slug: 'gaz', provider_type_id: 1 },
  stock_details: { gaz_stock_type: 'exchange' },
  units: [
    { id: 10, name: 'حبة', rate: 1, is_main: true },
    { id: 11, name: 'كرتون', rate: 12, is_main: false },
  ],
  balances: [
    { unit_id: 10, unit: 'حبة', amount: 120 },
    { unit_id: 11, unit: 'كرتون', amount: 10 },
  ],
  user_id: '11111111-2222-3333-4444-555555555555',
  created_at: '2026-11-22T06:00:00Z',
  updated_at: '2026-11-22T06:15:00Z',
}

export const STOCK_WATER = {
  id: '660e8400-e29b-41d4-a716-446655440001',
  available: 3000,
  address: 'تعز - حوض الأشراف أمام المحطة المركزية',
  location: { lat: 13.5811, lng: 44.0152 },
  type: { id: 2, name: 'مياه', slug: 'water', provider_type_id: 1 },
  stock_details: null,
  units: [{ id: 20, name: 'لتر', rate: 1, is_main: true }],
  balances: [{ unit_id: 20, unit: 'لتر', amount: 3000 }],
  user_id: '11111111-2222-3333-4444-555555555555',
  created_at: '2026-11-22T07:00:00Z',
  updated_at: '2026-11-22T07:15:00Z',
}

export const STOCK_TYPES = [
  { id: 1, name: 'غاز منزلي', slug: 'gaz', provider_type_id: 1 },
  { id: 2, name: 'مياه', slug: 'water', provider_type_id: 1 },
]

// يبني mock لـ fetch يوجّه كل طلب إلى معالج حسب (الطريقة، المسار)
export function stubApi(handler) {
  const calls = []
  const fetchMock = vi.fn(async (url, opts = {}) => {
    const method = (opts.method || 'GET').toUpperCase()
    const call = { url: String(url), method, opts, body: opts.body ? JSON.parse(opts.body) : null }
    calls.push(call)
    return handler(call)
  })
  vi.stubGlobal('fetch', fetchMock)
  return { fetchMock, calls }
}

export function match(calls, method, path) {
  return calls.filter((c) => c.method === method && c.url.split('?')[0] === path)
}

export function renderWithAuth(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>)
}
