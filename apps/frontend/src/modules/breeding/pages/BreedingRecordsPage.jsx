
import { useState } from 'react'
import { CheckCircle, Clock, Zap } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import CommonTable from '../../../components/tables/CommonTable'
import TableActions from '../../../components/tables/TableActions'
import TableEmptyState from '../../../components/tables/TableEmptyState'

const today = new Date().toISOString().split('T')[0]
const due = d => { const x = new Date(d); x.setDate(x.getDate() + 283); return x.toISOString().split('T')[0] }
const statuses = ['In Heat', 'Pending Check', 'Confirmed Pregnant', 'Calved']
const services = ['Artificial Insemination', 'Natural Breeding', 'Embryo Transfer']
const colors = {
  'Confirmed Pregnant': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Pending Check': 'bg-amber-50 text-amber-800 border-amber-200',
  'Calved': 'bg-blue-50 text-blue-800 border-blue-200',
  'In Heat': 'bg-purple-50 text-purple-800 border-purple-200'
}
const blank = { tag: '', name: '', breedingDate: today, serviceType: services[0], sire: '', status: 'In Heat', dueDate: due(today), technician: '' }
const fields = [
  ['tag', 'Herd Tag', 'text'], ['name', 'Animal Name', 'text'],
  ['breedingDate', 'Breeding Date', 'date'], ['serviceType', 'Service Type', 'select', services],
  ['sire', 'Sire / Bull Code', 'text'], ['status', 'Status', 'select', statuses],
  ['technician', 'Technician', 'text'], ['dueDate', 'Expected Due Date', 'date']
]
const input = 'w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm'

function BreedingRecordsPage() {
  const [records, setRecords] = useState([
    { id: 1, tag: '#COW-4091', name: 'Lakshmi', breedingDate: '2025-11-15', serviceType: services[0], sire: 'Holstein-A12', status: statuses[2], dueDate: '2026-08-22', technician: 'Dr. Sharma' },
    { id: 2, tag: '#COW-4092', name: 'Gauri', breedingDate: '2026-01-10', serviceType: services[0], sire: 'Jersey-J88', status: statuses[1], dueDate: '2026-10-17', technician: 'Dr. Sharma' },
    { id: 3, tag: '#COW-4093', name: 'Champa', breedingDate: '2025-05-04', serviceType: services[1], sire: 'Bull-B01', status: statuses[3], dueDate: '2026-02-10', technician: 'Farm Staff' },
    { id: 4, tag: '#COW-4094', name: 'Radha', breedingDate: '2026-02-18', serviceType: services[0], sire: 'Sahiwal-S04', status: statuses[0], dueDate: '2026-11-25', technician: 'Dr. Patil' }
  ])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(blank)
  const [viewRecord, setViewRecord] = useState(null)

  const openAdd = () => { setEditId(null); setForm(blank); setModal(true) }
  const openEdit = r => { setEditId(r.id); setForm({ ...r }); setModal(true) }
  const change = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value, ...(name === 'breedingDate' ? { dueDate: due(value) } : {}) }))
  }
  const submit = e => {
    e.preventDefault()
    const data = { ...form, tag: form.tag.startsWith('#') ? form.tag : `#${form.tag}` }
    setRecords(old => editId ? old.map(r => r.id === editId ? { ...r, ...data } : r) : [{ ...data, id: Date.now() }, ...old])
    setModal(false)
  }
  const filtered = records.filter(r =>
    `${r.name} ${r.tag}`.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'All' || r.status === filter)
  )
  const count = s => records.filter(r => r.status === s).length

  const columns = [
    { key: 'tag', label: 'HERD TAG' },
    { key: 'name', label: 'NAME' },
    { key: 'breedingDate', label: 'BREEDING DATE' },
    { key: 'serviceType', label: 'SERVICE TYPE' },
    { key: 'sire', label: 'SIRE / BULL' },
    { key: 'status', label: 'STATUS', render: r => <span className={`inline-flex min-w-[150px] justify-center rounded-full border px-4 py-2 text-sm ${colors[r.status]}`}>{r.status}</span> },
    { key: 'dueDate', label: 'DUE DATE' },
    { key: 'actions', label: 'ACTIONS', render: r => <TableActions onEdit={() => openEdit(r)} onView={() => setViewRecord(r)} onDelete={() => window.confirm('Delete record?') && setRecords(old => old.filter(x => x.id !== r.id))} /> }
  ]

  return (
    <div className="min-h-screen space-y-6 bg-[#fbfbfa] p-6 md:p-10 text-slate-800">
      <header className="flex flex-wrap justify-between gap-4 border-b pb-4">
        <div><h1 className="text-2xl font-bold">Breeding Records</h1><p className="text-sm text-slate-500">Track inseminations and pregnancy records.</p></div>
        <input placeholder="Search cow tag or name..." value={search} onChange={e => setSearch(e.target.value)} className={input + ' sm:w-80'} />
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <StatCard title="Confirmed Pregnant" value={count(statuses[2])} subtitle="Active Gestation" icon={CheckCircle} />
        <StatCard title="Pending PD Checks" value={count(statuses[1])} subtitle="Due for check" icon={Clock} />
        <StatCard title="Active Heat Observations" value={count(statuses[0])} subtitle="Ready for insemination" icon={Zap} />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {['All', ...statuses].map(s => <button key={s} onClick={() => setFilter(s)} className={`rounded-lg px-3 py-2 text-xs ${filter === s ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>{s}</button>)}
        </div>
        <button onClick={openAdd} className="rounded-full bg-[#235339] px-5 py-2.5 text-sm text-white">+ Log Breeding Event</button>
      </section>

      <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        {filtered.length ? <CommonTable columns={columns} data={filtered} /> : <TableEmptyState message="No breeding records found." />}
      </section>

      <CommonModal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Update Breeding Record' : 'Log Breeding Event'}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {fields.map(([name, label, type, options]) => (
              <div key={name}>
                <label className="mb-1 block text-xs font-bold">{label}</label>
                {type === 'select' ? (
                  <select name={name} value={form[name]} onChange={change} className={input}>{options.map(o => <option key={o}>{o}</option>)}</select>
                ) : (
                  <input required={['tag', 'name', 'breedingDate', 'sire'].includes(name)} type={type} name={name} value={form[name]} onChange={change} className={input} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={() => setModal(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button className="rounded-lg bg-[#235339] px-5 py-2 text-sm text-white">{editId ? 'Save Changes' : 'Save Record'}</button>
          </div>
        </form>
      </CommonModal>

      <CommonModal isOpen={!!viewRecord} onClose={() => setViewRecord(null)} title="View Breeding Record">
        {viewRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {fields.map(([name, label]) => (
                <div key={name}>
                  <label className="mb-1 block text-xs font-bold text-slate-500">{label}</label>
                  <p className="rounded-lg border bg-slate-50 px-3 py-2 text-sm">{viewRecord[name] || '—'}</p>
                </div>
              ))}
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

export default BreedingRecordsPage
