// @vitest-environment jsdom
// ═══════════ اختبارات بطاقة اكتشاف المخزون في لوحة التحكم ═══════════
import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import ProviderStockCard from '../components/ProviderStockCard'
import { ROUTES } from '../../../shared/constants/routes'
import { STOCK, ok, apiError, stubApi, renderWithAuth } from './helpers'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('ProviderStockCard — حالات اكتشاف المخزون', () => {
  it('يعرض حالة تحميل ثم «لا يوجد مخزون مسجل» عند 404/1600 مع إجراء الإنشاء', async () => {
    stubApi(({ url }) => {
      if (url.includes('/user/me/stock')) return apiError(404, 1600, 'stock not found')
      return ok({})
    })
    const go = vi.fn()

    renderWithAuth(<ProviderStockCard go={go} />)

    expect(screen.getByText(/جارٍ فحص حالة المخزون/)).toBeTruthy()
    expect(await screen.findByText('لا يوجد مخزون مسجل')).toBeTruthy()

    fireEvent.click(screen.getByText('إضافة مخزون جديد'))
    expect(go).toHaveBeenCalledWith(ROUTES.STOCK_CREATE)
  })

  it('يعرض ملخص المخزون عند 200 بدون زر إنشاء آخر', async () => {
    stubApi(({ url }) => {
      if (url.includes('/user/me/stock')) return ok(STOCK)
      return ok({})
    })
    const go = vi.fn()

    renderWithAuth(<ProviderStockCard go={go} />)

    expect(await screen.findByText('المخزون الحالي')).toBeTruthy()
    expect(screen.getByText('مواد غذائية')).toBeTruthy()
    expect(screen.getAllByText('120').length).toBeGreaterThan(0) // available بالوحدة الرئيسية
    expect(screen.getByText('كرتون')).toBeTruthy() // من balances
    expect(screen.getByText('إدارة المخزون')).toBeTruthy()
    expect(screen.queryByText('إضافة مخزون جديد')).toBeNull() // لا زر إنشاء احتياطي

    fireEvent.click(screen.getByText('إدارة المخزون'))
    expect(go).toHaveBeenCalledWith(ROUTES.STOCK_DASHBOARD)
  })

  it('يعرض خطأ مع إعادة محاولة (لا يعامل أخطاء الخادم كبيانات فارغة)', async () => {
    const { calls } = stubApi(({ url }) => {
      if (url.includes('/user/me/stock')) return apiError(500, 5000, 'server error')
      return ok({})
    })
    const go = vi.fn()

    renderWithAuth(<ProviderStockCard go={go} />)

    expect(await screen.findByText('تعذر تحميل بيانات المخزون')).toBeTruthy()
    expect(screen.queryByText('لا يوجد مخزون مسجل')).toBeNull()

    fireEvent.click(screen.getByText('إعادة المحاولة'))
    await waitFor(() => expect(calls.length).toBe(2))
  })

  it('يعرض حالة انتهاء الجلسة عند 401', async () => {
    stubApi(({ url }) => {
      if (url.includes('/user/me/stock')) return apiError(401, 1100, 'unauthorized')
      return ok({})
    })

    renderWithAuth(<ProviderStockCard go={vi.fn()} />)

    expect(await screen.findByText('انتهت الجلسة')).toBeTruthy()
    expect(screen.getByText('تسجيل الدخول مجدداً')).toBeTruthy()
  })
})
