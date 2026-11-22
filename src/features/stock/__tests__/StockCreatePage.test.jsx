// @vitest-environment jsdom
// ═══════════ اختبارات شاشة إنشاء المخزون (Multi-Stock + الموقع + التفاصيل) ═══════════
import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import StockCreatePage from '../pages/StockCreatePage'
import { ROUTES } from '../../../shared/constants/routes'
import { STOCK_TYPES, ok, stubApi, renderWithAuth } from './helpers'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function stubTypes() {
  return stubApi(({ url, method }) => {
    if (url.includes('/stocks/types')) return ok(STOCK_TYPES)
    if (method === 'POST' && url.endsWith('/api/v1/stocks')) return ok({ id: 'new-stock-1' })
    return ok({})
  })
}

const fillCommonFields = async (typeId = '1') => {
  await screen.findByText('مياه')
  fireEvent.change(screen.getByLabelText(/نوع المخزون/), { target: { value: typeId } })
  fireEvent.change(screen.getByLabelText(/عنوان المخزون/), {
    target: { value: 'تعز - شارع جمال بجانب جولة المسبح' },
  })
  fireEvent.change(screen.getByLabelText(/خط العرض/), { target: { value: '13.5795' } })
  fireEvent.change(screen.getByLabelText(/خط الطول/), { target: { value: '44.0209' } })
  fireEvent.change(screen.getByPlaceholderText('مثال: حبة'), { target: { value: 'اسطوانة' } })
  fireEvent.click(screen.getByText('إضافة وحدة فرعية'))
  fireEvent.change(screen.getByPlaceholderText('مثال: كرتون'), { target: { value: 'شبك' } })
  fireEvent.change(screen.getByPlaceholderText('مثال: 12'), { target: { value: '10' } })
}

describe('StockCreatePage — التحقق والإنشاء', () => {
  it('يحمّل أنواع المخزون ويعرضها في القائمة', async () => {
    stubTypes()
    renderWithAuth(<StockCreatePage go={vi.fn()} showToast={vi.fn()} />)

    await waitFor(() => {
      const select = screen.getByLabelText(/نوع المخزون/)
      expect(select.options.length).toBe(STOCK_TYPES.length + 1)
    })
    expect(screen.getByText('غاز منزلي')).toBeTruthy()
    expect(screen.getByText('مياه')).toBeTruthy()
  })

  it('يُظهر حقل نوع مخزون الغاز عند اختيار gaz ويرسل الحمول كاملاً', async () => {
    const { calls } = stubTypes()
    const go = vi.fn()
    const showToast = vi.fn()

    renderWithAuth(<StockCreatePage go={go} showToast={showToast} />)
    await fillCommonFields('1')

    const gazSelect = await screen.findByLabelText(/نوع مخزون الغاز/)
    fireEvent.change(gazSelect, { target: { value: 'exchange' } })
    fireEvent.click(screen.getByText('إنشاء المخزون'))

    await waitFor(() => expect(calls.filter((c) => c.method === 'POST').length).toBe(1))
    const post = calls.find((c) => c.method === 'POST')
    expect(post.url).toBe('/api/v1/stocks')
    expect(post.body).toEqual({
      stock_type_id: 1,
      stock_type: 'gaz',
      address: 'تعز - شارع جمال بجانب جولة المسبح',
      location: { lat: 13.5795, lng: 44.0209 },
      units: [
        { name: 'اسطوانة', rate: 1, is_main: true },
        { name: 'شبك', rate: 10, is_main: false },
      ],
      stock_details: { gaz_stock_type: 'exchange' },
    })
    await waitFor(() => expect(go).toHaveBeenCalledWith(ROUTES.STOCK_DASHBOARD, { stockId: 'new-stock-1' }))
    expect(showToast).toHaveBeenCalledWith('تم إنشاء المخزون بنجاح')
  })

  it('يرفض الإرسال عند اختيار gaz دون تحديد نوع مخزون الغاز', async () => {
    const { calls } = stubTypes()
    renderWithAuth(<StockCreatePage go={vi.fn()} showToast={vi.fn()} />)

    await fillCommonFields('1')
    fireEvent.click(screen.getByText('إنشاء المخزون'))

    expect(await screen.findByText(/يرجى اختيار نوع مخزون الغاز/)).toBeTruthy()
    expect(calls.filter((c) => c.method === 'POST').length).toBe(0)
  })

  it('يخفي حقل الغاز عند اختيار نوع آخر ويرسل بدون stock_details', async () => {
    const { calls } = stubTypes()
    const go = vi.fn()

    renderWithAuth(<StockCreatePage go={go} showToast={vi.fn()} />)
    await fillCommonFields('2')

    expect(screen.queryByLabelText(/نوع مخزون الغاز/)).toBeNull()
    fireEvent.click(screen.getByText('إنشاء المخزون'))

    await waitFor(() => expect(calls.filter((c) => c.method === 'POST').length).toBe(1))
    const post = calls.find((c) => c.method === 'POST')
    expect(post.body.stock_type).toBe('water')
    expect(post.body.stock_details).toBeUndefined()
  })

  it('يرفض العنوان القصير والإحداثيات الناقصة محلياً', async () => {
    const { calls } = stubTypes()
    renderWithAuth(<StockCreatePage go={vi.fn()} showToast={vi.fn()} />)

    await screen.findByText('مياه')
    fireEvent.change(screen.getByLabelText(/نوع المخزون/), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText(/عنوان المخزون/), { target: { value: 'قصير' } })
    fireEvent.change(screen.getByPlaceholderText('مثال: حبة'), { target: { value: 'لتر' } })
    fireEvent.click(screen.getByText('إنشاء المخزون'))

    expect(await screen.findByText(/العنوان يجب أن يكون بين 10 و200 حرف/)).toBeTruthy()
    expect(screen.getByText(/يرجى تحديد إحداثيات الموقع بشكل صحيح/)).toBeTruthy()
    expect(calls.filter((c) => c.method === 'POST').length).toBe(0)
  })
})
