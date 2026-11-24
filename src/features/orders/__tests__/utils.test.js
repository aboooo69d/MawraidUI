// ═══════════ اختبارات أدوات والتحقق من طلبات المستفيد ═══════════
import { describe, it, expect } from 'vitest'
import {
  getEnabledConsumerTypes,
  getOrderStatusMeta,
  getPaymentStatusMeta,
  getUnitAvailableAmount,
  validateCancelReason,
  validateCreateOrder,
} from '../utils'

describe('orders utils — التحقق وحساب الرصيد وصفات المستفيد', () => {
  it('يحسب الكمية المتوفرة للوحدة من balances أو من available / rate', () => {
    const stockWithBalances = {
      available: 85,
      balances: [{ unit_id: 2, amount: 17 }],
    }
    expect(getUnitAvailableAmount(stockWithBalances, { id: 2, rate: 5 })).toBe(17)

    const stockWithoutBalances = { available: 85, balances: [] }
    expect(getUnitAvailableAmount(stockWithoutBalances, { id: 2, rate: 5 })).toBe(17)
    expect(getUnitAvailableAmount(stockWithoutBalances, { id: 1, rate: 1 })).toBe(85)
  })

  it('يستخرج صفات المستفيد المفعّلة إن وُجدت ويعيد الكل افتراضياً', () => {
    expect(getEnabledConsumerTypes({ role_name: 'consumer' })).toEqual(['home', 'business', 'driver'])
    expect(
      getEnabledConsumerTypes({
        role_name: 'consumer',
        is_home: true,
        is_business: false,
        is_driver: true,
      })
    ).toEqual(['home', 'driver'])
  })

  it('يتحقق من مدخلات إنشاء الطلب بشكل سليم', () => {
    expect(
      validateCreateOrder({
        stockId: 'e4226f8b-f41e-42ef-8ba0-04470295cb45',
        unitId: 1,
        quantity: 2,
        maxAvailable: 10,
        addressId: 'addr-1',
        consumerType: 'home',
        notes: 'ملاحظة قصيرة',
      })
    ).toBeNull()

    expect(
      validateCreateOrder({
        stockId: 's1',
        unitId: 1,
        quantity: 0,
        maxAvailable: 10,
        addressId: 'addr-1',
        consumerType: 'home',
      })
    ).toMatchObject({ code: 1603 })

    expect(
      validateCreateOrder({
        stockId: 's1',
        unitId: 1,
        quantity: 15,
        maxAvailable: 10,
        addressId: 'addr-1',
        consumerType: 'home',
      })
    ).toMatchObject({ code: 1602 })

    expect(
      validateCreateOrder({
        stockId: 's1',
        unitId: 1,
        quantity: 1,
        maxAvailable: 10,
        addressId: '',
        consumerType: 'home',
      })
    ).toMatchObject({ code: 2000 })
  })

  it('يتحقق من طول سبب الإلغاء وحالات الطلب والدفع', () => {
    expect(validateCancelReason('تم الطلب بالخطأ')).toBeNull()
    expect(validateCancelReason('أ'.repeat(501))).toMatchObject({ code: 2000 })
    expect(getOrderStatusMeta('pending').label).toBe('قيد الانتظار')
    expect(getOrderStatusMeta('cancelled').label).toBe('ملغي')
    expect(getPaymentStatusMeta('unpaid').label).toBe('غير مدفوع')
  })
})
