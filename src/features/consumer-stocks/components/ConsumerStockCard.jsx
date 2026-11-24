// ═══════════ بطاقة عرض مخزون للمستفيد مع المسافة بالكيلومتر ═══════════
import { Icons } from '../../../shared/components/ui'
import { formatAmount, formatDateTime, formatGazStockType, formatPrice } from '../utils/format'

function TypeIcon({ slug }) {
  const s = String(slug || '').trim().toLowerCase()
  if (s === 'gaz' || s === 'gas') return <Icons.Gas className="w-4 h-4 text-amber-600" />
  if (s === 'water') return <Icons.Water className="w-4 h-4 text-sky-600" />
  if (s === 'fuel') return <Icons.Fuel className="w-4 h-4 text-emerald-600" />
  return <Icons.Box className="w-4 h-4 text-mawarid-700" />
}

export default function ConsumerStockCard({ stock }) {
  const isAvailable = Number(stock.available) > 0
  const mainUnit = stock.units?.find((u) => u.is_main) || stock.units?.[0]
  const balances = Array.isArray(stock.balances) ? stock.balances : []
  const gazTypeLabel = formatGazStockType(stock.stock_details?.gaz_stock_type)

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-mawarid-300 hover:shadow-md transition flex flex-col justify-between gap-4">
      <div className="space-y-3">
        {/* ── الترويسة: التصنيف + شارة المسافة + التوفر ── */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-black text-slate-800">
              <TypeIcon slug={stock.type?.slug} />
              <span>{stock.type?.name || 'مخزون'}</span>
            </span>

            {gazTypeLabel && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800">
                {gazTypeLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
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
          <div className="flex items-center justify-between text-xs">
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 font-bold"
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

      {/* ── تذييل البطاقة: آخر تحديث ── */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Icons.Clock className="w-3.5 h-3.5" />
          <span>آخر تحديث: {formatDateTime(stock.updated_at)}</span>
        </span>
        {typeof stock.distance_km === 'number' && (
          <span className="font-mono text-slate-500" dir="ltr">
            {stock.distance_km.toFixed(1)} km
          </span>
        )}
      </div>
    </article>
  )
}
