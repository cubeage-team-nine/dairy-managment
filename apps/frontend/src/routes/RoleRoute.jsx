import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../core/hooks/useAuth.js'
import RoutePath, { ROLE_HOME_ROUTE } from '../core/constants/routes.constant.js'

function RoleRoute({ allowedRoles = [] }) {
  const { user } = useAuth()
  const hasAccess = Boolean(user) && allowedRoles.includes(user.role)

  if (hasAccess) return <Outlet />

  const fallback = user ? ROLE_HOME_ROUTE[user.role] ?? RoutePath.LOGIN : RoutePath.LOGIN
  return <Navigate to={fallback} replace />
}

export default RoleRoute
