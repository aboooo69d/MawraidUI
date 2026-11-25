import { Icons } from '../icons'

export function BackBtn({ onClick, label = 'رجوع' }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="mw-button mw-button-secondary shrink-0 justify-self-start px-2.5 sm:px-3"
      aria-label={label}
    >
      <Icons.ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="max-w-24 sm:max-w-none">{label}</span>
    </button>
  )
}

export function PrimaryBtn({ children, onClick, disabled, loading, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`mw-button mw-button-primary mt-5 w-full min-h-[48px] ${className}`}
    >
      {loading ? (
        <>
          <Icons.Refresh className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>جارٍ المعالجة…</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export function SecondaryBtn({ children, onClick, disabled, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`mw-button mw-button-secondary ${className}`}
    >
      {children}
    </button>
  )
}
