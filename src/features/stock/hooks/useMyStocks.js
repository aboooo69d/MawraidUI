// ═══════════ جلب قائمة مخازن المزود الحالي — Multi-Stock ═══════════
// يحمي من الطلبات المكررة والردود القديمة (stale) عند تغيّر الشاشة أو إعادة التحميل.
import { useCallback, useEffect, useRef, useState } from 'react'
import { stockApi } from '../../../services/api'

// status: 'loading' | 'ready' | 'empty' | 'error'
const INITIAL = { status: 'loading', stocks: [], err: null }

export function useMyStocks({ auto = true } = {}) {
  const [state, setState] = useState(INITIAL)
  const seqRef = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const reload = useCallback(async () => {
    const seq = ++seqRef.current
    setState((s) => ({
      ...s,
      status: s.stocks.length > 0 ? 'ready' : 'loading',
      err: null,
    }))
    try {
      const res = await stockApi.getMyStocks()
      if (!mountedRef.current || seq !== seqRef.current) return null
      const list = Array.isArray(res) ? res : []
      setState({
        status: list.length === 0 ? 'empty' : 'ready',
        stocks: list,
        err: null,
      })
      return list
    } catch (err) {
      if (!mountedRef.current || seq !== seqRef.current) return null
      setState({ status: 'error', stocks: [], err })
      return null
    }
  }, [])

  useEffect(() => {
    if (auto) reload()
  }, [auto, reload])

  return { ...state, reload }
}
