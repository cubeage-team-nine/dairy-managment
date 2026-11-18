import { useEffect, useMemo, useState } from 'react'
import { HeartPulse, Plus, RefreshCw, Search } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import api from '../../../core/services/api'
import { createDoctorMastitisCase } from '../doctors.service.js'
import { fetchAssignedAnimals } from '../../doctor-requests/doctor-requests.service'

const blank = { animal_id: '', test_date: new Date().toISOString().slice(0, 10), symptoms: '', affected_quarter: '', severity: 'MEDIUM', diagnosis: '', treatment: '', medicine: '', dose: '', follow_up_date: '', status: 'PENDING', doctor_notes: '' }
const statuses = ['PENDING', 'UNDER TREATMENT', 'MONITORING', 'RECOVERED']
const PAGE_SIZE = 10
const input = 'mt-1 w-full rounded-lg border p-2.5 text-sm outline-none focus:border-green-700'

export default function DoctorMastitisCasesPage() {
  const [cases, setCases] = useState([])
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [severity, setSeverity] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(false)
  const [historyCase, setHistoryCase] = useState(null)
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(blank)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [caseResponse, animalResponse] = await Promise.all([api.get('/doctor/mastitis-cases'), fetchAssignedAnimals()])
      setCases(caseResponse.data.items ?? []); setAnimals(animalResponse.data.items ?? [])
    } catch (err) { setError(err.response?.data?.detail || 'Unable to load assigned mastitis cases.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => cases.filter((item) =>
    (status === 'All' || item.status === status) &&
    (severity === 'All' || item.severity === severity) &&
    (!fromDate || item.test_date >= fromDate) && (!toDate || item.test_date <= toDate) &&
    [item.animal_tag, item.animal_name, item.farmer_name, item.village, item.symptoms, item.diagnosis, item.severity]
      .join(' ').toLowerCase().includes(search.toLowerCase())), [cases, status, severity, fromDate, toDate, search])
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const count = (state) => cases.filter((item) => item.status === state).length

  const openHistory = async (item) => {
    setHistoryCase(item); setHistory([]); setError('')
    try { const { data } = await api.get(`/doctor/mastitis-cases/${item.id}/history`); setHistory(data.items ?? []) }
    catch (err) { setError(err.response?.data?.detail || 'Unable to load case history.') }
  }

  const openAdd = () => { setSelected(null); setForm({ ...blank, animal_id: animals[0]?.id || '' }); setModal(true); setError('') }
  const openEdit = (item) => { setSelected(item); setForm({ ...blank, ...item }); setModal(true); setError('') }
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('')
    const payload = { ...form, follow_up_date: form.follow_up_date || null }
    for (const key of ['id','animal_tag','animal_name','farmer_name','farm_name','village','doctor_id','recovery_date','result']) delete payload[key]
    try {
      if (selected) {
        delete payload.animal_id
        const { data } = await api.patch(`/doctor/mastitis-cases/${selected.id}`, payload)
        setCases((current) => current.map((item) => item.id === data.id ? data : item)); setNotice('Mastitis case updated.')
      } else {
        const { data } = await createDoctorMastitisCase(payload)
        setCases((current) => [data, ...current]); setNotice('Mastitis case created.')
      }
      setModal(false); setSelected(null)
    } catch (err) { setError(err.response?.data?.detail || 'Unable to save the mastitis case.') }
    finally { setSaving(false) }
  }

  return <div className="space-y-5 p-5 text-slate-800 md:p-7">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Mastitis Cases</h1><p className="mt-1 text-sm text-slate-500">Cases for animals assigned to your doctor account.</p></div><div className="flex gap-2"><button type="button" onClick={load} className="rounded-lg border bg-white px-3 py-2"><RefreshCw size={15}/></button><button type="button" onClick={openAdd} disabled={!animals.length} className="flex items-center gap-2 rounded-lg bg-green-800 px-4 py-2 text-sm text-white disabled:opacity-50"><Plus size={16}/> New Case</button></div></header>
    {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice && <p role="status" className="rounded bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['All Cases',cases.length],...statuses.map((s) => [s,count(s)])].map(([title,value]) => <StatCard key={title} title={title} value={value} subtitle="Assigned mastitis cases" icon={HeartPulse}/>)}</div>
    <section className="overflow-hidden rounded-xl border bg-white"><div className="flex flex-wrap gap-2 border-b p-4"><div className="relative"><Search size={15} className="absolute left-3 top-2.5 text-slate-400"/><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search animal, farmer, symptoms..." className="w-72 rounded-lg border py-2 pl-9 pr-3 text-sm"/></div><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="rounded-lg border p-2 text-sm"><option>All</option>{statuses.map((s) => <option key={s}>{s}</option>)}</select><select value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1) }} className="rounded-lg border p-2 text-sm"><option value="All">All severities</option>{['LOW','MEDIUM','HIGH','EMERGENCY'].map((s) => <option key={s} value={s}>{s}</option>)}</select><label className="text-xs text-slate-500">From <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1) }} className="ml-1 rounded border p-2"/></label><label className="text-xs text-slate-500">To <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1) }} className="ml-1 rounded border p-2"/></label></div>
      {loading ? <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-green-700"/></div> : rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{['CASE','ANIMAL','FARMER / VILLAGE','SYMPTOMS','QUARTER','SEVERITY','DIAGNOSIS','TREATMENT','STATUS','CREATED',''].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{rows.map((item) => <tr key={item.id}><td className="px-3 py-3">{String(item.id).slice(0,8)}</td><td className="px-3 py-3">{item.animal_name || item.animal_tag}<p className="text-xs text-slate-500">{item.animal_tag}</p></td><td className="px-3 py-3">{item.farmer_name || '—'}<p className="text-xs text-slate-500">{item.village || '—'}</p></td><td className="max-w-36 truncate px-3 py-3">{item.symptoms || '—'}</td><td className="px-3 py-3">{item.affected_quarter || '—'}</td><td className="px-3 py-3">{item.severity || '—'}</td><td className="px-3 py-3">{item.diagnosis || item.result || '—'}</td><td className="max-w-36 truncate px-3 py-3">{item.treatment || '—'}</td><td className="px-3 py-3">{item.status}</td><td className="px-3 py-3">{item.created_at ? new Date(item.created_at).toLocaleDateString() : item.test_date}</td><td className="space-x-2 px-3 py-3"><button type="button" onClick={() => openEdit(item)} className="text-xs text-green-800 underline">Update</button><button type="button" onClick={() => openHistory(item)} className="text-xs text-blue-700 underline">History</button></td></tr>)}</tbody></table></div> : <TableEmptyState message="No mastitis cases found for assigned animals."/>}
      {!loading && <div className="border-t p-4"><TablePagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage}/></div>}
    </section>
    <CommonModal isOpen={modal} onClose={() => setModal(false)} title={selected ? 'Update Mastitis Case' : 'New Mastitis Case'}>
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Assigned animal<select required disabled={Boolean(selected)} value={form.animal_id} onChange={(e) => setForm({ ...form, animal_id: e.target.value })} className={input}><option value="">Select animal</option>{animals.map((animal) => <option key={animal.id} value={animal.id}>{animal.tag_number} · {animal.farmer_name}</option>)}</select></label><label className="text-sm">Case date<input required type="date" value={form.test_date} onChange={(e) => setForm({ ...form, test_date: e.target.value })} className={input}/></label>
        <label className="text-sm">Affected udder quarter<input value={form.affected_quarter || ''} onChange={(e) => setForm({ ...form, affected_quarter: e.target.value })} className={input}/></label><label className="text-sm">Severity<select value={form.severity || 'MEDIUM'} onChange={(e) => setForm({ ...form, severity: e.target.value })} className={input}>{['LOW','MEDIUM','HIGH','EMERGENCY'].map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="text-sm">Status<select value={form.status || 'PENDING'} onChange={(e) => setForm({ ...form, status: e.target.value })} className={input}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></label><label className="text-sm">Follow-up date<input type="date" value={form.follow_up_date || ''} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} className={input}/></label>
        <label className="text-sm sm:col-span-2">Symptoms<textarea rows={2} value={form.symptoms || ''} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className={input}/></label><label className="text-sm sm:col-span-2">Diagnosis<textarea rows={2} value={form.diagnosis || ''} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className={input}/></label><label className="text-sm sm:col-span-2">Treatment<textarea rows={2} value={form.treatment || ''} onChange={(e) => setForm({ ...form, treatment: e.target.value })} className={input}/></label>
        <label className="text-sm">Medicine<input value={form.medicine || ''} onChange={(e) => setForm({ ...form, medicine: e.target.value })} className={input}/></label><label className="text-sm">Dosage<input value={form.dose || ''} onChange={(e) => setForm({ ...form, dose: e.target.value })} className={input}/></label><label className="text-sm sm:col-span-2">Doctor notes<textarea rows={2} value={form.doctor_notes || ''} onChange={(e) => setForm({ ...form, doctor_notes: e.target.value })} className={input}/></label>
        <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setModal(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button disabled={saving} className="rounded-lg bg-green-800 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save Case'}</button></div>
      </form>
    </CommonModal>
    <CommonModal isOpen={Boolean(historyCase)} onClose={() => setHistoryCase(null)} title="Mastitis Case History">
      {historyCase && <div className="space-y-3"><p className="font-semibold">{historyCase.animal_tag} · {historyCase.farmer_name}</p>{history.length ? history.map((item) => <article key={item.id} className="rounded-lg border p-3"><p className="text-xs text-slate-500">{new Date(item.changed_at).toLocaleString()} · {item.status}</p><p className="mt-1 text-sm">{item.diagnosis || item.result || 'No diagnosis'} — {item.treatment || 'No treatment notes'}</p><p className="mt-1 text-xs">{item.medicine || ''} {item.dose || ''}</p></article>) : <p className="text-sm text-slate-500">No history yet.</p>}</div>}
    </CommonModal>
  </div>
}
