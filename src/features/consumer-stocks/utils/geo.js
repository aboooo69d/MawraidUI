// ═══════════ حساب المسافة الجغرافية محلياً (Haversine Formula) ═══════════

/**
 * يحسب المسافة التقريبية بالكيلومتر بين نقطتين جغرافيتين باستخدام معادلة Haversine.
 * @param {number} lat1 خط العرض للنقطة الأولى (عنوان المستفيد)
 * @param {number} lon1 خط الطول للنقطة الأولى (عنوان المستفيد)
 * @param {number} lat2 خط العرض للنقطة الثانية (موقع المخزون)
 * @param {number} lon2 خط الطول للنقطة الثانية (موقع المخزون)
 * @returns {number} المسافة بالكيلومتر مقربة إلى خانة عشرية واحدة (مثال: 2.4)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // متوسط نصف قطر الأرض بالكيلومتر
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10
}

/**
 * تنسيق المسافة للعرض في واجهة البطاقات بالعربية.
 * مثال: 0.4 كم -> "400 م"، 2.4 كم -> "2.4 كم"
 */
export function formatDistance(distanceKm) {
  if (typeof distanceKm !== 'number' || !Number.isFinite(distanceKm) || distanceKm < 0) {
    return null
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} م`
  }
  return `${distanceKm.toFixed(1)} كم`
}

/**
 * التحقق من صلاحية إحداثيات جغرافية { lat, lng }.
 */
export function isValidCoords(coords) {
  return (
    coords !== null &&
    coords !== undefined &&
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lng >= -180 &&
    coords.lng <= 180
  )
}

/**
 * إثراء قائمة المخزون محلياً بالمسافة بالكيلومتر (distance_km) والنص المنسق (distance_formatted)
 * اعتماداً على إحداثيات المستفيد.
 */
export function enrichStocksWithDistance(stocks, consumerCoords) {
  if (!Array.isArray(stocks)) return []
  if (!isValidCoords(consumerCoords)) return stocks

  return stocks.map((stock) => {
    if (!isValidCoords(stock?.location)) return stock
    const km = calculateDistanceKm(
      consumerCoords.lat,
      consumerCoords.lng,
      stock.location.lat,
      stock.location.lng
    )
    return {
      ...stock,
      distance_km: km,
      distance_formatted: formatDistance(km),
    }
  })
}
