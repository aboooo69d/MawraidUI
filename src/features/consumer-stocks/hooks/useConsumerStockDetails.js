// ═══════════ Hook تفاصيل مخزون واحد للمستفيد مع العنوان الافتراضي المخزّن مؤقتاً ═══════════
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { addressesApi, stockApi } from '../../../services/api'
import { getStockDistance } from '../utils/geo'

export function useConsumerStockDetails(stockId, { isConsumer = true } = {}) {
  const [stock, setStock] = useState(null)
  const [defaultAddress, setDefaultAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const seqRef = useRef(0)

  const load = useCallback(async () => {
    if (!stockId) {
      setStock(null)
      setErr(new Error('معرّف المخزون غير محدد.'))
      setLoading(false)
      return
    }

    const seq = ++seqRef.current
    setLoading(true)
    setErr(null)

    try {
      const [stockData, cachedDefault] = await Promise.all([
        stockApi.getConsumerStockById(stockId),
        isConsumer ? addressesApi.getMyDefaultCached().catch(() => null) : Promise.resolve(null),
      ])

      if (seq !== seqRef.current) return
      setStock(stockData)
      setDefaultAddress(cachedDefault)
    } catch (e) {
      if (seq !== seqRef.current) return
      setStock(null)
      setErr(e)
    } finally {
      if (seq === seqRef.current) setLoading(false)
    }
  }, [stockId, isConsumer])

  useEffect(() => {
    load()
    return () => {
      seqRef.current++
    }
  }, [load])

  const distance = useMemo(
    () => getStockDistance(stock, isConsumer ? defaultAddress?.location : null),
    [stock, defaultAddress, isConsumer]
  )

  return {
    stock,
    defaultAddress: isConsumer ? defaultAddress : null,
    distanceKm: distance.distance_km,
    distanceFormatted: distance.distance_formatted,
    loading,
    err,
    reload: load,
  }
}
