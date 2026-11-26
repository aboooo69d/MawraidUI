import { getResourceTheme } from '../../../shared/constants/resources'
// ═══════════ لوحة إدارة المخزون — الرصيد والأرصدة والإجراءات السريعة ═══════════
import { ROUTES } from '../../../shared/constants/routes'
import { Icons } from '../../../shared/components/ui'
import StockPage from '../components/StockPage'
import { StockLoading, StockErrorState, SessionExpiredState, StockEmptyState } from '../components/StockStates'
import { useStock } from '../hooks/useStock'
import { formatAmount, formatDateTime, formatGazStockType, formatPrice, isSessionExpired } from '../utils'

const QUICK_ACTIONS = [
  { key: 'orders', label: 'الطلبات الواردة', hint: 'قبول وتسليم الطلبات', icon: Icons.ShoppingBag, route: ROUTES.PROVIDER_ORDERS, params: {}, tone: 'amber' },
  { key: 'in', label: 'إضافة كمية', hint: 'توريد وارد', icon: Icons.Plus, route: ROUTES.STOCK_TRANSACTION, params: { direction: 'in' }, tone: 'emerald' },
  { key: 'out', label: 'سحب كمية', hint: 'صرف منصرف', icon: Icons.Minus, route: ROUTES.STOCK_TRANSACTION, params: { direction: 'out' }, tone: 'rose' },
  { key: 'units', label: 'إدارة الوحدات', hint: 'إضافة وتعديل', icon: Icons.Settings, route: ROUTES.STOCK_UNITS, params: {}, tone: 'mawarid' },
  { key: 'history', label: 'سجل الحركات', hint: 'الوارد والمنصرف', icon: Icons.History, route: ROUTES.STOCK_HISTORY, params: {}, tone: 'sky' },
]

const TONES = {
  amber: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  mawarid: 'bg-mawarid-50 text-mawarid-700 border-mawarid-200 hover:bg-mawarid-100',
  sky: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
}

