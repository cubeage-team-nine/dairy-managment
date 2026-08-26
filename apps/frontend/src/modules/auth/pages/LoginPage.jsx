import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '../../../core/hooks/useAuth.js'
import { USER_ROLES, ROLE_LABELS } from '../../../core/constants/app.constants.js'
import RoutePath, { ROLE_HOME_ROUTE } from '../../../core/constants/routes.constant.js'
import Logo from '../../../components/layout/Logo.jsx'
import FormInput from '../../../components/forms/FormInput.jsx'
import PasswordInput from '../../../components/forms/PasswordInput.jsx'
import ErrorMessage from '../../../components/common/ErrorMessage.jsx'
import AuthMarketingPanel from '../components/AuthMarketingPanel.jsx'
import { login as loginRequest } from '../auth.service.js'

const DEV_ROLES = [USER_ROLES.ADMIN, USER_ROLES.FARMER, USER_ROLES.DOCTOR]

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const signupSuccess = location.state?.signupSuccess

  const handleDevLogin = (role) => {
    login({ id: 'dev-user', name: `Dev ${ROLE_LABELS[role]}`, role }, 'dev-token')
    navigate(ROLE_HOME_ROUTE[role])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.target)
    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
    }

    setIsSubmitting(true)
    try {
      const { data } = await loginRequest(payload)
      login(data.user, data.access_token)
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
        {/* Mobile header */}
        <div className="border-b border-border bg-card px-5 py-4 sm:px-7 lg:hidden">
          <Link to={RoutePath.HOME}>
            <Logo />
          </Link>
        </div>

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

            {signupSuccess && !error && (
              <div className="mb-5 rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
                Account created successfully. Please log in.
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
                  <button
                    type="button"
                    className="text-xs font-medium text-primary transition hover:text-primary/80"
                  >
                    Forgot password?
                  </button>
                }
              />

              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
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

            {/* Temporary dev login — remove once real authentication is wired up */}
            <div className="mt-8">
              <div className="mb-5 flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="whitespace-nowrap text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Development Access
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <p className="mb-3 text-center text-xs text-muted-foreground">
                Temporary role-based login
              </p>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {DEV_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDevLogin(role)}
                    className="min-h-11 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary hover:bg-primary-soft hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {ROLE_LABELS[role]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
