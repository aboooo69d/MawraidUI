// @vitest-environment jsdom
// ═══════════ اختبارات فصل الشاشات: مزود فقط + توجيه الجلسة ═══════════
// يستورد App.jsx الذي يستورد كل الشاشات
import { describe, it, expect } from 'vitest'
import { resolveCurrentScreen } from '../App'
import { ROUTES } from '../../shared/constants/routes'

const provider = { role_name: 'provider', name: 'مزود' }
const consumer = { role_name: 'consumer', name: 'مستفيد' }

describe('resolveCurrentScreen — حماية شاشات المخزون', () => {
  it('يسمح للمزود بالوصول لشاشات المخزون', () => {
    for (const s of [
      ROUTES.STOCK_CREATE,
      ROUTES.STOCK_DASHBOARD,
      ROUTES.STOCK_TRANSACTION,
      ROUTES.STOCK_UNITS,
      ROUTES.STOCK_HISTORY,
    ]) {
      expect(resolveCurrentScreen(s, provider)).toBe(s)
    }
  })

  it('يمنع المستفيد من شاشات المخزون → لوحة التحكم', () => {
    expect(resolveCurrentScreen(ROUTES.STOCK_DASHBOARD, consumer)).toBe(ROUTES.DASHBOARD)
    expect(resolveCurrentScreen(ROUTES.STOCK_CREATE, consumer)).toBe(ROUTES.DASHBOARD)
  })

  it('يمنع الزائر من شاشات المخزون → تسجيل الدخول', () => {
    expect(resolveCurrentScreen(ROUTES.STOCK_DASHBOARD, null)).toBe(ROUTES.LOGIN)
    expect(resolveCurrentScreen(ROUTES.STOCK_HISTORY, null)).toBe(ROUTES.LOGIN)
  })

  it('يوجّه المستخدم صاحب الجلسة بعيداً عن شاشات الدخول', () => {
    expect(resolveCurrentScreen(ROUTES.LOGIN, provider)).toBe(ROUTES.DASHBOARD)
    expect(resolveCurrentScreen(ROUTES.REGISTER_CONSUMER, consumer)).toBe(ROUTES.DASHBOARD)
  })

  it('يبقي الزائر على الشاشات العامة', () => {
    expect(resolveCurrentScreen(ROUTES.HOME, null)).toBe(ROUTES.HOME)
    expect(resolveCurrentScreen(ROUTES.LOGIN, null)).toBe(ROUTES.LOGIN)
    expect(resolveCurrentScreen(ROUTES.REGISTER_PROVIDER, null)).toBe(ROUTES.REGISTER_PROVIDER)
  })

  it('يبقي صاحب الجلسة على الرئيسية ولوحة التحكم', () => {
    expect(resolveCurrentScreen(ROUTES.HOME, provider)).toBe(ROUTES.HOME)
    expect(resolveCurrentScreen(ROUTES.DASHBOARD, provider)).toBe(ROUTES.DASHBOARD)
  })
})
