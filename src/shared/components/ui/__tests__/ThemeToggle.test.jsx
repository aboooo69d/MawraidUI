// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from '../ThemeToggle'

describe('Mawarid appearance', () => {
  let system

  beforeEach(() => {
    system = Object.assign(new EventTarget(), { matches: true })
    vi.stubGlobal('matchMedia', vi.fn(() => system))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('follows the system preference until the user selects a theme', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: 'الوضع الداكن' })

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(button.getAttribute('aria-pressed')).toBe('true')

    system.matches = false
    fireEvent(system, new Event('change'))
    expect(document.documentElement.dataset.theme).toBe('light')

    fireEvent.click(button)
    expect(localStorage.getItem('mawarid-theme')).toBe('dark')
    fireEvent(system, new Event('change'))
    expect(button.getAttribute('aria-pressed')).toBe('true')
  })

  it('restores a saved preference when another screen mounts its theme control', () => {
    localStorage.setItem('mawarid-theme', 'light')
    const { unmount } = render(<ThemeToggle />)
    expect(document.documentElement.dataset.theme).toBe('light')

    unmount()
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'الوضع الداكن' }).getAttribute('aria-pressed')).toBe('false')
  })
})
