// ═══════════ لوحة البحث والفلاتر لاستكشاف المخزون ═══════════
import { getResourceTheme } from '../../../shared/constants/resources'
import { Icons } from '../../../shared/components/ui'

const AVAILABILITY_OPTIONS = [
  { key: true, label: 'المتوفر فقط' },
  { key: null, label: 'الكل' },
  { key: false, label: 'نفد المخزون' },
]

const RADIUS_OPTIONS_KM = [
  { km: null, label: 'أي مسافة' },
  { km: 3, label: '3 كم' },
  { km: 5, label: '5 كم' },
  { km: 10, label: '10 كم' },
  { km: 20, label: '20 كم' },
]

export default function StockFilters({
  searchInput,
  onSearchChange,
  onSearchSubmit,
  stockTypes,
  filters,
  onUpdateFilter,
  onReset,
  hasActiveFilters,
  hasLocation,
}) {
  function handleSubmit(e) {
    e.preventDefault()
    onSearchSubmit()
  }

  return (
    <section
      aria-label="البحث وتصفية المخزون"
      className="rounded-2xl border border-slate-200 bg-canvas p-4 sm:p-5 shadow-xs space-y-4"
    >
      {/* ── حقل البحث بالاسم أو العنوان ── */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 pointer-events-none">
            <Icons.Search className="w-4 h-4" />
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث باسم المزود أو عنوان المخزون (مثال: المنصور، شارع جمال…)"
            aria-label="البحث باسم المزود أو عنوان المخزون"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mawarid-600/20 focus:border-mawarid-600 focus:bg-canvas transition"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            className="min-h-11 px-4 py-2.5 rounded-xl bg-mawarid-700 hover:bg-mawarid-800 text-on-accent text-xs font-bold transition cursor-pointer"
          >
            بحث
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="min-h-11 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              إعادة تعيين
            </button>
          )}
        </div>
      </form>

      {/* ── فلتر حالة التوفر ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700">حالة التوفر</div>
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            {AVAILABILITY_OPTIONS.map((opt) => {
              const active = filters.inStock === opt.key
              return (
                <button
                  key={String(opt.key)}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onUpdateFilter({ inStock: opt.key })}
                  className={`flex-1 min-h-11 px-3 py-2 rounded-lg transition cursor-pointer ${
                    active ? 'bg-canvas text-mawarid-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── فلتر نطاق المسافة (كم) ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">نطاق المسافة</span>
            {!hasLocation && (
              <span className="text-[11px] text-amber-700 font-medium">يتطلب عنواناً افتراضياً أو موقع GPS</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {RADIUS_OPTIONS_KM.map((opt) => {
              const active = filters.maxDistanceKm === opt.km
              const disabled = !hasLocation && opt.km !== null
              return (
                <button
                  key={String(opt.km)}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  onClick={() => onUpdateFilter({ maxDistanceKm: opt.km })}
                  className={`min-h-11 px-3 py-2 rounded-xl border text-xs font-bold transition ${
                    disabled
                      ? 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                      : active
                        ? 'border-mawarid-600 bg-mawarid-700 text-on-accent cursor-pointer'
                        : 'border-slate-200 bg-canvas text-slate-700 hover:border-mawarid-300 hover:bg-mawarid-50/40 cursor-pointer'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── فلتر تصنيف المخزون (Stock Type) ── */}
      {stockTypes.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-700">تصنيف المخزون</div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={filters.stockTypeId === null}
              onClick={() => onUpdateFilter({ stockTypeId: null })}
              className={`min-h-11 px-3 py-1.5 rounded-xl border text-sm font-bold transition cursor-pointer ${
                filters.stockTypeId === null
                  ? 'border-mawarid-600 bg-mawarid-700 text-on-accent'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-mawarid-300'
              }`}
            >
              كل التصنيفات
            </button>
            {stockTypes.map((t) => {
              const active = filters.stockTypeId === t.id
              return (
                <button
                  key={t.id}
                  data-resource={getResourceTheme(t.slug) || 'default'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onUpdateFilter({ stockTypeId: t.id })}
                  className={`min-h-11 px-3 py-1.5 rounded-xl border text-sm font-bold transition cursor-pointer ${
                    active
                      ? 'border-mawarid-600 bg-mawarid-700 text-on-accent'
                      : 'border-slate-200 bg-canvas text-slate-700 hover:border-mawarid-300 hover:bg-mawarid-50/40'
                  }`}
                >
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
