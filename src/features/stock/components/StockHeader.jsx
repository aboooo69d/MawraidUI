// ═══════════ رأس شاشات المخزون — ترويسة ثابتة مع زر رجوع ═══════════
import { BackBtn, ThemeToggle } from '../../../shared/components/ui'

export default function StockHeader({ title, subtitle, onBack, backLabel = 'رجوع', action }) {
  return (
    <header className="sticky top-0 z-30 bg-canvas border-b border-slate-200 shadow-xs">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 min-h-16 py-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:justify-between">
        <div className="contents sm:flex sm:items-center sm:gap-2 sm:min-w-0">
          <BackBtn onClick={onBack} label={backLabel} />
          <div className="col-span-2 row-start-2 min-w-0">
            <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 leading-tight">{title}</h1>
            {subtitle && <p className="hidden sm:block text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          {action}
        </div>
      </div>
    </header>
  )
}
