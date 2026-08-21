import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../core/hooks/useAuth.js'
import { ROLE_LABELS } from '../../core/constants/app.constants.js'
import RoutePath from '../../core/constants/routes.constant.js'
import { sidebarMenus } from './sidebar.config.js'

function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const menuItems = user ? sidebarMenus[user.role] ?? [] : []

  const handleLogout = () => {
    logout()
    navigate(RoutePath.HOME)
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)]">
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-soft text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {Icon && <Icon className="size-[18px] shrink-0" />}
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {user && (
        <div className="border-t border-border p-4">
          <div className="mb-3 min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
