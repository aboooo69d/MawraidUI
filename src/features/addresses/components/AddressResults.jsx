import { ErrorBanner, SecondaryBtn } from '../../../shared/components/ui'

export default function AddressResults({ query, emptyMessage, children }) {
  if (query.loading) {
    return <p role="status" className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">جارٍ تحميل العناوين…</p>
  }
  if (query.err) {
    return (
      <div>
        <ErrorBanner err={query.err} />
        {query.err.status !== 403 && query.err.code !== 1107 && query.err.code !== 1700 && (
          <SecondaryBtn onClick={query.retry}>إعادة المحاولة</SecondaryBtn>
        )}
      </div>
    )
  }
  if (emptyMessage && (query.data === null || query.data?.length === 0)) {
    return <p role="status" className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">{emptyMessage}</p>
  }
  return children
}
