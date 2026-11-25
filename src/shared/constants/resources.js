const RESOURCE_THEME_BY_SLUG = new Map([
  ['gaz', 'gas'],
  ['gas', 'gas'],
  ['water', 'water'],
  ['fuel', 'fuel'],
])

export function getResourceTheme(slug) {
  return RESOURCE_THEME_BY_SLUG.get(String(slug ?? '').trim().toLowerCase())
}
