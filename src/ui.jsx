// ═══════════ مكونات واجهة مشتركة — منصة موارد (تعز) ═══════════
import { errMsg } from './api'

// ── حزمة أيقونات SVG القياسية (بدون أي إيموجي كأيقونة بنيوية) ──
export const Icons = {
  LogoMark: ({ className = 'w-8 h-8' }) => (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" className="fill-mawarid-700" />
      {/* قطرة ماء وشعلة متداخلة هندسياً ترمز للموارد الحيوية */}
      <path d="M20 7C14 16 11 20 11 25C11 30 15 34 20 34C25 34 29 30 29 25C29 20 26 16 20 7Z" fill="#38BDF8" fillOpacity="0.3" />
      <path d="M20 12C16 18 14 21.5 14 25C14 28.3 16.7 31 20 31C23.3 31 26 28.3 26 25C26 21.5 24 18 20 12Z" fill="#38BDF8" />
      <path d="M20 18C18.5 22 17 24.5 17 27C17 28.7 18.3 30 20 30C21.7 30 23 28.7 23 27C23 24.5 21.5 22 20 18Z" fill="#F97316" />
      <circle cx="20" cy="27" r="2" fill="#FEF08A" />
    </svg>
  ),
  Alert: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Menu: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  ),
  Close: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Water: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  Gas: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  Fuel: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" />
      <path d="M15 10h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L20.5 6.5" />
      <path d="M3 11h12" />
      <path d="M6 7h6" />
    </svg>
  ),
  Driver: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v9c0 .6.4 1 1 1h2" />
      <circle cx="9" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  Home: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Business: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M9 8h1" />
      <path d="M9 12h1" />
      <path d="M9 16h1" />
      <path d="M14 8h1" />
      <path d="M14 12h1" />
      <path d="M14 16h1" />
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    </svg>
  ),
  Shield: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  MapPin: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Clock: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Upload: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Check: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  User: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Lock: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Eye: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  ),
  LogOut: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  ArrowRight: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  ArrowLeft: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  Phone: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Refresh: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  ),
  FileText: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
}

export function BrandLogo({ size = 'md', className = '' }) {
  const isSm = size === 'sm'
  const isLg = size === 'lg'
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`rounded-xl bg-gradient-to-br from-mawarid-700 to-mawarid-900 p-2 shadow-md flex items-center justify-center shrink-0 ${isSm ? 'w-9 h-9' : isLg ? 'w-12 h-12' : 'w-10 h-10'}`}>
        <Icons.LogoMark className={isSm ? 'w-6 h-6' : isLg ? 'w-8 h-8' : 'w-7 h-7'} />
      </div>
      <div className="flex flex-col text-right">
        <span className={`font-black tracking-tight text-slate-900 leading-none ${isSm ? 'text-lg' : isLg ? 'text-2xl' : 'text-xl'}`}>
          مَـوَارِد
        </span>
        <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
          منصة توزيع الموارد — تعز
        </span>
      </div>
    </div>
  )
}

export function Logo({ title, subtitle }) {
  return (
    <div className="text-center mb-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-mawarid-800 to-mawarid-950 flex items-center justify-center shadow-lg shadow-mawarid-900/15 mb-3">
        <Icons.LogoMark className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm font-medium text-slate-500 mt-1.5 max-w-sm mx-auto">{subtitle}</p>}
    </div>
  )
}

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
      <div className="flex-1 font-medium leading-relaxed">{errMsg(err)}</div>
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

export function Label({ children, req, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-bold text-slate-700 mb-1.5 mt-3.5 first:mt-0">
      {children} {req && <span className="text-rose-500 font-bold">*</span>}
    </label>
  )
}

export function PhoneInput({ value, onChange, error, id = 'phone' }) {
  return (
    <div className="flex gap-2">
      <span className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-sm font-bold text-slate-700 select-none shadow-sm" dir="ltr">
        +967
      </span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
        placeholder="7XXXXXXXX"
        dir="ltr"
        className={`flex-1 min-h-[48px] rounded-xl border bg-white px-3.5 text-left font-mono text-base font-semibold outline-none transition shadow-sm placeholder:text-slate-400 placeholder:font-sans focus:ring-2 focus:ring-mawarid-600/20 ${
          error ? 'border-rose-300 bg-rose-50/50 focus:border-rose-500' : 'border-slate-200 hover:border-slate-300 focus:border-mawarid-600'
        }`}
      />
    </div>
  )
}

export function TextInput({ id, type = 'text', placeholder, value, onChange, className = '', error, ...props }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full min-h-[48px] rounded-xl border bg-white px-3.5 text-slate-800 text-sm font-medium outline-none transition shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-mawarid-600/20 ${
        error ? 'border-rose-300 bg-rose-50/50 focus:border-rose-500' : 'border-slate-200 hover:border-slate-300 focus:border-mawarid-600'
      } ${className}`}
      {...props}
    />
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

export function ResourceBadge({ type }) {
  const map = {
    gas: { label: 'غاز منزلي', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: Icons.Gas },
    water: { label: 'مياه ووايتات', color: 'bg-sky-50 text-sky-800 border-sky-200', icon: Icons.Water },
    fuel: { label: 'مشتقات نفطية', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Icons.Fuel },
  }
  const item = map[type] || map.gas
  const Icon = item.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${item.color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{item.label}</span>
    </span>
  )
}
