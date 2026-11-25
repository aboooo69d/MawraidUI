import { useEffect, useState } from 'react'
import { Icons } from '../icons'

const STORAGE_KEY = 'mawarid-theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'
const isTheme = (value) => value === 'dark' || value === 'light'

let localPreference

function readPreference() {
  if (localPreference) return localPreference
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return undefined
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')

  function applyTheme(value) {
    document.documentElement.dataset.theme = value
    setTheme(value)
  }

  useEffect(() => {
    const system = window.matchMedia?.(DARK_QUERY)
    function syncTheme() {
      const preference = readPreference()
      applyTheme(isTheme(preference) ? preference : system?.matches ? 'dark' : 'light')
    }

    syncTheme()
    system?.addEventListener('change', syncTheme)
    window.addEventListener('storage', syncTheme)
    return () => {
      system?.removeEventListener('change', syncTheme)
      window.removeEventListener('storage', syncTheme)
    }
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(STORAGE_KEY, next)
      localPreference = undefined
    } catch {
      localPreference = next
    }
    applyTheme(next)
  }

  const Icon = theme === 'dark' ? Icons.Sun : Icons.Moon
  return (
    <button
      type="button"
      className="mw-button mw-button-secondary mw-icon-button shrink-0"
      onClick={toggleTheme}
      aria-label="الوضع الداكن"
      aria-pressed={theme === 'dark'}
      title={theme === 'dark' ? 'تفعيل المظهر الفاتح' : 'تفعيل المظهر الداكن'}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
    </button>
  )
}
