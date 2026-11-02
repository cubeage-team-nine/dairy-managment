import { useEffect, useMemo, useState } from 'react'
import { Stethoscope, ClipboardList, CheckCircle, Clock, Bell, Activity, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../../../components/common/StatCard'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import api from '../../../core/services/api'
import RoutePath from '../../../core/constants/routes.constant'
import {
  INITIAL_REQUESTS, NOTIFICATIONS_DATA, DOCTOR_PROFILE,
  REQUEST_STATUS, PRIORITY_STYLES,
  ASSIGNED_ANIMALS, TODAY_APPOINTMENTS, ANIMAL_STATUS_STYLE,
} from '../../doctor-requests/doctor-requests.constants'

/* ── tiny shared helpers ─────────────────────────────────────────────────── */
const Badge = ({ label, cls }) => <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${cls}`}>{label}</span>
const Sec   = ({ title, linkTo, children }) => (
  <section className="rounded-2xl border bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-bold text-gray-800">{title}</h2>
      {linkTo && <Link to={linkTo} className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900">View All <ChevronRight size={14}/></Link>}
    </div>
    {children}
  </section>
)
const More = ({ count, to }) => count > 0
  ? <Link to={to} className="flex items-center justify-center gap-1 py-2 text-xs font-semibold text-green-700">+{count} more <ChevronRight size={14}/></Link>
  : null

export default function DoctorDashboardPage() {
  const [requests]      = useState(INITIAL_REQUESTS)
  const [notifications] = useState(NOTIFICATIONS_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [page, setPage]       = useState(1)
  const pageSize = 4

  useEffect(() => {
    let alive = true
    setLoading(true)
    api.get('/doctor/dashboard')
      .catch(() => {})   // backend not ready — fall back to sample data
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  const newReqs    = useMemo(() => requests.filter(r => r.status === REQUEST_STATUS.NEW),        [requests])
  const inProgress = useMemo(() => requests.filter(r => r.status === REQUEST_STATUS.IN_PROGRESS),[requests])
  const completed  = useMemo(() => requests.filter(r => r.status === REQUEST_STATUS.COMPLETED),  [requests])
  const unread     = notifications.filter(n => n.unread).length
  const todayDone  = TODAY_APPOINTMENTS.filter(a => a.done).length
  const animalRows = ASSIGNED_ANIMALS.slice((page - 1) * pageSize, page * pageSize)

  const stats = [
    { title:'Pending Requests', value:newReqs.length,    subtitle:'Awaiting review',          icon:ClipboardList },
    { title:'In Progress',      value:inProgress.length, subtitle:'Active treatments',        icon:Activity      },
    { title:'Completed',        value:completed.length,  subtitle:'Cases resolved',           icon:CheckCircle   },
    { title:"Today's Visits",   value:`${todayDone}/${TODAY_APPOINTMENTS.length}`, subtitle:'Appointments', icon:Clock },
  ]

  if (loading) return <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-gray-500"><RefreshCw className="animate-spin text-green-700" size={18}/>Loading…</div>
  if (error)   return <div className="m-6 rounded-xl border border-red-200 bg-white p-6 text-sm text-red-600 flex items-center gap-2"><AlertCircle size={16}/>{error}</div>

  return (
    <div className="min-h-screen bg-[#f7f8f3] p-6 text-gray-800">

      {/* Greeting */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {DOCTOR_PROFILE.name} 👋</h1>
          <p className="mt-0.5 text-sm text-gray-500">{DOCTOR_PROFILE.title} · {DOCTOR_PROFILE.hospital}</p>
        </div>
        <div className="flex items-center gap-3">
          {unread > 0 && <div className="flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700"><Bell size={14}/>{unread} new notification{unread > 1 ? 's' : ''}</div>}
          <Badge label={DOCTOR_PROFILE.status} cls="border-green-200 bg-green-50 text-green-700"/>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(s => <StatCard key={s.title} {...s}/>)}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">

        {/* ── LEFT: 2/3 ── */}
        <div className="space-y-6 xl:col-span-2">

          {/* Pending Requests */}
          <Sec title={`Pending Health Requests (${newReqs.length})`} linkTo={RoutePath.DOCTOR_REQUESTS}>
            {newReqs.length ? <>
              {newReqs.slice(0, 4).map(r => { const p = PRIORITY_STYLES[r.priority]; return (
                <div key={r.id} className="mb-3 flex flex-wrap items-start justify-between gap-3 rounded-xl border p-4 hover:bg-gray-50">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-gray-800">{r.id}</span><Badge label={r.priority} cls={`${p.bg} ${p.text} ${p.border}`}/></div>
                    <p className="mt-1 text-sm font-medium text-gray-800">{r.issueDescription}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{r.farmerName} · {r.farmName} · {r.animalId}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">{r.createdAt}</p>
                  </div>
                  <Link to={RoutePath.DOCTOR_REQUESTS} className="shrink-0 rounded-lg border border-green-700 px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-50">Review</Link>
                </div>
              )})}
              <More count={newReqs.length - 4} to={RoutePath.DOCTOR_REQUESTS}/>
            </> : <TableEmptyState message="No pending health requests."/>}
          </Sec>

          {/* Assigned Animals */}
          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4 text-base font-bold text-gray-800">Assigned Animals ({ASSIGNED_ANIMALS.length})</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[11px] font-medium text-gray-500">
                  <tr>{['ANIMAL TAG','BREED','FARM','ISSUE','STATUS'].map(h => <th key={h} className="whitespace-nowrap px-5 py-3">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {animalRows.map(a => (
                    <tr key={a.id} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-3 text-xs font-bold text-green-800">{a.tag}</td>
                      <td className="px-5 py-3 text-xs text-gray-600">{a.breed}</td>
                      <td className="px-5 py-3 text-xs text-gray-600">{a.farm}</td>
                      <td className="px-5 py-3 text-xs text-gray-600">{a.issue}</td>
                      <td className="px-5 py-3"><Badge label={a.status} cls={ANIMAL_STATUS_STYLE[a.status] ?? 'bg-gray-100 text-gray-500 border-gray-200'}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!animalRows.length && <TableEmptyState message="No assigned animals."/>}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-xs text-gray-500">
              <span>Showing {ASSIGNED_ANIMALS.length ? (page-1)*pageSize+1 : 0}–{Math.min(page*pageSize, ASSIGNED_ANIMALS.length)} of {ASSIGNED_ANIMALS.length}</span>
              <TablePagination page={page} pageSize={pageSize} total={ASSIGNED_ANIMALS.length} onPageChange={setPage}/>
            </div>
          </section>

          {/* Treatment Records */}
          <Sec title={`Active Treatment Records (${inProgress.length})`} linkTo={RoutePath.DOCTOR_REQUESTS}>
            {inProgress.length ? <>
              {inProgress.slice(0, 4).map(r => (
                <div key={r.id} className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5">
                  <div>
                    <div className="flex items-center gap-2"><span className="text-xs font-bold text-gray-700">{r.id}</span><span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{r.inProgressStage}</span></div>
                    <p className="mt-0.5 text-xs text-gray-600">{r.issueDescription}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">{r.farmerName} · {r.animalId} · {r.createdAt}</p>
                  </div>
                  <Stethoscope size={16} className="shrink-0 text-green-700"/>
                </div>
              ))}
              <More count={inProgress.length - 4} to={RoutePath.DOCTOR_REQUESTS}/>
            </> : <TableEmptyState message="No active treatments."/>}
          </Sec>
        </div>

        {/* ── RIGHT: 1/3 ── */}
        <div className="space-y-6">

          {/* Profile */}
          <Sec title="My Profile">
            <div className="flex items-center gap-3">
              <img src={DOCTOR_PROFILE.avatarUrl} alt={DOCTOR_PROFILE.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-green-200"/>
              <div>
                <p className="text-sm font-bold text-gray-800">{DOCTOR_PROFILE.name}</p>
                <p className="text-xs text-gray-500">{DOCTOR_PROFILE.title}</p>
                <Badge label={DOCTOR_PROFILE.status} cls="mt-1 border-green-200 bg-green-50 text-green-700"/>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[['Qualification',DOCTOR_PROFILE.qualification],['Reg. No.',DOCTOR_PROFILE.registrationNo],['Experience',DOCTOR_PROFILE.experience],['Hospital',DOCTOR_PROFILE.hospital]].map(([k,v]) => (
                <div key={k} className="flex gap-2 text-xs"><span className="w-24 shrink-0 font-medium text-gray-400">{k}</span><span className="text-gray-700">{v}</span></div>
              ))}
            </div>
          </Sec>

          {/* Appointments */}
          <Sec title="Today's Appointments">
            {TODAY_APPOINTMENTS.map(a => (
              <div key={a.id} className={`mb-3 flex items-start gap-3 rounded-xl border p-3 ${a.done ? 'opacity-50' : ''}`}>
                <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${a.done ? 'bg-green-500' : 'bg-orange-400'}`}/>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800">{a.time} · {a.farm}</p>
                  <p className="text-[10px] text-gray-500">{a.animal}</p>
                  <p className="text-[10px] text-gray-400">{a.purpose}</p>
                </div>
                {a.done && <span className="ml-auto text-[10px] font-bold text-green-600">Done</span>}
              </div>
            ))}
            <p className="mt-1 text-center text-xs text-gray-400">{todayDone}/{TODAY_APPOINTMENTS.length} completed today</p>
          </Sec>

          {/* Notifications */}
          <Sec title="Notifications">
            {notifications.map(n => (
              <div key={n.id} className={`relative mb-3 rounded-xl border p-3 ${n.unread ? 'border-orange-100 bg-orange-50/50' : ''}`}>
                {n.unread && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-orange-500"/>}
                <p className="pr-4 text-xs font-semibold text-gray-800">{n.title}</p>
                <p className="mt-0.5 text-[10px] text-gray-500">{n.description}</p>
                <p className="mt-1 text-[10px] text-gray-400">{n.time}</p>
              </div>
            ))}
          </Sec>
        </div>
      </div>
    </div>
  )
}
