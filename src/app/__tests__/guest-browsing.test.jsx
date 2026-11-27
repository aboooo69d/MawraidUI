// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { addressesApi } from '../../services/api'
import { STOCK, STOCK_WATER, apiError, ok, stubApi } from '../../features/stock/__tests__/helpers'

vi.mock('../../features/auth/components/TurnstileWidget', () => ({
  default: ({ onVerify }) => (
    <button type="button" onClick={() => onVerify('test-token')}>Verify test challenge</button>
  ),
}))

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  addressesApi.clearDefaultAddressCache()
})

function openGas() {
  fireEvent.click(screen.getByRole('button', { name: 'الغاز', exact: true }))
}

function signIn() {
  fireEvent.change(screen.getByLabelText(/رقم الجوال المسجل/), { target: { value: '770000000' } })
  fireEvent.change(screen.getByLabelText(/كلمة المرور/, { selector: 'input' }), { target: { value: 'test-password' } })
  fireEvent.click(screen.getByRole('button', { name: 'Verify test challenge' }))
  fireEvent.click(screen.getByRole('button', { name: 'تسجيل الدخول للمنصة' }))
}
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Guest Gas browsing and order sign-in', () => {
  it('reports anonymous authorization separately, then returns to Gas after sign-in', async () => {
    const { calls } = stubApi(({ url, method }) => {
      if (url === '/api/v1/auth/login' && method === 'POST') return ok({ role_name: 'consumer' })
      if (url === '/api/v1/addresses/me/default') return apiError(404, 1700, 'No default')
      if (url === '/api/v1/addresses/me') return ok([])
      const signedIn = calls.some((call) => call.method === 'POST')
      return signedIn ? ok([STOCK]) : apiError(401, 1106, 'Sign in required')
    })

    render(<App />)
    openGas()
    expect(screen.getByRole('heading', { name: 'خدمة الغاز المنزلي' })).toBeTruthy()
    expect((await screen.findByRole('alert')).textContent).toContain('يتطلّب عرض المخزون المباشر تسجيل الدخول حاليًا.')
    expect(calls.map(({ url }) => url)).toEqual(['/api/v1/stocks?in_stock=true&page=1&page_size=100'])
    expect(screen.queryByText('لا يوجد مخزون متاح حالياً')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'تسجيل الدخول', exact: true }))
    signIn()
    expect(await screen.findByRole('button', { name: /شارع جمال/ })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'خدمة الغاز المنزلي' })).toBeTruthy()
  })

  it('shows guest stock, filters Gas across backend pages, and displays only public supplier details', async () => {
    const alias = {
      ...STOCK,
      id: 'gas-alias',
      address: 'تعز - الحصب',
      type: { ...STOCK.type, id: 14, slug: 'gas' },
      supplier: { display_name: 'مورد الحصب', phone: 'PRIVATE_PHONE' },
      location: null,
    }
    const { calls } = stubApi(({ url }) => {
      if (url.includes('page=1')) return ok([STOCK_WATER, STOCK], { total_pages: 2 })
      if (url.includes('page=2')) return ok([alias], { total_pages: 2 })
      if (url === '/api/v1/stocks/gas-alias') return ok(alias)
      return apiError(404, 0, 'Unexpected request')
    })

    render(<App />)
    openGas()
    expect(await screen.findByRole('button', { name: /شارع جمال/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /حوض الأشراف/ })).toBeNull()
    expect(screen.getByText('عدد النتائج: 2')).toBeTruthy()
    const card = screen.getByRole('button', { name: /مورد الحصب/ })
    expect(within(card).getByText('7,500')).toBeTruthy()
    expect(within(card).getByText('120')).toBeTruthy()
    expect(card.dataset.resource).toBe('gas')
    fireEvent.click(card)
    expect(await screen.findByRole('heading', { name: 'مورد الحصب' })).toBeTruthy()
    expect(screen.queryByText('PRIVATE_PHONE')).toBeNull()
    expect(screen.queryByText('الطلبات قيد الانتظار')).toBeNull()
    expect(calls.map(({ url }) => url)).toEqual([
      '/api/v1/stocks?in_stock=true&page=1&page_size=100',
      '/api/v1/stocks?in_stock=true&page=2&page_size=100',
      '/api/v1/stocks/gas-alias',
    ])
  })

  it('paginates the filtered Gas results without fetching the catalog again', async () => {
    const listings = Array.from({ length: 11 }, (_, index) => ({
      ...STOCK,
      id: `gas-${index}`,
      address: `نقطة التوزيع رقم ${index + 1}`,
    }))
    const { calls } = stubApi(() => ok(listings, { total_pages: 1 }))
    render(<App />)
    openGas()
    expect(await screen.findByText('صفحة 1 من 2')).toBeTruthy()
    expect(screen.queryByText('نقطة التوزيع رقم 11')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'التالي' }))
    expect(screen.getByText('نقطة التوزيع رقم 11')).toBeTruthy()
    expect(screen.getByText('صفحة 2 من 2')).toBeTruthy()
    expect(calls).toHaveLength(1)
  })

  it('preserves general authenticated stock discovery and location filters', async () => {
    const address = { id: 'home-1', title: 'المنزل', is_default: true, location: { lat: 13.58, lng: 44.02 } }
    const { calls } = stubApi(({ url }) => {
      if (url === '/api/v1/auth/login') return ok({ role_name: 'consumer', name: 'مستفيد' })
      if (url === '/api/v1/addresses/me/default') return ok(address)
      if (url === '/api/v1/addresses/me') return ok([address])
      if (url === '/api/v1/stocks/types') return apiError(403, 1107, 'Restricted')
      if (url.startsWith('/api/v1/stocks?')) return ok([STOCK, STOCK_WATER])
      return ok([])
    })

    render(<App />)
    fireEvent.click(within(screen.getByRole('navigation', { name: 'روابط الحساب' }))
      .getByRole('button', { name: 'تسجيل الدخول' }))
    signIn()
    fireEvent.click(await screen.findByRole('button', { name: /استكشاف المخزون المتاح/ }))
    expect(await screen.findByRole('button', { name: /حوض الأشراف/ })).toBeTruthy()
    expect(screen.getByText('المنزل')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('نطاق المسافة'), { target: { value: '5' } })
    await waitFor(() => expect(calls.some(({ url }) => url.includes('lat=13.58&lng=44.02&max_distance=5000'))).toBe(true))
  })

  it('shows skeletons, then a network error, then a successful empty state after retry', async () => {
    let rejectRead
    const pending = new Promise((_, reject) => { rejectRead = reject })
    let attempt = 0
    stubApi(() => ++attempt === 1 ? pending : ok([]))

    render(<App />)
    openGas()
    expect(screen.getByText('جارٍ البحث عن المخزون المتاح…')).toBeTruthy()
    expect(screen.queryByText('لا يوجد مخزون متاح حالياً')).toBeNull()
    rejectRead(new TypeError('Failed to fetch'))
    expect((await screen.findByRole('alert')).textContent).toContain('تعذّر الاتصال بخدمة المخزون')
    fireEvent.click(screen.getByRole('button', { name: 'إعادة المحاولة' }))
    expect(await screen.findByRole('heading', { name: 'لا يوجد مخزون متاح حالياً' })).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
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

    expect(screen.getByText('سجّل الدخول بحساب مستفيد لمتابعة إنشاء طلبك.')).toBeTruthy()
    signIn()

    const order = await screen.findByRole('dialog')
    expect(within(order).getByRole('button', { name: /كرتون/ }).className).toContain('ring-2')
    expect(calls.filter(({ method }) => method === 'POST').map(({ url }) => url)).toEqual(['/api/v1/auth/login'])
  })
})
