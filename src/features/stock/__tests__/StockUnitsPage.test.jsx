// @vitest-environment jsdom
// ═══════════ اختبارات إدارة الوحدات: الإضافة والتعديل وقيود الوحدة الرئيسية ═══════════
import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import StockUnitsPage from '../pages/StockUnitsPage'
import { STOCK, json, apiError, stubApi, renderWithAuth } from './helpers'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function stubUnits(unitHandler) {
  return stubApi(({ url, method, body }) => {
    if (url.includes('/user/me/stock')) return json(STOCK)
    if (method === 'POST' && url.includes('/units')) return unitHandler({ method, url, body })
    if (method === 'PATCH' && url.includes('/units/')) return unitHandler({ method, url, body })
    return json({})
  })
}

describe('StockUnitsPage — عرض الوحدات', () => {
  it('يعرض الوحدات الرئيسية والفرعية مع المعاملات', async () => {
    stubUnits(() => json({ id: 12 }))

    renderWithAuth(<StockUnitsPage go={vi.fn()} showToast={vi.fn()} />)

    expect(await screen.findByText('حبة')).toBeTruthy()
    expect(screen.getByText('كرتون')).toBeTruthy()
    expect(screen.getByText('رئيسية')).toBeTruthy()
    expect(screen.getByText('فرعية')).toBeTruthy()
    expect(screen.getAllByText(/معامل التحويل/).length).toBe(2) // لكل وحدة معاملها
  })
})

describe('StockUnitsPage — إضافة وحدة فرعية', () => {
  it('يرسل POST مع is_main=false ويحدّث البيانات', async () => {
    const { calls } = stubUnits(() => json({ id: 12 }))
    const showToast = vi.fn()

    renderWithAuth(<StockUnitsPage go={vi.fn()} showToast={showToast} />)

    await screen.findByText('إضافة وحدة فرعية جديدة')
    fireEvent.change(screen.getByPlaceholderText('مثال: طرد'), { target: { value: 'طرد' } })
    fireEvent.change(screen.getByPlaceholderText('مثال: 24'), { target: { value: '24' } })
    fireEvent.click(screen.getByText('إضافة الوحدة'))

    await waitFor(() => expect(calls.filter((c) => c.method === 'POST').length).toBe(1))
    const post = calls.find((c) => c.method === 'POST')
    expect(post.url).toBe(`/api/v1/stocks/${STOCK.id}/units`)
    expect(post.body).toEqual({ name: 'طرد', rate: 24, is_main: false })

    // تحديث المخزون بعد النجاح
    await waitFor(() => expect(calls.filter((c) => c.url.includes('/user/me/stock')).length).toBe(2))
    expect(showToast).toHaveBeenCalledWith('تمت إضافة الوحدة بنجاح')
  })

  it('يعرض خطأ تكرار الاسم 1609 من الخادم', async () => {
    stubUnits(() => apiError(409, 1609, 'duplicate unit name'))

    renderWithAuth(<StockUnitsPage go={vi.fn()} showToast={vi.fn()} />)

    await screen.findByText('إضافة وحدة فرعية جديدة')
    fireEvent.change(screen.getByPlaceholderText('مثال: طرد'), { target: { value: 'طرد' } })
    fireEvent.change(screen.getByPlaceholderText('مثال: 24'), { target: { value: '24' } })
    fireEvent.click(screen.getByText('إضافة الوحدة'))

    expect(await screen.findByText('يوجد وحدة أخرى بنفس الاسم في هذا المخزون')).toBeTruthy()
  })

  it('يرفض الاسم المكرر محلياً دون إرسال', async () => {
    const { calls } = stubUnits(() => json({ id: 12 }))

    renderWithAuth(<StockUnitsPage go={vi.fn()} showToast={vi.fn()} />)

    await screen.findByText('إضافة وحدة فرعية جديدة')
    fireEvent.change(screen.getByPlaceholderText('مثال: طرد'), { target: { value: 'حبة' } })
    fireEvent.change(screen.getByPlaceholderText('مثال: 24'), { target: { value: '24' } })
    fireEvent.click(screen.getByText('إضافة الوحدة'))

    expect(await screen.findByText('يوجد وحدة أخرى بنفس الاسم في هذا المخزون')).toBeTruthy()
    expect(calls.filter((c) => c.method === 'POST').length).toBe(0)
  })
})

