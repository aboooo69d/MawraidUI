// ═══════════ اختبارات قواعد التحقق في واجهة المخزون ═══════════
import { describe, it, expect } from 'vitest'
import {
  UNIT_NAME_MAX,
  DESC_MAX,
  isPositiveInt,
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

describe('validateCreateForm — إنشاء مخزون', () => {
  const main = { name: 'حبة', rate: '1', is_main: true }
  const second = { name: 'كرتون', rate: '12', is_main: false }

  it('accepts a valid form (نوع + وحدة رئيسية + فرعية)', () => {
    const r = validateCreateForm(1, [main, second])
    expect(r.valid).toBe(true)
    expect(r.typeError).toBeNull()
    expect(r.formError).toBeNull()
    expect(r.rowErrors.every((e) => !e)).toBe(true)
  })

  it('rejects missing stock type', () => {
    const r = validateCreateForm('', [main])
    expect(r.valid).toBe(false)
    expect(r.typeError).toBe('يرجى اختيار نوع المخزون')
  })

  it('rejects an empty units list', () => {
    const r = validateCreateForm(1, [])
    expect(r.valid).toBe(false)
    expect(r.formError).toBe('يجب إضافة وحدة واحدة على الأقل')
  })

  it('rejects multiple main units', () => {
    const r = validateCreateForm(1, [main, { name: 'صندوق', rate: '1', is_main: true }])
    expect(r.valid).toBe(false)
    expect(r.formError).toContain('وحدة رئيسية واحدة')
  })

  it('rejects a main unit whose rate is not 1', () => {
    const r = validateCreateForm(1, [{ name: 'حبة', rate: '2', is_main: true }])
    expect(r.valid).toBe(false)
    expect(r.rowErrors[0]).toBe('معامل الوحدة الرئيسية يجب أن يساوي 1')
  })

  it('rejects non-integer or <1 secondary rates', () => {
    expect(validateCreateForm(1, [main, { name: 'كرتون', rate: '0', is_main: false }]).rowErrors[1]).toBeTruthy()
    expect(validateCreateForm(1, [main, { name: 'كرتون', rate: '1.5', is_main: false }]).rowErrors[1]).toBeTruthy()
    expect(validateCreateForm(1, [main, { name: 'كرتون', rate: '', is_main: false }]).rowErrors[1]).toBeTruthy()
  })

  it('rejects duplicate unit names', () => {
    const r = validateCreateForm(1, [main, { name: 'حبة', rate: '5', is_main: false }])
    expect(r.valid).toBe(false)
    expect(r.rowErrors[1]).toContain('مكرر')
  })

  it('rejects blank names and names over 50 characters', () => {
    expect(validateCreateForm(1, [{ name: '   ', rate: '1', is_main: true }]).rowErrors[0]).toBeTruthy()
    const long = 'a'.repeat(UNIT_NAME_MAX + 1)
    expect(validateCreateForm(1, [main, { name: long, rate: '2', is_main: false }]).rowErrors[1]).toBeTruthy()
  })

  it('accepts a name of exactly 50 characters', () => {
    const exact = 'ب'.repeat(UNIT_NAME_MAX)
    const r = validateCreateForm(1, [main, { name: exact, rate: '2', is_main: false }])
    expect(r.valid).toBe(true)
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

  it('rejects invalid amounts (صفر/سالب/كسور/فارغ)', () => {
    expect(validateTransaction({ amount: '0', unitId: 10, units }).errors.amount).toBeTruthy()
    expect(validateTransaction({ amount: '-2', unitId: 10, units }).errors.amount).toBeTruthy()
    expect(validateTransaction({ amount: '2.5', unitId: 10, units }).errors.amount).toBeTruthy()
    expect(validateTransaction({ amount: '', unitId: 10, units }).errors.amount).toBeTruthy()
  })

  it('rejects a missing or foreign unit', () => {
    expect(validateTransaction({ amount: 1, unitId: '', units }).errors.unit).toBeTruthy()
    expect(validateTransaction({ amount: 1, unitId: 999, units }).errors.unit).toContain('لا تنتمي')
  })

  it('rejects descriptions over 1000 characters', () => {
    const r = validateTransaction({ amount: 1, unitId: 10, description: 'x'.repeat(DESC_MAX + 1), units })
    expect(r.errors.description).toBeTruthy()
  })
})

describe('validateUnitForm — إدارة الوحدات', () => {
  const units = [
    { id: 10, name: 'حبة', rate: 1, is_main: true },
    { id: 11, name: 'كرتون', rate: 12, is_main: false },
  ]

  it('accepts a new valid secondary unit', () => {
    const r = validateUnitForm({ name: 'طرد', rate: '24', units })
    expect(r.valid).toBe(true)
    expect(r.name).toBe('طرد')
  })

  it('rejects a duplicate name (case-insensitive, trimmed)', () => {
    expect(validateUnitForm({ name: 'كرتون', rate: '10', units }).errors.name).toBeTruthy()
    expect(validateUnitForm({ name: '  كرتون ', rate: '10', units }).errors.name).toBeTruthy()
  })

  it('allows keeping the same name when editing that unit (excludeId)', () => {
    const r = validateUnitForm({ name: 'كرتون', rate: '15', units, excludeId: 11 })
    expect(r.valid).toBe(true)
  })

  it('rejects blank and oversized names', () => {
    expect(validateUnitForm({ name: '', rate: '2', units }).errors.name).toBeTruthy()
    expect(validateUnitForm({ name: 'x'.repeat(UNIT_NAME_MAX + 1), rate: '2', units }).errors.name).toBeTruthy()
  })

  it('rejects invalid secondary rates but does not validate main-unit rate', () => {
    expect(validateUnitForm({ name: 'طرد', rate: '0', units }).errors.rate).toBeTruthy()
    expect(validateUnitForm({ name: 'طرد', rate: 'abc', units }).errors.rate).toBeTruthy()
    expect(validateUnitForm({ name: 'حبة', rate: '99', units, excludeId: 10, isMain: true }).valid).toBe(true)
  })
})
