// API service for Milk Centers module
// All functions are ready for FastAPI backend integration.
// Replace the placeholder URLs with your actual API endpoints.

import api from '../../core/services/api'
import { withMutationToast } from '../../core/services/toastNotifications.js'

/** Fetch all milk centers */
export const fetchMilkCenters = () => api.get('/admin/milk-centers')

/** Create a new milk center */
export const createMilkCenter = (payload) => withMutationToast(api.post('/admin/milk-centers', payload), { success: 'Milk center added successfully!', error: 'Failed to add milk center.' })

/** Update an existing milk center */
export const updateMilkCenter = (id, payload) => api.patch(`/admin/milk-centers/${id}`, payload)

/** Delete a milk center */
export const deleteMilkCenter = (id) => withMutationToast(api.delete(`/admin/milk-centers/${id}`), { success: 'Milk center deleted successfully!', error: 'Failed to delete milk center.' })

/** Toggle Active / Inactive status */
export const toggleMilkCenterStatus = (id, status) =>
  api.patch(`/admin/milk-centers/${id}`, { status })
