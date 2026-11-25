// ═══════════ نافذة سفلية (Bottom Sheet) لإنشاء طلب جديد من المخزون ═══════════
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useModalFocus } from '../../../shared/hooks/useModalFocus'
import { useAuth } from '../../auth/hooks/useAuth'
import { addressesApi, ordersApi } from '../../../services/api'
import { ErrorBanner, Icons, Label, PrimaryBtn, SecondaryBtn } from '../../../shared/components/ui'
import {
  CONSUMER_TYPE_OPTIONS,
  formatOrderAmount,
  formatOrderPrice,
  getEnabledConsumerTypes,
  getUnitAvailableAmount,
  isSessionExpiredError,
  validateCreateOrder,
} from '../utils'

const CONSUMER_TYPE_ICONS = {
  home: Icons.Home,
  business: Icons.Business,
  driver: Icons.Driver,
}

export default function CreateOrderSheet({
  open,
  stock,
  initialUnitId,
  defaultAddress,
  onClose,
  onSuccess,
  onManageAddresses,
  onSessionExpired,
}) {
  const { user } = useAuth()
  const dialogRef = useModalFocus(open && Boolean(stock))

  const units = useMemo(() => (Array.isArray(stock?.units) ? stock.units : []), [stock])
  const mainUnit = useMemo(() => units.find((u) => u.is_main) || units[0] || null, [units])
  const enabledTypes = useMemo(() => getEnabledConsumerTypes(user), [user])

  const [unitId, setUnitId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [consumerType, setConsumerType] = useState('home')
  const [addressId, setAddressId] = useState('')
  const [notes, setNotes] = useState('')

  const [addressesState, setAddressesState] = useState({
    loading: false,
    list: [],
    err: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)

  const loadAddresses = useCallback(async () => {
    setAddressesState((prev) => ({ ...prev, loading: true, err: null }))
    try {
      const list = await addressesApi.listMine()
      setAddressesState({ loading: false, list, err: null })
      setAddressId((prevId) => {
        if (prevId && list.some((a) => a.id === prevId)) return prevId
        const preferred =
          list.find((a) => a.id === defaultAddress?.id) ||
          list.find((a) => a.is_default) ||
          list[0]
        return preferred?.id || ''
      })
    } catch (e) {
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setAddressesState({ loading: false, list: [], err: e })
    }
  }, [defaultAddress?.id, onSessionExpired])

  // تهيئة الحقول عند فتح النافذة السفلية
  useEffect(() => {
    if (!open || !stock) return

    const preferredUnit =
      units.find((u) => Number(u.id) === Number(initialUnitId) && getUnitAvailableAmount(stock, u) > 0) ||
      units.find((u) => u.is_main && getUnitAvailableAmount(stock, u) > 0) ||
      units.find((u) => getUnitAvailableAmount(stock, u) > 0) ||
      mainUnit

    setUnitId(preferredUnit ? String(preferredUnit.id) : '')
    setQuantity(1)
    setConsumerType(enabledTypes[0] || 'home')
    setNotes('')
    setErr(null)
    loadAddresses()
  }, [open, stock, initialUnitId, units, mainUnit, enabledTypes, loadAddresses])

  // قفل التمرير الخلفي ودعم زر Escape
  useEffect(() => {
    if (!open) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(e) {
      if (e.key === 'Escape' && !submitting) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, submitting, onClose])

  if (!open || !stock) return null

  const selectedUnit = units.find((u) => Number(u.id) === Number(unitId)) || null
  const maxAvailable = selectedUnit ? getUnitAvailableAmount(stock, selectedUnit) : 0
  const numericQty = Math.max(0, Math.floor(Number(quantity) || 0))
  const estimatedTotal = selectedUnit ? numericQty * (Number(selectedUnit.price) || 0) : 0
  const reservedBaseUnits = selectedUnit ? numericQty * (Number(selectedUnit.rate) || 1) : 0

  function handleSelectUnit(u) {
    const avail = getUnitAvailableAmount(stock, u)
    if (avail <= 0) return
    setUnitId(String(u.id))
    setQuantity((prev) => {
      const cur = Math.max(1, Math.floor(Number(prev) || 1))
      return Math.min(cur, avail)
    })
    setErr(null)
  }

  function stepQuantity(delta) {
    setErr(null)
    setQuantity((prev) => {
      const cur = Math.floor(Number(prev) || 0)
      const next = cur + delta
      if (maxAvailable > 0) return Math.min(Math.max(1, next), maxAvailable)
      return Math.max(1, next)
    })
  }

  function handleQuantityInput(val) {
    setErr(null)
    if (val === '') {
      setQuantity('')
      return
    }
    const digits = String(val).replace(/\D/g, '')
    if (!digits) {
      setQuantity('')
      return
    }
    const num = parseInt(digits, 10)
    if (maxAvailable > 0 && num > maxAvailable) {
      setQuantity(maxAvailable)
    } else {
      setQuantity(num)
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    setErr(null)

    const validationErr = validateCreateOrder({
      stockId: stock.id,
      unitId,
      quantity,
      maxAvailable,
      addressId,
      consumerType,
      notes,
    })
    if (validationErr) {
      setErr(validationErr)
      return
    }

    const payload = {
      stock_id: stock.id,
      unit_id: Number(unitId),
      quantity: Number(quantity),
      address_id: addressId,
      consumer_type: consumerType,
    }
    const trimmedNotes = notes.trim()
    if (trimmedNotes) {
      payload.notes = trimmedNotes
    }

    setSubmitting(true)
    try {
      const createdOrder = await ordersApi.createOrder(payload)
      onSuccess?.(createdOrder)
    } catch (e2) {
      if (isSessionExpiredError(e2)) {
        onSessionExpired?.()
        return
      }
      setErr(e2)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[1200] flex items-end justify-center sm:items-end"
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-order-sheet-title"
    >
      {/* خلفية معتمة */}
      <div
        className="fixed inset-0 bg-scrim/55 transition-opacity"
        onClick={() => !submitting && onClose?.()}
        aria-hidden="true"
      />

      {/* حاوية النافذة السفلية */}
      <div className="sheet-up relative z-10 w-full max-w-2xl bg-canvas rounded-t-3xl border-t border-x border-slate-200 shadow-2xl max-h-[92dvh] flex flex-col overflow-hidden text-right">
        {/* مقبض علوي وشريط العنوان */}
        <div className="px-5 sm:px-6 pt-3 pb-4 border-b border-slate-100 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto mb-3" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-mawarid-50 text-mawarid-700 text-[11px] font-bold mb-1">
                <Icons.ShoppingBag className="w-3.5 h-3.5" />
                <span>حجز وطلب مباشر</span>
              </div>
              <h2 id="create-order-sheet-title" className="text-lg sm:text-xl font-black text-slate-900 truncate">
                إنشاء طلب جديد — {stock.type?.name || 'مخزون'}
              </h2>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {stock.address || 'سيتم حجز الكمية من المخزون فوراً عند التأكيد'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => !submitting && onClose?.()}
              disabled={submitting}
              aria-label="إغلاق نافذة الطلب"
              className="mw-button mw-icon-button rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer disabled:opacity-50"
            >
              <Icons.Close className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* نموذج بيانات الطلب القابل للتمرير */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5">
          <ErrorBanner err={err} />

          {/* 1) اختيار الوحدة */}
          <div>
            <Label req>اختر الوحدة المطلوبة</Label>
            {units.length === 0 ? (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
                لا توجد وحدات متاحة في هذا المخزون حالياً.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {units.map((u) => {
                  const unitAvail = getUnitAvailableAmount(stock, u)
                  const isSelected = Number(unitId) === Number(u.id)
                  const outOfStock = unitAvail <= 0

                  return (
                    <button
                      key={u.id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => handleSelectUnit(u)}
                      className={`rounded-2xl border p-3.5 text-right transition flex flex-col justify-between gap-2 ${
                        outOfStock
                          ? 'border-slate-200 bg-slate-50 opacity-55 cursor-not-allowed'
                          : isSelected
                          ? 'border-mawarid-600 bg-mawarid-50/60 ring-2 ring-mawarid-600/20 cursor-pointer'
                          : 'border-slate-200 bg-canvas hover:border-mawarid-300 hover:bg-slate-50/50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-black text-sm text-slate-900 truncate">{u.name}</span>
                          {u.is_main && (
                            <span className="px-2 py-0.5 rounded-full bg-mawarid-100 text-mawarid-800 text-[10px] font-bold shrink-0">
                              رئيسية
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-black text-mawarid-800 shrink-0">
                          <span className="font-mono" dir="ltr">{formatOrderPrice(u.price)}</span>{' '}
                          <span className="text-[11px] font-bold text-slate-500">ريال</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60 w-full">
                        <span>
                          المتوفر:{' '}
                          <strong className={`font-mono ${outOfStock ? 'text-rose-600' : 'text-slate-800'}`} dir="ltr">
                            {formatOrderAmount(unitAvail)}
                          </strong>
                        </span>
                        {!u.is_main && mainUnit && (
                          <span>
                            يعادل <strong className="font-mono" dir="ltr">{formatOrderAmount(u.rate)}</strong> {mainUnit.name}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* 2) تحديد الكمية */}
          <div>
            <div className="flex items-center justify-between">
              <Label req htmlFor="order-qty-input">الكمية المطلوبة</Label>
              {selectedUnit && (
                <span className="text-[11px] font-bold text-slate-500">
                  الحد الأقصى المتاح: <span className="font-mono text-slate-800" dir="ltr">{formatOrderAmount(maxAvailable)}</span> {selectedUnit.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => stepQuantity(-1)}
                disabled={numericQty <= 1 || submitting}
                aria-label="إنقاص الكمية"
                className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Icons.Minus className="w-4 h-4" />
              </button>

              <input
                id="order-qty-input"
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={quantity}
                onChange={(e) => handleQuantityInput(e.target.value)}
                className="flex-1 min-h-[48px] rounded-xl border border-slate-200 bg-canvas px-4 text-center font-mono text-lg font-black text-slate-900 outline-none focus:border-mawarid-600 focus:ring-2 focus:ring-mawarid-600/20"
              />

              <button
                type="button"
                onClick={() => stepQuantity(1)}
                disabled={(maxAvailable > 0 && numericQty >= maxAvailable) || submitting}
                aria-label="زيادة الكمية"
                className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Icons.Plus className="w-4 h-4" />
              </button>
            </div>

            {selectedUnit && !selectedUnit.is_main && mainUnit && numericQty > 0 && (
              <p className="text-[11px] text-slate-500 mt-1.5">
                سيتم حجز <strong className="font-mono text-slate-800" dir="ltr">{formatOrderAmount(reservedBaseUnits)}</strong> {mainUnit.name} من رصيد المخزون.
              </p>
            )}
          </div>

          {/* 3) صفة المستفيد */}
          <div>
            <Label req>صفة المستفيد للطلب</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {CONSUMER_TYPE_OPTIONS.map((opt) => {
                const Icon = CONSUMER_TYPE_ICONS[opt.value] || Icons.User
                const isSelected = consumerType === opt.value
                const isEnabled = enabledTypes.includes(opt.value)

                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={!isEnabled}
                    onClick={() => {
                      setConsumerType(opt.value)
                      setErr(null)
                    }}
                    className={`rounded-2xl border p-3 text-right transition flex items-center gap-2.5 ${
                      !isEnabled
                        ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'border-mawarid-600 bg-mawarid-50/60 ring-2 ring-mawarid-600/20 cursor-pointer'
                        : 'border-slate-200 bg-canvas hover:border-mawarid-300 cursor-pointer'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-mawarid-700 text-on-accent' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">{opt.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{opt.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4) عنوان التوصيل المحفوظ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-bold text-slate-700">
                عنوان الاستلام / التوصيل <span className="text-rose-500 font-bold">*</span>
              </label>
              {onManageAddresses && (
                <button
                  type="button"
                  onClick={onManageAddresses}
                  className="text-xs font-bold text-mawarid-700 hover:underline cursor-pointer"
                >
                  إدارة العناوين
                </button>
              )}
            </div>

            {addressesState.loading ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-2.5 text-xs font-bold text-slate-600">
                <Icons.Refresh className="w-4 h-4 animate-spin text-mawarid-700" />
                <span>جارٍ تحميل عناوينك المحفوظة…</span>
              </div>
            ) : addressesState.err ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 space-y-2">
                <ErrorBanner err={addressesState.err} />
                <SecondaryBtn onClick={loadAddresses} className="w-full text-xs">
                  إعادة تحميل العناوين
                </SecondaryBtn>
              </div>
            ) : addressesState.list.length === 0 ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-amber-900">
                  <Icons.MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="font-bold leading-relaxed">
                    لا يوجد لديك عنوان محفوظ حتى الآن. يجب إضافة عنوان واحد على الأقل لإتمام الطلب.
                  </p>
                </div>
                {onManageAddresses && (
                  <SecondaryBtn onClick={onManageAddresses} className="w-full text-xs">
                    إضافة عنوان جديد الآن
                  </SecondaryBtn>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pl-1">
                {addressesState.list.map((addr) => {
                  const isSelected = addressId === addr.id
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setAddressId(addr.id)
                        setErr(null)
                      }}
                      className={`w-full rounded-xl border p-3 text-right transition flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-mawarid-600 bg-mawarid-50/60 ring-2 ring-mawarid-600/20'
                          : 'border-slate-200 bg-canvas hover:border-mawarid-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Icons.MapPin
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isSelected ? 'text-mawarid-700' : 'text-slate-400'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {addr.title || 'عنوان محفوظ'}
                            </span>
                            {addr.is_default && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                                افتراضي
                              </span>
                            )}
                          </div>
                          {addr.description && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{addr.description}</p>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-mawarid-700 border-mawarid-700 text-on-accent'
                            : 'border-slate-300 bg-canvas'
                        }`}
                      >
                        {isSelected && <Icons.Check className="w-3 h-3" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* 5) ملاحظات إضافية (اختياري) */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="order-notes">ملاحظات للمزود (اختياري)</Label>
              <span className="text-[11px] font-mono text-slate-400" dir="ltr">
                {notes.length}/500
              </span>
            </div>
            <textarea
              id="order-notes"
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: يرجى الاتصال عند الوصول أو تحديد معلم قريب..."
              className="w-full rounded-xl border border-slate-200 bg-canvas p-3 text-xs text-slate-800 outline-none transition focus:border-mawarid-600 focus:ring-2 focus:ring-mawarid-600/20"
            />
          </div>
        </form>

        {/* شريط الملخص المالي وزر التأكيد السفلي */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-500">الإجمالي المستحق</div>
              <div className="text-xl font-black text-mawarid-900">
                <span className="font-mono" dir="ltr">{formatOrderPrice(estimatedTotal)}</span>{' '}
                <span className="text-xs font-bold text-slate-600">ريال</span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-canvas border border-slate-200 text-xs font-bold text-slate-700">
              <Icons.Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>الدفع نقداً عند الاستلام</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <PrimaryBtn
              type="button"
              onClick={handleSubmit}
              loading={submitting}
              disabled={
                submitting ||
                !selectedUnit ||
                maxAvailable <= 0 ||
                numericQty <= 0 ||
                addressesState.loading ||
                addressesState.list.length === 0 ||
                !addressId
              }
              className="!mt-0 flex-1"
            >
              <Icons.ShoppingBag className="w-4 h-4" />
              <span>تأكيد وإنشاء الطلب</span>
            </PrimaryBtn>

            <SecondaryBtn
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="min-h-[50px]"
            >
              إلغاء
            </SecondaryBtn>
          </div>
        </div>
      </div>
    </div>
  )
}
