import { useState } from 'react'
import { Leaf, Package, CalendarDays, TriangleAlert, Search, Plus, Clock, ImagePlus } from 'lucide-react'
import StatCard from '../../../components/common/StatCard.jsx'
import CommonModal from '../../../components/modals/CommonModal.jsx'
import CommonTable from '../../../components/tables/CommonTable.jsx'
import TableActions from '../../../components/tables/TableActions.jsx'
import TableEmptyState from '../../../components/tables/TableEmptyState.jsx'
import TablePagination from '../../../components/tables/TablePagination.jsx'

const initialFeeds = [
  { id: 1, name: 'Green Fodder', type: 'Green', qty: 100, cost: 500, image: '' },
  { id: 2, name: 'Dry Fodder', type: 'Dry', qty: 50, cost: 400, image: '' },
  { id: 3, name: 'Cattle Feed', type: 'Concentrate', qty: 25, cost: 750, image: '' },
  { id: 4, name: 'Maize Silage', type: 'Silage', qty: 80, cost: 600, image: '' },
]
const types = ['Green', 'Dry', 'Concentrate', 'Silage', 'Supplement']
const blank = { name: '', type: 'Green', qty: '', cost: '', image: '' }
const money = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function FeedManagement() {
  const [feeds, setFeeds] = useState(initialFeeds)
  const [schedules, setSchedules] = useState([
    { id: 1, time: 'Morning - 6:00 AM', feed: 'Green Fodder', status: 'Completed' },
    { id: 2, time: 'Afternoon - 12:00 PM', feed: 'Dry Fodder', status: 'Pending' },
    { id: 3, time: 'Evening - 6:00 PM', feed: 'Cattle Feed', status: 'Pending' },
  ])
  const [data, setData] = useState(blank), [schedule, setSchedule] = useState({ time: '', feed: '' })
  const [search, setSearch] = useState(''), [editId, setEditId] = useState(null), [modal, setModal] = useState(''), [page, setPage] = useState(1)
  const pageSize = 5
  const input = 'w-full rounded-lg border p-2.5 text-sm outline-none focus:border-emerald-500'
  const filtered = feeds.filter(f => `${f.name} ${f.type}`.toLowerCase().includes(search.toLowerCase()))
  const stock = feeds.reduce((n, f) => n + Number(f.qty), 0)
  const value = feeds.reduce((n, f) => n + f.qty * f.cost, 0)
  const lowStock = feeds.filter(f => f.qty <= 25).length
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const openForm = f => { setData(f ? { ...f } : blank); setEditId(f?.id || null); setModal('form') }
  const closeModal = () => setModal('')

  const saveFeed = e => {
    e.preventDefault()
    if (feeds.some(f => f.name.toLowerCase() === data.name.trim().toLowerCase() && f.id !== editId)) return alert('Feed name already exists!')
    const item = { ...data, name: data.name.trim(), qty: Number(data.qty), cost: Number(data.cost), id: editId || Date.now() }
    setFeeds(old => editId ? old.map(f => f.id === editId ? item : f) : [...old, item])
    closeModal()
  }

  const columns = [
    { key: 'name', label: 'FEED', render: f => <div className="flex items-center gap-2">{f.image ? <img src={f.image} alt="" className="h-9 w-9 rounded object-cover"/> : <Leaf size={20} className="text-emerald-600"/>}{f.name}</div> },
    { key: 'type', label: 'TYPE' },
    { key: 'qty', label: 'QUANTITY', render: f => `${f.qty} kg` },
    { key: 'cost', label: 'COST/KG', render: f => money(f.cost) },
    { key: 'status', label: 'STATUS', render: f => <span className={`rounded-full px-3 py-1 text-xs ${f.qty <= 25 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{f.qty <= 25 ? 'Low Stock' : 'In Stock'}</span> },
    { key: 'actions', label: 'ACTIONS', render: f => <TableActions onEdit={() => openForm(f)} onView={() => { setData({ ...f }); setModal('view') }} onDelete={() => confirm('Delete this feed?') && setFeeds(old => old.filter(x => x.id !== f.id))}/> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-800 md:p-7">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Leaf size={36} className="text-emerald-600"/>
        <div className="flex-1"><h1 className="text-2xl font-bold">Feed Management</h1><p className="text-sm text-gray-500">Manage feed inventory and feeding schedules.</p></div>
        <button type="button" onClick={() => openForm()} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-white"><Plus size={18}/> Add Feed</button>
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Feed Stock" value={`${stock} kg`} subtitle="Across all feed types" icon={Leaf}/>
        <StatCard title="Total Stock Value" value={money(value)} subtitle="Quantity × cost per kg" icon={Package}/>
        <StatCard title="Feeding Schedules" value={schedules.length} subtitle={`${schedules.filter(s => s.status === 'Completed').length} completed`} icon={CalendarDays}/>
        <StatCard title="Low Stock Alerts" value={lowStock} subtitle="Items with 25 kg or less" icon={TriangleAlert}/>
      </div>
      <div className="grid items-start gap-5 2xl:grid-cols-[2fr_1fr]">
        <section className="min-w-0 rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold">Feed Inventory ({filtered.length})</h2>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2"><Search size={16}/><input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search feeds..." className="text-sm outline-none"/></div>
          </div>
          {rows.length ? <CommonTable columns={columns} data={rows}/> : <TableEmptyState message="No feed items found."/>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs">
            <span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} feeds</span>
            <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage}/>
          </div>
        </section>
        <section className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-4 flex justify-between"><h2 className="font-bold">Feeding Schedule</h2><button type="button" onClick={() => setModal('schedule')} className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><Plus/></button></div>
          {schedules.map(s => <div key={s.id} className="mb-3 rounded-lg border p-3">
            <p className="flex items-center gap-2 text-sm font-semibold"><Clock size={16} className="text-emerald-600"/>{s.time}</p>
            <p className="my-2 text-sm text-gray-500">{s.feed}</p>
            <button type="button" onClick={() => setSchedules(old => old.map(x => x.id === s.id ? { ...x, status: x.status === 'Completed' ? 'Pending' : 'Completed' } : x))} className={`rounded-full px-3 py-1 text-xs ${s.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{s.status}</button>
          </div>)}
          {lowStock > 0 && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800"><TriangleAlert size={16} className="mr-2 inline"/>{lowStock} feed items need attention.</p>}
        </section>
      </div>
      <CommonModal isOpen={!!modal} onClose={closeModal} title={modal === 'view' ? 'Feed Details' : modal === 'schedule' ? 'Add Schedule' : editId ? 'Edit Feed' : 'Add Feed'}>
        {modal === 'view' ? <div className="space-y-3">
          {data.image && <img src={data.image} alt={data.name} className="h-36 w-full rounded-lg object-cover"/>}
          <p><b>Feed Name:</b> {data.name}</p><p><b>Feed Type:</b> {data.type}</p>
          <p><b>Quantity:</b> {data.qty} kg</p><p><b>Cost/kg:</b> {money(data.cost)}</p>
          <p><b>Status:</b> {data.qty <= 25 ? 'Low Stock' : 'In Stock'}</p>
        </div> : modal === 'schedule' ? <form onSubmit={e => { e.preventDefault(); setSchedules(old => [...old, { ...schedule, id: Date.now(), status: 'Pending' }]); setSchedule({ time: '', feed: '' }); closeModal() }} className="space-y-4">
          <input required className={input} placeholder="Schedule time" value={schedule.time} onChange={e => setSchedule({ ...schedule, time: e.target.value })}/>
          <select required className={input} value={schedule.feed} onChange={e => setSchedule({ ...schedule, feed: e.target.value })}><option value="">Select feed</option>{feeds.map(f => <option key={f.id}>{f.name}</option>)}</select>
          <button type="submit" className="w-full rounded-lg bg-emerald-600 p-3 text-white">Save Schedule</button>
        </form> : <form onSubmit={saveFeed} className="space-y-4">
          <label className="block text-sm">Feed Name<input required className={input} value={data.name} onChange={e => setData({ ...data, name: e.target.value })}/></label>
          <label className="block text-sm">Feed Type<select className={input} value={data.type} onChange={e => setData({ ...data, type: e.target.value })}>{types.map(t => <option key={t}>{t}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3">{['qty', 'cost'].map(k => <label key={k} className="text-sm">{k === 'qty' ? 'Quantity (kg)' : 'Cost/kg (₹)'}<input required min="0" type="number" className={input} value={data[k]} onChange={e => setData({ ...data, [k]: e.target.value })}/></label>)}</div>
          <label className="flex items-center gap-2 rounded-lg border p-3 text-sm"><ImagePlus/>Upload image<input type="file" accept="image/*" className="w-36 text-xs" onChange={e => { const file = e.target.files?.[0]; if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return alert('Choose image under 5 MB.'); const reader = new FileReader(); reader.onload = () => setData(d => ({ ...d, image: reader.result })); reader.readAsDataURL(file) }}/></label>
          {data.image && <img src={data.image} alt="Preview" className="h-20 w-20 rounded-lg object-cover"/>}
          <button type="submit" className="w-full rounded-lg bg-emerald-600 p-3 text-white">{editId ? 'Update Feed' : 'Save Feed'}</button>
        </form>}
      </CommonModal>
    </div>
  )
}
