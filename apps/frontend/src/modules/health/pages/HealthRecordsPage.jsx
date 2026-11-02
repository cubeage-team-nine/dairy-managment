import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Bell, AlertTriangle, CalendarDays, ShieldCheck, Stethoscope, MapPin } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import CommonTable from '../../../components/tables/CommonTable'
import TableActions from '../../../components/tables/TableActions'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import { getMyHealthRecords } from '../../farmers/farmers.service'

// ── sample data includes treatingDoctor – replaced by API once backend ready ──
const initialRecords = [
  {
    id: 1, date: '12 May 2026', animalTag: '#COW-4094', animalName: 'Lakshmi',
    breed: 'HF', age: '4 Yrs', condition: 'Mastitis (Mild)', severity: 'Severe',
    symptoms: 'Swollen udder, reduced milk yield, warmth on palpation.',
    treatment: 'Intramammary Infusion', medicines: 'Ceftiofur 125mg OD × 3 days',
    treatmentStart: '12 May 2026', followUpDate: '19 May 2026',
    status: 'Under Treatment',
    treatingDoctor: { name: 'Dr. Arjun Sharma', qualification: 'BVSc & AH', specialization: 'Bovine Medicine', mobile: '9876543210', assignedDate: '12 May 2026' },
  },
  {
    id: 2, date: '11 May 2026', animalTag: '#COW-4022', animalName: 'Gauri',
    breed: 'Jersey', age: '3 Yrs', condition: 'Hoof Trimming', severity: 'Low',
    symptoms: 'Limping in right hind leg, overgrown hoof.',
    treatment: 'Preventative Care', medicines: 'Copper sulfate bandage',
    treatmentStart: '11 May 2026', followUpDate: '',
    status: 'Completed',
    treatingDoctor: { name: 'Dr. Priya Desai', qualification: 'MVSc', specialization: 'Surgery', mobile: '9123456780', assignedDate: '11 May 2026' },
  },
  {
    id: 3, date: '10 May 2026', animalTag: '#COW-4105', animalName: 'Radha',
    breed: 'Gir', age: '5 Yrs', condition: 'Rumination Drop', severity: 'Moderate',
    symptoms: 'Decreased rumination, mild bloat, reduced feed intake.',
    treatment: 'Probiotic Supplement', medicines: 'Probiotic gel 100ml BID × 5 days',
    treatmentStart: '10 May 2026', followUpDate: '15 May 2026',
    status: 'Under Observation',
    treatingDoctor: { name: 'Dr. Neha Joshi', qualification: 'PhD Vet Sci', specialization: 'Pathology', mobile: '', assignedDate: '10 May 2026' },
  },
  {
    id: 4, date: '08 May 2026', animalTag: '#COW-3980', animalName: 'Kamala',
    breed: 'Sahiwal', age: '6 Yrs', condition: 'Milk Fever', severity: 'Severe',
    symptoms: 'Weakness, inability to stand, cold extremities.',
    treatment: 'Calcium gluconate IV', medicines: 'Calborol 450ml IV, Calcium gel OD × 3 days',
    treatmentStart: '08 May 2026', followUpDate: '10 May 2026',
    status: 'Recovered',
    treatingDoctor: { name: 'Dr. Arjun Sharma', qualification: 'BVSc & AH', specialization: 'Bovine Medicine', mobile: '9876543210', assignedDate: '08 May 2026' },
  },
]

const sel    = 'w-full rounded-lg border p-3 text-sm'
const inp    = 'w-full rounded-lg border p-3 text-sm outline-none focus:border-green-500'
const severities = ['Severe', 'Moderate', 'Low']
const statuses   = ['Under Treatment', 'Under Observation', 'Completed', 'Recovered']
const emptyForm  = { animalTag:'', animalName:'', breed:'', age:'', condition:'', severity:'Moderate', symptoms:'', treatment:'', medicines:'', treatmentStart:'', followUpDate:'', status:'Under Treatment' }
const ViewField = ({ label, value }) => (
  <div><label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
    <p className="rounded-lg border bg-gray-50 p-3 text-sm">{value || '—'}</p>
  </div>
)

