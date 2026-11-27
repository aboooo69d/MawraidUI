export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`mw-skeleton rounded-lg ${className}`} />
}

export function LoadingCards({ label, count = 1 }) {
  return (
    <div role="status">
      <span className="sr-only">{label}</span>
      <div className={`grid gap-3 ${count > 1 ? 'md:grid-cols-2' : ''}`}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="flex min-h-44 flex-col justify-between rounded-2xl border border-slate-200 bg-canvas p-4">
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
