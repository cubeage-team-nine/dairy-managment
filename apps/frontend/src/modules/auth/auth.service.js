import api from '../../core/services/api.js'

export const signup = (payload) => api.post('/auth/signup', payload)

export const login = (credentials) => api.post('/auth/login', credentials)

export const logout = () => api.post('/auth/logout')

export const getMe = () => api.get('/auth/me')

export const updateProfile = (payload) => api.patch('/auth/me', payload)

export const changePassword = (payload) => api.post('/auth/change-password', payload)