export default function HealthRecordsPage() {
  const [records, setRecords]         = useState(initialRecords)
  const [search, setSearch]           = useState('')
  const [severityFilter, setSeverity] = useState('All')
  const [statusFilter, setStatus]     = useState('All')
  const [showModal, setShowModal]     = useState(false)
  const [viewRecord, setViewRecord]   = useState(null)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [page, setPage]               = useState(1)
  const pageSize = 5
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const active = records.filter(r => ['Under Treatment','Under Observation'].includes(r.status)).length

  // Try to load from backend; fall back to sample data silently
  useEffect(() => {
    getMyHealthRecords()
      .then(res => { const d = res.data?.data ?? res.data; if (Array.isArray(d) && d.length) setRecords(d) })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => records.filter(r =>
    `${r.animalTag} ${r.condition} ${r.treatment} ${r.treatingDoctor?.name ?? ''}`.toLowerCase().includes(search.toLowerCase()) &&
    (severityFilter === 'All' || r.severity === severityFilter) &&
    (statusFilter   === 'All' || (statusFilter === 'Active' ? ['Under Treatment','Under Observation'].includes(r.status) : r.status === statusFilter))
  ), [records, search, severityFilter, statusFilter])

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const openAdd  = () => { setEditingRecord(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = r  => { setEditingRecord(r); setForm({ ...emptyForm, ...r, animalTag: r.animalTag.replace('#','') }); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setForm(emptyForm); setEditingRecord(null) }

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.animalTag.trim() || !form.condition.trim() || !form.treatment.trim()) return
    const data = { ...form, animalTag: form.animalTag.startsWith('#') ? form.animalTag : `#${form.animalTag}`,
      date: editingRecord?.date || new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
      treatingDoctor: editingRecord?.treatingDoctor || null }
    setRecords(old => editingRecord ? old.map(r => r.id === editingRecord.id ? { ...r, ...data } : r) : [{ ...data, id: Date.now() }, ...old])
    closeModal()
  }

  const handleDelete = id => { if (window.confirm('Delete this health record?')) setRecords(old => old.filter(r => r.id !== id)) }

  const statusBadge = s => {
    if (s === 'Recovered' || s === 'Completed') return 'bg-green-100 text-green-700'
    if (s === 'Under Treatment')  return 'bg-orange-100 text-orange-700'
    if (s === 'Under Observation') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-600'
  }

  const columns = [
    { key: 'date',       label: 'DATE' },
    { key: 'animalTag',  label: 'ANIMAL TAG' },
    { key: 'condition',  label: 'CONDITION' },
    { key: 'severity',   label: 'SEVERITY' },
    { key: 'treatment',  label: 'TREATMENT' },
    { key: 'treatingDoctor', label: 'TREATING DOCTOR', render: r => (
      r.treatingDoctor
        ? <div className="flex items-center gap-1.5"><Stethoscope size={13} className="shrink-0 text-green-600"/><span className="text-xs font-medium text-gray-800">{r.treatingDoctor.name}</span></div>
        : <span className="text-xs text-gray-400">Not assigned</span>
    )},
    { key: 'status', label: 'STATUS', render: r =>
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusBadge(r.status)}`}>{r.status}</span>
    },
    { key: 'actions', label: 'ACTIONS', render: row =>
      <TableActions onEdit={() => openEdit(row)} onView={() => setViewRecord(row)} onDelete={() => handleDelete(row.id)} />
    },
  ]

  return (
    <div className="min-h-full bg-[#FBFCF8] text-[#17251B]">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-white px-6 py-5">
        <div>
          <h1 className="text-2xl font-semibold">Health Logs & Disease Surveillance</h1>
          <p className="mt-1 text-xs text-gray-500">Monitor animal health records and assigned doctors</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={17}/>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search records, tag, doctor..."
              className="h-10 w-64 rounded-lg border bg-white pl-10 pr-3 text-sm outline-none focus:border-green-500"/>
          </div>
          <button type="button" className="relative rounded-full border p-2 text-gray-600"><Bell size={18}/></button>
        </div>
      </header>

      <main className="space-y-6 p-6">
        {/* Stat Cards */}
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard title="Active Illnesses"    value={active}         icon={AlertTriangle}/>
          <StatCard title="Routine Vet Visits"  value="3 Scheduled"    icon={CalendarDays}/>
          <StatCard title="Healthy Herd Rate"   value="91.6%"          icon={ShieldCheck}/>
        </section>

        {/* Filters + Add */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <select value={severityFilter} onChange={e => { setSeverity(e.target.value); setPage(1) }} className="rounded-lg border bg-white px-4 py-2 text-sm">
              <option value="All">Severity: All</option>
              {severities.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1) }} className="rounded-lg border bg-white px-4 py-2 text-sm">
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button type="button" onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-[#17653A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800">
            <Plus size={17}/> Log Health Issue
          </button>
        </section>

        {/* Table */}
        <section className="overflow-x-auto rounded-xl border bg-white p-4">
          {rows.length ? <CommonTable columns={columns} data={rows}/> : <TableEmptyState message="No health records found"/>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs text-gray-500">
            <span>Showing {filtered.length ? (page-1)*pageSize+1 : 0} to {Math.min(page*pageSize,filtered.length)} of {filtered.length} records</span>
            <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage}/>
          </div>
        </section>
      </main>

      {/* ── Add / Edit Modal ─────────────────────────────────────────── */}
      <CommonModal isOpen={showModal} onClose={closeModal} title={editingRecord ? 'Edit Health Record' : 'Log Health Issue'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[['animalTag','Animal Tag'],['animalName','Animal Name'],['breed','Breed'],['age','Age']].map(([k,l]) => (
              <label key={k} className="text-xs font-medium text-gray-600">{l}
                <input required={k==='animalTag'} value={form[k]||''} onChange={set(k)} className={`mt-1 ${inp}`}/>
              </label>
            ))}
            <label className="text-xs font-medium text-gray-600">Condition
              <input required value={form.condition} onChange={set('condition')} className={`mt-1 ${inp}`}/>
            </label>
            <label className="text-xs font-medium text-gray-600">Severity
              <select value={form.severity} onChange={set('severity')} className={`mt-1 ${sel}`}>{severities.map(s=><option key={s}>{s}</option>)}</select>
            </label>
            <label className="text-xs font-medium text-gray-600 col-span-2">Symptoms
              <input value={form.symptoms||''} onChange={set('symptoms')} className={`mt-1 ${inp}`}/>
            </label>
            <label className="text-xs font-medium text-gray-600">Treatment / Medicine
              <input required value={form.treatment} onChange={set('treatment')} className={`mt-1 ${inp}`}/>
            </label>
            <label className="text-xs font-medium text-gray-600">Medicines
              <input value={form.medicines||''} onChange={set('medicines')} className={`mt-1 ${inp}`}/>
            </label>
            <label className="text-xs font-medium text-gray-600">Treatment Start
              <input type="date" value={form.treatmentStart||''} onChange={set('treatmentStart')} className={`mt-1 ${inp}`}/>
            </label>
            <label className="text-xs font-medium text-gray-600">Follow-up Date
              <input type="date" value={form.followUpDate||''} onChange={set('followUpDate')} className={`mt-1 ${inp}`}/>
            </label>
            <label className="text-xs font-medium text-gray-600 col-span-2">Status
              <select value={form.status} onChange={set('status')} className={`mt-1 ${sel}`}>{statuses.map(s=><option key={s}>{s}</option>)}</select>
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={closeModal} className="rounded-lg border px-5 py-2 text-sm">Cancel</button>
            <button type="submit" className="rounded-lg bg-[#17653A] px-5 py-2 text-sm text-white">{editingRecord ? 'Save Changes' : 'Log Issue'}</button>
          </div>
        </form>
      </CommonModal>

      {/* ── View Details Modal ───────────────────────────────────────── */}
      <CommonModal isOpen={!!viewRecord} onClose={() => setViewRecord(null)} title="Health Record Details">
        {viewRecord && (
          <div className="space-y-5">
            {/* Animal */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Animal Information</p>
              <div className="grid grid-cols-2 gap-3">
                <ViewField label="Animal Name"  value={viewRecord.animalName}/>
                <ViewField label="Animal Tag"   value={viewRecord.animalTag}/>
                <ViewField label="Breed"        value={viewRecord.breed}/>
                <ViewField label="Age"          value={viewRecord.age}/>
              </div>
            </div>

            {/* Health */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Health Information</p>
              <div className="grid grid-cols-2 gap-3">
                <ViewField label="Condition"         value={viewRecord.condition}/>
                <ViewField label="Severity"          value={viewRecord.severity}/>
                <ViewField label="Treatment Start"   value={viewRecord.treatmentStart}/>
                <ViewField label="Follow-up Date"    value={viewRecord.followUpDate}/>
                <ViewField label="Status"            value={viewRecord.status}/>
                <ViewField label="Medicines"         value={viewRecord.medicines}/>
              </div>
              {viewRecord.symptoms && (
                <div className="mt-2 rounded-lg border bg-gray-50 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Symptoms</p>
                  <p className="mt-1 text-sm text-gray-700">{viewRecord.symptoms}</p>
                </div>
              )}
              <div className="mt-2 rounded-lg border bg-gray-50 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Treatment Description</p>
                <p className="mt-1 text-sm text-gray-700">{viewRecord.treatment}</p>
              </div>
            </div>

            {/* Doctor */}
            <div>
              <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                <Stethoscope size={12} className="text-green-600"/> Treating Doctor
              </p>
              {viewRecord.treatingDoctor ? (
                <div className="grid grid-cols-2 gap-3">
                  <ViewField label="Doctor Name"     value={viewRecord.treatingDoctor.name}/>
                  <ViewField label="Qualification"   value={viewRecord.treatingDoctor.qualification}/>
                  <ViewField label="Specialization"  value={viewRecord.treatingDoctor.specialization}/>
                  <ViewField label="Mobile"          value={viewRecord.treatingDoctor.mobile}/>
                  <ViewField label="Assigned Date"   value={viewRecord.treatingDoctor.assignedDate}/>
                </div>
              ) : (
                <p className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-400">No doctor assigned yet. Use Doctors page to send a health request.</p>
              )}
            </div>

            <div className="flex justify-end border-t pt-4">
              <button type="button" onClick={() => setViewRecord(null)} className="rounded-lg border px-5 py-2 text-sm">Close</button>
            </div>
          </div>
        )}
      </CommonModal>
    </div>
  )
}
