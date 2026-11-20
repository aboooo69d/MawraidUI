// ═══════════ شاشة إدارة وحدات المخزون — إضافة وتعديل (لا حذف — لا يوجد endpoint) ═══════════
import { useState } from 'react'
import { ROUTES } from '../../../shared/constants/routes'
import { stockApi } from '../../../services/api'
import { Icons, ErrorBanner, Label, PrimaryBtn, SecondaryBtn, TextInput } from '../../../shared/components/ui'
import StockPage from '../components/StockPage'
import { StockLoading, StockErrorState, SessionExpiredState, StockEmptyState } from '../components/StockStates'
import { useMyStock } from '../hooks/useMyStock'
import { isSessionExpired } from '../utils'
import { UNIT_NAME_MAX, validateUnitForm } from '../validation'

export default function StockUnitsPage({ go, showToast }) {
  const { status, stock, err, reload } = useMyStock()

  // نموذج إضافة وحدة فرعية
  const [addName, setAddName] = useState('')
  const [addRate, setAddRate] = useState('')
  const [addErrors, setAddErrors] = useState({})
  const [addServerErr, setAddServerErr] = useState(null)
  const [adding, setAdding] = useState(false)

  // نموذج تعديل وحدة قائمة
  const [editing, setEditing] = useState(null) // { id, name, rate }
  const [editErrors, setEditErrors] = useState({})
  const [editServerErr, setEditServerErr] = useState(null)
  const [saving, setSaving] = useState(false)

  const [sessionExpired, setSessionExpired] = useState(false)

  const units = Array.isArray(stock?.units) ? stock.units : []

  // ── إضافة وحدة فرعية ──
  async function addUnit(e) {
    if (e) e.preventDefault()
    setAddServerErr(null)
    const check = validateUnitForm({ name: addName, rate: addRate, units })
    setAddErrors(check.errors)
    if (!check.valid || adding) return

    setAdding(true)
    try {
      await stockApi.addStockUnit(stock.id, {
        name: check.name,
        rate: Number(addRate),
        is_main: false,
      })
      showToast?.('تمت إضافة الوحدة بنجاح')
      setAddName('')
      setAddRate('')
      setAddErrors({})
      reload() // تحديث الوحدات والأرصدة من الخادم
    } catch (e2) {
      if (isSessionExpired(e2)) setSessionExpired(true)
      else setAddServerErr(e2) // 1609 تكرار الاسم، 1606/1608 وحدة رئيسية
    } finally {
      setAdding(false)
    }
  }

  // ── تعديل وحدة ──
  function startEdit(u) {
    setEditing({ id: u.id, name: u.name, rate: String(u.rate) })
    setEditErrors({})
    setEditServerErr(null)
  }

  async function saveEdit() {
    if (!editing || saving) return
    const unit = units.find((u) => String(u.id) === String(editing.id))
    if (!unit) return
    const isMain = !!unit.is_main

    const check = validateUnitForm({
      name: editing.name,
      rate: editing.rate,
      units,
      excludeId: unit.id,
      isMain,
    })
    setEditErrors(check.errors)
    if (!check.valid) return

    // نرسل الحقول المتغيّرة فقط
    const payload = {}
    if (check.name !== unit.name) payload.name = check.name
    if (!isMain && Number(editing.rate) !== Number(unit.rate)) payload.rate = Number(editing.rate)
    if (Object.keys(payload).length === 0) {
      setEditing(null)
      return
    }

    setSaving(true)
    setEditServerErr(null)
    try {
      await stockApi.updateStockUnit(stock.id, unit.id, payload)
      showToast?.('تم حفظ التعديلات')
      setEditing(null)
      reload()
    } catch (e2) {
      if (isSessionExpired(e2)) {
        setSessionExpired(true)
      } else if (e2?.code === 1610 && payload.name && payload.rate !== undefined) {
        // تعديل المعامل مرفوض (وحدة مستخدمة سابقاً) — نسمح بالاسم فقط كما يسمح الخادم
        try {
          await stockApi.updateStockUnit(stock.id, unit.id, { name: payload.name })
          showToast?.('تم تعديل الاسم — لا يمكن تغيير معامل وحدة مستخدمة سابقاً')
          setEditing(null)
          reload()
        } catch (e3) {
          setEditServerErr(e3)
        }
      } else {
        setEditServerErr(e2) // 1609 تكرار، 1610 معامل وحدة مستخدمة
      }
    } finally {
      setSaving(false)
    }
  }

  // ── حالات المخزون ──
  if (status === 'loading' || status === 'error' || status === 'empty') {
    return (
      <StockPage title="إدارة الوحدات" subtitle="الوحدات ومعاملات التحويل" go={go} backTo={ROUTES.STOCK_DASHBOARD} backLabel="لوحة المخزون">
        {status === 'loading' && <StockLoading />}
        {status === 'error' && (isSessionExpired(err) ? <SessionExpiredState go={go} /> : <StockErrorState err={err} onRetry={reload} />)}
        {status === 'empty' && <StockEmptyState go={go} />}
      </StockPage>
    )
  }

  return (
    <StockPage title="إدارة الوحدات" subtitle="الوحدات ومعاملات التحويل" go={go} backTo={ROUTES.STOCK_DASHBOARD} backLabel="لوحة المخزون">
      {sessionExpired ? (
        <SessionExpiredState go={go} />
      ) : (
        <>
          {/* ── قائمة الوحدات ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-900">وحدات المخزون</h2>
              <span className="text-[11px] font-bold text-slate-400">{units.length} وحدة</span>
            </div>

            <ul className="space-y-3">
              {units.map((u) => {
                const isEditing = editing && String(editing.id) === String(u.id)
                const isMain = !!u.is_main
                return (
                  <li key={u.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label req htmlFor={`edit-name-${u.id}`}>اسم الوحدة</Label>
                            <TextInput
                              id={`edit-name-${u.id}`}
                              value={editing.name}
                              onChange={(v) => setEditing((s) => ({ ...s, name: v }))}
                              maxLength={UNIT_NAME_MAX}
                              error={!!editErrors.name}
                            />
                            {editErrors.name && <p className="text-[12px] font-bold text-rose-600 mt-1.5">{editErrors.name}</p>}
                          </div>
                          <div>
                            <Label htmlFor={`edit-rate-${u.id}`}>معامل التحويل</Label>
                            <TextInput
                              id={`edit-rate-${u.id}`}
                              value={isMain ? '1' : editing.rate}
                              onChange={(v) => setEditing((s) => ({ ...s, rate: v.replace(/\D/g, '').slice(0, 9) }))}
                              disabled={isMain}
                              readOnly={isMain}
                              inputMode="numeric"
                              dir="ltr"
                              placeholder="مثال: 12"
                              error={!!editErrors.rate}
                            />
                            {isMain ? (
                              <p className="text-[11px] font-bold text-slate-400 mt-1.5">معامل الوحدة الرئيسية ثابت 1 ولا يُعدَّل</p>
                            ) : (
                              editErrors.rate && <p className="text-[12px] font-bold text-rose-600 mt-1.5">{editErrors.rate}</p>
                            )}
                          </div>
                        </div>
                        {editServerErr && <ErrorBanner err={editServerErr} />}
                        <div className="flex gap-2">
                          <SecondaryBtn onClick={() => setEditing(null)} className="flex-1">
                            إلغاء
                          </SecondaryBtn>
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={saving}
                            className="flex-1 min-h-[44px] rounded-xl bg-mawarid-700 text-white text-sm font-bold hover:bg-mawarid-800 transition shadow-md shadow-mawarid-900/15 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-mawarid-500"
                          >
                            {saving ? (
                              <>
                                <Icons.Refresh className="w-4 h-4 animate-spin" />
                                <span>جارٍ الحفظ…</span>
                              </>
                            ) : (
                              <span>حفظ التعديلات</span>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-slate-900 truncate">{u.name}</span>
                            {isMain ? (
                              <span className="px-2 py-0.5 rounded-full bg-mawarid-50 text-mawarid-700 text-[10px] font-bold border border-mawarid-200">
                                رئيسية
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                                فرعية
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            معامل التحويل:{' '}
                            <strong className="font-mono text-slate-700" dir="ltr">{isMain ? 1 : u.rate}</strong>
                          </p>
                        </div>
                        <SecondaryBtn onClick={() => startEdit(u)} className="shrink-0">
                          <span className="inline-flex items-center gap-1.5">
                            <Icons.Settings className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </span>
                        </SecondaryBtn>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              ملاحظة: لا يُسمح بحذف الوحدات. المعاملات تُحسب نسبةً إلى الوحدة الرئيسية (المعامل 1).
            </p>
          </div>

          {/* ── إضافة وحدة فرعية ── */}
          <form onSubmit={addUnit} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3" noValidate>
            <h2 className="text-sm font-black text-slate-900">إضافة وحدة فرعية جديدة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label req htmlFor="new-unit-name">اسم الوحدة</Label>
                <TextInput
                  id="new-unit-name"
                  value={addName}
                  onChange={(v) => setAddName(v)}
                  placeholder="مثال: طرد"
                  maxLength={UNIT_NAME_MAX}
                  error={!!addErrors.name}
                />
                {addErrors.name && <p className="text-[12px] font-bold text-rose-600 mt-1.5">{addErrors.name}</p>}
              </div>
              <div>
                <Label req htmlFor="new-unit-rate">معامل التحويل</Label>
                <TextInput
                  id="new-unit-rate"
                  value={addRate}
                  onChange={(v) => setAddRate(v.replace(/\D/g, '').slice(0, 9))}
                  placeholder="مثال: 24"
                  inputMode="numeric"
                  dir="ltr"
                  error={!!addErrors.rate}
                />
                {addErrors.rate && <p className="text-[12px] font-bold text-rose-600 mt-1.5">{addErrors.rate}</p>}
              </div>
            </div>
            {addServerErr && <ErrorBanner err={addServerErr} />}
            <PrimaryBtn type="submit" loading={adding}>
              إضافة الوحدة
            </PrimaryBtn>
          </form>
        </>
      )}
    </StockPage>
  )
}
