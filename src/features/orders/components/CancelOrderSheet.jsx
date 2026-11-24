// ═══════════ نافذة سفلية (Bottom Sheet) لتأكيد إلغاء طلب قيد الانتظار ═══════════
import { useEffect, useState } from 'react'
import { ordersApi } from '../../../services/api'
import { ErrorBanner, Icons, Label, SecondaryBtn } from '../../../shared/components/ui'
import {
  formatOrderAmount,
  formatOrderPrice,
  isSessionExpiredError,
  validateCancelReason,
} from '../utils'

const PRESET_REASONS = [
  'تم الطلب بالخطأ',
  'تغيير عنوان التوصيل',
  'تغيير الكمية المطلوبة',
  'لم أعد بحاجة للطلب حالياً',
]

export default function CancelOrderSheet({
  order,
  onClose,
  onCancelled,
  onSessionExpired,
}) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)

  const open = Boolean(order)

  useEffect(() => {
    if (!open) return
    setReason('')
    setErr(null)
  }, [open, order?.id])

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

  if (!order) return null

  async function handleConfirmCancel(e) {
    if (e) e.preventDefault()
    setErr(null)

    const validationErr = validateCancelReason(reason)
    if (validationErr) {
      setErr(validationErr)
      return
    }

    const trimmed = reason.trim()
    setSubmitting(true)
    try {
      const updated = await ordersApi.cancelOrder(order.id, trimmed ? { reason: trimmed } : {})
      onCancelled?.(updated)
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
      className="fixed inset-0 z-[1200] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-order-sheet-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px]"
        onClick={() => !submitting && onClose?.()}
        aria-hidden="true"
      />

      <div className="sheet-up relative z-10 w-full max-w-lg bg-white rounded-t-3xl border-t border-x border-slate-200 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden text-right">
        <div className="px-5 sm:px-6 pt-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto mb-3" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="cancel-order-sheet-title" className="text-lg font-black text-slate-900">
                إلغاء الطلب
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-mono" dir="ltr">
                {order.order_number}
              </p>
            </div>
            <button
              type="button"
              onClick={() => !submitting && onClose?.()}
              disabled={submitting}
              aria-label="إغلاق"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer disabled:opacity-50"
            >
              <Icons.Close className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleConfirmCancel} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <ErrorBanner err={err} />

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 space-y-1">
            <p className="font-bold">
              سيتم إلغاء حجز ({formatOrderAmount(order.quantity)} {order.unit_name}) بقيمة{' '}
              <span className="font-mono" dir="ltr">{formatOrderPrice(order.total_price)}</span> ريال وإعادة الكمية إلى المخزون.
            </p>
            <p className="text-[11px] text-amber-800">
              يمكن إلغاء الطلبات التي لا تزال «قيد الانتظار» فقط.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cancel-reason">سبب الإلغاء (اختياري)</Label>
              <span className="text-[11px] font-mono text-slate-400" dir="ltr">
                {reason.length}/500
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {PRESET_REASONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer ${
                    reason === preset
                      ? 'border-mawarid-600 bg-mawarid-50 text-mawarid-800'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              id="cancel-reason"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب الإلغاء إن رغبت..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 min-h-[48px] rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-sm font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Icons.Refresh className="w-4 h-4 animate-spin" />
                  <span>جارٍ إلغاء الطلب…</span>
                </>
              ) : (
                <>
                  <Icons.Ban className="w-4 h-4" />
                  <span>تأكيد إلغاء الطلب</span>
                </>
              )}
            </button>

            <SecondaryBtn
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="min-h-[48px]"
            >
              تراجع
            </SecondaryBtn>
          </div>
        </form>
      </div>
    </div>
  )
}
