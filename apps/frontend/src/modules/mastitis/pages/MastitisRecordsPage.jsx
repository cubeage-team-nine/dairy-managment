import { useMemo, useState } from 'react'
import { Plus, Search, HeartPulse, Syringe, CalendarDays } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import CommonTable from '../../../components/tables/CommonTable'
import TableActions from '../../../components/tables/TableActions'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'

const initialData = [
  { id: 1, animalId: 'COW-001', name: 'Gauri', date: '2026-10-28', symptoms: 'Swollen udder', treatment: 'Antibiotics', status: 'Recovered' },
  { id: 2, animalId: 'COW-005', name: 'Lakshmi', date: '2026-10-25', symptoms: 'Reduced milk', treatment: 'Vet care', status: 'Under Treatment' },
]
const emptyForm = { animalId: '', name: '', date: '', symptoms: '', treatment: '', status: 'Under Treatment' }
const inp = 'mt-1 w-full rounded-lg border p-2.5 text-sm outline-none focus:border-emerald-500'
const formFields = [
  ['animalId', 'Animal ID', 'text'],
  ['name', 'Animal Name', 'text'],
  ['date', 'Date', 'date'],
  ['symptoms', 'Symptoms', 'text'],
  ['treatment', 'Treatment', 'text'],
]

export default function MastitisRecords() {
  const [records, setRecords] = useState(initialData)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [modal, setModal] = useState('')       // '' | 'form' | 'view'
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [viewRecord, setViewRecord] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 5
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const today = new Date().toISOString().slice(0, 10)
  const thisMonth = new Date().toISOString().slice(0, 7)

  const openAdd  = () => { setEditId(null); setForm({ ...emptyForm, date: today }); setModal('form') }
  const openEdit = r => { setEditId(r.id); setForm({ ...r }); setModal('form') }
  const openView = r => { setViewRecord(r); setModal('view') }
  const close    = () => { setModal(''); setEditId(null); setForm(emptyForm); setViewRecord(null) }

  const save = e => {
    e.preventDefault()
    setRecords(old => editId
      ? old.map(r => r.id === editId ? { ...form, id: editId } : r)
      : [{ ...form, id: Date.now() }, ...old])
    close()
  }

  const filtered = useMemo(() => records.filter(r =>
    `${r.animalId} ${r.name} ${r.symptoms}`.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'All' || r.status === filter)
  ), [records, search, filter])

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns = [
    { key: 'animalId', label: 'ANIMAL ID', render: r => <span className="font-semibold text-emerald-700">{r.animalId}</span> },
    { key: 'name', label: 'NAME' },
    { key: 'date', label: 'DATE' },
    { key: 'symptoms', label: 'SYMPTOMS' },
    { key: 'treatment', label: 'TREATMENT' },
    { key: 'status', label: 'STATUS', render: r =>
      <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${r.status === 'Recovered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
        {r.status}
      </span>
    },
    { key: 'actions', label: 'ACTIONS', render: r =>
      <TableActions
        onEdit={() => openEdit(r)}
        onView={() => openView(r)}
        onDelete={() => window.confirm('Delete this record?') && setRecords(old => old.filter(x => x.id !== r.id))}
      />
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mastitis Records</h1>
          <p className="mt-2 text-sm text-gray-500">Manage animal health and recovery records.</p>
        </div>
        <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700">
          <Plus size={18} /> Add Record
        </button>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Cases" value={records.length} subtitle="All recorded cases" icon={HeartPulse} />
        <StatCard title="Recovered" value={records.filter(r => r.status === 'Recovered').length} subtitle="Recovered cases" icon={HeartPulse} />
        <StatCard title="Under Treatment" value={records.filter(r => r.status === 'Under Treatment').length} subtitle="Needs follow-up" icon={Syringe} />
        <StatCard title="This Month" value={records.filter(r => r.date?.slice(0, 7) === thisMonth).length} subtitle="Cases this month" icon={CalendarDays} />
      </div>

      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search animal or symptoms..." className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500" />
          </div>
          <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }} className="rounded-lg border bg-white p-2.5 text-sm">
            <option value="All">All Statuses</option>
            <option>Recovered</option>
            <option>Under Treatment</option>
          </select>
        </div>

        <div className="p-4">
          {rows.length
            ? <CommonTable columns={columns} data={rows} />
            : <TableEmptyState message="No mastitis records found." />}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs text-gray-500">
            <span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} records</span>
            <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
          </div>
        </div>
      </section>

      {/* Add / Edit Modal */}
      <CommonModal isOpen={modal === 'form'} onClose={close} title={editId ? 'Edit Record' : 'Add Mastitis Record'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {formFields.map(([name, label, type]) => (
              <label key={name} className="text-sm font-medium text-gray-700">
                {label}
                <input required name={name} type={type} value={form[name]} onChange={set} className={inp} />
              </label>
            ))}
            <label className="text-sm font-medium text-gray-700">
              Status
              <select name="status" value={form.status} onChange={set} className={inp}>
                <option>Under Treatment</option>
                <option>Recovered</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="rounded-lg bg-emerald-600 px-5 py-2 text-sm text-white">{editId ? 'Update' : 'Save Record'}</button>
          </div>
        </form>
      </CommonModal>

      {/* View Modal */}
      <CommonModal isOpen={modal === 'view'} onClose={close} title="View Mastitis Record">
        {viewRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[...formFields, ['status', 'Status', 'text']].map(([name, label]) => (
                <div key={name}>
                  <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
                  <p className="rounded-lg border bg-gray-50 p-2.5 text-sm">{viewRecord[name] || '—'}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end border-t pt-4">
              <button type="button" onClick={close} className="rounded-lg border px-5 py-2 text-sm">Close</button>
            </div>
          </div>
        )}
      </CommonModal>
    </div>
  )
}
