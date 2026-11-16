// ═══════════ Auth API Endpoints ═══════════
import { request } from '../client'

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
