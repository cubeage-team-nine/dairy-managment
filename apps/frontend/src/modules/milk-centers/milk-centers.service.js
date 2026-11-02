// API service for Milk Centers module
// All functions are ready for FastAPI backend integration.
// Replace the placeholder URLs with your actual API endpoints.

import api from '../../core/services/api'

/** Fetch all milk centers */
export const fetchMilkCenters = () => api.get('/admin/milk-centers')

/** Create a new milk center */
export const createMilkCenter = (payload) => api.post('/admin/milk-centers', payload)

/** Update an existing milk center */
export const updateMilkCenter = (id, payload) => api.patch(`/admin/milk-centers/${id}`, payload)

/** Delete a milk center */
export const deleteMilkCenter = (id) => api.delete(`/admin/milk-centers/${id}`)

/** Toggle Active / Inactive status */
export const toggleMilkCenterStatus = (id, status) =>
  api.patch(`/admin/milk-centers/${id}`, { status })
