export const OWNER_ID = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
export const HOME = {
  id: '7f9c8942-882f-410a-b286-6ebfb3d855eb',
  user_id: OWNER_ID,
  title: 'المنزل',
  description: 'تعز، شارع جمال، المبنى ٨',
  location: { lat: 13.5795, lng: 44.0209 },
  is_default: true,
  created_at: '2026-11-23T12:00:00Z',
  updated_at: '2026-11-23T12:00:00Z',
}
export const OFFICE = {
  ...HOME,
  id: 'c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c',
  title: 'العمل',
  description: 'شارع جمال، المبنى ٩',
  location: { lat: 13.5811, lng: 44.0152 },
  is_default: false,
}

export const ok = (data) => Response.json({ success: true, data })
export const apiError = (status, code) =>
  Response.json({ success: false, error: { code, message: 'Nova test error' } }, { status })
