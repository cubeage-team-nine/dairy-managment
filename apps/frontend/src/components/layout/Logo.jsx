function Logo({ onDark = false, iconOnly = false }) {
  const mark = (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
        onDark ? 'bg-emerald-100/20 backdrop-blur-sm' : 'bg-emerald-50'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`h-5 w-5 ${onDark ? 'text-emerald-200' : ''}`}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16c3.2-.2 5.6-1.4 7.2-3.5C13 10.1 13.7 7.2 14 4c3.8 2.5 5.8 5.3 5.8 8.4 0 4-3.2 7.1-7.6 7.1A8.2 8.2 0 0 1 4 16Z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17c2.3-2.5 5-4.4 8.2-5.8" />
      </svg>
    </span>
  )

  if (iconOnly) return mark

  return (
    <span
      className={`inline-flex items-center gap-2 text-lg font-semibold ${
        onDark ? 'text-white' : 'text-[#064e3b]'
      }`}
    >
      {mark}
      Smart Dairy Manager
    </span>
  )
}

export default Logo
