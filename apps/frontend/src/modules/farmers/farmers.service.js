import api from '../../core/services/api.js'
import { withMutationToast } from '../../core/services/toastNotifications.js'

// ── Admin Farmers ─────────────────────────────────────────────────────────
export const getFarmers      = (params) => api.get('/farmers', { params })
export const getFarmerById   = (id)     => api.get(`/farmers/${id}`)
export const updateFarmerStatus = (id, data) => api.patch(`/farmers/${id}/status`, data)

// ── Animals (for health request form) ────────────────────────────────────
/** Fetch the logged-in farmer's own animals */
export const getMyAnimals = () => api.get('/animals')

// ── Approved Doctors (visible to farmers) ────────────────────────────────
/** Fetch all admin-approved, active doctors */
export const getApprovedDoctors = () => api.get('/farmer/doctors')

// ── Health Requests ───────────────────────────────────────────────────────
/** Submit a new animal health request */
export const submitHealthRequest = (payload) => withMutationToast(api.post('/farmer/health-requests', payload), { success: 'Doctor request sent successfully!', error: 'Failed to send doctor request.' })

/** Fetch all health requests submitted by the logged-in farmer */
export const getMyHealthRequests = () => api.get('/farmer/health-requests')

/** Fetch details of a single health request */
export const getHealthRequestById = (id) => api.get(`/farmer/health-requests/${id}`)

// ── Health Records (farmer's animal medical history) ─────────────────────
/** Fetch health records for the logged-in farmer's animals */
export const getMyHealthRecords = () => api.get('/farmer/health-records')

export const createMyHealthRecord = (payload) =>
  withMutationToast(api.post('/farmer/health-records', payload), { success: 'Health record added successfully!', error: 'Failed to add health record.' })

export const updateMyHealthRecord = (id, payload) =>
  api.put(`/farmer/health-records/${id}`, payload)

export const deleteMyHealthRecord = (id) =>
  withMutationToast(api.delete(`/farmer/health-records/${id}`), { success: 'Health record deleted successfully!', error: 'Failed to delete health record.' })
