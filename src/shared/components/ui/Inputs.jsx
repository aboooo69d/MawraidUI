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
