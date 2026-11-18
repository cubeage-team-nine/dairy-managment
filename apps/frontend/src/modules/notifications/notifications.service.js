import api from '../../core/services/api.js'
import { withMutationToast } from '../../core/services/toastNotifications.js'

const base = '/notifications'

export const getNotifications = async () => (await api.get(base)).data
export const createReminder = (payload) => withMutationToast(api.post(base, payload), { success: 'Reminder added successfully!', error: 'Failed to add reminder.' }).then((response) => response.data)
export const updateReminder = async (id, payload) => (await api.patch(`${base}/${id}`, payload)).data
export const deleteReminder = (id) => withMutationToast(api.delete(`${base}/${id}`), { success: 'Reminder deleted successfully!', error: 'Failed to delete reminder.' })
