import api from '../../core/services/api.js'

import { withMutationToast } from '../../core/services/toastNotifications.js'

// ── Admin Doctor Management ───────────────────────────────────────────────
export const getAdminDoctors = (params) => api.get('/admin/doctors', { params })
export const approveDoctor   = (doctorId) => api.patch(`/admin/doctors/${doctorId}/approve`)
export const rejectDoctor    = (doctorId) => api.patch(`/admin/doctors/${doctorId}/reject`)

// ── Doctor own profile ────────────────────────────────────────────────────
export const getMyDoctorProfile    = ()       => api.get('/doctors/me')
export const updateMyDoctorProfile = (data)   => api.patch('/doctors/me', data)
export const updateMyDoctorAvailability = (isAvailable) => api.patch('/doctors/me/availability', { is_available: isAvailable })
export const uploadMyDoctorPhoto = (file) => {
  const body = new FormData()
  body.append('photo', file)
  return withMutationToast(api.post('/doctors/me/photo', body), { success: 'Profile photo added successfully!', error: 'Failed to upload profile photo.' })
}
export const getMyDoctorPhoto = () => api.get('/doctors/me/photo', { responseType: 'blob' })

export const createDoctorMastitisCase = (payload) =>
  withMutationToast(api.post('/doctor/mastitis-cases', payload), {
    success: 'Mastitis case added successfully!',
    error: 'Failed to add mastitis case.',
  })
