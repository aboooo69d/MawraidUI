// ═══════════ شاشة استكشاف المخزون المتاح للمستفيدين ═══════════
import { useAuth } from '../../auth/hooks/useAuth'
import { BackBtn, Icons, SecondaryBtn, ThemeToggle } from '../../../shared/components/ui'
import { getResourceTheme } from '../../../shared/constants/resources'
import { ROUTES } from '../../../shared/constants/routes'
import { formatAmount } from '../utils/format'
import { useConsumerStocks } from '../hooks/useConsumerStocks'
import AddressLocationBar from '../components/AddressLocationBar'
import StockFilters from '../components/StockFilters'
import ConsumerStockCard from '../components/ConsumerStockCard'
import { StockListSkeleton } from '../components/StockDiscoverySkeleton'
import StockReadError from '../components/StockReadError'

export default function ConsumerStocksPage({ go, resource: service, onStockSignIn }) {
  const { user } = useAuth()
  const isConsumer = user?.role_name === 'consumer'
  const isGas = service === 'gas'
  const backToHome = isGas || !user

  const {
    addressLoading,
    addressErr,
    addresses,
    selectedAddress,
    activeCoords,
    locationSource,
    gpsLoading,
    gpsErr,
    selectAddress,
    requestGpsLocation,
    clearGpsLocation,

    stockTypes,
    searchInput,
    setSearchInput,
    submitSearchNow,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,

    stocks,
    meta,
    page,
    setPage,
    loading,
    err,
    reload,
  } = useConsumerStocks({ isConsumer, canLoadStockTypes: Boolean(user), resource: service })

  const resource = isGas ? 'gas' : getResourceTheme(stockTypes.find(({ id }) => id === filters.stockTypeId)?.slug)
  const totalPages = Math.max(1, Number(meta?.total_pages) || 1)
  const total = meta?.total
  const hasResults = stocks.length > 0

  return (
    <div dir="rtl" data-resource={resource} className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* ── الترويسة ── */}
      <header className="bg-canvas border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:justify-between">
          <div className="contents sm:flex sm:items-center sm:gap-2 sm:min-w-0">
            <BackBtn onClick={() => go(backToHome ? ROUTES.HOME : ROUTES.DASHBOARD)} label={backToHome ? 'الرئيسية' : 'لوحة التحكم'} />
            <div className="col-span-2 row-start-2 min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight">
                {isGas ? 'خدمة الغاز المنزلي' : 'استكشاف المخزون المتاح'}
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {activeCoords
                  ? 'مرتّب حسب الأقرب إلى موقعك مع حساب المسافة بالكيلومتر'
                  : 'تصفّح مواقع التوزيع والمخزون المتاح'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
            <button
              type="button"
              onClick={reload}
              disabled={loading}
              aria-label="تحديث القائمة"
              className="inline-flex min-h-11 min-w-11 justify-center items-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl border border-slate-200 bg-canvas hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            >
              <Icons.Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── المحتوى ── */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 space-y-3 text-right">
        {/* 1) شريط العنوان الافتراضي / الموقع */}
        <AddressLocationBar
          isConsumer={isConsumer}
          addressLoading={addressLoading}
          addressErr={addressErr}
          addresses={addresses}
          selectedAddress={selectedAddress}
          locationSource={locationSource}
          activeCoords={activeCoords}
          gpsLoading={gpsLoading}
          gpsErr={gpsErr}
          onSelectAddress={selectAddress}
          onRequestGps={requestGpsLocation}
          onClearGps={clearGpsLocation}
          go={go}
        />

        {/* 2) لوحة البحث والفلاتر */}
        <StockFilters
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={submitSearchNow}
          stockTypes={stockTypes}
          filters={filters}
          onUpdateFilter={updateFilter}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
          hasLocation={Boolean(activeCoords)}
        />

        <div role="status" className="flex min-h-5 flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
          {!loading && !err && (
            <span>{`عدد النتائج: ${formatAmount(total ?? stocks.length)}`}</span>
          )}
          {loading && hasResults && <span>جارٍ تحديث المخزون…</span>}
          {activeCoords && !err && (
            <span className="inline-flex items-center gap-1 text-mawarid-700 font-bold">
              <Icons.MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              الأقرب أولاً
            </span>
          )}
        </div>

        {loading && !hasResults ? (
          <StockListSkeleton />
        ) : err ? (
          <StockReadError
            err={err}
            user={user}
            onRetry={reload}
            onSignIn={() => onStockSignIn?.(ROUTES.CONSUMER_STOCKS, { resource: service })}
          />
        ) : !hasResults ? (
          <div className="min-h-44 rounded-2xl border border-slate-200 bg-canvas p-5 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <Icons.Box className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-black text-slate-900">
              {hasActiveFilters ? 'لا توجد مخازن مطابقة' : 'لا يوجد مخزون متاح حالياً'}
            </h2>
            {hasActiveFilters && <SecondaryBtn onClick={resetFilters}>مسح الفلاتر</SecondaryBtn>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-busy={loading}>
            {stocks.map((stock, index) => (
              <ConsumerStockCard
                key={stock.id}
                stock={stock}
                index={index}
                onSelect={(selected) => go(ROUTES.CONSUMER_STOCK_DETAILS, { stockId: selected.id, resource: service })}
              />
            ))}
          </div>
        )}

        {/* 5) الترقيم */}
        {!err && (totalPages > 1 || page > 1) && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <SecondaryBtn
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loading || page <= 1}
            >
              <span className="inline-flex items-center gap-1.5">
                <Icons.ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </span>
            </SecondaryBtn>

            <div className="text-center">
              <div className="text-xs font-black text-slate-700">
                صفحة {page} من {totalPages}
              </div>
              {total !== undefined && total !== null && (
                <div className="text-[11px] text-slate-400">{formatAmount(total)} مخزون</div>
              )}
            </div>

            <SecondaryBtn
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={loading || page >= totalPages}
            >
              <span className="inline-flex items-center gap-1.5">
                <span>التالي</span>
                <Icons.ArrowLeft className="w-4 h-4" />
              </span>
            </SecondaryBtn>
          </div>
        )}
      </main>
    </div>
  )
}
