import { useMemo, useState } from 'react'
import { Search, Plus, SlidersHorizontal, MoreHorizontal, Warehouse, Layers, CheckCircle } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'

const TYPES    = ['Farm', 'Milking', 'Dry', 'Calving', 'Heifer', 'Bull']
const STATUSES = ['Active', 'Inactive', 'Full', 'Maintenance']
const blank    = { name: '', owner: '', type: 'Farm', capacity: '', status: 'Active' }
const inp      = 'w-full border rounded-lg p-3 text-sm outline-none focus:border-green-700'
const badge    = s => s === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : s === 'Inactive' ? 'bg-gray-100 text-gray-500 border-gray-200' : s === 'Maintenance' ? 'bg-orange-50 text-orange-600 border-orange-200' : s.includes('%') ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-600 border-red-200'
const Chip = ({ label, active, onClick }) => <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1 text-xs font-medium transition ${active ? 'border-green-700 bg-green-700 text-white' : 'hover:border-green-600 hover:text-green-700'}`}>{label}</button>

export default function FarmsPage() {
  const [records, setRecords] = useState([
    { id:1, name:'Green Valley Farm',  owner:'Rohan Patil',  type:'Farm',    capacity:160, status:'Active'   },
    { id:2, name:'Lactation Pan A',    owner:'Rohan Patil',  type:'Milking', capacity:48,  status:'82% Full' },
    { id:3, name:'Sunrise Dairy',      owner:'Meera Desai',  type:'Farm',    capacity:110, status:'Active'   },
    { id:4, name:'Dry Cow Pan',        owner:'Meera Desai',  type:'Dry',     capacity:24,  status:'63% Full' },
    { id:5, name:'Aarav Calving Shed', owner:'Vikram Singh', type:'Calving', capacity:30,  status:'Active'   },
    { id:6, name:'Heifer Pan B',       owner:'Anita Rao',    type:'Heifer',  capacity:36,  status:'Inactive' },
    { id:7, name:'Krishna Farm',       owner:'Anita Rao',    type:'Farm',    capacity:200, status:'Active'   },
    { id:8, name:'Milking Pan C',      owner:'Vikram Singh', type:'Milking', capacity:52,  status:'45% Full' },
  ])
  const [search, setSearch] = useState(''), [filterType, setFilterType] = useState('All'), [filterStatus, setFilterStatus] = useState('All'), [showFilter, setShowFilter] = useState(false)
  const [modal, setModal] = useState(''), [selected, setSelected] = useState(null), [form, setForm] = useState(blank), [menu, setMenu] = useState(null), [page, setPage] = useState(1)
  const pageSize = 6, set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const hasFilters = filterType !== 'All' || filterStatus !== 'All' || search !== ''

  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase()
    return `${r.name} ${r.owner} ${r.type} ${r.status}`.toLowerCase().includes(q) &&
      (filterType === 'All' || r.type === filterType) &&
      (filterStatus === 'All' || r.status === filterStatus)
  }), [records, search, filterType, filterStatus])

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const openAdd  = () => { setForm(blank); setSelected(null); setModal('add') }
  const openEdit = r => { setSelected(r); setForm({ ...r, capacity: String(r.capacity) }); setModal('edit') }
  const openView = r => { setSelected(r); setModal('view') }
  const close    = () => { setModal(''); setSelected(null); setForm(blank); setMenu(null) }
  const clear    = () => { setFilterType('All'); setFilterStatus('All'); setSearch(''); setPage(1) }

  const save = e => {
    e.preventDefault()
    const item = { ...form, capacity: Number(form.capacity) }
    setRecords(old => modal === 'add' ? [{ ...item, id: Date.now() }, ...old] : old.map(r => r.id === selected.id ? { ...r, ...item } : r))
    if (modal === 'add') setPage(1)
    close()
  }
  const del = r => { if (window.confirm(`Delete "${r.name}"?`)) { setRecords(old => old.filter(x => x.id !== r.id)); setMenu(null) } }

  const stats = [
    { title: 'Total Records', value: records.length,                                       subtitle: 'Farms and pans',     icon: Layers    },
    { title: 'Total Farms',   value: records.filter(r => r.type === 'Farm').length,        subtitle: 'Registered farms',   icon: Warehouse },
    { title: 'Total Pans',    value: records.filter(r => r.type !== 'Farm').length,        subtitle: 'Sheds and grouping', icon: Layers    },
    { title: 'Active',        value: records.filter(r => r.status === 'Active').length,    subtitle: 'Currently active',   icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-gray-800">
      <main className="space-y-6 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-3xl font-semibold text-gray-900">Farm & Pan Management</h1><p className="mt-1 text-sm text-gray-500">Monitor farm locations, sheds, and animal grouping pans.</p></div>
          <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-900"><Plus size={18}/> Add New</button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(s => <StatCard key={s.title} {...s} />)}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-[380px]">
            <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search farms & pans..."
              className="w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700"/>
          </div>
          <div className="relative">
            <button type="button" onClick={() => setShowFilter(v => !v)} className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-medium hover:border-green-700">
              <SlidersHorizontal size={17}/> Filters {hasFilters && <span className="h-2 w-2 rounded-full bg-green-700"/>}
            </button>
            {showFilter && (
              <div className="absolute left-0 top-14 z-10 w-60 rounded-xl border bg-white p-4 shadow-lg space-y-3">
                <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Type</p><div className="flex flex-wrap gap-1.5">{['All',...TYPES].map(t => <Chip key={t} label={t} active={filterType===t} onClick={() => { setFilterType(t); setPage(1) }}/>)}</div></div>
                <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p><div className="flex flex-wrap gap-1.5">{['All',...STATUSES].map(s => <Chip key={s} label={s} active={filterStatus===s} onClick={() => { setFilterStatus(s); setPage(1) }}/>)}</div></div>
                <button type="button" onClick={() => { clear(); setShowFilter(false) }} className="w-full rounded-lg border py-2 text-xs font-medium text-gray-500 hover:bg-gray-50">Reset Filters</button>
              </div>
            )}
          </div>
          {hasFilters && <button type="button" onClick={clear} className="text-xs text-gray-400 underline hover:text-gray-700">Clear all</button>}
          <span className="ml-auto text-xs text-gray-500">{filtered.length} records</span>
        </div>

        <div className="overflow-visible rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[11px] font-medium text-gray-500">
                <tr>{['FARM / PAN','OWNER','TYPE','CAPACITY','STATUS',''].map(h => <th key={h} className="whitespace-nowrap px-5 py-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t transition-colors hover:bg-gray-50">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${r.type==='Farm'?'bg-green-100 text-green-800':'bg-blue-50 text-blue-700'}`}>{r.type==='Farm'?<Warehouse size={16}/>:<Layers size={16}/>}</div><div><p className="text-xs font-semibold text-gray-800">{r.name}</p><p className="text-[10px] text-gray-400">{r.type==='Farm'?'Farm':'Pan'}</p></div></div></td>
                    <td className="px-5 py-4 text-xs text-gray-600">{r.owner}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${r.type==='Farm'?'bg-green-50 text-green-700':'bg-blue-50 text-blue-600'}`}>{r.type}</span></td>
                    <td className="px-5 py-4 text-xs text-gray-600">{r.capacity} animals</td>
                    <td className="px-5 py-4"><span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-semibold ${badge(r.status)}`}>{r.status}</span></td>
                    <td className="relative px-5 py-4">
                      <button type="button" onClick={() => setMenu(menu===r.id?null:r.id)} className="text-gray-400 hover:text-gray-700"><MoreHorizontal size={20}/></button>
                      {menu===r.id && <div className="absolute right-8 top-10 z-20 w-36 rounded-xl border bg-white p-1 shadow-lg">
                        <button type="button" onClick={() => { openView(r); setMenu(null) }} className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50">View Details</button>
                        <button type="button" onClick={() => { openEdit(r); setMenu(null) }} className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50">Edit</button>
                        <button type="button" onClick={() => del(r)} className="w-full rounded-lg px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50">Delete</button>
                      </div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <TableEmptyState message="No farms or pans found."/>}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-xs text-gray-500">
            <span>Showing {filtered.length?(page-1)*pageSize+1:0} to {Math.min(page*pageSize,filtered.length)} of {filtered.length} records</span>
            <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage}/>
          </div>
        </div>
      </main>

      <CommonModal isOpen={modal==='add'||modal==='edit'} onClose={close} title={modal==='add'?'Add New Farm / Pan':'Edit Farm / Pan'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['name','text','Farm / Pan Name',true],['owner','text','Owner Name',true],['capacity','number','Capacity',true]].map(([name,type,label,req]) => (
              <label key={name} className="flex flex-col gap-1 text-xs font-medium text-gray-600">{label}
                <input name={name} type={type} required={req} min={type==='number'?1:undefined} placeholder={label} value={form[name]} onChange={set} className={inp}/>
              </label>
            ))}
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Type<select name="type" value={form.type} onChange={set} className={inp}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Status<select name="status" value={form.status} onChange={set} className={inp}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></label>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="rounded-lg bg-green-800 px-5 py-2 text-sm font-semibold text-white hover:bg-green-900">{modal==='add'?'Save Record':'Save Changes'}</button>
          </div>
        </form>
      </CommonModal>

      <CommonModal isOpen={modal==='view'} onClose={close} title="Farm / Pan Details">
        {selected && <div className="space-y-4">
          <div className={`flex items-center gap-4 rounded-xl p-4 ${selected.type==='Farm'?'bg-green-50':'bg-blue-50'}`}>
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${selected.type==='Farm'?'bg-green-800':'bg-blue-600'}`}>{selected.type==='Farm'?<Warehouse size={22}/>:<Layers size={22}/>}</div>
            <div><p className="text-base font-bold text-gray-800">{selected.name}</p><p className="text-xs text-gray-500">{selected.type}</p><span className={`mt-1 inline-block rounded-full border px-3 py-1 text-[10px] font-semibold ${badge(selected.status)}`}>{selected.status}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['Owner',selected.owner],['Type',selected.type],['Capacity',`${selected.capacity} animals`],['Status',selected.status]].map(([label,value])=>(
              <div key={label} className="rounded-lg border bg-gray-50 p-3"><p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p><p className="mt-1 text-sm font-semibold text-gray-700">{value}</p></div>
            ))}
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={() => { close(); openEdit(selected) }} className="rounded-lg border border-green-700 px-4 py-2 text-sm text-green-800 hover:bg-green-50">Edit</button>
            <button type="button" onClick={close} className="rounded-lg border px-5 py-2 text-sm">Close</button>
          </div>
        </div>}
      </CommonModal>
    </div>
  )
}
