import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, HeartPulse, Syringe, CalendarDays } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import CommonTable from '../../../components/tables/CommonTable'
import TableActions from '../../../components/tables/TableActions'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import { getAnimals } from '../../animals/animals.service'
import {
  createMastitisRecord,
  deleteMastitisRecord,
  getMastitisRecords,
  updateMastitisRecord,
} from '../mastitis.service'

const blank = {
  animal_id: '',
  test_date: new Date().toISOString().slice(0, 10),
  test_name: '',
  result: '',
  treatment: '',
  recovery_date: '',
  follow_up_date: '',
}
const input = 'mt-1 w-full rounded-lg border p-2.5 text-sm outline-none focus:border-emerald-500'
const list = (response) => response?.data?.items ?? response?.data ?? []
const errorText = (error) => error.response?.data?.detail || 'Unable to complete the request.'

export default function MastitisRecords() {
  const [records, setRecords] = useState([])
  const [animals, setAnimals] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState('')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(blank)
  const [viewRecord, setViewRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const thisMonth = new Date().toISOString().slice(0, 7)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [recordResponse, animalResponse] = await Promise.all([
        getMastitisRecords(),
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
  const filtered = records.filter((record) =>
    `${record.animal_tag ?? ''} ${record.test_name ?? ''} ${record.result ?? ''} ${record.treatment ?? ''}`
      .toLowerCase().includes(search.toLowerCase()))
  const close = () => {
    setModal('')
    setEditId(null)
    setForm(blank)
    setViewRecord(null)
  }
  const openAdd = () => {
    setEditId(null)
    setForm(blank)
    setModal('form')
  }
  const openEdit = (record) => {
    setEditId(record.id)
    setForm({
      animal_id: record.animal_id,
      test_date: record.test_date,
      test_name: record.test_name ?? '',
      result: record.result ?? '',
      treatment: record.treatment ?? '',
      recovery_date: record.recovery_date ?? '',
      follow_up_date: record.follow_up_date ?? '',
    })
    setModal('form')
  }
  const change = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      test_name: form.test_name || null,
      result: form.result || null,
      treatment: form.treatment || null,
      recovery_date: form.recovery_date || null,
      follow_up_date: form.follow_up_date || null,
    }
    try {
      if (editId) {
        const update = { ...payload }
        delete update.animal_id
        await updateMastitisRecord(editId, update)
      } else {
        await createMastitisRecord(payload)
      }
      close()
      await load()
    } catch (requestError) {
      setError(errorText(requestError))
    } finally {
      setSaving(false)
    }
  }
  const remove = async (id) => {
    if (!window.confirm('Delete this mastitis record?')) return
    try {
      await deleteMastitisRecord(id)
      await load()
    } catch (requestError) {
      setError(errorText(requestError))
    }
  }

  const columns = [
    { key: 'animal_tag', label: 'ANIMAL ID', render: (record) =>
      animalsById.get(record.animal_id)?.tag_number ?? record.animal_tag ?? '—' },
    { key: 'test_date', label: 'DATE' },
    { key: 'test_name', label: 'TEST', render: (record) => record.test_name || '—' },
    { key: 'result', label: 'RESULT', render: (record) => record.result || '—' },
    { key: 'treatment', label: 'TREATMENT', render: (record) => record.treatment || '—' },
    { key: 'follow_up_date', label: 'FOLLOW-UP', render: (record) => record.follow_up_date || '—' },
    { key: 'actions', label: 'ACTIONS', render: (record) => (
      <TableActions
        onEdit={() => openEdit(record)}
        onView={() => { setViewRecord(record); setModal('view') }}
        onDelete={() => remove(record.id)}
      />
    ) },
  ]

  const fieldRows = [
    ['test_date', 'Test Date', 'date'],
    ['test_name', 'Test Name', 'text'],
    ['result', 'Result', 'text'],
    ['treatment', 'Treatment', 'text'],
    ['recovery_date', 'Recovery Date', 'date'],
    ['follow_up_date', 'Follow-up Date', 'date'],
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mastitis Records</h1>
          <p className="mt-2 text-sm text-gray-500">Manage saved mastitis test and treatment records.</p>
        </div>
        <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700">
          <Plus size={18} /> Add Record
        </button>
      </header>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Records" value={records.length} subtitle="Saved mastitis records" icon={HeartPulse} />
        <StatCard title="Recorded Results" value={records.filter((record) => record.result).length} subtitle="Records with a test result" icon={Syringe} />
        <StatCard title="Follow-ups" value={records.filter((record) => record.follow_up_date).length} subtitle="Records with follow-up dates" icon={CalendarDays} />
        <StatCard title="This Month" value={records.filter((record) => record.test_date?.slice(0, 7) === thisMonth).length} subtitle="Records this month" icon={CalendarDays} />
      </div>
      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-4">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search animal, test, or treatment..." className="w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500" />
          </div>
        </div>
        <div className="p-4">
          {loading ? <p className="py-6 text-sm text-gray-500">Loading mastitis records…</p>
            : filtered.length ? <CommonTable columns={columns} data={filtered} />
              : <TableEmptyState message="No mastitis records found." />}
        </div>
      </section>

      <CommonModal isOpen={modal === 'form'} onClose={close} title={editId ? 'Edit Record' : 'Add Mastitis Record'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {!editId && <label className="text-sm font-medium text-gray-700">Animal
              <select required name="animal_id" value={form.animal_id} onChange={change} className={input}>
                <option value="">Select animal</option>
                {animals.map((animal) => <option key={animal.id} value={animal.id}>{animal.tag_number} · {animal.animal_type}</option>)}
              </select>
            </label>}
            {fieldRows.map(([name, label, type]) => (
              <label key={name} className="text-sm font-medium text-gray-700">{label}
                <input required={name === 'test_date'} name={name} type={type} value={form[name]} onChange={change} className={input} />
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button disabled={saving} type="submit" className="rounded-lg bg-emerald-600 px-5 py-2 text-sm text-white disabled:opacity-60">{saving ? 'Saving…' : editId ? 'Update' : 'Save Record'}</button>
          </div>
        </form>
      </CommonModal>
      <CommonModal isOpen={modal === 'view'} onClose={close} title="View Mastitis Record">
        {viewRecord && <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <p className="text-sm">Animal: {animalsById.get(viewRecord.animal_id)?.tag_number ?? viewRecord.animal_tag}</p>
          {fieldRows.map(([name, label]) => <div key={name}><p className="text-xs text-gray-500">{label}</p><p className="text-sm">{viewRecord[name] || '—'}</p></div>)}
        </div>}
      </CommonModal>
    </div>
  )
}
