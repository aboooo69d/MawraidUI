// ═══════════ اختبارات حساب المسافة الجغرافية (Haversine) وإثراء المخزون ═══════════
import { describe, it, expect } from 'vitest'
import {
  calculateDistanceKm,
  formatDistance,
  isValidCoords,
  getStockDistance,
  enrichStocksWithDistance,
} from '../utils/geo'

describe('calculateDistanceKm', () => {
  it('يرجع 0 عند تطابق الإحداثيات', () => {
    expect(calculateDistanceKm(13.5795, 44.0209, 13.5795, 44.0209)).toBe(0)
  })

  it('يحسب المسافة بالكيلومتر بدقة مقربة إلى خانة عشرية واحدة', () => {
    // نقطتان في مدينة تعز (~0.6 كم)
    const dist = calculateDistanceKm(13.5795, 44.0209, 13.5811, 44.0152)
    expect(dist).toBe(0.6)
  })

  it('يحسب المسافات الأكبر بشكل صحيح (درجة عرض ≈ 111.2 كم)', () => {
    const dist = calculateDistanceKm(13.0, 44.0, 14.0, 44.0)
    expect(dist).toBeGreaterThan(110)
    expect(dist).toBeLessThan(112)
  })
})

describe('formatDistance', () => {
  it('يعرض المسافات الأقل من 1 كم بالمتر', () => {
    expect(formatDistance(0.4)).toBe('400 م')
    expect(formatDistance(0.85)).toBe('850 م')
    expect(formatDistance(0)).toBe('0 م')
  })

  it('يعرض المسافات >= 1 كم بالكيلومتر بخانة عشرية واحدة', () => {
    expect(formatDistance(1)).toBe('1.0 كم')
    expect(formatDistance(2.4)).toBe('2.4 كم')
    expect(formatDistance(12.75)).toBe('12.8 كم')
  })

  it('يرجع null للقيم غير الصالحة', () => {
    expect(formatDistance(null)).toBeNull()
    expect(formatDistance(undefined)).toBeNull()
    expect(formatDistance(-1)).toBeNull()
    expect(formatDistance(Number.NaN)).toBeNull()
  })
})

describe('isValidCoords', () => {
  it('يتحقق من صلاحية خطوط العرض والطول', () => {
    expect(isValidCoords({ lat: 13.5795, lng: 44.0209 })).toBe(true)
    expect(isValidCoords({ lat: 95, lng: 44 })).toBe(false)
    expect(isValidCoords({ lat: 13, lng: 200 })).toBe(false)
    expect(isValidCoords({ lat: 13 })).toBe(false)
    expect(isValidCoords(null)).toBe(false)
  })
})

describe('enrichStocksWithDistance', () => {
  const consumerCoords = { lat: 13.5795, lng: 44.0209 }
  const sampleStocks = [
    { id: 's1', address: 'شارع جمال', location: { lat: 13.5811, lng: 44.0152 } },
    { id: 's2', address: 'بدون إحداثيات', location: null },
  ]

  it('يضيف distance_km و distance_formatted لكل مخزون يملك إحداثيات صالحة', () => {
    const result = enrichStocksWithDistance(sampleStocks, consumerCoords)
    expect(result[0].distance_km).toBe(0.6)
    expect(result[0].distance_formatted).toBe('600 م')
    expect(result[1].distance_km).toBeUndefined()
    expect(result[1].distance_formatted).toBeUndefined()
  })

  it('يرجع المخزون دون تعديل عند غياب إحداثيات المستفيد', () => {
    const result = enrichStocksWithDistance(sampleStocks, null)
    expect(result).toEqual(sampleStocks)
  })
})

describe('getStockDistance', () => {
  it('يحسب المسافة لمخزون واحد ويرجع null عند نقص الإحداثيات', () => {
    const consumerCoords = { lat: 13.5795, lng: 44.0209 }
    const stock = { id: 's1', location: { lat: 13.5811, lng: 44.0152 } }

    expect(getStockDistance(stock, consumerCoords)).toEqual({
      distance_km: 0.6,
      distance_formatted: '600 م',
    })
    expect(getStockDistance(stock, null)).toEqual({
      distance_km: null,
      distance_formatted: null,
    })
    expect(getStockDistance({ id: 's2', location: null }, consumerCoords)).toEqual({
      distance_km: null,
      distance_formatted: null,
    })
  })
})
