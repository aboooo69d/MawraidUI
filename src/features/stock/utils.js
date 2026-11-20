// ═══════════ أدوات مساعدة لميزة المخزون ═══════════

// انتهاء الجلسة: 401 Unauthorized أو كود التطبيق 1100
export const isSessionExpired = (err) => err?.status === 401 || err?.code === 1100

// غياب المخزون: كود 1600، أو 404 بدون كود تطبيق (رد غير مغلّف) — لا نعامل أي 404 كغياب مخزون
export const isStockMissing = (err) => err?.code === 1600 || (err?.status === 404 && err?.code == null)

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
