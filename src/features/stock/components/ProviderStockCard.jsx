// ═══════════ بطاقة اكتشاف المخزون في لوحة التحكم (للمزود فقط) ═══════════
// تعرض حالة المخزون في الرئيسية بعد دخول المزود: لا يوجد مخزون ← إضافة،
// يوجد مخزون ← ملخص + دخول لوحة الإدارة (بدون زر إنشاء آخر).
import { ROUTES } from '../../../shared/constants/routes'
import { Icons } from '../../../shared/components/ui'
import { useMyStock } from '../hooks/useMyStock'
import { formatAmount, formatDateTime, isSessionExpired } from '../utils'
import { StockLoading, StockErrorState, SessionExpiredState, StockEmptyState } from './StockStates'

export default function ProviderStockCard({ go }) {
  const { status, stock, err, reload } = useMyStock()

  if (status === 'loading') return <StockLoading label="جارٍ فحص حالة المخزون…" />

  if (status === 'error') {
    return isSessionExpired(err) ? <SessionExpiredState go={go} /> : <StockErrorState err={err} onRetry={reload} />
  }

  if (status === 'empty') return <StockEmptyState go={go} />

  const mainUnit = stock?.units?.find((u) => u.is_main)
  const balances = Array.isArray(stock?.balances) ? stock.balances : []

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs fade-in">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-mawarid-50 text-mawarid-700 flex items-center justify-center shrink-0">
            <Icons.Box className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-slate-900 truncate">المخزون الحالي</h2>
            <p className="text-[11px] text-slate-500 truncate">{stock?.type?.name || 'مخزون مسجّل'}</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-slate-400 shrink-0">آخر تحديث {formatDateTime(stock?.updated_at)}</span>
      </div>

      <div className="py-4 flex items-end gap-2">
        <span className="text-3xl font-black text-slate-900 font-mono" dir="ltr">{formatAmount(stock?.available)}</span>
        <span className="text-sm font-bold text-slate-500 pb-1">{mainUnit?.name || ''}</span>
      </div>

      {balances.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-4">
          {balances.map((b) => (
            <span
              key={b.unit_id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700"
            >
              <strong className="font-mono text-slate-900" dir="ltr">{formatAmount(b.amount)}</strong>
              <span>{b.unit}</span>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => go(ROUTES.STOCK_DASHBOARD)}
        className="w-full min-h-[46px] rounded-xl bg-mawarid-700 hover:bg-mawarid-800 text-white text-sm font-bold transition shadow-md shadow-mawarid-900/15 cursor-pointer focus:outline-none focus:ring-2 focus:ring-mawarid-500 focus:ring-offset-2 flex items-center justify-center gap-2"
      >
        <Icons.Settings className="w-4 h-4" aria-hidden="true" />
        <span>إدارة المخزون</span>
      </button>
    </div>
  )
}
