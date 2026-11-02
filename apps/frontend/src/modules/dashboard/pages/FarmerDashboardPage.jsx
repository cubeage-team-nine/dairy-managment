
import { useEffect, useState } from 'react'
import { Users, Milk, Droplet, Wallet, Plus, Activity, Stethoscope, RefreshCw, AlertCircle,
} from 'lucide-react'
import api from '../../../core/services/api.js'
import StatCard from '../../../components/common/StatCard.jsx'

function FarmerDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/dashboard/farmer')
      setDashboard(response.data)
    } catch (err) {
      console.error('Dashboard API error:', err)
      setError(err.response?.data?.detail || 'Dashboard data load failed.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const cards = [
    { title: 'Total Animals', value: dashboard?.total_animals ?? 0, subtitle: 'Registered animals', icon: Users },
    { title: 'Milking Animals', value: dashboard?.milking_animals ?? 0, subtitle: 'Producing milk', icon: Milk },
    { title: "Today's Milk", value: `${dashboard?.today_milk ?? 0} L`, subtitle: 'Milk produced today', icon: Droplet },
    { title: 'Monthly Revenue', value: `₹${Number(dashboard?.monthly_revenue ?? 0).toLocaleString('en-IN')}`, subtitle: 'Revenue this month', icon: Wallet },
  ]

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-green-700" />
        Loading dashboard...
      </div>
    )
  }

  if (error) {
    return (
      <div className="m-6 rounded-xl border border-red-200 bg-white p-6">
        <p className="flex items-center gap-2 text-red-600">
          <AlertCircle size={22} /> {error}
        </p>
        <button onClick={fetchDashboard} className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-white">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6 bg-[#faf8f5] p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what is happening with your dairy farm today.
          </p>
        </div>
        <button onClick={fetchDashboard} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2">
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <section>
        <h2 className="text-xl font-bold text-gray-800">
          Namaste, {dashboard?.farmer_name || 'Farmer'}!
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Here is your farm's latest information.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <StatCard key={card.title} {...card} />)}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 xl:col-span-2">
          <h3 className="text-lg font-semibold">Milk Production (Last 7 Days)</h3>

          {dashboard?.weekly_milk?.length > 0 ? (
            <div className="mt-6 flex h-64 items-end justify-around gap-3">
              {dashboard.weekly_milk.map((item) => {
                const max = Math.max(
                  ...dashboard.weekly_milk.map((day) => Number(day.quantity || 0)),
                  1
                )
                const quantity = Number(item.quantity || 0)

                return (
                  <div key={item.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                    <span className="mb-2 text-xs text-gray-600">{quantity} L</span>
                    <div className="flex h-4/5 w-full items-end justify-center">
                      <div
                        title={`${item.date}: ${quantity} L`}
                        className="w-full max-w-12 rounded-t-md bg-green-800 hover:bg-green-600"
                        style={{ height: `${(quantity / max) * 100}%` }}
                      />
                    </div>
                    <span className="mt-2 text-xs text-gray-500">{item.day}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-gray-500">
              No milk production records available.
            </p>
          )}
        </div>
        
        <div className="rounded-xl border bg-white p-5">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <QuickAction icon={Plus} label="Add Animal" to="/farmer/animals/add" />
            <QuickAction icon={Droplet} label="Record Milk" to="/farmer/milk/add" />
            <QuickAction icon={Activity} label="Log Feed" to="/farmer/feed" />
            <QuickAction icon={Stethoscope} label="Vet Service" to="/farmer/health" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h3 className="text-lg font-semibold">Recent Health Alerts</h3>
        {dashboard?.health_alerts?.length > 0 ? (
          <div className="mt-4 space-y-3">
            {dashboard.health_alerts.map((alert) => (
              <div key={alert.id} className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm">
                <p className="font-medium">
                  {alert.animal_tag ? `${alert.animal_tag}: ` : ''}{alert.message}
                </p>
                {alert.visit_date && (
                  <p className="mt-1 text-xs text-gray-500">Date: {alert.visit_date}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
            No recent health alerts available.
          </p>
        )}
      </section>
    </div>
  )
}

function QuickAction({ icon: Icon, label, to }) {
  return (
    <a href={to} className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-xl border p-3 text-center hover:border-green-300 hover:bg-green-50">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-800">
        <Icon size={20} />
      </span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </a>
  )
}

export default FarmerDashboardPage
