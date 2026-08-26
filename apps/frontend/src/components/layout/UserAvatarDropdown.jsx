import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../core/hooks/useAuth.js'
import RoutePath from '../../core/constants/routes.constant.js'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  const initials = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0]
  return initials.toUpperCase()
}

function UserAvatarDropdown() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleViewProfile = () => {
    setIsOpen(false)
    navigate(RoutePath.PROFILE)
  }

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    navigate(RoutePath.LOGIN)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-muted"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {getInitials(user?.full_name)}
        </span>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.full_name ?? 'User'}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={handleViewProfile}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <User className="size-4" />
            View Profile
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-destructive transition hover:bg-muted"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default UserAvatarDropdown
