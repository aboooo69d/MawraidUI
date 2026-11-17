// ═══════════ جلب مخزون المستخدم الحالي — حالة واحدة موثوقة ═══════════
// يحمي من الطلبات المكررة والردود القديمة (stale) عند تغيّر الشاشة أو إعادة التحميل.
import { useCallback, useEffect, useRef, useState } from 'react'
import { stockApi } from '../../../services/api'
import { isStockMissing } from '../utils'

// status: 'loading' | 'ready' | 'empty' (404/1600) | 'error'
const INITIAL = { status: 'loading', stock: null, err: null }

export function useMyStock({ auto = true } = {}) {
  const [state, setState] = useState(INITIAL)
  const seqRef = useRef(0) // مسلسل الطلبات — يتجاهل أي استجابة قديمة
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const reload = useCallback(async () => {
    const seq = ++seqRef.current
    // لا نُفرغ البيانات الحالية أثناء إعادة التحديث الصامتة
    setState((s) => ({ ...s, status: s.stock ? 'ready' : 'loading', err: null }))
    try {
      const stock = await stockApi.getMyStock()
      if (!mountedRef.current || seq !== seqRef.current) return null // استجابة قديمة أو بعد الخروج
      setState({ status: 'ready', stock, err: null })
      return stock
    } catch (err) {
      if (!mountedRef.current || seq !== seqRef.current) return null
      if (isStockMissing(err)) setState({ status: 'empty', stock: null, err: null })
      else setState({ status: 'error', stock: null, err })
      return null
    }
  }, [])

  useEffect(() => {
    if (auto) reload()
  }, [auto, reload])

  return { ...state, reload }
}
