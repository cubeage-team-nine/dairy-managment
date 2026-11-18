import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, CalendarDays, Stethoscope, ShieldCheck } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import CommonTable from '../../../components/tables/CommonTable'
import TableActions from '../../../components/tables/TableActions'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import { getAnimals } from '../../animals/animals.service'
import {
  createMyHealthRecord,
  deleteMyHealthRecord,
  getMyHealthRecords,
  updateMyHealthRecord,
} from '../../farmers/farmers.service'

const blank = {
  animal_id: '',
  visit_date: new Date().toISOString().slice(0, 10),
  disease: '',
  medicine: '',
  dose: '',
  treatment: '',
  doctor_recommendation: '',
  symptoms: '',
  treatment_duration: '',
  doctor_notes: '',
  follow_up_date: '',
  health_status: '',
}
const input = 'w-full rounded-lg border p-3 text-sm outline-none focus:border-green-500'
const list = (response) => response?.data?.items ?? response?.data ?? []
const errorText = (error) => error.response?.data?.detail || 'Unable to complete the request.'
const treatmentStatus = (value) => ({ 'Under Treatment': 'Ongoing', Recovered: 'Completed' }[value] || value || '—')
const formFields = [
  ['visit_date', 'Treatment Start Date', 'date'],
  ['disease', 'Disease / Health Issue', 'text'],
  ['symptoms', 'Symptoms', 'textarea'],
  ['medicine', 'Medicine', 'text'],
  ['dose', 'Medicine Dosage', 'text'],
  ['treatment_duration', 'Treatment Duration', 'text'],
  ['treatment', 'Treatment', 'textarea'],
  ['doctor_recommendation', 'Doctor Recommendation', 'textarea'],
  ['doctor_notes', 'Doctor Notes', 'textarea'],
  ['follow_up_date', 'Follow-up Date', 'date'],
  ['health_status', 'Treatment Status', 'text'],
]

