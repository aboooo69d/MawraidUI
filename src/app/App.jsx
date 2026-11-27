// ═══════════ App — التنقل وإدارة المنظومة ═══════════
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
import ConsumerStockDetailsPage from '../features/consumer-stocks/pages/ConsumerStockDetailsPage'
import ConsumerOrdersPage from '../features/orders/pages/ConsumerOrdersPage'
import ConsumerOrderDetailsPage from '../features/orders/pages/ConsumerOrderDetailsPage'
import ProviderOrdersPage from '../features/orders/pages/ProviderOrdersPage'
import ProviderOrderDetailsPage from '../features/orders/pages/ProviderOrderDetailsPage'

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
  [ROUTES.PROVIDER_ORDERS, ['provider']],
  [ROUTES.PROVIDER_ORDER_DETAILS, ['provider']],
  [ROUTES.CITIZEN_ADDRESSES, ['consumer']],
  [ROUTES.ADMIN_ADDRESSES, ['admin']],
  [ROUTES.CONSUMER_ORDERS, ['consumer']],
  [ROUTES.CONSUMER_ORDER_DETAILS, ['consumer']],
])

const AUTH_SCREENS = new Set([
  ROUTES.LOGIN, ROUTES.REGISTER_CONSUMER, ROUTES.REGISTER_PROVIDER,
  ROUTES.OTP, ROUTES.FORGOT_PASSWORD, ROUTES.RESET_PASSWORD,
])

export function resolveCurrentScreen(screen, user) {
  const allowedRoles = PROTECTED_ROLES.get(screen)
  if (allowedRoles) {
    if (!user) return ROUTES.LOGIN
    if (!allowedRoles.includes(user.role_name)) return ROUTES.DASHBOARD
    return screen
  }
  if (!user && screen === ROUTES.DASHBOARD) return ROUTES.LOGIN
  if (user && AUTH_SCREENS.has(screen)) return ROUTES.DASHBOARD
  return screen
}

