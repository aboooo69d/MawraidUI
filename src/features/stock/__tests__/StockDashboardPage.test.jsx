// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '../../../shared/constants/routes'
import StockDashboardPage from '../pages/StockDashboardPage'
import { apiError, ok, renderWithAuth, STOCK, stubApi } from './helpers'

const path = `/api/v1/stocks/me/${STOCK.id}`
afterEach(() => vi.unstubAllGlobals())

describe('StockDashboardPage', () => {
  it('يعرض أرصدة الخادم ويحدّثها ويرسل معرف المخزون إلى شاشة الحركة', async () => {
    let available = 0
    const { calls } = stubApi(({ url, method }) => {
      if (method !== 'GET' || url !== path) throw new Error(`Unexpected request: ${method} ${url}`)
      return ok({
        ...STOCK,
        available,
        balances: [{ unit_id: 11, unit: 'كرتون', amount: 7.25 }],
      })
    })
    const go = vi.fn()
    renderWithAuth(<StockDashboardPage go={go} stockId={STOCK.id} />)

    expect(screen.getByRole('status')).toBeTruthy()
    expect(await screen.findByText('7.25')).toBeTruthy()
    expect(screen.getByText('0', { exact: true })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'خريطة' }).getAttribute('href')).toContain('13.5795,44.0209')
    fireEvent.click(screen.getByRole('button', { name: /توريد/ }))
    expect(go).toHaveBeenCalledWith(ROUTES.STOCK_TRANSACTION, { direction: 'in', stockId: STOCK.id })

    available = 123
    fireEvent.click(screen.getByRole('button', { name: 'تحديث بيانات المخزون' }))
    expect(await screen.findByText('123', { exact: true })).toBeTruthy()
    expect(calls).toHaveLength(2)
  })

  it('يميز بين غياب المخزون وخطأ المسار غير المغلف', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('404 page not found', { status: 404 }))
      .mockResolvedValueOnce(apiError(404, 1600, 'stock not found'))
    vi.stubGlobal('fetch', fetchMock)
    renderWithAuth(<StockDashboardPage go={vi.fn()} stockId={STOCK.id} />)

    expect(await screen.findByText('تعذر تحميل بيانات المخزون')).toBeTruthy()
    expect(screen.queryByText('لا يوجد مخزون مسجل')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }))
    expect(await screen.findByText('لا يوجد مخزون مسجل')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'إضافة مخزون جديد' })).toBeTruthy()
  })
})
