import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Clock, Zap } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import CommonTable from '../../../components/tables/CommonTable'
import TableActions from '../../../components/tables/TableActions'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import { getAnimals } from '../../animals/animals.service'
import {
  createBreedingRecord,
  deleteBreedingRecord,
  getBreedingRecords,
  updateBreedingRecord,
} from '../breeding.service'

const blank = {
  animal_id: '',
  lactation_number: '',
  breed: '',
  ai_date: '',
  pregnancy_status: 'UNKNOWN',
  pregnancy_confirmation_date: '',
  calving_date: '',
}
const statusLabels = {
  PREGNANT: 'Pregnant',
  NOT_PREGNANT: 'Not Pregnant',
  UNKNOWN: 'Unknown',
}
const input = 'w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm'
const list = (response) => response?.data?.items ?? response?.data ?? []
const dateValue = (value) => value || ''
const messageFrom = (error) =>
  error.response?.data?.detail || 'Unable to complete the request.'

export default function BreedingRecordsPage() {
  const [records, setRecords] = useState([])
  const [animals, setAnimals] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(blank)
  const [viewRecord, setViewRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [recordResponse, animalResponse] = await Promise.all([
        getBreedingRecords(),
        getAnimals(),
      ])
      setRecords(list(recordResponse))
      setAnimals(list(animalResponse))
    } catch (requestError) {
      setError(messageFrom(requestError))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const animalById = useMemo(
    () => new Map(animals.map((animal) => [animal.id, animal])),
    [animals],
  )
  const filtered = records.filter((record) => {
    const animal = animalById.get(record.animal_id)
    return `${animal?.tag_number ?? record.animal_tag} ${record.breed ?? ''}`
      .toLowerCase().includes(search.toLowerCase()) &&
      (filter === 'All' || record.pregnancy_status === filter)
  })
  const count = (status) =>
    records.filter((record) => record.pregnancy_status === status).length
  const close = () => {
    setModal(false)
    setEditId(null)
    setForm(blank)
  }
  const openAdd = () => {
    setEditId(null)
    setForm(blank)
    setModal(true)
  }
  const openEdit = (record) => {
    setEditId(record.id)
    setForm({
      animal_id: record.animal_id,
      lactation_number: record.lactation_number ?? '',
      breed: record.breed ?? '',
      ai_date: dateValue(record.ai_date),
      pregnancy_status: record.pregnancy_status ?? 'UNKNOWN',
      pregnancy_confirmation_date: dateValue(record.pregnancy_confirmation_date),
      calving_date: dateValue(record.calving_date),
    })
    setModal(true)
  }
  const change = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      lactation_number: form.lactation_number ? Number(form.lactation_number) : null,
      breed: form.breed || null,
      ai_date: form.ai_date || null,
      pregnancy_confirmation_date: form.pregnancy_confirmation_date || null,
      calving_date: form.calving_date || null,
    }
    try {
      if (editId) {
        const update = { ...payload }
        delete update.animal_id
        await updateBreedingRecord(editId, update)
      } else {
        await createBreedingRecord(payload)
      }
      close()
      await load()
    } catch (requestError) {
      setError(messageFrom(requestError))
    } finally {
      setSaving(false)
    }
  }
  const remove = async (id) => {
    if (!window.confirm('Delete this breeding record?')) return
    try {
      await deleteBreedingRecord(id)
      await load()
    } catch (requestError) {
      setError(messageFrom(requestError))
    }
  }

  const columns = [
    { key: 'animal_tag', label: 'HERD TAG', render: (record) =>
      animalById.get(record.animal_id)?.tag_number ?? record.animal_tag ?? '—' },
    { key: 'breed', label: 'BREED', render: (record) => record.breed || '—' },
    { key: 'ai_date', label: 'AI DATE', render: (record) => record.ai_date || '—' },
    { key: 'lactation_number', label: 'LACTATION', render: (record) => record.lactation_number ?? '—' },
    { key: 'pregnancy_status', label: 'PREGNANCY', render: (record) =>
      statusLabels[record.pregnancy_status] || '—' },
    { key: 'pregnancy_confirmation_date', label: 'CONFIRMED', render: (record) =>
      record.pregnancy_confirmation_date || '—' },
    { key: 'calving_date', label: 'CALVING DATE', render: (record) => record.calving_date || '—' },
    { key: 'actions', label: 'ACTIONS', render: (record) => (
      <TableActions
        onEdit={() => openEdit(record)}
        onView={() => setViewRecord(record)}
        onDelete={() => remove(record.id)}
      />
    ) },
  ]

  return (
    <div className="min-h-screen space-y-6 bg-[#fbfbfa] p-6 text-slate-800 md:p-10">
      <header className="flex flex-wrap justify-between gap-4 border-b pb-4">
        <div><h1 className="text-2xl font-bold">Breeding Records</h1><p className="text-sm text-slate-500">Track pregnancy and calving history.</p></div>
        <input placeholder="Search animal tag or breed..." value={search} onChange={(event) => setSearch(event.target.value)} className={`${input} sm:w-80`} />
      </header>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <section className="grid gap-5 md:grid-cols-3">
        <StatCard title="Pregnant" value={count('PREGNANT')} subtitle="Saved records" icon={CheckCircle} />
        <StatCard title="Not Pregnant" value={count('NOT_PREGNANT')} subtitle="Saved records" icon={Clock} />
        <StatCard title="Unknown Status" value={count('UNKNOWN')} subtitle="Saved records" icon={Zap} />
      </section>
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          {['All', 'PREGNANT', 'NOT_PREGNANT', 'UNKNOWN'].map((status) => (
            <button key={status} onClick={() => setFilter(status)} className={`rounded-lg px-3 py-2 text-xs ${filter === status ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>
              {status === 'All' ? 'All' : statusLabels[status]}
            </button>
          ))}
        </div>
        <button onClick={openAdd} className="rounded-full bg-[#235339] px-5 py-2.5 text-sm text-white">+ Log Breeding Event</button>
      </section>
      <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        {loading ? <p className="p-6 text-sm text-slate-500">Loading breeding records…</p>
          : filtered.length ? <CommonTable columns={columns} data={filtered} />
            : <TableEmptyState message="No breeding records found." />}
      </section>

      <CommonModal isOpen={modal} onClose={close} title={editId ? 'Update Breeding Record' : 'Log Breeding Event'}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!editId && <label className="text-xs font-bold">Animal
              <select required name="animal_id" value={form.animal_id} onChange={change} className={input}>
                <option value="">Select animal</option>
                {animals.map((animal) => <option key={animal.id} value={animal.id}>{animal.tag_number} · {animal.animal_type}</option>)}
              </select>
            </label>}
            <label className="text-xs font-bold">Breed<input name="breed" value={form.breed} onChange={change} className={input} /></label>
            <label className="text-xs font-bold">Lactation Number<input type="number" min="1" name="lactation_number" value={form.lactation_number} onChange={change} className={input} /></label>
            <label className="text-xs font-bold">AI Date<input type="date" name="ai_date" value={form.ai_date} onChange={change} className={input} /></label>
            <label className="text-xs font-bold">Pregnancy Status
              <select name="pregnancy_status" value={form.pregnancy_status} onChange={change} className={input}>
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold">Pregnancy Confirmation Date<input type="date" name="pregnancy_confirmation_date" value={form.pregnancy_confirmation_date} onChange={change} className={input} /></label>
            <label className="text-xs font-bold">Calving Date<input type="date" name="calving_date" value={form.calving_date} onChange={change} className={input} /></label>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button disabled={saving} className="rounded-lg bg-[#235339] px-5 py-2 text-sm text-white disabled:opacity-60">{saving ? 'Saving…' : editId ? 'Save Changes' : 'Save Record'}</button>
          </div>
        </form>
      </CommonModal>
      <CommonModal isOpen={!!viewRecord} onClose={() => setViewRecord(null)} title="View Breeding Record">
        {viewRecord && <div className="grid grid-cols-2 gap-4 text-sm">
          <p>Animal: {animalById.get(viewRecord.animal_id)?.tag_number ?? viewRecord.animal_tag}</p>
          <p>Breed: {viewRecord.breed || '—'}</p>
          <p>Lactation: {viewRecord.lactation_number ?? '—'}</p>
          <p>AI Date: {viewRecord.ai_date || '—'}</p>
          <p>Pregnancy: {statusLabels[viewRecord.pregnancy_status] || '—'}</p>
          <p>Confirmation: {viewRecord.pregnancy_confirmation_date || '—'}</p>
          <p>Calving: {viewRecord.calving_date || '—'}</p>
        </div>}
      </CommonModal>
    </div>
  )
}
