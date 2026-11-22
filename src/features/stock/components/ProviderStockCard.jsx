// ═══════════ بطاقة مخازن المزود في لوحة التحكم (Multi-Stock — للمزود فقط) ═══════════
// تعرض قائمة مخازن المزود أو حالة فارغة، مع إبقاء زر «إضافة مخزون جديد» متاحاً دائماً.
import { ROUTES } from '../../../shared/constants/routes'
import { Icons } from '../../../shared/components/ui'
import { useMyStocks } from '../hooks/useMyStocks'
import { formatAmount, formatDateTime, formatGazStockType, isSessionExpired } from '../utils'
import { StockLoading, StockErrorState, SessionExpiredState, StockEmptyState } from './StockStates'

export default function ProviderStockCard({ go }) {
  const { status, stocks, err, reload } = useMyStocks()

  if (status === 'loading') return <StockLoading label="جارٍ تحميل قائمة المخازن…" />

  if (status === 'error') {
    return isSessionExpired(err) ? <SessionExpiredState go={go} /> : <StockErrorState err={err} onRetry={reload} />
  }

  if (status === 'empty') return <StockEmptyState go={go} />

  return (
    <div className="space-y-4 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-black text-slate-700">المخازن المسجّلة ({stocks.length})</span>
        <button
          type="button"
          onClick={() => go(ROUTES.STOCK_CREATE)}
          className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-xl bg-mawarid-700 hover:bg-mawarid-800 text-white text-xs font-bold transition shadow-md shadow-mawarid-900/15 cursor-pointer focus:outline-none focus:ring-2 focus:ring-mawarid-500 focus:ring-offset-2"
        >
          <Icons.Plus className="w-4 h-4" aria-hidden="true" />
          <span>إضافة مخزون جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stocks.map((stock) => {
          const mainUnit = stock?.units?.find((u) => u.is_main)
          const balances = Array.isArray(stock?.balances) ? stock.balances : []
          const gazTypeLabel = formatGazStockType(stock?.stock_details?.gaz_stock_type)

          return (
            <div key={stock.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-mawarid-50 text-mawarid-700 flex items-center justify-center shrink-0">
                      <Icons.Box className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900 truncate">
                          {stock?.type?.name || 'مخزون مسجّل'}
                        </h3>
                        {gazTypeLabel && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                            {gazTypeLabel}
                          </span>
                        )}
                      </div>
                      {stock?.address && (
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                          <Icons.MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                          <span className="truncate">{stock.address}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">
                    آخر تحديث {formatDateTime(stock?.updated_at)}
                  </span>
                </div>

                <div className="py-4 flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-900 font-mono" dir="ltr">
                    {formatAmount(stock?.available)}
                  </span>
                  <span className="text-sm font-bold text-slate-500 pb-1">{mainUnit?.name || ''}</span>
                </div>

                {balances.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-4">
                    {balances.map((b) => (
                      <span
                        key={b.unit_id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700"
                      >
                        <strong className="font-mono text-slate-900" dir="ltr">
                          {formatAmount(b.amount)}
                        </strong>
                        <span>{b.unit}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => go(ROUTES.STOCK_DASHBOARD, { stockId: stock.id })}
                className="w-full min-h-[46px] rounded-xl bg-mawarid-700 hover:bg-mawarid-800 text-white text-sm font-bold transition shadow-md shadow-mawarid-900/15 cursor-pointer focus:outline-none focus:ring-2 focus:ring-mawarid-500 focus:ring-offset-2 flex items-center justify-center gap-2"
              >
                <Icons.Settings className="w-4 h-4" aria-hidden="true" />
                <span>إدارة المخزون</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
