// ═══════════ شريط العنوان النشط / العنوان الافتراضي لحساب المسافة ═══════════
import { Icons, SecondaryBtn } from '../../../shared/components/ui'
import { Skeleton } from '../../../shared/components/ui/Skeleton'
import { ROUTES } from '../../../shared/constants/routes'

export default function AddressLocationBar({
  isConsumer,
  addressLoading,
  addressErr,
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
  return (
    <section
      aria-label="موقع حساب المسافة"
      className="rounded-2xl border border-mawarid-200 bg-canvas p-3 shadow-xs space-y-2"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-mawarid-50 text-mawarid-700 flex items-center justify-center shrink-0">
            <Icons.MapPin className="w-5 h-5" />
          </div>
          {addressLoading && locationSource !== 'gps' ? (
            <div role="status" className="flex h-9 min-w-32 flex-col justify-center gap-1.5">
              <span className="sr-only">جارٍ تحميل عنوانك الافتراضي…</span>
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          ) : (
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-black text-slate-900">
                  {locationSource === 'gps'
                    ? 'موقعك الحالي (GPS)'
                    : selectedAddress
                      ? selectedAddress.title || 'عنوان محفوظ'
                      : isConsumer
                        ? 'لم يتم تحديد عنوان افتراضي'
                        : 'ترتيب المخزون حسب المسافة'}
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
                  يعرض المخزون الأقرب إلى موقعك أولاً.
                </p>
              ) : selectedAddress ? (
                <p className="text-xs text-slate-600 leading-relaxed break-words">
                  {selectedAddress.description || 'يتم ترتيب المخزون حسب الأقرب لهذا العنوان وحساب المسافة بالكيلومتر.'}
                </p>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isConsumer
                    ? 'اختر عنواناً افتراضياً أو استخدم موقعك الحالي.'
                    : 'استخدم موقعك لعرض أقرب نقاط التوزيع.'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* أزرار التحكم بالموقع */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {locationSource === 'gps' ? (
            <SecondaryBtn onClick={onClearGps} className="text-xs px-3 py-2 min-w-28">
              {selectedAddress ? 'العودة للعنوان المحفوظ' : 'إلغاء الموقع الحالي'}
            </SecondaryBtn>
          ) : (
            <SecondaryBtn onClick={onRequestGps} disabled={gpsLoading} className="text-xs px-3 py-2 min-w-28">
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
              className="min-h-11 px-3 py-2 rounded-xl border border-mawarid-200 bg-mawarid-50 hover:bg-mawarid-100 text-mawarid-800 text-xs font-bold transition cursor-pointer"
            >
              إدارة عناويني
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
            <option value="">{locationSource === 'gps' ? 'الموقع الحالي (GPS)' : 'اختر عنواناً'}</option>
            {addresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.title || 'عنوان محفوظ'}
                {addr.is_default ? ' (الافتراضي)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {addressErr && isConsumer && (
        <p role="status" className="text-xs text-amber-800">تعذّر تحميل عناوينك. يمكنك استخدام موقعك الحالي.</p>
      )}
      {gpsErr && (
        <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          {gpsErr}
        </p>
      )}
    </section>
  )
}
