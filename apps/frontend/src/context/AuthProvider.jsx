import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { STORAGE_KEYS } from '../core/constants/app.constants.js'
import { getMe, logout as logoutRequest } from '../modules/auth/auth.service.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN))
  )
  const [isInitializing, setIsInitializing] = useState(isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      setIsInitializing(false)
      return
    }

    let ignore = false

    getMe()
      .then(({ data }) => {
        if (!ignore) setUser(data)
      })
      .catch(() => {
        if (!ignore) {
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
          setUser(null)
          setIsAuthenticated(false)
        }
      })
      .finally(() => {
        if (!ignore) setIsInitializing(false)
      })

    return () => {
      ignore = true
    }
    // Only run once on mount — a dev-login/real-login call updates `user` directly via login().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = (userData, token) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } catch {
      // Token may already be invalid/expired (or this was a dev-login session) —
      // local state still needs clearing either way.
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData) => setUser(userData)

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isInitializing, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}
