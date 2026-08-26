import { useState } from 'react'
import { useAuth } from '../../core/hooks/useAuth.js'
import { updateProfile } from '../auth/auth.service.js'

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

// Notifications have no backend module yet — this mock data stands in for it.
// Swap the body of this hook for a real fetch once a notifications API exists;
// nothing in NotificationsList or ProfilePage needs to change when that happens.
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    message: 'Welcome to Smart Dairy Manager! Your account is ready to use.',
    timestamp: '2026-08-20T09:00:00Z',
    isRead: true,
  },
  {
    id: 2,
    message: 'Your profile details were saved successfully.',
    timestamp: '2026-08-22T13:15:00Z',
    isRead: true,
  },
  {
    id: 3,
    message: 'New feature available: DMI Calculator is now live on your dashboard.',
    timestamp: '2026-08-25T10:30:00Z',
    isRead: false,
  },
]

export function useNotifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  return { notifications, markAsRead }
}
