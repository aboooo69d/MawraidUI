// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ROUTES } from '../../../shared/constants/routes'
import HomePage from '../pages/HomePage'
import { useAuth } from '../../auth/hooks/useAuth'

vi.mock('../../auth/hooks/useAuth', () => ({ useAuth: vi.fn() }))

describe('Mawarid homepage', () => {
  it('uses existing guest entry points and switches the district directory', () => {
    useAuth.mockReturnValue({ user: null })
    const go = vi.fn()
    render(<HomePage go={go} />)

    fireEvent.click(screen.getByRole('button', { name: 'تسجيل الدخول لاستكشاف المخزون' }))
    expect(go).toHaveBeenLastCalledWith(ROUTES.LOGIN)

    fireEvent.click(screen.getByRole('button', { name: 'إنشاء حساب' }))
    fireEvent.click(screen.getByRole('button', { name: 'وكيل / مقدم خدمة' }))
    expect(go).toHaveBeenLastCalledWith(ROUTES.REGISTER_PROVIDER)

    fireEvent.click(screen.getByRole('button', { name: 'المظفر' }))
    expect(screen.getByRole('button', { name: 'المظفر' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('نقطة توزيع صهاريج صينة')).toBeTruthy()
  })

  it.each([
    ['consumer', 'استكشاف المخزون المتاح', ROUTES.CONSUMER_STOCKS],
    ['admin', 'استكشاف المخزون المتاح', ROUTES.CONSUMER_STOCKS],
    ['provider', 'الانتقال إلى لوحة التحكم', ROUTES.DASHBOARD],
  ])('uses an existing destination for the %s role', (role_name, name, route) => {
    useAuth.mockReturnValue({ user: { role_name } })
    const go = vi.fn()
    render(<HomePage go={go} />)

    fireEvent.click(screen.getByRole('button', { name }))
    expect(go).toHaveBeenCalledWith(route)
  })

  it('applies the selected resource accent while preserving the stock destination', () => {
    useAuth.mockReturnValue({ user: { role_name: 'consumer' } })
    const go = vi.fn()
    render(<HomePage go={go} />)
    const water = screen.getByRole('button', { name: 'المياه', exact: true })
    const gas = screen.getByRole('button', { name: 'الغاز', exact: true })
    const browse = screen.getByRole('button', { name: 'استكشاف المخزون المتاح' })

    fireEvent.click(water)
    expect(water.getAttribute('aria-pressed')).toBe('true')
    expect(browse.dataset.resource).toBe('water')
    fireEvent.click(gas)
    expect(water.getAttribute('aria-pressed')).toBe('false')
    expect(gas.getAttribute('aria-pressed')).toBe('true')
    expect(browse.dataset.resource).toBe('gas')
    expect(go).not.toHaveBeenCalled()
    fireEvent.click(browse)
    expect(go).toHaveBeenCalledWith(ROUTES.CONSUMER_STOCKS)
    fireEvent.click(gas)
    expect(browse.hasAttribute('data-resource')).toBe(false)
  })
})
