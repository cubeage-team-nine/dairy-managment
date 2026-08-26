import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, User, Phone, Stethoscope } from 'lucide-react'
import { USER_ROLES, ROLE_LABELS } from '../../../core/constants/app.constants.js'
import RoutePath from '../../../core/constants/routes.constant.js'
import Logo from '../../../components/layout/Logo.jsx'
import FormInput from '../../../components/forms/FormInput.jsx'
import PasswordInput from '../../../components/forms/PasswordInput.jsx'
import ErrorMessage from '../../../components/common/ErrorMessage.jsx'
import AuthMarketingPanel from '../components/AuthMarketingPanel.jsx'
import { signup as signupRequest } from '../auth.service.js'

// Public signup only ever offers these two — ADMIN accounts are provisioned
// directly in the database and log in through the normal login page.
const SIGNUP_ROLES = [USER_ROLES.FARMER, USER_ROLES.DOCTOR]

function SignupPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState(USER_ROLES.FARMER)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.target)
    const payload = {
      role,
      full_name: formData.get('fullName'),
      email: formData.get('email'),
      mobile_number: formData.get('mobileNumber'),
      password: formData.get('password'),
      confirm_password: formData.get('confirmPassword'),
    }

    if (role === USER_ROLES.FARMER) {
      payload.village = formData.get('village') || undefined
      payload.pincode = formData.get('pincode') || undefined
    } else {
      payload.qualification = formData.get('qualification') || undefined
      payload.specialization = formData.get('specialization') || undefined
      payload.registration_number = formData.get('registrationNumber') || undefined
      const experienceYears = formData.get('experienceYears')
      payload.experience_years = experienceYears ? Number(experienceYears) : undefined
    }

    setIsSubmitting(true)
    try {
      await signupRequest(payload)
      navigate(RoutePath.LOGIN, {
        state: { signupSuccess: true, email: payload.email },
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <AuthMarketingPanel />

      <section className="flex min-h-screen flex-col">
        {/* Mobile header */}
        <div className="border-b border-border bg-card px-5 py-4 lg:hidden">
          <Link to={RoutePath.HOME}>
            <Logo />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 md:py-14 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Create Account
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Start managing your dairy operations today.
              </p>
            </div>

            {/* Role toggle */}
            <div className="mb-6 grid grid-cols-2 gap-2.5">
              {SIGNUP_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-md border px-3 py-2.5 text-sm font-medium transition ${
                    role === r
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-5">
                <ErrorMessage message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormInput
                id="fullName"
                name="fullName"
                type="text"
                label="Full Name"
                icon={User}
                placeholder="Jane Doe"
                required
              />

              <FormInput
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                label="Mobile Number"
                icon={Phone}
                placeholder="9876543210"
                minLength={10}
                required
              />

              <FormInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                icon={Mail}
                autoComplete="email"
                placeholder="jane@greenvalley.com"
                required
              />

              {role === USER_ROLES.FARMER ? (
                <div className="grid grid-cols-2 gap-4">
                  <FormInput id="village" name="village" type="text" label="Village" placeholder="Baner" />
                  <FormInput id="pincode" name="pincode" type="text" label="Pincode" placeholder="411045" />
                </div>
              ) : (
                <>
                  <FormInput
                    id="registrationNumber"
                    name="registrationNumber"
                    type="text"
                    label="Registration Number"
                    icon={Stethoscope}
                    placeholder="VET-12345"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      id="specialization"
                      name="specialization"
                      type="text"
                      label="Specialization"
                      placeholder="Large Animal Medicine"
                    />
                    <FormInput
                      id="experienceYears"
                      name="experienceYears"
                      type="number"
                      min="0"
                      label="Experience (yrs)"
                      placeholder="5"
                    />
                  </div>
                </>
              )}

              <PasswordInput
                id="password"
                name="password"
                label="Password"
                autoComplete="new-password"
                placeholder="••••••••"
                minLength={8}
                required
                helperText="Must be at least 8 characters."
              />

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                autoComplete="new-password"
                placeholder="••••••••"
                minLength={8}
                required
              />

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                />
                <span className="text-xs leading-5 text-muted-foreground sm:text-sm">
                  I agree to the{' '}
                  <a href="/terms" className="font-medium text-foreground underline underline-offset-2">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="font-medium text-foreground underline underline-offset-2">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="my-7 border-t border-border" />

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to={RoutePath.LOGIN}
                className="inline-flex items-center gap-1 font-medium text-primary transition hover:text-primary/80"
              >
                Login here
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default SignupPage
