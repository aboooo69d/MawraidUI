import { useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PHONE_RE } from '../../../shared/constants/regex'
import { Icons, BrandLogo, ErrorBanner, Label, PhoneInput, TextInput, PrimaryBtn, BackBtn } from '../../../shared/components/ui'
import TurnstileWidget from '../components/TurnstileWidget'

export default function Login({ go }) {
  const { login } = useAuth()
  const [phone, setPhone] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState(null)
  const turnstileRef = useRef(null)

  async function submit(e) {
    if (e) e.preventDefault()
    setErr(null)
    if (!PHONE_RE.test(phone)) return setErr({ code: 2000, message: 'رقم الجوال يجب أن يكون 9 أرقام تبدأ بـ 7' })
    if (pass.length < 8) return setErr({ code: 2000, message: 'كلمة المرور 8 أحرف على الأقل' })
    if (!turnstileToken) return setErr({ code: 2000, message: 'يرجى إكمال التحقق الأمني أولاً' })
    setLoading(true)
    try {
      await login(phone, pass, turnstileToken)
      go('dashboard')
    } catch (e) {
      setErr(e)
      setTurnstileToken(null)
      turnstileRef.current?.reset()
      if (e.code === 1102) setTimeout(() => go('otp', { phone }), 900) // تحويل تلقائي للتحقق إذا كان الحساب غير موثق
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-mawarid-50/30 to-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* شريط علوي مع زر العودة للرئيسية */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6">
        <div className="cursor-pointer" onClick={() => go('home')}>
          <BrandLogo size="sm" />
        </div>
        <BackBtn onClick={() => go('home')} label="العودة للرئيسية" />
      </div>

      {/* بطاقة تسجيل الدخول الرئيسية */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8 fade-in">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-mawarid-700 to-mawarid-900 flex items-center justify-center shadow-md shadow-mawarid-800/20 mb-3">
            <Icons.LogoMark className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">تسجيل الدخول إلى موارد</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            أدخل بيانات حسابك المعتمد لمتابعة الحصص وإجراءات التوزيع
          </p>
        </div>

        <ErrorBanner err={err} />

        <form onSubmit={submit} className="space-y-4 text-right">
          <div>
            <Label req htmlFor="phone">رقم الجوال المسجل</Label>
            <PhoneInput value={phone} onChange={setPhone} error={!!err} id="phone" />
            <p className="text-[11.5px] text-slate-400 mt-1.5">أدخل 9 أرقام (مثل 77XXXXXXX) بدون رمز الدولة</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label req htmlFor="password">كلمة المرور</Label>
              <button
                type="button"
                onClick={() => go('forgot')}
                className="text-[12px] font-bold text-mawarid-700 hover:text-mawarid-900 cursor-pointer"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
            <div className="relative">
              <TextInput
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="8 أحرف على الأقل"
                value={pass}
                onChange={setPass}
                className="pl-11"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPass ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <TurnstileWidget
            ref={turnstileRef}
            action="login"
            onVerify={setTurnstileToken}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />

          <PrimaryBtn type="submit" loading={loading} disabled={!turnstileToken || loading}>
            تسجيل الدخول للمنصة
          </PrimaryBtn>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600 mb-3">ليس لديك حساب مسجل في منصة موارد؟</p>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => go('register-consumer')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-mawarid-500 text-slate-700 hover:text-mawarid-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Icons.User className="w-3.5 h-3.5" />
              <span>تسجيل مواطن / أسرة</span>
            </button>
            <button
              onClick={() => go('register-provider')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-mawarid-500 text-slate-700 hover:text-mawarid-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Icons.Business className="w-3.5 h-3.5" />
              <span>تسجيل وكيل خدمة</span>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 py-4">
        منظومة موارد المركزية — حماية الموارد وضمان التوزيع العادل في مدينة تعز
      </div>
    </div>
  )
}
