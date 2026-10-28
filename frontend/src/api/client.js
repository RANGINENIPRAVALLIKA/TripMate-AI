import axios from 'axios'
const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api', headers: { 'Content-Type': 'application/json' } })
const getTokens = () => JSON.parse(localStorage.getItem('tripmate.tokens') || 'null')
client.interceptors.request.use((config) => { const token = getTokens()?.accessToken; if (token) config.headers.Authorization = `Bearer ${token}`; return config })
let refreshing = null
client.interceptors.response.use((response) => response, async (error) => {
  const request = error.config
  if (error.response?.status !== 401 || request?._retried || request?.url?.includes('/auth/refresh')) return Promise.reject(error)
  const refreshToken = getTokens()?.refreshToken
  if (!refreshToken) return Promise.reject(error)
  request._retried = true
  try {
    refreshing ||= client.post('/auth/refresh', { refreshToken }).then(({ data }) => { localStorage.setItem('tripmate.tokens', JSON.stringify(data.data.tokens)); return data.data.tokens }).finally(() => { refreshing = null })
    const tokens = await refreshing; request.headers.Authorization = `Bearer ${tokens.accessToken}`; return client(request)
  } catch (refreshError) { localStorage.removeItem('tripmate.tokens'); localStorage.removeItem('tripmate.user'); window.location.assign('/login'); return Promise.reject(refreshError) }
})
export const apiData = async (request) => (await request).data.data
export const apiFieldErrors = (error) => {
  const data = error?.response?.data?.data
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {}
}
export const apiError = (error, context = 'general') => {
  if (!error?.response) return 'Unable to connect to TripMate AI. Please try again.'
  const status = error.response.status
  const message = error.response.data?.message
  if (context === 'login' && status === 401) return 'Invalid email or password.'
  if (context === 'register' && message === 'Email is already registered') return 'This email is already registered. Please log in instead.'
  if (status === 401) return 'Your session has expired. Please log in again.'
  if (status === 403) return "You don't have permission to do that."
  if (status >= 500 || message === 'An unexpected error occurred') return 'Something went wrong on our side. Please try again.'
  return message || 'Something went wrong. Please try again.'
}
export default client
