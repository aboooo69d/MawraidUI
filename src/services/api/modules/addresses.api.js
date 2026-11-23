import { request } from '../client'

const ME = '/addresses/me'
const userAddresses = (userId) => `/admin/users/${encodeURIComponent(userId)}/addresses`

const invalidResponse = () => new Error('تعذر قراءة بيانات العناوين من الخادم. أعد المحاولة.')

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

export const addressesApi = {
  listMine: () => listAddresses(ME),
  create: (body) => readAddress(ME, { method: 'POST', body }),
  getMyDefault: () => getDefault(`${ME}/default`),
  getMineById: (addressId) => readAddress(`${ME}/${encodeURIComponent(addressId)}`),
  listForUser: (userId) => listAddresses(userAddresses(userId)),
  getDefaultForUser: (userId) => getDefault(`${userAddresses(userId)}/default`),
  getAdminById: (addressId) => readAddress(`/admin/addresses/${encodeURIComponent(addressId)}`),
}
