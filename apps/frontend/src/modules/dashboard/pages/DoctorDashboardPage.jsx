import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, ChevronRight, ClipboardList, Clock, RefreshCw, Stethoscope, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../../../components/common/StatCard'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import api from '../../../core/services/api'
import RoutePath from '../../../core/constants/routes.constant'

const REQUEST_STATUS_STYLES = {
  PENDING: 'border-orange-200 bg-orange-50 text-orange-700',
  ACCEPTED: 'border-blue-200 bg-blue-50 text-blue-700',
  REJECTED: 'border-red-200 bg-red-50 text-red-700',
  COMPLETED: 'border-green-200 bg-green-50 text-green-700',
}

const Badge = ({ label, className = '' }) => (
  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${className}`}>
    {label}
  </span>
)

const Section = ({ title, children }) => (
  <section className="rounded-2xl border bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-base font-bold text-gray-800">{title}</h2>
    {children}
  </section>
)

const formatDateTime = (value) => value ? new Date(value).toLocaleString() : '—'
const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString() : '—'

export default function DoctorDashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/doctor/dashboard')
      setDashboard(data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Unable to load the Doctor dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])


  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-gray-500">
        <RefreshCw className="animate-spin text-green-700" size={18} />
        Loading…
      </div>
    )
  }

  if (error) {
    return (
      <div className="m-6 rounded-xl border border-red-200 bg-white p-6 text-sm text-red-600">
        <p className="flex items-center gap-2"><AlertCircle size={16} />{error}</p>
        <button
          type="button"
          onClick={fetchDashboard}
          className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-white"
        >
          Try Again
        </button>
      </div>
    )
  }

  const doctor = dashboard.doctor_profile
  const stats = [
    { title: 'Total Health Requests', value: dashboard.total_health_requests, subtitle: 'Assigned to you', icon: ClipboardList },
    { title: 'Pending Requests', value: dashboard.pending_requests, subtitle: 'Awaiting review', icon: Clock },
    { title: 'Accepted Requests', value: dashboard.accepted_requests, subtitle: 'In progress', icon: Stethoscope },
    { title: 'Rejected Requests', value: dashboard.rejected_requests, subtitle: 'Not accepted', icon: XCircle },
    { title: 'Completed Treatments', value: dashboard.completed_treatments, subtitle: 'Completed requests', icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen bg-[#f7f8f3] p-6 text-gray-800">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {doctor.full_name || 'Doctor'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {[doctor.qualification, doctor.specialization].filter(Boolean).join(' · ') || 'Doctor Dashboard'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDashboard}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-xs font-semibold text-gray-700"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Badge
            label={doctor.is_verified ? 'Approved' : 'Pending approval'}
            className={doctor.is_verified ? 'border-green-200 bg-green-50 text-green-700' : 'border-orange-200 bg-orange-50 text-orange-700'}
          />
        </div>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Recent Health Requests">
            {dashboard.recent_health_requests.length ? (
              <>
                {dashboard.recent_health_requests.map((request) => (
                  <article key={request.id} className="mb-3 rounded-xl border p-4 last:mb-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-gray-800">{request.id.slice(0, 8)}</span>
                          <Badge
                            label={request.status}
                            className={REQUEST_STATUS_STYLES[request.status] || 'border-gray-200 bg-gray-50 text-gray-600'}
                          />
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-800">
                          {request.request_description || 'No request description provided.'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {request.farmer_name || 'Farmer'} · {request.farm_name} · {request.animal_tag}
                          {request.breed ? ` (${request.breed})` : ''}
                        </p>
                        <p className="mt-1 text-[10px] text-gray-400">
                          Requested {formatDateTime(request.requested_at)}
                        </p>
                      </div>
                      <Link
                        to={RoutePath.DOCTOR_REQUESTS}
                        className="shrink-0 rounded-lg border border-green-700 px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-50"
                      >
                        Review <ChevronRight className="inline" size={13} />
                      </Link>
                    </div>
                  </article>
                ))}
                <Link
                  to={RoutePath.DOCTOR_REQUESTS}
                  className="flex items-center justify-center gap-1 py-2 text-xs font-semibold text-green-700"
                >
                  View all requests <ChevronRight size={14} />
                </Link>
              </>
            ) : (
              <TableEmptyState message="No health requests are assigned to you." />
            )}
          </Section>

          <Section title="Recent Treatment Records">
            {dashboard.recent_treatments.length ? dashboard.recent_treatments.map((record) => (
              <article key={record.id} className="mb-3 rounded-xl border p-4 last:mb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {record.animal_tag} · {record.farm_name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {record.farmer_name || 'Farmer'} · Visit {formatDate(record.visit_date)}
                    </p>
                  </div>
                  <Stethoscope size={16} className="text-green-700" />
                </div>
                {record.disease && <p className="mt-2 text-xs text-gray-700"><b>Diagnosis:</b> {record.disease}</p>}
                <p className="mt-1 text-xs text-gray-700"><b>Treatment:</b> {record.treatment}</p>
                {record.doctor_recommendation && (
                  <p className="mt-1 text-xs text-gray-500"><b>Recommendation:</b> {record.doctor_recommendation}</p>
                )}
              </article>
            )) : (
              <TableEmptyState message="No treatment records are available." />
            )}
          </Section>
        </div>

        <div>
          <Section title="My Profile">
            <p className="text-sm font-bold text-gray-800">{doctor.full_name || 'Doctor'}</p>
            <div className="mt-4 space-y-3">
              {[
                ['Qualification', doctor.qualification],
                ['Specialization', doctor.specialization],
                ['Registration No.', doctor.registration_number],
                ['Experience', doctor.experience_years == null ? null : `${doctor.experience_years} years`],
                ['Account Status', doctor.account_status],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2 text-xs">
                  <span className="w-28 shrink-0 font-medium text-gray-400">{label}</span>
                  <span className="text-gray-700">{value ?? '—'}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
