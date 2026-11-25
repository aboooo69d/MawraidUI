// ═══════════ بطاقة عرض مخزون للمستفيد مع المسافة بالكيلومتر ═══════════
import { getResourceTheme } from '../../../shared/constants/resources'
import { Icons } from '../../../shared/components/ui'
import { formatAmount, formatDateTime, formatGazStockType, formatPrice } from '../utils/format'

const RESOURCE_ICONS = { gas: Icons.Gas, water: Icons.Water, fuel: Icons.Fuel }

export function StockTypeIcon({ slug }) {
  const resource = getResourceTheme(slug)
  const Icon = RESOURCE_ICONS[resource] || Icons.Box
  return (
    <span data-resource={resource} className="mw-resource inline-flex shrink-0 rounded-md p-1">
      <Icon className="w-4 h-4" aria-hidden="true" />
    </span>
  )
}

export default function ConsumerStockCard({ stock, onSelect }) {
  const resource = getResourceTheme(stock.type?.slug)
  const isAvailable = Number(stock.available) > 0
  const mainUnit = stock.units?.find((u) => u.is_main) || stock.units?.[0]
  const balances = Array.isArray(stock.balances) ? stock.balances : []
  const gazTypeLabel = formatGazStockType(stock.stock_details?.gaz_stock_type)
  const clickable = typeof onSelect === 'function'

  function handleKeyDown(e) {
    if (!clickable) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(stock)
    }
  }

  return (
    <article
      data-resource={resource || 'default'}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onSelect(stock) : undefined}
      onKeyDown={handleKeyDown}
      className={`mw-service-card min-w-0 rounded-2xl border border-slate-200 bg-canvas p-4 sm:p-5 hover:border-mawarid-300 transition flex flex-col justify-between gap-4 ${
        clickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-mawarid-600/25 focus:border-mawarid-500' : ''
      }`}
    >
      <div className="space-y-3">
        {/* ── الترويسة: التصنيف + شارة المسافة + التوفر ── */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl mw-resource text-sm font-bold">
              <StockTypeIcon slug={stock.type?.slug} />
              <span>{stock.type?.name || 'مخزون'}</span>
            </span>

            {gazTypeLabel && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl mw-resource text-xs font-bold">
                {gazTypeLabel}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {stock.distance_formatted && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-mawarid-50 border border-mawarid-200 text-mawarid-800 text-xs font-black"
                title={`المسافة التقريبية: ${stock.distance_km} كم`}
              >
                <Icons.MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{stock.distance_formatted}</span>
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
        </div>

        {/* ── العنوان ── */}
        <div className="flex items-start gap-2 text-sm text-slate-700">
          <Icons.MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="font-bold text-slate-900 leading-relaxed break-words">
            {stock.address || 'عنوان غير محدد'}
          </p>
        </div>

        {/* ── الكمية المتوفرة والأرصدة حسب الوحدات ── */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1 text-sm">
            <span className="text-slate-500 font-bold">الكمية المتوفرة</span>
            <span className={`font-black text-sm ${isAvailable ? 'text-emerald-700' : 'text-rose-700'}`}>
              <span className="font-mono" dir="ltr">{formatAmount(stock.available)}</span>{' '}
              <span>{mainUnit?.name || ''}</span>
            </span>
          </div>

          {balances.length > 0 && (
            <div className="pt-2 border-t border-slate-200/70 flex flex-wrap gap-1.5">
              {balances.map((b) => {
                const unitObj = stock.units?.find((u) => u.id === b.unit_id || u.name === b.unit)
                return (
                  <span
                    key={b.unit_id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-canvas border border-slate-200 text-[11px] text-slate-700 font-bold"
                  >
                    <span className="font-mono text-slate-900" dir="ltr">{formatAmount(b.amount)}</span>
                    <span>{b.unit}</span>
                    {unitObj?.price !== undefined && unitObj?.price !== null && (
                      <span className="text-mawarid-700 font-normal mr-1">
                        (<span className="font-mono" dir="ltr">{formatPrice(unitObj.price)}</span>)
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── تذييل البطاقة: آخر تحديث + عرض التفاصيل ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Icons.Clock className="w-3.5 h-3.5" />
          <span>آخر تحديث: {formatDateTime(stock.updated_at)}</span>
        </span>
        <div className="flex items-center gap-2">
          {typeof stock.distance_km === 'number' && (
            <span className="font-mono text-slate-500" dir="ltr">
              {stock.distance_km.toFixed(1)} km
            </span>
          )}
          {clickable && (
            <span className="inline-flex items-center gap-1 font-bold text-mawarid-700">
              <span>التفاصيل</span>
              <Icons.ArrowLeft className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
