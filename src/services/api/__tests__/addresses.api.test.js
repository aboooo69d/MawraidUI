import { afterEach, describe, expect, it, vi } from 'vitest'
import { addressesApi } from '../modules/addresses.api'
import { apiError, HOME, OFFICE, ok, OWNER_ID } from '../../../features/addresses/__tests__/fixtures'

afterEach(() => vi.unstubAllGlobals())

describe('Nova Address API with mocked fetch', () => {
  it.each([
    ['listMine', undefined, '/addresses/me', [HOME, OFFICE]],
    ['getMyDefault', undefined, '/addresses/me/default', HOME],
    ['getMineById', OFFICE.id, '/addresses/me/' + OFFICE.id, OFFICE],
    ['listForUser', OWNER_ID, '/admin/users/' + OWNER_ID + '/addresses', [HOME, OFFICE]],
    ['getDefaultForUser', OWNER_ID, '/admin/users/' + OWNER_ID + '/addresses/default', HOME],
    ['getAdminById', OFFICE.id, '/admin/addresses/' + OFFICE.id, OFFICE],
  ])('calls %s with the documented path and includes the session cookie', async (operation, id, path, data) => {
    const fetchMock = vi.fn().mockResolvedValue(ok(data))
    vi.stubGlobal('fetch', fetchMock)

    await expect(addressesApi[operation](id)).resolves.toEqual(data)
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/v1' + path, expect.objectContaining({
      method: 'GET',
      credentials: 'include',
    }))
  })

  it('posts the address payload and returns the server-selected default flag', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok(HOME))
    vi.stubGlobal('fetch', fetchMock)
    const payload = { title: HOME.title, description: HOME.description, location: HOME.location, is_default: false }

    await expect(addressesApi.create(payload)).resolves.toEqual(HOME)
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/v1/addresses/me', {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  })

  it('recognizes the documented empty list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok([])))
    await expect(addressesApi.listMine()).resolves.toEqual([])
  })

  it('distinguishes a missing default from a missing address detail', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => apiError(404, 1700)))
    await expect(addressesApi.getMyDefault()).resolves.toBeNull()
    await expect(addressesApi.getDefaultForUser(OWNER_ID)).resolves.toBeNull()
    await expect(addressesApi.getMineById(HOME.id)).rejects.toMatchObject({ status: 404, code: 1700 })
    await expect(addressesApi.getAdminById(HOME.id)).rejects.toMatchObject({ status: 404, code: 1700 })
  })

  it.each([[400, 2000], [401, 1106], [403, 1107], [500, 5000]])('preserves HTTP %i and Nova error %i', async (status, code) => {
    vi.stubGlobal('fetch', vi.fn(async () => apiError(status, code)))
    await expect(addressesApi.getDefaultForUser(OWNER_ID)).rejects.toMatchObject({ status, code })
    await expect(addressesApi.create({})).rejects.toMatchObject({ status, code })
  })

  it('treats an invalid success payload as an error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ success: true })))
    await expect(addressesApi.listMine()).rejects.toThrow('تعذر قراءة بيانات العناوين')
    await expect(addressesApi.create({})).rejects.toThrow('تعذر قراءة بيانات العناوين')
  })
})
