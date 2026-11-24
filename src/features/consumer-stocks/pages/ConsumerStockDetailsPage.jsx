// ═══════════ شاشة تفاصيل المخزون للمستفيد مع الموقع على الخريطة وزر إنشاء الطلب ═══════════
import { useAuth } from '../../auth/hooks/useAuth'
import { BackBtn, ErrorBanner, Icons, PrimaryBtn, SecondaryBtn } from '../../../shared/components/ui'
import LocationPicker from '../../../shared/components/ui/LocationPicker'
import { ROUTES } from '../../../shared/constants/routes'
import { useConsumerStockDetails } from '../hooks/useConsumerStockDetails'
import { formatAmount, formatDateTime, formatGazStockType, formatPrice } from '../utils/format'
import { isValidCoords } from '../utils/geo'
import { StockTypeIcon } from '../components/ConsumerStockCard'

export default function ConsumerStockDetailsPage({
  go,
  stockId,
  showToast,
  onSessionExpired,
  onCreateOrder,
}) {
  const { user } = useAuth()
  const isConsumer = user?.role_name === 'consumer'

  const {
    stock,
    defaultAddress,
    distanceKm,
    distanceFormatted,
    loading,
    err,
    reload,
  } = useConsumerStockDetails(stockId, { isConsumer, onSessionExpired })

  const isAvailable = Number(stock?.available) > 0
  const units = Array.isArray(stock?.units) ? stock.units : []
  const balances = Array.isArray(stock?.balances) ? stock.balances : []
  const mainUnit = units.find((u) => u.is_main) || units[0]
  const gazTypeLabel = formatGazStockType(stock?.stock_details?.gaz_stock_type)

  const pendingOrders = Number(stock?.pending_orders) || 0
  const completedOrders = Number(stock?.completed_orders) || 0
  const totalOrders = pendingOrders + completedOrders

  const hasValidLocation = isValidCoords(stock?.location)

  function handleCreateOrder() {
    if (!stock || !isAvailable) return
    if (typeof onCreateOrder === 'function') {
      onCreateOrder(stock)
      return
    }
    showToast?.('ميزة إنشاء الطلب قيد التطوير وستتوفر قريباً.', true)
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* ── الترويسة ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BackBtn onClick={() => go(ROUTES.CONSUMER_STOCKS)} label="قائمة المخزون" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                {stock?.type?.name || 'تفاصيل المخزون'}
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {stock?.address || 'معلومات المخزون، الأسعار، الموقع وحالة الطلبات'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={reload}
            disabled={loading}
            aria-label="تحديث بيانات المخزون"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <Icons.Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </header>

      {/* ── المحتوى ── */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-5 text-right">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-3 border-mawarid-200 border-t-mawarid-700 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-600">جارٍ تحميل تفاصيل المخزون…</p>
          </div>
        ) : err ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <ErrorBanner err={err} />
            <div className="flex flex-wrap gap-2">
              <SecondaryBtn onClick={reload}>إعادة المحاولة</SecondaryBtn>
              <SecondaryBtn onClick={() => go(ROUTES.CONSUMER_STOCKS)}>العودة لقائمة المخزون</SecondaryBtn>
            </div>
          </div>
        ) : !stock ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
            <p className="text-sm font-bold text-slate-600">لم يتم العثور على بيانات هذا المخزون.</p>
            <SecondaryBtn onClick={() => go(ROUTES.CONSUMER_STOCKS)}>العودة لقائمة المخزون</SecondaryBtn>
          </div>
        ) : (
          <>
            {/* 1) بطاقة الملخص الرئيسية + زر إنشاء الطلب */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-black text-slate-800">
                      <StockTypeIcon slug={stock.type?.slug} />
                      <span>{stock.type?.name || 'مخزون'}</span>
                    </span>

                    {gazTypeLabel && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800">
                        {gazTypeLabel}
                      </span>
                    )}

                    <span
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-black border ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isAvailable ? 'متوفر' : 'نفد المخزون'}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {stock.type?.name || 'مخزون'}
                  </h2>

                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <Icons.MapPin className="w-4 h-4 text-mawarid-700 shrink-0 mt-0.5" />
                    <span className="font-bold text-slate-800 leading-relaxed break-words">
                      {stock.address || 'عنوان غير محدد'}
                    </span>
                  </div>
                </div>

                {/* شارة المسافة من العنوان الافتراضي */}
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  {distanceKm !== null ? (
                    <div
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-mawarid-50 border border-mawarid-200 text-mawarid-800"
                      title={`المسافة التقريبية: ${distanceKm} كم`}
                    >
                      <Icons.Navigation className="w-4 h-4 shrink-0" />
                      <div className="text-right">
                        <div className="text-sm font-black">{distanceFormatted}</div>
                        <div className="text-[11px] text-mawarid-700 font-mono" dir="ltr">
                          {distanceKm.toFixed(1)} km
                        </div>
                      </div>
                    </div>
                  ) : isConsumer ? (
                    <button
                      type="button"
                      onClick={() => go(ROUTES.CITIZEN_ADDRESSES)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-mawarid-200 bg-mawarid-50 hover:bg-mawarid-100 text-mawarid-800 text-xs font-bold transition cursor-pointer"
                    >
                      <Icons.MapPin className="w-3.5 h-3.5" />
                      <span>أضف عنواناً افتراضياً لحساب المسافة</span>
                    </button>
                  ) : null}

                  {defaultAddress && distanceKm !== null && (
                    <span className="text-[11px] text-slate-500">
                      من عنوانك الافتراضي: <strong className="text-slate-700">{defaultAddress.title || 'العنوان الافتراضي'}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* الكمية المتوفرة + زر إنشاء الطلب */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-mawarid-700 shrink-0">
                    <Icons.Box className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500">الكمية المتوفرة</div>
                    <div className={`text-xl font-black ${isAvailable ? 'text-emerald-700' : 'text-rose-700'}`}>
                      <span className="font-mono" dir="ltr">{formatAmount(stock.available)}</span>{' '}
                      <span className="text-sm font-bold">{mainUnit?.name || ''}</span>
                    </div>
                  </div>
                </div>

                <div className="sm:min-w-[220px]">
                  <PrimaryBtn
                    type="button"
                    onClick={handleCreateOrder}
                    disabled={!isAvailable}
                    className="w-full"
                  >
                    <Icons.Plus className="w-4 h-4" />
                    <span>{isAvailable ? 'إنشاء طلب' : 'غير متاح للطلب حالياً'}</span>
                  </PrimaryBtn>
                </div>
              </div>
            </section>

            {/* 2) إحصائيات الطلبات */}
            <section aria-label="إحصائيات الطلبات" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500">الطلبات قيد الانتظار</p>
                  <p className="mt-1 text-2xl font-black text-amber-700 font-mono" dir="ltr">
                    {formatAmount(pendingOrders)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Icons.Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500">الطلبات المكتملة</p>
                  <p className="mt-1 text-2xl font-black text-emerald-700 font-mono" dir="ltr">
                    {formatAmount(completedOrders)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Icons.Check className="w-5 h-5" />
                </div>
              </div>

              <div className="rounded-2xl border border-mawarid-200 bg-white p-4 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500">إجمالي الطلبات</p>
                  <p className="mt-1 text-2xl font-black text-mawarid-800 font-mono" dir="ltr">
                    {formatAmount(totalOrders)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-mawarid-50 text-mawarid-700 flex items-center justify-center shrink-0">
                  <Icons.FileText className="w-5 h-5" />
                </div>
              </div>
            </section>

            {/* 3) الوحدات المتاحة والأسعار */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-black text-slate-900">الوحدات المتاحة والأسعار</h2>
                <span className="text-xs text-slate-500 font-bold">
                  {formatAmount(units.length)} وحدة
                </span>
              </div>

              {units.length === 0 ? (
                <p className="text-xs text-slate-500">لا توجد وحدات مسجلة لهذا المخزون حالياً.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {units.map((unit) => {
                    const balanceObj = balances.find((b) => b.unit_id === unit.id || b.unit === unit.name)
                    const unitAmount =
                      balanceObj?.amount ??
                      (unit.rate > 0 ? Math.floor((Number(stock.available) || 0) / unit.rate) : 0)

                    return (
                      <div
                        key={unit.id}
                        className={`rounded-xl border p-4 space-y-2.5 ${
                          unit.is_main
                            ? 'border-mawarid-200 bg-mawarid-50/40'
                            : 'border-slate-200 bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-black text-slate-900 truncate">{unit.name}</span>
                            {unit.is_main && (
                              <span className="px-2 py-0.5 rounded-full bg-mawarid-100 text-mawarid-800 text-[10px] font-bold shrink-0">
                                رئيسية
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-black text-mawarid-800 shrink-0">
                            <span className="font-mono" dir="ltr">{formatPrice(unit.price)}</span>{' '}
                            <span className="text-xs font-bold text-slate-500">ريال</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-600 pt-1.5 border-t border-slate-200/70">
                          <span>
                            المتوفر:{' '}
                            <strong className="font-mono text-slate-900" dir="ltr">
                              {formatAmount(unitAmount)}
                            </strong>{' '}
                            {unit.name}
                          </span>
                          {!unit.is_main && mainUnit && (
                            <span className="text-slate-500">
                              المعامل: <strong className="font-mono" dir="ltr">{formatAmount(unit.rate)}</strong> {mainUnit.name}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* 4) العنوان والموقع على الخريطة */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-black text-slate-900">العنوان والموقع على الخريطة</h2>
                  <p className="text-sm text-slate-600 mt-1">{stock.address || 'عنوان غير محدد'}</p>
                </div>

                {hasValidLocation && (
                  <a
                    href={`https://www.google.com/maps?q=${stock.location.lat},${stock.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition self-start sm:self-center"
                  >
                    <Icons.MapPin className="w-3.5 h-3.5 text-mawarid-700" />
                    <span>فتح في الخرائط</span>
                  </a>
                )}
              </div>

              {hasValidLocation ? (
                <>
                  <LocationPicker
                    lat={stock.location.lat}
                    lng={stock.location.lng}
                    readOnly
                    height={280}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      الإحداثيات:{' '}
                      <span className="font-mono text-slate-700" dir="ltr">
                        {stock.location.lat}, {stock.location.lng}
                      </span>
                    </span>
                    {distanceKm !== null && (
                      <span className="font-bold text-mawarid-700">
                        المسافة من عنوانك الافتراضي: {distanceFormatted} ({distanceKm.toFixed(1)} كم)
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                  لا تتوفر إحداثيات جغرافية لهذا المخزون لعرضها على الخريطة.
                </div>
              )}
            </section>

            {/* 5) تذييل التواريخ */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-1">
              <span className="inline-flex items-center gap-1">
                <Icons.Clock className="w-3.5 h-3.5" />
                <span>آخر تحديث: {formatDateTime(stock.updated_at)}</span>
              </span>
              {stock.created_at && (
                <span>تاريخ الإضافة: {formatDateTime(stock.created_at)}</span>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
