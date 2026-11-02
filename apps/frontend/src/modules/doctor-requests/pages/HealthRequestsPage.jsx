import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, SlidersHorizontal, MapPin, ClipboardList, CheckCircle, AlertTriangle, Stethoscope, MoreVertical } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import api from '../../../core/services/api'
import {
  HEALTH_REQUESTS, HR_STATUS, HR_PRIORITY,
  HR_STATUS_STYLE, HR_PRIORITY_STYLE,
} from '../doctor-requests.constants'
import { acceptRequest, rejectRequest, completeRequest } from '../doctor-requests.service'

/* ── cow filter ──────────────────────────────────────────────────────────── */
// Determines whether a request is cow-related based on animal type + breed.
// Buffaloes, goats, sheep, etc. are excluded.
const COW_TYPES   = ['cow', 'heifer', 'calf']
const COW_BREEDS  = ['gir', 'hf', 'holstein', 'jersey', 'sahiwal', 'red sindhi', 'kankrej', 'tharparkar', 'rathi', 'ongole', 'hariana', 'deoni', 'dangi', 'khillari', 'gaolao', 'nimari', 'punganur', 'vechur', 'belahi', 'mewati', 'crossbreed', 'cross']

const isCow = r => {
  const type  = (r.animal?.type  ?? '').toLowerCase()
  const breed = (r.animal?.breed ?? '').toLowerCase()
  return COW_TYPES.some(t => type.includes(t)) ||
    COW_BREEDS.some(b => breed.includes(b))
}

