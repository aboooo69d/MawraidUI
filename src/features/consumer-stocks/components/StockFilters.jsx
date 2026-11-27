import { Icons } from '../../../shared/components/ui'

const AVAILABILITY_OPTIONS = [
  { key: true, label: 'المتوفر فقط' },
  { key: null, label: 'الكل' },
  { key: false, label: 'نفد المخزون' },
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
  function handleSubmit(event) {
    event.preventDefault()
    onSearchSubmit()
  }

  return (
    <section aria-label="البحث وتصفية المخزون" className="space-y-2 rounded-2xl border border-slate-200 bg-canvas p-3 shadow-xs">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Icons.Search className="pointer-events-none absolute start-3 top-3.5 h-4 w-4 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="اسم المزود أو العنوان"
            aria-label="البحث باسم المزود أو عنوان المخزون"
            className="mw-input mw-stock-search !min-h-11 ps-9 pe-11"
          />
          {hasActiveFilters && (
            <button type="button" onClick={onReset} aria-label="إعادة تعيين الفلاتر" className="absolute end-0 top-0 grid h-11 w-11 place-items-center rounded-lg text-slate-600 hover:text-mawarid-800">
              <Icons.Close className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <button type="submit" className="mw-button mw-button-primary shrink-0">بحث</button>
      </form>

      <div className="grid items-end gap-2 sm:grid-cols-2">
        <fieldset className="min-w-0">
          <legend className="mb-1 text-xs font-bold text-slate-700">حالة التوفر</legend>
          <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold">
            {AVAILABILITY_OPTIONS.map(({ key, label }) => {
              const active = filters.inStock === key
              return (
                <button
                  key={String(key)}
                  type="button"
                  aria-pressed={active}
                  onClick={() => { if (!active) onUpdateFilter({ inStock: key }) }}
                  className={`min-h-11 flex-1 rounded-lg px-2 py-1 transition-colors ${active
                    ? 'bg-canvas font-black text-mawarid-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <label className="grid min-w-0 gap-1 text-xs font-bold text-slate-700">
          نطاق المسافة
          <select
            value={hasLocation ? filters.maxDistanceKm ?? '' : ''}
            disabled={!hasLocation}
            onChange={(event) => onUpdateFilter({ maxDistanceKm: Number(event.target.value) || null })}
            className="mw-input !min-h-11 disabled:opacity-60"
          >
            <option value="">{hasLocation ? 'أي مسافة' : 'حدّد موقعك لاختيار المسافة'}</option>
            {[3, 5, 10, 20].map((km) => <option key={km} value={km}>{km} كم</option>)}
          </select>
        </label>
      </div>

      {stockTypes.length > 0 && (
        <label className="grid gap-1 text-xs font-bold text-slate-700 sm:max-w-sm">
          تصنيف المخزون
          <select
            value={filters.stockTypeId ?? ''}
            onChange={(event) => onUpdateFilter({ stockTypeId: Number(event.target.value) || null })}
            className="mw-input !min-h-11"
          >
            <option value="">كل التصنيفات</option>
            {stockTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
          </select>
        </label>
      )}
    </section>
  )
}
