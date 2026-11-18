import api from '../../core/services/api.js'
import { withMutationToast } from '../../core/services/toastNotifications.js'

export const getAnimals = () => api.get('/animals')

export const createAnimal = (payload) => withMutationToast(api.post('/animals', payload), { success: 'Animal added successfully!', error: 'Failed to add animal.' })

export const updateAnimal = (id, payload) => api.put(`/animals/${id}`, payload)

export const deleteAnimal = (id) => withMutationToast(api.delete(`/animals/${id}`), { success: 'Animal removed successfully!', error: 'Failed to remove animal.' })

export const getAdminAnimals = () => api.get('/admin/animals')

export const getAdminAnimalOptions = () => api.get('/admin/animals/options')

export const createAdminAnimal = (payload) => withMutationToast(api.post('/admin/animals', payload), { success: 'Animal added successfully!', error: 'Failed to add animal.' })

export const updateAdminAnimal = (id, payload) => api.put(`/admin/animals/${id}`, payload)

export const deleteAdminAnimal = (id) => withMutationToast(api.delete(`/admin/animals/${id}`), { success: 'Animal removed successfully!', error: 'Failed to remove animal.' })
