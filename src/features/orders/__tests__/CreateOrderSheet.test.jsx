// @vitest-environment jsdom
// ═══════════ اختبارات النافذة السفلية لإنشاء الطلب (CreateOrderSheet) ═══════════
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import CreateOrderSheet from '../components/CreateOrderSheet'

vi.mock('../../auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { role_name: 'consumer', name: 'أحمد العبسي' },
  }),
}))

const SAMPLE_STOCK = {
  id: 'e4226f8b-f41e-42ef-8ba0-04470295cb45',
  available: 85,
  address: 'تعز - شارع جمال',
  type: { id: 1, name: 'غاز منزلي', slug: 'gaz' },
  units: [
    { id: 1, name: 'أسطوانة', rate: 1, price: 7500, is_main: true },
    { id: 2, name: 'ربطة 5 أسطوانات', rate: 5, price: 36000, is_main: false },
  ],
  balances: [
    { unit_id: 1, unit: 'أسطوانة', amount: 85 },
    { unit_id: 2, unit: 'ربطة 5 أسطوانات', amount: 17 },
  ],
}

const SAMPLE_ADDRESSES = [
  {
    id: 'addr-1',
    title: 'المنزل',
    description: 'حي المسبح، تعز',
    location: { lat: 13.5795, lng: 44.0209 },
    is_default: true,
  },
]

const jsonResponse = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('CreateOrderSheet', () => {
  it('يعرض الوحدات والعناوين ويحسب السعر الإجمالي ويرسل طلب الإنشاء بنجاح', async () => {
    const createdOrder = {
      id: 'ord-1',
      order_number: 'ORD-20261124-A1B2C3D4',
      quantity: 2,
      unit_name: 'أسطوانة',
      total_price: 15000,
      status: 'pending',
    }

    const fetchMock = vi.fn(async (url, opts) => {
      if (url === '/api/v1/addresses/me') {
        return jsonResponse({ success: true, data: SAMPLE_ADDRESSES })
      }
      if (url === '/api/v1/orders' && opts?.method === 'POST') {
        return jsonResponse({ success: true, data: createdOrder })
      }
      return jsonResponse({ success: false }, 404)
    })
    vi.stubGlobal('fetch', fetchMock)

    const onSuccess = vi.fn()
    render(
      <CreateOrderSheet
        open
        stock={SAMPLE_STOCK}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />
    )

    // انتظار تحميل العناوين
    await waitFor(() => {
      expect(screen.getByText('المنزل')).toBeTruthy()
    })

    // زيادة الكمية إلى 2 والتحقق من الإجمالي (2 × 7500 = 15,000)
    fireEvent.click(screen.getByLabelText('زيادة الكمية'))
    expect(screen.getByText('15,000')).toBeTruthy()

    // إضافة ملاحظة وإرسال النموذج
    fireEvent.change(screen.getByLabelText(/ملاحظات للمزود/), {
      target: { value: 'الاتصال عند الوصول' },
    })

    fireEvent.click(screen.getByText('تأكيد وإنشاء الطلب'))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(createdOrder)
    })

    const postCall = fetchMock.mock.calls.find(([url]) => url === '/api/v1/orders')
    expect(postCall).toBeTruthy()
    expect(JSON.parse(postCall[1].body)).toEqual({
      stock_id: SAMPLE_STOCK.id,
      unit_id: 1,
      quantity: 2,
      address_id: 'addr-1',
      consumer_type: 'home',
      notes: 'الاتصال عند الوصول',
    })
  })

  it('يعرض رسالة الخطأ العربية عند رفض الخادم لصفة المستفيد (1803)', async () => {
    const fetchMock = vi.fn(async (url) => {
      if (url === '/api/v1/addresses/me') {
        return jsonResponse({ success: true, data: SAMPLE_ADDRESSES })
      }
      return jsonResponse(
        { success: false, error: { code: 1803, message: 'consumer_type not enabled' } },
        403
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <CreateOrderSheet
        open
        stock={SAMPLE_STOCK}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('المنزل')).toBeTruthy()
    })

    fireEvent.click(screen.getByText('نشاط تجاري'))
    fireEvent.click(screen.getByText('تأكيد وإنشاء الطلب'))

    await waitFor(() => {
      expect(screen.getByText('صفة المستفيد المختارة غير مفعّلة في ملف حسابك')).toBeTruthy()
    })
  })
})
