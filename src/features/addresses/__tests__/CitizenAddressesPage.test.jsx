// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CitizenAddressesPage from '../pages/CitizenAddressesPage'
import { apiError, HOME, OFFICE, ok } from './fixtures'

vi.mock('../../../shared/components/ui/LocationPicker', () => ({
  default: ({ onChange }) => (
    <>
      <button type="button" onClick={() => onChange(0, 0)}>اختيار نقطة</button>
      <button type="button" onClick={() => onChange(OFFICE.location.lat, OFFICE.location.lng)}>سحب العلامة</button>
    </>
  ),
}))

beforeEach(() => vi.spyOn(window, 'scrollTo').mockImplementation(() => {}))
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const click = (name) => fireEvent.click(screen.getByRole('button', { name }))
const fill = (name, value) => fireEvent.change(screen.getByRole('textbox', { name }), { target: { value } })

function renderCitizen(fetchMock) {
  vi.stubGlobal('fetch', fetchMock)
  const props = { go: vi.fn(), showToast: vi.fn(), onSessionExpired: vi.fn() }
  render(<CitizenAddressesPage {...props} />)
  return props
}

async function openForm() {
  fireEvent.click(await screen.findByRole('button', { name: 'إضافة عنوان' }))
}

describe('citizen address UI with mocked HTTP and map events', () => {
  it('requires confirmation, invalidates it after a drag, and displays the first backend-selected default', async () => {
    const gps = { getCurrentPosition: vi.fn() }
    vi.stubGlobal('navigator', { geolocation: gps })
    const saved = { ...OFFICE, title: '', is_default: true }
    const fetchMock = vi.fn().mockResolvedValueOnce(ok([])).mockResolvedValueOnce(ok(saved)).mockResolvedValueOnce(ok([saved]))
    const { showToast } = renderCitizen(fetchMock)

    expect(screen.getByRole('status').textContent).toContain('جارٍ تحميل العناوين')
    expect(await screen.findByText(/لا توجد عناوين محفوظة/)).toBeTruthy()
    await openForm()
    expect(gps.getCurrentPosition).not.toHaveBeenCalled()
    expect(screen.getByText(/سيُحفظ عنوانك الأول تلقائياً/)).toBeTruthy()
    expect(screen.queryByRole('checkbox')).toBeNull()

    click('حفظ العنوان')
    expect(screen.getByText('أدخل وصف العنوان.')).toBeTruthy()
    fill(/وصف العنوان/, '  ' + saved.description + '  ')
    click('اختيار نقطة')
    click('حفظ العنوان')
    expect(screen.getByText('حدد موقعاً على الخريطة ثم أكّده.')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    click('تأكيد الموقع')
    expect(screen.getByText('تم تأكيد الموقع')).toBeTruthy()
    click('سحب العلامة')
    click('حفظ العنوان')
    expect(screen.getByText('الموقع المحدد بانتظار التأكيد')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    click('تأكيد الموقع')
    click('حفظ العنوان')
    expect(await screen.findByText('الافتراضي')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'عنوان محفوظ' })).toBeTruthy()
    expect(fetchMock.mock.calls.map(([url, opts]) => [url, opts.method])).toEqual([
      ['/api/v1/addresses/me', 'GET'],
      ['/api/v1/addresses/me', 'POST'],
      ['/api/v1/addresses/me', 'GET'],
    ])
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      description: saved.description, location: saved.location, is_default: false,
    })
    expect(showToast).toHaveBeenCalledWith('تم حفظ العنوان الافتراضي.')
  })

  it('opts in to replacing the default and uses the refreshed flags to render the list and its details', async () => {
    const newDefault = { ...OFFICE, is_default: true }
    const formerDefault = { ...HOME, is_default: false }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(ok([HOME]))
      .mockResolvedValueOnce(ok(newDefault))
      .mockResolvedValueOnce(ok([newDefault, formerDefault]))
      .mockResolvedValueOnce(ok(newDefault))
      .mockResolvedValueOnce(ok([newDefault, formerDefault]))
      .mockResolvedValueOnce(ok(formerDefault))
    renderCitizen(fetchMock)
    await openForm()

    expect(screen.getByText('العنوان الافتراضي الحالي').textContent).toContain(HOME.title)
    const checkbox = screen.getByRole('checkbox', { name: 'تعيين كعنوان افتراضي' })
    expect(checkbox.checked).toBe(false)
    fireEvent.click(checkbox)
    fill(/اسم العنوان/, '  ' + OFFICE.title + '  ')
    fill(/وصف العنوان/, OFFICE.description)
    click('سحب العلامة')
    click('تأكيد الموقع')
    click('حفظ العنوان')

    await screen.findByText(OFFICE.title)
    const [first, second] = screen.getAllByRole('article')
    expect(within(first).getByText('الافتراضي')).toBeTruthy()
    expect(within(second).queryByText('الافتراضي')).toBeNull()
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      title: OFFICE.title, description: OFFICE.description, location: OFFICE.location, is_default: true,
    })

    click('عرض العنوان الافتراضي')
    expect(await screen.findByText(OFFICE.description)).toBeTruthy()
    expect(fetchMock.mock.calls[3][0]).toBe('/api/v1/addresses/me/default')
    click('عناويني')
    fireEvent.click(await screen.findByRole('button', { name: 'عرض التفاصيل' }))
    expect(await screen.findByText(HOME.description)).toBeTruthy()
    expect(fetchMock.mock.calls[5][0]).toBe('/api/v1/addresses/me/' + HOME.id)
  })

  it('requests GPS only on demand and requires confirmation of GPS coordinates', async () => {
    const gps = { getCurrentPosition: vi.fn() }
    vi.stubGlobal('navigator', { geolocation: gps })
    const fetchMock = vi.fn().mockResolvedValue(ok([]))
    renderCitizen(fetchMock)
    await openForm()

    expect(gps.getCurrentPosition).not.toHaveBeenCalled()
    click('استخدام موقعي الحالي')
    expect(gps.getCurrentPosition).toHaveBeenCalledTimes(1)
    const [accept] = gps.getCurrentPosition.mock.calls[0]
    act(() => accept({ coords: { latitude: 0, longitude: 0 } }))
    expect(screen.getByText('الموقع المحدد بانتظار التأكيد')).toBeTruthy()
    expect(screen.getByText('0, 0')).toBeTruthy()
    fill(/وصف العنوان/, HOME.description)
    click('حفظ العنوان')
    expect(screen.getByText('حدد موقعاً على الخريطة ثم أكّده.')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    click('تأكيد الموقع')
    expect(screen.getByText('تم تأكيد الموقع')).toBeTruthy()
  })

  it('shows denied GPS access and ignores an earlier GPS response after a manual selection', async () => {
    const gps = { getCurrentPosition: vi.fn() }
    vi.stubGlobal('navigator', { geolocation: gps })
    renderCitizen(vi.fn().mockResolvedValue(ok([])))
    await openForm()
    click('استخدام موقعي الحالي')
    const [, deny] = gps.getCurrentPosition.mock.calls[0]
    act(() => deny({ code: 1 }))
    expect(screen.getByRole('alert').textContent).toContain('لم يتم السماح')

    click('استخدام موقعي الحالي')
    const [accept] = gps.getCurrentPosition.mock.calls[1]
    click('سحب العلامة')
    act(() => accept({ coords: { latitude: 0, longitude: 0 } }))
    expect(screen.getByText('13.5811, 44.0152')).toBeTruthy()
    expect(screen.queryByText('0, 0')).toBeNull()
  })

  it('retries a failed list, preserves a rejected form and sends expired sessions to login', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(apiError(500, 5000))
      .mockResolvedValueOnce(ok([HOME]))
      .mockResolvedValueOnce(apiError(400, 2000))
      .mockResolvedValueOnce(apiError(401, 1106))
    const { onSessionExpired, showToast } = renderCitizen(fetchMock)

    expect((await screen.findByRole('alert')).textContent).toContain('خطأ في الخادم')
    click('إعادة المحاولة')
    await openForm()
    fill(/وصف العنوان/, OFFICE.description)
    click('سحب العلامة')
    click('تأكيد الموقع')
    click('حفظ العنوان')

    expect((await screen.findByRole('alert')).textContent).toContain('تحقق من الحقول')
    expect(screen.getByRole('textbox', { name: /وصف العنوان/ }).value).toBe(OFFICE.description)
    expect(screen.getByText('تم تأكيد الموقع')).toBeTruthy()
    click('حفظ العنوان')
    await waitFor(() => expect(onSessionExpired).toHaveBeenCalledTimes(1))
    expect(showToast).not.toHaveBeenCalled()
    expect(JSON.parse(fetchMock.mock.calls[2][1].body).is_default).toBe(false)
  })

  it('renders forbidden access using the Nova code and keeps the add form unavailable', async () => {
    const { onSessionExpired } = renderCitizen(vi.fn().mockResolvedValue(apiError(403, 1107)))

    expect((await screen.findByRole('alert')).textContent).toContain('ليس لديك صلاحية')
    expect(screen.queryByRole('button', { name: 'إضافة عنوان' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'إعادة المحاولة' })).toBeNull()
    expect(onSessionExpired).not.toHaveBeenCalled()
  })
})
