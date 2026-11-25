import { BackBtn, ThemeToggle } from '../../../shared/components/ui'

export default function AddressPage({ title, onBack, backLabel = 'لوحة التحكم', children }) {
  return (
    <main dir="rtl" className="w-full max-w-3xl mx-auto px-4 py-5 sm:px-6 sm:py-8 space-y-5">
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <BackBtn onClick={onBack} label={backLabel} />
          <ThemeToggle />
        </div>
        <h1 className="mw-h1 text-slate-900">{title}</h1>
      </header>
      {children}
    </main>
  )
}