export default function HealthRecordsPage() {
  const [records, setRecords] = useState([])
  const [animals, setAnimals] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewRecord, setViewRecord] = useState(null)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form, setForm] = useState(blank)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const pageSize = 5

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [recordResponse, animalResponse] = await Promise.all([
        getMyHealthRecords(),
        getAnimals(),
      ])
      setRecords(list(recordResponse))
      setAnimals(list(animalResponse))
    } catch (requestError) {
      setError(errorText(requestError))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const animalsById = useMemo(
    () => new Map(animals.map((animal) => [animal.id, animal])),
    [animals],
  )
  const filtered = records.filter((record) => {
    const animal = animalsById.get(record.animal_id)
    return `${record.animal_tag ?? animal?.tag_number ?? ''} ${record.disease ?? ''} ${record.treatment ?? ''} ${record.medicine ?? ''}`
      .toLowerCase().includes(search.toLowerCase())
  })
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const thisMonth = new Date().toISOString().slice(0, 7)
  const ownedRecords = records.filter((record) => !record.doctor_id)

  const closeModal = () => {
    setShowModal(false)
    setForm(blank)
    setEditingRecord(null)
  }
  const openAdd = () => {
    setEditingRecord(null)
    setForm(blank)
    setShowModal(true)
  }
  const openEdit = (record) => {
    setEditingRecord(record)
    setForm({
      animal_id: record.animal_id,
      visit_date: record.visit_date,
      treatment_duration: record.treatment_duration ?? '',
      disease: record.disease ?? '',
      symptoms: record.symptoms ?? '',
      medicine: record.medicine ?? '',
      dose: record.dose ?? '',
      treatment_duration: record.treatment_duration ?? '',
      treatment: record.treatment ?? '',
      doctor_recommendation: record.doctor_recommendation ?? '',
      doctor_notes: record.doctor_notes ?? '',
      follow_up_date: record.follow_up_date ?? '',
      health_status: record.health_status ?? '',
    })
    setShowModal(true)
  }
  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }
  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      disease: form.disease || null,
      medicine: form.medicine || null,
      dose: form.dose || null,
      treatment: form.treatment || null,
      doctor_recommendation: form.doctor_recommendation || null,
    }
    try {
      if (editingRecord) {
        const update = { ...payload }
        delete update.animal_id
        await updateMyHealthRecord(editingRecord.id, update)
      } else {
        await createMyHealthRecord(payload)
      }
      closeModal()
      await load()
    } catch (requestError) {
      setError(errorText(requestError))
    } finally {
      setSaving(false)
    }
  }
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this health record?')) return
    try {
      await deleteMyHealthRecord(id)
      await load()
    } catch (requestError) {
      setError(errorText(requestError))
    }
  }

  const columns = [
    { key: 'visit_date', label: 'TREATMENT START' },
    { key: 'animal_tag', label: 'ANIMAL TAG', render: (record) =>
      record.animal_tag ?? animalsById.get(record.animal_id)?.tag_number ?? '—' },
    { key: 'disease', label: 'HEALTH ISSUE', render: (record) => <>{record.disease || '—'}<p className="max-w-52 truncate text-xs text-gray-500">{record.symptoms || ''}</p></> },
    { key: 'medicine', label: 'MEDICINE / DOSAGE', render: (record) => <>{record.medicine || '—'}<p className="text-xs text-gray-500">{record.dose || 'Dosage not listed'}</p></> },
    { key: 'health_status', label: 'TREATMENT STATUS', render: (record) => treatmentStatus(record.health_status) },
    { key: 'doctor_name', label: 'DOCTOR', render: (record) => record.doctor_name
      ? <span className="flex items-center gap-1 text-xs text-gray-600"><Stethoscope size={13} />{record.doctor_name}</span>
      : <span className="flex items-center gap-1 text-xs text-green-700"><ShieldCheck size={13} />Farmer entry</span> },
    { key: 'actions', label: 'ACTIONS', render: (record) => record.doctor_id
      ? <button type="button" onClick={() => setViewRecord(record)} className="rounded-md border px-3 py-2 text-xs">View</button>
      : <TableActions onEdit={() => openEdit(record)} onView={() => setViewRecord(record)} onDelete={() => handleDelete(record.id)} /> },
  ]

  const detail = (record) => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div><label className="mb-1 block text-xs text-gray-500">Animal Name / Tag</label><p className="rounded-lg border bg-gray-50 p-3 text-sm">{record.animal_name ?? record.animal_tag ?? animalsById.get(record.animal_id)?.tag_number ?? '—'}</p></div>
      {formFields.filter(([name]) => name !== 'doctor_recommendation').map(([name, label]) => (
        <div key={name}><label className="mb-1 block text-xs text-gray-500">{label}</label><p className="rounded-lg border bg-gray-50 p-3 text-sm whitespace-pre-wrap">{name === 'health_status' ? treatmentStatus(record[name]) : record[name] || '—'}</p></div>
      ))}
      <div><label className="mb-1 block text-xs text-gray-500">Doctor</label><p className="rounded-lg border bg-gray-50 p-3 text-sm">{record.doctor_name || 'Farmer entry'}</p></div>
      <div><label className="mb-1 block text-xs text-gray-500">Doctor Recommendation</label><p className="rounded-lg border bg-gray-50 p-3 text-sm whitespace-pre-wrap">{record.doctor_recommendation || '—'}</p></div>
    </div>
  )

  return (
    <div className="min-h-full bg-[#FBFCF8] text-[#17251B]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-white px-6 py-5">
        <div>
          <h1 className="text-2xl font-semibold">Health Logs & Disease Surveillance</h1>
          <p className="mt-1 text-xs text-gray-500">Monitor health records for your animals.</p>
        </div>
        <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm text-white"><Plus size={16} /> Add Health Record</button>
      </header>
      {error && <p role="alert" className="mx-6 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="grid gap-4 p-6 sm:grid-cols-3">
        <StatCard title="Health Records" value={records.length} subtitle="Records for your animals" icon={Stethoscope} />
        <StatCard title="This Month" value={records.filter((record) => record.visit_date?.slice(0, 7) === thisMonth).length} subtitle="Visits recorded this month" icon={CalendarDays} />
        <StatCard title="Farmer Entries" value={ownedRecords.length} subtitle="Records entered by you" icon={ShieldCheck} />
      </div>
      <section className="mx-6 mb-6 overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search animal, issue, medicine..." className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-500" />
          </div>
        </div>
        <div className="p-4">
          {loading ? <p className="py-6 text-sm text-gray-500">Loading health records…</p>
            : rows.length ? <CommonTable columns={columns} data={rows} />
              : <TableEmptyState message="No health records found." />}
          {!loading && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs text-gray-500">
            <span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} records</span>
            <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
          </div>}
        </div>
      </section>
      <CommonModal isOpen={showModal} onClose={closeModal} title={editingRecord ? 'Edit Health Record' : 'Add Health Record'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingRecord && <label className="block text-sm font-medium">Animal
            <select required name="animal_id" value={form.animal_id} onChange={change} className={input}>
              <option value="">Select animal</option>
              {animals.map((animal) => <option key={animal.id} value={animal.id}>{animal.tag_number} · {animal.animal_type}</option>)}
            </select>
          </label>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {formFields.map(([name, label, type]) => (
              <label key={name} className="text-sm font-medium">{label}
                {type === 'textarea'
                  ? <textarea name={name} value={form[name]} onChange={change} className={input} rows={3} />
                  : <input required={name === 'visit_date'} type={type} name={name} value={form[name]} onChange={change} className={input} />}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button disabled={saving} className="rounded-lg bg-green-700 px-5 py-2 text-sm text-white disabled:opacity-60">{saving ? 'Saving…' : editingRecord ? 'Save Changes' : 'Save Record'}</button>
          </div>
        </form>
      </CommonModal>
      <CommonModal isOpen={!!viewRecord} onClose={() => setViewRecord(null)} title="Health Record Details">
        {viewRecord && detail(viewRecord)}
      </CommonModal>
    </div>
  )
}
