import { Icons, SecondaryBtn } from '../../../shared/components/ui'

export default function AddressCard({ address, onDetails, showOwner = false, detailsLabel = 'عرض التفاصيل' }) {
  const { title, description, location, is_default: isDefault } = address
  return (
    <article className={`rounded-2xl border bg-white p-4 sm:p-5 space-y-3 shadow-xs ${isDefault ? 'border-mawarid-200' : 'border-slate-200'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Icons.MapPin className="w-5 h-5 shrink-0 text-mawarid-700" />
        <h2 dir="auto" className="min-w-0 break-words font-black text-slate-900">{title || 'عنوان محفوظ'}</h2>
        {isDefault && (
          <span className="rounded-full bg-mawarid-50 px-2.5 py-1 text-xs font-bold text-mawarid-800">الافتراضي</span>
        )}
      </div>
      <p dir="auto" className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{description}</p>
      <dl className="space-y-1.5 text-xs text-slate-600">
        <div className="flex flex-wrap gap-x-2">
          <dt>الإحداثيات</dt>
          <dd dir="ltr" className="font-mono text-slate-800">{location.lat}, {location.lng}</dd>
        </div>
        {showOwner && (
          <>
            <div className="flex flex-wrap gap-x-2">
              <dt>معرّف العنوان</dt>
              <dd dir="ltr" className="break-all font-mono text-slate-800">{address.id}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt>معرّف صاحب العنوان</dt>
              <dd dir="ltr" className="break-all font-mono text-slate-800">{address.user_id}</dd>
            </div>
          </>
        )}
      </dl>
      {onDetails && <SecondaryBtn onClick={() => onDetails(address.id)}>{detailsLabel}</SecondaryBtn>}
    </article>
  )
}
