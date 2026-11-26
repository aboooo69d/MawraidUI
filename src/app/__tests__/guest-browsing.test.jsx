// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { STOCK, apiError, ok, stubApi } from '../../features/stock/__tests__/helpers'

vi.mock('../../features/auth/components/TurnstileWidget', () => ({
  default: ({ onVerify }) => (
    <button type="button" onClick={() => onVerify('test-token')}>Verify test challenge</button>
  ),
}))

beforeEach(() => vi.spyOn(window, 'scrollTo').mockImplementation(() => {}))
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Guest Gas browsing and order sign-in', () => {
  it('keeps guests on Gas and shows the public directory when stock reads are denied', async () => {
    const { calls } = stubApi(() => apiError(401, 1106, 'Sign in required by stock API'))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'الغاز', exact: true }))
    expect(await screen.findByRole('heading', { name: 'خدمة الغاز المنزلي' })).toBeTruthy()
    expect(await screen.findByText('تعذر عرض بيانات المخزون المباشرة للزوار حاليًا.')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'مركز مسبح للتوزيع (غاز)' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'تسجيل الدخول إلى موارد' })).toBeNull()
    expect(calls.map(({ url }) => url)).toEqual([
      '/api/v1/stocks?stock_type=gaz&in_stock=true&page=1&page_size=10',
    ])
  })

  it('resumes the selected stock and unit after consumer sign-in without submitting an order', async () => {
    const stock = { ...STOCK, location: null }
    const { calls } = stubApi(({ url, method }) => {
      if (url.startsWith('/api/v1/stocks?')) return ok([stock])
      if (url === `/api/v1/stocks/${stock.id}`) return ok(stock)
      if (url === '/api/v1/auth/login' && method === 'POST') return ok({ role_name: 'consumer', name: 'مستفيد' })
      return ok([])
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'الغاز', exact: true }))
    fireEvent.click(await screen.findByRole('button', { name: /شارع جمال/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'طلب كرتون' }))
    expect(calls.every(({ method, url }) => method === 'GET' && url.startsWith('/api/v1/stocks'))).toBe(true)

    fireEvent.change(screen.getByLabelText(/رقم الجوال المسجل/), { target: { value: '770000000' } })
    fireEvent.change(screen.getByLabelText(/كلمة المرور/, { selector: 'input' }), { target: { value: 'test-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verify test challenge' }))
    fireEvent.click(screen.getByRole('button', { name: 'تسجيل الدخول للمنصة' }))

    const order = await screen.findByRole('dialog')
    expect(within(order).getByRole('button', { name: /كرتون/ }).className).toContain('ring-2')
    expect(calls.filter(({ method }) => method === 'POST').map(({ url }) => url)).toEqual(['/api/v1/auth/login'])
  })
})
