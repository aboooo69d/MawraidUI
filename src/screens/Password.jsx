// ═══════════ شاشتَا استعادة وإعادة تعيين كلمة المرور ═══════════
import { useRef, useState } from 'react'
import { authApi, PHONE_RE } from '../api'
import { Icons, BrandLogo, BackBtn, ErrorBanner, InfoBanner, Label, PhoneInput, TextInput, PrimaryBtn } from '../ui'
import TurnstileWidget from '../components/TurnstileWidget'

export function Forgot({ go }) {
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState(null)
  const turnstileRef = useRef(null)

  async function submit(e) {
    if (e) e.preventDefault()
    setErr(null)
    setInfo(null)
    if (!PHONE_RE.test(phone)) return setErr({ code: 2000, message: 'رقم الجوال غير صالح (9 أرقام تبدأ بـ 7)' })
    if (!turnstileToken) return setErr({ code: 2000, message: 'يرجى إكمال التحقق الأمني أولاً' })
    setLoading(true)
    try {
      await authApi.forgetPassword(phone, turnstileToken)
      setInfo('تم إرسال رمز الاستعادة بنجاح عبر رسالة SMS — صالح لمدة 15 دقيقة')
      setTimeout(() => go('reset', { phone }), 1200)
    } catch (e) {
      setErr(e)
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center justify-between pb-6 mb-2">
          <div className="cursor-pointer" onClick={() => go('home')}>
            <BrandLogo size="sm" />
          </div>
          <BackBtn onClick={() => go('login')} label="تسجيل الدخول" />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 fade-in text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
            <Icons.Lock className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-1">استعادة كلمة المرور</h1>
          <p className="text-xs text-slate-500 mb-6">
            أدخل رقم هاتفك المسجل لاستلام رمز استعادة الحساب
          </p>

          <ErrorBanner err={err} />
          {info && <InfoBanner>{info}</InfoBanner>}

          <form onSubmit={submit} className="space-y-4 text-right">
            <div>
              <Label req htmlFor="forgotPhone">رقم الجوال المسجل في المنصة</Label>
              <PhoneInput value={phone} onChange={setPhone} error={!!err} id="forgotPhone" />
            </div>

            <TurnstileWidget
              ref={turnstileRef}
              action="forget_password"
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />

            <PrimaryBtn type="submit" loading={loading} disabled={!turnstileToken || loading} className="mt-6">
              إرسال رمز الاستعادة
            </PrimaryBtn>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            تذكرت كلمة المرور؟{' '}
            <button onClick={() => go('login')} className="font-bold text-mawarid-700 hover:underline cursor-pointer">
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 py-4">
        منصة موارد — مدينة تعز
      </div>
    </div>
  )
}

export function Reset({ go, phone }) {
  const [key, setKey] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function submit(e) {
    if (e) e.preventDefault()
    setErr(null)
    if (!key.trim()) return setErr({ code: 2000, message: 'يرجى إدخال رمز الاستعادة المرسل إليك' })
    if (pass.length < 8) return setErr({ code: 2000, message: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' })
    setLoading(true)
    try {
      // اسم الحقل بحسب توثيق الباك إند: rest_key
      await authApi.resetPassword(key.trim(), pass)
      go('login')
    } catch (e) {
      setErr(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center justify-between pb-6 mb-2">
          <div className="cursor-pointer" onClick={() => go('home')}>
            <BrandLogo size="sm" />
          </div>
          <BackBtn onClick={() => go('forgot')} label="رجوع" />
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 fade-in text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
            <Icons.Shield className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-1">تعيين كلمة مرور جديدة</h1>
          <p className="text-xs text-slate-500 mb-6">
            أدخل رمز الاستعادة المرسل إلى رقمك، ثم اختر كلمة مرور جديدة قوية
          </p>

          <ErrorBanner err={err} />

          <form onSubmit={submit} className="space-y-4 text-right">
            <div>
              <Label req htmlFor="resetKey">رمز الاستعادة المرسل (SMS)</Label>
              <TextInput
                id="resetKey"
                placeholder="أدخل الرمز المستلم"
                value={key}
                onChange={setKey}
              />
            </div>

            <div>
              <Label req htmlFor="newPass">كلمة المرور الجديدة</Label>
              <div className="relative">
                <TextInput
                  id="newPass"
                  type={showPass ? 'text' : 'password'}
                  placeholder="8 أحرف أو أرقام على الأقل"
                  value={pass}
                  onChange={setPass}
                  className="pl-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPass ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <PrimaryBtn type="submit" loading={loading} className="mt-6">
              حفظ كلمة المرور وتسجيل الدخول
            </PrimaryBtn>
          </form>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 py-4">
        منصة موارد — مدينة تعز
      </div>
    </div>
  )
}
