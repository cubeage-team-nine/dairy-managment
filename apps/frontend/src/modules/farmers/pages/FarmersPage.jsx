import { useState } from 'react'
import { Search, Plus, SlidersHorizontal, MoreHorizontal } from 'lucide-react'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'

const blank = { name: '', farm: '', location: '', animals: '', status: 'Active' }
const inp = 'w-full border rounded-lg p-3 text-sm outline-none focus:border-green-700'

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState([
    { id: 1, name: 'Rohan Patil',   farm: 'Green Valley',   location: 'Nashik, MH',  animals: 126, status: 'Active'  },
    { id: 2, name: 'Meera Desai',   farm: 'Sunrise Dairy',  location: 'Anand, GJ',   animals: 84,  status: 'Active'  },
    { id: 3, name: 'Vikram Singh',  farm: 'Aarav Farms',    location: 'Jaipur, RJ',  animals: 68,  status: 'Pending' },
    { id: 4, name: 'Anita Rao',     farm: 'Krishna Dairy',  location: 'Mysuru, KA',  animals: 112, status: 'Active'  },
  ])
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('All')
  const [showFilter, setShowFilter] = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [menu, setMenu]             = useState(null)
  const [form, setForm]             = useState(blank)
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const filtered = farmers.filter(f =>
    `${f.name} ${f.farm} ${f.location}`.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'All' || f.status === filter)
  )

  const addFarmer = e => {
    e.preventDefault()
    setFarmers(old => [{ ...form, id: Date.now(), animals: Number(form.animals) }, ...old])
    setForm(blank)
    setShowModal(false)
  }

  const toggleStatus = id => setFarmers(old => old.map(f => f.id === id ? { ...f, status: f.status === 'Active' ? 'Pending' : 'Active' } : f))

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-gray-800">
      <main className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Farmer Management</h1>
            <p className="text-gray-500 mt-2">Manage registered farmers and their account status.</p>
          </div>
          <button type="button" onClick={() => setShowModal(true)}
            className="bg-green-800 hover:bg-green-900 text-white px-5 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg">
            <Plus size={19} /> Add new
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-full max-w-[360px]">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search farmers..."
              className="w-full bg-white border rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700" />
          </div>
          <div className="relative">
            <button type="button" onClick={() => setShowFilter(v => !v)}
              className="bg-white border rounded-xl px-5 py-3 flex items-center gap-2 font-medium">
              <SlidersHorizontal size={18} /> Filters
            </button>
            {showFilter && (
              <div className="absolute z-10 top-14 left-0 bg-white border rounded-xl shadow-lg w-36 p-2">
                {['All', 'Active', 'Pending'].map(s => (
                  <button key={s} type="button" onClick={() => { setFilter(s); setShowFilter(false) }}
                    className="block w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 text-sm">{s}</button>
                ))}
              </div>
            )}
          </div>
          <span className="ml-auto text-xs text-gray-500">{filtered.length} records</span>
        </div>

        <div className="bg-white border rounded-2xl overflow-visible shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-[11px]">
                <tr>{['FARMER', 'FARM', 'LOCATION', 'ANIMALS', 'STATUS', ''].map(h =>
                  <th key={h} className="px-5 py-4 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-5 text-xs font-semibold">{f.name}</td>
                    <td className="px-5 py-5 text-xs text-gray-600">{f.farm}</td>
                    <td className="px-5 py-5 text-xs text-gray-600">{f.location}</td>
                    <td className="px-5 py-5 text-xs">{f.animals}</td>
                    <td className="px-5 py-5">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${f.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-5 py-5 relative">
                      <button type="button" onClick={() => setMenu(menu === f.id ? null : f.id)}
                        className="text-gray-400 hover:text-gray-800"><MoreHorizontal size={20} /></button>
                      {menu === f.id && (
                        <div className="absolute right-8 top-10 z-20 bg-white shadow-lg border rounded-lg w-32 p-1">
                          <button type="button" onClick={() => { toggleStatus(f.id); setMenu(null) }}
                            className="w-full text-left text-xs p-2 hover:bg-gray-100">Change Status</button>
                          <button type="button" onClick={() => { if (window.confirm('Delete this farmer?')) setFarmers(old => old.filter(x => x.id !== f.id)); setMenu(null) }}
                            className="w-full text-left text-xs p-2 text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filtered.length && <TableEmptyState message="No farmers found." />}
        </div>
      </main>

      <CommonModal isOpen={showModal} onClose={() => { setShowModal(false); setForm(blank) }} title="Add New Farmer">
        <form onSubmit={addFarmer} className="space-y-4">
          {[['name', 'text', 'Name'], ['farm', 'text', 'Farm'], ['location', 'text', 'Location'], ['animals', 'number', 'Animals']].map(([name, type, placeholder]) => (
            <input key={name} name={name} required type={type} placeholder={placeholder}
              value={form[name]} onChange={set} className={inp} />
          ))}
          <select name="status" value={form.status} onChange={set} className={inp}>
            <option>Active</option><option>Pending</option>
          </select>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={() => { setShowModal(false); setForm(blank) }} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="bg-green-800 text-white rounded-lg px-5 py-2 text-sm font-semibold">Save Farmer</button>
          </div>
        </form>
      </CommonModal>
    </div>
  )
}
