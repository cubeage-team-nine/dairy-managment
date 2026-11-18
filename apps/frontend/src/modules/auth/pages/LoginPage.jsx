import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LockKeyhole, Mail, Stethoscope, Users } from 'lucide-react'
import { useAuth } from '../../../core/hooks/useAuth.js'
import { USER_ROLES } from '../../../core/constants/app.constants.js'
import RoutePath, { ROLE_HOME_ROUTE } from '../../../core/constants/routes.constant.js'
import FormInput from '../../../components/forms/FormInput.jsx'
import PasswordInput from '../../../components/forms/PasswordInput.jsx'
import ErrorMessage from '../../../components/common/ErrorMessage.jsx'
import AuthMarketingPanel from '../components/AuthMarketingPanel.jsx'
import { adminLogin as adminLoginRequest, panelLogin as panelLoginRequest } from '../auth.service.js'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginRole, setLoginRole] = useState(
    location.state?.loginRole
      ?? (location.pathname === RoutePath.ADMIN_LOGIN ? USER_ROLES.ADMIN : USER_ROLES.FARMER),
  )
  const signupSuccess = location.state?.signupSuccess

  useEffect(() => {
    setLoginRole(
      location.state?.loginRole
        ?? (location.pathname === RoutePath.ADMIN_LOGIN ? USER_ROLES.ADMIN : USER_ROLES.FARMER),
    )
  }, [location.pathname, location.state?.loginRole])

  const selectRole = (role) => {
    setLoginRole(role)
    setError('')
    const path = role === USER_ROLES.ADMIN ? RoutePath.ADMIN_LOGIN : RoutePath.LOGIN
    if (location.pathname !== path) {
      navigate(path, { replace: true, state: { loginRole: role } })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.target)
    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
      ...(loginRole === USER_ROLES.ADMIN ? {} : { role: loginRole }),
    }

    setIsSubmitting(true)
    try {
      const request = loginRole === USER_ROLES.ADMIN
        ? adminLoginRequest(payload)
        : panelLoginRequest(payload)
      const { data } = await request
      if (data.user.role !== loginRole) {
        setError(`This account does not have ${loginRole.toLowerCase()} access.`)
        return
      }
      login(data.user, data.access_token, formData.get('remember_me') === 'on')
      navigate(ROLE_HOME_ROUTE[data.user.role] ?? RoutePath.HOME)
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <AuthMarketingPanel />

      <section className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 md:py-14 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to continue managing your dairy operations.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-2">
              {[
                { role: USER_ROLES.FARMER, label: 'Farmer Login', icon: Users },
                { role: USER_ROLES.DOCTOR, label: 'Doctor Login', icon: Stethoscope },
                { role: USER_ROLES.ADMIN, label: 'Admin Login', icon: LockKeyhole },
              ].map(({ role, label, icon: Icon }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => selectRole(role)}
                  aria-pressed={loginRole === role}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition ${
                    loginRole === role
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {signupSuccess && !error && (
              <div className="mb-5 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
                Registration completed. Farmers can log in now; Doctor registrations require Admin approval first.
              </div>
            )}

            {error && (
              <div className="mb-5">
                <ErrorMessage message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                icon={Mail}
                autoComplete="email"
                placeholder="jane@greenvalley.com"
                defaultValue={location.state?.email ?? ''}
                required
              />

              <PasswordInput
                id="password"
                name="password"
                label="Password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                labelExtra={
                  <Link
                    to={RoutePath.CONTACT}
                    className="text-xs font-medium text-primary transition hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                }
              />

              <label className="flex cursor-pointer items-center gap-3">
                <input name="remember_me" type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="my-7 border-t border-border" />

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                to={RoutePath.SIGNUP}
                className="inline-flex items-center gap-1 font-medium text-primary transition hover:text-primary/80"
              >
                Create account
                <span aria-hidden="true">→</span>
              </Link>
            </p>

          </div>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
