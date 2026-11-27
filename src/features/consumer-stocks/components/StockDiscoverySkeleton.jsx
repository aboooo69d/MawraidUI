import { Skeleton } from '../../../shared/components/ui/Skeleton'

export function StockListSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">جارٍ البحث عن المخزون المتاح…</span>
      <div className="grid gap-3 md:grid-cols-2">
        {[1, 2, 3, 4].map((slot) => (
          <div key={slot} className="mw-stock-card flex flex-col justify-between rounded-2xl border border-slate-200 bg-canvas p-3.5">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StockDetailsSkeleton() {
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">جارٍ تحميل تفاصيل المخزون…</span>
      <div className="mw-service-summary space-y-3 rounded-2xl p-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-canvas p-4">
        <Skeleton className="h-5 w-36" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
      <Skeleton className="h-[280px] w-full" />
    </div>
  )
}
