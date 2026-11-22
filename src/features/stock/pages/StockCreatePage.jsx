// ═══════════ شاشة إنشاء مخزون جديد — النوع + التفاصيل + العنوان + الموقع + الوحدات ═══════════
import { useCallback, useEffect, useRef, useState } from 'react'
import { ROUTES } from '../../../shared/constants/routes'
import { stockApi } from '../../../services/api'
import { Icons, ErrorBanner, InfoBanner, Label, PrimaryBtn, SecondaryBtn, TextInput } from '../../../shared/components/ui'
import StockPage from '../components/StockPage'
import { SessionExpiredState } from '../components/StockStates'
import { isGazStockType, isSessionExpired } from '../utils'
import { ADDRESS_MAX, UNIT_NAME_MAX, isValidLocation, validateCreateForm } from '../validation'

// مفتاح ثابت لكل صف وحدة (يمنع تداخل حالة الحقول عند الحذف)
let rowSeq = 0
const newRow = (isMain) => ({ _key: ++rowSeq, name: '', rate: isMain ? '1' : '', is_main: isMain })

export default function StockCreatePage({ go, showToast }) {
  const [types, setTypes] = useState({ status: 'loading', list: [], err: null })
  const [typeId, setTypeId] = useState('')
  const [gazStockType, setGazStockType] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [locating, setLocating] = useState(false)
  const [geoErr, setGeoErr] = useState(null)
  const [units, setUnits] = useState(() => [newRow(true)])
  const [submitted, setSubmitted] = useState(false)
  const [serverErr, setServerErr] = useState(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const typesSeq = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadTypes = useCallback(async () => {
    const seq = ++typesSeq.current
    setTypes({ status: 'loading', list: [], err: null })
    try {
      const list = await stockApi.getStockTypes()
      if (!mountedRef.current || seq !== typesSeq.current) return
      setTypes({ status: 'ready', list: Array.isArray(list) ? list : [], err: null })
    } catch (err) {
      if (!mountedRef.current || seq !== typesSeq.current) return
      setTypes({ status: 'error', list: [], err })
    }
  }, [])

  useEffect(() => {
    loadTypes()
  }, [loadTypes])

  const selectedType = types.list.find((t) => String(t.id) === String(typeId)) || null
  const isGaz = isGazStockType(selectedType?.slug)

  const handleTypeChange = (nextId) => {
    setTypeId(nextId)
    setGazStockType('')
  }

  const setUnitAt = (i, patch) =>
    setUnits((prev) => prev.map((u, idx) => (idx === i ? { ...u, ...patch } : u)))

  const removeUnit = (i) => setUnits((prev) => prev.filter((_, idx) => idx !== i))

  function detectLocation() {
    setGeoErr(null)
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoErr('المتصفح لا يدعم تحديد الموقع الجغرافي')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mountedRef.current) return
        setLat(String(Number(pos.coords.latitude.toFixed(6))))
        setLng(String(Number(pos.coords.longitude.toFixed(6))))
        setLocating(false)
      },
      (error) => {
        if (!mountedRef.current) return
        if (error?.code === 1) setGeoErr('تم رفض إذن الوصول إلى الموقع الجغرافي')
        else if (error?.code === 3) setGeoErr('انتهت مهلة تحديد الموقع — حاول مجدداً أو أدخل الإحداثيات يدوياً')
        else setGeoErr('تعذر تحديد الموقع الجغرافي تلقائياً — أدخل الإحداثيات يدوياً')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const check = validateCreateForm({
    selectedType,
    address,
    lat,
    lng,
    gazStockType,
    units,
  })
  const showErr = (msg) => (submitted && msg ? <p className="text-[12px] font-bold text-rose-600 mt-1.5">{msg}</p> : null)
  const addressCharCount = Array.from(address.trim()).length
  const hasValidLocation = isValidLocation(lat, lng)

  async function submit(e) {
    if (e) e.preventDefault()
    setServerErr(null)
    setSessionExpired(false)
    setSubmitted(true)

    const result = validateCreateForm({
      selectedType,
      address,
      lat,
      lng,
      gazStockType,
      units,
    })
    if (!result.valid) return
    if (submitting) return // منع الإرسال المزدوج

    setSubmitting(true)
    try {
      const payload = {
        stock_type_id: Number(selectedType.id),
        stock_type: selectedType.slug,
        address: address.trim(),
        location: { lat: Number(lat), lng: Number(lng) },
        units: units.map((u) => ({
          name: u.name.trim(),
          rate: u.is_main ? 1 : Number(u.rate),
          is_main: u.is_main,
        })),
        ...(isGazStockType(selectedType.slug)
          ? { stock_details: { gaz_stock_type: gazStockType } }
          : {}),
      }

      const created = await stockApi.createStock(payload)
      showToast?.('تم إنشاء المخزون بنجاح')
      if (created?.id) go(ROUTES.STOCK_DASHBOARD, { stockId: created.id })
      else go(ROUTES.DASHBOARD)
    } catch (err) {
      if (isSessionExpired(err)) {
        setSessionExpired(true)
      } else {
        setServerErr(err)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <StockPage
      title="إضافة مخزون جديد"
      subtitle="التصنيف، الموقع، والوحدات"
      go={go}
      backTo={ROUTES.DASHBOARD}
      backLabel="لوحة التحكم"
    >
      {sessionExpired && <SessionExpiredState go={go} />}

      {!sessionExpired && (
        <>
          <InfoBanner>
            يمكنك إضافة أكثر من مخزون وإدارة كل مخزون بشكل مستقل — اختر التصنيف والعنوان والموقع والوحدات بدقة.
          </InfoBanner>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {/* ── نوع المخزون ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <Label req htmlFor="stock-type">نوع المخزون</Label>
              <select
                id="stock-type"
                value={typeId}
                onChange={(e) => handleTypeChange(e.target.value)}
                disabled={types.status !== 'ready'}
                aria-invalid={submitted && !!check.typeError}
                className={`w-full min-h-[48px] rounded-xl border bg-white px-3.5 text-slate-800 text-sm font-semibold outline-none transition shadow-sm disabled:opacity-60 disabled:cursor-wait focus:ring-2 focus:ring-mawarid-600/20 ${
                  submitted && check.typeError ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 hover:border-slate-300 focus:border-mawarid-600'
                }`}
              >
                <option value="">
                  {types.status === 'loading' ? 'جارٍ تحميل الأنواع…' : 'اختر نوع المخزون'}
                </option>
                {types.list.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {showErr(check.typeError)}

              {types.status === 'error' && (
                <div className="mt-3">
                  <ErrorBanner err={types.err} />
                  <SecondaryBtn onClick={loadTypes} className="w-full">
                    إعادة تحميل الأنواع
                  </SecondaryBtn>
                </div>
              )}
              {types.status === 'ready' && types.list.length === 0 && (
                <div className="mt-3">
                  <InfoBanner>لا توجد تصنيفات متاحة حالياً — أعد المحاولة لاحقاً.</InfoBanner>
                  <SecondaryBtn onClick={loadTypes} className="w-full">
                    إعادة المحاولة
                  </SecondaryBtn>
                </div>
              )}

              {/* ── تفاصيل مخزون الغاز (إجباري عند slug === 'gaz') ── */}
              {isGaz && (
                <div className="mt-4 pt-4 border-t border-slate-100 fade-in">
                  <Label req htmlFor="gaz-stock-type">نوع مخزون الغاز</Label>
                  <select
                    id="gaz-stock-type"
                    value={gazStockType}
                    onChange={(e) => setGazStockType(e.target.value)}
                    aria-invalid={submitted && !!check.gazTypeError}
                    className={`w-full min-h-[48px] rounded-xl border bg-white px-3.5 text-slate-800 text-sm font-semibold outline-none transition shadow-sm focus:ring-2 focus:ring-mawarid-600/20 ${
                      submitted && check.gazTypeError ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 hover:border-slate-300 focus:border-mawarid-600'
                    }`}
                  >
                    <option value="">اختر نوع مخزون الغاز</option>
                    <option value="exchange">استبدال أسطوانات</option>
                    <option value="refill">تعبئة فورية</option>
                  </select>
                  {showErr(check.gazTypeError)}
                </div>
              )}
            </div>

            {/* ── عنوان المخزون ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <Label req htmlFor="stock-address">عنوان المخزون (10–200 حرف)</Label>
                <span
                  className={`text-[11px] font-bold ${
                    addressCharCount > ADDRESS_MAX ? 'text-rose-600' : 'text-slate-400'
                  }`}
                  dir="ltr"
                >
                  {addressCharCount}/{ADDRESS_MAX}
                </span>
              </div>
              <textarea
                id="stock-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                maxLength={ADDRESS_MAX + 20}
                placeholder="مثال: تعز - شارع جمال بجانب جولة المسبح"
                aria-invalid={submitted && !!check.addressError}
                className={`w-full rounded-xl border bg-white px-3.5 py-3 text-slate-800 text-sm font-medium outline-none transition shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-mawarid-600/20 resize-y ${
                  submitted && check.addressError ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 hover:border-slate-300 focus:border-mawarid-600'
                }`}
              />
              {showErr(check.addressError)}
            </div>

            {/* ── الموقع الجغرافي (lat / lng) ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-slate-900">الموقع الجغرافي</h2>
                  <p className="text-[11px] text-slate-500">حدّد الإحداثيات عبر GPS أو أدخلها يدوياً</p>
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-mawarid-200 bg-mawarid-50 hover:bg-mawarid-100 text-mawarid-800 text-xs font-bold transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                >
                  <Icons.MapPin className="w-4 h-4" aria-hidden="true" />
                  <span>{locating ? 'جارٍ تحديد الموقع…' : 'تحديد موقعي الحالي (GPS)'}</span>
                </button>
              </div>

              {geoErr && <p className="text-[12px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">{geoErr}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="ltr">
                <div>
                  <Label req htmlFor="stock-lat">خط العرض (Latitude)</Label>
                  <TextInput
                    id="stock-lat"
                    value={lat}
                    onChange={(v) => setLat(v)}
                    placeholder="15.3694"
                    inputMode="decimal"
                    dir="ltr"
                    error={submitted && !!check.locationError}
                  />
                </div>
                <div>
                  <Label req htmlFor="stock-lng">خط الطول (Longitude)</Label>
                  <TextInput
                    id="stock-lng"
                    value={lng}
                    onChange={(v) => setLng(v)}
                    placeholder="44.1910"
                    inputMode="decimal"
                    dir="ltr"
                    error={submitted && !!check.locationError}
                  />
                </div>
              </div>

              {showErr(check.locationError)}

              {hasValidLocation && (
                <div className="pt-1">
                  <a
                    href={`https://www.google.com/maps?q=${Number(lat)},${Number(lng)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-mawarid-700 hover:underline"
                  >
                    <Icons.MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>معاينة الموقع على الخريطة</span>
                  </a>
                </div>
              )}
            </div>

            {/* ── الوحدة الرئيسية (معاملها ثابت 1) ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="text-sm font-black text-slate-900">الوحدة الرئيسية</h2>
                <span className="px-2 py-0.5 rounded-full bg-mawarid-50 text-mawarid-700 text-[11px] font-bold border border-mawarid-200">
                  معاملها ثابت 1
                </span>
              </div>
              <Label req htmlFor="main-unit">اسم الوحدة الرئيسية</Label>
              <TextInput
                id="main-unit"
                value={units[0]?.name ?? ''}
                onChange={(v) => setUnitAt(0, { name: v })}
                placeholder="مثال: حبة"
                maxLength={UNIT_NAME_MAX}
                error={submitted && !!check.rowErrors[0]}
              />
              <div className="mt-3">
                <Label htmlFor="main-rate">معامل التحويل</Label>
                <input
                  id="main-rate"
                  value="1"
                  disabled
                  readOnly
                  aria-label="معامل الوحدة الرئيسية ثابت ولا يقبل التعديل"
                  className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-slate-500 text-sm font-bold font-mono outline-none cursor-not-allowed"
                  dir="ltr"
                />
              </div>
              {showErr(check.rowErrors[0])}
            </div>

            {/* ── الوحدات الفرعية ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900">الوحدات الفرعية</h2>
                <span className="text-[11px] text-slate-500">1 وحدة رئيسية = معامل الوحدة الفرعية</span>
              </div>

              {units.slice(1).map((u, idx) => {
                const i = idx + 1
                return (
                  <div key={u._key} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-black text-slate-600">وحدة فرعية {idx + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeUnit(i)}
                        aria-label={`حذف الوحدة الفرعية ${idx + 1}`}
                        className="w-9 h-9 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center cursor-pointer transition"
                      >
                        <Icons.Close className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label req htmlFor={`unit-name-${u._key}`}>اسم الوحدة</Label>
                        <TextInput
                          id={`unit-name-${u._key}`}
                          value={u.name}
                          onChange={(v) => setUnitAt(i, { name: v })}
                          placeholder="مثال: كرتون"
                          maxLength={UNIT_NAME_MAX}
                          error={submitted && !!check.rowErrors[i]}
                        />
                      </div>
                      <div>
                        <Label req htmlFor={`unit-rate-${u._key}`}>معامل التحويل</Label>
                        <TextInput
                          id={`unit-rate-${u._key}`}
                          value={u.rate}
                          onChange={(v) => setUnitAt(i, { rate: v.replace(/\D/g, '').slice(0, 9) })}
                          placeholder="مثال: 12"
                          inputMode="numeric"
                          dir="ltr"
                          error={submitted && !!check.rowErrors[i]}
                        />
                      </div>
                    </div>
                    {showErr(check.rowErrors[i])}
                  </div>
                )
              })}

              {showErr(check.formError)}

              <button
                type="button"
                onClick={() => setUnits((prev) => [...prev, newRow(false)])}
                className="w-full min-h-[46px] rounded-xl border-2 border-dashed border-mawarid-300 bg-mawarid-50/50 hover:bg-mawarid-50 text-mawarid-700 text-sm font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Icons.Plus className="w-4 h-4" aria-hidden="true" />
                <span>إضافة وحدة فرعية</span>
              </button>
            </div>

            {/* ── أخطاء الخادم ── */}
            {serverErr && <ErrorBanner err={serverErr} />}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <SecondaryBtn onClick={() => go(ROUTES.DASHBOARD)} className="sm:w-40 mt-5">
                إلغاء
              </SecondaryBtn>
              <div className="flex-1">
                <PrimaryBtn type="submit" loading={submitting}>
                  إنشاء المخزون
                </PrimaryBtn>
              </div>
            </div>
          </form>
        </>
      )}
    </StockPage>
  )
}
