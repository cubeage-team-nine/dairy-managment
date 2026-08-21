import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../core/hooks/useAuth.js'
import { USER_ROLES, ROLE_LABELS } from '../../../core/constants/app.constants.js'
import { ROLE_HOME_ROUTE } from '../../../core/constants/routes.constant.js'

const DEV_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.FARMER, USER_ROLES.DOCTOR]

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleDevLogin = (role) => {
    login({ id: 'dev-user', name: `Dev ${ROLE_LABELS[role]}`, role }, 'dev-token')
    navigate(ROLE_HOME_ROUTE[role])
  }

  return (
    <div className="login-page">
      <h1>Login</h1>
      <p>Login form placeholder.</p>

      {/* Temporary dev login — remove once real authentication is wired up */}
      <div className="mt-6 flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Dev login (temporary):</p>
        {DEV_ROLES.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => handleDevLogin(role)}
            className="btn-secondary"
          >
            Continue as {ROLE_LABELS[role]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LoginPage
