// ═══════════ شاشة استكشاف المخزون المتاح للمستفيدين ═══════════
import { useAuth } from '../../auth/hooks/useAuth'
import { BackBtn, ErrorBanner, Icons, SecondaryBtn } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'
import { formatAmount } from '../utils/format'
import { useConsumerStocks } from '../hooks/useConsumerStocks'
import AddressLocationBar from '../components/AddressLocationBar'
import StockFilters from '../components/StockFilters'
import ConsumerStockCard from '../components/ConsumerStockCard'

export default function ConsumerStocksPage({ go, onSessionExpired }) {
  const { user } = useAuth()
  const isConsumer = user?.role_name === 'consumer'

  const {
    addressLoading,
    defaultAddress,
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
  } = useConsumerStocks({ isConsumer, onSessionExpired })

  const totalPages = Math.max(1, Number(meta?.total_pages) || 1)
  const total = meta?.total

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* ── الترويسة ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BackBtn onClick={() => go(ROUTES.DASHBOARD)} label="لوحة التحكم" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                استكشاف المخزون المتاح
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {activeCoords
                  ? 'مرتّب حسب الأقرب إلى موقعك مع حساب المسافة بالكيلومتر'
                  : 'مرتّب حسب الأحدث — حدد عنواناً افتراضياً للترتيب حسب الأقرب'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={reload}
            disabled={loading}
            aria-label="تحديث القائمة"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <Icons.Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </header>

      {/* ── المحتوى ── */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-5 text-right">
        {/* 1) شريط العنوان الافتراضي / الموقع */}
        <AddressLocationBar
          isConsumer={isConsumer}
          addressLoading={addressLoading}
          defaultAddress={defaultAddress}
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

        {/* 3) ملخص النتائج */}
        {!loading && !err && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-1">
            <span>
              {total !== undefined && total !== null
                ? `إجمالي النتائج: ${formatAmount(total)} مخزون`
                : `عدد النتائج المعروضة: ${formatAmount(stocks.length)}`}
            </span>
            {activeCoords && (
              <span className="inline-flex items-center gap-1 text-mawarid-700 font-bold">
                <Icons.MapPin className="w-3.5 h-3.5" />
                <span>الأقرب أولاً</span>
              </span>
            )}
          </div>
        )}

        {/* 4) حالات التحميل / الخطأ / فارغ / النتائج */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-3 border-mawarid-200 border-t-mawarid-700 rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-600">جارٍ البحث عن المخزون المتاح…</p>
          </div>
        ) : err ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <ErrorBanner err={err} />
            <SecondaryBtn onClick={reload}>إعادة المحاولة</SecondaryBtn>
          </div>
        ) : stocks.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <Icons.Box className="w-6 h-6" />
            </div>
            <h2 className="text-base font-black text-slate-900">لا توجد مخازن مطابقة حالياً</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {hasActiveFilters
                ? 'جرّب توسيع نطاق المسافة أو تغيير فلاتر البحث والتوفر لعرض مزيد من النتائج.'
                : 'لا توجد مخازن متاحة للعرض في الوقت الحالي. حاول التحديث لاحقاً.'}
            </p>
            {hasActiveFilters && (
              <div className="pt-1">
                <SecondaryBtn onClick={resetFilters}>مسح الفلاتر</SecondaryBtn>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stocks.map((stock) => (
              <ConsumerStockCard key={stock.id} stock={stock} />
            ))}
          </div>
        )}

        {/* 5) الترقيم */}
        {!loading && !err && (stocks.length > 0 || page > 1) && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <SecondaryBtn
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
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
              disabled={page >= totalPages}
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