function Shell() {
  const { user, clearSession } = useAuth()
  const [screen, setScreen] = useState(ROUTES.HOME)
  const [params, setParams] = useState({})
  const [signInIntent, setSignInIntent] = useState(null)
  const [toast, setToast] = useState(null)
  const toastTimeout = useRef(null)
  const current = resolveCurrentScreen(screen, user)
  const viewport = useRef(null)
  const initializedViewport = useRef(false)

  useLayoutEffect(() => {
    if (!initializedViewport.current) {
      initializedViewport.current = true
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    viewport.current?.focus({ preventScroll: true })
  }, [current, params.stockId, params.orderId])

  useEffect(() => () => clearTimeout(toastTimeout.current), [])

  const go = useCallback((s, p = {}) => {
    if (!AUTH_SCREENS.has(s)) setSignInIntent(null)
    setParams(p)
    setScreen(s)
  }, [])

  function signInForStock(screen, params, order = false) {
    if (user) clearSession()
    setSignInIntent({ screen, params, order })
    go(ROUTES.LOGIN)
  }

  function afterLogin(account) {
    if (!signInIntent) {
      go(ROUTES.DASHBOARD)
      return
    }
    go(signInIntent.screen, {
      ...signInIntent.params,
      resumeOrder: signInIntent.order && account?.role_name === 'consumer',
    })
  }

  const showToast = useCallback((msg, ok = true) => {
    clearTimeout(toastTimeout.current)
    setToast({ msg, ok })
    toastTimeout.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const onAddressSessionExpired = useCallback(() => {
    clearSession()
    go(ROUTES.LOGIN)
    showToast(getErrorMessage({ code: 1106 }), false)
  }, [clearSession, go, showToast])

  const screens = {
    [ROUTES.HOME]: <HomePage go={go} />,
    [ROUTES.LOGIN]: (
      <LoginPage
        go={go}
        onSuccess={afterLogin}
        onBack={signInIntent ? () => go(signInIntent.screen, signInIntent.params) : undefined}
        orderSignIn={signInIntent?.order}
      />
    ),
    [ROUTES.REGISTER_CONSUMER]: <RegisterConsumer go={go} />,
    [ROUTES.REGISTER_PROVIDER]: <RegisterProvider go={go} />,
    [ROUTES.OTP]: <OtpPage go={go} phone={params.phone} />,
    [ROUTES.FORGOT_PASSWORD]: <Forgot go={go} />,
    [ROUTES.RESET_PASSWORD]: <Reset go={go} phone={params.phone} />,
    [ROUTES.DASHBOARD]: (
      <DashboardPage
        go={go}
        showToast={showToast}
        onSessionExpired={onAddressSessionExpired}
      />
    ),
    [ROUTES.CITIZEN_ADDRESSES]: <CitizenAddressesPage go={go} showToast={showToast} onSessionExpired={onAddressSessionExpired} />,
    [ROUTES.ADMIN_ADDRESSES]: <AdminAddressesPage go={go} onSessionExpired={onAddressSessionExpired} />,
    [ROUTES.CONSUMER_STOCKS]: <ConsumerStocksPage key={params.resource || 'all'} go={go} resource={params.resource} onStockSignIn={signInForStock} />,
    [ROUTES.CONSUMER_STOCK_DETAILS]: (
      <ConsumerStockDetailsPage
        key={params.stockId}
        go={go}
        stockId={params.stockId}
        resource={params.resource}
        resumeOrder={params.resumeOrder}
        unitId={params.unitId}
        onOrderSignIn={(intent) => signInForStock(ROUTES.CONSUMER_STOCK_DETAILS, intent, true)}
        onStockSignIn={signInForStock}
        showToast={showToast}
        onSessionExpired={onAddressSessionExpired}
      />
    ),
    [ROUTES.CONSUMER_ORDERS]: (
      <ConsumerOrdersPage
        go={go}
        initialStockId={params.stockId}
        initialStockName={params.stockName}
        showToast={showToast}
        onSessionExpired={onAddressSessionExpired}
      />
    ),
    [ROUTES.CONSUMER_ORDER_DETAILS]: (
      <ConsumerOrderDetailsPage
        go={go}
        orderId={params.orderId}
        backTo={params.backTo}
        backParams={params.backParams}
        showToast={showToast}
        onSessionExpired={onAddressSessionExpired}
      />
    ),
    // ── ميزة المخزون والطلبات الواردة (provider only) ──
    [ROUTES.STOCK_CREATE]: <StockCreatePage go={go} showToast={showToast} />,
    [ROUTES.STOCK_DASHBOARD]: <StockDashboardPage go={go} showToast={showToast} stockId={params.stockId} />,
    [ROUTES.STOCK_TRANSACTION]: <StockTransactionPage go={go} showToast={showToast} stockId={params.stockId} direction={params.direction} />,
    [ROUTES.STOCK_UNITS]: <StockUnitsPage go={go} showToast={showToast} stockId={params.stockId} />,
    [ROUTES.STOCK_HISTORY]: <StockHistoryPage go={go} showToast={showToast} stockId={params.stockId} />,
    [ROUTES.PROVIDER_ORDERS]: (
      <ProviderOrdersPage
        go={go}
        initialStockId={params.stockId}
        showToast={showToast}
        onSessionExpired={onAddressSessionExpired}
      />
    ),
    [ROUTES.PROVIDER_ORDER_DETAILS]: (
      <ProviderOrderDetailsPage
        go={go}
        orderId={params.orderId}
        backTo={params.backTo}
        backParams={params.backParams}
        showToast={showToast}
        onSessionExpired={onAddressSessionExpired}
      />
    ),
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-800 font-sans flex flex-col">
      <div key={current} ref={viewport} tabIndex={-1} className="mw-page flex-1 focus:outline-none">
        {screens[current] || <HomePage go={go} />}
      </div>
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
