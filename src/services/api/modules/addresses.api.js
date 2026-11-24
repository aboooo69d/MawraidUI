import { request } from '../client'

const ME = '/addresses/me'
const userAddresses = (userId) => `/admin/users/${encodeURIComponent(userId)}/addresses`
const DEFAULT_ADDRESS_STORAGE_KEY = 'mawarid:default_address_cache'

const invalidResponse = () => new Error('تعذر قراءة بيانات العناوين من الخادم. أعد المحاولة.')

let defaultAddressCache = {
  loaded: false,
  value: null,
}
let defaultAddressInFlight = null

function readStoredDefaultAddress() {
  try {
    if (typeof sessionStorage === 'undefined') return null
    const raw = sessionStorage.getItem(DEFAULT_ADDRESS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'loaded' in parsed) {
      return { loaded: Boolean(parsed.loaded), value: parsed.value ?? null }
    }
  } catch {
    // تجاهل أخطاء التخزين المؤقت في بيئات التصفح المقيدة
  }
  return null
}

function writeStoredDefaultAddress(entry) {
  try {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.setItem(DEFAULT_ADDRESS_STORAGE_KEY, JSON.stringify(entry))
  } catch {
    // تجاهل أخطاء التخزين المؤقت
  }
}

function setCachedMyDefault(address) {
  defaultAddressCache = { loaded: true, value: address ?? null }
  writeStoredDefaultAddress(defaultAddressCache)
}

function clearDefaultAddressCache() {
  defaultAddressCache = { loaded: false, value: null }
  defaultAddressInFlight = null
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(DEFAULT_ADDRESS_STORAGE_KEY)
    }
  } catch {
    // تجاهل أخطاء التخزين المؤقت
  }
}

async function listAddresses(path) {
  const addresses = await request(path)
  if (!Array.isArray(addresses)) throw invalidResponse()
  return addresses
}

async function readAddress(path, options) {
  const address = await request(path, options)
  if (typeof address?.id !== 'string' || !address.location) throw invalidResponse()
  return address
}

async function getDefault(path) {
  try {
    return await readAddress(path)
  } catch (err) {
    if (err.status === 404 && err.code === 1700) return null
    throw err
  }
}

async function fetchMyDefaultAndCache() {
  const address = await getDefault(`${ME}/default`)
  setCachedMyDefault(address)
  return address
}

async function getMyDefaultCached({ force = false } = {}) {
  if (!force) {
    if (defaultAddressCache.loaded) return defaultAddressCache.value
    const stored = readStoredDefaultAddress()
    if (stored?.loaded) {
      defaultAddressCache = stored
      return stored.value
    }
    if (defaultAddressInFlight) return defaultAddressInFlight
  }

  const req = fetchMyDefaultAndCache().finally(() => {
    if (defaultAddressInFlight === req) defaultAddressInFlight = null
  })
  defaultAddressInFlight = req
  return req
}

export const addressesApi = {
  listMine: () => listAddresses(ME),
  create: async (body) => {
    const address = await readAddress(ME, { method: 'POST', body })
    if (address.is_default) setCachedMyDefault(address)
    return address
  },
  getMyDefault: () => fetchMyDefaultAndCache(),
  getMyDefaultCached,
  setCachedMyDefault,
  clearDefaultAddressCache,
  getMineById: (addressId) => readAddress(`${ME}/${encodeURIComponent(addressId)}`),
  listForUser: (userId) => listAddresses(userAddresses(userId)),
  getDefaultForUser: (userId) => getDefault(`${userAddresses(userId)}/default`),
  getAdminById: (addressId) => readAddress(`/admin/addresses/${encodeURIComponent(addressId)}`),
}
