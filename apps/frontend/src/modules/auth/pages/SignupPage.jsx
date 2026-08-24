import { useState } from "react";
import { Link } from "react-router-dom";
import RoutePath from "../../../core/constants/routes.constant.js";

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-[#f8faf9] lg:grid lg:grid-cols-2">
      {/* Left Section */}
      <section
        className="
          relative hidden min-h-screen overflow-hidden
          bg-cover bg-center
          lg:flex lg:flex-col lg:justify-between
        "
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1400&q=85')",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-[#003f2c]/90" />

        {/* Logo */}
        <div className="relative z-10 px-10 py-9 xl:px-14">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-lg font-semibold text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100/20 backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-emerald-200"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16c3.2-.2 5.6-1.4 7.2-3.5C13 10.1 13.7 7.2 14 4c3.8 2.5 5.8 5.3 5.8 8.4 0 4-3.2 7.1-7.6 7.1A8.2 8.2 0 0 1 4 16Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 17c2.3-2.5 5-4.4 8.2-5.8"
                />
              </svg>
            </span>
            Smart Dairy Manager
          </Link>
        </div>

        {/* Bottom Content */}
        <div className="relative z-10 max-w-xl px-10 pb-10 text-white xl:px-14 xl:pb-14">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Elevate your farm&apos;s
            <br />
            productivity.
          </h2>

          <p className="mt-5 max-w-lg text-sm leading-6 text-white/80 xl:text-[15px]">
            Join thousands of modern dairy farmers utilizing precision data to
            ensure animal welfare and optimize daily operations with calm
            intelligence.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 19V9m5 10V5m5 14v-7m5 7V3"
                />
              </svg>
              Precision Insights
            </div>

            <div className="flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21c0-5.5 2.8-9.7 8-12-1 5.8-3.7 9.4-8 12Zm0 0c0-5.5-2.8-9.7-8-12 1 5.8 3.7 9.4 8 12Zm0 0V4"
                />
              </svg>
              Sustainable Management
            </div>
          </div>
        </div>
      </section>

      {/* Right Section */}
      <section className="flex min-h-screen flex-col">
        {/* Mobile Branding */}
        <div className="border-b border-gray-200 bg-white px-5 py-4 lg:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-semibold text-[#064e3b]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16c3.2-.2 5.6-1.4 7.2-3.5C13 10.1 13.7 7.2 14 4c3.8 2.5 5.8 5.3 5.8 8.4 0 4-3.2 7.1-7.6 7.1A8.2 8.2 0 0 1 4 16Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 17c2.3-2.5 5-4.4 8.2-5.8"
                />
              </svg>
            </span>
            Smart Dairy Manager
          </Link>
        </div>

        {/* Form Wrapper */}
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 md:py-14 lg:px-12">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                Create Account
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Start managing your dairy operations today.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Full Name
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM5 20a7 7 0 0 1 14 0"
                      />
                    </svg>
                  </span>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Jane Doe"
                    className="
                      h-12 w-full rounded-sm border border-gray-300
                      bg-white pl-10 pr-4 text-sm text-gray-900
                      outline-none transition
                      placeholder:text-gray-400
                      focus:border-[#006843] focus:ring-1 focus:ring-[#006843]
                    "
                  />
                </div>
              </div>

              {/* Farm Name */}
              <div>
                <label
                  htmlFor="farmName"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Farm Name
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 20h18M5 20V9l7-4 7 4v11M8 13h2m4 0h2M8 17h2m4 0h2"
                      />
                    </svg>
                  </span>

                  <input
                    id="farmName"
                    name="farmName"
                    type="text"
                    placeholder="Green Valley Dairy"
                    className="
                      h-12 w-full rounded-sm border border-gray-300
                      bg-white pl-10 pr-4 text-sm text-gray-900
                      outline-none transition
                      placeholder:text-gray-400
                      focus:border-[#006843] focus:ring-1 focus:ring-[#006843]
                    "
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Email Address
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 6.75A1.75 1.75 0 0 1 4.75 5h14.5A1.75 1.75 0 0 1 21 6.75v10.5A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25V6.75Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4 7 8 6 8-6"
                      />
                    </svg>
                  </span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@greenvalley.com"
                    className="
                      h-12 w-full rounded-sm border border-gray-300
                      bg-white pl-10 pr-4 text-sm text-gray-900
                      outline-none transition
                      placeholder:text-gray-400
                      focus:border-[#006843] focus:ring-1 focus:ring-[#006843]
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Password
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="5" y="10" width="14" height="10" rx="2" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 10V7a4 4 0 0 1 8 0v3"
                      />
                    </svg>
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    minLength={8}
                    className="
                      h-12 w-full rounded-sm border border-gray-300
                      bg-white pl-10 pr-11 text-sm text-gray-900
                      outline-none transition
                      placeholder:text-gray-400
                      focus:border-[#006843] focus:ring-1 focus:ring-[#006843]
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="
                      absolute inset-y-0 right-0 flex items-center px-3.5
                      text-gray-500 transition hover:text-gray-800
                    "
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18M10.7 10.7a2 2 0 0 0 2.6 2.6M9.9 4.3A10.8 10.8 0 0 1 12 4c5.5 0 9 5.5 9 5.5a15.4 15.4 0 0 1-3.1 3.7M6.2 6.2C4.2 7.5 3 9.5 3 9.5S6.5 15 12 15c1 0 1.9-.2 2.8-.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"
                        />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Must be at least 8 characters.
                </p>
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="
                    mt-0.5 h-4 w-4 rounded border-gray-300
                    accent-[#00583d]
                  "
                />

                <span className="text-xs leading-5 text-gray-600 sm:text-sm">
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="font-medium text-gray-900 underline underline-offset-2"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="font-medium text-gray-900 underline underline-offset-2"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                className="
                  flex h-12 w-full items-center justify-center
                  rounded-md bg-[#004b35] px-5 text-sm font-medium
                  text-white transition
                  hover:bg-[#003d2b]
                  focus:outline-none focus:ring-2
                  focus:ring-[#006843] focus:ring-offset-2
                "
              >
                Create Account
              </button>
            </form>

            {/* Divider */}
            <div className="my-7 border-t border-gray-200" />

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to={RoutePath.LOGIN}
                className="inline-flex items-center gap-1 font-medium text-[#00583d] transition hover:text-[#003d2b]"
              >
                Login here
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default SignupPage;
