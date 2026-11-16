// ═══════════ Auth Context — حالة الجلسة والمستخدم ═══════════
import { createContext, useContext, useState } from 'react'
import { authApi } from './api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  async function login(phone, password, turnstileToken) {
    const u = await authApi.login(phone, password, turnstileToken)
    setUser(u)
    return u
  }
  async function logout() {
    try { await authApi.logout() } catch {}
    setUser(null)
  }
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
