const symbol = `url("${import.meta.env.BASE_URL}mawarid-symbol.svg")`

const symbolSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
}

export function BrandLogo({ size = 'md', layout = 'horizontal', className = '' }) {
  const stacked = layout === 'stacked'
  return (
    <div className={`mw-brand-lockup flex min-w-0 items-center select-none ${stacked ? 'flex-col gap-0.5' : 'gap-2'} ${className}`}>
      <span
        className={`mw-brand-symbol block shrink-0 ${symbolSizes[size]}`}
        style={{ maskImage: symbol }}
        aria-hidden="true"
      />
      <span className={`font-black leading-tight ${stacked ? 'text-2xl' : 'text-lg'}`}>موارد</span>
      {stacked && <span lang="en" dir="ltr" className="text-[0.625rem] font-bold tracking-[0.22em]">MAWARID</span>}
    </div>
  )
}

export function Logo({ title, subtitle }) {
  return (
    <div className="text-center mb-6">
      <BrandLogo size="lg" layout="stacked" className="mb-4" />
      <h1 className="mw-h1 text-slate-900">{title}</h1>
      {subtitle && <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1.5 max-w-sm mx-auto">{subtitle}</p>}
    </div>
  )
}
