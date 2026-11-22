// ═══════════ جلب تفاصيل مخزون محدد عبر stock_id ═══════════
// يحمي من الطلبات المكررة والردود القديمة (stale) عند تغيّر المخزون أو إعادة التحميل.
import { useCallback, useEffect, useRef, useState } from 'react'
import { stockApi } from '../../../services/api'
import { isStockMissing } from '../utils'

// status: 'loading' | 'ready' | 'empty' (404/1600 أو غياب المعرف) | 'error'
const INITIAL = { status: 'loading', stock: null, err: null }

export function useStock(stockId, { auto = true } = {}) {
  const [state, setState] = useState(() =>
    stockId ? INITIAL : { status: 'empty', stock: null, err: null }
  )
  const seqRef = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const reload = useCallback(async () => {
    if (!stockId) {
      setState({ status: 'empty', stock: null, err: null })
      return null
    }
    const seq = ++seqRef.current
    setState((s) => ({
      ...s,
      status: s.stock && String(s.stock.id) === String(stockId) ? 'ready' : 'loading',
      err: null,
    }))
    try {
      const stock = await stockApi.getStockById(stockId)
      if (!mountedRef.current || seq !== seqRef.current) return null
      if (!stock) {
        setState({ status: 'empty', stock: null, err: null })
        return null
      }
      setState({ status: 'ready', stock, err: null })
      return stock
    } catch (err) {
      if (!mountedRef.current || seq !== seqRef.current) return null
      if (isStockMissing(err)) setState({ status: 'empty', stock: null, err: null })
      else setState({ status: 'error', stock: null, err })
      return null
    }
  }, [stockId])

  useEffect(() => {
    if (auto) reload()
  }, [auto, reload])

  return { ...state, reload }
}
