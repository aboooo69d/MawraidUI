import { Icons } from '../icons'

export function BrandLogo({ size = 'md', className = '' }) {
  const isSm = size === 'sm'
  const isLg = size === 'lg'
  return (
    <div className={`flex items-center gap-2.5 select-none min-w-0 ${className}`}>
      <div className={`rounded-xl mw-logo p-2 flex items-center justify-center shrink-0 ${isSm ? 'w-9 h-9' : isLg ? 'w-12 h-12' : 'w-10 h-10'}`}>
        <Icons.LogoMark className={isSm ? 'w-6 h-6' : isLg ? 'w-8 h-8' : 'w-7 h-7'} />
      </div>
      <div className="flex flex-col text-right">
        <span className={`font-black text-slate-900 leading-none ${isSm ? 'text-lg' : isLg ? 'text-2xl' : 'text-xl'}`}>
          مَـوَارِد
        </span>
        <span className="hidden min-[400px]:block text-xs font-medium text-slate-500 mt-0.5">
          منصة توزيع الموارد — تعز
        </span>
      </div>
    </div>
  )
}

export function Logo({ title, subtitle }) {
  return (
    <div className="text-center mb-6">
      <div className="w-16 h-16 mx-auto rounded-2xl mw-logo flex items-center justify-center mb-3">
        <Icons.LogoMark className="w-10 h-10" />
      </div>
      <h1 className="mw-h1 text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm font-medium text-slate-500 mt-1.5 max-w-sm mx-auto">{subtitle}</p>}
    </div>
  )
}
