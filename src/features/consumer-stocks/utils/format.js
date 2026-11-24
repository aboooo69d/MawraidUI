// ═══════════ أدوات تنسيق محلية لميزة استكشاف المخزون ═══════════

const GAZ_STOCK_TYPE_LABELS = {
  exchange: 'استبدال أسطوانات',
  refill: 'تعبئة فورية',
}

export function formatGazStockType(val) {
  if (!val) return null
  return GAZ_STOCK_TYPE_LABELS[String(val).trim().toLowerCase()] || String(val)
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('ar-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export function formatAmount(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('en-US')
}

export function formatPrice(p) {
  if (p === null || p === undefined || Number.isNaN(Number(p))) return '—'
  return Number(p).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
