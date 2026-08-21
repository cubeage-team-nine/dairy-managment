import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../core/hooks/useAuth.js'
import RoutePath from '../core/constants/routes.constant.js'

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to={RoutePath.LOGIN} replace />
}

export default ProtectedRoute
