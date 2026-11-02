import { useMemo, useState } from 'react'
import { Plus, Search, X, Bell } from 'lucide-react'
import { useAuth } from '../../../core/hooks/useAuth.js'
import { ROLE_LABELS } from '../../../core/constants/app.constants.js'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import CommonTable from '../../../components/tables/CommonTable'
import TableActions from '../../../components/tables/TableActions'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'

const initialData = [
  { id: 1, herdTag: '#COW-4091', name: 'Lakshmi', breed: 'Jersey Purebred', category: 'Milking', age: '4.2 Yrs', status: 'Active', milkYield: '29.4 L/day' },
  { id: 2, herdTag: '#COW-4092', name: 'Gauri', breed: 'Holstein Friesian', category: 'Milking', age: '5.1 Yrs', status: 'Pregnant', milkYield: '32.1 L/day' },
  { id: 3, herdTag: '#COW-4093', name: 'Ganga', breed: 'Sahiwal', category: 'Dry', age: '3.8 Yrs', status: 'Active', milkYield: '0 L/day' },
  { id: 4, herdTag: '#COW-4094', name: 'Radha', breed: 'Gir', category: 'Milking', age: '4 Yrs', status: 'Sick', milkYield: '14.2 L/day' }
]
const emptyForm = { herdTag: '', name: '', breed: '', category: 'Milking', age: '', status: 'Active', milkYield: '' }
const categories = ['Milking', 'Dry', 'Calf', 'Heifer', 'Bull'], statuses = ['Active', 'Pregnant', 'Sick', 'Inactive'], input = 'mt-2 h-10 w-full rounded-md border px-3 text-xs'

function AnimalsPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState(initialData)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ category: 'All', breed: 'All', status: 'All' })
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState('')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const pageSize = 4, viewMode = modal === 'View'
  const userName = user?.name || 'Guest', userRoleText = user?.role ? ROLE_LABELS[user.role] || user.role : '', userInitial = userName.charAt(0).toUpperCase()
  const filtered = useMemo(() => animals.filter(a => Object.values(a).some(v => String(v).toLowerCase().includes(search.toLowerCase())) && Object.entries(filters).every(([k, v]) => v === 'All' || a[k] === v)), [animals, search, filters])
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const openModal = (type, a = null) => { setSelected(a); setForm(a ? { ...a, herdTag: a.herdTag.replace('#', ''), age: a.age.replace(' Yrs', ''), milkYield: a.milkYield.replace(' L/day', '') } : emptyForm); setModal(type) }
  const closeModal = () => { setModal(''); setSelected(null); setForm(emptyForm) }
  const handleSubmit = e => { e.preventDefault(); const data = { ...form, herdTag: `#${form.herdTag.replace('#', '')}`, age: `${form.age} Yrs`, milkYield: `${form.milkYield} L/day` }; setAnimals(old => modal === 'Add' ? [{ ...data, id: Date.now() }, ...old] : old.map(a => a.id === selected.id ? { ...data, id: a.id } : a)); if (modal === 'Add') setPage(1); closeModal() }
  const deleteAnimal = a => { if (window.confirm(`Delete ${a.name}?`)) setAnimals(old => old.filter(x => x.id !== a.id)) }
  const columns = [
    ...['herdTag', 'name', 'breed', 'category', 'age'].map(k => ({ key: k, label: k === 'herdTag' ? 'HERD TAG' : k.toUpperCase() })),
    { key: 'status', label: 'STATUS', render: a => <span className={`rounded-md px-2 py-1 text-xs ${a.status === 'Active' ? 'bg-green-100 text-green-700' : a.status === 'Pregnant' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>{a.status}</span> },
    { key: 'milkYield', label: 'MILK YIELD' },
    { key: 'actions', label: 'ACTIONS', render: a => <TableActions onEdit={() => openModal('Edit', a)} onView={() => openModal('View', a)} onDelete={() => deleteAnimal(a)} /> }
  ]
  const stats = [
    ['Total Animals', animals.length, 'Registered animals'],
    ['Milking Animals', animals.filter(a => a.category === 'Milking').length, 'Milk producing'],
    ['Pregnant Animals', animals.filter(a => a.status === 'Pregnant').length, 'Pregnancy records'],
    ['Sick Animals', animals.filter(a => a.status === 'Sick').length, 'Health attention']
  ]
  return (
    <div className="-m-6 min-h-screen bg-[#fbfaf7] text-[#1c211d]">
      <header className="flex flex-col gap-4 border-b border-[#e5e6e1] bg-white px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#161a17]">Animals Registry</h1>
        <div className="flex items-center gap-5">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c928e]" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search animals, tags, breeds..." className="h-9 w-full rounded-md border border-[#e2e3dd] bg-[#f7f8f4] pl-9 pr-3 text-xs text-[#1c211d] outline-none transition placeholder:text-[#8c928e] focus:border-[#2f7657] focus:bg-white" />
            {search && <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9da39e] hover:text-[#1c211d]"><X className="h-3.5 w-3.5" /></button>}
          </div>
          <button type="button" className="relative rounded-full p-2 text-[#68716b] hover:bg-[#f3f4ef]" aria-label="Notifications"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" /></button>
          <div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f7657] text-xs font-bold text-white shadow-xs">{userInitial}</div><div className="flex flex-col text-left"><span className="text-xs font-semibold text-[#1c211d]">{userName}</span><span className="text-[10px] text-[#787f7a]">{userRoleText}</span></div></div>
        </div>
      </header>
      <main className="space-y-5 p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([title, value, subtitle]) => <StatCard key={title} title={title} value={value} subtitle={subtitle} />)}
        </div>
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            {Object.keys(filters).map(k => <select key={k} value={filters[k]} onChange={e => { setFilters(p => ({ ...p, [k]: e.target.value })); setPage(1) }} className="h-10 rounded-md border bg-white px-3 text-xs"><option value="All">{k}: All</option>{[...new Set(animals.map(a => a[k]))].map(v => <option key={v}>{v}</option>)}</select>)}
          </div>
          <button type="button" onClick={() => openModal('Add')} className="flex h-10 items-center gap-2 rounded-md bg-[#2f7657] px-4 text-xs font-semibold text-white"><Plus size={16} /> Add New Animal</button>
        </div>
        <div className="overflow-visible rounded-xl border bg-white shadow-sm">
          {rows.length ? <CommonTable columns={columns} data={rows} /> : <TableEmptyState message="No matching animals found." />}
          <div className="flex flex-wrap justify-between gap-3 border-t px-6 py-4 text-xs">
            <span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} animals</span>
            <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
          </div>
        </div>
      </main>
      <CommonModal isOpen={!!modal} onClose={closeModal} title={`${modal} Animal`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {Object.keys(emptyForm).map(k => (
            <label key={k} className="text-xs font-semibold capitalize">{k}
              {['category', 'status'].includes(k)
                ? <select disabled={viewMode} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className={input}>{(k === 'category' ? categories : statuses).map(v => <option key={v}>{v}</option>)}</select>
                : <input required disabled={viewMode} type={['age', 'milkYield'].includes(k) ? 'number' : 'text'} step="0.1" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className={input} />}
            </label>
          ))}
          <div className="col-span-2 flex justify-end gap-2">
            <button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-xs">{viewMode ? 'Close' : 'Cancel'}</button>
            {!viewMode && <button type="submit" className="rounded-md bg-[#2f7657] px-4 py-2 text-xs text-white">{modal === 'Add' ? 'Add Animal' : 'Save Changes'}</button>}
          </div>
        </form>
      </CommonModal>
    </div>
  )
}
export default AnimalsPage
