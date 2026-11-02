import api from '../../core/services/api.js'

// ── Farmers (existing) ────────────────────────────────────────────────────
export const getFarmers    = (params) => api.get('/farmers',          { params })
export const getFarmerById = (id)     => api.get(`/farmers/${id}`)
export const createFarmer  = (data)   => api.post('/farmers',           data)
export const updateFarmer  = (id, data) => api.patch(`/farmers/${id}`,  data)
export const deleteFarmer  = (id)     => api.delete(`/farmers/${id}`)

// ── Animals (for health request form) ────────────────────────────────────
/** Fetch the logged-in farmer's own animals */
export const getMyAnimals = () => api.get('/farmer/animals')

// ── Approved Doctors (visible to farmers) ────────────────────────────────
/** Fetch all admin-approved, active doctors */
export const getApprovedDoctors = () => api.get('/farmer/doctors')

/** Auto-assign the best available doctor for a health request */
export const autoAssignDoctor = (payload) => api.post('/farmer/health-requests/auto-assign', payload)

// ── Health Requests ───────────────────────────────────────────────────────
/** Submit a new animal health request */
export const submitHealthRequest = (payload) => api.post('/farmer/health-requests', payload)

/** Fetch all health requests submitted by the logged-in farmer */
export const getMyHealthRequests = () => api.get('/farmer/health-requests')

/** Fetch details of a single health request */
export const getHealthRequestById = (id) => api.get(`/farmer/health-requests/${id}`)

// ── Health Records (farmer's animal medical history) ─────────────────────
/** Fetch health records for the logged-in farmer's animals */
export const getMyHealthRecords = () => api.get('/farmer/health-records')
