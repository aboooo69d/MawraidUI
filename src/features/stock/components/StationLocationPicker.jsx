import { useEffect, useRef, useState } from 'react'
import { Icons, Label, PrimaryBtn, SecondaryBtn } from '../../../shared/components/ui'
import { isValidLocation } from '../validation'
import StationLocationMap from './StationLocationMap'

export function normalizeStationLocation(location) {
  if (!location || !isValidLocation(location.lat, location.lng)) return null
  return {
    lat: Number(Number(location.lat).toFixed(6)),
    lng: Number(Number(location.lng).toFixed(6)),
  }
}

const sameLocation = (a, b) => a?.lat === b?.lat && a?.lng === b?.lng

// `value` is the accepted location. Draft selections never change it until confirmation.
export default function StationLocationPicker({ value, onConfirm, onPendingChange, disabled = false, error }) {
  const confirmed = normalizeStationLocation(value)
  const [draft, setDraft] = useState(confirmed)
  const [mapReady, setMapReady] = useState(false)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const requestSeq = useRef(0)
  const mounted = useRef(false)
  const draftRef = useRef(draft)
  const confirmedRef = useRef(confirmed)
  confirmedRef.current = confirmed
  const pending = !sameLocation(draft, confirmed)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; requestSeq.current += 1 }
  }, [])

  useEffect(() => {
    const next = normalizeStationLocation(value)
    requestSeq.current += 1
    draftRef.current = next
    setDraft(next)
    setLocating(false)
    setGeoError(null)
    setAccuracy(null)
    onPendingChange(false)
  }, [value?.lat, value?.lng, onPendingChange])

  function selectLocation(location, gpsAccuracy = null) {
    const next = normalizeStationLocation(location)
    if (!next) {
      setGeoError('إحداثيات الموقع غير صالحة. اختر موقع المحطة على الخريطة.')
      return
    }
    // A newer map selection wins over an outstanding GPS callback.
    requestSeq.current += 1
    draftRef.current = next
    setDraft(next)
    setLocating(false)
    setGeoError(null)
    setAccuracy(gpsAccuracy)
    onPendingChange(!sameLocation(next, confirmedRef.current))
  }

  function detectLocation() {
    if (disabled || locating) return
    setGeoError(null)
    if (!navigator.geolocation) {
      setGeoError('المتصفح لا يدعم تحديد الموقع. اختر موقع المحطة على الخريطة.')
      return
    }
    const seq = ++requestSeq.current
    setLocating(true)
    onPendingChange(true)
    const fail = (err) => {
      if (!mounted.current || seq !== requestSeq.current) return
      const messages = {
        1: 'تم رفض إذن الوصول إلى الموقع. يمكنك السماح به من إعدادات المتصفح أو اختيار موقع المحطة على الخريطة.',
        2: 'تعذر استقبال موقع GPS. اختر موقع المحطة على الخريطة أو حاول مجدداً.',
        3: 'انتهت مهلة تحديد الموقع. اختر موقع المحطة على الخريطة أو حاول مجدداً.',
      }
      setGeoError(messages[err?.code] || 'تعذر تحديد الموقع. اختر موقع المحطة على الخريطة أو حاول مجدداً.')
      setLocating(false)
      onPendingChange(!sameLocation(draftRef.current, confirmedRef.current))
    }
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!mounted.current || seq !== requestSeq.current) return
          const next = normalizeStationLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          if (!next) return fail()
          selectLocation(next, Number.isFinite(pos.coords.accuracy) ? Math.ceil(pos.coords.accuracy) : null)
        },
        fail,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      )
    } catch { fail() }
  }

  function cancelChange() {
    requestSeq.current += 1
    draftRef.current = confirmed
    setDraft(confirmed)
    setLocating(false)
    setGeoError(null)
    setAccuracy(null)
    onPendingChange(false)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3 min-w-0" aria-labelledby="station-location-heading" dir="rtl">
      <h2 id="station-location-heading" className="text-sm font-black text-slate-900">موقع المحطة الفعلي</h2>
      <p id="station-map-help" className="text-sm text-slate-600 leading-relaxed">
        حدّد موقع محطة الغاز نفسها، وليس موقع هاتفك بالضرورة. اضغط على الخريطة أو اسحب العلامة ثم أكّد الموقع.
        يمكنك تحريك الخريطة بمفاتيح الأسهم والتكبير بمفتاحي + و− ثم اختيار مركز الخريطة.
      </p>
      <button
        type="button"
        onClick={detectLocation}
        disabled={disabled || locating}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 px-3 py-2 rounded-xl border border-mawarid-200 bg-mawarid-50 text-mawarid-800 text-sm font-bold disabled:opacity-60 w-full sm:w-auto"
      >
        <Icons.MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>{locating ? 'جارٍ تحديد الموقع…' : 'تحديد موقعي الحالي (GPS)'}</span>
      </button>
      {locating && <p role="status" className="text-sm text-slate-600">بانتظار إذن الموقع ونتيجة GPS. يمكنك اختيار موقع المحطة على الخريطة بدلاً من الانتظار.</p>}
      {geoError && <p role="alert" className="text-sm text-amber-800 bg-amber-50 rounded-xl p-3">{geoError}</p>}
      {accuracy !== null && <p className="text-sm text-slate-600">دقة GPS التقريبية: {accuracy} متر. صحّح العلامة لتطابق موقع المحطة قبل التأكيد.</p>}
      <StationLocationMap position={draft} onSelect={selectLocation} onReadyChange={setMapReady} disabled={disabled} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label req htmlFor="stock-lat">خط العرض (Latitude)</Label>
          <input id="stock-lat" value={draft?.lat ?? ''} readOnly dir="ltr" aria-describedby="station-location-status" aria-invalid={!!error} className="w-full min-w-0 min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-base font-mono" />
        </div>
        <div>
          <Label req htmlFor="stock-lng">خط الطول (Longitude)</Label>
          <input id="stock-lng" value={draft?.lng ?? ''} readOnly dir="ltr" aria-describedby="station-location-status" aria-invalid={!!error} className="w-full min-w-0 min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-base font-mono" />
        </div>
      </div>
      <p id="station-location-status" role="status" className="text-sm font-bold text-slate-600">
        {pending ? (confirmed ? 'تغيير غير مؤكّد — سيبقى الموقع السابق حتى تأكيد التغيير.' : 'موقع مبدئي — أكّد أنه موقع المحطة الفعلي قبل الحفظ.') : confirmed ? 'تم تأكيد موقع المحطة. سيُحفظ عند إرسال النموذج.' : 'لم يتم اختيار موقع المحطة بعد.'}
      </p>
      {error && <p role="alert" className="text-sm font-bold text-rose-600">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-2">
        <PrimaryBtn className="!mt-0 sm:flex-1" disabled={disabled || !draft || !pending || locating || !mapReady} onClick={() => {
          onConfirm(draft)
          onPendingChange(false)
        }}>{confirmed ? 'تأكيد تغيير موقع المحطة' : 'تأكيد موقع المحطة'}</PrimaryBtn>
        {(pending || locating) && <SecondaryBtn disabled={disabled} onClick={cancelChange}>{confirmed ? 'إلغاء التغيير' : 'إلغاء الاختيار'}</SecondaryBtn>}
      </div>
    </section>
  )
}
