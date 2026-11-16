import { Icons } from '../icons'

export function Toast({ toast }) {
  if (!toast) return null
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-3 text-sm font-bold shadow-2xl flex items-center gap-2.5 fade-in ${
        toast.ok ? 'bg-slate-900 text-emerald-400 border border-slate-800' : 'bg-rose-700 text-white shadow-rose-900/40'
      }`}
      role="status"
    >
      {toast.ok ? <Icons.Check className="w-4 h-4 text-emerald-400" /> : <Icons.Alert className="w-4 h-4 text-rose-200" />}
      <span>{toast.msg}</span>
    </div>
  )
}
