import api from '../../core/services/api.js'
import { withMutationToast } from '../../core/services/toastNotifications.js'

export const getMastitisRecords = () => api.get('/mastitis')
export const createMastitisRecord = (payload) => withMutationToast(api.post('/mastitis', payload), { success: 'Mastitis record added successfully!', error: 'Failed to add mastitis record.' })
export const updateMastitisRecord = (id, payload) =>
  api.put(`/mastitis/${id}`, payload)
export const deleteMastitisRecord = (id) => withMutationToast(api.delete(`/mastitis/${id}`), { success: 'Mastitis record deleted successfully!', error: 'Failed to delete mastitis record.' })
