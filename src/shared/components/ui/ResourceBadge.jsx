import { Icons } from '../icons'

export function ResourceBadge({ type }) {
  const map = {
    gas: { label: 'غاز منزلي', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: Icons.Gas },
    water: { label: 'مياه ووايتات', color: 'bg-sky-50 text-sky-800 border-sky-200', icon: Icons.Water },
    fuel: { label: 'مشتقات نفطية', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Icons.Fuel },
  }
  const item = map[type] || map.gas
  const Icon = item.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${item.color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{item.label}</span>
    </span>
  )
}
