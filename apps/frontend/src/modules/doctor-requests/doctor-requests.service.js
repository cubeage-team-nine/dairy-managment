// API service for Doctor Requests module
// All functions ready for FastAPI backend integration.

import api from '../../core/services/api'
import { withMutationToast } from '../../core/services/toastNotifications.js'

/** Fetch all health requests assigned to the logged-in doctor */
export const fetchHealthRequests = () => api.get('/doctor/health-requests')

/** Fetch single request details */
export const fetchRequestDetail = (id) => api.get(`/doctor/health-requests/${id}`)

/** Accept a health request */
export const acceptRequest = (id) => api.patch(`/doctor/health-requests/${id}/accept`)

/** Reject a health request with a reason */
export const rejectRequest = (id) => api.patch(`/doctor/health-requests/${id}/reject`)

/** Mark a request as completed with treatment notes */
export const completeRequest = (id, treatmentNotes) =>
  api.patch(`/doctor/health-requests/${id}/complete`, { treatment_notes: treatmentNotes })

export const fetchAssignedAnimals = () => api.get('/doctor/animals')
export const fetchAssignedAnimalHistory = (id) => api.get(`/doctor/animals/${id}/health-history`)
export const fetchDoctorHealthRecords = (params) => api.get('/doctor/health-records', { params })
export const createDoctorHealthRecord = (payload) => withMutationToast(api.post('/doctor/health-records', payload), { success: 'Health record added successfully!', error: 'Failed to add health record.' })
export const updateDoctorHealthRecord = (id, payload) => api.put(`/doctor/health-records/${id}`, payload)
