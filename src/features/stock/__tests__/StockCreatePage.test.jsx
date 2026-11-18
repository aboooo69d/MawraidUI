// @vitest-environment jsdom
// ═══════════ اختبارات شاشة إنشاء المخزون ═══════════
import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import StockCreatePage from '../pages/StockCreatePage'
import { ROUTES } from '../../../shared/constants/routes'
import { STOCK, STOCK_TYPES, ok, apiError, stubApi, renderWithAuth } from './helpers'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function stubTypes(extra) {
  return stubApi(({ url, method, body }) => {
    if (url.includes('/stocks/types')) return ok(STOCK_TYPES)
    if (url.includes('/user/me/stock')) return ok(STOCK)
    if (method === 'POST' && url.endsWith('/api/v1/stocks')) return ok({ id: 'new' })
    return ok({})
  })
}

const fillValidForm = async () => {
  await screen.findByText('مياه ومشروبات') // انتظار اكتمال تحميل الأنواع
  fireEvent.change(screen.getByLabelText(/نوع المخزون/), { target: { value: '1' } })
  fireEvent.change(screen.getByPlaceholderText('مثال: حبة'), { target: { value: 'حبة' } })
  fireEvent.click(screen.getByText('إضافة وحدة فرعية'))
  fireEvent.change(screen.getByPlaceholderText('مثال: كرتون'), { target: { value: 'كرتون' } })
  fireEvent.change(screen.getByPlaceholderText('مثال: 12'), { target: { value: '12' } })
}

describe('StockCreatePage — التحقق والإنشاء', () => {
  it('يحمّل أنواع المخزون ويعرضها في القائمة', async () => {
    stubTypes()
    renderWithAuth(<StockCreatePage go={vi.fn()} showToast={vi.fn()} />)

    await waitFor(() => {
      const select = screen.getByLabelText(/نوع المخزون/)
      expect(select.options.length).toBe(STOCK_TYPES.length + 1)
    })
    expect(screen.getByText('مواد غذائية')).toBeTruthy()
    expect(screen.getByText('مياه ومشروبات')).toBeTruthy()
  })

  it('يرفض الإرسال بدون نوع مخزون', async () => {
    const { calls } = stubTypes()
    renderWithAuth(<StockCreatePage go={vi.fn()} showToast={vi.fn()} />)

    await screen.findByText('إنشاء المخزون')
    fireEvent.change(screen.getByPlaceholderText('مثال: حبة'), { target: { value: 'حبة' } })
    fireEvent.click(screen.getByText('إنشاء المخزون'))

    expect(await screen.findByText('يرجى اختيار نوع المخزون')).toBeTruthy()
    expect(calls.filter((c) => c.method === 'POST').length).toBe(0)
  })

  it('يرفض أسماء الوحدات المكررة محلياً', async () => {
    const { calls } = stubTypes()
    renderWithAuth(<StockCreatePage go={vi.fn()} showToast={vi.fn()} />)

    await screen.findByText('إنشاء المخزون')
    await screen.findByText('مياه ومشروبات')
    fireEvent.change(screen.getByLabelText(/نوع المخزون/), { target: { value: '1' } })
    fireEvent.change(screen.getByPlaceholderText('مثال: حبة'), { target: { value: 'حبة' } })
    fireEvent.click(screen.getByText('إضافة وحدة فرعية'))
    fireEvent.change(screen.getByPlaceholderText('مثال: كرتون'), { target: { value: 'حبة' } })
    fireEvent.change(screen.getByPlaceholderText('مثال: 12'), { target: { value: '12' } })
    fireEvent.click(screen.getByText('إنشاء المخزون'))

    expect(await screen.findByText(/اسم الوحدة مكرر/)).toBeTruthy()
    expect(calls.filter((c) => c.method === 'POST').length).toBe(0)
  })

  it('يرسل الحمول الموثّق عند التحقق الناجح وينتقل للوحة', async () => {
    const { calls } = stubTypes()
    const go = vi.fn()
    const showToast = vi.fn()

    renderWithAuth(<StockCreatePage go={go} showToast={showToast} />)
    await screen.findByText('إنشاء المخزون')

    await fillValidForm()
    fireEvent.click(screen.getByText('إنشاء المخزون'))

    await waitFor(() => expect(calls.filter((c) => c.method === 'POST').length).toBe(1))
    const post = calls.find((c) => c.method === 'POST')
    expect(post.url).toBe('/api/v1/stocks')
    expect(post.body).toEqual({
      stock_type_id: 1,
      units: [
        { name: 'حبة', rate: 1, is_main: true },
        { name: 'كرتون', rate: 12, is_main: false },
      ],
    })
    await waitFor(() => expect(go).toHaveBeenCalledWith(ROUTES.STOCK_DASHBOARD))
    expect(showToast).toHaveBeenCalledWith('تم إنشاء المخزون بنجاح')
  })

  it('عند 1611 (مخزون موجود) ينتقل إلى لوحة المخزون دون إعادة محاولة الإنشاء', async () => {
    let posts = 0
    const { calls } = stubApi(({ url, method }) => {
      if (url.includes('/stocks/types')) return ok(STOCK_TYPES)
      if (method === 'POST' && url.endsWith('/api/v1/stocks')) {
        posts += 1
        return apiError(409, 1611, 'stock already exists')
      }
      if (url.includes('/user/me/stock')) return ok(STOCK)
      return ok({})
    })
    const go = vi.fn()
    const showToast = vi.fn()

    renderWithAuth(<StockCreatePage go={go} showToast={showToast} />)
    await screen.findByText('إنشاء المخزون')

    await fillValidForm()
    fireEvent.click(screen.getByText('إنشاء المخزون'))

    await waitFor(() => expect(go).toHaveBeenCalledWith(ROUTES.STOCK_DASHBOARD))
    expect(posts).toBe(1) // لا إعادة إرسال
    expect(showToast).toHaveBeenCalledWith('لديك مخزون مسجل بالفعل')
    expect(calls.filter((c) => c.url.includes('/user/me/stock')).length).toBe(1)
  })
})
