import { createContext, useContext, useEffect, useState } from 'react'
import { api, setAccessToken } from '../api/client.js'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(() => !!token)
  const navigate = useNavigate()

  useEffect(() => {
    // If a token exists (from SSR-safe lazy init), set it on the client and fetch current user
    if (token) {
      setAccessToken(token)
      api
        .get('/me')
        .then((data) => setUser(data))
        .catch(() => {
          setAccessToken(null)
          try { window.localStorage.removeItem('accessToken') } catch { void 0 }
          setUser(null)
        })
        .finally(() => setLoading(false))
    }
  }, [token])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    setAccessToken(res.accessToken)
    setToken(res.accessToken)
    window.localStorage.setItem('accessToken', res.accessToken)
    setUser(res.user)
  }

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    setAccessToken(res.accessToken)
    setToken(res.accessToken)
    window.localStorage.setItem('accessToken', res.accessToken)
    setUser(res.user)
  }

  const logout = () => {
    // Tell server to clear refresh token and cookie
    try {
      void api.postWithCredentials('/auth/logout', {})
    } catch { void 0 }
    setAccessToken(null)
    setToken(null)
    window.localStorage.removeItem('accessToken')
    setUser(null)
  }

  // UX: show session expired modal when sessionExpired flag is set
  const [sessionExpired, setSessionExpired] = useState(() => {
    try { return typeof window !== 'undefined' && !!window.localStorage.getItem('sessionExpired') } catch { return false }
  })

  const acknowledgeSessionExpired = () => {
    try { window.localStorage.removeItem('sessionExpired') } catch { void 0 }
    setSessionExpired(false)
    logout()
    // navigate to login
    try { navigate('/login') } catch { window.location.replace('/login') }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    accessToken: token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {sessionExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 text-slate-900">
            <h3 className="mb-2 text-lg font-semibold">Session expired</h3>
            <p className="mb-4 text-sm">Your session has expired. Please log in again.</p>
            <div className="flex justify-end">
              <button onClick={acknowledgeSessionExpired} className="ml-2 rounded bg-sky-500 px-3 py-1 text-white">OK</button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}