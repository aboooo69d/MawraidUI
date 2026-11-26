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

    fireEvent.click(screen.getByRole('button', { name: 'استكشاف المخزون المتاح' }))
    expect(go).toHaveBeenLastCalledWith(ROUTES.CONSUMER_STOCKS)

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
    ['provider', 'استكشاف المخزون المتاح', ROUTES.CONSUMER_STOCKS],
  ])('uses an existing destination for the %s role', (role_name, name, route) => {
    useAuth.mockReturnValue({ user: { role_name } })
    const go = vi.fn()
    render(<HomePage go={go} />)

    fireEvent.click(screen.getByRole('button', { name }))
    expect(go).toHaveBeenCalledWith(route)
  })

  it('opens Gas from the card icon and leaves upcoming cards disabled', () => {
    useAuth.mockReturnValue({ user: null })
    const go = vi.fn()
    render(<HomePage go={go} />)
    const gas = screen.getByRole('button', { name: 'الغاز', exact: true })
    for (const label of [/المياه.*قريبًا/, /الوقود.*قريبًا/]) {
      const card = screen.getByRole('button', { name: label })
      expect(card.disabled).toBe(true)
      fireEvent.click(card)
    }
    expect(go).not.toHaveBeenCalled()
    fireEvent.click(gas.querySelector('svg'))
    expect(go).toHaveBeenCalledWith(ROUTES.CONSUMER_STOCKS, { resource: 'gas' })
  })
})
