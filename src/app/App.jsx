// ═══════════ App — التنقل وإدارة المنظومة ═══════════
import { useState } from 'react'
import { AuthProvider, useAuth } from './providers/AuthProvider'
import { ROUTES } from '../shared/constants/routes'
import { Toast } from '../shared/components/ui'
import HomePage from '../features/home/pages/HomePage'
import LoginPage from '../features/auth/pages/LoginPage'
import { RegisterConsumer, RegisterProvider } from '../features/auth/pages/RegisterPage'
import OtpPage from '../features/auth/pages/OtpPage'
import { Forgot, Reset } from '../features/auth/pages/PasswordPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'

function Shell() {
  const { user } = useAuth()
  const [screen, setScreen] = useState(ROUTES.HOME)
  const [params, setParams] = useState({})
  const [toast, setToast] = useState(null)

  const go = (s, p = {}) => {
    setParams(p)
    setScreen(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const screens = {
    [ROUTES.HOME]: <HomePage go={go} />,
    [ROUTES.LOGIN]: <LoginPage go={go} />,
    [ROUTES.REGISTER_CONSUMER]: <RegisterConsumer go={go} />,
    [ROUTES.REGISTER_PROVIDER]: <RegisterProvider go={go} />,
    [ROUTES.OTP]: <OtpPage go={go} phone={params.phone} />,
    [ROUTES.FORGOT_PASSWORD]: <Forgot go={go} />,
    [ROUTES.RESET_PASSWORD]: <Reset go={go} phone={params.phone} />,
    [ROUTES.DASHBOARD]: <DashboardPage go={go} />,
  }

  // إذا كانت هناك جلسة نشطة والمستخدم على شاشات الدخول → يتم توجيهه إلى لوحة التحكم
  const current =
    user && screen !== ROUTES.DASHBOARD && screen !== ROUTES.HOME ? ROUTES.DASHBOARD : screen

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-mawarid-700 selection:text-white">
      {screens[current] || <HomePage go={go} />}
      <Toast toast={toast} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
