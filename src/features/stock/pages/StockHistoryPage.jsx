// ═══════════ شاشة سجل الحركات — ترقيم + فلترة (الكل / وارد / منصرف) ═══════════
import { useCallback, useEffect, useRef, useState } from 'react'
import { ROUTES } from '../../../shared/constants/routes'
import { stockApi } from '../../../services/api'
import { Icons, SecondaryBtn } from '../../../shared/components/ui'
import StockPage from '../components/StockPage'
import { StockLoading, StockErrorState, SessionExpiredState, StockEmptyState } from '../components/StockStates'
import { useStock } from '../hooks/useStock'
import { formatAmount, formatDateTime, isSessionExpired } from '../utils'

const PAGE_SIZE = 20 // الحد الأقصى 100 حسب العقد

const FILTERS = [
  { key: 'all', label: 'كل الحركات' },
  { key: 'in', label: 'الوارد فقط' },
  { key: 'out', label: 'المنصرف فقط' },
]

export default function StockHistoryPage({ go, stockId: propStockId }) {
  const { status, stock, err, reload } = useStock(propStockId)

  const [filter, setFilter] = useState('all') // 'all' | 'in' | 'out'
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [listErr, setListErr] = useState(null)

  const seqRef = useRef(0) // حماية من تجاوز الاستجابة القديمة للأخيرة
  const stockId = stock?.id

  const load = useCallback(async (id, f, p) => {
    const seq = ++seqRef.current
    setLoading(true)
    setListErr(null)
    try {
      const res = await stockApi.getStockTransactions(id, {
        page: p,
        page_size: PAGE_SIZE,
        is_in: f === 'all' ? undefined : f === 'in',
      })
      if (seq !== seqRef.current) return // استجابة قديمة — تُتجاهل
      setItems(Array.isArray(res?.data) ? res.data : [])
      setMeta(res?.meta || null)
    } catch (e) {
      if (seq !== seqRef.current) return
      setItems([])
      setMeta(null)
      setListErr(e)
    } finally {
      if (seq === seqRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (stockId) load(stockId, filter, page)
  }, [stockId, filter, page, load])

  function changeFilter(key) {
    if (key === filter) return
    setFilter(key)
    setPage(1) // إعادة الترقيم مع تغيير الفلتر — يُنفَّذ في دفعة واحدة
  }

  const totalPages = Number(meta?.total_pages) || 1
  const total = meta?.total

  // ── حالات المخزون ──
  if (status === 'loading' || status === 'error' || status === 'empty') {
    return (
      <StockPage title="سجل الحركات" subtitle="الوارد والمنصرف" go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId: propStockId }} backLabel="لوحة المخزون">
        {status === 'loading' && <StockLoading label="جارٍ تحميل سجل الحركات…" />}
        {status === 'error' && (isSessionExpired(err) ? <SessionExpiredState go={go} /> : <StockErrorState err={err} onRetry={reload} />)}
        {status === 'empty' && <StockEmptyState go={go} />}
      </StockPage>
    )
  }

  const sessionExpiredList = isSessionExpired(listErr)

  return (
    <StockPage title="سجل الحركات" subtitle="الوارد والمنصرف" go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId: propStockId }} backLabel="لوحة المخزون">
      {/* ── الفلاتر ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold" aria-label="فلترة الحركات">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => changeFilter(f.key)}
            className={`flex-1 px-3 py-2.5 rounded-lg transition cursor-pointer ${
              filter === f.key ? 'bg-white text-mawarid-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── النتائج ── */}
      {sessionExpiredList ? (
        <SessionExpiredState go={go} />
      ) : loading ? (
        <StockLoading label="جارٍ تحميل الحركات…" />
      ) : listErr ? (
        <StockErrorState err={listErr} onRetry={() => load(stockId, filter, page)} />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center fade-in">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
            <Icons.History className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-base font-black text-slate-900">لا توجد حركات مسجلة</h2>
          <p className="text-xs text-slate-500 mt-1.5">
            {filter === 'all' ? 'ستظهر هنا حركات التوريد والصرف بعد تسجيلها' : 'لا توجد حركات مطابقة لهذا الفلتر'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((t) => (
            <li key={t.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-black border ${
                      t.is_in ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {t.is_in ? 'وارد' : 'منصرف'}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-slate-900">
                      <span className="font-mono" dir="ltr">{formatAmount(t.amount)}</span>{' '}
                      <span>{t.unit?.name || ''}</span>
                    </div>
                    {t.description && (
                      <p className="text-xs text-slate-500 mt-1 break-words leading-relaxed">{t.description}</p>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{formatDateTime(t.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── الترقيم ── */}
      {!loading && !listErr && items.length > 0 && (
        <div className="flex items-center justify-between gap-3 pt-1">
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
              <div className="text-[11px] text-slate-400">{formatAmount(total)} حركة</div>
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
    </StockPage>
  )
}
