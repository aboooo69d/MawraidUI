import { useRef, useState } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { BrandLogo, Icons, ResourceBadge, ThemeToggle } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'

const NAV_LINKS = [
  { href: '#resources', label: 'الموارد' },
  { href: '#centers', label: 'نقاط التوزيع' },
  { href: '#how-it-works', label: 'كيف تعمل المنصة؟' },
  { href: '#transparency', label: 'الشفافية' },
  { href: '#faq', label: 'الأسئلة الشائعة' },
]

const RESOURCES = [
  { type: 'gas', name: 'الغاز المنزلي', description: 'استعرض مخزون أسطوانات الغاز وتفاصيل التعبئة أو الاستبدال.', icon: Icons.Gas },
  { type: 'water', name: 'المياه', description: 'اطّلع على الكميات المتاحة ومواقع مخازن المياه.', icon: Icons.Water },
  { type: 'fuel', name: 'الوقود', description: 'استعرض مخزون الوقود ووحدات البيع المتاحة لدى المزودين.', icon: Icons.Fuel },
]

const DISTRICTS = [
  {
    id: 'al-qahirah', name: 'القاهرة',
    hubs: [
      { name: 'مركز مسبح للتوزيع (غاز)', area: 'حي المسبح · جوار مدرسة الشعب', resource: 'gas' },
      { name: 'محطة مياه النسيم', area: 'جولة سنان · شارع 26', resource: 'water' },
      { name: 'محطة الصقر للمشتقات', area: 'شارع جمال · قرب جولة العواضي', resource: 'fuel' },
    ],
  },
  {
    id: 'al-mudhaffar', name: 'المظفر',
    hubs: [
      { name: 'مركز حبيل سلمان للغاز المنزلي', area: 'حبيل سلمان · جوار جامعة تعز', resource: 'gas' },
      { name: 'نقطة توزيع صهاريج صينة', area: 'وادي المعقب · صينة', resource: 'water' },
      { name: 'محطة بيرباشا المركزية للوقود', area: 'مدخل بيرباشا · خط الحصب', resource: 'fuel' },
    ],
  },
  {
    id: 'salah', name: 'صالة',
    hubs: [
      { name: 'مركز الجحملية للغاز', area: 'الجحملية العليا · قرب المستشفى العسكري', resource: 'gas' },
      { name: 'محطة مياه ثعبات وحوض الأشراف', area: 'شارع 16 · حوض الأشراف', resource: 'water' },
      { name: 'نقطة توزيع المحروقات', area: 'العسكري · جوار مركز الشرطة', resource: 'fuel' },
    ],
  },
]

const FAQS = [
  ['كيف أسجّل حساباً في منصة موارد؟', 'اختر حساب مستفيد أو مقدم خدمة، ثم أدخل البيانات المطلوبة وأكّد رقم هاتفك.'],
  ['كيف أجد المخزون القريب مني؟', 'بعد تسجيل الدخول، افتح استكشاف المخزون وحدد عنوانك أو استخدم موقعك الحالي لعرض المسافة.'],
  ['كيف أعرف الكمية والسعر؟', 'تعرض تفاصيل المخزون الكمية المتاحة ووحدات البيع والأسعار التي سجّلها مقدم الخدمة.'],
  ['كيف أتابع حالة طلبي؟', 'يمكنك عرض طلباتك وحالاتها من «طلباتي وحجوزاتي» في لوحة التحكم.'],
]

const PROCESS = [
  { title: 'أنشئ حسابك', description: 'سجّل كمستفيد أو كمقدم خدمة.', icon: Icons.User },
  { title: 'استعرض المخزون', description: 'ابحث حسب نوع المورد واطّلع على الكمية والسعر والموقع.', icon: Icons.Search },
  { title: 'تابع طلباتك', description: 'راجع حالة الطلب من لوحة التحكم بعد إرساله.', icon: Icons.ShoppingBag },
]

const sectionWidth = 'w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'
const navClass = 'inline-flex items-center min-h-11 rounded-lg px-2.5 text-sm font-bold text-slate-700 hover:text-mawarid-700 hover:bg-slate-50 transition-colors'

