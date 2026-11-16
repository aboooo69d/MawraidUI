// ═══════════ لوحة التحكم بعد الدخول — منصة موارد (تعز) ═══════════
import { useAuth } from '../auth'
import { Icons, BrandLogo, ResourceBadge } from '../ui'

export default function Dashboard({ go }) {
  const { user, logout } = useAuth()

  async function doLogout() {
    await logout()
    go('home')
  }

  if (!user) return null

  const isProvider = user.role_name === 'provider'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* ── شريط الملاحة العلوي ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="cursor-pointer" onClick={() => go('home')}>
            <BrandLogo size="sm" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => go('home')}
              className="text-xs font-bold text-slate-600 hover:text-mawarid-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition hidden sm:inline"
            >
              الرئيسية
            </button>
            <button
              onClick={doLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
            >
              <Icons.LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── المحتوى الرئيسي للوحة التحكم ── */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 text-right">
        
        {/* بطاقة الترحيب وملف المستخدم */}
        <div className="rounded-3xl bg-gradient-to-r from-mawarid-900 via-mawarid-800 to-mawarid-950 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <Icons.User className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black">{user.name || 'مستخدم منصة موارد'}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                    <Icons.Check className="w-3 h-3" />
                    <span>حساب موثق</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-mono" dir="ltr">+967 {user.phone}</p>
                <div className="mt-2 text-xs font-medium text-mawarid-200">
                  {isProvider ? 'وكيل / مركز توزيع معتمد في مدينة تعز' : 'مواطن / مستفيد من الحصص الأساسية'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-white">
                {isProvider ? 'صلاحية: وكيل خدمة' : 'صلاحية: مستفيد معتمد'}
              </span>
            </div>
          </div>
        </div>

        {/* بطاقات حالة الموارد والحصص */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">سجل وحالة الحصص المخصصة</h2>
            <span className="text-xs text-slate-500">دورة التوزيع الحالية: شعبان 1447هـ</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* حصة الغاز */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <ResourceBadge type="gas" />
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  مجدولة
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">غاز الطهي المنزلي</h3>
              <p className="text-xs text-slate-500 mb-4">كارت الحصة: <strong className="font-mono text-slate-800">TAIZ-GAS-4902</strong></p>
              
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>المركز المعتمد:</span>
                  <span className="font-bold text-slate-800">مركز المسبح</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>الموعد المتوقع:</span>
                  <span className="font-bold text-slate-800">الخميس القادم</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>السعر الرسمي:</span>
                  <span className="font-bold text-emerald-700">4,500 ريال</span>
                </div>
              </div>

              <button className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 font-bold text-xs transition cursor-pointer">
                عرض كود الاستلام (QR)
              </button>
            </div>

            {/* حصة المياه */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <ResourceBadge type="water" />
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  حجز متاح
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">مياه الشرب والوايتات</h3>
              <p className="text-xs text-slate-500 mb-4">الحي السكني: <strong className="text-slate-800">مديرية القاهرة</strong></p>
              
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>جدول ضخ الشبكة:</span>
                  <span className="font-bold text-slate-800">الأحد 10:00 ص</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>حجز وايت صهريج:</span>
                  <span className="font-bold text-sky-700">3,000 لتر متاح</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>تسعيرة الوايت:</span>
                  <span className="font-bold text-emerald-700">معتمدة رسمياً</span>
                </div>
              </div>

              <button className="w-full py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-800 font-bold text-xs transition cursor-pointer">
                حجز صهريج مياه معتمد
              </button>
            </div>

            {/* حصة الوقود */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <ResourceBadge type="fuel" />
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ساري
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">مخصصات الوقود</h3>
              <p className="text-xs text-slate-500 mb-4">الفئة: <strong className="text-slate-800">مركبة نقل داخلي</strong></p>
              
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>المحطة المخصصة:</span>
                  <span className="font-bold text-slate-800">محطة الصقر</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>الحصة الأسبوعية:</span>
                  <span className="font-bold text-slate-800">40 لتر</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>حالة التزويد:</span>
                  <span className="font-bold text-emerald-700">جاهز للصرف</span>
                </div>
              </div>

              <button className="w-full py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 font-bold text-xs transition cursor-pointer">
                تأكيد كود تزويد الوقود
              </button>
            </div>
          </div>
        </div>

        {/* إرشادات وأمان الجلسة */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Icons.Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>جلسة آمنة مشفرة عبر ملفات تعريف الارتباط الآمنة (HttpOnly Cookie) المتصلة بمنظومة موارد تعز.</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Node: taiz-auth-v1
          </div>
        </div>
      </main>
    </div>
  )
}
