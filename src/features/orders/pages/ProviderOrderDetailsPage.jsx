// ═══════════ شاشة تفاصيل طلب وارد لمزود الخدمة مع إجراءات القبول والرفض والإتمام ═══════════
import { useCallback, useEffect, useRef, useState } from 'react'
import { ordersApi } from '../../../services/api'
import { BackBtn, ErrorBanner, Icons, SecondaryBtn, ThemeToggle } from '../../../shared/components/ui'
import LocationPicker from '../../../shared/components/ui/LocationPicker'
import { LoadingCards } from '../../../shared/components/ui/Skeleton'
import { ROUTES } from '../../../shared/constants/routes'
import {
  formatConsumerType,
  formatOrderAmount,
  formatOrderDateTime,
  formatOrderGazType,
  formatOrderPrice,
  formatPaymentMethod,
  getOrderStatusMeta,
  getPaymentStatusMeta,
  isSessionExpiredError,
} from '../utils'
import RejectOrderSheet from '../components/RejectOrderSheet'

export default function ProviderOrderDetailsPage({
  go,
  orderId,
  backTo = ROUTES.PROVIDER_ORDERS,
  backParams = {},
  showToast,
  onSessionExpired,
}) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const [actionBusy, setActionBusy] = useState(false)
  const [actionErr, setActionErr] = useState(null)
  const [showRejectSheet, setShowRejectSheet] = useState(false)

  const seqRef = useRef(0)

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setOrder(null)
      setErr(new Error('معرّف الطلب غير محدد.'))
      setLoading(false)
      return
    }

    const seq = ++seqRef.current
    setLoading(true)
    setErr(null)

    try {
      const data = await ordersApi.getProviderOrder(orderId)
      if (seq !== seqRef.current) return
      setOrder(data)
    } catch (e) {
      if (seq !== seqRef.current) return
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setOrder(null)
      setErr(e)
    } finally {
      if (seq === seqRef.current) setLoading(false)
    }
  }, [orderId, onSessionExpired])

  useEffect(() => {
    loadOrder()
    return () => {
      seqRef.current++
    }
  }, [loadOrder])

  async function handleAccept() {
    if (!order) return
    setActionErr(null)
    setActionBusy(true)
    try {
      const updated = await ordersApi.acceptProviderOrder(order.id)
      setOrder(updated)
      showToast?.(`تم قبول الطلب ${updated.order_number} بنجاح.`, true)
    } catch (e) {
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setActionErr(e)
    } finally {
      setActionBusy(false)
    }
  }

  async function handleComplete() {
    if (!order) return
    setActionErr(null)
    setActionBusy(true)
    try {
      const updated = await ordersApi.completeProviderOrder(order.id)
      setOrder(updated)
      showToast?.(`تم إتمام تسليم الطلب ${updated.order_number} وتحصيل المبلغ.`, true)
    } catch (e) {
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setActionErr(e)
    } finally {
      setActionBusy(false)
    }
  }

  function handleRejected(updated) {
    setShowRejectSheet(false)
    setOrder(updated)
    showToast?.(`تم رفض الطلب ${updated.order_number} واستعادة الرصيد للمخزون.`, true)
  }

  const statusMeta = getOrderStatusMeta(order?.status)
  const payStatusMeta = getPaymentStatusMeta(order?.payment_status)
  const gazType = formatOrderGazType(order?.order_details?.gaz_stock_type)
  const isPending = order?.status === 'pending'
  const isAccepted = order?.status === 'accepted'
  const hasAddressCoords =
    Number.isFinite(Number(order?.address?.lat)) &&
    Number.isFinite(Number(order?.address?.lng)) &&
    (Number(order?.address?.lat) !== 0 || Number(order?.address?.lng) !== 0)

  const backLabel =
    backTo === ROUTES.DASHBOARD
      ? 'لوحة التحكم'
      : backTo === ROUTES.STOCK_DASHBOARD
      ? 'إدارة المخزون'
      : 'الطلبات الواردة'

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* ── الترويسة ── */}
      <header className="bg-canvas border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:justify-between">
          <div className="contents sm:flex sm:items-center sm:gap-2 sm:min-w-0">
            <BackBtn onClick={() => go(backTo, backParams)} label={backLabel} />
            <div className="col-span-2 row-start-2 min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight">
                تفاصيل الطلب الوارد
              </h1>
              {order?.order_number && (
                <p className="text-xs text-slate-500 font-mono truncate" dir="ltr">
                  {order.order_number}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
            <button
              type="button"
              onClick={loadOrder}
              disabled={loading}
              aria-label="تحديث بيانات الطلب"
              className="inline-flex min-h-11 min-w-11 justify-center items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl border border-slate-200 bg-canvas hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              <Icons.Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── المحتوى ── */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-5 text-right">
        {loading ? (
          <LoadingCards label="جارٍ تحميل تفاصيل الطلب…" />
        ) : err ? (
          <div className="rounded-2xl border border-slate-200 bg-canvas p-6 space-y-4">
            <ErrorBanner err={err} />
            <div className="flex flex-wrap gap-2">
              <SecondaryBtn onClick={loadOrder}>إعادة المحاولة</SecondaryBtn>
              <SecondaryBtn onClick={() => go(ROUTES.PROVIDER_ORDERS)}>العودة للطلبات الواردة</SecondaryBtn>
            </div>
          </div>
        ) : !order ? (
          <div className="rounded-2xl border border-slate-200 bg-canvas p-10 text-center space-y-3">
            <p className="text-sm font-bold text-slate-600">لم يتم العثور على هذا الطلب.</p>
            <SecondaryBtn onClick={() => go(ROUTES.PROVIDER_ORDERS)}>العودة للطلبات الواردة</SecondaryBtn>
          </div>
        ) : (
          <>
            <ErrorBanner err={actionErr} />

            {/* 1) بطاقة الملخص والإجراءات التنفيذية */}
            <section className="rounded-2xl border border-slate-200 bg-canvas p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-black ${statusMeta.badgeClass}`}>
                      <span className={`w-2 h-2 rounded-full ${statusMeta.dotClass}`} />
                      <span>{statusMeta.label}</span>
                    </span>
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${payStatusMeta.badgeClass}`}>
                      {payStatusMeta.label}
                    </span>
                    {gazType && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
                        {gazType}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-mono" dir="ltr">
                    {order.order_number}
                  </h2>

                  <p className="text-xs text-slate-500">
                    تاريخ ورود الطلب: <strong className="text-slate-700">{formatOrderDateTime(order.created_at)}</strong>
                  </p>
                </div>

                <div className="rounded-2xl bg-mawarid-50/70 border border-mawarid-200 px-4 py-3 text-right sm:text-left shrink-0">
                  <div className="text-xs font-bold text-mawarid-700">المبلغ المستحق</div>
                  <div className="text-2xl font-black text-mawarid-950">
                    <span className="font-mono" dir="ltr">{formatOrderPrice(order.total_price)}</span>{' '}
                    <span className="text-xs font-bold text-mawarid-800">ريال</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 mt-0.5">
                    {formatPaymentMethod(order.payment_method)}
                  </div>
                </div>
              </div>

              {/* شريط اتخاذ القرار للمزود */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => go(ROUTES.STOCK_DASHBOARD, { stockId: order.stock_id })}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  <Icons.Box className="w-4 h-4 text-mawarid-700" />
                  <span>إدارة المخزون المرتبط</span>
                </button>

                <div className="flex flex-wrap items-center gap-2.5">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={handleAccept}
                        disabled={actionBusy}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-solid hover:bg-emerald-solid/90 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60"
                      >
                        {actionBusy ? (
                          <Icons.Refresh className="w-4 h-4 animate-spin" />
                        ) : (
                          <Icons.Check className="w-4 h-4" />
                        )}
                        <span>قبول الطلب الآن</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowRejectSheet(true)}
                        disabled={actionBusy}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer disabled:opacity-60"
                      >
                        <Icons.Ban className="w-4 h-4" />
                        <span>رفض الطلب</span>
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      type="button"
                      onClick={handleComplete}
                      disabled={actionBusy}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-mawarid-700 hover:bg-mawarid-800 text-on-accent text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60"
                    >
                      {actionBusy ? (
                        <Icons.Refresh className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icons.Check className="w-4 h-4" />
                      )}
                      <span>إتمام التسليم وتأكيد التحصيل النقدي</span>
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* 2) تفاصيل الكمية وصفة المستفيد */}
            <section className="rounded-2xl border border-slate-200 bg-canvas p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900">تفاصيل الحجز وصفة المستفيد</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                  <span className="text-xs text-slate-500 block">الوحدة المطلوبة</span>
                  <span className="text-sm font-black text-slate-900 mt-1 block">{order.unit_name}</span>
                  {Number(order.unit_rate) > 1 && (
                    <span className="text-[11px] text-slate-500">
                      المعامل: <strong className="font-mono" dir="ltr">{formatOrderAmount(order.unit_rate)}</strong>
                    </span>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                  <span className="text-xs text-slate-500 block">الكمية المحجوزة</span>
                  <span className="text-sm font-black text-slate-900 font-mono mt-1 block" dir="ltr">
                    {formatOrderAmount(order.quantity)}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                  <span className="text-xs text-slate-500 block">سعر الوحدة</span>
                  <span className="text-sm font-black text-slate-900 mt-1 block">
                    <span className="font-mono" dir="ltr">{formatOrderPrice(order.unit_price)}</span> ريال
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                  <span className="text-xs text-slate-500 block">صفة المستفيد</span>
                  <span className="text-sm font-black text-slate-900 mt-1 block">
                    {formatConsumerType(order.consumer_type)}
                  </span>
                </div>
              </div>

              {(order.notes || order.reason) && (
                <div className="space-y-2.5 pt-2">
                  {order.notes && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950">
                      <span className="font-black block mb-1">ملاحظات المستفيد للتسليم:</span>
                      <p className="leading-relaxed whitespace-pre-wrap">{order.notes}</p>
                    </div>
                  )}

                  {order.reason && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-900">
                      <span className="font-black block mb-1">
                        {order.status === 'rejected' ? 'سبب الرفض المسجّل:' : 'سبب الإلغاء:'}
                      </span>
                      <p className="leading-relaxed whitespace-pre-wrap">{order.reason}</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 3) موقع وعنوان المستفيد للتوصيل */}
            {order.address && (
              <section className="rounded-2xl border border-slate-200 bg-canvas p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      عنوان التوصيل: {order.address.title || 'عنوان المستفيد'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">{order.address.description}</p>
                  </div>

                  {hasAddressCoords && (
                    <a
                      href={`https://www.google.com/maps?q=${order.address.lat},${order.address.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition self-start sm:self-center"
                    >
                      <Icons.Navigation className="w-3.5 h-3.5 text-mawarid-700" />
                      <span>التوجيه عبر خرائط Google</span>
                    </a>
                  )}
                </div>

                {hasAddressCoords && (
                  <LocationPicker
                    lat={Number(order.address.lat)}
                    lng={Number(order.address.lng)}
                    readOnly
                    height={240}
                  />
                )}
              </section>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-1">
              <span>آخر تحديث: {formatOrderDateTime(order.updated_at)}</span>
              {order.transaction_id && (
                <span className="font-mono" dir="ltr">Ref: {order.transaction_id.slice(0, 8)}</span>
              )}
            </div>
          </>
        )}
      </main>

      <RejectOrderSheet
        order={showRejectSheet ? order : null}
        onClose={() => setShowRejectSheet(false)}
        onRejected={handleRejected}
        onSessionExpired={onSessionExpired}
      />
    </div>
  )
}
