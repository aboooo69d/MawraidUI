// ═══════════ قالب شاشة المخزون — ترويسة + محتوى عريض ═══════════
import StockHeader from './StockHeader'
import { ROUTES } from '../../../shared/constants/routes'

export default function StockPage({ title, subtitle, go, backTo = ROUTES.DASHBOARD, backLabel = 'رجوع', action, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <StockHeader
        title={title}
        subtitle={subtitle}
        onBack={() => go(backTo)}
        backLabel={backLabel}
        action={action}
      />
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-4 text-right">{children}</main>
    </div>
  )
}
