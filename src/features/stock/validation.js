// ═══════════ قواعد التحقق في واجهة المخزون (Client-side Validation) ═══════════
// قواعد تعدد المخازن: عنوان (10-200 حرف)، إحداثيات (-90..90 / -180..180)،
// تفاصيل الغاز (exchange / refill) عند slug === "gaz"،
// وحدة رئيسية واحدة rate=1، وحدات فرعية rate صحيح ≥1، أسماء فريدة ≤50 حرفاً.
import { isGazStockType } from './utils'

export const UNIT_NAME_MAX = 50
export const DESC_MAX = 1000
export const ADDRESS_MIN = 10
export const ADDRESS_MAX = 200
export const GAZ_STOCK_TYPES = ['exchange', 'refill']

const clean = (s) => (s ?? '').toString().trim()

// عدد صحيح موجب (يقبل النصوص الرقمية من حقول الإدخال)
export function isPositiveInt(v) {
  const n = Number(v)
  return Number.isInteger(n) && n > 0
}

// التحقق من صحة الإحداثيات الجغرافية (يسمح بالقيمة 0 ويرفض الفراغ أو خارج النطاق)
export function isValidLocation(lat, lng) {
  const latStr = clean(lat)
  const lngStr = clean(lng)
  if (!latStr || !lngStr) return false
  const latNum = Number(latStr)
  const lngNum = Number(lngStr)
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return false
  return latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180
}

// التحقق من نموذج إنشاء مخزون جديد
// يُرجع: { valid, typeError, addressError, locationError, gazTypeError, formError, rowErrors }
export function validateCreateForm({
  selectedType,
  address = '',
  lat = '',
  lng = '',
  locationPending = false,
  gazStockType = '',
  units = [],
} = {}) {
  const rowErrors = new Array(units.length).fill(null)
  let typeError = null
  let addressError = null
  let locationError = null
  let gazTypeError = null
  let formError = null

  if (!selectedType?.id || !clean(selectedType?.slug)) {
    typeError = 'يرجى اختيار نوع المخزون'
  }

  const trimmedAddress = clean(address)
  const addressLength = Array.from(trimmedAddress).length
  if (!trimmedAddress) {
    addressError = 'يرجى إدخال عنوان المخزون'
  } else if (addressLength < ADDRESS_MIN || addressLength > ADDRESS_MAX) {
    addressError = `العنوان يجب أن يكون بين ${ADDRESS_MIN} و${ADDRESS_MAX} حرف`
  }

  if (locationPending) {
    locationError = 'يرجى تأكيد موقع المحطة على الخريطة أو إلغاء التغيير قبل الحفظ'
  } else if (!isValidLocation(lat, lng)) {
    locationError = 'يرجى تحديد إحداثيات الموقع بشكل صحيح (خط العرض -90 إلى 90، خط الطول -180 إلى 180)'
  }

  if (isGazStockType(selectedType?.slug)) {
    const normalizedGazType = clean(gazStockType).toLowerCase()
    if (!GAZ_STOCK_TYPES.includes(normalizedGazType)) {
      gazTypeError = 'يرجى اختيار نوع مخزون الغاز (استبدال أو تعبئة)'
    }
  }

  if (!units.length) {
    formError = 'يجب إضافة وحدة واحدة على الأقل'
  } else {
    const mainCount = units.filter((u) => u.is_main).length
    if (mainCount !== 1) formError = 'يجب أن توجد وحدة رئيسية واحدة فقط للمخزون'

    const seen = new Set()
    units.forEach((u, i) => {
      const name = clean(u.name)
      if (!name) {
        rowErrors[i] = 'اسم الوحدة مطلوب'
        return
      }
      if (name.length > UNIT_NAME_MAX) {
        rowErrors[i] = `اسم الوحدة لا يتجاوز ${UNIT_NAME_MAX} حرفاً`
        return
      }
      const key = name.toLowerCase()
      if (seen.has(key)) {
        rowErrors[i] = 'اسم الوحدة مكرر — يجب أن تكون الأسماء فريدة'
        return
      }
      seen.add(key)

      if (u.is_main) {
        if (Number(u.rate) !== 1) rowErrors[i] = 'معامل الوحدة الرئيسية يجب أن يساوي 1'
      } else if (!isPositiveInt(u.rate)) {
        rowErrors[i] = 'معامل الوحدة يجب أن يكون عدداً صحيحاً 1 على الأقل'
      }
    })
  }

  const valid =
    !typeError &&
    !addressError &&
    !locationError &&
    !gazTypeError &&
    !formError &&
    rowErrors.every((e) => !e)

  return {
    valid,
    typeError,
    addressError,
    locationError,
    gazTypeError,
    formError,
    rowErrors,
  }
}

// التحقق من نموذج حركة مخزنية (وارد/منصرف)
// يُرجع: { valid, errors: { unit?, amount?, description? } }
export function validateTransaction({ amount, unitId, description = '', units = [] }) {
  const errors = {}

  if (!unitId) {
    errors.unit = 'يرجى اختيار الوحدة'
  } else if (!units.some((u) => String(u.id) === String(unitId))) {
    errors.unit = 'الوحدة المختارة لا تنتمي لهذا المخزون'
  }

  if (!isPositiveInt(amount)) errors.amount = 'يجب أن تكون الكمية أكبر من صفر (عدد صحيح)'

  if (clean(description).length > DESC_MAX) {
    errors.description = `الوصف لا يتجاوز ${DESC_MAX} حرفاً`
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// التحقق من وحدة عند الإضافة أو التعديل
// isMain=true: المعامل ثابت 1 ولا يُعدَّل. excludeId: تجاهل الوحدة الحالية عند التحقق من التكرار.
// يُرجع: { valid, errors: { name?, rate? } }
export function validateUnitForm({ name, rate, units = [], excludeId = null, isMain = false }) {
  const errors = {}
  const n = clean(name)

  if (!n) errors.name = 'اسم الوحدة مطلوب'
  else if (n.length > UNIT_NAME_MAX) errors.name = `اسم الوحدة لا يتجاوز ${UNIT_NAME_MAX} حرفاً`
  else if (units.some((u) => u.id !== excludeId && clean(u.name).toLowerCase() === n.toLowerCase())) {
    errors.name = 'يوجد وحدة أخرى بنفس الاسم في هذا المخزون'
  }

  if (!isMain && !isPositiveInt(rate)) {
    errors.rate = 'معامل الوحدة يجب أن يكون عدداً صحيحاً 1 على الأقل'
  }

  return { valid: Object.keys(errors).length === 0, errors, name: n }
}
