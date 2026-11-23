// @vitest-environment jsdom
// ═══════════ اختبارات حركات المخزون: وارد/منصرف + نفاد الرصيد + منع التكرار ═══════════
import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import StockTransactionPage from '../pages/StockTransactionPage'
import { ROUTES } from '../../../shared/constants/routes'
import { STOCK, ok, apiError, stubApi, renderWithAuth } from './helpers'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function stubTx(postHandler) {
  return stubApi(({ url, method, body }) => {
    if (method === 'GET' && url === `/api/v1/stocks/me/${STOCK.id}`) return ok(STOCK)
    if (method === 'POST' && url === `/api/v1/stocks/me/${STOCK.id}/transactions`) return postHandler(body)
    throw new Error(`Unexpected request: ${method} ${url}`)
  })
}

const fillForm = () => {
  fireEvent.change(screen.getByLabelText(/^الوحدة/), { target: { value: '11' } })
  fireEvent.change(screen.getByPlaceholderText('مثال: 5'), { target: { value: '5' } })
}

describe('StockTransactionPage — حركة وارد', () => {
  it('يعرض نموذج الوارد ويرسل is_in=true وينتقل للوحة بعد النجاح', async () => {
    const { calls } = stubTx(() => ok({ id: 't1' }))
    const go = vi.fn()
    const showToast = vi.fn()

    renderWithAuth(<StockTransactionPage go={go} showToast={showToast} stockId={STOCK.id} direction="in" />)

    expect(await screen.findByText('إضافة كمية (وارد)')).toBeTruthy()
    fillForm()
    fireEvent.click(screen.getByText('تأكيد الإضافة'))

    await waitFor(() => expect(calls.filter((c) => c.method === 'POST').length).toBe(1))
    const post = calls.find((c) => c.method === 'POST')
    expect(post.url).toBe(`/api/v1/stocks/me/${STOCK.id}/transactions`)
    expect(post.body).toEqual({ amount: 5, unit_id: 11, is_in: true })

    await waitFor(() => expect(go).toHaveBeenCalledWith(ROUTES.STOCK_DASHBOARD, { stockId: STOCK.id }))
    expect(showToast).toHaveBeenCalledWith('تمت إضافة الكمية بنجاح')
  })

  it('يرفض كمية غير موجبة صحيحة محلياً', async () => {
    const { calls } = stubTx(() => ok({ id: 't1' }))
    renderWithAuth(<StockTransactionPage go={vi.fn()} showToast={vi.fn()} stockId={STOCK.id} direction="in" />)

    await screen.findByText('إضافة كمية (وارد)')
    fireEvent.change(screen.getByLabelText(/^الوحدة/), { target: { value: '11' } })
    fireEvent.change(screen.getByPlaceholderText('مثال: 5'), { target: { value: '0' } })
    fireEvent.click(screen.getByText('تأكيد الإضافة'))

    expect(await screen.findByText(/أكبر من صفر/)).toBeTruthy()
    expect(calls.filter((c) => c.method === 'POST').length).toBe(0)
  })

  it('يمنع الإرسال المزدوج (نقرتان → طلب واحد)', async () => {
    const { calls } = stubTx(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(ok({ id: 't1' })), 50)
        )
    )
    renderWithAuth(<StockTransactionPage go={vi.fn()} showToast={vi.fn()} stockId={STOCK.id} direction="in" />)

    await screen.findByText('إضافة كمية (وارد)')
    fillForm()
    const btn = screen.getByText('تأكيد الإضافة')
    fireEvent.click(btn)
    fireEvent.click(btn) // نقرة ثانية سريعة — الزر معطّل

    await waitFor(() => expect(calls.filter((c) => c.method === 'POST').length).toBe(1), { timeout: 1000 })
    await waitFor(() => expect(calls.filter((c) => c.method === 'POST').length).toBe(1), { timeout: 200 })
  })
})

describe('StockTransactionPage — حركة منصرف', () => {
  it('يعرض نموذج المنصرف ويرسل is_in=false', async () => {
    const { calls } = stubTx(() => ok({ id: 't2' }))
    const go = vi.fn()

    renderWithAuth(<StockTransactionPage go={go} showToast={vi.fn()} stockId={STOCK.id} direction="out" />)

    expect(await screen.findByText('سحب كمية (منصرف)')).toBeTruthy()
    fillForm()
    fireEvent.click(screen.getByText('تأكيد السحب'))

    await waitFor(() => expect(calls.filter((c) => c.method === 'POST').length).toBe(1))
    expect(calls.find((c) => c.method === 'POST').body).toEqual({
      amount: 5,
      unit_id: 11,
      is_in: false,
    })
    await waitFor(() => expect(go).toHaveBeenCalledWith(ROUTES.STOCK_DASHBOARD, { stockId: STOCK.id }))
  })

  it('يعرض رسالة نفاد الرصيد 1602 دون نجاح وهمي', async () => {
    const { calls } = stubTx(() => apiError(409, 1602, 'insufficient stock'))
    const go = vi.fn()
    const showToast = vi.fn()

    renderWithAuth(<StockTransactionPage go={go} showToast={showToast} stockId={STOCK.id} direction="out" />)

    await screen.findByText('سحب كمية (منصرف)')
    fillForm()
    fireEvent.click(screen.getByText('تأكيد السحب'))

    expect(await screen.findByText('الكمية المطلوبة غير متوفرة في المخزون')).toBeTruthy()
    expect(go).not.toHaveBeenCalled()
    expect(showToast).not.toHaveBeenCalled()
    expect(calls.filter((c) => c.method === 'POST').length).toBe(1)
  })

  it('يعيد التوجيه للوحة عند اتجاه غير صالح', async () => {
    stubTx(() => ok({}))
    const go = vi.fn()

    renderWithAuth(<StockTransactionPage go={go} showToast={vi.fn()} stockId={STOCK.id} direction="sideways" />)

    await waitFor(() => expect(go).toHaveBeenCalledWith(ROUTES.STOCK_DASHBOARD, { stockId: STOCK.id }))
  })
})
