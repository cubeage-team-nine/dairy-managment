import { useCallback, useEffect, useState } from 'react'
import {
  Users, Stethoscope, Clock, CheckCircle, XCircle,
  UserCheck, UserX, Warehouse, PawPrint, Droplets,
  Building2, RefreshCw, AlertCircle,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import StatCard from '../../../components/common/StatCard'
import api from '../../../core/services/api'

const PIE_COLORS = ['#16A34A', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6']

const fmt = (n) => Number(n ?? 0).toLocaleString('en-IN')
const fmtL = (n) => `${Number(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })} L`

// Skeleton placeholder for a single stat card
function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-3 h-3 w-28 rounded bg-gray-200" />
      <div className="h-7 w-16 rounded bg-gray-200" />
      <div className="mt-2 h-2.5 w-20 rounded bg-gray-100" />
    </div>
  )
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/admin/dashboard')
      setDashboard(res.data)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Unable to load the Admin dashboard.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const d = dashboard

  // ── 6 primary stat cards matching the requirements ──────────────────────
  const primaryCards = [
    {
      title: 'Total Farmers',
      value: fmt(d?.total_registered_farmers),
      subtitle: 'Registered farmer accounts',
      icon: Users,
    },
    {
      title: 'Total Doctors',
      value: fmt(d?.total_registered_doctors),
      subtitle: 'Registered doctor accounts',
      icon: Stethoscope,
    },
    {
      title: 'Total Farms',
      value: fmt(d?.total_farms),
      subtitle: 'Registered farms',
      icon: Warehouse,
    },
    {
      title: 'Total Animals',
      value: fmt(d?.total_animals),
      subtitle: 'Active animals on record',
      icon: PawPrint,
    },
    {
      title: 'Milk Production',
      value: fmtL(d?.total_milk_production),
      subtitle: 'Total recorded milk',
      icon: Droplets,
    },
    {
      title: 'Milk Centers',
      value: fmt(d?.total_milk_centers),
      subtitle: 'Registered milk centers',
      icon: Building2,
    },
  ]

  // ── Secondary detail cards ───────────────────────────────────────────────
  const detailCards = [
    { title: 'Active Farmers',   value: fmt(d?.active_farmers),   subtitle: 'Farmer Panel access', icon: UserCheck },
    { title: 'Inactive Farmers', value: fmt(d?.inactive_farmers), subtitle: 'Inactive / suspended', icon: UserX },
    { title: 'Pending Doctors',  value: fmt(d?.pending_doctor_registration_requests), subtitle: 'Awaiting Admin review', icon: Clock },
    { title: 'Approved Doctors', value: fmt(d?.approved_doctors), subtitle: 'Approved registrations', icon: CheckCircle },
    { title: 'Rejected Doctors', value: fmt(d?.rejected_doctors), subtitle: 'Rejected registrations', icon: XCircle },
    { title: 'Admin Users',      value: fmt(d?.total_admin_users), subtitle: 'Admin accounts', icon: Users },
  ]

  const farmerStatusData = [
    { name: 'Active',              value: d?.active_farmers  ?? 0 },
    { name: 'Inactive / Suspended', value: d?.inactive_farmers ?? 0 },
  ]

  const recentSections = [
    {
      title: 'Recent Farmer Registrations',
      records: (d?.recent_farmer_registrations ?? []).map((f) => ({
        id: f.farmer_id,
        name: f.full_name,
        detail: f.village,
        status: f.account_status,
      })),
    },
    {
      title: 'Recent Doctor Registrations',
      records: (d?.recent_doctor_registrations ?? []).map((doc) => ({
        id: doc.doctor_id,
        name: doc.full_name,
        detail: doc.specialization,
        status:
          doc.account_status === 'REJECTED'
            ? 'REJECTED'
            : doc.is_verified
            ? 'APPROVED'
            : 'PENDING',
      })),
    },
  ]

  const statusColor = (s) => {
    if (['REJECTED'].includes(s)) return 'text-red-600'
    if (['INACTIVE', 'SUSPENDED', 'PENDING'].includes(s)) return 'text-amber-600'
    return 'text-green-600'
  }

  const statusLabel = { ACTIVE: 'Active', INACTIVE: 'Inactive', SUSPENDED: 'Suspended', APPROVED: 'Approved', PENDING: 'Pending', REJECTED: 'Rejected' }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">GauVikas Dairy Management – live database statistics</p>
        </div>
        <button
          type="button"
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm hover:border-green-700 hover:text-green-700 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} />
          Dashboard API error: {error}
        </div>
      )}

      {/* ── Primary Stat Cards (6 required KPIs) ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : primaryCards.map((card) => <StatCard key={card.title} {...card} />)}
      </div>

      {/* ── Secondary Detail Cards ──────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {detailCards.map((card) => <StatCard key={card.title} {...card} />)}
        </div>
      )}

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Monthly Milk Production (L)</h2>
            {d?.monthly_milk_production?.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={d.monthly_milk_production}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`${v} L`, 'Milk']} />
                  <Bar dataKey="milk" fill="#16A34A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm py-8 text-center">No milk production data recorded yet</p>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Farmer Account Status</h2>
            {farmerStatusData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={farmerStatusData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {farmerStatusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm py-8 text-center">No farmer accounts yet</p>
            )}
          </div>
        </div>
      )}

      {/* ── Recent Registration Lists ───────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {recentSections.map(({ title, records }) => (
            <section key={title} className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">{title}</h2>
              {records.length ? (
                records.map((item) => (
                  <div key={item.id} className="flex justify-between border-b py-3 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{item.detail ?? '—'}</p>
                    </div>
                    <span className={`text-xs font-medium ${statusColor(item.status)}`}>
                      {statusLabel[item.status] ?? item.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm py-4 text-center">No records found</p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
