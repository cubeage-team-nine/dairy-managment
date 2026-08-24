import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/hooks/useAuth.js";
import {
  USER_ROLES,
  ROLE_LABELS,
} from "../../../core/constants/app.constants.js";
import RoutePath, {
  ROLE_HOME_ROUTE,
} from "../../../core/constants/routes.constant.js";

const DEV_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.FARMER,
  USER_ROLES.DOCTOR,
];

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const handleDevLogin = (role) => {
    login(
      {
        id: "dev-user",
        name: `Dev ${ROLE_LABELS[role]}`,
        role,
      },
      "dev-token",
    );

    navigate(ROLE_HOME_ROUTE[role]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Real authentication can be added here later.
  };

  return (
    <main className="min-h-screen bg-[#f8faf9] lg:grid lg:grid-cols-2">
      {/* LEFT IMAGE SECTION */}
      <section
        className="
          relative hidden min-h-screen overflow-hidden
          bg-cover bg-center
          lg:flex lg:flex-col lg:justify-between
        "
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1600&q=90')",
        }}
      >
        {/* Image overlay */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-b
            from-black/5
            via-black/5
            to-[#003e2c]/90
          "
        />

        {/* Logo */}
        <div className="relative z-10 px-10 py-9 xl:px-14">
          <div className="inline-flex items-center gap-2 text-lg font-semibold text-white">
            <span
              className="
                flex h-8 w-8 items-center justify-center
                rounded-lg bg-emerald-100/20
                backdrop-blur-sm
              "
            >
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
                  d="
                    M4 16
                    c3.2-.2 5.6-1.4 7.2-3.5
                    C13 10.1 13.7 7.2 14 4
                    c3.8 2.5 5.8 5.3 5.8 8.4
                    0 4-3.2 7.1-7.6 7.1
                    A8.2 8.2 0 0 1 4 16Z
                  "
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 17c2.3-2.5 5-4.4 8.2-5.8"
                />
              </svg>
            </span>
            Smart Dairy Manager
          </div>
        </div>

        {/* Bottom marketing content */}
        <div
          className="
            relative z-10
            max-w-xl
            px-10 pb-10
            text-white
            xl:px-14 xl:pb-14
          "
        >
          <h2
            className="
              max-w-md
              text-3xl font-semibold
              leading-tight tracking-tight
              xl:text-4xl
            "
          >
            Elevate your farm&apos;s
            <br />
            productivity.
          </h2>

          <p
            className="
              mt-5 max-w-lg
              text-sm leading-6
              text-white/80
              xl:text-[15px]
            "
          >
            Join thousands of modern dairy farmers utilizing precision data to
            ensure animal welfare and optimize daily operations with calm
            intelligence.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {/* Precision Insights */}
            <div
              className="
                flex items-center gap-2
                rounded-md
                bg-white/10
                px-4 py-2
                text-xs font-medium
                text-white/90
                backdrop-blur-sm
              "
            >
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

            {/* Sustainable Management */}
            <div
              className="
                flex items-center gap-2
                rounded-md
                bg-white/10
                px-4 py-2
                text-xs font-medium
                text-white/90
                backdrop-blur-sm
              "
            >
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
                  d="
                    M12 21
                    c0-5.5 2.8-9.7 8-12
                    -1 5.8-3.7 9.4-8 12Zm0 0
                    c0-5.5-2.8-9.7-8-12
                    1 5.8 3.7 9.4 8 12Zm0 0V4
                  "
                />
              </svg>
              Sustainable Management
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* RIGHT LOGIN SECTION */}
      {/* ===================================================== */}
      <section className="flex min-h-screen flex-col">
        {/* Mobile header */}
        <div
          className="
            border-b border-gray-200
            bg-white
            px-5 py-4
            sm:px-7
            lg:hidden
          "
        >
          <div
            className="
              inline-flex items-center gap-2
              font-semibold
              text-[#064e3b]
            "
          >
            <span
              className="
                flex h-8 w-8 items-center justify-center
                rounded-lg bg-emerald-50
              "
            >
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
                  d="
                    M4 16
                    c3.2-.2 5.6-1.4 7.2-3.5
                    C13 10.1 13.7 7.2 14 4
                    c3.8 2.5 5.8 5.3 5.8 8.4
                    0 4-3.2 7.1-7.6 7.1
                    A8.2 8.2 0 0 1 4 16Z
                  "
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 17c2.3-2.5 5-4.4 8.2-5.8"
                />
              </svg>
            </span>
            Smart Dairy Manager
          </div>
        </div>

        {/* Main form container */}
        <div
          className="
            flex flex-1 items-center justify-center
            px-5 py-10
            sm:px-8
            md:py-14
            lg:px-12
          "
        >
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-8">
              <h1
                className="
                  text-2xl font-semibold
                  tracking-tight
                  text-gray-950
                  sm:text-3xl
                "
              >
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Sign in to continue managing your dairy operations.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="
                    mb-2 block
                    text-sm font-medium
                    text-gray-800
                  "
                >
                  Email Address
                </label>

                <div className="relative">
                  <span
                    className="
                      pointer-events-none
                      absolute inset-y-0 left-0
                      flex items-center
                      pl-3.5
                      text-gray-500
                    "
                  >
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
                        d="
                          M3 6.75
                          A1.75 1.75 0 0 1 4.75 5
                          h14.5
                          A1.75 1.75 0 0 1 21 6.75
                          v10.5
                          A1.75 1.75 0 0 1 19.25 19
                          H4.75
                          A1.75 1.75 0 0 1 3 17.25
                          V6.75Z
                        "
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
                    autoComplete="email"
                    placeholder="jane@greenvalley.com"
                    className="
                      h-12 w-full
                      rounded-sm
                      border border-gray-300
                      bg-white
                      pl-10 pr-4
                      text-sm text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      hover:border-gray-400
                      focus:border-[#006843]
                      focus:ring-1
                      focus:ring-[#006843]
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-800"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="
                      text-xs font-medium
                      text-[#00583d]
                      transition
                      hover:text-[#003d2b]
                      hover:underline
                    "
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  {/* Lock */}
                  <span
                    className="
                      pointer-events-none
                      absolute inset-y-0 left-0
                      flex items-center
                      pl-3.5
                      text-gray-500
                    "
                  >
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
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="
                      h-12 w-full
                      rounded-sm
                      border border-gray-300
                      bg-white
                      pl-10 pr-11
                      text-sm text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      hover:border-gray-400
                      focus:border-[#006843]
                      focus:ring-1
                      focus:ring-[#006843]
                    "
                  />

                  {/* Password visibility */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="
                      absolute inset-y-0 right-0
                      flex items-center
                      px-3.5
                      text-gray-500
                      transition
                      hover:text-gray-800
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
                          d="
                            M3 3l18 18
                            M10.7 10.7a2 2 0 0 0 2.6 2.6
                            M9.9 4.3A10.8 10.8 0 0 1 12 4
                            c5.5 0 9 5.5 9 5.5
                            a15.4 15.4 0 0 1-3.1 3.7
                            M6.2 6.2
                            C4.2 7.5 3 9.5 3 9.5
                            S6.5 15 12 15
                            c1 0 1.9-.2 2.8-.5
                          "
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
                          d="
                            M2.5 12
                            S6 6.5 12 6.5
                            21.5 12 21.5 12
                            18 17.5 12 17.5
                            2.5 12 2.5 12Z
                          "
                        />

                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="
                    h-4 w-4
                    rounded
                    border-gray-300
                    accent-[#00583d]
                  "
                />

                <span className="text-sm text-gray-600">Remember me</span>
              </label>

              {/* Login button */}
              <button
                type="submit"
                className="
                  flex h-12 w-full
                  items-center justify-center
                  rounded-md
                  bg-[#004b35]
                  px-5
                  text-sm font-medium
                  text-white
                  transition
                  hover:bg-[#003d2b]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#006843]
                  focus:ring-offset-2
                "
              >
                Login
              </button>
            </form>

            {/* Signup */}
            <div className="my-7 border-t border-gray-200" />

            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              {RoutePath?.SIGNUP ? (
                <Link
                  to={RoutePath.SIGNUP}
                  className="
                    inline-flex items-center gap-1
                    font-medium
                    text-[#00583d]
                    transition
                    hover:text-[#003d2b]
                  "
                >
                  Create account
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span className="font-medium text-[#00583d]">
                  Create account
                </span>
              )}
            </p>

            {/* ================================================= */}
            {/* TEMPORARY DEV LOGIN */}
            {/* ================================================= */}
            <div className="mt-8">
              <div className="mb-5 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200" />

                <span
                  className="
                    whitespace-nowrap
                    text-[11px] font-medium
                    uppercase tracking-wider
                    text-gray-400
                  "
                >
                  Development Access
                </span>

                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <p className="mb-3 text-center text-xs text-gray-500">
                Temporary role-based login
              </p>

              <div
                className="
                  grid grid-cols-1 gap-2.5
                  sm:grid-cols-3
                "
              >
                {DEV_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDevLogin(role)}
                    className="
                      min-h-11
                      rounded-md
                      border border-gray-300
                      bg-white
                      px-3 py-2
                      text-xs font-medium
                      text-gray-700
                      transition
                      hover:border-[#006843]
                      hover:bg-emerald-50
                      hover:text-[#00583d]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#006843]/30
                    "
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
  );
}

export default LoginPage;
