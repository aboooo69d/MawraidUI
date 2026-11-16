// ═══════════ App — التنقل وإدارة المنظومة ═══════════
import { useState } from 'react'
import { AuthProvider, useAuth } from './auth'
import Home from './screens/Home'
import Login from './screens/Login'
import { RegisterConsumer, RegisterProvider } from './screens/Register'
import Otp from './screens/Otp'
import { Forgot, Reset } from './screens/Password'
import Dashboard from './screens/Dashboard'
import { Toast } from './ui'

function Shell() {
  const { user } = useAuth()
  const [screen, setScreen] = useState('home')
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
    home: <Home go={go} />,
    login: <Login go={go} />,
    'register-consumer': <RegisterConsumer go={go} />,
    'register-provider': <RegisterProvider go={go} />,
    otp: <Otp go={go} phone={params.phone} />,
    forgot: <Forgot go={go} />,
    reset: <Reset go={go} phone={params.phone} />,
    dashboard: <Dashboard go={go} />,
  }

  // إذا كانت هناك جلسة نشطة والمستخدم على شاشات الدخول → يتم توجيهه إلى لوحة التحكم
  const current = user && screen !== 'dashboard' && screen !== 'home' ? 'dashboard' : screen

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-mawarid-700 selection:text-white">
      {screens[current] || <Home go={go} />}
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