describe('StockUnitsPage — تعديل الوحدات', () => {
  it('يمنع تعديل معامل الوحدة الرئيسية (حقل معطّل بقيمة 1)', async () => {
    stubUnits(() => json({ id: 10 }))

    renderWithAuth(<StockUnitsPage go={vi.fn()} showToast={vi.fn()} />)

    await screen.findByText('حبة')
    const editBtns = screen.getAllByText('تعديل')
    fireEvent.click(editBtns[0]) // الوحدة الرئيسية أولاً

    const rateInput = await waitFor(() => document.getElementById('edit-rate-10'))
    expect(rateInput).toBeTruthy()
    expect(rateInput.disabled).toBe(true)
    expect(rateInput.value).toBe('1')
  })

  it('يعدّل وحدة فرعية (اسم + معامل) ويعيد تحميل البيانات', async () => {
    const { calls } = stubUnits(() => json({ id: 11 }))
    const showToast = vi.fn()

    renderWithAuth(<StockUnitsPage go={vi.fn()} showToast={showToast} />)

    await screen.findByText('كرتون')
    const editBtns = screen.getAllByText('تعديل')
    fireEvent.click(editBtns[1]) // كرتون

    const nameInput = await waitFor(() => document.getElementById('edit-name-11'))
    fireEvent.change(nameInput, { target: { value: 'كرتون كبير' } })
    fireEvent.change(document.getElementById('edit-rate-11'), { target: { value: '15' } })
    fireEvent.click(screen.getByText('حفظ التعديلات'))

    await waitFor(() => expect(calls.filter((c) => c.method === 'PATCH').length).toBe(1))
    const patch = calls.find((c) => c.method === 'PATCH')
    expect(patch.url).toBe(`/api/v1/stocks/${STOCK.id}/units/11`)
    expect(patch.body).toEqual({ name: 'كرتون كبير', rate: 15 })

    await waitFor(() => expect(showToast).toHaveBeenCalledWith('تم حفظ التعديلات'))
    await waitFor(() => expect(calls.filter((c) => c.url.includes('/user/me/stock')).length).toBe(2))
  })

  it('عند 1610 (وحدة مستخدمة) يسمح بتعديل الاسم فقط تلقائياً', async () => {
    let patches = 0
    const { calls } = stubUnits(({ body }) => {
      patches += 1
      if (patches === 1) {
        // الطلب الأول يغيّر المعامل → مرفوض
        expect(body.rate).toBe(15)
        return apiError(409, 1610, 'unit has transactions')
      }
      // إعادة المحاولة بالاسم فقط → مقبولة
      expect(body).toEqual({ name: 'كرتون كبير' })
      return json({ id: 11 })
    })
    const showToast = vi.fn()

    renderWithAuth(<StockUnitsPage go={vi.fn()} showToast={showToast} />)

    await screen.findByText('كرتون')
    fireEvent.click(screen.getAllByText('تعديل')[1])

    const nameInput = await waitFor(() => document.getElementById('edit-name-11'))
    fireEvent.change(nameInput, { target: { value: 'كرتون كبير' } })
    fireEvent.change(document.getElementById('edit-rate-11'), { target: { value: '15' } })
    fireEvent.click(screen.getByText('حفظ التعديلات'))

    await waitFor(() => expect(calls.filter((c) => c.method === 'PATCH').length).toBe(2))
    expect(showToast).toHaveBeenCalledWith('تم تعديل الاسم — لا يمكن تغيير معامل وحدة مستخدمة سابقاً')
  })

  it('عند 1610 بدون تغيير الاسم يعرض رسالة الخطأ', async () => {
    stubUnits(() => apiError(409, 1610, 'unit has transactions'))

    renderWithAuth(<StockUnitsPage go={vi.fn()} showToast={vi.fn()} />)

    await screen.findByText('كرتون')
    fireEvent.click(screen.getAllByText('تعديل')[1])

    const rateInput = await waitFor(() => document.getElementById('edit-rate-11'))
    fireEvent.change(rateInput, { target: { value: '15' } })
    fireEvent.click(screen.getByText('حفظ التعديلات'))

    expect(
      await screen.findByText('لا يمكن تغيير معامل وحدة تم استخدامها في حركات سابقة، يمكنك تعديل الاسم فقط')
    ).toBeTruthy()
  })
})
