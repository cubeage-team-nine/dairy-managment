import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search, SlidersHorizontal, MoreHorizontal,
  Stethoscope, UserCheck, UserX, Clock,
  CheckCircle, XCircle, RefreshCw, AlertCircle,
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import {
  getAdminDoctors,
  approveDoctor,
  rejectDoctor,
} from '../doctors.service'

/* ─── constants ─────────────────────────────────────────────────────────── */
const BADGE = {
  APPROVED: 'bg-green-50  text-green-700  border-green-200',
  PENDING:  'bg-orange-50 text-orange-600 border-orange-200',
  REJECTED: 'bg-red-50    text-red-600    border-red-200',
  INACTIVE: 'bg-gray-100  text-gray-500   border-gray-200',
}

const StatusBadge = ({ state }) => (
  <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-semibold ${BADGE[state] ?? BADGE.INACTIVE}`}>
    {state === 'APPROVED' ? 'Approved' : state === 'PENDING' ? 'Pending' : state === 'REJECTED' ? 'Rejected' : state}
  </span>
)

const SkeletonRow = () => (
  <tr className="border-t animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3 rounded bg-gray-200 w-24" />
      </td>
    ))}
  </tr>
)

/* ─── Pending card ───────────────────────────────────────────────────────── */
const PendingCard = ({ d, onApprove, onReject, onView, busy }) => (
  <div className="flex flex-col gap-3 rounded-xl border border-orange-100 bg-orange-50/40 p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
          {(d.first_name?.[0] ?? '?')}{(d.last_name?.[0] ?? '')}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Dr. {d.first_name} {d.last_name}
          </p>
          <p className="text-xs text-gray-500">{d.specialization ?? '—'}</p>
        </div>
      </div>
      <StatusBadge state="PENDING" />
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
      <span><b>Qualification:</b> {d.qualification ?? '—'}</span>
      <span><b>Reg. No.:</b> {d.registration_number ?? '—'}</span>
      <span><b>Experience:</b> {d.experience_years != null ? `${d.experience_years} yrs` : '—'}</span>
      {d.email    && <span><b>Email:</b> {d.email}</span>}
      {d.mobile_number && <span><b>Mobile:</b> {d.mobile_number}</span>}
    </div>
    <div className="flex flex-wrap items-center gap-2 border-t border-orange-100 pt-3">
      <button
        type="button"
        disabled={busy}
        onClick={() => onApprove(d.doctor_id)}
        className="flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
      >
        <CheckCircle size={14} /> Approve
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onReject(d.doctor_id)}
        className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        <XCircle size={14} /> Reject
      </button>
      <button
        type="button"
        onClick={() => onView(d)}
        className="ml-auto text-xs text-green-700 underline hover:text-green-900"
      >
        View Details
      </button>
    </div>
  </div>
)

/* ─── page ───────────────────────────────────────────────────────────────── */
export default function DoctorsPage() {
  const [doctors, setDoctors]   = useState([])
  const [total, setTotal]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]         = useState(1)
  const pageSize                = 10

  const [search, setSearch]           = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filter, setFilter]           = useState('All')
  const [showFilter, setShowFilter]   = useState(false)

  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy]               = useState(false)

  const [modal, setModal]     = useState('')   // '' | 'view'
  const [selected, setSelected] = useState(null)
  const [menu, setMenu]       = useState(null)

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const loadDoctors = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, page_size: pageSize }
      const { data } = await getAdminDoctors(params)
      setDoctors(data.items ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(data.total_pages ?? 1)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load doctors.')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { loadDoctors() }, [loadDoctors])

  /* ── derived ────────────────────────────────────────────────────────── */
  const pending  = useMemo(() => doctors.filter((d) => d.registration_state === 'PENDING'), [doctors])
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    return doctors.filter((d) => {
      const matchSearch = !q || `${d.full_name} ${d.specialization} ${d.registration_number} ${d.mobile_number}`.toLowerCase().includes(q)
      const matchFilter = filter === 'All'
        || (filter === 'PENDING'   && d.registration_state === 'PENDING')
        || (filter === 'APPROVED'  && d.registration_state === 'APPROVED')
        || (filter === 'REJECTED'  && d.registration_state === 'REJECTED')
      return matchSearch && matchFilter && d.registration_state !== 'PENDING'
    })
  }, [doctors, debouncedSearch, filter])

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)

  /* ── actions ────────────────────────────────────────────────────────── */
  const handleApprove = async (doctorId) => {
    setBusy(true)
    setActionError('')
    try {
      await approveDoctor(doctorId)
      await loadDoctors()
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Approval failed.')
    } finally {
      setBusy(false)
    }
  }

  const handleReject = async (doctorId) => {
    if (!window.confirm('Reject this doctor registration?')) return
    setBusy(true)
    setActionError('')
    try {
      await rejectDoctor(doctorId)
      await loadDoctors()
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Rejection failed.')
    } finally {
      setBusy(false)
    }
  }

  /* ── stats ──────────────────────────────────────────────────────────── */
  const countState = (s) => doctors.filter((d) => d.registration_state === s).length

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-gray-800">
      <main className="p-8 space-y-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Doctor Management</h1>
            <p className="text-gray-500 mt-1">Manage veterinary doctors and registration approvals.</p>
          </div>
          <button
            type="button"
            onClick={loadDoctors}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-medium hover:border-green-700 hover:text-green-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard title="Total Doctors"    value={total}                subtitle="All registered doctors"    icon={Stethoscope} />
          <StatCard title="Pending Requests" value={countState('PENDING')} subtitle="Awaiting approval"        icon={Clock}       />
          <StatCard title="Approved Doctors" value={countState('APPROVED')} subtitle="Approved & active"       icon={UserCheck}   />
          <StatCard title="Rejected"         value={countState('REJECTED')} subtitle="Registration rejected"   icon={UserX}       />
        </div>

        {/* ── Errors ───────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {actionError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} /> {actionError}
          </div>
        )}

        {/* ── Pending Approval Cards ────────────────────────────────────── */}
        {!loading && pending.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-semibold">Pending Verification Requests</h2>
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                {pending.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pending.map((d) => (
                <PendingCard
                  key={d.doctor_id}
                  d={d}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onView={(doc) => { setSelected(doc); setModal('view') }}
                  busy={busy}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-[360px]">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, specialization, reg no..."
              className="w-full bg-white border rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700"
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilter((v) => !v)}
              className="bg-white border rounded-xl px-5 py-3 flex items-center gap-2 font-medium text-sm"
            >
              <SlidersHorizontal size={17} /> Filters
              {filter !== 'All' && <span className="h-2 w-2 rounded-full bg-green-700" />}
            </button>
            {showFilter && (
              <div className="absolute z-10 top-14 left-0 bg-white border rounded-xl shadow-lg w-40 p-2">
                {['All', 'APPROVED', 'REJECTED'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setFilter(s); setShowFilter(false); setPage(1) }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-green-50 ${filter === s ? 'font-semibold text-green-800' : ''}`}
                  >
                    {s === 'All' ? 'All' : s === 'APPROVED' ? 'Approved' : 'Rejected'}
                  </button>
                ))}
              </div>
            )}
          </div>
          {filter !== 'All' && (
            <button type="button" onClick={() => { setFilter('All'); setPage(1) }}
              className="text-xs text-gray-400 hover:text-gray-700 underline">
              Clear filter
            </button>
          )}
          <span className="ml-auto text-xs text-gray-500">{filtered.length} records</span>
        </div>

        {/* ── Onboarded Doctors Table ───────────────────────────────────── */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Onboarded Doctors</h2>
          <div className="bg-white border rounded-2xl overflow-visible shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-[11px]">
                  <tr>
                    {['DOCTOR', 'MOBILE', 'QUALIFICATION', 'SPECIALIZATION', 'REG. NUMBER', 'EXPERIENCE', 'REGISTRATION', 'AVAILABILITY', ''].map((h) => (
                      <th key={h} className="px-5 py-4 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                    : rows.map((d) => (
                      <tr key={d.doctor_id} className="border-t hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
                              {(d.first_name?.[0] ?? '?')}{(d.last_name?.[0] ?? '')}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800">
                                {d.full_name ?? `${d.first_name} ${d.last_name ?? ''}`.trim()}
                              </p>
                              {d.email && <p className="text-[10px] text-gray-400">{d.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-600">{d.mobile_number}</td>
                        <td className="px-5 py-4 text-xs text-gray-600">{d.qualification ?? '—'}</td>
                        <td className="px-5 py-4 text-xs text-gray-600">{d.specialization ?? '—'}</td>
                        <td className="px-5 py-4 text-xs font-medium text-green-800">{d.registration_number ?? '—'}</td>
                        <td className="px-5 py-4 text-xs text-gray-600">
                          {d.experience_years != null ? `${d.experience_years} yrs` : '—'}
                        </td>
                        <td className="px-5 py-4"><StatusBadge state={d.registration_state} /></td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${d.is_available ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${d.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
                            {d.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-5 py-4 relative">
                          <button
                            type="button"
                            onClick={() => setMenu(menu === d.doctor_id ? null : d.doctor_id)}
                            className="text-gray-400 hover:text-gray-700"
                          >
                            <MoreHorizontal size={20} />
                          </button>
                          {menu === d.doctor_id && (
                            <div className="absolute right-8 top-10 z-20 bg-white shadow-lg border rounded-xl w-36 p-1">
                              <button
                                type="button"
                                onClick={() => { setSelected(d); setModal('view'); setMenu(null) }}
                                className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-gray-50"
                              >
                                View Profile
                              </button>
                              {d.registration_state === 'PENDING' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => { handleApprove(d.doctor_id); setMenu(null) }}
                                    className="w-full text-left text-xs px-3 py-2 rounded-lg text-green-700 hover:bg-green-50 disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => { handleReject(d.doctor_id); setMenu(null) }}
                                    className="w-full text-left text-xs px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {!loading && !rows.length && (
              <TableEmptyState message="No doctors found." />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-xs text-gray-500">
              <span>
                Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} –{' '}
                {Math.min(page * pageSize, filtered.length)} of {filtered.length} doctors
              </span>
              <TablePagination
                page={page}
                pageSize={pageSize}
                total={filtered.length}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ── View Profile Modal ───────────────────────────────────────────── */}
      <CommonModal isOpen={modal === 'view'} onClose={() => { setModal(''); setSelected(null) }} title="Doctor Profile">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-green-50 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-800 text-xl font-bold text-white">
                {(selected.first_name?.[0] ?? '?')}{(selected.last_name?.[0] ?? '')}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">
                  Dr. {selected.first_name} {selected.last_name}
                </p>
                <p className="text-sm text-gray-500">{selected.specialization ?? '—'}</p>
                <div className="mt-1"><StatusBadge state={selected.registration_state} /></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['Qualification',   selected.qualification ?? '—'],
                ['Registration No.',selected.registration_number ?? '—'],
                ['Experience',      selected.experience_years != null ? `${selected.experience_years} years` : '—'],
                ['Specialization',  selected.specialization ?? '—'],
                ['Availability',    selected.is_available ? 'Available' : 'Unavailable'],
                ['Mobile',          selected.mobile_number ?? '—'],
                ['Email',           selected.email ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border bg-gray-50 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">{value}</p>
                </div>
              ))}
            </div>

            {selected.registration_state === 'PENDING' && (
              <div className="flex gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { handleApprove(selected.doctor_id); setModal('') }}
                  className="flex-1 rounded-lg bg-green-700 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  Approve & Activate
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { handleReject(selected.doctor_id); setModal('') }}
                  className="flex-1 rounded-lg border border-red-300 bg-white py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}

            <div className="flex justify-end border-t pt-4">
              <button
                type="button"
                onClick={() => { setModal(''); setSelected(null) }}
                className="rounded-lg border px-5 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </CommonModal>
    </div>
  )
}
