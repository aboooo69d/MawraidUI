// ═══════════ اختبارات قواعد التحقق في واجهة المخزون ═══════════
import { describe, it, expect } from 'vitest'
import {
  UNIT_NAME_MAX,
  DESC_MAX,
  ADDRESS_MAX,
  isPositiveInt,
  isValidLocation,
  validateCreateForm,
  validateTransaction,
  validateUnitForm,
} from '../validation'

describe('isPositiveInt', () => {
  it('accepts positive integers', () => {
    expect(isPositiveInt(1)).toBe(true)
    expect(isPositiveInt('12')).toBe(true)
  })
  it('rejects zero, negatives, floats and blanks', () => {
    expect(isPositiveInt(0)).toBe(false)
    expect(isPositiveInt(-3)).toBe(false)
    expect(isPositiveInt('1.5')).toBe(false)
    expect(isPositiveInt('')).toBe(false)
    expect(isPositiveInt(undefined)).toBe(false)
  })
})

describe('isValidLocation', () => {
  it('accepts valid coordinates including zero', () => {
    expect(isValidLocation(15.3694, 44.191)).toBe(true)
    expect(isValidLocation('0', '0')).toBe(true)
    expect(isValidLocation(-90, 180)).toBe(true)
  })

  it('rejects blank or out-of-range coordinates', () => {
    expect(isValidLocation('', '44.19')).toBe(false)
    expect(isValidLocation('15.36', '')).toBe(false)
    expect(isValidLocation('91', '44')).toBe(false)
    expect(isValidLocation('-91', '44')).toBe(false)
    expect(isValidLocation('15', '181')).toBe(false)
    expect(isValidLocation('abc', '44')).toBe(false)
  })
})

describe('validateCreateForm — إنشاء مخزون متعدد الحقول', () => {
  const gazType = { id: 1, name: 'غاز منزلي', slug: 'gaz', provider_type_id: 1 }
  const waterType = { id: 2, name: 'مياه', slug: 'water', provider_type_id: 1 }
  const validAddress = 'تعز - شارع جمال بجانب جولة المسبح'
  const main = { name: 'حبة', rate: '1', is_main: true }
  const second = { name: 'كرتون', rate: '12', is_main: false }

  it('accepts a valid gas form (مع gazStockType)', () => {
    const r = validateCreateForm({
      selectedType: gazType,
      address: validAddress,
      lat: '13.5795',
      lng: '44.0209',
      gazStockType: 'exchange',
      units: [main, second],
    })
    expect(r.valid).toBe(true)
    expect(r.typeError).toBeNull()
    expect(r.addressError).toBeNull()
    expect(r.locationError).toBeNull()
    expect(r.gazTypeError).toBeNull()
    expect(r.formError).toBeNull()
    expect(r.rowErrors.every((e) => !e)).toBe(true)
  })

  it('accepts a non-gas form without gazStockType', () => {
    const r = validateCreateForm({
      selectedType: waterType,
      address: validAddress,
      lat: '0',
      lng: '0',
      gazStockType: '',
      units: [main],
    })
    expect(r.valid).toBe(true)
    expect(r.gazTypeError).toBeNull()
  })

  it('requires gazStockType when slug is gaz', () => {
    const r = validateCreateForm({
      selectedType: gazType,
      address: validAddress,
      lat: '13.5',
      lng: '44.0',
      gazStockType: '',
      units: [main],
    })
    expect(r.valid).toBe(false)
    expect(r.gazTypeError).toBeTruthy()
  })

  it('validates address length (10-200 chars after trim)', () => {
    expect(
      validateCreateForm({
        selectedType: waterType,
        address: '   ',
        lat: '13.5',
        lng: '44.0',
        units: [main],
      }).addressError
    ).toBe('يرجى إدخال عنوان المخزون')

    expect(
      validateCreateForm({
        selectedType: waterType,
        address: '   قصير   ',
        lat: '13.5',
        lng: '44.0',
        units: [main],
      }).addressError
    ).toContain('10')

    expect(
      validateCreateForm({
        selectedType: waterType,
        address: 'أ'.repeat(ADDRESS_MAX + 1),
        lat: '13.5',
        lng: '44.0',
        units: [main],
      }).addressError
    ).toContain('200')
  })

  it('rejects missing stock type', () => {
    const r = validateCreateForm({
      selectedType: null,
      address: validAddress,
      lat: '13.5',
      lng: '44.0',
      units: [main],
    })
    expect(r.valid).toBe(false)
    expect(r.typeError).toBe('يرجى اختيار نوع المخزون')
  })

  it('rejects an empty units list and multiple main units', () => {
    expect(
      validateCreateForm({
        selectedType: waterType,
        address: validAddress,
        lat: '13.5',
        lng: '44.0',
        units: [],
      }).formError
    ).toBe('يجب إضافة وحدة واحدة على الأقل')

    expect(
      validateCreateForm({
        selectedType: waterType,
        address: validAddress,
        lat: '13.5',
        lng: '44.0',
        units: [main, { name: 'صندوق', rate: '1', is_main: true }],
      }).formError
    ).toContain('وحدة رئيسية واحدة')
  })

  it('rejects duplicate unit names and oversized unit names', () => {
    expect(
      validateCreateForm({
        selectedType: waterType,
        address: validAddress,
        lat: '13.5',
        lng: '44.0',
        units: [main, { name: 'حبة', rate: '5', is_main: false }],
      }).rowErrors[1]
    ).toContain('مكرر')

    expect(
      validateCreateForm({
        selectedType: waterType,
        address: validAddress,
        lat: '13.5',
        lng: '44.0',
        units: [main, { name: 'a'.repeat(UNIT_NAME_MAX + 1), rate: '2', is_main: false }],
      }).rowErrors[1]
    ).toBeTruthy()
  })
})

describe('validateTransaction — حركات المخزون', () => {
  const units = [
    { id: 10, name: 'حبة', rate: 1, is_main: true },
    { id: 11, name: 'كرتون', rate: 12, is_main: false },
  ]

  it('accepts a valid incoming transaction', () => {
    const r = validateTransaction({ amount: '5', unitId: 11, description: 'توريد 5 كراتين', units })
    expect(r.valid).toBe(true)
  })

  it('rejects invalid amounts and foreign units', () => {
    expect(validateTransaction({ amount: '0', unitId: 10, units }).errors.amount).toBeTruthy()
    expect(validateTransaction({ amount: 1, unitId: 999, units }).errors.unit).toContain('لا تنتمي')
    expect(
      validateTransaction({ amount: 1, unitId: 10, description: 'x'.repeat(DESC_MAX + 1), units }).errors.description
    ).toBeTruthy()
  })
})

describe('validateUnitForm — إدارة الوحدات', () => {
  const units = [
    { id: 10, name: 'حبة', rate: 1, is_main: true },
    { id: 11, name: 'كرتون', rate: 12, is_main: false },
  ]

  it('accepts a new valid secondary unit and rejects duplicates', () => {
    expect(validateUnitForm({ name: 'طرد', rate: '24', units }).valid).toBe(true)
    expect(validateUnitForm({ name: '  كرتون ', rate: '10', units }).errors.name).toBeTruthy()
    expect(validateUnitForm({ name: 'كرتون', rate: '15', units, excludeId: 11 }).valid).toBe(true)
  })
})
