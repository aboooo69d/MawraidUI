import { getErrorMessage } from '../../../services/api'
import { Icons } from '../icons'

export function ErrorBanner({ err }) {
  if (!err) return null
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 px-3.5 py-3 text-[13px] text-rose-800 fade-in" role="alert">
      <div className="shrink-0 mt-0.5 text-rose-600">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="flex-1 font-medium leading-relaxed">{getErrorMessage(err)}</div>
      {err.code && (
        <span className="shrink-0 font-mono rounded-md bg-rose-200/80 text-rose-900 text-[11px] font-bold px-1.5 py-0.5">
          {err.code}
        </span>
      )}
    </div>
  )
}

export function InfoBanner({ children }) {
  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-[13px] text-sky-900 fade-in">
      <div className="shrink-0 mt-0.5 text-sky-600">
        <Icons.Shield className="w-4 h-4" />
      </div>
      <div className="flex-1 font-medium leading-relaxed">{children}</div>
    </div>
  )
}
