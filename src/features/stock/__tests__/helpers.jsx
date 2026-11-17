// ═══════════ أدوات مساعدة لاختبارات المخزون (mock على fetch — بلا خادم) ═══════════
import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { AuthProvider } from '../../../app/providers/AuthProvider'

export const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export const apiError = (status, code, message) =>
  json({ success: false, error: { status, code, message } }, status)

// مخزون نموذقي مطابق لعقد API_STOCK_DOCS.md
export const STOCK = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  available: 120,
  type: { id: 1, name: 'مواد غذائية' },
  units: [
    { id: 10, name: 'حبة', rate: 1, is_main: true },
    { id: 11, name: 'كرتون', rate: 12, is_main: false },
  ],
  balances: [
    { unit_id: 10, unit: 'حبة', amount: 120 },
    { unit_id: 11, unit: 'كرتون', amount: 10 },
  ],
  user_id: '11111111-2222-3333-4444-555555555555',
  created_at: '2026-11-16T06:00:00Z',
  updated_at: '2026-11-16T06:15:00Z',
}

export const STOCK_TYPES = [
  { id: 1, name: 'مواد غذائية' },
  { id: 2, name: 'مياه ومشروبات' },
]

// يبني mock لـ fetch يوجّه كل طلب إلى معالج حسب (الطريقة، المسار)
// handler تُرجع Response أو throws. يُرجع كائن الفحص + مُنسّق الطلبات.
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

// يطابق الطلبات بالطريقة والمسار (مع تجاهل الاستعلام)
export function match(calls, method, path) {
  return calls.filter((c) => c.method === method && c.url.split('?')[0] === path)
}

// يلف المكوّن داخل AuthProvider (مطلوب لاستخدام useAuth)
export function renderWithAuth(ui) {
  return render(<AuthProvider>{ui}</AuthProvider>)
}
