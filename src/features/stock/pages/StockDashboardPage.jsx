// ═══════════ لوحة إدارة المخزون — الرصيد والأرصدة والإجراءات السريعة ═══════════
import { ROUTES } from '../../../shared/constants/routes'
import { Icons } from '../../../shared/components/ui'
import StockPage from '../components/StockPage'
import { StockLoading, StockErrorState, SessionExpiredState, StockEmptyState } from '../components/StockStates'
import { useMyStock } from '../hooks/useMyStock'
import { formatAmount, formatDateTime, isSessionExpired } from '../utils'

const QUICK_ACTIONS = [
  { key: 'in', label: 'إضافة كمية', hint: 'توريد وارد', icon: Icons.Plus, route: ROUTES.STOCK_TRANSACTION, params: { direction: 'in' }, tone: 'emerald' },
  { key: 'out', label: 'سحب كمية', hint: 'صرف منصرف', icon: Icons.Minus, route: ROUTES.STOCK_TRANSACTION, params: { direction: 'out' }, tone: 'rose' },
  { key: 'units', label: 'إدارة الوحدات', hint: 'إضافة وتعديل', icon: Icons.Settings, route: ROUTES.STOCK_UNITS, params: {}, tone: 'mawarid' },
  { key: 'history', label: 'سجل الحركات', hint: 'الوارد والمنصرف', icon: Icons.History, route: ROUTES.STOCK_HISTORY, params: {}, tone: 'sky' },
]

const TONES = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  mawarid: 'bg-mawarid-50 text-mawarid-700 border-mawarid-200 hover:bg-mawarid-100',
  sky: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
}

export default function StockDashboardPage({ go }) {
  const { status, stock, err, reload } = useMyStock()

  const headerAction = (
    <button
      type="button"
      onClick={reload}
      aria-label="تحديث بيانات المخزون"
      className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition"
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

    body = (
      <>
        {/* ── الرصيد المتاح بالوحدة الرئيسية ── */}
        <div className="rounded-3xl bg-gradient-to-r from-mawarid-900 via-mawarid-800 to-mawarid-950 text-white p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                  <Icons.Box className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-black">{stock?.type?.name || 'المخزون الحالي'}</h2>
                  <p className="text-[11px] text-mawarid-200">الرصيد المتاح{mainUnit?.name ? ` (${mainUnit.name})` : ''}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-mawarid-200">محدّث {formatDateTime(stock?.updated_at)}</span>
            </div>

            <div className="mt-5 flex items-end gap-2">
              <span className="text-4xl font-black font-mono" dir="ltr">{formatAmount(stock?.available)}</span>
              <span className="text-sm font-bold text-mawarid-200 pb-1.5">{mainUnit?.name || ''}</span>
            </div>
          </div>
        </div>

        {/* ── أرصدة جميع الوحدات (من الخادم دون حسابات محلية) ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-3">الأرصدة بكل الوحدات</h3>
          {balances.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {balances.map((b) => (
                <div key={b.unit_id} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                  <div className="text-lg font-black text-slate-900 font-mono" dir="ltr">{formatAmount(b.amount)}</div>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">{b.unit}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">لا توجد أرصدة مسجلة بعد.</p>
          )}
        </div>

        {/* ── الإجراءات السريعة ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-3">الإجراءات السريعة</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => go(a.route, a.params)}
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-3">بيانات المخزون</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>نوع المخزون:</span>
              <span className="font-bold text-slate-800">{stock?.type?.name || '—'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>الوحدة الرئيسية:</span>
              <span className="font-bold text-slate-800">{mainUnit?.name || '—'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>عدد الوحدات:</span>
              <span className="font-bold text-slate-800">{unitsCount}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>تاريخ الإنشاء:</span>
              <span className="font-bold text-slate-800">{formatDateTime(stock?.created_at)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
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
