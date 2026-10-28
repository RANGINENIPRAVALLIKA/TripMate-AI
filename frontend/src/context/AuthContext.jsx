import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
const AuthContext = createContext(null)
const stored = (key) => JSON.parse(localStorage.getItem(key) || 'null')
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => stored('tripmate.user')); const [loading, setLoading] = useState(true)
  const save = (auth) => { localStorage.setItem('tripmate.tokens', JSON.stringify(auth.tokens)); localStorage.setItem('tripmate.user', JSON.stringify(auth.user)); setUser(auth.user); return auth.user }
  useEffect(() => { if (!stored('tripmate.tokens')) { setLoading(false); return } authService.me().then((current) => { localStorage.setItem('tripmate.user', JSON.stringify(current)); setUser(current) }).catch(() => { localStorage.removeItem('tripmate.tokens'); localStorage.removeItem('tripmate.user'); setUser(null) }).finally(() => setLoading(false)) }, [])
  const value = useMemo(() => ({ user, loading, login: async (values) => save(await authService.login(values)), register: async (values) => save(await authService.register(values)), logout: async () => { const token = stored('tripmate.tokens')?.refreshToken; try { if (token) await authService.logout(token) } finally { localStorage.removeItem('tripmate.tokens'); localStorage.removeItem('tripmate.user'); setUser(null) } }, isAdmin: user?.roles?.includes('ADMIN') }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
