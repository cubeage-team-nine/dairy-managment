import { useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { STORAGE_KEYS } from '../core/constants/app.constants.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN))
  )

  const login = (userData, token) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
