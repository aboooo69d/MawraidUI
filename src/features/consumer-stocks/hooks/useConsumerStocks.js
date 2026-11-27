// ═══════════ Hook استكشاف المخزون للمستفيد مع العنوان الافتراضي وحساب المسافة ═══════════
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { addressesApi, stockApi } from '../../../services/api'
import { getResourceTheme } from '../../../shared/constants/resources'
import { enrichStocksWithDistance, isValidCoords } from '../utils/geo'

const DEFAULT_PAGE_SIZE = 10
const RESOURCE_PAGE_SIZE = 100
const SEARCH_DEBOUNCE_MS = 350

export const DEFAULT_FILTERS = {
  name: '',
  stockTypeId: null,
  inStock: true, // الافتراضي: المتوفر فقط حسب دليل CONSUMER_STOCK_API.md
  maxDistanceKm: null, // null = بدون حد أقصى للمسافة
}

async function getResourceStocks(resource, query, signal) {
  // The catalog is restricted to providers/admins and the API accepts one exact type.
  // Use the type on each listing, preserving the API's search and distance ordering.
  const matches = new Map()
  let page = 1
  let totalPages = 1

  do {
    const { data, meta } = await stockApi.getStocks(
      { ...query, page, page_size: RESOURCE_PAGE_SIZE },
      { signal },
    )
    signal.throwIfAborted()
    for (const stock of data) {
      if (getResourceTheme(stock.type?.slug) === resource) matches.set(stock.id, stock)
    }
    totalPages = Number(meta?.total_pages) || 1
    page++
  } while (page <= totalPages)

  return { data: [...matches.values()], meta: null }
}

export function useConsumerStocks({ isConsumer = true, canLoadStockTypes = false, resource } = {}) {
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

  const stockRequest = useRef(null)
  const addressRequest = useRef(0)

  // 1) جلب تصنيفات المخزون للفلتر
  useEffect(() => {
    if (resource || !canLoadStockTypes) return
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
  }, [canLoadStockTypes, resource])

  // 2) جلب العنوان الافتراضي وقائمة عناوين المستفيد
  const loadAddresses = useCallback(async () => {
    const sequence = ++addressRequest.current
    if (!isConsumer) {
      setDefaultAddress(null)
      setAddresses([])
      setSelectedAddressId(null)
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

      if (sequence !== addressRequest.current) return
      const list = Array.isArray(allAddrs) ? allAddrs : []
      // إذا وُجد عنوان افتراضي ولم يكن ضمن القائمة نضمن وجوده
      const mergedList =
        defAddr && !list.some((a) => a.id === defAddr.id) ? [defAddr, ...list] : list

      setDefaultAddress(defAddr)
      setAddresses(mergedList)
      setSelectedAddressId(defAddr?.id || null)
    } catch (e) {
      if (sequence !== addressRequest.current) return
      setAddressErr(e)
      setDefaultAddress(null)
      setAddresses([])
      setSelectedAddressId(null)
    } finally {
      if (sequence === addressRequest.current) setAddressLoading(false)
    }
  }, [isConsumer])

  useEffect(() => {
    loadAddresses()
    return () => { addressRequest.current++ }
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
    if (!isConsumer || !selectedAddressId) return null
    return addresses.find((a) => a.id === selectedAddressId) || (defaultAddress?.id === selectedAddressId ? defaultAddress : null)
  }, [addresses, defaultAddress, isConsumer, selectedAddressId])

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
  const requestPage = resource ? 1 : page
  const fetchStocks = useCallback(async () => {
    if (addressLoading) return

    stockRequest.current?.abort()
    const controller = new AbortController()
    stockRequest.current = controller
    const { signal } = controller
    setLoading(true)
    setErr(null)

    const query = {
      name: filters.name || undefined,
      stock_type_id: filters.stockTypeId || undefined,
      in_stock: typeof filters.inStock === 'boolean' ? filters.inStock : undefined,
      page: requestPage,
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
      const res = resource
        ? await getResourceStocks(resource, query, signal)
        : await stockApi.getStocks(query, { signal })
      if (signal.aborted) return
      const enriched = enrichStocksWithDistance(res.data, activeCoords)
      setStocks(enriched)
      setMeta(res.meta)
    } catch (e) {
      if (signal.aborted) return
      setStocks([])
      setMeta(null)
      setErr(e)
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [addressLoading, filters, requestPage, activeCoords, resource])

  useEffect(() => {
    fetchStocks()
    return () => stockRequest.current?.abort()
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
    (Boolean(activeCoords) && filters.maxDistanceKm !== null)

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
    stockTypes: canLoadStockTypes ? stockTypes : [],
    searchInput,
    setSearchInput,
    submitSearchNow,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,

    // النتائج والترقيم
    stocks: resource ? stocks.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE) : stocks,
    meta: resource ? { total: stocks.length, total_pages: Math.ceil(stocks.length / DEFAULT_PAGE_SIZE) } : meta,
    page,
    setPage,
    loading: addressLoading || loading,
    err,
    reload: fetchStocks,
  }
}
