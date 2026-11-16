// ═══════════ طبقة الاتصال بالباك إند — Nova Auth API ═══════════
// Base URL: /api/v1/auth (Vite يوجهها إلى http://localhost:8080 في التطوير)
const BASE = 'http://localhost:5173/api/v1'

// Envelope:  { success:true, data } أو { success:false, error:{ code, message } }
async function request(path, { method = 'GET', body, form, turnstileToken } = {}) {
  const opts = { method, credentials: 'include', headers: { Accept: 'application/json' } }
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
  const res = await fetch(BASE + path, opts)
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) {
    const err = new Error(data?.error?.message || `HTTP ${res.status}`)
    err.status = res.status
    err.code = data?.error?.code
    throw err
  }
  return data.data
}

export const authApi = {
  login: (phone, password, turnstileToken) =>
    request('/auth/login', { method: 'POST', body: { phone, password }, turnstileToken }),
  registerConsumer: (formData, turnstileToken) =>
    request('/auth/register/consumer', { method: 'POST', form: formData, turnstileToken }),
  registerProvider: (payload, turnstileToken) =>
    request('/auth/register/provider', { method: 'POST', body: payload, turnstileToken }),
  verifyPhone: (phone, code) =>
    request('/auth/verify-phone', { method: 'POST', body: { phone, code } }),
  resendOtp: (phone) =>
    request('/auth/resend-otp', { method: 'POST', body: { phone } }),
  logout: () =>
    request('/auth/logout', { method: 'POST', body: {} }),
  forgetPassword: (phone, turnstileToken) =>
    request('/auth/forget-password', { method: 'POST', body: { phone }, turnstileToken }),
  resetPassword: (rest_key, password) =>
    request('/auth/reset-password', { method: 'POST', body: { rest_key, password } }),
}

// regex رقم الجوال اليمني من التوثيق
export const PHONE_RE = /^7[01378]\d{7}$/

// رسائل عربية لأكواد الأخطاء من Error Codes Dictionary
export const ERROR_MESSAGES = {
  2000: 'تحقق من الحقول المدخلة',
  1000: 'المستخدم غير موجود',
  1001: 'رقم الجوال مسجل مسبقاً — سجّل الدخول',
  1002: 'الحساب غير موجود',
  1100: 'رقم الجوال أو كلمة المرور غير صحيحة',
  1101: 'الحساب غير نشط',
  1102: 'الحساب غير موثّق — أكّد رقم الجوال',
  1103: 'الحساب موثّق مسبقاً',
  1104: 'رمز الاستعادة غير صحيح أو منتهي الصلاحية',
  1201: 'انتظر 60 ثانية قبل طلب رمز جديد',
  1202: 'بلغت الحد اليومي لطلبات الرمز (5 طلبات)',
  1203: 'بعد 3 محاولات خاطئة — اطلب رمزاً جديداً',
  1204: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
  1400: 'الملف أكبر من 5MB',
  1401: 'نوع الملف غير مسموح',
  1402: 'الملف فارغ',
  1500: 'الحساب قيد مراجعة الإدارة',
  1403: 'المستندات قيد المراجعة أو الحساب مرفوض',
  1502: 'الحساب موقوف',
  5000: 'خطأ في الخادم — حاول لاحقاً',
}
export const errMsg = (err) => ERROR_MESSAGES[err.code] || err.message
