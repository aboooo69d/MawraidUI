// ═══════════ شريط العنوان النشط / العنوان الافتراضي لحساب المسافة ═══════════
import { Icons, SecondaryBtn } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'

export default function AddressLocationBar({
  isConsumer,
  addressLoading,
  addresses,
  selectedAddress,
  locationSource,
  activeCoords,
  gpsLoading,
  gpsErr,
  onSelectAddress,
  onRequestGps,
  onClearGps,
  go,
}) {
  if (addressLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-canvas p-4 shadow-xs flex items-center gap-3 text-xs text-slate-500">
        <span className="w-4 h-4 border-2 border-mawarid-200 border-t-mawarid-700 rounded-full animate-spin shrink-0" />
        <span>جارٍ تحميل عنوانك الافتراضي لحساب المسافة إلى أقرب مخزون…</span>
      </div>
    )
  }

  return (
    <section
      aria-label="موقع حساب المسافة"
      className="rounded-2xl border border-mawarid-200 bg-canvas p-4 sm:p-5 shadow-xs space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-mawarid-50 text-mawarid-700 flex items-center justify-center shrink-0">
            <Icons.MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-black text-slate-900">
                {locationSource === 'gps'
                  ? 'موقعك الحالي (GPS)'
                  : selectedAddress
                    ? selectedAddress.title || 'عنوان محفوظ'
                    : 'لم يتم تحديد عنوان افتراضي'}
              </h2>

              {locationSource === 'default-address' && (
                <span className="rounded-full bg-mawarid-50 border border-mawarid-200 px-2.5 py-0.5 text-[11px] font-bold text-mawarid-800">
                  العنوان الافتراضي
                </span>
              )}
              {locationSource === 'gps' && (
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  تحديد تلقائي
                </span>
              )}
            </div>

            {locationSource === 'gps' && activeCoords ? (
              <p className="text-xs text-slate-600">
                يتم ترتيب المخزون من الأقرب إلى موقعك الحالي وحساب المسافة بالكيلومتر.{' '}
                <span className="font-mono text-slate-400" dir="ltr">
                  ({activeCoords.lat.toFixed(4)}, {activeCoords.lng.toFixed(4)})
                </span>
              </p>
            ) : selectedAddress ? (
              <p className="text-xs text-slate-600 leading-relaxed break-words">
                {selectedAddress.description || 'يتم ترتيب المخزون حسب الأقرب لهذا العنوان وحساب المسافة بالكيلومتر.'}
              </p>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                {isConsumer
                  ? 'أضف عنواناً افتراضياً من صفحة «عناويني» أو استخدم موقعك الحالي لترتيب المخزون حسب الأقرب وعرض المسافة بالكيلومتر.'
                  : 'استخدم موقعك الحالي (GPS) لترتيب المخزون حسب الأقرب وعرض المسافة بالكيلومتر، أو تصفّح جميع المخازن حسب الأحدث.'}
              </p>
            )}
          </div>
        </div>

        {/* أزرار التحكم بالموقع */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {locationSource === 'gps' ? (
            <SecondaryBtn onClick={onClearGps} className="text-xs px-3 py-2">
              {selectedAddress ? 'العودة للعنوان المحفوظ' : 'إلغاء الموقع الحالي'}
            </SecondaryBtn>
          ) : (
            <SecondaryBtn onClick={onRequestGps} disabled={gpsLoading} className="text-xs px-3 py-2">
              <span className="inline-flex items-center gap-1.5">
                <Icons.Navigation className="w-3.5 h-3.5" />
                <span>{gpsLoading ? 'جارٍ التحديد…' : 'موقعي الحالي'}</span>
              </span>
            </SecondaryBtn>
          )}

          {isConsumer && (
            <button
              type="button"
              onClick={() => go(ROUTES.CITIZEN_ADDRESSES)}
              className="px-3 py-2 rounded-xl border border-mawarid-200 bg-mawarid-50 hover:bg-mawarid-100 text-mawarid-800 text-xs font-bold transition cursor-pointer"
            >
              {addresses.length > 0 ? 'إدارة عناويني' : 'إضافة عنوان افتراضي'}
            </button>
          )}
        </div>
      </div>

      {/* تبديل سريع بين العناوين المحفوظة إذا وجد أكثر من عنوان */}
      {isConsumer && addresses.length > 1 && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <label htmlFor="active-address-select" className="text-xs font-bold text-slate-600">
            حساب المسافة من:
          </label>
          <select
            id="active-address-select"
            value={locationSource === 'gps' ? '' : selectedAddress?.id || ''}
            onChange={(e) => onSelectAddress(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-mawarid-600/20 focus:border-mawarid-600"
          >
            {locationSource === 'gps' && <option value="">الموقع الحالي (GPS)</option>}
            {addresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.title || 'عنوان محفوظ'}
                {addr.is_default ? ' (الافتراضي)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {gpsErr && (
        <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          {gpsErr}
        </p>
      )}
    </section>
  )
}
