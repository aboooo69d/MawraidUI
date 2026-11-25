export function Label({ children, req, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-bold text-slate-700 mb-1.5 mt-3 first:mt-0">
      {children} {req && <span className="text-rose-700 font-bold">*</span>}
    </label>
  )
}

export function PhoneInput({ value, onChange, error, id = 'phone' }) {
  return (
    <div className="flex gap-2">
      <span className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm font-bold text-slate-700 select-none shrink-0" dir="ltr">
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
        aria-invalid={error ? true : undefined}
        className="mw-input flex-1 text-left font-mono placeholder:font-sans"
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
      aria-invalid={error ? true : undefined}
      className={`mw-input ${className}`}
      {...props}
    />
  )
}
