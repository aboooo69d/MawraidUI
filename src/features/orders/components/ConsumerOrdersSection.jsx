// ═══════════ قسم طلباتي الأخيرة في لوحة التحكم للمستفيد ═══════════
import { useCallback, useEffect, useRef, useState } from 'react'
import { ordersApi } from '../../../services/api'
import { ErrorBanner, Icons, SecondaryBtn } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'
import { formatOrderAmount, isSessionExpiredError } from '../utils'
import OrderCard from './OrderCard'
import CancelOrderSheet from './CancelOrderSheet'

export default function ConsumerOrdersSection({ go, showToast, onSessionExpired }) {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)

  const seqRef = useRef(0)

  const loadRecentOrders = useCallback(async () => {
    const seq = ++seqRef.current
    setLoading(true)
    setErr(null)
    try {
      const res = await ordersApi.listMyOrders({ page: 1, page_size: 4 })
      if (seq !== seqRef.current) return
      setOrders(res.data)
      setMeta(res.meta)
    } catch (e) {
      if (seq !== seqRef.current) return
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setErr(e)
    } finally {
      if (seq === seqRef.current) setLoading(false)
    }
  }, [onSessionExpired])

  useEffect(() => {
    loadRecentOrders()
    return () => {
      seqRef.current++
    }
  }, [loadRecentOrders])

  function handleCancelled(updatedOrder) {
    setCancelTarget(null)
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)))
    showToast?.(`تم إلغاء الطلب ${updatedOrder.order_number} واستعادة الرصيد.`, true)
  }

  return (
    <section className="space-y-4 text-right" aria-label="طلباتي الأخيرة">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-black text-slate-900">طلباتي الأخيرة</h2>
          {meta?.total !== undefined && meta?.total !== null && (
            <span className="px-2.5 py-0.5 rounded-full bg-mawarid-50 border border-mawarid-200 text-mawarid-800 text-xs font-black font-mono" dir="ltr">
              {formatOrderAmount(meta.total)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadRecentOrders}
            disabled={loading}
            aria-label="تحديث الطلبات"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <Icons.Refresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            type="button"
            onClick={() => go(ROUTES.CONSUMER_ORDERS)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-mawarid-700 hover:bg-mawarid-800 text-white text-xs font-bold transition cursor-pointer"
          >
            <span>عرض كل الطلبات</span>
            <Icons.ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-2.5">
          <div className="w-7 h-7 mx-auto border-3 border-mawarid-200 border-t-mawarid-700 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">جارٍ تحميل أحدث طلباتك…</p>
        </div>
      ) : err ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <ErrorBanner err={err} />
          <SecondaryBtn onClick={loadRecentOrders} className="text-xs">
            إعادة المحاولة
          </SecondaryBtn>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-mawarid-50 text-mawarid-700 flex items-center justify-center">
            <Icons.ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900">لا توجد لديك طلبات مسجلة حتى الآن</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            تصفّح المخازن المتاحة بالقرب منك واحجز حصتك من الغاز أو المياه أو الوقود بخطوات بسيطة.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => go(ROUTES.CONSUMER_STOCKS)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mawarid-700 hover:bg-mawarid-800 text-white text-xs font-bold transition cursor-pointer shadow-sm"
            >
              <Icons.Box className="w-4 h-4" />
              <span>استكشاف المخزون وإنشاء طلب</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onSelect={(selected) =>
                go(ROUTES.CONSUMER_ORDER_DETAILS, {
                  orderId: selected.id,
                  backTo: ROUTES.DASHBOARD,
                })
              }
              onCancelClick={(selected) => setCancelTarget(selected)}
            />
          ))}
        </div>
      )}

      <CancelOrderSheet
        order={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={handleCancelled}
        onSessionExpired={onSessionExpired}
      />
    </section>
  )
}