export default function StockDashboardPage({ go, stockId }) {
  const { status, stock, err, reload } = useStock(stockId)

  const headerAction = (
    <button
      type="button"
      onClick={reload}
      aria-label="تحديث بيانات المخزون"
      className="w-11 h-11 rounded-xl border border-slate-200 bg-canvas text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition"
    >
      <Icons.Refresh className="w-4 h-4" />
    </button>
  )

  let body
  if (status === 'loading') {
    body = <StockLoading />
  } else if (status === 'error') {
    body = isSessionExpired(err) ? <SessionExpiredState go={go} /> : <StockErrorState err={err} onRetry={reload} />
  } else if (status === 'empty') {
    body = <StockEmptyState go={go} />
  } else {
    const mainUnit = stock?.units?.find((u) => u.is_main)
    const balances = Array.isArray(stock?.balances) ? stock.balances : []
    const unitsCount = Array.isArray(stock?.units) ? stock.units.length : 0
    const StockIcon = getResourceTheme(stock?.type?.slug) === 'gas' ? Icons.Gas : Icons.Box
    const gazTypeLabel = formatGazStockType(stock?.stock_details?.gaz_stock_type)
    const hasCoords =
      stock?.location &&
      typeof stock.location.lat === 'number' &&
      typeof stock.location.lng === 'number'

    body = (
      <>
        {/* ── الرصيد المتاح بالوحدة الرئيسية ── */}
        <div className="mw-service-summary rounded-2xl p-4 sm:p-6 text-slate-900">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-canvas text-mawarid-700 flex items-center justify-center shrink-0">
                  <StockIcon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="mw-h3">{stock?.type?.name || 'المخزون الحالي'}</h2>
                    {gazTypeLabel && (
                      <span className="px-2 py-0.5 rounded-full bg-canvas border border-slate-200 text-mawarid-700 text-[10px] font-bold">
                        {gazTypeLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">الرصيد المتاح{mainUnit?.name ? ` (${mainUnit.name})` : ''}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-600">محدّث {formatDateTime(stock?.updated_at)}</span>
            </div>

            <div className="mt-5 flex items-end gap-2">
              <span className="text-4xl font-black font-mono" dir="ltr">{formatAmount(stock?.available)}</span>
              <span className="text-sm font-bold text-slate-600 pb-1.5">{mainUnit?.name || ''}</span>
            </div>
          </div>
        </div>

        {/* ── عدادات الطلبات الحية لهذا المخزون (إن توفرت) ── */}
        {(stock?.pending_orders !== undefined || stock?.completed_orders !== undefined) && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => go(ROUTES.PROVIDER_ORDERS, { stockId: stock.id })}
              className="rounded-2xl border border-amber-200 bg-canvas p-3 sm:p-4 flex flex-wrap gap-2 items-center justify-between text-right hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-slate-500">طلبات قيد الانتظار</p>
                <p className="mt-1 text-2xl font-black text-amber-700 font-mono" dir="ltr">
                  {formatAmount(stock.pending_orders ?? 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Icons.Clock className="w-5 h-5" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => go(ROUTES.PROVIDER_ORDERS, { stockId: stock.id })}
              className="rounded-2xl border border-emerald-200 bg-canvas p-3 sm:p-4 flex flex-wrap gap-2 items-center justify-between text-right hover:border-emerald-400 transition cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-slate-500">طلبات مكتملة</p>
                <p className="mt-1 text-2xl font-black text-emerald-700 font-mono" dir="ltr">
                  {formatAmount(stock.completed_orders ?? 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Icons.Check className="w-5 h-5" />
              </div>
            </button>
          </div>
        )}

        {/* ── أرصدة جميع الوحدات (من الخادم دون حسابات محلية) ── */}
        <div className="rounded-2xl border border-slate-200 bg-canvas p-5 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-3">الأرصدة بكل الوحدات</h3>
          {balances.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {balances.map((b) => {
                const unitObj = stock?.units?.find((u) => u.id === b.unit_id || u.name === b.unit)
                return (
                  <div key={b.unit_id} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                    <div className="text-lg font-black text-slate-900 font-mono" dir="ltr">{formatAmount(b.amount)}</div>
                    <div className="text-[11px] font-bold text-slate-500 mt-0.5">{b.unit}</div>
                    {unitObj?.price !== undefined && unitObj?.price !== null && (
                      <div className="text-[11px] font-bold text-mawarid-700 mt-1">
                        السعر: <span className="font-mono" dir="ltr">{formatPrice(unitObj.price)}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400">لا توجد أرصدة مسجلة بعد.</p>
          )}
        </div>

        {/* ── الإجراءات السريعة ── */}
        <div className="rounded-2xl border border-slate-200 bg-canvas p-5 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-3">الإجراءات السريعة</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => go(a.route, { ...a.params, stockId: stock.id })}
                  className={`min-h-[84px] rounded-xl border p-3 flex flex-col items-center justify-center gap-1.5 text-center transition cursor-pointer ${TONES[a.tone]}`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-xs font-black">{a.label}</span>
                  <span className="text-[10px] font-bold opacity-70">{a.hint}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── بيانات المخزون ── */}
        <div className="rounded-2xl border border-slate-200 bg-canvas p-5 text-xs shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-3">بيانات المخزون</h3>
          <div className="space-y-2">
            <div className="flex justify-between gap-4 text-slate-600">
              <span>نوع المخزون:</span>
              <span className="font-bold text-slate-800">{stock?.type?.name || '—'}</span>
            </div>
            {gazTypeLabel && (
              <div className="flex justify-between gap-4 text-slate-600">
                <span>نوع مخزون الغاز:</span>
                <span className="font-bold text-slate-800">{gazTypeLabel}</span>
              </div>
            )}
            <div className="flex justify-between gap-4 text-slate-600">
              <span className="shrink-0">العنوان:</span>
              <span className="font-bold text-slate-800 text-left">{stock?.address || '—'}</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-600">
              <span>الإحداثيات:</span>
              {hasCoords ? (
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="font-mono" dir="ltr">
                    {stock.location.lat}, {stock.location.lng}
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${stock.location.lat},${stock.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-mawarid-700 hover:underline"
                  >
                    خريطة
                  </a>
                </span>
              ) : (
                <span className="font-bold text-slate-800">—</span>
              )}
            </div>
            <div className="flex justify-between gap-4 text-slate-600">
              <span>الوحدة الرئيسية:</span>
              <span className="font-bold text-slate-800">{mainUnit?.name || '—'}</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-600">
              <span>عدد الوحدات:</span>
              <span className="font-bold text-slate-800">{unitsCount}</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-600">
              <span>تاريخ الإنشاء:</span>
              <span className="font-bold text-slate-800">{formatDateTime(stock?.created_at)}</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-600">
              <span>آخر تحديث:</span>
              <span className="font-bold text-slate-800">{formatDateTime(stock?.updated_at)}</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <StockPage
      resourceSlug={stock?.type?.slug}
      title="لوحة إدارة المخزون"
      subtitle="الأرصدة والحركات"
      go={go}
      backTo={ROUTES.DASHBOARD}
      backLabel="لوحة التحكم"
      action={headerAction}
    >
      {body}
    </StockPage>
  )
}
