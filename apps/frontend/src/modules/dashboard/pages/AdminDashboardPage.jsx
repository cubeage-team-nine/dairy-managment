import { useEffect, useState } from 'react'
import { Users, Milk, Stethoscope, Activity } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import StatCard from '../../../components/common/StatCard'
import api from '../../../core/services/api'

// Pie chart colors — extends automatically if farmData has more than 2 slices
const PIE_COLORS = ['#16A34A', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6']

// Safely unwrap API responses that may return array, { data: [] }, or { key: [] }
const unwrap = (data, key) =>
  Array.isArray(data) ? data : data?.[key] ?? data?.data ?? []

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState({})
  const [milkData, setMilkData]   = useState([])
  const [farmData, setFarmData]   = useState([])
  const [farmers, setFarmers]     = useState([])
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      // ── Dashboard summary ──────────────────────────────────────────────
      try {
        const res = await api.get('/admin/dashboard')
        setDashboard(res.data ?? {})
      } catch (err) {
        setError(err.response?.data?.message || err.message)
        console.error('Dashboard API:', err)
      }

      // ── Parallel data fetches ──────────────────────────────────────────
      // NOTE: /admin/milk-production, /admin/farm-status, /admin/doctor-requests
      // are not yet registered in the backend router — they will return 404
      // until implemented. Only /farmers is currently active.
      const results = await Promise.allSettled([
        api.get('/admin/milk-production'),
        api.get('/admin/farm-status'),
        api.get('/farmers'),               // active endpoint
        api.get('/admin/doctor-requests'),
      ])

      const [milk, farm, farmerRes, reqs] = results
      if (milk.status    === 'fulfilled') setMilkData(unwrap(milk.value.data,    'milkData'))
      if (farm.status    === 'fulfilled') setFarmData(unwrap(farm.value.data,    'farmData'))
      if (farmerRes.status === 'fulfilled') setFarmers(unwrap(farmerRes.value.data, 'farmers'))
      if (reqs.status    === 'fulfilled') setRequests(unwrap(reqs.value.data,    'requests'))

      setLoading(false)
    }

    fetchAll()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500">Dairy Management System Overview</p>
        {error   && <p className="mt-1 text-sm text-red-500">Dashboard API: {error}</p>}
        {loading && <p className="mt-1 text-sm text-gray-400">Loading dashboard data…</p>}
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Farmers"    value={dashboard.total_farmers   ?? farmers.length}  subtitle="Registered farmers"                                        icon={Users}      />
        <StatCard title="Milk Production"  value={`${dashboard.total_milk   ?? 0} L`}           subtitle="This month"                                                icon={Milk}       />
        <StatCard title="Doctor Requests"  value={dashboard.doctor_requests ?? requests.length} subtitle={`${dashboard.pending_requests ?? 0} pending requests`}     icon={Stethoscope}/>
        <StatCard title="Active Farms"     value={dashboard.active_farms    ?? 0}               subtitle="Currently active"                                          icon={Activity}   />
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Milk Production Overview</h2>
          {milkData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={milkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" /><YAxis /><Tooltip />
                <Bar dataKey="milk" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No milk data available</p>
          )}
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Farm Status</h2>
          {farmData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={farmData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {farmData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm">No farm data available</p>
          )}
        </div>
      </div>

      {/* ── Lists ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[
          { title: 'Recent Farmers',   data: farmers,  detail: 'village' },
          { title: 'Doctor Requests',  data: requests, detail: 'reason'  },
        ].map(({ title, data, detail }) => (
          <section key={title} className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">{title}</h2>
            {data.length ? data.slice(0, 5).map((item, i) => (
              <div key={item.id ?? i} className="flex justify-between border-b py-3 last:border-0">
                <div>
                  <p className="font-medium">{item.name ?? item.full_name ?? item.farmer_name ?? 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{item[detail] ?? '—'}</p>
                </div>
                <span className="text-sm text-green-600">{item.status ?? 'Pending'}</span>
              </div>
            )) : (
              <p className="text-gray-400 text-sm">No records found</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
