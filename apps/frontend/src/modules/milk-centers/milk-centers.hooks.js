// Custom React hooks for the Milk Centers module.
// Wraps milk-centers.service.js for clean component usage.

import { useCallback, useEffect, useState } from 'react'
import {
  fetchMilkCenters,
  createMilkCenter,
  updateMilkCenter,
  deleteMilkCenter,
  toggleMilkCenterStatus,
} from './milk-centers.service'

/**
 * useMilkCenters – manages milk center state and all CRUD operations.
 * Falls back to local sample data when the backend is not yet available.
 */
export function useMilkCenters(sampleData = []) {
  const [centers, setCenters] = useState(sampleData)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Fetch from backend on mount; silently fall back to sample data on error
  useEffect(() => {
    setLoading(true)
    fetchMilkCenters()
      .then(res => setCenters(res.data?.data ?? res.data ?? []))
      .catch(() => { /* backend not ready – keep sample data */ })
      .finally(() => setLoading(false))
  }, [])

  const add = useCallback(async (payload) => {
    try {
      const res = await createMilkCenter(payload)
      setCenters(old => [res.data, ...old])
    } catch {
      // Optimistic local add when backend is unavailable
      setCenters(old => [{ ...payload, id: Date.now() }, ...old])
    }
  }, [])

  const update = useCallback(async (id, payload) => {
    try {
      const res = await updateMilkCenter(id, payload)
      setCenters(old => old.map(c => c.id === id ? res.data : c))
    } catch {
      setCenters(old => old.map(c => c.id === id ? { ...c, ...payload } : c))
    }
  }, [])

  const remove = useCallback(async (id) => {
    try { await deleteMilkCenter(id) } catch { /* ignore */ }
    setCenters(old => old.filter(c => c.id !== id))
  }, [])

  const toggleStatus = useCallback(async (id, currentStatus) => {
    const next = currentStatus === 'Active' ? 'Inactive' : 'Active'
    try { await toggleMilkCenterStatus(id, next) } catch { /* ignore */ }
    setCenters(old => old.map(c => c.id === id ? { ...c, status: next } : c))
  }, [])

  return { centers, setCenters, loading, error, add, update, remove, toggleStatus }
}
