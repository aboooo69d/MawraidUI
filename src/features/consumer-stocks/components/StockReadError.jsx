import { ErrorBanner, PrimaryBtn, SecondaryBtn } from '../../../shared/components/ui'

export default function StockReadError({ err, user, onRetry, onSignIn, children }) {
  const requiresSignIn = err.status === 401 || (!user && err.status === 403)
  let message = err
  if (requiresSignIn && !user) {
    message = new Error('يتطلّب عرض المخزون المباشر تسجيل الدخول حاليًا.')
  } else if (err.status === 401) {
    message = new Error('انتهت الجلسة. سجّل الدخول مجدداً لعرض المخزون.')
  } else if (err.status === 403) {
    message = new Error('حسابك لا يملك صلاحية عرض هذا المخزون.')
  } else if (err.status === 404) {
    message = new Error('هذا المخزون غير متاح للعرض حاليًا.')
  } else if (err instanceof TypeError || err.status >= 500) {
    message = new Error('تعذّر الاتصال بخدمة المخزون. تحقق من اتصالك وأعد المحاولة.')
  }

  return (
    <div className="min-h-44 rounded-2xl border border-slate-200 bg-canvas p-4">
      <ErrorBanner err={message} />
      <div className="flex flex-wrap gap-2">
        {requiresSignIn && onSignIn
          ? <PrimaryBtn onClick={onSignIn} className="!mt-0 !w-auto">{user ? 'تسجيل الدخول مجدداً' : 'تسجيل الدخول'}</PrimaryBtn>
          : <SecondaryBtn onClick={onRetry}>إعادة المحاولة</SecondaryBtn>}
        {children}
      </div>
    </div>
  )
}