export default function HomePage({ go }) {
  const { user } = useAuth()
  const [districtId, setDistrictId] = useState(DISTRICTS[0].id)
  const [menuOpen, setMenuOpen] = useState(false)
  const [regOpen, setRegOpen] = useState(false)
  const registerButton = useRef(null)
  const menuButton = useRef(null)
  const district = DISTRICTS.find(({ id }) => id === districtId)
  const canBrowse = user?.role_name === 'consumer' || user?.role_name === 'admin'
  const openAccount = () => go(user ? ROUTES.DASHBOARD : ROUTES.LOGIN)
  const browseStocks = () => go(canBrowse ? ROUTES.CONSUMER_STOCKS : user ? ROUTES.DASHBOARD : ROUTES.LOGIN)
  const accountLabel = user ? 'لوحة التحكم' : 'تسجيل الدخول'

  function closeOnEscape(event, close, trigger) {
    if (event.key === 'Escape') {
      close(false)
      trigger.current?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-slate-900">
      <a href="#main" className="mw-skip-link mw-button mw-button-primary">تخطَّ إلى المحتوى الرئيسي</a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-canvas">
        <div className={`${sectionWidth} flex min-h-[68px] items-center justify-between gap-2 py-2`}>
          <a href="#top" aria-label="موارد — العودة إلى أعلى الصفحة" className="flex min-h-11 min-w-0 items-center rounded-lg">
            <BrandLogo size="md" />
          </a>
          <nav aria-label="التنقل الرئيسي" className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => <a key={href} className={navClass} href={href}>{label}</a>)}
          </nav>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <button type="button" onClick={openAccount} className={`${navClass} hidden md:inline-flex`}>{accountLabel}</button>
            {!user && (
              <div className="relative" onKeyDown={(event) => closeOnEscape(event, setRegOpen, registerButton)}>
                <button
                  ref={registerButton}
                  type="button"
                  aria-expanded={regOpen}
                  aria-controls="registration-options"
                  onClick={() => { setRegOpen(!regOpen); setMenuOpen(false) }}
                  className="mw-button mw-button-primary px-2.5 sm:px-4"
                >
                  إنشاء حساب
                  <Icons.ChevronDown className={`hidden sm:block h-4 w-4 ${regOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                <div id="registration-options" hidden={!regOpen}>
                  <div className="fixed inset-0 z-40" onClick={() => setRegOpen(false)} aria-hidden="true" />
                  <div className="absolute end-0 z-50 mt-2 w-52 rounded-xl border border-slate-200 bg-canvas p-2 shadow-card fade-in">
                    <button type="button" onClick={() => go(ROUTES.REGISTER_CONSUMER)} className={`${navClass} w-full gap-2`}>
                      <Icons.User className="w-5 h-5" aria-hidden="true" /> مواطن / مستفيد
                    </button>
                    <button type="button" onClick={() => go(ROUTES.REGISTER_PROVIDER)} className={`${navClass} w-full gap-2`}>
                      <Icons.Business className="w-5 h-5" aria-hidden="true" /> وكيل / مقدم خدمة
                    </button>
                  </div>
                </div>
              </div>
            )}
            <button
              ref={menuButton}
              type="button"
              aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => { setMenuOpen(!menuOpen); setRegOpen(false) }}
              onKeyDown={(event) => closeOnEscape(event, setMenuOpen, menuButton)}
              className="mw-button mw-button-secondary mw-icon-button lg:hidden"
            >
              {menuOpen ? <Icons.Close aria-hidden="true" /> : <Icons.Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
        <nav id="mobile-menu" aria-label="قائمة الجوال" hidden={!menuOpen} onKeyDown={(event) => closeOnEscape(event, setMenuOpen, menuButton)} className="lg:hidden border-t border-slate-200 px-4 py-2 fade-in">
          {NAV_LINKS.map(({ href, label }) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className={`${navClass} w-full`}>{label}</a>)}
          <button type="button" onClick={openAccount} className={`${navClass} w-full md:hidden`}>{accountLabel}</button>
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
        <section id="top" className={`${sectionWidth} pt-10 pb-8 sm:pt-16 sm:pb-12`}>
          <div className="max-w-2xl mw-fade-in">
            <p className="inline-flex items-center gap-2 mb-3 text-sm font-bold text-mawarid-700">
              <Icons.MapPin className="w-5 h-5" aria-hidden="true" /> مدينة تعز، اليمن
            </p>
            <h1 className="mw-display">مواردك الأساسية، أقرب إليك.</h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600">خدمات الغاز والمياه والوقود في مكان واحد.</p>
          </div>
        </section>

        <section id="resources" className={`${sectionWidth} pb-10 sm:pb-14`} aria-labelledby="resources-title">
          <h2 id="resources-title" className="mw-h2 mb-4">استكشف الموارد</h2>
          <div className="grid gap-3 md:grid-cols-3 md:gap-4">
            {RESOURCES.map(({ type, name, description, icon: Icon }) => (
              <article key={type} data-resource={type} className="mw-service-card flex items-start gap-3 rounded-2xl border border-slate-200 bg-canvas p-4 sm:p-5 md:flex-col md:p-6">
                <div className="mw-resource grid h-12 w-12 shrink-0 place-items-center rounded-xl">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="mw-h3">{name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button type="button" className="mw-button mw-button-primary" onClick={browseStocks}>
              {canBrowse ? 'استكشاف المخزون المتاح' : user ? 'الانتقال إلى لوحة التحكم' : 'تسجيل الدخول لاستكشاف المخزون'}
            </button>
            {!user && <button type="button" className="mw-button mw-button-secondary" onClick={() => go(ROUTES.REGISTER_CONSUMER)}>تسجيل مستفيد</button>}
          </div>
        </section>

        <section id="centers" className="border-y border-slate-200 bg-slate-50 py-10 sm:py-14" aria-labelledby="centers-title">
          <div className={sectionWidth}>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="centers-title" className="mw-h2">نقاط التوزيع في تعز</h2>
                <p className="mt-1 text-sm text-slate-600">أمثلة من دليل المواقع. راجع المخزون بعد تسجيل الدخول لمعرفة التوفر الحالي.</p>
              </div>
              <div role="group" aria-label="المديرية" className="flex flex-wrap gap-1.5">
                {DISTRICTS.map(({ id, name }) => (
                  <button key={id} type="button" onClick={() => setDistrictId(id)} aria-pressed={id === districtId} className={`mw-button ${id === districtId ? 'mw-button-primary' : 'mw-button-secondary'}`}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div aria-live="polite" className="grid md:grid-cols-3 gap-3">
              {district.hubs.map(({ name, resource, area }) => (
                <article key={name} className="rounded-2xl border border-slate-200 bg-canvas p-4">
                  <ResourceBadge type={resource} />
                  <h3 className="mt-3 font-bold">{name}</h3>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-600">
                    <Icons.MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {area}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className={`${sectionWidth} py-10 sm:py-14`} aria-labelledby="process-title">
          <h2 id="process-title" className="mw-h2 mb-5">كيف تعمل منصة موارد؟</h2>
          <ol className="grid md:grid-cols-3 gap-6">
            {PROCESS.map(({ title, description, icon: Icon }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mawarid-50 text-mawarid-700"><Icon className="w-5 h-5" aria-hidden="true" /></span>
                <div><h3 className="font-bold">{title}</h3><p className="text-sm text-slate-600">{description}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section id="transparency" className={`${sectionWidth} pb-10 sm:pb-14`} aria-labelledby="transparency-title">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-mawarid-50 p-5 sm:p-6">
            <Icons.Shield className="w-6 h-6 mt-1 shrink-0 text-mawarid-700" aria-hidden="true" />
            <div>
              <h2 id="transparency-title" className="mw-h2">الشفافية في عرض المخزون</h2>
              <p className="mt-1 text-sm sm:text-base text-slate-700">تعرض صفحات المخزون بيانات الكمية والسعر والموقع وتاريخ التحديث المسجّلة لدى مقدم الخدمة.</p>
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-slate-200 py-10 sm:py-14" aria-labelledby="faq-title">
          <div className={sectionWidth}>
            <h2 id="faq-title" className="mw-h2 mb-4">الأسئلة الشائعة</h2>
            <div className="max-w-3xl divide-y divide-slate-200 border-y border-slate-200">
              {FAQS.map(([question, answer]) => (
                <details className="group" key={question}>
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-3 font-bold [&::-webkit-details-marker]:hidden">
                    {question}
                    <Icons.ChevronDown className="w-5 h-5 shrink-0 text-mawarid-700 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="pb-4 text-sm text-slate-600 fade-in">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-6">
        <div className={`${sectionWidth} flex flex-wrap items-center justify-between gap-4`}>
          <BrandLogo size="sm" />
          <nav aria-label="روابط الحساب" className="flex flex-wrap gap-1">
            <button type="button" className={navClass} onClick={openAccount}>{accountLabel}</button>
            {!user && (
              <>
                <button type="button" className={navClass} onClick={() => go(ROUTES.REGISTER_PROVIDER)}>تسجيل مقدم خدمة</button>
                <button type="button" className={navClass} onClick={() => go(ROUTES.FORGOT_PASSWORD)}>استعادة كلمة المرور</button>
              </>
            )}
          </nav>
        </div>
      </footer>
    </div>
  )
}
