// @vitest-environment jsdom
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AdminAddressesPage from '../pages/AdminAddressesPage'
import { apiError, HOME, OFFICE, ok, OWNER_ID } from './fixtures'

afterEach(() => vi.unstubAllGlobals())

const click = (name) => fireEvent.click(screen.getByRole('button', { name }))
const fill = (name, value) => fireEvent.change(screen.getByRole('textbox', { name }), { target: { value } })

describe('admin address UI with mocked HTTP', () => {
  it('validates UUIDs and views a user list, a default and an address by ID', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(ok([HOME, OFFICE]))
      .mockResolvedValueOnce(ok(HOME))
      .mockResolvedValueOnce(ok(OFFICE))
    vi.stubGlobal('fetch', fetchMock)
    render(<AdminAddressesPage go={vi.fn()} onSessionExpired={vi.fn()} />)

    fill(/معرّف المستخدم/, 'invalid')
    click('عرض عناوين المستخدم')
    expect(screen.getByRole('alert').textContent).toContain('أدخل معرّف مستخدم صالحاً')
    click('البحث عن عنوان')
    expect(screen.getAllByRole('alert')[1].textContent).toContain('أدخل معرّف عنوان صالحاً')
    expect(fetchMock).not.toHaveBeenCalled()

    fill(/معرّف المستخدم/, ' ' + OWNER_ID + ' ')
    click('عرض عناوين المستخدم')
    const officeTitle = await screen.findByRole('heading', { name: OFFICE.title })
    const officeCard = officeTitle.closest('article')
    expect(within(officeCard).getByText(OWNER_ID)).toBeTruthy()
    expect(screen.getByText('الافتراضي')).toBeTruthy()

    click('عرض الافتراضي')
    const defaultTitle = await screen.findByRole('heading', { name: HOME.title })
    expect(within(defaultTitle.closest('article')).getByText('الافتراضي')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: OFFICE.title })).toBeNull()

    fill(/معرّف العنوان/, OFFICE.id)
    click('البحث عن عنوان')
    expect(await screen.findByRole('heading', { name: OFFICE.title })).toBeTruthy()
    expect(fetchMock.mock.calls.map(([url, opts]) => [url, opts.method])).toEqual([
      ['/api/v1/admin/users/' + OWNER_ID + '/addresses', 'GET'],
      ['/api/v1/admin/users/' + OWNER_ID + '/addresses/default', 'GET'],
      ['/api/v1/admin/addresses/' + OFFICE.id, 'GET'],
    ])
  })

  it('shows an absent default as empty and an unknown address as an error', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(apiError(404, 1700)).mockResolvedValueOnce(apiError(404, 1700))
    vi.stubGlobal('fetch', fetchMock)
    render(<AdminAddressesPage go={vi.fn()} onSessionExpired={vi.fn()} />)

    fill(/معرّف المستخدم/, OWNER_ID)
    click('عرض الافتراضي')
    expect(await screen.findByText('لا يوجد عنوان افتراضي لهذا المستخدم.')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()

    fill(/معرّف العنوان/, OFFICE.id)
    click('البحث عن عنوان')
    expect((await screen.findByRole('alert')).textContent).toContain('العنوان المطلوب غير موجود')
  })

  it('ignores a stale lookup response when a newer lookup has completed', async () => {
    let resolveFirst
    const fetchMock = vi.fn()
      .mockReturnValueOnce(new Promise((resolve) => { resolveFirst = resolve }))
      .mockResolvedValueOnce(ok(OFFICE))
    vi.stubGlobal('fetch', fetchMock)
    render(<AdminAddressesPage go={vi.fn()} onSessionExpired={vi.fn()} />)

    fill(/معرّف المستخدم/, OWNER_ID)
    click('عرض عناوين المستخدم')
    expect(screen.getByRole('status').textContent).toContain('جارٍ تحميل')
    fill(/معرّف العنوان/, OFFICE.id)
    click('البحث عن عنوان')
    expect(await screen.findByRole('heading', { name: OFFICE.title })).toBeTruthy()
    await act(async () => resolveFirst(ok([HOME])))
    expect(screen.queryByRole('heading', { name: HOME.title })).toBeNull()
  })
})
