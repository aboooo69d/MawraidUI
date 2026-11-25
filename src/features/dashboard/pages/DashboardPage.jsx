// ═══════════ لوحة التحكم بعد الدخول — منصة موارد (تعز) ═══════════
import { useState } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { Icons, BrandLogo, ThemeToggle } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'
import ProviderStockCard from '../../stock/components/ProviderStockCard'
import ProviderOrdersSection from '../../orders/components/ProviderOrdersSection'
import ConsumerOrdersSection from '../../orders/components/ConsumerOrdersSection'

export default function Dashboard({ go, showToast, onSessionExpired }) {
  const { user, logout } = useAuth()
  const [providerStockRefresh, setProviderStockRefresh] = useState(0)

  async function doLogout() {
    await logout()
    go('home')
  }

  if (!user) return null

  const isProvider = user.role_name === 'provider'
  const isCitizen = user.role_name === 'consumer'
  const isAdmin = user.role_name === 'admin'
  const addressEntry = isAdmin ? 'عرض عناوين المواطنين' : 'عناويني'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* ── شريط الملاحة العلوي ── */}
      <header className="bg-canvas border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <button className="min-h-11 rounded-lg" type="button" onClick={() => go(ROUTES.HOME)}>
            <BrandLogo size="sm" />
          </button>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => go('home')}
              className="text-xs font-bold text-slate-600 hover:text-mawarid-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition hidden sm:inline"
            >
              الرئيسية
            </button>
            <button
              onClick={doLogout}
              className="inline-flex min-h-11 items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
            >
              <Icons.LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── المحتوى الرئيسي للوحة التحكم ── */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 text-right">
        
        <section className="rounded-2xl border border-slate-200 bg-canvas p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-mawarid-50 text-mawarid-700">
                <Icons.User className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="mw-h1">{user.name || 'مستخدم منصة موارد'}</h1>
                <p className="text-sm text-slate-600 mt-1">
                  {isAdmin ? 'إدارة المنصة' : isProvider ? 'مقدم خدمة' : 'مستفيد'}
                </p>
                <p className="text-sm text-slate-600 inline-block" dir="ltr">+967 {user.phone}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── بطاقة المخزون والطلبات الواردة (للمزود فقط — لا تظهر للمستفيدين) ── */}
        {isProvider && (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="mw-h2 text-slate-900">إدارة المخزون</h2>
                <button
                  type="button"
                  onClick={() => go(ROUTES.PROVIDER_ORDERS)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-mawarid-200 bg-canvas hover:border-mawarid-500 text-mawarid-800 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Icons.ShoppingBag className="w-4 h-4 text-mawarid-700" />
                  <span>جميع الطلبات الواردة</span>
                </button>
              </div>
              <ProviderStockCard go={go} refreshTrigger={providerStockRefresh} />
            </div>

            <ProviderOrdersSection
              go={go}
              showToast={showToast}
              onSessionExpired={onSessionExpired}
              onOrderChanged={() => setProviderStockRefresh((n) => n + 1)}
            />
          </div>
        )}

        {(isCitizen || isAdmin) && (
          <div className="flex flex-wrap items-stretch gap-3">
            <button
              type="button"
              onClick={() => go(ROUTES.CONSUMER_STOCKS)}
              className="flex w-full items-center gap-3 rounded-2xl border border-mawarid-200 bg-canvas p-4 text-start shadow-xs hover:border-mawarid-500 transition cursor-pointer sm:w-auto sm:pe-6"
            >
              <span className="rounded-xl bg-mawarid-50 p-2.5 text-mawarid-700">
                <Icons.Box className="w-5 h-5" />
              </span>
              <span className="flex-1">
                <span className="block font-black text-slate-900">استكشاف المخزون المتاح</span>
                <span className="block text-xs text-slate-500">تصفّح أقرب المخازن مع المسافة بالكيلومتر</span>
              </span>
              <Icons.ArrowRight className="w-4 h-4 rotate-180 text-mawarid-700" />
            </button>

            {isCitizen && (
              <button
                type="button"
                onClick={() => go(ROUTES.CONSUMER_ORDERS)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-canvas p-4 text-start shadow-xs hover:border-mawarid-500 transition cursor-pointer sm:w-auto sm:pe-6"
              >
                <span className="rounded-xl bg-mawarid-50 p-2.5 text-mawarid-700">
                  <Icons.ShoppingBag className="w-5 h-5" />
                </span>
                <span className="flex-1">
                  <span className="block font-black text-slate-900">طلباتي وحجوزاتي</span>
                  <span className="block text-xs text-slate-500">متابعة حالة الطلبات وإلغاء المعلّق منها</span>
                </span>
                <Icons.ArrowRight className="w-4 h-4 rotate-180 text-mawarid-700" />
              </button>
            )}

            <button
              type="button"
              onClick={() => go(isAdmin ? ROUTES.ADMIN_ADDRESSES : ROUTES.CITIZEN_ADDRESSES)}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-canvas p-4 text-start shadow-xs hover:border-mawarid-500 transition cursor-pointer sm:w-auto sm:pe-6"
            >
              <span className="rounded-xl bg-mawarid-50 p-2.5 text-mawarid-700">
                <Icons.MapPin className="w-5 h-5" />
              </span>
              <span className="flex-1 font-black text-slate-900">{addressEntry}</span>
              <Icons.ArrowRight className="w-4 h-4 rotate-180 text-mawarid-700" />
            </button>
          </div>
        )}

        {/* ── طلباتي الأخيرة (للمستفيد فقط) ── */}
        {isCitizen && (
          <ConsumerOrdersSection
            go={go}
            showToast={showToast}
            onSessionExpired={onSessionExpired}
          />
        )}

      </main>
    </div>
  )
}
