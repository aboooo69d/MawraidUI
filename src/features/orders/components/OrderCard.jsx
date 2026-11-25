// ═══════════ بطاقة عرض طلب واحد للمستفيد ═══════════
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

export default function OrderCard({ order, onSelect, onCancelClick }) {
  if (!order) return null

  const statusMeta = getOrderStatusMeta(order.status)
  const payStatusMeta = getPaymentStatusMeta(order.payment_status)
  const gazType = formatOrderGazType(order.order_details?.gaz_stock_type)
  const isPending = order.status === 'pending'

  return (
    <article className="rounded-2xl border border-slate-200 bg-canvas p-4 sm:p-5 shadow-xs hover:border-mawarid-300 transition space-y-3.5 text-right">
      {/* السطر العلوي: رقم الطلب + الحالة + التاريخ */}
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

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Icons.Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{formatOrderDateTime(order.created_at)}</span>
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

      {/* تفاصيل الوحدة والكمية وصفة المستفيد */}
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

      {/* العنوان والملاحظات */}
      {order.address && (
        <div className="flex items-start gap-2 text-xs text-slate-600">
          <Icons.MapPin className="w-4 h-4 text-mawarid-700 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-bold text-slate-800">{order.address.title}: </span>
            <span className="text-slate-600 break-words">{order.address.description}</span>
          </div>
        </div>
      )}

      {order.reason && (order.status === 'cancelled' || order.status === 'rejected') && (
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/60 px-3 py-2 text-xs text-rose-800">
          <span className="font-bold">السبب: </span>
          <span>{order.reason}</span>
        </div>
      )}

      {/* أزرار الإجراءات */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(order)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-mawarid-50 hover:bg-mawarid-100 text-mawarid-800 text-xs font-bold transition cursor-pointer"
          >
            <Icons.FileText className="w-3.5 h-3.5" />
            <span>تفاصيل الطلب</span>
          </button>
        )}

        {isPending && onCancelClick && (
          <button
            type="button"
            onClick={() => onCancelClick(order)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
          >
            <Icons.Ban className="w-3.5 h-3.5" />
            <span>إلغاء الطلب</span>
          </button>
        )}
      </div>
    </article>
  )
}
