import { useCallback, useEffect, useState } from 'react'
import { getFarmers } from './farmers.service.js'

export const useFarmers = () => {
  const [farmers, setFarmers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFarmers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getFarmers()
      setFarmers(response.data)
    } catch (err) {
      setError(err.message || 'Failed to load farmers.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFarmers()
  }, [fetchFarmers])

  return { farmers, isLoading, error, refetch: fetchFarmers }
}
