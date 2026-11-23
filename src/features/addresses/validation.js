export const ADDRESS_LIMITS = { title: 100, description: 250 }
export const addressTextLength = (value) => [...value.trim()].length

export function isAddressLocation(location) {
  return Number.isFinite(location?.lat) && Math.abs(location.lat) <= 90
    && Number.isFinite(location?.lng) && Math.abs(location.lng) <= 180
}

export function validateAddress({ title, description, location }) {
  const errors = {}
  if (addressTextLength(title) > ADDRESS_LIMITS.title) {
    errors.title = `اسم العنوان يجب ألا يتجاوز ${ADDRESS_LIMITS.title} حرف.`
  }
  if (addressTextLength(description) === 0) {
    errors.description = 'أدخل وصف العنوان.'
  } else if (addressTextLength(description) > ADDRESS_LIMITS.description) {
    errors.description = `وصف العنوان يجب ألا يتجاوز ${ADDRESS_LIMITS.description} حرف.`
  }
  if (!isAddressLocation(location)) {
    errors.location = 'حدد موقعاً على الخريطة ثم أكّده.'
  }
  return errors
}

export const isAddressSessionExpired = (err) => err.status === 401 || err.code === 1106
