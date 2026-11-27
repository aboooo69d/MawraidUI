// ═══════════ شاشة إدارة الطلبات الواردة لمزود الخدمة مع ملخص المخزون والفلاتر ═══════════
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ordersApi, stockApi } from '../../../services/api'
import { BackBtn, ErrorBanner, Icons, SecondaryBtn, ThemeToggle } from '../../../shared/components/ui'
import { LoadingCards } from '../../../shared/components/ui/Skeleton'
import { ROUTES } from '../../../shared/constants/routes'
import {
  CONSUMER_TYPE_OPTIONS,
  ORDER_STATUS_FILTERS,
  formatOrderAmount,
  isSessionExpiredError,
} from '../utils'
import ProviderOrderCard from '../components/ProviderOrderCard'
import RejectOrderSheet from '../components/RejectOrderSheet'

export default function ProviderOrdersPage({
  go,
  initialStockId = '',
  showToast,
  onSessionExpired,
}) {
  const [statusFilter, setStatusFilter] = useState('')
  const [consumerTypeFilter, setConsumerTypeFilter] = useState('')
  const [stockIdFilter, setStockIdFilter] = useState(initialStockId || '')
  const [page, setPage] = useState(1)

  const [stocks, setStocks] = useState([])
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const [busyOrderId, setBusyOrderId] = useState(null)
  const [actionErr, setActionErr] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)

  const seqRef = useRef(0)

  useEffect(() => {
    setStockIdFilter(initialStockId || '')
    setPage(1)
  }, [initialStockId])

  const loadMyStocks = useCallback(async () => {
    try {
      const list = await stockApi.getMyStocks()
      setStocks(Array.isArray(list) ? list : [])
    } catch (e) {
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
      }
    }
  }, [onSessionExpired])

  const loadOrders = useCallback(async () => {
    const seq = ++seqRef.current
    setLoading(true)
    setErr(null)

    try {
      const res = await ordersApi.listProviderOrders({
        status: statusFilter || undefined,
        consumer_type: consumerTypeFilter || undefined,
        stock_id: stockIdFilter || undefined,
        page,
        page_size: 10,
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
  }, [statusFilter, consumerTypeFilter, stockIdFilter, page, onSessionExpired])

  useEffect(() => {
    loadMyStocks()
  }, [loadMyStocks])

  useEffect(() => {
    loadOrders()
    return () => {
      seqRef.current++
    }
  }, [loadOrders])

  const stocksMap = useMemo(() => {
    const map = new Map()
    for (const s of stocks) {
      map.set(s.id, s)
    }
    return map
  }, [stocks])

  // إحصائيات حية من GET /api/v1/stocks/me للمخزون المختار أو جميع مخازن المزود
  const summaryCounters = useMemo(() => {
    const relevant = stockIdFilter
      ? stocks.filter((s) => s.id === stockIdFilter)
      : stocks
    if (relevant.length === 0) return null

    let available = 0
    let pending = 0
    let completed = 0
    for (const s of relevant) {
      available += Number(s.available) || 0
      pending += Number(s.pending_orders) || 0
      completed += Number(s.completed_orders) || 0
    }
    return { available, pending, completed, singleStock: relevant.length === 1 ? relevant[0] : null }
  }, [stocks, stockIdFilter])

  const totalPages = Math.max(1, Number(meta?.total_pages) || 1)
  const total = meta?.total
  const hasActiveFilters = Boolean(statusFilter || consumerTypeFilter || stockIdFilter)

  function resetFilters() {
    setStatusFilter('')
    setConsumerTypeFilter('')
    setStockIdFilter('')
    setPage(1)
  }

  function applyOrderMutation(updatedOrder) {
    if (statusFilter && statusFilter !== updatedOrder.status) {
      loadOrders()
    } else {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)))
    }
    loadMyStocks()
  }

  async function handleAccept(order) {
    setActionErr(null)
    setBusyOrderId(order.id)
    try {
      const updated = await ordersApi.acceptProviderOrder(order.id)
      applyOrderMutation(updated)
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
      applyOrderMutation(updated)
      showToast?.(`تم إتمام الطلب ${updated.order_number} وتأكيد الدفع.`, true)
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
    applyOrderMutation(updated)
    showToast?.(`تم رفض الطلب ${updated.order_number} واستعادة الرصيد للمخزون.`, true)
  }

  function refreshAll() {
    loadMyStocks()
    loadOrders()
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* ── الترويسة ── */}
      <header className="bg-canvas border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:justify-between">
          <div className="contents sm:flex sm:items-center sm:gap-2 sm:min-w-0">
            <BackBtn
              onClick={() =>
                initialStockId
                  ? go(ROUTES.STOCK_DASHBOARD, { stockId: initialStockId })
                  : go(ROUTES.DASHBOARD)
              }
              label={initialStockId ? 'إدارة المخزون' : 'لوحة التحكم'}
            />
            <div className="col-span-2 row-start-2 min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight">
                الطلبات الواردة للمزود
              </h1>
              <p className="text-xs text-slate-500">
                قبول، رفض، وإتمام تسليم طلبات المستفيدين
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
            <button
              type="button"
              onClick={refreshAll}
              disabled={loading}
              aria-label="تحديث البيانات"
              className="inline-flex min-h-11 min-w-11 justify-center items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl border border-slate-200 bg-canvas hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              <Icons.Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── المحتوى ── */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-5 text-right">
        {/* 1) بطاقات الملخص الحية من /stocks/me */}
        {summaryCounters && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="ملخص حالة المخزون والطلبات">
            <div className="rounded-2xl border border-mawarid-200 bg-canvas p-4 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">
                  {summaryCounters.singleStock ? 'الرصيد المتاح حالياً' : 'إجمالي الأرصدة المتاحة'}
                </p>
                <p className="mt-1 text-2xl font-black text-mawarid-800 font-mono" dir="ltr">
                  {formatOrderAmount(summaryCounters.available)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-mawarid-50 text-mawarid-700 flex items-center justify-center shrink-0">
                <Icons.Box className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-canvas p-4 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">طلبات قيد الانتظار</p>
                <p className="mt-1 text-2xl font-black text-amber-700 font-mono" dir="ltr">
                  {formatOrderAmount(summaryCounters.pending)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Icons.Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-canvas p-4 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">طلبات مكتملة</p>
                <p className="mt-1 text-2xl font-black text-emerald-700 font-mono" dir="ltr">
                  {formatOrderAmount(summaryCounters.completed)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Icons.Check className="w-5 h-5" />
              </div>
            </div>
          </section>
        )}

        {/* 2) لوحة الفلاتر */}
        <section className="rounded-2xl border border-slate-200 bg-canvas p-4 sm:p-5 shadow-xs space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <Icons.Filter className="w-3.5 h-3.5 text-mawarid-700" />
                <span>حالة الطلب</span>
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {ORDER_STATUS_FILTERS.map((item) => {
                const active = statusFilter === item.value
                return (
                  <button
                    key={item.value || 'all'}
                    type="button"
                    onClick={() => {
                      setStatusFilter(item.value)
                      setPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      active
                        ? 'border-mawarid-700 bg-mawarid-700 text-on-accent shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            {/* فلتر صفة المستفيد */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">صفة المستفيد:</span>
              <button
                type="button"
                onClick={() => {
                  setConsumerTypeFilter('')
                  setPage(1)
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  consumerTypeFilter === ''
                    ? 'border-mawarid-600 bg-mawarid-50 text-mawarid-800'
                    : 'border-slate-200 bg-canvas text-slate-600 hover:bg-slate-50'
                }`}
              >
                الكل
              </button>
              {CONSUMER_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setConsumerTypeFilter(opt.value)
                    setPage(1)
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    consumerTypeFilter === opt.value
                      ? 'border-mawarid-600 bg-mawarid-50 text-mawarid-800'
                      : 'border-slate-200 bg-canvas text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.shortLabel}
                </button>
              ))}
            </div>

            {/* فلتر المخزون (عند تعدد مخازن المزود أو التوجيه من مخزون محدد) */}
            {stocks.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="provider-stock-filter" className="text-xs font-bold text-slate-500 shrink-0">
                  المخزون:
                </label>
                <select
                  id="provider-stock-filter"
                  value={stockIdFilter}
                  onChange={(e) => {
                    setStockIdFilter(e.target.value)
                    setPage(1)
                  }}
                  className="flex-1 min-h-[38px] rounded-xl border border-slate-200 bg-canvas px-3 text-xs font-bold text-slate-800 outline-none focus:border-mawarid-600"
                >
                  <option value="">جميع المخازن ({stocks.length})</option>
                  {stocks.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.type?.name || 'مخزون'} — {s.address || s.id.slice(0, 8)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>

        <ErrorBanner err={actionErr} />

        {/* 3) عداد النتائج */}
        {!loading && !err && (
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              {total !== undefined && total !== null
                ? `إجمالي الطلبات: ${formatOrderAmount(total)}`
                : `الطلبات المعروضة: ${formatOrderAmount(orders.length)}`}
            </span>
            <span>الأحدث أولاً</span>
          </div>
        )}

        {/* 4) قائمة البطاقات */}
        {loading ? (
          <LoadingCards label="جارٍ تحميل الطلبات الواردة…" count={2} />
        ) : err ? (
          <div className="rounded-2xl border border-slate-200 bg-canvas p-6 space-y-4">
            <ErrorBanner err={err} />
            <SecondaryBtn onClick={loadOrders}>إعادة المحاولة</SecondaryBtn>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-canvas p-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <Icons.ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-base font-black text-slate-900">لا توجد طلبات واردة مطابقة</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {hasActiveFilters
                ? 'لا توجد طلبات تطابق الفلاتر المختارة حالياً. جرّب مسح الفلاتر لعرض جميع الطلبات.'
                : 'لم ترد أي طلبات على مخازنك حتى الآن.'}
            </p>
            {hasActiveFilters && (
              <div className="pt-1">
                <SecondaryBtn onClick={resetFilters}>مسح الفلاتر</SecondaryBtn>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => {
              const st = stocksMap.get(order.stock_id)
              const stockLabel = st ? st.type?.name || st.address : null
              return (
                <ProviderOrderCard
                  key={order.id}
                  order={order}
                  stockLabel={stockLabel}
                  actionLoading={busyOrderId === order.id}
                  onSelect={(selected) =>
                    go(ROUTES.PROVIDER_ORDER_DETAILS, {
                      orderId: selected.id,
                      backTo: ROUTES.PROVIDER_ORDERS,
                      backParams: stockIdFilter ? { stockId: stockIdFilter } : {},
                    })
                  }
                  onAccept={handleAccept}
                  onRejectClick={(selected) => setRejectTarget(selected)}
                  onComplete={handleComplete}
                />
              )
            })}
          </div>
        )}

        {/* 5) الترقيم */}
        {!loading && !err && (orders.length > 0 || page > 1) && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <SecondaryBtn
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <span className="inline-flex items-center gap-1.5">
                <Icons.ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </span>
            </SecondaryBtn>

            <div className="text-center">
              <div className="text-xs font-black text-slate-700">
                صفحة {page} من {totalPages}
              </div>
              {total !== undefined && total !== null && (
                <div className="text-[11px] text-slate-400">{formatOrderAmount(total)} طلب</div>
              )}
            </div>

            <SecondaryBtn
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <span className="inline-flex items-center gap-1.5">
                <span>التالي</span>
                <Icons.ArrowLeft className="w-4 h-4" />
              </span>
            </SecondaryBtn>
          </div>
        )}
      </main>

      <RejectOrderSheet
        order={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onRejected={handleRejected}
        onSessionExpired={onSessionExpired}
      />
    </div>
  )
}
