import { BackBtn } from '../../../shared/components/ui'

export default function AddressPage({ title, onBack, backLabel = 'لوحة التحكم', children }) {
  return (
    <main dir="rtl" className="w-full max-w-3xl mx-auto px-4 py-5 sm:px-6 sm:py-8 space-y-5">
      <header className="space-y-4">
        <BackBtn onClick={onBack} label={backLabel} />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{title}</h1>
      </header>
      {children}
    </main>
  )
}
