// ═══════════ App — التنقل وإدارة المنظومة ═══════════
import { useCallback, useState } from 'react'
import { AuthProvider, useAuth } from './providers/AuthProvider'
import { getErrorMessage } from '../services/api'
import { ROUTES } from '../shared/constants/routes'
import { Toast } from '../shared/components/ui'
import HomePage from '../features/home/pages/HomePage'
import LoginPage from '../features/auth/pages/LoginPage'
import { RegisterConsumer, RegisterProvider } from '../features/auth/pages/RegisterPage'
import OtpPage from '../features/auth/pages/OtpPage'
import { Forgot, Reset } from '../features/auth/pages/PasswordPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import StockCreatePage from '../features/stock/pages/StockCreatePage'
import StockDashboardPage from '../features/stock/pages/StockDashboardPage'
import StockTransactionPage from '../features/stock/pages/StockTransactionPage'
import StockUnitsPage from '../features/stock/pages/StockUnitsPage'
import StockHistoryPage from '../features/stock/pages/StockHistoryPage'

import CitizenAddressesPage from '../features/addresses/pages/CitizenAddressesPage'
import AdminAddressesPage from '../features/addresses/pages/AdminAddressesPage'
import ConsumerStocksPage from '../features/consumer-stocks/pages/ConsumerStocksPage'

// شاشات ميزة المخزون — متاحة لحسابات مزودي الخدمة فقط
const STOCK_SCREENS = [
  ROUTES.STOCK_CREATE,
  ROUTES.STOCK_DASHBOARD,
  ROUTES.STOCK_TRANSACTION,
  ROUTES.STOCK_UNITS,
  ROUTES.STOCK_HISTORY,
]

const PROTECTED_ROLES = new Map([
  ...STOCK_SCREENS.map((screen) => [screen, ['provider']]),
  [ROUTES.CITIZEN_ADDRESSES, ['consumer']],
  [ROUTES.ADMIN_ADDRESSES, ['admin']],
  [ROUTES.CONSUMER_STOCKS, ['consumer', 'admin']],
])

export function resolveCurrentScreen(screen, user) {
  const allowedRoles = PROTECTED_ROLES.get(screen)
  if (allowedRoles) {
    if (!user) return ROUTES.LOGIN
    if (!allowedRoles.includes(user.role_name)) return ROUTES.DASHBOARD
    return screen
  }
  if (user && screen !== ROUTES.DASHBOARD && screen !== ROUTES.HOME) return ROUTES.DASHBOARD
  return screen
}

function Shell() {
  const { user, clearSession } = useAuth()
  const [screen, setScreen] = useState(ROUTES.HOME)
  const [params, setParams] = useState({})
  const [toast, setToast] = useState(null)

  const go = useCallback((s, p = {}) => {
    setParams(p)
    setScreen(s)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const showToast = useCallback((msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const onAddressSessionExpired = useCallback(() => {
    clearSession()
    go(ROUTES.LOGIN)
    showToast(getErrorMessage({ code: 1106 }), false)
  }, [clearSession, go, showToast])

  const screens = {
    [ROUTES.HOME]: <HomePage go={go} />,
    [ROUTES.LOGIN]: <LoginPage go={go} />,
    [ROUTES.REGISTER_CONSUMER]: <RegisterConsumer go={go} />,
    [ROUTES.REGISTER_PROVIDER]: <RegisterProvider go={go} />,
    [ROUTES.OTP]: <OtpPage go={go} phone={params.phone} />,
    [ROUTES.FORGOT_PASSWORD]: <Forgot go={go} />,
    [ROUTES.RESET_PASSWORD]: <Reset go={go} phone={params.phone} />,
    [ROUTES.DASHBOARD]: <DashboardPage go={go} />,
    [ROUTES.CITIZEN_ADDRESSES]: <CitizenAddressesPage go={go} showToast={showToast} onSessionExpired={onAddressSessionExpired} />,
    [ROUTES.ADMIN_ADDRESSES]: <AdminAddressesPage go={go} onSessionExpired={onAddressSessionExpired} />,
    [ROUTES.CONSUMER_STOCKS]: <ConsumerStocksPage go={go} onSessionExpired={onAddressSessionExpired} />,
    // ── ميزة المخزون (provider only) ──
    [ROUTES.STOCK_CREATE]: <StockCreatePage go={go} showToast={showToast} />,
    [ROUTES.STOCK_DASHBOARD]: <StockDashboardPage go={go} showToast={showToast} stockId={params.stockId} />,
    [ROUTES.STOCK_TRANSACTION]: <StockTransactionPage go={go} showToast={showToast} stockId={params.stockId} direction={params.direction} />,
    [ROUTES.STOCK_UNITS]: <StockUnitsPage go={go} showToast={showToast} stockId={params.stockId} />,
    [ROUTES.STOCK_HISTORY]: <StockHistoryPage go={go} showToast={showToast} stockId={params.stockId} />,
  }

  const current = resolveCurrentScreen(screen, user)

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
