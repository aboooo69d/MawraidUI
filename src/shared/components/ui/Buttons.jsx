import { Icons } from '../icons'

export function BackBtn({ onClick, label = 'رجوع' }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-mawarid-500 cursor-pointer"
      aria-label={label}
    >
      <Icons.ArrowRight className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )
}

export function PrimaryBtn({ children, onClick, disabled, loading, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`mt-5 w-full min-h-[50px] rounded-xl bg-mawarid-700 text-white text-sm font-bold hover:bg-mawarid-800 active:bg-mawarid-900 transition shadow-md shadow-mawarid-900/15 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-mawarid-500 focus:ring-offset-2 ${className}`}
    >
      {loading ? (
        <>
          <Icons.Refresh className="w-4 h-4 animate-spin" />
          <span>جارٍ المعالجة…</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export function SecondaryBtn({ children, onClick, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`min-h-[44px] px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition shadow-sm active:bg-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-mawarid-500 ${className}`}
    >
      {children}
    </button>
  )
}
