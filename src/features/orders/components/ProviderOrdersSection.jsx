// ═══════════ قسم الطلبات الواردة في لوحة تحكم المزود ═══════════
import { useCallback, useEffect, useRef, useState } from 'react'
import { ordersApi } from '../../../services/api'
import { ErrorBanner, Icons, SecondaryBtn } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'
import { formatOrderAmount, isSessionExpiredError } from '../utils'
import ProviderOrderCard from './ProviderOrderCard'
import RejectOrderSheet from './RejectOrderSheet'

const QUICK_STATUS_TABS = [
  { value: '', label: 'الكل' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'accepted', label: 'مقبول (قيد التسليم)' },
  { value: 'completed', label: 'مكتمل' },
]

export default function ProviderOrdersSection({
  go,
  showToast,
  onSessionExpired,
  onOrderChanged,
}) {
  const [statusFilter, setStatusFilter] = useState('')
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const [busyOrderId, setBusyOrderId] = useState(null)
  const [actionErr, setActionErr] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)

  const seqRef = useRef(0)

  const loadOrders = useCallback(async () => {
    const seq = ++seqRef.current
    setLoading(true)
    setErr(null)

    try {
      const res = await ordersApi.listProviderOrders({
        status: statusFilter || undefined,
        page: 1,
        page_size: 6,
      })
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
  }, [statusFilter, onSessionExpired])

  useEffect(() => {
    loadOrders()
    return () => {
      seqRef.current++
    }
  }, [loadOrders])

  function applyOrderUpdate(updatedOrder) {
    if (statusFilter && statusFilter !== updatedOrder.status) {
      loadOrders()
    } else {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)))
    }
    onOrderChanged?.(updatedOrder)
  }

  async function handleAccept(order) {
    setActionErr(null)
    setBusyOrderId(order.id)
    try {
      const updated = await ordersApi.acceptProviderOrder(order.id)
      applyOrderUpdate(updated)
      showToast?.(`تم قبول الطلب ${updated.order_number} بنجاح.`, true)
    } catch (e) {
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setActionErr(e)
    } finally {
      setBusyOrderId(null)
    }
  }

  async function handleComplete(order) {
    setActionErr(null)
    setBusyOrderId(order.id)
    try {
      const updated = await ordersApi.completeProviderOrder(order.id)
      applyOrderUpdate(updated)
      showToast?.(`تم إتمام الطلب ${updated.order_number} وتأكيد الاستلام.`, true)
    } catch (e) {
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setActionErr(e)
    } finally {
      setBusyOrderId(null)
    }
  }

  function handleRejected(updated) {
    setRejectTarget(null)
    applyOrderUpdate(updated)
    showToast?.(`تم رفض الطلب ${updated.order_number} واستعادة الرصيد للمخزون.`, true)
  }

  return (
    <section className="space-y-4 text-right" aria-label="الطلبات الواردة للمزود">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-black text-slate-900">الطلبات الواردة من المستفيدين</h2>
          {meta?.total !== undefined && meta?.total !== null && (
            <span className="px-2.5 py-0.5 rounded-full bg-mawarid-50 border border-mawarid-200 text-mawarid-800 text-xs font-black font-mono" dir="ltr">
              {formatOrderAmount(meta.total)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            aria-label="تحديث الطلبات الواردة"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <Icons.Refresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            type="button"
            onClick={() => go(ROUTES.PROVIDER_ORDERS)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-mawarid-700 hover:bg-mawarid-800 text-white text-xs font-bold transition cursor-pointer"
          >
            <span>إدارة كل الطلبات</span>
            <Icons.ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ألسنة تصفية سريعة */}
      <div className="flex flex-wrap gap-2">
        {QUICK_STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.value
          return (
            <button
              key={tab.value || 'all'}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                active
                  ? 'border-mawarid-700 bg-mawarid-700 text-white shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <ErrorBanner err={actionErr} />

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-2.5">
          <div className="w-7 h-7 mx-auto border-3 border-mawarid-200 border-t-mawarid-700 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">جارٍ تحميل الطلبات الواردة…</p>
        </div>
      ) : err ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <ErrorBanner err={err} />
          <SecondaryBtn onClick={loadOrders} className="text-xs">
            إعادة المحاولة
          </SecondaryBtn>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-2.5 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <Icons.ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900">
            {statusFilter ? 'لا توجد طلبات مطابقة لهذه الحالة حالياً' : 'لا توجد طلبات واردة حتى الآن'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            ستظهر هنا طلبات المستفيدين الجديدة فور إنشائها لتتمكن من قبولها وإتمام تسليمها.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <ProviderOrderCard
              key={order.id}
              order={order}
              actionLoading={busyOrderId === order.id}
              onSelect={(selected) =>
                go(ROUTES.PROVIDER_ORDER_DETAILS, {
                  orderId: selected.id,
                  backTo: ROUTES.DASHBOARD,
                })
              }
              onAccept={handleAccept}
              onRejectClick={(selected) => setRejectTarget(selected)}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}

      <RejectOrderSheet
        order={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onRejected={handleRejected}
        onSessionExpired={onSessionExpired}
      />
    </section>
  )
}
