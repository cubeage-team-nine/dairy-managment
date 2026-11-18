import api from '../../core/services/api.js'
import { withMutationToast } from '../../core/services/toastNotifications.js'

export const getPans = (farmId) => api.get('/pans', { params: farmId ? { farm_id: farmId } : {} })

export const createPan = (payload) => withMutationToast(api.post('/pans', payload), { success: 'Pen added successfully!', error: 'Failed to add pen.' })

export const updatePan = (id, payload) => api.put(`/pans/${id}`, payload)

export const deletePan = (id) => withMutationToast(api.delete(`/pans/${id}`), { success: 'Pen removed successfully!', error: 'Failed to remove pen.' })