/* ── helpers ─────────────────────────────────────────────────────────────── */
const inp   = 'w-full border rounded-lg p-3 text-sm outline-none focus:border-green-700'
const Badge = ({ label, cls }) => (
  <span className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-semibold ${cls}`}>{label}</span>
)
const Field = ({ label, value }) => (
  <div className="rounded-lg border bg-gray-50 p-3">
    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-0.5 text-sm font-semibold text-gray-700">{value || '—'}</p>
  </div>
)

/* ── three-dot action menu ───────────────────────────────────────────────── */
function RequestActionMenu({ request, onView, onAccept, onReject, onComplete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { status } = request

  const actions = [
    { label: 'View Details', fn: onView, cls: '' },
    ...(status === HR_STATUS.PENDING ? [
      { label: 'Accept Request', fn: onAccept, cls: 'text-green-700 hover:bg-green-50' },
      { label: 'Reject Request', fn: onReject, cls: 'text-red-600 hover:bg-red-50'   },
    ] : []),
    ...(status === HR_STATUS.ACCEPTED ? [
      { label: 'Complete Request', fn: onComplete, cls: 'text-blue-700 hover:bg-blue-50' },
    ] : []),
    ...(status === HR_STATUS.COMPLETED ? [
      { label: 'View Treatment Record', fn: onView, cls: '' },
    ] : []),
    ...(status === HR_STATUS.REJECTED ? [
      { label: 'View Rejection Reason', fn: onView, cls: '' },
    ] : []),
  ]

  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        aria-label="Actions"
      >
        <MoreVertical size={17} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-30 min-w-[170px] rounded-xl border bg-white py-1 shadow-lg">
          {actions.map(({ label, fn, cls }) => (
            <button
              key={label}
              type="button"
              onClick={() => { setOpen(false); fn() }}
              className={`w-full px-4 py-2.5 text-left text-xs font-medium hover:bg-gray-50 ${cls}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── page ────────────────────────────────────────────────────────────────── */
export default function HealthRequestsPage() {
  const [requests, setRequests]   = useState(HEALTH_REQUESTS)
  const [search, setSearch]       = useState('')
  const [fStatus, setFStatus]     = useState('All')
  const [fPriority, setFPriority] = useState('All')
  const [fBreed, setFBreed]       = useState('All')
  const [fVillage, setFVillage]   = useState('All')
  const [fDistrict, setFDistrict] = useState('All')
  const [showFilter, setShowFilter] = useState(false)
  const [modal, setModal]         = useState('')   // '' | 'view' | 'reject' | 'complete'
  const [selected, setSelected]   = useState(null)
  const [rejectReason, setRejectReason]     = useState('')
  const [treatmentNotes, setTreatmentNotes] = useState('')
  const [page, setPage]           = useState(1)
  const pageSize = 7

  // Fetch from backend — filter cow-type at API level once backend supports it
  useEffect(() => {
    api.get('/doctor/health-requests?animal_type=cow')
      .then(res => {
        const data = res.data?.data ?? res.data
        if (Array.isArray(data)) setRequests(data)
      })
      .catch(() => {}) // backend not ready — fall back to sample data
  }, [])

  /* ── derived ─────────────────────────────────────────────────────────── */
  // Apply cow-only filter first, then user filters
  const cowRequests = useMemo(() => requests.filter(isCow), [requests])

  const breeds   = useMemo(() => ['All', ...new Set(cowRequests.map(r => r.animal.breed).filter(Boolean))], [cowRequests])
  const villages = useMemo(() => ['All', ...new Set(cowRequests.map(r => r.farmer.location.village))], [cowRequests])
  const districts= useMemo(() => ['All', ...new Set(cowRequests.map(r => r.farmer.location.district))], [cowRequests])

  const filtered = useMemo(() => cowRequests.filter(r => {
    const q   = search.toLowerCase()
    const loc = r.farmer.location
    const matchQ = !q ||
      r.id.toLowerCase().includes(q) ||
      r.animal.name.toLowerCase().includes(q) ||
      r.animal.tag.toLowerCase().includes(q) ||
      r.farmer.name.toLowerCase().includes(q) ||
      r.issue.toLowerCase().includes(q) ||
      loc.village.toLowerCase().includes(q) ||
      loc.taluka.toLowerCase().includes(q) ||
      loc.district.toLowerCase().includes(q)
    return matchQ &&
      (fStatus   === 'All' || r.status          === fStatus)   &&
      (fPriority === 'All' || r.priority        === fPriority) &&
      (fBreed    === 'All' || r.animal.breed    === fBreed)    &&
      (fVillage  === 'All' || loc.village       === fVillage)  &&
      (fDistrict === 'All' || loc.district      === fDistrict)
  }), [cowRequests, search, fStatus, fPriority, fBreed, fVillage, fDistrict])

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const hasFilters = fStatus !== 'All' || fPriority !== 'All' || fBreed !== 'All' || fVillage !== 'All' || fDistrict !== 'All' || search !== ''
  const clear = () => { setFStatus('All'); setFPriority('All'); setFBreed('All'); setFVillage('All'); setFDistrict('All'); setSearch(''); setPage(1) }

  const count = s => cowRequests.filter(r => r.status === s).length
  const emrg  = cowRequests.filter(r => r.priority === HR_PRIORITY.EMERGENCY && r.status === HR_STATUS.PENDING).length

  const stats = [
    { title: 'Total Requests', value: cowRequests.length,          subtitle: 'Cow health requests',    icon: ClipboardList },
    { title: 'Pending',        value: count(HR_STATUS.PENDING),    subtitle: 'Awaiting your review',   icon: AlertTriangle },
    { title: 'Accepted',       value: count(HR_STATUS.ACCEPTED),   subtitle: 'Under active care',      icon: Stethoscope   },
    { title: 'Emergency',      value: emrg,                        subtitle: 'Urgent pending cases',   icon: AlertTriangle },
    { title: 'Completed',      value: count(HR_STATUS.COMPLETED),  subtitle: 'Cases resolved',         icon: CheckCircle   },
  ]

  /* ── action handlers ─────────────────────────────────────────────────── */
  const update = (id, patch) => setRequests(old => old.map(r => r.id === id ? { ...r, ...patch } : r))

  const handleAccept = useCallback(async id => {
    try { await acceptRequest(id) } catch {}
    update(id, { status: HR_STATUS.ACCEPTED })
    close()
  }, [])

  const handleReject = useCallback(async () => {
    if (!rejectReason.trim()) return
    try { await rejectRequest(selected.id, rejectReason) } catch {}
    update(selected.id, { status: HR_STATUS.REJECTED, rejectionReason: rejectReason })
    setRejectReason(''); close()
  }, [selected, rejectReason])

  const handleComplete = useCallback(async () => {
    try { await completeRequest(selected.id, treatmentNotes) } catch {}
    update(selected.id, { status: HR_STATUS.COMPLETED, treatmentNotes, completedDate: new Date().toLocaleDateString('en-GB') })
    setTreatmentNotes(''); close()
  }, [selected, treatmentNotes])

  const open  = (m, r) => { setSelected(r); setModal(m) }
  const close = ()     => { setModal(''); setSelected(null); setRejectReason(''); setTreatmentNotes('') }

  const Chip = ({ label, active, onClick }) => (
    <button type="button" onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${active ? 'border-green-700 bg-green-700 text-white' : 'hover:border-green-600 hover:text-green-700'}`}>
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#f7f8f3] p-6 text-gray-800">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Cow health requests submitted by farmers.{' '}
            <span className="font-semibold text-green-700">{cowRequests.length} total</span>
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 text-gray-400" size={17} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by animal, farmer, village or request ID..."
            className="w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700" />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <button type="button" onClick={() => setShowFilter(v => !v)}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium hover:border-green-700">
            <SlidersHorizontal size={16} /> Filters
            {hasFilters && <span className="h-2 w-2 rounded-full bg-green-700" />}
          </button>

          {showFilter && (
            <div className="absolute left-0 top-12 z-20 w-72 space-y-4 rounded-2xl border bg-white p-5 shadow-xl">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {['All', ...Object.values(HR_STATUS)].map(s =>
                    <Chip key={s} label={s} active={fStatus === s} onClick={() => { setFStatus(s); setPage(1) }} />)}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Priority</p>
                <div className="flex flex-wrap gap-1.5">
                  {['All', ...Object.values(HR_PRIORITY)].map(p =>
                    <Chip key={p} label={p} active={fPriority === p} onClick={() => { setFPriority(p); setPage(1) }} />)}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Cow Breed</p>
                <select value={fBreed} onChange={e => { setFBreed(e.target.value); setPage(1) }}
                  className="w-full rounded-lg border p-2 text-xs outline-none focus:border-green-700">
                  {breeds.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Village</p>
                <select value={fVillage} onChange={e => { setFVillage(e.target.value); setPage(1) }}
                  className="w-full rounded-lg border p-2 text-xs outline-none focus:border-green-700">
                  {villages.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">District</p>
                <select value={fDistrict} onChange={e => { setFDistrict(e.target.value); setPage(1) }}
                  className="w-full rounded-lg border p-2 text-xs outline-none focus:border-green-700">
                  {districts.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <button type="button" onClick={() => { clear(); setShowFilter(false) }}
                className="w-full rounded-lg border py-2 text-xs font-medium text-gray-500 hover:bg-gray-50">
                Reset Filters
              </button>
            </div>
          )}
        </div>
        {hasFilters && <button type="button" onClick={clear} className="text-xs text-gray-400 underline hover:text-gray-700">Clear all</button>}
        <span className="ml-auto text-xs text-gray-500">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="overflow-visible rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[11px] font-medium text-gray-500">
              <tr>
                {['REQ ID', 'FARMER', 'COW', 'LOCATION', 'ISSUE', 'PRIORITY', 'STATUS', 'DATE', 'ACTIONS'].map(h =>
                  <th key={h} className="whitespace-nowrap px-4 py-4">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const loc = r.farmer.location
                return (
                  <tr key={r.id} className="border-t transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-bold text-green-800">{r.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-800">{r.farmer.name}</p>
                      <p className="text-[10px] text-gray-400">{r.farmer.farm}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-800">{r.animal.name}</p>
                      <p className="text-[10px] text-gray-400">{r.animal.tag} · {r.animal.breed}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-1">
                        <MapPin size={11} className="mt-0.5 shrink-0 text-green-600" />
                        <div className="text-[10px] leading-tight text-gray-600">
                          <p className="font-semibold">{loc.village}</p>
                          <p>{loc.taluka} · {loc.district}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[150px] truncate px-4 py-3 text-xs text-gray-600">{r.issue}</td>
                    <td className="px-4 py-3"><Badge label={r.priority} cls={HR_PRIORITY_STYLE[r.priority] ?? ''} /></td>
                    <td className="px-4 py-3"><Badge label={r.status}   cls={HR_STATUS_STYLE[r.status]     ?? ''} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{r.date}</td>
                    <td className="px-4 py-3">
                      <RequestActionMenu
                        request={r}
                        onView={() => open('view', r)}
                        onAccept={() => handleAccept(r.id)}
                        onReject={() => open('reject', r)}
                        onComplete={() => open('complete', r)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!rows.length && <TableEmptyState message="No cow health requests found." />}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-xs text-gray-500">
          <span>
            Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} records
          </span>
          <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      <CommonModal isOpen={modal === 'view'} onClose={close} title="Health Request Details">
        {selected && (() => {
          const { id, date, animal, farmer, issue, symptoms, duration, prevTreatment, notes, priority, status, rejectionReason, treatmentNotes: tn } = selected
          const loc = farmer.location
          return (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-500">{id}</span>
                <Badge label={status}   cls={HR_STATUS_STYLE[status]     ?? ''} />
                <Badge label={priority} cls={HR_PRIORITY_STYLE[priority] ?? ''} />
                <span className="ml-auto text-xs text-gray-400">{date}</span>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Farmer Information</p>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Farmer Name" value={farmer.name} />
                  <Field label="Mobile"      value={farmer.mobile} />
                  <Field label="Email"       value={farmer.email} />
                  <Field label="Farm"        value={farmer.farm} />
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                  <MapPin size={11} className="text-green-600" /> Location
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Village"  value={loc.village} />
                  <Field label="Taluka"   value={loc.taluka} />
                  <Field label="District" value={loc.district} />
                  <Field label="State"    value={loc.state} />
                  <Field label="PIN Code" value={loc.pincode} />
                  <Field label="Address"  value={loc.address} />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Cow Information</p>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Name"   value={animal.name} />
                  <Field label="Tag"    value={animal.tag} />
                  <Field label="Type"   value={animal.type} />
                  <Field label="Breed"  value={animal.breed} />
                  <Field label="Age"    value={animal.age} />
                  <Field label="Gender" value={animal.gender} />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Health Information</p>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Health Issue"       value={issue} />
                  <Field label="Duration"           value={duration} />
                  <Field label="Previous Treatment" value={prevTreatment} />
                  <Field label="Additional Notes"   value={notes} />
                </div>
                <div className="mt-2 rounded-lg border bg-gray-50 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Symptoms</p>
                  <p className="mt-1 text-sm text-gray-700">{symptoms}</p>
                </div>
              </div>

              {rejectionReason && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-[10px] font-bold uppercase text-red-500">Rejection Reason</p>
                  <p className="mt-1 text-xs text-red-700">{rejectionReason}</p>
                </div>
              )}
              {tn && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-[10px] font-bold uppercase text-green-600">Treatment Notes</p>
                  <p className="mt-1 text-xs text-green-800">{tn}</p>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
                {status === HR_STATUS.PENDING && <>
                  <button type="button" onClick={() => handleAccept(id)}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
                    Accept
                  </button>
                  <button type="button" onClick={() => setModal('reject')}
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                    Reject
                  </button>
                </>}
                {status === HR_STATUS.ACCEPTED && (
                  <button type="button" onClick={() => setModal('complete')}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Mark Complete
                  </button>
                )}
                <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Close</button>
              </div>
            </div>
          )
        })()}
      </CommonModal>

      {/* REJECT MODAL */}
      <CommonModal isOpen={modal === 'reject'} onClose={close} title="Reject Health Request">
        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-700">{selected.id} · {selected.farmer.name} · {selected.animal.name}</p>
              <p className="mt-1 text-xs text-red-600">{selected.issue}</p>
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Rejection Reason <span className="text-red-500">*</span>
              <textarea required rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejecting this request..."
                className={`mt-1 ${inp} resize-none`} />
            </label>
            <div className="flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
              <button type="button" onClick={handleReject} disabled={!rejectReason.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                Confirm Reject
              </button>
            </div>
          </div>
        )}
      </CommonModal>

      {/* COMPLETE MODAL */}
      <CommonModal isOpen={modal === 'complete'} onClose={close} title="Mark Request as Completed">
        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-blue-50 p-3">
              <p className="text-xs font-semibold text-blue-700">{selected.id} · {selected.farmer.name} · {selected.animal.name}</p>
              <p className="mt-1 text-xs text-blue-600">{selected.issue}</p>
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Treatment Notes
              <textarea rows={4} value={treatmentNotes} onChange={e => setTreatmentNotes(e.target.value)}
                placeholder="Describe the treatment provided, medicines given, follow-up required..."
                className={`mt-1 ${inp} resize-none`} />
            </label>
            <div className="flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
              <button type="button" onClick={handleComplete}
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
                Mark as Completed
              </button>
            </div>
          </div>
        )}
      </CommonModal>
    </div>
  )
}
