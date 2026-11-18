import api from '../../core/services/api.js'
import { withMutationToast } from '../../core/services/toastNotifications.js'

// ── Farmer-scoped endpoints ───────────────────────────────────────────────
export const getFarms = () => api.get('/farms')

export const createFarm = (farm) => withMutationToast(api.post('/farms', farm), { success: 'Farm added successfully!', error: 'Failed to add farm.' })

export const updateFarm = (farmId, farm) => api.put(`/farms/${farmId}`, farm)

export const getFarmPhotos = (farmId) => api.get(`/farms/${farmId}/photos`)

export const uploadFarmPhotos = (farmId, files, onUploadProgress) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return withMutationToast(api.post(`/farms/${farmId}/photos`, formData, { onUploadProgress }), { success: 'Farm photos added successfully!', error: 'Failed to upload farm photos.' })
}

export const getFarmPhotoContent = (contentUrl) =>
  api.get(contentUrl, { responseType: 'blob' })

export const deleteFarmPhoto = (farmId, photoId) =>
  withMutationToast(api.delete(`/farms/${farmId}/photos/${photoId}`), { success: 'Farm photo deleted successfully!', error: 'Failed to delete farm photo.' })

// ── Admin endpoints ───────────────────────────────────────────────────────
export const getAdminFarms = (params) => api.get('/admin/farms', { params })
