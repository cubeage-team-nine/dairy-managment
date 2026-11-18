import { useCallback, useEffect, useMemo, useState } from 'react'
import { HeartPulse, Plus, RefreshCw, Search } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import { createDoctorHealthRecord, fetchAssignedAnimals, fetchDoctorHealthRecords, updateDoctorHealthRecord } from '../../doctor-requests/doctor-requests.service'

const blank = { animal_id: '', disease: '', symptoms: '', treatment: '', medicine: '', dose: '', treatment_duration: '', visit_date: new Date().toISOString().slice(0, 10), follow_up_date: '', health_status: 'Ongoing', doctor_notes: '', doctor_recommendation: '' }
const PAGE_SIZE = 10
const input = 'mt-1 w-full rounded-lg border p-2.5 text-sm outline-none focus:border-green-700'

export default function DoctorHealthRecordsPage() {
  const [records, setRecords] = useState([])
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [healthStatus, setHealthStatus] = useState('All')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(blank)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [animalResponse, recordResponse] = await Promise.all([fetchAssignedAnimals(), fetchDoctorHealthRecords()])
      setAnimals(animalResponse.data.items ?? []); setRecords(recordResponse.data.items ?? [])
    } catch (err) { setError(err.response?.data?.detail || 'Unable to load doctor health records.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => records.filter((record) => {
    const matchesSearch = [record.animal_tag, record.animal_name, record.farmer_name, record.disease, record.health_status].join(' ').toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (!fromDate || record.visit_date >= fromDate) && (!toDate || record.visit_date <= toDate) &&
      (healthStatus === 'All' || record.health_status === healthStatus)
  }), [records, search, fromDate, toDate, healthStatus])
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const openAdd = () => { setSelected(null); setForm({ ...blank, animal_id: animals[0]?.id || '' }); setModal(true); setError('') }
  const openEdit = (record) => { setSelected(record); setForm({ ...blank, ...record, animal_id: record.animal_id }); setModal(true); setError('') }
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('')
    const payload = { ...form, follow_up_date: form.follow_up_date || null }
    delete payload.id; delete payload.animal_tag; delete payload.animal_name; delete payload.animal_type; delete payload.breed; delete payload.farmer_name; delete payload.farm_name; delete payload.village; delete payload.doctor_id; delete payload.doctor_name; delete payload.treatment_start_date
    try {
      if (selected) {
        delete payload.animal_id
        const { data } = await updateDoctorHealthRecord(selected.id, payload)
        setRecords((current) => current.map((item) => item.id === data.id ? data : item)); setNotice('Health record updated.')
      } else {
        const { data } = await createDoctorHealthRecord(payload)
        setRecords((current) => [data, ...current]); setNotice('Health record saved.')
      }
      setModal(false); setSelected(null)
    } catch (err) { setError(err.response?.data?.detail || 'Unable to save the health record.') }
    finally { setSaving(false) }
  }

  return <div className="space-y-5 p-5 text-slate-800 md:p-7">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Health Records</h1><p className="mt-1 text-sm text-slate-500">Create and manage treatment history for animals assigned to you.</p></div><div className="flex gap-2"><button type="button" onClick={load} className="rounded-lg border bg-white px-3 py-2 text-sm"><RefreshCw size={15}/></button><button type="button" onClick={openAdd} disabled={!animals.length} className="flex items-center gap-2 rounded-lg bg-green-800 px-4 py-2 text-sm text-white disabled:opacity-50"><Plus size={16}/> Add Health Record</button></div></header>
    {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice && <p role="status" className="rounded bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
    <StatCard title="Doctor Health Records" value={records.length} subtitle="Saved treatment entries" icon={HeartPulse}/>
    <section className="overflow-hidden rounded-xl border bg-white"><div className="flex flex-wrap gap-2 border-b p-4"><div className="relative"><Search size={15} className="absolute left-3 top-2.5 text-slate-400"/><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search animal, tag, diagnosis..." className="w-64 rounded-lg border py-2 pl-9 pr-3 text-sm"/></div><label className="text-xs text-slate-500">From <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1) }} className="ml-1 rounded border p-2"/></label><label className="text-xs text-slate-500">To <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1) }} className="ml-1 rounded border p-2"/></label><select value={healthStatus} onChange={(e) => { setHealthStatus(e.target.value); setPage(1) }} className="rounded-lg border p-2 text-sm"><option>All</option>{['Under Treatment','Monitoring','Recovered','Follow-up Required'].map((s) => <option key={s}>{s}</option>)}</select></div>
      {loading ? <div className="flex justify-center p-12"><RefreshCw className="animate-spin text-green-700"/></div> : rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{['DATE','ANIMAL','FARMER','DIAGNOSIS','TREATMENT','FOLLOW-UP','HEALTH STATUS',''].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody className="divide-y">{rows.map((r) => <tr key={r.id}><td className="px-4 py-3">{r.visit_date}</td><td className="px-4 py-3">{r.animal_name}<p className="text-xs text-slate-500">{r.animal_tag}</p></td><td className="px-4 py-3">{r.farmer_name}</td><td className="px-4 py-3">{r.disease || '—'}</td><td className="max-w-48 truncate px-4 py-3">{r.treatment || '—'}</td><td className="px-4 py-3">{r.follow_up_date || '—'}</td><td className="px-4 py-3">{r.health_status || '—'}</td><td className="px-4 py-3"><button type="button" onClick={() => openEdit(r)} className="text-xs text-green-800 underline">Edit</button></td></tr>)}</tbody></table></div> : <TableEmptyState message="No health records found for assigned animals."/>}
      {!loading && <div className="border-t p-4"><TablePagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage}/></div>}
    </section>
    <CommonModal isOpen={modal} onClose={() => { setModal(false); setError('') }} title={selected ? 'Edit Health Record' : 'New Health Record'}>
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Animal<select required disabled={Boolean(selected)} value={form.animal_id} onChange={(e) => setForm({ ...form, animal_id: e.target.value })} className={input}><option value="">Select assigned animal</option>{animals.map((animal) => <option key={animal.id} value={animal.id}>{animal.tag_number} · {animal.farmer_name}</option>)}</select></label>
        <label className="text-sm">Diagnosis<input value={form.disease || ''} onChange={(e) => setForm({ ...form, disease: e.target.value })} className={input}/></label>
        <label className="text-sm">Treatment date<input required type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} className={input}/></label>
        <label className="text-sm">Follow-up date<input type="date" value={form.follow_up_date || ''} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} className={input}/></label>
        <label className="text-sm">Medicine<input value={form.medicine || ''} onChange={(e) => setForm({ ...form, medicine: e.target.value })} className={input}/></label><label className="text-sm">Medicine dosage<input value={form.dose || ''} onChange={(e) => setForm({ ...form, dose: e.target.value })} className={input}/></label>
        <label className="text-sm">Treatment duration<input value={form.treatment_duration || ''} onChange={(e) => setForm({ ...form, treatment_duration: e.target.value })} placeholder="e.g. 5 days" className={input}/></label>
        <label className="text-sm">Treatment status<select value={form.health_status || 'Ongoing'} onChange={(e) => setForm({ ...form, health_status: e.target.value })} className={input}>{['Ongoing','Completed','Follow-up Required','Monitoring'].map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="text-sm">Symptoms<textarea rows={2} value={form.symptoms || ''} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className={input}/></label>
        <label className="text-sm sm:col-span-2">Treatment<textarea rows={3} value={form.treatment || ''} onChange={(e) => setForm({ ...form, treatment: e.target.value })} className={input}/></label>
        <label className="text-sm sm:col-span-2">Doctor notes<textarea rows={2} value={form.doctor_notes || ''} onChange={(e) => setForm({ ...form, doctor_notes: e.target.value })} className={input}/></label>
        <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setModal(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button disabled={saving} className="rounded-lg bg-green-800 px-4 py-2 text-sm text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save Record'}</button></div>
      </form>
    </CommonModal>
  </div>
}
