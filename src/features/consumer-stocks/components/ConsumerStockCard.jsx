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

export default function ConsumerStockCard({ stock, index = 0, onSelect }) {
  const resource = getResourceTheme(stock.type?.slug)
  const isAvailable = Number(stock.available) > 0
  const mainUnit = stock.units?.find((unit) => unit.is_main) || stock.units?.[0]
  const gasType = formatGazStockType(stock.stock_details?.gaz_stock_type)
  const hasPrice = mainUnit?.price != null
  const clickable = typeof onSelect === 'function'

  function handleKeyDown(event) {
    if (clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
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
      style={{ '--mw-stagger-index': Math.min(index, 5) }}
      className={`mw-service-card mw-stock-card mw-stock-enter min-w-0 rounded-2xl border border-slate-200 bg-canvas p-3.5 flex flex-col gap-2.5 transition-colors hover:border-mawarid-300 ${clickable ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <StockTypeIcon slug={stock.type?.slug} />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black text-slate-900">
              {stock.supplier?.display_name || stock.type?.name || 'مخزون'}
            </h2>
            {gasType && <p className="text-xs text-mawarid-800">{gasType}</p>}
          </div>
        </div>
        <span className={`shrink-0 rounded-lg border px-2 py-0.5 text-[11px] font-bold ${isAvailable
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {isAvailable ? 'متوفر' : 'نفد المخزون'}
        </span>
      </div>

      <div className="flex items-start gap-1.5 text-sm text-slate-700">
        <Icons.MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        <p className="line-clamp-2 break-words">{stock.address || 'عنوان غير محدد'}</p>
      </div>

      <dl className="mt-auto grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
        <div className="min-w-0">
          <dt className="text-xs font-bold text-slate-500">الكمية المتوفرة</dt>
          <dd className="break-words text-sm font-black text-slate-900">
            <bdi>{formatAmount(stock.available)}</bdi> {mainUnit?.name}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs font-bold text-slate-500">سعر الوحدة</dt>
          <dd className="break-words text-sm font-black text-mawarid-800">
            {hasPrice ? <><bdi>{formatPrice(mainUnit.price)}</bdi> ريال</> : 'غير محدد'}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-500">
        {stock.distance_formatted ? (
          <span className="inline-flex items-center gap-1 font-bold text-mawarid-800">
            <Icons.Navigation className="h-3.5 w-3.5" aria-hidden="true" />
            {stock.distance_formatted}
          </span>
        ) : <span>آخر تحديث {formatDateTime(stock.updated_at)}</span>}
        {clickable && (
          <span className="ms-auto inline-flex items-center gap-1 font-bold text-mawarid-800">
            التفاصيل <Icons.ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </div>
    </article>
  )
}
