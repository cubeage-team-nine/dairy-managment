import { useMemo, useState } from 'react'
import { Search, Plus, SlidersHorizontal, MoreHorizontal, Milk, Building2, CheckCircle, XCircle } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import { MC_BLANK, MC_STATUSES } from '../milk-centers.constants'

const inp = 'w-full border rounded-lg p-3 text-sm outline-none focus:border-green-700'
const SBadge = ({ s }) => <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-semibold ${s === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{s}</span>
const Lbl = ({ label, children }) => <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">{label}{children}</label>
const Cell = ({ cls = '', children }) => <td className={`px-5 py-4 text-xs ${cls}`}>{children}</td>

const SAMPLE = [
  { id:1, name:'Green Valley Milk Center',       code:'MC001', location:'Shirur',     manager:'Rahul Patil',  contact:'9876543210', email:'rahul@gvmc.in', capacity:500, openTime:'06:00', closeTime:'18:00', status:'Active'   },
  { id:2, name:'Sunrise Milk Collection Center', code:'MC002', location:'Pune',       manager:'Amit Shinde',  contact:'9876543211', email:'',              capacity:300, openTime:'05:30', closeTime:'17:30', status:'Active'   },
  { id:3, name:'Dairy Fresh Center',             code:'MC003', location:'Ranjangaon', manager:'Priya Desai',  contact:'9876543212', email:'priya@dfc.in',  capacity:400, openTime:'06:00', closeTime:'18:00', status:'Inactive' },
  { id:4, name:'Shree Milk Center',              code:'MC004', location:'Wagholi',    manager:'Sagar Jadhav', contact:'9876543213', email:'',              capacity:250, openTime:'06:30', closeTime:'19:00', status:'Active'   },
]
const FIELDS = [
  ['name','text','Center Name',true], ['code','text','Center Code',true],
  ['location','text','Location',true], ['manager','text','Manager Name',true],
  ['contact','tel','Contact Number',true], ['email','email','Email (optional)',false],
  ['capacity','number','Daily Capacity (L)',true], ['openTime','time','Opening Time',true], ['closeTime','time','Closing Time',true],
]
const VIEW_KEYS = [['Center Name','name'],['Code','code'],['Location','location'],['Manager','manager'],['Contact','contact'],['Email','email'],['Capacity (L)','capacity'],['Opens','openTime'],['Closes','closeTime'],['Status','status']]

export default function MilkCentersPage() {
  const [centers, setCenters] = useState(SAMPLE)
  const [search, setSearch] = useState(''), [fStatus, setFStatus] = useState('All'), [fLoc, setFLoc] = useState('All')
  const [showFilter, setShowFilter] = useState(false), [modal, setModal] = useState(''), [selected, setSelected] = useState(null)
  const [form, setForm] = useState(MC_BLANK), [menu, setMenu] = useState(null), [page, setPage] = useState(1)
  const pageSize = 5, set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const hasF = fStatus !== 'All' || fLoc !== 'All' || search !== ''

  const filtered = useMemo(() => centers.filter(c =>
    `${c.name} ${c.code} ${c.location} ${c.manager}`.toLowerCase().includes(search.toLowerCase()) &&
    (fStatus === 'All' || c.status === fStatus) && (fLoc === 'All' || c.location === fLoc)
  ), [centers, search, fStatus, fLoc])

  const rows  = filtered.slice((page - 1) * pageSize, page * pageSize)
  const total = useMemo(() => centers.reduce((s, c) => s + Number(c.capacity), 0), [centers])
  const clear = () => { setFStatus('All'); setFLoc('All'); setSearch(''); setPage(1) }

  const openAdd  = () => { setForm(MC_BLANK); setSelected(null); setModal('add') }
  const openEdit = c => { setSelected(c); setForm({ ...c, capacity: String(c.capacity) }); setModal('edit') }
  const openView = c => { setSelected(c); setModal('view') }
  const close    = () => { setModal(''); setSelected(null); setForm(MC_BLANK); setMenu(null) }
  const save     = e => { e.preventDefault(); const item = { ...form, capacity: Number(form.capacity) }; setRecords(item); close() }
  const setRecords = item => setCenters(old => modal === 'add' ? [{ ...item, id: Date.now() }, ...old] : old.map(c => c.id === selected.id ? { ...c, ...item } : c))
  const del      = c => { if (window.confirm(`Delete "${c.name}"?`)) { setCenters(old => old.filter(x => x.id !== c.id)); setMenu(null) } }
  const toggle   = c => { setCenters(old => old.map(x => x.id === c.id ? { ...x, status: x.status === 'Active' ? 'Inactive' : 'Active' } : x)); setMenu(null) }

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-gray-800">
      <main className="space-y-6 p-8">

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-3xl font-semibold">Milk Centers Management</h1><p className="mt-1 text-sm text-gray-500">Manage milk collection centers, operators, and daily milk collection activities.</p></div>
          <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-900"><Plus size={18}/> Add New Center</button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { title:'Total Centers',    value:centers.length,                                      subtitle:'All registered centers',   icon:Building2  },
            { title:'Active Centers',   value:centers.filter(c=>c.status==='Active').length,        subtitle:'Currently operational',    icon:CheckCircle},
            { title:'Inactive Centers', value:centers.filter(c=>c.status==='Inactive').length,      subtitle:'Not operational',          icon:XCircle    },
            { title:'Daily Capacity',   value:`${total.toLocaleString('en-IN')} L`,                 subtitle:'Total across all centers', icon:Milk       },
          ].map(s => <StatCard key={s.title} {...s}/>)}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-[380px]"><Search className="absolute left-3 top-3 text-gray-400" size={18}/>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search milk centers..." className="w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700"/>
          </div>
          <div className="relative">
            <button type="button" onClick={()=>setShowFilter(v=>!v)} className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-medium hover:border-green-700">
              <SlidersHorizontal size={17}/> Filters {hasF&&<span className="h-2 w-2 rounded-full bg-green-700"/>}
            </button>
            {showFilter && <div className="absolute left-0 top-14 z-10 w-56 space-y-3 rounded-xl border bg-white p-4 shadow-lg">
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
                <div className="flex gap-2">{['All',...MC_STATUSES].map(s=><button key={s} type="button" onClick={()=>{setFStatus(s);setPage(1)}} className={`rounded-full border px-3 py-1 text-xs font-medium ${fStatus===s?'border-green-700 bg-green-700 text-white':'hover:border-green-600 hover:text-green-700'}`}>{s}</button>)}</div>
              </div>
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Location</p>
                <select value={fLoc} onChange={e=>{setFLoc(e.target.value);setPage(1)}} className="w-full rounded-lg border p-2 text-xs outline-none focus:border-green-700">
                  <option value="All">All Locations</option>
                  {[...new Set(centers.map(c=>c.location))].map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <button type="button" onClick={()=>{clear();setShowFilter(false)}} className="w-full rounded-lg border py-2 text-xs font-medium text-gray-500 hover:bg-gray-50">Reset Filters</button>
            </div>}
          </div>
          {hasF && <button type="button" onClick={clear} className="text-xs text-gray-400 underline hover:text-gray-700">Clear all</button>}
          <span className="ml-auto text-xs text-gray-500">{filtered.length} records</span>
        </div>

        <div className="overflow-visible rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[11px] font-medium text-gray-500">
                <tr>{['CENTER NAME','CODE','LOCATION','MANAGER','CONTACT','CAPACITY','STATUS',''].map(h=><th key={h} className="whitespace-nowrap px-5 py-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map(c=>(
                  <tr key={c.id} className="border-t transition-colors hover:bg-gray-50">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-800"><Milk size={16}/></div><p className="text-xs font-semibold text-gray-800">{c.name}</p></div></td>
                    <Cell cls="font-medium text-green-800">{c.code}</Cell>
                    <Cell cls="text-gray-600">{c.location}</Cell>
                    <Cell cls="text-gray-600">{c.manager}</Cell>
                    <Cell cls="text-gray-600">{c.contact}</Cell>
                    <Cell cls="text-gray-600">{c.capacity} L</Cell>
                    <td className="px-5 py-4"><SBadge s={c.status}/></td>
                    <td className="relative px-5 py-4">
                      <button type="button" onClick={()=>setMenu(menu===c.id?null:c.id)} className="text-gray-400 hover:text-gray-700"><MoreHorizontal size={20}/></button>
                      {menu===c.id && <div className="absolute right-8 top-10 z-20 w-40 rounded-xl border bg-white p-1 shadow-lg">
                        {[['View Details',()=>{openView(c);setMenu(null)},''],['Edit',()=>{openEdit(c);setMenu(null)},''],[ c.status==='Active'?'Deactivate':'Activate',()=>toggle(c),''],['Delete',()=>del(c),'text-red-600 hover:bg-red-50']].map(([label,fn,cls])=>(
                          <button key={label} type="button" onClick={fn} className={`w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50 ${cls}`}>{label}</button>
                        ))}
                      </div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <TableEmptyState message="No milk centers found."/>}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-xs text-gray-500">
            <span>Showing {filtered.length?(page-1)*pageSize+1:0} to {Math.min(page*pageSize,filtered.length)} of {filtered.length} records</span>
            <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage}/>
          </div>
        </div>
      </main>

      <CommonModal isOpen={modal==='add'||modal==='edit'} onClose={close} title={modal==='add'?'Add New Milk Center':'Edit Milk Center'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {FIELDS.map(([name,type,label,req])=>(
              <Lbl key={name} label={label}><input name={name} type={type} required={req} min={type==='number'?1:undefined} placeholder={label} value={form[name]} onChange={set} className={inp}/></Lbl>
            ))}
            <Lbl label="Status"><select name="status" value={form.status} onChange={set} className={inp}>{MC_STATUSES.map(s=><option key={s}>{s}</option>)}</select></Lbl>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="rounded-lg bg-green-800 px-5 py-2 text-sm font-semibold text-white hover:bg-green-900">{modal==='add'?'Save Center':'Save Changes'}</button>
          </div>
        </form>
      </CommonModal>

      <CommonModal isOpen={modal==='view'} onClose={close} title="Milk Center Details">
        {selected && <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl bg-green-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-800 text-white"><Milk size={22}/></div>
            <div><p className="text-base font-bold text-gray-800">{selected.name}</p><p className="text-xs text-gray-500">{selected.code} · {selected.location}</p><div className="mt-1"><SBadge s={selected.status}/></div></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {VIEW_KEYS.map(([label,key])=>(
              <div key={label} className="rounded-lg border bg-gray-50 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-700">{selected[key]||'—'}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={()=>{close();openEdit(selected)}} className="rounded-lg border border-green-700 px-4 py-2 text-sm text-green-800 hover:bg-green-50">Edit</button>
            <button type="button" onClick={close} className="rounded-lg border px-5 py-2 text-sm">Close</button>
          </div>
        </div>}
      </CommonModal>
    </div>
  )
}
  