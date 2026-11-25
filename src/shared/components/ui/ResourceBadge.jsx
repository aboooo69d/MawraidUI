import { Icons } from '../icons'
import { getResourceTheme } from '../../constants/resources'

const resources = {
  gas: { label: 'غاز منزلي', icon: Icons.Gas },
  water: { label: 'مياه ووايتات', icon: Icons.Water },
  fuel: { label: 'مشتقات نفطية', icon: Icons.Fuel },
}

export function ResourceBadge({ type }) {
  const resource = getResourceTheme(type) || 'gas'
  const { label, icon: Icon } = resources[resource]
  return (
    <span data-resource={resource} className="mw-resource inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold">
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
