// ═══════════ Hook استكشاف المخزون للمستفيد مع العنوان الافتراضي وحساب المسافة ═══════════
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { addressesApi, stockApi } from '../../../services/api'
import { enrichStocksWithDistance, isValidCoords } from '../utils/geo'

const DEFAULT_PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 350

const isSessionExpired = (err) => err?.status === 401 || err?.code === 1106

export const DEFAULT_FILTERS = {
  name: '',
  stockTypeId: null,
  inStock: true, // الافتراضي: المتوفر فقط حسب دليل CONSUMER_STOCK_API.md
  maxDistanceKm: null, // null = بدون حد أقصى للمسافة
}

export function useConsumerStocks({ isConsumer = true, onSessionExpired } = {}) {
  // ── حالة العناوين والموقع ──
  const [addressLoading, setAddressLoading] = useState(Boolean(isConsumer))
  const [addressErr, setAddressErr] = useState(null)
  const [defaultAddress, setDefaultAddress] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [gpsCoords, setGpsCoords] = useState(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsErr, setGpsErr] = useState(null)

  // ── تصنيفات المخزون (للفلتر) ──
  const [stockTypes, setStockTypes] = useState([])

  // ── حالة الفلاتر والترقيم ──
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  // ── نتائج المخزون ──
  const [stocks, setStocks] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const seqRef = useRef(0)

  // 1) جلب تصنيفات المخزون للفلتر
  useEffect(() => {
    let active = true
    stockApi
      .getStockTypes()
      .then((types) => {
        if (active && Array.isArray(types)) setStockTypes(types)
      })
      .catch(() => {
        // تصنيفات المخزون اختيارية للفلتر — لا تمنع عرض النتائج
      })
    return () => {
      active = false
    }
  }, [])

  // 2) جلب العنوان الافتراضي وقائمة عناوين المستفيد
  const loadAddresses = useCallback(async () => {
    if (!isConsumer) {
      setAddressLoading(false)
      return
    }

    setAddressLoading(true)
    setAddressErr(null)

    try {
      const [defAddr, allAddrs] = await Promise.all([
        addressesApi.getMyDefaultCached(),
        addressesApi.listMine().catch(() => []),
      ])

      const list = Array.isArray(allAddrs) ? allAddrs : []
      // إذا وُجد عنوان افتراضي ولم يكن ضمن القائمة نضمن وجوده
      const mergedList =
        defAddr && !list.some((a) => a.id === defAddr.id) ? [defAddr, ...list] : list

      setDefaultAddress(defAddr)
      setAddresses(mergedList)
      setSelectedAddressId(defAddr?.id || null)
    } catch (e) {
      if (isSessionExpired(e)) {
        onSessionExpired?.()
        return
      }
      setAddressErr(e)
      setDefaultAddress(null)
      setAddresses([])
      setSelectedAddressId(null)
    } finally {
      setAddressLoading(false)
    }
  }, [isConsumer, onSessionExpired])

  useEffect(() => {
    loadAddresses()
  }, [loadAddresses])

  // 3) تأخير بسيط (debounce) لحقل البحث النصي
  useEffect(() => {
    const trimmed = searchInput.trim()
    if (trimmed === filters.name) return
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, name: trimmed }))
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchInput, filters.name])

  // العنوان المختار حالياً
  const selectedAddress = useMemo(() => {
    if (!selectedAddressId) return null
    return addresses.find((a) => a.id === selectedAddressId) || (defaultAddress?.id === selectedAddressId ? defaultAddress : null)
  }, [addresses, defaultAddress, selectedAddressId])

  // الإحداثيات النشطة: GPS إن فُعِّل، وإلا إحداثيات العنوان المختار (الافتراضي أولاً)
  const activeCoords = useMemo(() => {
    if (isValidCoords(gpsCoords)) return gpsCoords
    if (isValidCoords(selectedAddress?.location)) return selectedAddress.location
    return null
  }, [gpsCoords, selectedAddress])

  const locationSource = isValidCoords(gpsCoords)
    ? 'gps'
    : isValidCoords(selectedAddress?.location)
      ? selectedAddress.is_default
        ? 'default-address'
        : 'saved-address'
      : 'none'

  // 4) جلب المخزون وتطبيق الفلاتر + حساب المسافة محلياً بالكيلومتر
  const fetchStocks = useCallback(async () => {
    if (addressLoading) return

    const seq = ++seqRef.current
    setLoading(true)
    setErr(null)

    const query = {
      name: filters.name || undefined,
      stock_type_id: filters.stockTypeId || undefined,
      in_stock: typeof filters.inStock === 'boolean' ? filters.inStock : undefined,
      page,
      page_size: DEFAULT_PAGE_SIZE,
    }

    if (activeCoords) {
      query.lat = activeCoords.lat
      query.lng = activeCoords.lng
      if (filters.maxDistanceKm && filters.maxDistanceKm > 0) {
        query.max_distance = filters.maxDistanceKm * 1000 // تحويل من كم إلى متر
      }
    }

    try {
      const res = await stockApi.getStocks(query)
      if (seq !== seqRef.current) return
      const enriched = enrichStocksWithDistance(res.data, activeCoords)
      setStocks(enriched)
      setMeta(res.meta)
    } catch (e) {
      if (seq !== seqRef.current) return
      if (isSessionExpired(e)) {
        onSessionExpired?.()
        return
      }
      setStocks([])
      setMeta(null)
      setErr(e)
    } finally {
      if (seq === seqRef.current) setLoading(false)
    }
  }, [addressLoading, filters, page, activeCoords, onSessionExpired])

  useEffect(() => {
    fetchStocks()
    return () => {
      seqRef.current++
    }
  }, [fetchStocks])

  // ── إجراءات التحكم بالفلاتر والموقع ──
  const selectAddress = useCallback((addressId) => {
    setGpsCoords(null)
    setGpsErr(null)
    setSelectedAddressId(addressId || null)
    setPage(1)
  }, [])

  const requestGpsLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsErr('المتصفح لا يدعم تحديد الموقع الجغرافي.')
      return
    }
    setGpsLoading(true)
    setGpsErr(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        })
        setGpsLoading(false)
        setPage(1)
      },
      () => {
        setGpsErr('تعذر الحصول على موقعك الحالي. تأكد من السماح بصلاحية الموقع.')
        setGpsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const clearGpsLocation = useCallback(() => {
    setGpsCoords(null)
    setGpsErr(null)
    setPage(1)
  }, [])

  const updateFilter = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }, [])

  const submitSearchNow = useCallback(() => {
    setFilters((prev) => ({ ...prev, name: searchInput.trim() }))
    setPage(1)
  }, [searchInput])

  const resetFilters = useCallback(() => {
    setSearchInput('')
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [])

  const hasActiveFilters =
    Boolean(filters.name) ||
    filters.stockTypeId !== null ||
    filters.inStock !== DEFAULT_FILTERS.inStock ||
    filters.maxDistanceKm !== null

  return {
    // الموقع والعناوين
    addressLoading,
    addressErr,
    defaultAddress,
    addresses,
    selectedAddress,
    selectedAddressId,
    activeCoords,
    locationSource,
    gpsLoading,
    gpsErr,
    selectAddress,
    requestGpsLocation,
    clearGpsLocation,
    reloadAddresses: loadAddresses,

    // الفلاتر
    stockTypes,
    searchInput,
    setSearchInput,
    submitSearchNow,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,

    // النتائج والترقيم
    stocks,
    meta,
    page,
    setPage,
    loading: addressLoading || loading,
    err,
    reload: fetchStocks,
  }
}
