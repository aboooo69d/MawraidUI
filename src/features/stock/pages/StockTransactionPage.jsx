// ═══════════ شاشة حركة مخزنية — إضافة كمية (وارد) أو سحب كمية (منصرف) ═══════════
import { useEffect, useRef, useState } from 'react'
import { ROUTES } from '../../../shared/constants/routes'
import { stockApi } from '../../../services/api'
import { ErrorBanner, Icons, InfoBanner, Label, PrimaryBtn, TextInput } from '../../../shared/components/ui'
import StockPage from '../components/StockPage'
import { StockLoading, StockErrorState, SessionExpiredState, StockEmptyState } from '../components/StockStates'
import { useStock } from '../hooks/useStock'
import { formatAmount, isSessionExpired } from '../utils'
import { DESC_MAX, validateTransaction } from '../validation'

export default function StockTransactionPage({ go, showToast, stockId, direction }) {
  const { status, stock, err, reload } = useStock(stockId)
  const [unitId, setUnitId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [serverErr, setServerErr] = useState(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const redirectedRef = useRef(false)

  // اتجاه غير صالح → عودة للوحة (مرة واحدة فقط لتفادي حلقات التنقل)
  useEffect(() => {
    if (direction !== 'in' && direction !== 'out' && !redirectedRef.current) {
      redirectedRef.current = true
      go(ROUTES.STOCK_DASHBOARD, { stockId })
    }
  }, [direction, go, stockId])

  const isIn = direction === 'in'
  const units = Array.isArray(stock?.units) ? stock.units : []
  const selectedUnit = units.find((u) => String(u.id) === String(unitId))
  const selectedBalance = Array.isArray(stock?.balances)
    ? stock.balances.find((b) => String(b.unit_id) === String(unitId))
    : null

  const check = validateTransaction({ amount, unitId, description, units })
  const showErr = (msg) => (submitted && msg ? <p className="text-[12px] font-bold text-rose-600 mt-1.5">{msg}</p> : null)

  async function submit(e) {
    if (e) e.preventDefault()
    setServerErr(null)
    setSessionExpired(false)
    setSubmitted(true)

    const result = validateTransaction({ amount, unitId, description, units })
    if (!result.valid) return
    if (submitting) return // منع الإرسال المزدوج

    setSubmitting(true)
    try {
      const payload = {
        amount: Number(amount),
        unit_id: Number(unitId),
        is_in: isIn,
      }
      const desc = description.trim()
      if (desc) payload.description = desc

      await stockApi.createStockTransaction(stock.id, payload)
      showToast?.(isIn ? 'تمت إضافة الكمية بنجاح' : 'تم سحب الكمية بنجاح')
      go(ROUTES.STOCK_DASHBOARD, { stockId: stock.id }) // اللوحة تعيد جلب الأرصدة من الخادم
    } catch (e2) {
      if (isSessionExpired(e2)) setSessionExpired(true)
      else setServerErr(e2) // يشمل 1602 نفاد الرصيد و1601/1603/1605
    } finally {
      setSubmitting(false)
    }
  }

  // ── حالات المخزون ──
  if (status === 'loading') {
    return (
      <StockPage title={isIn ? 'إضافة كمية' : 'سحب كمية'} go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId }} backLabel="لوحة المخزون">
        <StockLoading />
      </StockPage>
    )
  }
  if (status === 'error') {
    return (
      <StockPage title={isIn ? 'إضافة كمية' : 'سحب كمية'} go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId }} backLabel="لوحة المخزون">
        {isSessionExpired(err) ? <SessionExpiredState go={go} /> : <StockErrorState err={err} onRetry={reload} />}
      </StockPage>
    )
  }
  if (status === 'empty') {
    return (
      <StockPage title={isIn ? 'إضافة كمية' : 'سحب كمية'} go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId }} backLabel="لوحة المخزون">
        <StockEmptyState go={go} />
      </StockPage>
    )
  }

  const title = isIn ? 'إضافة كمية (وارد)' : 'سحب كمية (منصرف)'

  return (
    <StockPage title={title} subtitle="حركة مخزنية" go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId }} backLabel="لوحة المخزون">
      {sessionExpired ? (
        <SessionExpiredState go={go} />
      ) : (
        <>
          <div
            className={`rounded-2xl border p-4 flex items-start gap-3 ${
              isIn ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
            }`}
            role="status"
          >
            <span
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isIn ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {isIn ? <Icons.Plus className="w-5 h-5" /> : <Icons.Minus className="w-5 h-5" />}
            </span>
            <div>
              <h2 className={`text-sm font-black ${isIn ? 'text-emerald-900' : 'text-rose-900'}`}>
                {isIn ? 'توريد كمية إلى المخزون' : 'صرف كمية من المخزون'}
              </h2>
              <p className={`text-xs mt-0.5 ${isIn ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isIn ? 'ستُضاف الكمية إلى رصيدك المتاح فور تأكيد الخادم' : 'ستُخصم الكمية من رصيدك المتاح فور تأكيد الخادم'}
              </p>
            </div>
          </div>

          <InfoBanner>
            الرصيد الحالي: <strong className="font-mono" dir="ltr">{formatAmount(stock?.available)}</strong>{' '}
            {stock?.units?.find((u) => u.is_main)?.name || ''}
          </InfoBanner>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {/* ── الوحدة ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <Label req htmlFor="tx-unit">الوحدة</Label>
              <select
                id="tx-unit"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                aria-invalid={submitted && !!check.errors.unit}
                className={`w-full min-h-[48px] rounded-xl border bg-white px-3.5 text-slate-800 text-sm font-semibold outline-none transition shadow-sm focus:ring-2 focus:ring-mawarid-600/20 ${
                  submitted && check.errors.unit ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 hover:border-slate-300 focus:border-mawarid-600'
                }`}
              >
                <option value="">اختر الوحدة</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              {showErr(check.errors.unit)}
              {selectedBalance && (
                <p className="text-[12px] font-bold text-slate-500 mt-2">
                  رصيد هذه الوحدة:{' '}
                  <strong className="text-slate-800 font-mono" dir="ltr">{formatAmount(selectedBalance.amount)}</strong>{' '}
                  {selectedBalance.unit}
                </p>
              )}
              {!selectedBalance && selectedUnit && (
                <p className="text-[12px] font-bold text-slate-400 mt-2">لا يوجد رصيد مسجل لهذه الوحدة بعد</p>
              )}
            </div>

            {/* ── الكمية ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <Label req htmlFor="tx-amount">الكمية (عدد صحيح موجب)</Label>
              <TextInput
                id="tx-amount"
                value={amount}
                onChange={(v) => setAmount(v.replace(/\D/g, '').slice(0, 9))}
                placeholder="مثال: 5"
                inputMode="numeric"
                dir="ltr"
                error={submitted && !!check.errors.amount}
              />
              {showErr(check.errors.amount)}
            </div>

            {/* ── الوصف ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <Label htmlFor="tx-desc">الوصف (اختياري)</Label>
                <span className={`text-[11px] font-bold ${description.length > DESC_MAX ? 'text-rose-600' : 'text-slate-400'}`} dir="ltr">
                  {description.length}/{DESC_MAX}
                </span>
              </div>
              <textarea
                id="tx-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={DESC_MAX + 1}
                placeholder="مثال: توريد 5 كراتين — فاتورة شراء #102"
                className={`w-full rounded-xl border bg-white px-3.5 py-3 text-slate-800 text-sm font-medium outline-none transition shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-mawarid-600/20 resize-y ${
                  submitted && check.errors.description ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 hover:border-slate-300 focus:border-mawarid-600'
                }`}
              />
              {showErr(check.errors.description)}
            </div>

            {serverErr && <ErrorBanner err={serverErr} />}

            <PrimaryBtn type="submit" loading={submitting}>
              {isIn ? 'تأكيد الإضافة' : 'تأكيد السحب'}
            </PrimaryBtn>
          </form>
        </>
      )}
    </StockPage>
  )
}
