import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CalendarDays, Plus, RefreshCw, Search, Wheat } from 'lucide-react'
import StatCard from '../../../components/common/StatCard.jsx'
import CommonModal from '../../../components/modals/CommonModal.jsx'
import CommonTable from '../../../components/tables/CommonTable.jsx'
import TableActions from '../../../components/tables/TableActions.jsx'
import TableEmptyState from '../../../components/tables/TableEmptyState.jsx'
import TablePagination from '../../../components/tables/TablePagination.jsx'
import { getAdminAnimals } from '../../animals/animals.service.js'
import {
  createAdminFeedRecord,
  deleteAdminFeedRecord,
  getAdminFeedRecords,
  getAdminFeedTypes,
  updateAdminFeedRecord,
} from '../feed.service.js'

const today = () => new Date().toISOString().slice(0, 10)
const blankForm = { animal_id: '', feed_type_id: '', quantity: '', record_date: today() }
const input = 'mt-1 w-full rounded-lg border p-2.5 text-sm outline-none focus:border-green-700'
const pageSize = 10

export default function AdminFeedManagementPage() {
  const [records, setRecords] = useState([])
  const [animals, setAnimals] = useState([])
  const [feedTypes, setFeedTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState('')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(blankForm)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [recordResponse, animalResponse, typeResponse] = await Promise.all([
        getAdminFeedRecords(),
        getAdminAnimals(),
        getAdminFeedTypes(),
      ])
      setRecords(recordResponse.data.items)
      setAnimals(animalResponse.data.items)
      setFeedTypes(typeResponse.data.items)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load Admin feed records.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = useMemo(() => records.filter((record) => (
    [record.animal_tag, record.feed_type_name, record.farm_name, record.farmer_name, record.record_date]
      .some((value) => String(value ?? '').toLowerCase().includes(search.toLowerCase()))
  )), [records, search])
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const quantityByUnit = records.reduce((totals, record) => {
    totals[record.unit] = (totals[record.unit] || 0) + Number(record.quantity)
    return totals
  }, {})
  const totalQuantity = Object.entries(quantityByUnit)
    .map(([unit, quantity]) => `${quantity.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${unit}`)
    .join(' · ') || '0'

  const openForm = (record = null) => {
    setSelected(record)
    setForm(record ? {
      animal_id: record.animal_id,
      feed_type_id: record.feed_type_id,
      quantity: String(record.quantity),
      record_date: record.record_date,
    } : {
      ...blankForm,
      animal_id: animals[0]?.id ?? '',
      feed_type_id: feedTypes[0]?.id ?? '',
    })
    setError('')
    setModal(record ? 'edit' : 'add')
  }
  const closeModal = () => {
    setModal('')
    setSelected(null)
    setForm(blankForm)
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    const payload = {
      animal_id: form.animal_id,
      feed_type_id: form.feed_type_id,
      quantity: Number(form.quantity),
      record_date: form.record_date,
    }
    try {
      if (selected) {
        await updateAdminFeedRecord(selected.id, payload)
        setSuccess('Feed record updated.')
      } else {
        await createAdminFeedRecord(payload)
        setSuccess('Feed record created.')
      }
      closeModal()
      await loadData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to save the feed record.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (record) => {
    if (!window.confirm(`Delete the ${record.feed_type_name} record for animal ${record.animal_tag}?`)) return
    setError('')
    setSuccess('')
    try {
      await deleteAdminFeedRecord(record.id)
      setSuccess('Feed record deleted.')
      await loadData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete the feed record.')
    }
  }

  const columns = [
    { key: 'record_date', label: 'DATE' },
    { key: 'farm_name', label: 'FARM' },
    { key: 'farmer_name', label: 'FARMER' },
    { key: 'animal_tag', label: 'ANIMAL' },
    { key: 'feed_type_name', label: 'FEED TYPE' },
    { key: 'quantity', label: 'QUANTITY', render: (record) => `${record.quantity} ${record.unit}` },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (record) => <TableActions onEdit={() => openForm(record)} onDelete={() => remove(record)} />,
    },
  ]

  return (
    <main className="min-h-screen space-y-6 bg-[#f7f8f3] p-5 text-gray-800 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><Wheat size={30} className="text-green-800" /><div><h1 className="text-2xl font-semibold">Feed Management</h1><p className="text-sm text-gray-500">Manage saved feed records across all farms.</p></div></div>
        <button type="button" onClick={() => openForm()} disabled={!animals.length || !feedTypes.length || loading} className="flex items-center gap-2 rounded-lg bg-green-800 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Plus size={17} /> Add Feed Record</button>
      </header>

      {error && !modal && <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16} />{error}<button type="button" onClick={loadData} className="ml-auto underline">Retry</button></div>}
      {success && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Feed Records" value={records.length} subtitle="Saved database entries" icon={CalendarDays} />
        <StatCard title="Animals With Feed History" value={new Set(records.map((record) => record.animal_id)).size} subtitle="Animals represented" />
        <StatCard title="Recorded Quantity by Unit" value={totalQuantity} subtitle="Each unit is totaled separately" />
      </div>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <h2 className="font-semibold">Feed History ({filtered.length})</h2>
          <div className="flex gap-2"><label className="flex items-center gap-2 rounded-lg border px-3"><Search size={16} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search farm, farmer, type..." className="py-2 text-sm outline-none" /></label><button type="button" onClick={loadData} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><RefreshCw size={14} /> Refresh</button></div>
        </div>
        {loading ? <div className="p-12 text-center text-sm text-gray-500">Loading feed records...</div> : rows.length ? <CommonTable columns={columns} data={rows} /> : <TableEmptyState message={error ? 'Feed records could not be loaded.' : 'No feed records found.'} />}
        <div className="flex justify-between border-t px-5 py-4 text-xs"><span>{filtered.length} records</span><TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} /></div>
      </section>

      <CommonModal isOpen={Boolean(modal)} onClose={closeModal} title={selected ? 'Edit Feed Record' : 'Add Feed Record'}>
        <form onSubmit={save} className="space-y-4">
          <label className="block text-sm font-medium">Animal
            <select required disabled={Boolean(selected)} value={form.animal_id} onChange={(event) => setForm((current) => ({ ...current, animal_id: event.target.value }))} className={input}>
              <option value="">Select animal</option>
              {animals.map((animal) => <option key={animal.id} value={animal.id}>{animal.tag_number} · {animal.farm_name} ({animal.farmer_name})</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Feed Type
            <select required value={form.feed_type_id} onChange={(event) => setForm((current) => ({ ...current, feed_type_id: event.target.value }))} className={input}>
              <option value="">Select type</option>{feedTypes.map((type) => <option key={type.id} value={type.id}>{type.name} ({type.unit})</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Feed Date<input required type="date" value={form.record_date} onChange={(event) => setForm((current) => ({ ...current, record_date: event.target.value }))} className={input} /></label>
          <label className="block text-sm font-medium">Quantity ({feedTypes.find((type) => type.id === form.feed_type_id)?.unit || 'unit'})
            <input required type="number" min="0.01" max="99999999.99" step="0.01" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} className={input} />
          </label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 border-t pt-4"><button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-green-800 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Feed Record'}</button></div>
        </form>
      </CommonModal>
    </main>
  )
}
