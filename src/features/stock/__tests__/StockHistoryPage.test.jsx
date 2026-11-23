// @vitest-environment jsdom
// ═══════════ اختبارات سجل الحركات: العرض والفلترة والترقيم والحالات ═══════════
import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import StockHistoryPage from '../pages/StockHistoryPage'
import { STOCK, ok, apiError, stubApi, renderWithAuth } from './helpers'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

const TX_IN = {
  id: 't-in',
  amount: 5,
  unit: { id: 11, name: 'كرتون', rate: 12, is_main: false },
  is_in: true,
  description: 'توريد 5 كراتين',
  created_at: '2026-11-16T06:20:00Z',
}
const TX_OUT = {
  id: 't-out',
  amount: 3,
  unit: { id: 10, name: 'حبة', rate: 1, is_main: true },
  is_in: false,
  description: 'صرف لأسرة',
  created_at: '2026-11-16T07:00:00Z',
}

function stubHistory(listHandler) {
  return stubApi(({ url, method }) => {
    if (method === 'GET' && url === `/api/v1/stocks/me/${STOCK.id}`) return ok(STOCK)
    if (method === 'GET' && url.split('?')[0] === `/api/v1/stocks/me/${STOCK.id}/transactions`) return listHandler(url)
    throw new Error(`Unexpected request: ${method} ${url}`)
  })
}

describe('StockHistoryPage — العرض والفلترة والترقيم', () => {
  it('يعرض الحركات مع meta للترقيم', async () => {
    stubHistory(() => ok([TX_IN, TX_OUT], { page: 1, per_page: 20, total: 45, total_pages: 3 }))

    renderWithAuth(<StockHistoryPage go={vi.fn()} stockId={STOCK.id} />)

    expect(await screen.findByText('توريد 5 كراتين')).toBeTruthy()
    expect(screen.getByText('صرف لأسرة')).toBeTruthy()
    expect(screen.getAllByText('وارد').length).toBeGreaterThan(0)
    expect(screen.getAllByText('منصرف').length).toBeGreaterThan(0)
    expect(screen.getByText(/صفحة 1 من 3/)).toBeTruthy()
    expect(screen.getByText(/45 حركة/)).toBeTruthy()
  })

  it('فلتر الوارد يعيد جلب الصفحة 1 مع is_in=true ويعرض النتائج المفلترة', async () => {
    const { calls } = stubHistory((url) =>
      url.includes('is_in=true') ? ok([TX_IN], { page: 1, per_page: 20, total: 1, total_pages: 1 }) : ok([TX_IN, TX_OUT], { page: 1, per_page: 20, total: 45, total_pages: 3 })
    )

    renderWithAuth(<StockHistoryPage go={vi.fn()} stockId={STOCK.id} />)
    await screen.findByText('صرف لأسرة')

    fireEvent.click(screen.getByText('الوارد فقط'))

    expect(await screen.findByText(/صفحة 1 من 1/)).toBeTruthy()
    const historyCalls = calls.filter((c) => c.url.includes('/transactions'))
    const last = historyCalls[historyCalls.length - 1]
    expect(last.url).toContain('is_in=true')
    expect(last.url).toContain('page=1')
    await waitFor(() => expect(screen.queryByText('صرف لأسرة')).toBeNull())
  })

  it('زر التالي يجلب الصفحة 2', async () => {
    const { calls } = stubHistory((url) =>
      url.includes('page=2')
        ? ok([TX_OUT], { page: 2, per_page: 20, total: 45, total_pages: 3 })
        : ok([TX_IN], { page: 1, per_page: 20, total: 45, total_pages: 3 })
    )

    renderWithAuth(<StockHistoryPage go={vi.fn()} stockId={STOCK.id} />)
    await screen.findByText('توريد 5 كراتين')

    fireEvent.click(screen.getByText('التالي'))

    expect(await screen.findByText('صرف لأسرة')).toBeTruthy()
    expect(calls.filter((c) => c.url.includes('page=2')).length).toBe(1)
    expect(screen.getByText(/صفحة 2 من 3/)).toBeTruthy()
  })

  it('يعرض حالة فارغة عند عدم وجود حركات', async () => {
    stubHistory(() => ok([], { page: 1, per_page: 20, total: 0, total_pages: 0 }))

    renderWithAuth(<StockHistoryPage go={vi.fn()} stockId={STOCK.id} />)

    expect(await screen.findByText('لا توجد حركات مسجلة')).toBeTruthy()
    expect(screen.getByText(/ستظهر هنا حركات التوريد/)).toBeTruthy()
  })

  it('يعرض خطأ الخادم مع إعادة محاولة (لا نتائج وهمية)', async () => {
    stubHistory(() => apiError(500, 5000, 'server error'))

    renderWithAuth(<StockHistoryPage go={vi.fn()} stockId={STOCK.id} />)

    expect(await screen.findByText('تعذر تحميل بيانات المخزون')).toBeTruthy()
    expect(screen.queryByText('لا توجد حركات مسجلة')).toBeNull()
  })

  it('يتجاهل الاستجابة القديمة عند تغيير الفلتر بسرعة', async () => {
    stubHistory((url) => {
      if (url.includes('is_in=true')) return ok([TX_IN], { page: 1, per_page: 20, total: 1, total_pages: 1 })
      // الاستجابة الأصلية (الكل) متأخرة — يجب ألا تُظهر بعد الفلترة
      return new Promise((resolve) =>
        setTimeout(() => resolve(ok([TX_OUT], { page: 1, per_page: 20, total: 1, total_pages: 1 })), 150)
      )
    })

    renderWithAuth(<StockHistoryPage go={vi.fn()} stockId={STOCK.id} />)
    await screen.findByText('الوارد فقط')

    fireEvent.click(screen.getByText('الوارد فقط'))

    expect(await screen.findByText('توريد 5 كراتين')).toBeTruthy()
    await new Promise((r) => setTimeout(r, 250)) // ننتظر انتهاء الاستجابة القديمة
    expect(screen.queryByText('صرف لأسرة')).toBeNull() // لم تتجاوز القديمة الجديدة
    expect(screen.getByText('توريد 5 كراتين')).toBeTruthy()
  })
})


it('يسمح بالرجوع إلى الصفحة السابقة عند فراغ الصفحة التالية', async () => {
  const { calls } = stubHistory((url) => url.includes('page=2')
    ? ok([], { page: 2, per_page: 20, total: 20, total_pages: 1 })
    : ok([TX_IN], { page: 1, per_page: 20, total: 21, total_pages: 2 })
  )
  renderWithAuth(<StockHistoryPage go={vi.fn()} stockId={STOCK.id} />)
  await screen.findByText(TX_IN.description)
  fireEvent.click(screen.getByRole('button', { name: 'التالي' }))

  expect(await screen.findByText('لا توجد حركات مسجلة')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'التالي' }).disabled).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'السابق' }))
  expect(await screen.findByText(TX_IN.description)).toBeTruthy()
  expect(calls.filter(({ url }) => url.includes('page=1'))).toHaveLength(2)
})
