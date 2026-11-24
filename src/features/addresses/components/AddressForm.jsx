import { useEffect, useRef, useState } from 'react'
import { addressesApi } from '../../../services/api'
import { ErrorBanner, Icons, Label, PrimaryBtn, SecondaryBtn, TextInput } from '../../../shared/components/ui'
import LocationPicker from '../../../shared/components/ui/LocationPicker'
import { ADDRESS_LIMITS, addressTextLength, isAddressLocation, isAddressSessionExpired, validateAddress } from '../validation'

const TAIZ_CENTER = [13.5795, 44.0209]

export default function AddressForm({ addresses, onSaved, onSessionExpired }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pin, setPin] = useState(null)
  const [confirmed, setConfirmed] = useState(null)
  const [isDefault, setIsDefault] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const gpsRequest = useRef(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      gpsRequest.current = null
    }
  }, [])

  const errors = attempted ? validateAddress({ title, description, location: confirmed }) : {}
  const firstAddress = addresses.length === 0
  const currentDefault = addresses.find((address) => address.is_default)

  function pickLocation(lat, lng) {
    if (saving) return
    gpsRequest.current = null
    setLocating(false)
    setLocationError('')
    setConfirmed(null)
    // Leaflet can report a longitude from an adjacent copy of the map.
    const longitude = Math.abs(lng) <= 180 ? lng : lng - 360 * Math.floor((lng + 180) / 360)
    setPin({ lat, lng: longitude })
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationError('تحديد الموقع غير متاح على هذا الجهاز. اختر موقعك على الخريطة.')
      return
    }
    const request = {}
    gpsRequest.current = request
    setLocating(true)
    setLocationError('')

    function onFailure(error) {
      if (gpsRequest.current !== request) return
      gpsRequest.current = null
      setLocating(false)
      setLocationError(error?.code === 1
        ? 'لم يتم السماح بالوصول إلى موقعك. اختر موقعك على الخريطة.'
        : 'تعذر تحديد موقعك. حاول مجدداً أو اختر موقعك على الخريطة.')
    }

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (gpsRequest.current !== request) return
      const location = { lat: coords.latitude, lng: coords.longitude }
      if (!isAddressLocation(location)) {
        onFailure()
        return
      }
      pickLocation(location.lat, location.lng)
    }, onFailure, { enableHighAccuracy: true, timeout: 10000 })
  }

  async function submit(event) {
    event.preventDefault()
    if (saving || locating) return
    setAttempted(true)
    setSaveError(null)
    if (Object.keys(validateAddress({ title, description, location: confirmed })).length) return

    setSaving(true)
    try {
      const saved = await addressesApi.create({
        ...(title.trim() && { title: title.trim() }),
        description: description.trim(),
        location: confirmed,
        is_default: !firstAddress && isDefault,
      })
      if (mounted.current) onSaved(saved)
    } catch (err) {
      if (!mounted.current) return
      if (isAddressSessionExpired(err)) onSessionExpired()
      else setSaveError(err)
    } finally {
      if (mounted.current) setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs" noValidate>
      <ErrorBanner err={saveError} />
      <fieldset disabled={saving} className="min-w-0 space-y-5">
        <div>
          <Label htmlFor="address-title">اسم العنوان (اختياري)</Label>
          <TextInput
            id="address-title"
            placeholder="مثلاً المنزل أو العمل"
            value={title}
            onChange={setTitle}
            error={Boolean(errors.title)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'address-title-error' : undefined}
          />
          {errors.title && <p id="address-title-error" className="mt-2 text-sm text-rose-700" role="alert">{errors.title}</p>}
        </div>

        <div>
          <Label htmlFor="address-description" req>وصف العنوان</Label>
          <textarea
            id="address-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="الحي والشارع ورقم المبنى وأقرب معلم"
            rows={3}
            required
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'address-description-count address-description-error' : 'address-description-count'}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-800 focus:ring-2 focus:ring-mawarid-500"
          />
          <p id="address-description-count" className="text-xs text-slate-600">{addressTextLength(description)} / {ADDRESS_LIMITS.description} حرف</p>
          {errors.description && <p id="address-description-error" className="mt-2 text-sm text-rose-700" role="alert">{errors.description}</p>}
        </div>

        <section aria-labelledby="address-location-title" className="space-y-3">
          <h2 id="address-location-title" className="text-sm font-bold text-slate-900">موقع العنوان</h2>
          <p id="address-map-instructions" className="text-sm text-slate-600">
            اضغط على الخريطة أو اسحب العلامة لتحديد الموقع. باستخدام لوحة المفاتيح، حرّك الخريطة ثم اضغط Enter لاختيار مركزها.
          </p>
          <div className={saving ? 'pointer-events-none' : undefined} inert={saving ? '' : undefined}>
            <LocationPicker
              lat={pin?.lat}
              lng={pin?.lng}
              onChange={pickLocation}
              initialCenter={TAIZ_CENTER}
              initialZoom={13}
              keyboardLabel="خريطة موقع العنوان"
              keyboardDescriptionId="address-map-instructions"
            />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <SecondaryBtn onClick={requestLocation} disabled={locating}>
              {locating ? 'جارٍ تحديد موقعك…' : 'استخدام موقعي الحالي'}
            </SecondaryBtn>
            <SecondaryBtn onClick={() => setConfirmed(pin)} disabled={!isAddressLocation(pin) || locating || Boolean(confirmed)}>
              تأكيد الموقع
            </SecondaryBtn>
          </div>
          {locationError && <p className="text-sm text-rose-700" role="alert">{locationError}</p>}
          {pin && (
            <p className="flex flex-wrap items-center gap-2 text-sm text-slate-700" role="status">
              {confirmed ? 'تم تأكيد الموقع' : 'الموقع المحدد بانتظار التأكيد'}
              <span dir="ltr" className="font-mono text-xs">{pin.lat}, {pin.lng}</span>
            </p>
          )}
          {errors.location && <p className="text-sm text-rose-700" role="alert">{errors.location}</p>}
        </section>

        <div className="rounded-xl bg-mawarid-50 p-3 text-sm text-slate-700">
          {firstAddress ? (
            <p>سيُحفظ عنوانك الأول تلقائياً كعنوان افتراضي.</p>
          ) : (
            <>
              <label className="flex min-h-[44px] items-center gap-2 font-bold text-slate-900">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(event) => setIsDefault(event.target.checked)}
                  className="h-5 w-5 shrink-0 accent-mawarid-700"
                />
                تعيين كعنوان افتراضي
              </label>
              {currentDefault && <p className="break-words">العنوان الافتراضي الحالي <bdi>{currentDefault.title || currentDefault.description}</bdi></p>}
            </>
          )}
        </div>
      </fieldset>
      <PrimaryBtn type="submit" loading={saving} disabled={locating}>
        <Icons.Check className="w-4 h-4" />
        حفظ العنوان
      </PrimaryBtn>
    </form>
  )
}
