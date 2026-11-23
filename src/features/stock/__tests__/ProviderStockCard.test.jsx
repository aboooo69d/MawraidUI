// @vitest-environment jsdom
// ═══════════ اختبارات قائمة مخازن المزود في لوحة التحكم (Multi-Stock) ═══════════
import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import ProviderStockCard from '../components/ProviderStockCard'
import { ROUTES } from '../../../shared/constants/routes'
import { STOCK, STOCK_WATER, ok, json, apiError, stubApi, renderWithAuth } from './helpers'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('ProviderStockCard — تعدد المخازن', () => {
  it('يعرض حالة تحميل ثم «لا يوجد مخزون مسجل» عند مصفوفة فارغة أو غياب data', async () => {
    stubApi(({ url, method }) => {
      if (method === 'GET' && url === '/api/v1/stocks/me') return json({ success: true })
      throw new Error(`Unexpected request: ${method} ${url}`)
    })
    const go = vi.fn()

    renderWithAuth(<ProviderStockCard go={go} />)

    expect(screen.getByText(/جارٍ تحميل قائمة المخازن/)).toBeTruthy()
    expect(await screen.findByText('لا يوجد مخزون مسجل')).toBeTruthy()

    fireEvent.click(screen.getByText('إضافة مخزون جديد'))
    expect(go).toHaveBeenCalledWith(ROUTES.STOCK_CREATE)
  })

  it('يعرض بطاقات المخازن مع إبقاء زر «إضافة مخزون جديد» متاحاً دائماً', async () => {
    stubApi(({ url, method }) => {
      if (method === 'GET' && url === '/api/v1/stocks/me') return ok([STOCK, STOCK_WATER])
      throw new Error(`Unexpected request: ${method} ${url}`)
    })
    const go = vi.fn()

    renderWithAuth(<ProviderStockCard go={go} />)

    expect(await screen.findByText('المخازن المسجّلة (2)')).toBeTruthy()
    expect(screen.getByText('غاز منزلي')).toBeTruthy()
    expect(screen.getByText('استبدال أسطوانات')).toBeTruthy()
    expect(screen.getByText(STOCK.address)).toBeTruthy()
    expect(screen.getByText('مياه')).toBeTruthy()
    expect(screen.getByText('إضافة مخزون جديد')).toBeTruthy()

    const manageBtns = screen.getAllByText('إدارة المخزون')
    expect(manageBtns).toHaveLength(2)
    fireEvent.click(manageBtns[0])
    expect(go).toHaveBeenCalledWith(ROUTES.STOCK_DASHBOARD, { stockId: STOCK.id })
  })

  it('يعرض خطأ مع إعادة محاولة (لا يعامل أخطاء الخادم كبيانات فارغة)', async () => {
    const { calls } = stubApi(({ url, method }) => {
      if (method === 'GET' && url === '/api/v1/stocks/me') return apiError(500, 5000, 'server error')
      throw new Error(`Unexpected request: ${method} ${url}`)
    })

    renderWithAuth(<ProviderStockCard go={vi.fn()} />)

    expect(await screen.findByText('تعذر تحميل بيانات المخزون')).toBeTruthy()
    expect(screen.queryByText('لا يوجد مخزون مسجل')).toBeNull()

    fireEvent.click(screen.getByText('إعادة المحاولة'))
    await waitFor(() => expect(calls.length).toBe(2))
  })

  it('يعرض حالة انتهاء الجلسة عند 401 / 1106', async () => {
    stubApi(({ url, method }) => {
      if (method === 'GET' && url === '/api/v1/stocks/me') return apiError(401, 1106, 'unauthorized')
      throw new Error(`Unexpected request: ${method} ${url}`)
    })

    renderWithAuth(<ProviderStockCard go={vi.fn()} />)

    expect(await screen.findByText('انتهت الجلسة')).toBeTruthy()
    expect(screen.getByText('تسجيل الدخول مجدداً')).toBeTruthy()
  })
})
