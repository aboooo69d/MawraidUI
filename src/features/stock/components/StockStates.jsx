// ═══════════ حالات العرض الموحدة لشاشات المخزون ═══════════
import { ROUTES } from '../../../shared/constants/routes'
import { Icons, ErrorBanner, SecondaryBtn } from '../../../shared/components/ui'
import { useAuth } from '../../auth/hooks/useAuth'

// حالة التحميل
export function StockLoading({ label = 'جارٍ تحميل بيانات المخزون…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center fade-in" role="status" aria-live="polite">
      <Icons.Refresh className="w-8 h-8 text-mawarid-600 animate-spin" aria-hidden="true" />
      <p className="mt-3 text-sm font-bold text-slate-500">{label}</p>
    </div>
  )
}

// حالة الخطأ مع إعادة المحاولة (لا تُعامل أخطاء الخادم كبيانات فارغة)
export function StockErrorState({ err, onRetry }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center fade-in">
      <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
        <Icons.Alert className="w-6 h-6" aria-hidden="true" />
      </div>
      <h2 className="text-base font-black text-slate-900">تعذر تحميل بيانات المخزون</h2>
      <div className="mt-4 text-right">
        <ErrorBanner err={err} />
      </div>
      {onRetry && (
        <SecondaryBtn onClick={onRetry} className="w-full">
          إعادة المحاولة
        </SecondaryBtn>
      )}
    </div>
  )
}

// انتهاء الجلسة — يستخدم سلوك تسجيل الخروج الحالي في المشروع
export function SessionExpiredState({ go }) {
  const { logout } = useAuth()

  async function toLogin() {
    await logout()
    go(ROUTES.LOGIN)
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center fade-in" role="alert">
      <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
        <Icons.Lock className="w-6 h-6" aria-hidden="true" />
      </div>
      <h2 className="text-base font-black text-amber-950">انتهت الجلسة</h2>
      <p className="text-xs text-amber-800 mt-1.5 mb-4">يرجى تسجيل الدخول مجدداً للمتابعة إلى إدارة المخزون</p>
      <SecondaryBtn onClick={toLogin} className="w-full">
        تسجيل الدخول مجدداً
      </SecondaryBtn>
    </div>
  )
}

// لا يوجد مخزون مسجّل — مع الإجراء الأساسي لإنشاء مخزون جديد
export function StockEmptyState({ go }) {
  return (
    <div className="rounded-2xl border border-dashed border-mawarid-300 bg-white p-6 text-center fade-in">
      <div className="w-12 h-12 mx-auto rounded-xl bg-mawarid-50 text-mawarid-700 flex items-center justify-center mb-3">
        <Icons.Box className="w-6 h-6" aria-hidden="true" />
      </div>
      <h2 className="text-base font-black text-slate-900">لا يوجد مخزون مسجل</h2>
      <p className="text-xs text-slate-500 mt-1.5 mb-4">أنشئ مخزونك الأول لبدء إدارة الكميات والوحدات والحركات</p>
      <button
        type="button"
        onClick={() => go(ROUTES.STOCK_CREATE)}
        className="w-full min-h-[48px] rounded-xl bg-mawarid-700 hover:bg-mawarid-800 text-white text-sm font-bold transition shadow-md shadow-mawarid-900/15 cursor-pointer focus:outline-none focus:ring-2 focus:ring-mawarid-500 focus:ring-offset-2 flex items-center justify-center gap-2"
      >
        <Icons.Plus className="w-4 h-4" aria-hidden="true" />
        <span>إضافة مخزون جديد</span>
      </button>
    </div>
  )
}
