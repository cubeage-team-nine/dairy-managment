import { Link } from 'react-router-dom'
import { Mail, User, Warehouse } from 'lucide-react'
import RoutePath from '../../../core/constants/routes.constant.js'
import Logo from '../../../components/layout/Logo.jsx'
import FormInput from '../../../components/forms/FormInput.jsx'
import PasswordInput from '../../../components/forms/PasswordInput.jsx'
import AuthMarketingPanel from '../components/AuthMarketingPanel.jsx'

function SignupPage() {
  const handleSubmit = (event) => {
    event.preventDefault()
    // Real registration can be added here later.
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormInput
                id="fullName"
                name="fullName"
                type="text"
                label="Full Name"
                icon={User}
                placeholder="Jane Doe"
              />

              <FormInput
                id="farmName"
                name="farmName"
                type="text"
                label="Farm Name"
                icon={Warehouse}
                placeholder="Green Valley Dairy"
              />

              <FormInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                icon={Mail}
                autoComplete="email"
                placeholder="jane@greenvalley.com"
              />

              <PasswordInput
                id="password"
                name="password"
                label="Password"
                autoComplete="new-password"
                placeholder="••••••••"
                minLength={8}
                helperText="Must be at least 8 characters."
              />

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
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
                className="flex h-12 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Create Account
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
