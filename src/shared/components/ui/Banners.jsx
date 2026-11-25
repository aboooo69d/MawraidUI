import { getErrorMessage } from '../../../services/api'
import { Icons } from '../icons'

export function ErrorBanner({ err }) {
  if (!err) return null
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800 fade-in" role="alert">
      <div className="shrink-0 mt-0.5 text-rose-600">
        <Icons.Alert className="w-5 h-5" />
      </div>
      <div className="flex-1 font-medium leading-relaxed">{getErrorMessage(err)}</div>
      {err.code && (
        <span className="shrink-0 font-mono rounded-md border border-rose-200 bg-rose-50 text-rose-900 text-[11px] font-bold px-1.5 py-0.5">
          {err.code}
        </span>
      )}
    </div>
  )
}

export function InfoBanner({ children }) {
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-sm text-sky-900 fade-in">
      <div className="shrink-0 mt-0.5 text-sky-600">
        <Icons.Shield className="w-4 h-4" />
      </div>
      <div className="flex-1 font-medium leading-relaxed">{children}</div>
    </div>
  )
}
