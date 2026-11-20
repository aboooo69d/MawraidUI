// ═══════════ رأس شاشات المخزون — ترويسة ثابتة مع زر رجوع ═══════════
import { BackBtn } from '../../../shared/components/ui'

export default function StockHeader({ title, subtitle, onBack, backLabel = 'رجوع', action }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <BackBtn onClick={onBack} label={backLabel} />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">{title}</h1>
            {subtitle && <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    </header>
  )
}
