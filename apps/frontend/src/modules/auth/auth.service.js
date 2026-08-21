import api from '../../core/services/api.js'

export const login = (credentials) => api.post('/auth/login', credentials)

export const logout = () => api.post('/auth/logout')
