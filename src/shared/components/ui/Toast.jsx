import { Icons } from '../icons'

export function Toast({ toast }) {
  return (
    <div className="fixed bottom-6 inset-x-4 z-50 flex justify-center pointer-events-none" role="status">
      {toast && (
        <div className={`max-w-full rounded-xl px-4 py-3 text-sm font-bold shadow-card border flex items-center gap-2.5 fade-in ${
          toast.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.ok
            ? <Icons.Check className="w-4 h-4 shrink-0" aria-hidden="true" />
            : <Icons.Alert className="w-4 h-4 shrink-0" aria-hidden="true" />}
          <span className="break-words min-w-0">{toast.msg}</span>
        </div>
      )}
    </div>
  )
}
