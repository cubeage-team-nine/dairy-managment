import api from '../../core/services/api.js'
import { withMutationToast } from '../../core/services/toastNotifications.js'

export const getFeedTypes = () => api.get('/feed/types')
export const getAdminFeedTypes = () => api.get('/admin/feed-types')
export const createFeedType = (payload) => withMutationToast(api.post('/admin/feed-types', payload), { success: 'Feed type added successfully!', error: 'Failed to add feed type.' })
export const updateFeedType = (id, payload) => api.put(`/admin/feed-types/${id}`, payload)
export const deleteFeedType = (id) => withMutationToast(api.delete(`/admin/feed-types/${id}`), { success: 'Feed type deleted successfully!', error: 'Failed to delete feed type.' })

export const getAdminFeedRecords = () => api.get('/admin/feed/records')
export const createAdminFeedRecord = (payload) => withMutationToast(api.post('/admin/feed/records', payload), { success: 'Feed record added successfully!', error: 'Failed to add feed record.' })
export const updateAdminFeedRecord = (id, payload) => api.put(`/admin/feed/records/${id}`, payload)
export const deleteAdminFeedRecord = (id) => withMutationToast(api.delete(`/admin/feed/records/${id}`), { success: 'Feed record deleted successfully!', error: 'Failed to delete feed record.' })

export const getFeedRecords = (params) => api.get('/feed/records', { params })

export const createFeedRecord = (payload) => withMutationToast(api.post('/feed/records', payload), { success: 'Feed record added successfully!', error: 'Failed to add feed record.' })

export const updateFeedRecord = (id, payload) => api.put(`/feed/records/${id}`, payload)

export const deleteFeedRecord = (id) => withMutationToast(api.delete(`/feed/records/${id}`), { success: 'Feed record deleted successfully!', error: 'Failed to delete feed record.' })
