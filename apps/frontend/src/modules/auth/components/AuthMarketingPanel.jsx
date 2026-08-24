import { Link } from 'react-router-dom'
import { BarChart3, Leaf } from 'lucide-react'
import Logo from '../../../components/layout/Logo.jsx'
import RoutePath from '../../../core/constants/routes.constant.js'

const badges = [
  { label: 'Precision Insights', icon: BarChart3 },
  { label: 'Sustainable Management', icon: Leaf },
]

function AuthMarketingPanel({
  heading = (
    <>
      Elevate your farm&apos;s
      <br />
      productivity.
    </>
  ),
  description = "Join thousands of modern dairy farmers utilizing precision data to ensure animal welfare and optimize daily operations with calm intelligence.",
  imageUrl = 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1600&q=90',
}) {
  return (
    <section
      className="relative hidden min-h-screen overflow-hidden bg-cover bg-center lg:flex lg:flex-col lg:justify-between"
      style={{ backgroundImage: `url('${imageUrl}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/5 to-[#003e2c]/90" />

      <div className="relative z-10 px-10 py-9 xl:px-14">
        <Link to={RoutePath.HOME}>
          <Logo onDark />
        </Link>
      </div>

      <div className="relative z-10 max-w-xl px-10 pb-10 text-white xl:px-14 xl:pb-14">
        <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
          {heading}
        </h2>

        <p className="mt-5 max-w-lg text-sm leading-6 text-white/80 xl:text-[15px]">
          {description}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          {badges.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-sm"
            >
              <Icon className="size-4" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AuthMarketingPanel
