import api from '../../core/services/api.js'
import { withMutationToast } from '../../core/services/toastNotifications.js'

export const getBreedingRecords = () => api.get('/breeding')
export const createBreedingRecord = (payload) => withMutationToast(api.post('/breeding', payload), { success: 'Breeding record added successfully!', error: 'Failed to add breeding record.' })
export const updateBreedingRecord = (id, payload) =>
  api.put(`/breeding/${id}`, payload)
export const deleteBreedingRecord = (id) => withMutationToast(api.delete(`/breeding/${id}`), { success: 'Breeding record deleted successfully!', error: 'Failed to delete breeding record.' })
