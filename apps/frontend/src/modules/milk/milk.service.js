import api from '../../core/services/api.js'
import { withMutationToast } from '../../core/services/toastNotifications.js'

export const getMilkRecords = (params) => api.get('/milk', { params })

export const createMilkRecord = (payload) => withMutationToast(api.post('/milk', payload), { success: 'Milk record added successfully!', error: 'Failed to add milk record.' })

export const updateMilkRecord = (id, payload) => api.put(`/milk/${id}`, payload)

export const deleteMilkRecord = (id) => withMutationToast(api.delete(`/milk/${id}`), { success: 'Milk record deleted successfully!', error: 'Failed to delete milk record.' })
