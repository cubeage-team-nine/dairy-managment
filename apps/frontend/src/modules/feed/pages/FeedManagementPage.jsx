import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CalendarDays, Leaf, Plus, RefreshCw, Search } from 'lucide-react'
import StatCard from '../../../components/common/StatCard.jsx'
import CommonModal from '../../../components/modals/CommonModal.jsx'
import CommonTable from '../../../components/tables/CommonTable.jsx'
import TableActions from '../../../components/tables/TableActions.jsx'
import TableEmptyState from '../../../components/tables/TableEmptyState.jsx'
import TablePagination from '../../../components/tables/TablePagination.jsx'
import { getFarms } from '../../farms/farms.service.js'
import { getAnimals } from '../../animals/animals.service.js'
import { getPans } from '../../pans/pans.service.js'
import {
  createFeedRecord,
  deleteFeedRecord,
  getFeedRecords,
  getFeedTypes,
  updateFeedRecord,
} from '../feed.service.js'

const localDate = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const emptyForm = {
  farm_id: '',
  animal_id: '',
  feed_type_id: '',
  quantity: '',
  record_date: localDate(),
}

const input = 'mt-1 w-full rounded-lg border p-2.5 text-sm outline-none focus:border-emerald-500'

export default function FeedManagementPage() {
  const [records, setRecords] = useState([])
  const [farms, setFarms] = useState([])
  const [animals, setAnimals] = useState([])
  const [pans, setPans] = useState([])
  const [feedTypes, setFeedTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState('')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const pageSize = 8
  const viewMode = modal === 'view'

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [recordResponse, typeResponse, farmResponse, animalResponse, panResponse] = await Promise.all([
        getFeedRecords(),
        getFeedTypes(),
        getFarms(),
        getAnimals(),
        getPans(),
      ])
      setRecords(recordResponse.data.items)
      setFeedTypes(typeResponse.data.items)
      setFarms(farmResponse.data.items)
      setAnimals(animalResponse.data.items)
      setPans(panResponse.data.items)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load feed records.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const farmForAnimal = (animalId) => {
    const animal = animals.find((item) => item.id === animalId)
    const pan = pans.find((item) => item.id === animal?.pan_id)
    return farms.find((item) => item.id === pan?.farm_id)
  }

  const filtered = useMemo(() => records.filter((record) => {
    const animal = animals.find((item) => item.id === record.animal_id)
    const pan = pans.find((item) => item.id === animal?.pan_id)
    const farm = farms.find((item) => item.id === pan?.farm_id)
    const searchText = [
      record.animal_tag,
      record.feed_type_name,
      record.record_date,
      farm?.name,
    ].join(' ').toLowerCase()
    return searchText.includes(search.toLowerCase())
  }), [records, animals, pans, farms, search])

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const animalCount = new Set(records.map((record) => record.animal_id)).size
  const typeCount = new Set(records.map((record) => record.feed_type_id)).size
  const monthlyRecords = records.filter((record) => record.record_date?.startsWith(localDate().slice(0, 7))).length
  const quantityByUnit = records.reduce((totals, record) => {
    totals[record.unit] = (totals[record.unit] || 0) + Number(record.quantity)
    return totals
  }, {})
  const totalQuantity = Object.entries(quantityByUnit)
    .map(([unit, quantity]) => `${quantity.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${unit}`)
    .join(' · ') || '0'

  const closeModal = () => {
    setModal('')
    setSelected(null)
    setForm(emptyForm)
  }

  const openForm = (record = null) => {
    const animal = record && animals.find((item) => item.id === record.animal_id)
    const pan = animal && pans.find((item) => item.id === animal.pan_id)
    setSelected(record)
    setError('')
    setForm(record ? {
      farm_id: pan?.farm_id ?? '',
      animal_id: record.animal_id,
      feed_type_id: record.feed_type_id,
      quantity: String(record.quantity),
      record_date: record.record_date,
    } : {
      ...emptyForm,
      farm_id: farms[0]?.id ?? '',
      animal_id: '',
      feed_type_id: feedTypes[0]?.id ?? '',
    })
    setModal(record ? 'edit' : 'add')
  }

  const saveRecord = async (event) => {
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
        const { data } = await updateFeedRecord(selected.id, payload)
        setRecords((current) => current.map((record) => record.id === data.id ? data : record))
        setSuccess('Feed record updated and saved.')
      } else {
        const { data } = await createFeedRecord(payload)
        setRecords((current) => [data, ...current])
        setPage(1)
        setSuccess('Feed record saved.')
      }
      closeModal()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to save the feed record.')
    } finally {
      setSaving(false)
    }
  }

  const removeRecord = async (record) => {
    if (!window.confirm(`Delete the ${record.feed_type_name} feed record for ${record.animal_tag}?`)) return
    setError('')
    setSuccess('')
    try {
      await deleteFeedRecord(record.id)
      setRecords((current) => current.filter((item) => item.id !== record.id))
      setSuccess('Feed record deleted.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete the feed record.')
    }
  }

  const columns = [
    { key: 'record_date', label: 'DATE' },
    { key: 'farm', label: 'FARM', render: (record) => farmForAnimal(record.animal_id)?.name || '—' },
    { key: 'animal_tag', label: 'ANIMAL' },
    { key: 'feed_type_name', label: 'FEED TYPE' },
    { key: 'quantity', label: 'QUANTITY', render: (record) => `${record.quantity} ${record.unit}` },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (record) => (
        <TableActions
          onEdit={() => openForm(record)}
          onView={() => { setSelected(record); setModal('view') }}
          onDelete={() => removeRecord(record)}
        />
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-800 md:p-7">
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <Leaf size={36} className="text-emerald-600" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Feed Records</h1>
          <p className="text-sm text-gray-500">Log feed provided to your animals. Feed types and units come from your database.</p>
        </div>
        <button type="button" onClick={() => openForm()} disabled={!feedTypes.length || !farms.length || loading} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-white disabled:opacity-50">
          <Plus size={18} /> Add Feed Record
        </button>
      </header>

      {error && <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-white p-3 text-sm text-red-700"><AlertCircle size={16} />{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-white p-3 text-sm text-green-700">{success}</div>}
      {!loading && !feedTypes.length && <p className="mb-4 rounded-lg border border-amber-200 bg-white p-3 text-sm text-amber-800">There are no FeedType records in the database, so feed entry is unavailable until an existing feed type is configured.</p>}

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Feed Records" value={records.length} subtitle="Saved database entries" icon={CalendarDays} />
        <StatCard title="Animals Fed" value={animalCount} subtitle="Animals with feed history" icon={Leaf} />
        <StatCard title="Feed Types Used" value={typeCount} subtitle="Existing database types" icon={Leaf} />
        <StatCard title="Recorded Quantity" value={totalQuantity} subtitle={`${monthlyRecords} records this month`} icon={CalendarDays} />
      </section>

      <section className="overflow-hidden rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">Feed History ({filtered.length})</h2>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2"><Search size={16} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search feed history..." className="text-sm outline-none" /></label>
            <button type="button" onClick={loadData} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><RefreshCw size={14} /> Refresh</button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-gray-500"><RefreshCw className="animate-spin" size={16} /> Loading feed history...</div>
        ) : rows.length ? (
          <CommonTable columns={columns} data={rows} />
        ) : (
          <TableEmptyState message={error ? 'Feed history could not be loaded.' : 'No feed records found.'} />
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs">
          <span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} records</span>
          <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </div>
      </section>

      <CommonModal isOpen={!!modal} onClose={closeModal} title={viewMode ? 'Feed Record Details' : selected ? 'Edit Feed Record' : 'Add Feed Record'}>
        {viewMode && selected ? (
          <div className="space-y-3 text-sm">
            <p><b>Date:</b> {selected.record_date}</p>
            <p><b>Farm:</b> {farmForAnimal(selected.animal_id)?.name || '—'}</p>
            <p><b>Animal:</b> {selected.animal_tag}</p>
            <p><b>Feed type:</b> {selected.feed_type_name}</p>
            <p><b>Quantity:</b> {selected.quantity} {selected.unit}</p>
            <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2">Close</button>
          </div>
        ) : (
          <form onSubmit={saveRecord} className="space-y-4">
            <label className="block text-sm font-medium">Farm
              <select required disabled={Boolean(selected)} className={input} value={form.farm_id} onChange={(event) => setForm((current) => ({ ...current, farm_id: event.target.value, animal_id: '' }))}>
                <option value="">Select farm</option>{farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Animal
              <select required className={input} value={form.animal_id} onChange={(event) => setForm((current) => ({ ...current, animal_id: event.target.value }))}>
                <option value="">Select animal</option>
                {animals.filter((animal) => pans.some((pan) => pan.id === animal.pan_id && pan.farm_id === form.farm_id)).map((animal) => <option key={animal.id} value={animal.id}>{animal.tag_number}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Feed type
              <select required className={input} value={form.feed_type_id} onChange={(event) => setForm((current) => ({ ...current, feed_type_id: event.target.value }))}>
                <option value="">Select feed type</option>{feedTypes.map((type) => <option key={type.id} value={type.id}>{type.name} ({type.unit})</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Feed date<input required type="date" className={input} value={form.record_date} onChange={(event) => setForm((current) => ({ ...current, record_date: event.target.value }))} /></label>
            <label className="block text-sm font-medium">Quantity ({feedTypes.find((type) => type.id === form.feed_type_id)?.unit || 'unit from feed type'})
              <input required min="0.01" max="99999999.99" step="0.01" type="number" className={input} value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} />
            </label>
            <div className="flex justify-end gap-2 border-t pt-4">
              <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-5 py-2 text-sm text-white disabled:opacity-50">{saving ? 'Saving...' : selected ? 'Save Changes' : 'Save Feed Record'}</button>
            </div>
          </form>
        )}
      </CommonModal>
    </div>
  )
}
