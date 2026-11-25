// ═══════════ بطاقة طلب وارد واحد لمزود الخدمة مع أزرار القبول والرفض والإتمام ═══════════
import { Icons } from '../../../shared/components/ui'
import {
  formatConsumerType,
  formatOrderAmount,
  formatOrderDateTime,
  formatOrderGazType,
  formatOrderPrice,
  formatPaymentMethod,
  getOrderStatusMeta,
  getPaymentStatusMeta,
} from '../utils'

export default function ProviderOrderCard({
  order,
  stockLabel,
  actionLoading = false,
  onSelect,
  onAccept,
  onRejectClick,
  onComplete,
}) {
  if (!order) return null

  const statusMeta = getOrderStatusMeta(order.status)
  const payStatusMeta = getPaymentStatusMeta(order.payment_status)
  const gazType = formatOrderGazType(order.order_details?.gaz_stock_type)
  const isPending = order.status === 'pending'
  const isAccepted = order.status === 'accepted'
  const hasCoords =
    Number.isFinite(Number(order.address?.lat)) &&
    Number.isFinite(Number(order.address?.lng)) &&
    (Number(order.address?.lat) !== 0 || Number(order.address?.lng) !== 0)

  return (
    <article className="rounded-2xl border border-slate-200 bg-canvas p-4 sm:p-5 shadow-xs hover:border-mawarid-300 transition space-y-3.5 text-right flex flex-col justify-between">
      <div className="space-y-3.5">
        {/* السطر العلوي: رقم الطلب + الحالة + الإجمالي */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs sm:text-sm font-black text-slate-900" dir="ltr">
                {order.order_number}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${statusMeta.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                <span>{statusMeta.label}</span>
              </span>
              {gazType && (
                <span className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
                  {gazType}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Icons.Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{formatOrderDateTime(order.created_at)}</span>
              </span>
              {stockLabel && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                  <Icons.Box className="w-3 h-3 text-mawarid-700" />
                  <span className="truncate max-w-[160px]">{stockLabel}</span>
                </span>
              )}
            </div>
          </div>

          <div className="text-left shrink-0">
            <div className="text-lg font-black text-mawarid-900">
              <span className="font-mono" dir="ltr">{formatOrderPrice(order.total_price)}</span>{' '}
              <span className="text-xs font-bold text-slate-500">ريال</span>
            </div>
            <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold ${payStatusMeta.badgeClass}`}>
              {payStatusMeta.label} • {formatPaymentMethod(order.payment_method)}
            </span>
          </div>
        </div>

        {/* تفاصيل الكمية وصفة المستفيد */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center justify-between sm:block">
            <span className="text-slate-500 block">الوحدة والكمية</span>
            <span className="font-black text-slate-900">
              <span className="font-mono" dir="ltr">{formatOrderAmount(order.quantity)}</span> × {order.unit_name}
            </span>
          </div>

          <div className="flex items-center justify-between sm:block">
            <span className="text-slate-500 block">سعر الوحدة</span>
            <span className="font-bold text-slate-800">
              <span className="font-mono" dir="ltr">{formatOrderPrice(order.unit_price)}</span> ريال
            </span>
          </div>

          <div className="flex items-center justify-between sm:block">
            <span className="text-slate-500 block">صفة المستفيد</span>
            <span className="font-bold text-slate-800">{formatConsumerType(order.consumer_type)}</span>
          </div>
        </div>

        {/* عنوان التوصيل */}
        {order.address && (
          <div className="flex items-start justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-start gap-2 min-w-0">
              <Icons.MapPin className="w-4 h-4 text-mawarid-700 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-bold text-slate-800">{order.address.title}: </span>
                <span className="text-slate-600 break-words">{order.address.description}</span>
              </div>
            </div>

            {hasCoords && (
              <a
                href={`https://www.google.com/maps?q=${order.address.lat},${order.address.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-mawarid-700 transition"
              >
                الخريطة
              </a>
            )}
          </div>
        )}

        {/* ملاحظة المستفيد */}
        {order.notes && (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-950">
            <span className="font-black">ملاحظة المستفيد: </span>
            <span>{order.notes}</span>
          </div>
        )}

        {/* سبب الرفض أو الإلغاء */}
        {order.reason && (order.status === 'rejected' || order.status === 'cancelled') && (
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/60 px-3 py-2 text-xs text-rose-800">
            <span className="font-bold">السبب: </span>
            <span>{order.reason}</span>
          </div>
        )}
      </div>

      {/* شريط الإجراءات */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(order)}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <Icons.FileText className="w-3.5 h-3.5" />
            <span>التفاصيل</span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {isPending && (
            <>
              {onAccept && (
                <button
                  type="button"
                  onClick={() => onAccept(order)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-solid hover:bg-emerald-solid/90 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {actionLoading ? (
                    <Icons.Refresh className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Icons.Check className="w-3.5 h-3.5" />
                  )}
                  <span>قبول الطلب</span>
                </button>
              )}

              {onRejectClick && (
                <button
                  type="button"
                  onClick={() => onRejectClick(order)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer disabled:opacity-60"
                >
                  <Icons.Ban className="w-3.5 h-3.5" />
                  <span>رفض</span>
                </button>
              )}
            </>
          )}

          {isAccepted && onComplete && (
            <button
              type="button"
              onClick={() => onComplete(order)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-mawarid-700 hover:bg-mawarid-800 text-on-accent text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
            >
              {actionLoading ? (
                <Icons.Refresh className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Icons.Check className="w-3.5 h-3.5" />
              )}
              <span>إتمام التسليم والتحصيل</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
