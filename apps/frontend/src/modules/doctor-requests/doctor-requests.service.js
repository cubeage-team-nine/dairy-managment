// API service for Doctor Requests module
// All functions ready for FastAPI backend integration.

import api from '../../core/services/api'

/** Fetch all health requests assigned to the logged-in doctor */
export const fetchHealthRequests = () => api.get('/doctor/health-requests')

/** Fetch single request details */
export const fetchRequestDetail = (id) => api.get(`/doctor/health-requests/${id}`)

/** Accept a health request */
export const acceptRequest = (id) => api.patch(`/doctor/health-requests/${id}/accept`)

/** Reject a health request with a reason */
export const rejectRequest = (id, reason) => api.patch(`/doctor/health-requests/${id}/reject`, { reason })

/** Mark a request as completed with treatment notes */
export const completeRequest = (id, treatmentNotes) =>
  api.patch(`/doctor/health-requests/${id}/complete`, { treatmentNotes })
