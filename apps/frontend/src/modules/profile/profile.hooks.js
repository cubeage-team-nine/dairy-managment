import { useState } from 'react'
import { useAuth } from '../../core/hooks/useAuth.js'
import { updateProfile, changePassword } from '../auth/auth.service.js'

export function useProfileForm() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (payload) => {
    setIsSaving(true)
    setError('')
    try {
      const { data } = await updateProfile(payload)
      updateUser(data)
      setIsEditing(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return { user, isEditing, setIsEditing, isSaving, error, save }
}

export function useChangePassword() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const save = async (payload) => {
    setIsSaving(true)
    setError('')
    setSuccess(false)
    try {
      await changePassword(payload)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password.')
    } finally {
      setIsSaving(false)
    }
  }

  return { isSaving, error, success, save }
}

export function useNotifications() {
  const notifications = []
  const markAsRead = () => {}
  return { notifications, markAsRead }
}
