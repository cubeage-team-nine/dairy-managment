import { TrendingUp } from 'lucide-react'

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trendIcon: TrendIcon = TrendingUp,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>

        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
            <Icon size={19} />
          </div>
        )}
      </div>

      <h2 className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </h2>

      {subtitle && (
        <p className="mt-1 flex items-center gap-1 text-xs text-green-700">
          <TrendIcon size={13} />
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default StatCard