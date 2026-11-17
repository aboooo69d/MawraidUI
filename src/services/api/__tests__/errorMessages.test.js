// ═══════════ اختبارات قاموس رسائل الأخطاء (بما فيها أكواد المخزون) ═══════════
import { describe, it, expect } from 'vitest'
import { ERROR_MESSAGES, getErrorMessage } from '../errorMessages'

describe('ERROR_MESSAGES — أكواد المخزون', () => {
  const expected = {
    1600: 'لا يوجد مخزون مسجل',
    1601: 'الوحدة المختارة لا تنتمي لهذا المخزون',
    1602: 'الكمية المطلوبة غير متوفرة في المخزون',
    1603: 'يجب أن تكون الكمية أكبر من صفر',
    1604: 'نوع المخزون المختار غير موجود',
    1605: 'الوحدة المطلوبة غير موجودة',
    1606: 'يجب تحديد وحدة رئيسية واحدة فقط للمخزون',
    1607: 'معامل الوحدة الرئيسية يجب أن يساوي 1',
    1608: 'توجد وحدة رئيسية بالفعل في هذا المخزون',
    1609: 'يوجد وحدة أخرى بنفس الاسم في هذا المخزون',
    1610: 'لا يمكن تغيير معامل وحدة تم استخدامها في حركات سابقة، يمكنك تعديل الاسم فقط',
    1611: 'لديك مخزون مسجل بالفعل (مسموح بمخزون واحد فقط)',
  }

  for (const [code, message] of Object.entries(expected)) {
    it(`maps code ${code}`, () => {
      expect(ERROR_MESSAGES[Number(code)]).toBe(message)
    })
  }

  it('keeps the existing auth mapping for code 1100 (سلامة شاشة تسجيل الدخول)', () => {
    expect(ERROR_MESSAGES[1100]).toBe('رقم الجوال أو كلمة المرور غير صحيحة')
  })
})

describe('getErrorMessage', () => {
  it('returns the mapped Arabic message for stock codes', () => {
    expect(getErrorMessage({ code: 1602 })).toBe('الكمية المطلوبة غير متوفرة في المخزون')
    expect(getErrorMessage({ code: 1611 })).toContain('مخزون مسجل بالفعل')
  })

  it('returns an Arabic message for network failures (TypeError)', () => {
    expect(getErrorMessage(new TypeError('Failed to fetch'))).toBe(
      'تعذر الاتصال بالخادم — تحقق من الاتصال وحاول مجددًا'
    )
  })

  it('falls back to the server message, then a generic message', () => {
    expect(getErrorMessage({ code: 9999, message: 'server says' })).toBe('server says')
    expect(getErrorMessage(undefined)).toBe('حدث خطأ غير متوقع')
  })
})
