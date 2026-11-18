import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ClipboardList, Droplets, Plus, RefreshCw, Search, Trophy, AlertCircle } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableActions from '../../../components/tables/TableActions'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import { getFarms } from '../../farms/farms.service.js'
import { getAnimals } from '../../animals/animals.service.js'
import { getPans } from '../../pans/pans.service.js'
import { createMilkRecord, deleteMilkRecord, getMilkRecords, updateMilkRecord } from '../milk.service.js'

const localDate = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const emptyForm = {
  farm_id: '',
  animal_id: '',
  record_date: localDate(),
  morning_quantity: '',
  evening_quantity: '',
  fat: '',
  snf: '',
  milk_rate: '',
}

const input = 'mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-green-700'
const numberValue = (value) => value === '' || value == null ? null : Number(value)
const quantityTotal = (record) => Number(record.morning_quantity || 0) + Number(record.evening_quantity || 0)
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export default function MilkProductionPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [farms, setFarms] = useState([])
  const [animals, setAnimals] = useState([])
  const [pans, setPans] = useState([])
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
      const [milkResponse, farmResponse, animalResponse, panResponse] = await Promise.all([
        getMilkRecords(),
        getFarms(),
        getAnimals(),
        getPans(),
      ])
      setRecords(milkResponse.data.items)
      setFarms(farmResponse.data.items)
      setAnimals(animalResponse.data.items)
      setPans(panResponse.data.items)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load milk production records.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const today = localDate()
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 6)
  const weekStartKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`
  const monthPrefix = today.slice(0, 7)
  const todayQuantity = records
    .filter((record) => record.record_date === today)
    .reduce((sum, record) => sum + quantityTotal(record), 0)
  const weeklyQuantity = records
    .filter((record) => record.record_date >= weekStartKey && record.record_date <= today)
    .reduce((sum, record) => sum + quantityTotal(record), 0)
  const monthlyQuantity = records
    .filter((record) => record.record_date?.startsWith(monthPrefix))
    .reduce((sum, record) => sum + quantityTotal(record), 0)
  const valueToday = records
    .filter((record) => record.record_date === today)
    .reduce((sum, record) => sum + Number(record.milk_value || 0), 0)

  const filtered = useMemo(() => records.filter((record) => {
    const animal = animals.find((item) => item.id === record.animal_id)
    const farm = farms.find((item) => item.id === record.farm_id)
    const haystack = [
      record.record_date,
      animal?.tag_number,
      farm?.name,
      record.animal_id ? '' : 'farm level',
    ].join(' ').toLowerCase()
    return haystack.includes(search.toLowerCase())
  }), [records, animals, farms, search])
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const closeModal = () => {
    setModal('')
    setSelected(null)
    setForm(emptyForm)
  }

  const openForm = (record = null) => {
    setSelected(record)
    setError('')
    setForm(record ? {
      farm_id: record.farm_id,
      animal_id: record.animal_id ?? '',
      record_date: record.record_date,
      morning_quantity: record.morning_quantity ?? '',
      evening_quantity: record.evening_quantity ?? '',
      fat: record.fat ?? '',
      snf: record.snf ?? '',
      milk_rate: record.milk_rate ?? '',
    } : { ...emptyForm, farm_id: farms[0]?.id ?? '' })
    setModal(record ? 'edit' : 'add')
  }

  useEffect(() => {
    if (loading || !location.state?.openAddRecord || !farms.length) return
    openForm()
    navigate(location.pathname, { replace: true, state: null })
  }, [farms.length, loading, location.pathname, location.state, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.morning_quantity === '' && form.evening_quantity === '') {
      setError('Enter a morning or evening milk quantity.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')
    const payload = {
      farm_id: form.farm_id,
      animal_id: form.animal_id || null,
      record_date: form.record_date,
      morning_quantity: numberValue(form.morning_quantity),
      evening_quantity: numberValue(form.evening_quantity),
      fat: numberValue(form.fat),
      snf: numberValue(form.snf),
      milk_rate: numberValue(form.milk_rate),
    }

    try {
      if (selected) {
        const updatePayload = { ...payload }
        delete updatePayload.farm_id
        const { data } = await updateMilkRecord(selected.id, updatePayload)
        setRecords((current) => current.map((record) => record.id === data.id ? data : record))
        setSuccess('Milk record updated and saved.')
      } else {
        const { data } = await createMilkRecord(payload)
        setRecords((current) => [data, ...current])
        setPage(1)
        setSuccess('Milk record saved.')
      }
      closeModal()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to save the milk record.')
    } finally {
      setSaving(false)
    }
  }

  const removeRecord = async (record) => {
    if (!window.confirm('Delete this milk record?')) return
    setError('')
    setSuccess('')
    try {
      await deleteMilkRecord(record.id)
      setRecords((current) => current.filter((item) => item.id !== record.id))
      setSuccess('Milk record deleted.')
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete the milk record.')
    }
  }

  const columns = [
    { key: 'record_date', label: 'DATE' },
    { key: 'farm_id', label: 'FARM', render: (record) => farms.find((farm) => farm.id === record.farm_id)?.name || '—' },
    { key: 'animal_id', label: 'ANIMAL', render: (record) => animals.find((animal) => animal.id === record.animal_id)?.tag_number || (record.animal_id ? '—' : 'Farm-level') },
    { key: 'morning_quantity', label: 'MORNING (L)', render: (record) => record.morning_quantity ?? '—' },
    { key: 'evening_quantity', label: 'EVENING (L)', render: (record) => record.evening_quantity ?? '—' },
    { key: 'total_quantity', label: 'TOTAL (L)', render: (record) => `${Number(record.total_quantity || 0).toFixed(2)} L` },
    { key: 'fat', label: 'FAT %', render: (record) => record.fat ?? '—' },
    { key: 'snf', label: 'SNF %', render: (record) => record.snf ?? '—' },
    { key: 'milk_rate', label: 'RATE/L', render: (record) => record.milk_rate == null ? '—' : money(record.milk_rate) },
    { key: 'milk_value', label: 'VALUE', render: (record) => money(record.milk_value) },
    { key: 'actions', label: 'ACTIONS', render: (record) => (
      <TableActions
        onEdit={() => openForm(record)}
        onView={() => { setSelected(record); setModal('view') }}
        onDelete={() => removeRecord(record)}
      />
    ) },
  ]

  const calculatedValue = quantityTotal({
    morning_quantity: form.morning_quantity,
    evening_quantity: form.evening_quantity,
  }) * Number(form.milk_rate || 0)

  return (
    <div className="min-h-screen space-y-6 bg-[#fbfbfa] p-6 text-slate-800">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Milk Production</h1>
          <p className="mt-1 text-sm text-gray-500">Record milk quantities by farm, animal, and milking session.</p>
        </div>
        <button type="button" onClick={() => openForm()} disabled={!farms.length || loading} className="flex items-center gap-2 rounded-lg bg-[#235339] px-4 py-2.5 text-sm text-white disabled:opacity-50">
          <Plus size={16} /> Add Milk Record
        </button>
      </header>

      {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-white p-3 text-sm text-red-700"><AlertCircle size={16} />{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-white p-3 text-sm text-green-700">{success}</div>}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today's Milk" value={`${todayQuantity.toFixed(2)} L`} subtitle="Saved records for today" icon={Droplets} />
        <StatCard title="Milk Value Today" value={money(valueToday)} subtitle="Based on saved rates" icon={Trophy} />
        <StatCard title="Last 7 Days" value={`${weeklyQuantity.toFixed(2)} L`} subtitle="Actual database records" icon={ClipboardList} />
        <StatCard title="This Month" value={`${monthlyQuantity.toFixed(2)} L`} subtitle="Actual database records" icon={Droplets} />
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <h2 className="font-semibold">Milk Records ({filtered.length})</h2>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search farm, animal or date" className="text-sm outline-none" />
            </label>
            <button type="button" onClick={loadData} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><RefreshCw size={14} /> Refresh</button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-gray-500"><RefreshCw className="animate-spin" size={16} /> Loading milk records...</div>
        ) : rows.length ? (
          <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{columns.filter((column) => column.key !== 'actions').map((column) => <th key={column.key} className="px-4 py-3">{column.label}</th>)}<th className="px-4 py-3">ACTIONS</th></tr></thead>
            <tbody className="divide-y">{rows.map((record) => <tr key={record.id} className="hover:bg-slate-50">
              {columns.filter((column) => column.key !== 'actions').map((column) => <td key={column.key} className="px-4 py-3">{column.render ? column.render(record) : record[column.key]}</td>)}
              <td className="px-4 py-3"><TableActions onEdit={() => openForm(record)} onView={() => { setSelected(record); setModal('view') }} onDelete={() => removeRecord(record)} /></td>
            </tr>)}</tbody>
          </table></div>
        ) : <TableEmptyState message={error ? 'Milk records could not be loaded.' : 'No milk records found.'} />}
        <div className="flex flex-wrap justify-between gap-3 border-t px-5 py-4 text-xs">
          <span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} records</span>
          <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </div>
      </section>

      <CommonModal isOpen={!!modal} onClose={closeModal} title={viewMode ? 'Milk Record Details' : selected ? 'Edit Milk Record' : 'Add Milk Record'}>
        {viewMode && selected ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><b>Farm:</b> {farms.find((farm) => farm.id === selected.farm_id)?.name || '—'}</p>
            <p><b>Animal:</b> {animals.find((animal) => animal.id === selected.animal_id)?.tag_number || (selected.animal_id ? '—' : 'Farm-level')}</p>
            <p><b>Date:</b> {selected.record_date}</p>
            <p><b>Morning:</b> {selected.morning_quantity ?? '—'} L</p>
            <p><b>Evening:</b> {selected.evening_quantity ?? '—'} L</p>
            <p><b>Total:</b> {selected.total_quantity ?? '—'} L</p>
            <p><b>Fat:</b> {selected.fat ?? '—'}%</p>
            <p><b>SNF:</b> {selected.snf ?? '—'}%</p>
            <p><b>Rate:</b> {selected.milk_rate == null ? '—' : money(selected.milk_rate)}</p>
            <p><b>Value:</b> {money(selected.milk_value)}</p>
            <button type="button" onClick={closeModal} className="col-span-2 justify-self-end rounded-lg border px-4 py-2">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Farm
              <select required disabled={Boolean(selected)} value={form.farm_id} onChange={(event) => setForm((current) => ({ ...current, farm_id: event.target.value, animal_id: '' }))} className={input}>
                <option value="">Select farm</option>{farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Animal (optional)
              <select value={form.animal_id} onChange={(event) => setForm((current) => ({ ...current, animal_id: event.target.value }))} className={input}>
                <option value="">Farm-level record</option>
                {animals.filter((animal) => pans.some((pan) => pan.id === animal.pan_id && pan.farm_id === form.farm_id)).map((animal) => <option key={animal.id} value={animal.id}>{animal.tag_number}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Milk date<input required type="date" value={form.record_date} onChange={(event) => setForm((current) => ({ ...current, record_date: event.target.value }))} className={input} /></label>
            <label className="text-sm font-medium">Morning quantity (L)<input min="0" max="99999999.99" step="0.01" type="number" value={form.morning_quantity} onChange={(event) => setForm((current) => ({ ...current, morning_quantity: event.target.value }))} className={input} /></label>
            <label className="text-sm font-medium">Evening quantity (L)<input min="0" max="99999999.99" step="0.01" type="number" value={form.evening_quantity} onChange={(event) => setForm((current) => ({ ...current, evening_quantity: event.target.value }))} className={input} /></label>
            <label className="text-sm font-medium">Fat (%)<input min="0" max="100" step="0.01" type="number" value={form.fat} onChange={(event) => setForm((current) => ({ ...current, fat: event.target.value }))} className={input} /></label>
            <label className="text-sm font-medium">SNF (%)<input min="0" max="100" step="0.01" type="number" value={form.snf} onChange={(event) => setForm((current) => ({ ...current, snf: event.target.value }))} className={input} /></label>
            <label className="text-sm font-medium">Milk rate per litre (₹)<input min="0" max="99999999.99" step="0.01" type="number" value={form.milk_rate} onChange={(event) => setForm((current) => ({ ...current, milk_rate: event.target.value }))} className={input} /></label>
            <p className="self-end rounded-lg bg-green-50 p-3 text-sm text-green-800">Estimated value: {money(calculatedValue)}. The server calculates the saved value from total quantity × rate.</p>
            <div className="col-span-full flex justify-end gap-2">
              <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-[#235339] px-5 py-2 text-sm text-white disabled:opacity-50">{saving ? 'Saving...' : selected ? 'Save Changes' : 'Save Milk Record'}</button>
            </div>
          </form>
        )}
      </CommonModal>
    </div>
  )
}
