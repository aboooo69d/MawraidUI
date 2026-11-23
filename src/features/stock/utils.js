// ═══════════ أدوات مساعدة لميزة المخزون ═══════════

// انتهاء الجلسة: 401 Unauthorized أو كود التطبيق 1106
export const isSessionExpired = (err) => err?.status === 401 || err?.code === 1106

// 1600 هو خطأ Nova لغياب المخزون
export const isStockMissing = (err) => err?.status === 404 && err?.code === 1600

// التحقق من نوع مخزون الغاز (gaz)
export const isGazStockType = (slug) =>
  typeof slug === 'string' && slug.trim().toLowerCase() === 'gaz'

export const GAZ_STOCK_TYPE_LABELS = {
  exchange: 'استبدال أسطوانات',
  refill: 'تعبئة فورية',
}

export function formatGazStockType(val) {
  if (!val) return null
  return GAZ_STOCK_TYPE_LABELS[String(val).trim().toLowerCase()] || String(val)
}

// تنسيق تاريخ/وقت عربي بأرقام لاتينية (مع رجوع آمن للنص الأصلي)
export function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('ar-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

// تنسيق الأرقام للعرض (بدون فواصل زائدة)
export function formatAmount(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('en-US')
}
