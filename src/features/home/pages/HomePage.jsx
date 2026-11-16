// ═══════════ الصفحة الرئيسية — منصة موارد (تعز) ═══════════
import { useState } from 'react'
import { BrandLogo, Icons, PrimaryBtn, SecondaryBtn, ResourceBadge } from '../../../shared/components/ui'

export default function Home({ go }) {
  const [activeDistrict, setActiveDistrict] = useState('al-qahirah')
  const [menuOpen, setMenuOpen] = useState(false)
  const [regOpen, setRegOpen] = useState(false)

  const navLinks = [
    { href: '#resources', label: 'الموارد الأساسية' },
    { href: '#how-it-works', label: 'كيف يعمل النظام' },
    { href: '#centers', label: 'نقاط التوزيع في تعز' },
    { href: '#transparency', label: 'الشفافية والرقابة' },
    { href: '#faq', label: 'الأسئلة الشائعة' },
  ]

  const districtHubs = {
    'al-qahirah': [
      { name: 'مركز مسبح للتوزيع (غاز)', area: 'حي المسبح - جوار مدرسة الشعب', resource: 'gas', status: 'متاح اليوم', hours: '08:00 ص - 01:00 م' },
      { name: 'محطة مياه النسيم المعتمدة', area: 'جولة سنان - شارع 26', resource: 'water', status: 'ضخ نشط', hours: '07:00 ص - 06:00 م' },
      { name: 'محطة الصقر للمشتقات (باصات)', area: 'شارع جمال - قرب جولة العواضي', resource: 'fuel', status: 'توزيع منتظم', hours: '06:00 ص - 10:00 م' },
    ],
    'al-mudhaffar': [
      { name: 'مركز حبيل سلمان للغاز المنزلي', area: 'حبيل سلمان - جوار جامعة تعز', resource: 'gas', status: 'متاح اليوم', hours: '08:30 ص - 02:00 م' },
      { name: 'نقطة توزيع صهاريج صينة', area: 'وادي المعقب - صينة', resource: 'water', status: 'حجز مسبق', hours: '08:00 ص - 04:00 م' },
      { name: 'محطة بيرباشا المركزية للوقود', area: 'مدخل بيرباشا - خط الحصب', resource: 'fuel', status: 'مخصصات النقل', hours: '06:00 ص - 08:00 م' },
    ],
    salah: [
      { name: 'مركز الجحملية المعتمد للغاز', area: 'الجحملية العليا - قرب المستشفى العسكري', resource: 'gas', status: 'متاح اليوم', hours: '08:00 ص - 01:30 م' },
      { name: 'محطة مياه ثعبات وحوض الأشراف', area: 'شارع 16 - حوض الأشراف', resource: 'water', status: 'ضخ مجدول', hours: '07:30 ص - 05:00 م' },
      { name: 'نقطة توزيع المحروقات - صالة', area: 'العسكري - جوار مركز الشرطة', resource: 'fuel', status: 'متاح للمركبات', hours: '07:00 ص - 07:00 م' },
    ],
  }

  const faqs = [
    {
      q: 'ما هي الوثائق المطلوبة لتسجيل الأسرة في منصة موارد؟',
      a: 'صورة من البطاقة الشخصية الذكية أو العائلية لرب الأسرة، وتحديد عدد أفراد الأسرة المقيمين في مدينة تعز لإصدار كارت الحصة الإلكتروني.',
    },
    {
      q: 'كيف يستفيد سائقو مركبات النقل والأجرة من مخصصات الوقود؟',
      a: 'يقوم السائق بالتسجيل كعميل مع تفعيل خيار (سائق)، وإدخال رقم المركبة ونوعها، ليتم إدراجها ضمن قوائم التزويد الدورية المعتمدة في محطات تعز.',
    },
    {
      q: 'كيف يتم حجز وتتبع وايتات المياه وتسعيرتها؟',
      a: 'تتيح المنصة ربط طلبات صهاريج المياه بالوكلاء المرخصين وفقاً للتسعيرة الرسمية الصادرة عن مؤسسة المياه لمنع الاستغلال والمضاربة.',
    },
    {
      q: 'كيف يتم التحقق والاستلام عند مركز التوزيع؟',
      a: 'عند وصول دورك، تتلقى رسالة SMS تحتوي على كود التحقق وموعد الاستلام المحدد، ويقوم الوكيل بمسح الكود وتسليم حصتك بشفافية.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* ── شريط الإعلان المباشر للطوارئ والتوزيع ── */}
      <div className="bg-mawarid-950 text-white text-xs py-2 px-4 border-b border-mawarid-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-mawarid-200">تحديث العمليات الميدانية — تعز:</span>
            <span className="text-slate-300">بدء مرحلة التوزيع الدورية لأسطوانات الغاز المنزلي في مديريتي القاهرة والمظفر.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="hidden sm:inline">مركز بلاغات التوزيع: <strong className="text-white" dir="ltr">04-200300</strong></span>
            <span>النسخة الميدانية 1.0</span>
          </div>
        </div>
      </div>

      {/* ── شريط التنقل العلوي (Navbar) ── */}
      <a href="#main" className="skip-link">تخطَّ إلى المحتوى الرئيسي</a>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3">
          <button type="button" aria-label="موارد — العودة إلى أعلى الصفحة" className="cursor-pointer rounded-xl" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <BrandLogo size="md" />
          </button>

          <nav aria-label="التنقل الرئيسي" className="hidden lg:flex items-center gap-7 text-sm font-bold text-slate-600">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-mawarid-700 transition-colors py-2">{l.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => go('login')}
              className="hidden sm:inline-flex min-h-[44px] items-center px-4 rounded-xl text-sm font-bold text-slate-700 hover:text-mawarid-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              تسجيل الدخول
            </button>

            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={regOpen}
                onClick={() => setRegOpen((v) => !v)}
                onKeyDown={(e) => e.key === 'Escape' && setRegOpen(false)}
                className="min-h-[44px] px-4 rounded-xl bg-mawarid-700 hover:bg-mawarid-800 text-white text-sm font-bold shadow-md shadow-mawarid-800/20 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>إنشاء حساب</span>
                <svg className={`w-4 h-4 transition-transform ${regOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              {regOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setRegOpen(false)} aria-hidden="true" />
                  <div role="menu" onKeyDown={(e) => e.key === 'Escape' && setRegOpen(false)} className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-card p-2 z-50 text-right fade-in">
                    <button role="menuitem" onClick={() => { setRegOpen(false); go('register-consumer') }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-mawarid-50 text-right cursor-pointer">
                      <span className="w-10 h-10 rounded-lg bg-mawarid-100 text-mawarid-700 flex items-center justify-center shrink-0"><Icons.User className="w-5 h-5" /></span>
                      <span><span className="block text-sm font-bold text-slate-900">مواطن / مستفيد</span><span className="block text-[11px] text-slate-500">أسرة، سائق، أو نشاط تجاري</span></span>
                    </button>
                    <button role="menuitem" onClick={() => { setRegOpen(false); go('register-provider') }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-right cursor-pointer">
                      <span className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0"><Icons.Business className="w-5 h-5" /></span>
                      <span><span className="block text-sm font-bold text-slate-900">وكيل / مقدم خدمة</span><span className="block text-[11px] text-slate-500">مركز غاز، مياه، أو وقود</span></span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden w-11 h-11 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
            >
              {menuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-menu" aria-label="قائمة الجوال" className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 fade-in">
            <ul className="space-y-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setMenuOpen(false)} className="flex min-h-[48px] items-center px-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100">{l.label}</a>
                </li>
              ))}
              <li className="sm:hidden pt-2">
                <button onClick={() => { setMenuOpen(false); go('login') }} className="w-full min-h-[48px] rounded-xl border border-slate-200 text-sm font-bold text-slate-700 cursor-pointer">تسجيل الدخول</button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">

        {/* ── القسم الترويجي والعملياتي (Hero Section) ── */}
        <section className="hero-grid relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-white via-mawarid-50/40 to-slate-50 border-b border-slate-200/60">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* النص التعريفي الرئيسي */}
            <div className="lg:col-span-7 space-y-6 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mawarid-100/80 border border-mawarid-200 text-mawarid-800 text-xs font-bold">
                <Icons.Shield className="w-4 h-4 text-mawarid-600" />
                <span>المنظومة الرقمية المعتمدة لمدينة تعز</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.25] tracking-tight">
                إدارة وتوزيع الموارد الأساسية في تعز <span className="text-mawarid-700 underline decoration-mawarid-300 decoration-4 underline-offset-8">بعدالة وشفافية</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium max-w-2xl">
                منصة «موارد» تنظم توزيع أسطوانات غاز الطهي، شاحنات مياه الشرب، ومخصصات الوقود للمواطنين والسائقين والأنشطة الحيوية في مديريات تعز، لتجاوز أزمات الاحتكار وإنهاء الطوابير.
              </p>

              {/* أزرار الحث على الإجراء */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => go('register-consumer')}
                  className="px-6 py-3.5 rounded-xl bg-mawarid-700 hover:bg-mawarid-800 text-white font-extrabold text-base shadow-lg shadow-mawarid-700/25 transition flex items-center gap-2 cursor-pointer focus:ring-2 focus:ring-mawarid-500"
                >
                  <Icons.User className="w-5 h-5" />
                  <span>تسجيل مواطن / حجز حصة</span>
                </button>
                <button
                  onClick={() => go('register-provider')}
                  className="px-5 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Icons.Business className="w-4 h-4 text-slate-500" />
                  <span>تسجيل وكيل أو محطة توزيع</span>
                </button>
              </div>

              {/* شارات الثقة */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <Icons.Check className="w-4 h-4 text-emerald-600" />
                  <span>كروت حصص رقمية مؤكدة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Check className="w-4 h-4 text-emerald-600" />
                  <span>تأكيد بالرسائل النصية والـ OTP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Check className="w-4 h-4 text-emerald-600" />
                  <span>إشراف وتنسيق محلي مباشر</span>
                </div>
              </div>
            </div>

            {/* بطاقة المعاينة الميدانية التفاعلية */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-5 sm:p-6 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-mawarid-50 text-mawarid-700 flex items-center justify-center font-bold">
                      <Icons.MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">حالة التوزيع المباشرة</h2>
                      <p className="text-[11px] text-slate-500">مراكز مديريات تعز المعتمدة</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    محدّث الآن
                  </span>
                </div>

                <div className="space-y-3.5 my-4">
                  {/* بند الغاز */}
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Icons.Gas className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-950">غاز الطهي المنزلي</div>
                        <div className="text-[11px] text-amber-800">صالة • القاهرة • المظفر</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white text-amber-900 text-[11px] font-bold shadow-xs border border-amber-200">
                      دورة شعبان نشطة
                    </span>
                  </div>

                  {/* بند المياه */}
                  <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
                        <Icons.Water className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-sky-950">شاحنات ومحطات المياه</div>
                        <div className="text-[11px] text-sky-800">جدولة الضخ بالأحياء المرتفعة</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white text-sky-900 text-[11px] font-bold shadow-xs border border-sky-200">
                      حجز مسبق متاح
                    </span>
                  </div>

                  {/* بند الوقود */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Icons.Fuel className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-950">مخصصات الوقود والنقل</div>
                        <div className="text-[11px] text-emerald-800">حافلات الأجرة والمركبات المسجلة</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 text-[11px] font-bold shadow-xs border border-emerald-200">
                      4 محطات مركزية
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">لديك حساب بالفعل؟</span>
                  <button
                    onClick={() => go('login')}
                    className="font-bold text-mawarid-700 hover:text-mawarid-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>تسجيل الدخول للمنصة</span>
                    <Icons.ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── الموارد الثلاثة الأساسية (Core Resources) ── */}
      <section id="resources" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-mawarid-700 mb-2">الموارد المدارة في مدينة تعز</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">تنظيم دقيق لمصادر المعيشة اليومية</h3>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              تضمن المنصة فك الاختناقات عبر رقابة صارمة على تدفق المواد الحيوية وربط الاستحقاق مباشرة بالسكان والمنشآت الفعلية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* بطاقة الغاز */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 hover:shadow-lg hover:border-amber-300 transition duration-200 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-6">
                <Icons.Gas className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">غاز الطهي المنزلي</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                كشوفات إلكترونية تضبط استلام كل أسرة لأسطوانة الغاز شهرياً في مركز حيها، مع إشعار بالموعد المحدد وإلغاء ظاهرة الوساطات والأسواق الموازية.
              </p>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-700 mb-6 mt-auto">
                <li className="flex items-center gap-2">
                  <Icons.Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>كارت حصة رقمي لكل رب أسرة</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icons.Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تأكيد الاستلام برمز مؤقت OTP</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icons.Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تسعيرة رسمية موحدة دون زيادة</span>
                </li>
              </ul>
              <button
                onClick={() => go('register-consumer')}
                className="w-full py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition cursor-pointer"
              >
                تسجيل أسرة للحصول على حصة الغاز
              </button>
            </div>

            {/* بطاقة المياه */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 hover:shadow-lg hover:border-sky-300 transition duration-200 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-6">
                <Icons.Water className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">مياه الشرب والوايتات</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                تنظيم جدول ضخ شبكة المياه بالأحياء، وتوفير نظام حجز موثوق لصهاريج الوايتات المعتمدة مع تحديد سقف عادل لتسعيرة الوايت حسب سعة الخزان.
              </p>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-700 mb-6 mt-auto">
                <li className="flex items-center gap-2">
                  <Icons.Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>حجز وايت مياه من أقرب محطة ضخ</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icons.Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تتبع وصول الصهريج للحي المستهدف</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icons.Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>إشراف على معايير نظافة وجودة المياه</span>
                </li>
              </ul>
              <button
                onClick={() => go('register-consumer')}
                className="w-full py-2.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs transition cursor-pointer"
              >
                طلب صهريج أو مراجعة جدول الضخ
              </button>
            </div>

            {/* بطاقة المشتقات والوقود */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8 hover:shadow-lg hover:border-emerald-300 transition duration-200 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                <Icons.Fuel className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">الوقود والمشتقات النفطية</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                تأمين حصص منتظمة لباصات النقل الداخلي ومركبات الأجرة، فضلاً عن المنشآت الحيوية في تعز (المستشفيات، المخابز، ومحطات الكهرباء التجارية).
              </p>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-700 mb-6 mt-auto">
                <li className="flex items-center gap-2">
                  <Icons.Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تسجيل رقم ونوع المركبة وتوثيقها</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icons.Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>مواعيد تزويد دورية بدون انتظار</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icons.Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>منع إعادة البيع والمتاجرة بالمخصصات</span>
                </li>
              </ul>
              <button
                onClick={() => go('register-consumer')}
                className="w-full py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition cursor-pointer"
              >
                تسجيل مركبة أو نشاط تجاري
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── إحصائيات العمليات الميدانية والشفافية (Metrics) ── */}
      <section id="transparency" className="py-16 bg-mawarid-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-mawarid-300 mb-1">الشفافية في الأرقام</h2>
            <h3 className="text-2xl font-black">أثر منظومة موارد على أحياء مدينة تعز</h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono" dir="ltr">+88,400</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-2">أسرة مسجلة ومستفيدة</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
              <div className="text-3xl sm:text-4xl font-black text-sky-400 font-mono" dir="ltr">142</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-2">مركز ووكيل توزيع معتمد</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono" dir="ltr">3 مديريات</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-2">تغطية شاملة لأحياء المدينة</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
              <div className="text-3xl sm:text-4xl font-black text-blue-300 font-mono" dir="ltr">99.4%</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-2">نسبة الالتزام بالحصص والتسعيرة</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── كيف يعمل النظام (How It Works) ── */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-mawarid-700 mb-2">خطوات ميسرة لكل مواطن</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">كيف تستلم حصتك عبر المنصة؟</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-mawarid-50 text-mawarid-700 font-black text-base flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">تسجيل الحساب وتوثيقه</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                أدخل رقم هاتفك وتأكيده عبر كود التحقق SMS، وارفق صورة بطاقتك الشخصية لإصدار قيدك المعتمد.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-mawarid-50 text-mawarid-700 font-black text-base flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">تحديد الفئة والحي السكني</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                حدد صفتك (رب أسرة، سائق مركبة، أو نشاط تجاري) لربط حصتك بأقرب نقطة توزيع تابعة لحيّك.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-mawarid-50 text-mawarid-700 font-black text-base flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">إشعار الموعد والتخصيص</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                تصلك رسالة تفيد بتوفر الحصة في المركز المعتمد، متضمنةً رمز الاستلام والسعر الرسمي المحدد.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-black text-base flex items-center justify-center mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">الاستلام الموثق بالرمز</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                يتأكد الوكيل من رمز الاستلام في النظام ويتم تسليم حصتك فوراً وتسجيل العملية كمنجزة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── دليل مراكز التوزيع في مديريات تعز (Districts Centers) ── */}
      <section id="centers" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-mawarid-700 mb-1">دليل التوزيع الميداني</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">مراكز الخدمة المعتمدة في مديريات تعز</h3>
            </div>
            
            {/* أزرار اختيار المديرية */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveDistrict('al-qahirah')}
                className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                  activeDistrict === 'al-qahirah' ? 'bg-white text-mawarid-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                مديرية القاهرة
              </button>
              <button
                onClick={() => setActiveDistrict('al-mudhaffar')}
                className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                  activeDistrict === 'al-mudhaffar' ? 'bg-white text-mawarid-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                مديرية المظفر
              </button>
              <button
                onClick={() => setActiveDistrict('salah')}
                className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                  activeDistrict === 'salah' ? 'bg-white text-mawarid-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                مديرية صالة
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {districtHubs[activeDistrict].map((hub, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <ResourceBadge type={hub.resource} />
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {hub.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">{hub.name}</h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                  <Icons.MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{hub.area}</span>
                </div>
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Icons.Clock className="w-3.5 h-3.5" />
                    <span>{hub.hours}</span>
                  </div>
                  <button
                    onClick={() => go('login')}
                    className="font-bold text-mawarid-700 hover:underline cursor-pointer"
                  >
                    حجز الموعد
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── الأسئلة الشائعة (FAQ) ── */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
          <div className="text-center mb-12">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-mawarid-700 mb-1">الأسئلة المتكررة</h2>
            <h3 className="text-2xl font-black text-slate-900">إرشادات تهم المواطن والوكيل</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-mawarid-600"></span>
                  <span>{f.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pr-4">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── دعوة الانضمام والبدء ── */}
      <section className="py-16 bg-gradient-to-r from-mawarid-900 via-mawarid-800 to-mawarid-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl sm:text-3xl font-black mb-3">سجّل الآن واضمن حصة أسرتك أو منشأتك بانتظام</h3>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            المنصة متاحة مجاناً لجميع سكان مدينة تعز لمساعدتك في الحصول على احتياجاتك الأساسية بسعرها الرسمي وكرامتك المحفوظة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => go('register-consumer')}
              className="px-7 py-3.5 rounded-xl bg-white text-mawarid-900 font-extrabold text-sm hover:bg-slate-100 transition shadow-lg cursor-pointer"
            >
              إنشاء حساب مواطن جديد
            </button>
            <button
              onClick={() => go('login')}
              className="px-6 py-3.5 rounded-xl border border-white/30 text-white font-bold text-sm hover:bg-white/10 transition cursor-pointer"
            >
              تسجيل الدخول إلى حسابك
            </button>
          </div>
        </div>
      </section>

      </main>

      {/* ── تذييل الصفحة المؤسسي (Footer) ── */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800 text-right">
            <div className="space-y-3">
              <div className="text-white font-black text-lg">مَـوَارِد — تعز</div>
              <p className="text-slate-400 text-xs leading-relaxed">
                المنصة الإلكترونية لتنظيم توزيع الموارد الأساسية المحدودة (غاز الطهي، المياه، الوقود) بمدينة تعز بالتنسيق مع الجهات الخدمية والوكلاء المعتمدين.
              </p>
            </div>
            <div>
              <div className="text-white font-bold text-sm mb-3">الموارد المدارة</div>
              <ul className="space-y-2">
                <li><a href="#resources" className="hover:text-white transition">غاز الطهي المنزلي</a></li>
                <li><a href="#resources" className="hover:text-white transition">صهاريج ومحطات مياه الشرب</a></li>
                <li><a href="#resources" className="hover:text-white transition">وقود مركبات النقل والمخابز</a></li>
                <li><a href="#centers" className="hover:text-white transition">مراكز التوزيع في المديريات</a></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-bold text-sm mb-3">بوابة الحسابات</div>
              <ul className="space-y-2">
                <li><button onClick={() => go('login')} className="hover:text-white transition cursor-pointer">تسجيل الدخول</button></li>
                <li><button onClick={() => go('register-consumer')} className="hover:text-white transition cursor-pointer">تسجيل مواطن / أسرة</button></li>
                <li><button onClick={() => go('register-provider')} className="hover:text-white transition cursor-pointer">تسجيل وكيل / مقدم خدمة</button></li>
                <li><button onClick={() => go('forgot')} className="hover:text-white transition cursor-pointer">استعادة كلمة المرور</button></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-bold text-sm mb-3">غرفة طوارئ البلاغات</div>
              <p className="text-slate-400 mb-3 leading-relaxed">
                في حال وجود تلاعب بالأسعار أو احتكار للحصص، يرجى إرسال بلاغ مباشر للجنة الرقابة.
              </p>
              <div className="font-mono text-white text-sm font-bold bg-slate-900 p-2.5 rounded-lg border border-slate-800 inline-block" dir="ltr">
                Hotline: 04-200300
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>منصة موارد © 2026 — مدينة تعز. جميع الحقوق محفوظة لخدمة الصالح العام.</div>
            <div className="flex items-center gap-4">
              <span>الشفافية والتوزيع العادل</span>
              <span>•</span>
              <span>حماية بيانات المستفيدين</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
