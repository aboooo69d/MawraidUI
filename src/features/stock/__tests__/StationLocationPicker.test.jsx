// @vitest-environment jsdom
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import StationLocationPicker, { normalizeStationLocation } from '../components/StationLocationPicker'
import { validateCreateForm } from '../validation'

vi.mock('../components/StationLocationMap', async () => ({ default: (await import('./LocationMapStub')).default }))

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks() })

function setup(initial = null) {
  const onConfirm = vi.fn()
  const onPendingChange = vi.fn()
  function Form() {
    const [value, setValue] = useState(initial)
    return <StationLocationPicker value={value} onConfirm={(next) => { onConfirm(next); setValue(next) }} onPendingChange={onPendingChange} />
  }
  const view = render(<Form />)
  return { ...view, onConfirm, onPendingChange }
}

function gps() {
  const getCurrentPosition = vi.fn()
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
  return getCurrentPosition
}

describe('station location selection and confirmation', () => {
  it('updates read-only coordinates from selection and marker movement, then confirms', () => {
    const request = gps()
    const { onConfirm, onPendingChange } = setup()
    expect(request).not.toHaveBeenCalled()
    expect(screen.getByText('تأكيد موقع المحطة').disabled).toBe(true)
    fireEvent.click(screen.getByText('select station A'))
    expect(screen.getByLabelText(/خط العرض/).readOnly).toBe(true)
    expect(screen.getByLabelText(/خط الطول/).readOnly).toBe(true)
    expect(screen.getByLabelText(/خط العرض/).value).toBe('13.5795')
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onPendingChange).toHaveBeenLastCalledWith(true)
    fireEvent.click(screen.getByText('drag to station B'))
    expect(screen.getByLabelText(/خط الطول/).value).toBe('44.191012')
    fireEvent.click(screen.getByText('تأكيد موقع المحطة'))
    expect(onConfirm).toHaveBeenCalledWith({ lat: 15.369457, lng: 44.191012 })
    expect(onPendingChange).toHaveBeenLastCalledWith(false)
  })

  it('keeps an existing saved location until confirmation; cancel restores it', () => {
    const original = { lat: 14, lng: 45 }
    const { onConfirm } = setup(original)
    expect(screen.getByLabelText(/خط العرض/).value).toBe('14')
    fireEvent.click(screen.getByText('select station A'))
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('إلغاء التغيير'))
    expect(screen.getByLabelText(/خط العرض/).value).toBe('14')
    expect(original).toEqual({ lat: 14, lng: 45 })
    fireEvent.click(screen.getByText('drag to station B'))
    fireEvent.click(screen.getByText('تأكيد تغيير موقع المحطة'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid selections, accepts zero and validates pending changes', () => {
    setup()
    fireEvent.click(screen.getByText('invalid coordinates'))
    expect(screen.getByRole('alert').textContent).toContain('إحداثيات الموقع غير صالحة')
    expect(screen.getByLabelText(/خط العرض/).value).toBe('')
    fireEvent.click(screen.getByText('select zero'))
    fireEvent.click(screen.getByText('تأكيد موقع المحطة'))
    expect(screen.getByLabelText(/خط العرض/).value).toBe('0')
    expect(validateCreateForm({ lat: 0, lng: 0, locationPending: true }).locationError).toContain('يرجى تأكيد')
    for (const location of [null, { lat: '', lng: '' }, { lat: NaN, lng: 4 }, { lat: 91, lng: 4 }, { lat: 0, lng: 181 }]) {
      expect(normalizeStationLocation(location)).toBeNull()
    }
  })
})

describe('GPS is optional and user-initiated', () => {
  it('requests GPS only on click, populates the marker draft, and permits correction', () => {
    const request = gps()
    const { onConfirm } = setup()
    expect(request).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('تحديد موقعي الحالي (GPS)'))
    expect(request).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
    expect(screen.getByText('جارٍ تحديد الموقع…').closest('button').disabled).toBe(true)
    act(() => request.mock.calls[0][0]({ coords: { latitude: 14.12, longitude: 45.13, accuracy: 21.6 } }))
    expect(screen.getByLabelText(/خط العرض/).value).toBe('14.12')
    expect(screen.getByText(/دقة GPS التقريبية: 22 متر/)).toBeTruthy()
    expect(onConfirm).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('select station A'))
    fireEvent.click(screen.getByText('تأكيد موقع المحطة'))
    expect(onConfirm).toHaveBeenCalledWith({ lat: 13.5795, lng: 44.0209 })
  })

  it.each([[1, 'تم رفض إذن'], [2, 'تعذر استقبال'], [3, 'انتهت مهلة'], [0, 'تعذر تحديد']])('handles GPS error %i without changing the saved location', (code, message) => {
    const request = gps()
    const { onConfirm, onPendingChange } = setup({ lat: 13, lng: 44 })
    fireEvent.click(screen.getByText('تحديد موقعي الحالي (GPS)'))
    act(() => request.mock.calls[0][1]({ code }))
    expect(screen.getByRole('alert').textContent).toContain(message)
    expect(screen.getByLabelText(/خط العرض/).value).toBe('13')
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onPendingChange).toHaveBeenLastCalledWith(false)
    expect(screen.getByRole('button', { name: 'تحديد موقعي الحالي (GPS)' }).disabled).toBe(false)
  })

  it('handles unsupported GPS and synchronous failures; map remains available', () => {
    vi.stubGlobal('navigator', {})
    setup()
    fireEvent.click(screen.getByText('تحديد موقعي الحالي (GPS)'))
    expect(screen.getByRole('alert').textContent).toContain('لا يدعم')
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: () => { throw new Error('blocked') } } })
    fireEvent.click(screen.getByText('تحديد موقعي الحالي (GPS)'))
    expect(screen.getByRole('alert').textContent).toContain('تعذر تحديد')
    fireEvent.click(screen.getByText('select station A'))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('ignores a late GPS result after a newer map selection or cancellation', () => {
    const request = gps()
    setup({ lat: 13, lng: 44 })
    fireEvent.click(screen.getByText('تحديد موقعي الحالي (GPS)'))
    fireEvent.click(screen.getByText('select station A'))
    act(() => request.mock.calls[0][0]({ coords: { latitude: 18, longitude: 49 } }))
    expect(screen.getByLabelText(/خط العرض/).value).toBe('13.5795')
    fireEvent.click(screen.getByText('تحديد موقعي الحالي (GPS)'))
    fireEvent.click(screen.getByText('إلغاء التغيير'))
    act(() => request.mock.calls[1][0]({ coords: { latitude: 18, longitude: 49 } }))
    expect(screen.getByLabelText(/خط العرض/).value).toBe('13')
  })

  it('ignores callbacks after unmount and rejects invalid GPS coordinates', () => {
    const request = gps()
    const { unmount, onConfirm } = setup()
    fireEvent.click(screen.getByText('تحديد موقعي الحالي (GPS)'))
    act(() => request.mock.calls[0][0]({ coords: { latitude: 999, longitude: 44 } }))
    expect(screen.getByRole('alert').textContent).toContain('تعذر تحديد')
    fireEvent.click(screen.getByText('تحديد موقعي الحالي (GPS)'))
    unmount()
    act(() => request.mock.calls[1][0]({ coords: { latitude: 14, longitude: 44 } }))
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
