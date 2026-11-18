import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search, HeartPulse } from 'lucide-react'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import { fetchAssignedAnimals, fetchAssignedAnimalHistory } from '../../doctor-requests/doctor-requests.service'

const PAGE_SIZE = 10
const ageLabel = (days) => days == null ? '—' : `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m`

export default function AssignedAnimalsPage() {
  const [animals, setAnimals] = useState([])
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const [health, setHealth] = useState('All')
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  const load = async () => {
    setLoading(true); setError('')
    try { const { data } = await fetchAssignedAnimals(); setAnimals(data.items ?? []) }
    catch (err) { setError(err.response?.data?.detail || 'Unable to load assigned animals.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const types = [...new Set(animals.map((animal) => animal.animal_type).filter(Boolean))]
  const filtered = useMemo(() => animals.filter((animal) =>
    (type === 'All' || animal.animal_type === type) &&
    (health === 'All' || (health === 'Needs review' ? animal.health_status !== 'No recent health issue' : animal.health_status === 'No recent health issue')) &&
    [animal.tag_number, animal.animal_name, animal.animal_type, animal.breed, animal.farmer_name, animal.farm_name, animal.village]
      .join(' ').toLowerCase().includes(search.toLowerCase())), [animals, type, health, search])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openDetails = async (animal) => {
    setSelected(animal); setHistory([]); setDetailLoading(true)
    try { const { data } = await fetchAssignedAnimalHistory(animal.id); setHistory(data.items ?? []) }
    catch (err) { setError(err.response?.data?.detail || 'Unable to load animal health history.') }
    finally { setDetailLoading(false) }
  }

  return <div className="space-y-5 p-5 text-slate-800 md:p-7">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">Assigned Animals</h1><p className="mt-1 text-sm text-slate-500">Animals linked to requests you accepted or completed.</p></div><button type="button" onClick={load} className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm"><RefreshCw size={15}/> Refresh</button></header>
    {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <section className="overflow-hidden rounded-xl border bg-white">
      <div className="flex flex-wrap gap-3 border-b p-4"><div className="relative"><Search size={15} className="absolute left-3 top-2.5 text-slate-400"/><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search tag, breed, farmer..." className="w-72 rounded-lg border py-2 pl-9 pr-3 text-sm"/></div><select value={type} onChange={(e) => { setType(e.target.value); setPage(1) }} className="rounded-lg border p-2 text-sm"><option value="All">All types</option>{types.map((item) => <option key={item}>{item}</option>)}</select><select value={health} onChange={(e) => { setHealth(e.target.value); setPage(1) }} className="rounded-lg border p-2 text-sm"><option>All</option><option>Needs review</option><option>No recent health issue</option></select></div>
      {loading ? <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-green-700"/></div> : rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{['ANIMAL / TAG','TYPE & BREED','AGE / GENDER','FARMER','FARM / VILLAGE','HEALTH',''].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y">{rows.map((animal) => <tr key={animal.id}><td className="px-4 py-3 font-medium">{animal.animal_name}<p className="text-xs text-slate-500">{animal.tag_number}</p></td><td className="px-4 py-3">{animal.animal_type}<p className="text-xs text-slate-500">{animal.breed || '—'}</p></td><td className="px-4 py-3">{ageLabel(animal.age_days)}<p className="text-xs text-slate-500">{animal.gender || '—'}</p></td><td className="px-4 py-3">{animal.farmer_name}</td><td className="px-4 py-3">{animal.farm_name}<p className="text-xs text-slate-500">{animal.village || '—'}</p></td><td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-xs"><HeartPulse size={14}/>{animal.health_status}</span></td><td className="px-4 py-3"><button type="button" onClick={() => openDetails(animal)} className="text-xs font-medium text-green-800 underline">History</button></td></tr>)}</tbody></table></div> : <TableEmptyState message="No accepted or completed requests have assigned animals."/>}
      {!loading && <div className="flex items-center justify-between border-t p-4 text-xs text-slate-500"><span>{filtered.length} assigned animals</span><TablePagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage}/></div>}
    </section>
    <CommonModal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="Animal Health History">
      {selected && <div className="space-y-3"><p className="font-semibold">{selected.animal_name} · {selected.tag_number} — {selected.farmer_name}</p>{detailLoading ? <p className="text-sm text-slate-500">Loading history...</p> : history.length ? history.map((record) => <article key={record.id} className="rounded-lg border p-3"><p className="text-xs text-slate-500">{record.visit_date} · {record.disease || 'Health record'}</p><p className="mt-1 text-sm">{record.treatment || record.doctor_recommendation || 'No treatment notes.'}</p>{record.medicine && <p className="mt-1 text-xs">{record.medicine} {record.dose || ''}</p>}</article>) : <p className="text-sm text-slate-500">No previous health records.</p>}</div>}
    </CommonModal>
      </div>
}
