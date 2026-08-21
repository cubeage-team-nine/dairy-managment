import api from '../../core/services/api.js'

export const getFarmers = (params) => api.get('/farmers', { params })

export const getFarmerById = (id) => api.get(`/farmers/${id}`)

export const createFarmer = (data) => api.post('/farmers', data)

export const updateFarmer = (id, data) => api.patch(`/farmers/${id}`, data)

export const deleteFarmer = (id) => api.delete(`/farmers/${id}`)
