import api from '../../core/services/api.js'
import { withMutationToast } from '../../core/services/toastNotifications.js'

export const getMilkIncomeSummary = () => api.get('/finance/milk-income-summary')
export const createMilkIncome = (payload) => withMutationToast(api.post('/finance/milk-income', payload), { success: 'Milk income added successfully!', error: 'Failed to add milk income.' })
export const updateMilkIncome = (id, payload) => api.put(`/finance/milk-income/${id}`, payload)
export const deleteMilkIncome = (id) => withMutationToast(api.delete(`/finance/milk-income/${id}`), { success: 'Milk income deleted successfully!', error: 'Failed to delete milk income.' })
export const getExpenses = (params) => api.get('/finance/expenses', { params })
export const createExpense = (payload) => withMutationToast(api.post('/finance/expenses', payload), { success: 'Expense added successfully!', error: 'Failed to add expense.' })
export const updateExpense = (id, payload) => api.put(`/finance/expenses/${id}`, payload)
export const deleteExpense = (id) => withMutationToast(api.delete(`/finance/expenses/${id}`), { success: 'Expense deleted successfully!', error: 'Failed to delete expense.' })
