// ═══════════ HTTP Client — طبقة الاتصال الأساسية ═══════════
import { ENV } from '../../config/env'

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// Envelope: { success: true, data, meta } أو { success: false, error: { code, message } }
// withMeta: تُرجع { data, meta } للمسارات المرقمة (السجلات) — القيمة الافتراضية تُرجع data فقط كما هي
export async function request(path, { method = 'GET', body, form, turnstileToken, withMeta = false } = {}) {
  const opts = {
    method,
    credentials: 'include',
    headers: { Accept: 'application/json' },
  }

  if (turnstileToken) {
    opts.headers['cf-turnstile-response'] = turnstileToken
  }

  if (form) {
    if (turnstileToken && form instanceof FormData && !form.has('cf-turnstile-response')) {
      form.append('cf-turnstile-response', turnstileToken)
    }
    opts.body = form // multipart/form-data — المتصفح يضبط Content-Type تلقائياً
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    const payload = turnstileToken
      ? { ...body, 'cf-turnstile-response': turnstileToken }
      : body
    opts.body = JSON.stringify(payload)
  }

  const res = await fetch(ENV.API_BASE_URL + path, opts)
  const data = await res.json().catch(() => ({}))

  if (!res.ok || data.success === false) {
    throw new ApiError(data?.error?.message || `HTTP ${res.status}`, {
      status: res.status,
      code: data?.error?.code,
    })
  }

  return withMeta ? { data: data.data, meta: data.meta } : data.data
}
