// ═══════════ Auth Context — حالة الجلسة والمستخدم ═══════════
import { createContext, useCallback, useContext, useState } from 'react'
import { authApi } from '../../services/api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const clearSession = useCallback(() => setUser(null), [])

  async function login(phone, password, turnstileToken) {
    const u = await authApi.login(phone, password, turnstileToken)
    setUser(u)
    return u
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {}
    clearSession()
  }

  return <AuthCtx.Provider value={{ user, login, logout, clearSession }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
