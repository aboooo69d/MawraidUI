// ═══════════ شاشة التحقق OTP — POST /verify-phone + resend ═══════════
import { useEffect, useRef, useState } from 'react'
import { authApi } from '../api'
import { Icons, BrandLogo, BackBtn, ErrorBanner, InfoBanner, PrimaryBtn } from '../ui'

export default function Otp({ go, phone }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [err, setErr] = useState(null)
  const [info, setInfo] = useState(`تم إرسال رمز التحقق المكون من 6 أرقام إلى الرقم +967 ${phone || ''}`)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputs = useRef([])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => c - 1), 10)
    return () => clearInterval(t)
  }, [countdown])

  function onDigit(i, v) {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    if (d && i < 5) {
      inputs.current[i + 1]?.focus()
    }
  }

  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  async function verify(e) {
    if (e) e.preventDefault()
    setErr(null)
    const code = digits.join('')
    if (code.length !== 6) return setErr({ code: 2000, message: 'يرجى إدخال رمز التحقق كاملاً (6 أرقام)' })
    setLoading(true)
    try {
      await authApi.verifyPhone(phone, code)
      go('login')
    } catch (e) {
      setErr(e)
    } finally {
      setLoading(false)
    }
  }

  async function resend() {
    setErr(null)
    try {
      await authApi.resendOtp(phone)
      setInfo('تم إرسال رمز تحقق جديد بنجاح إلى هاتفك')
      setCountdown(60)
    } catch (e) {
      setErr(e)
      setCountdown(60)
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
          <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4">
            <Icons.Shield className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-1">التحقق من رقم الجوال</h1>
          <p className="text-xs text-slate-500 mb-6">
            خطوة أمان أساسية لتأكيد ملكية رقم الهاتف وإصدار بطاقة المستفيد الرقمية
          </p>

          <InfoBanner>{info}</InfoBanner>
          <ErrorBanner err={err} />

          <form onSubmit={verify} className="mt-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-3">أدخل رمز التحقق (6 أرقام):</label>
              <div className="flex gap-2 sm:gap-2.5 justify-center" dir="ltr">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    value={d}
                    inputMode="numeric"
                    maxLength={1}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    onChange={(e) => onDigit(i, e.target.value)}
                    className={`w-12 h-14 sm:w-13 sm:h-16 rounded-xl border-2 text-center text-xl sm:text-2xl font-black font-mono outline-none transition ${
                      d ? 'border-mawarid-600 bg-mawarid-50/50 text-mawarid-900' : 'border-slate-200 bg-slate-50 focus:border-mawarid-500 focus:bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>

            <PrimaryBtn type="submit" loading={loading}>
              تأكيد وتفعيل الحساب
            </PrimaryBtn>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100">
            <button
              onClick={resend}
              disabled={countdown > 0}
              className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Icons.Clock className="w-4 h-4 text-slate-400" />
              <span>{countdown > 0 ? `إعادة الإرسال بعد (${countdown} ثانية)` : 'إعادة إرسال رمز التحقق'}</span>
            </button>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed text-right">
            <div className="font-bold text-slate-700 mb-0.5">تعليمات أمان:</div>
            • صلاحية الرمز 5 دقائق • بحد أقصى 3 محاولات خاطئة قبل طلب رمز جديد.
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 py-4">
        منصة موارد — مدينة تعز
      </div>
    </div>
  )
}
