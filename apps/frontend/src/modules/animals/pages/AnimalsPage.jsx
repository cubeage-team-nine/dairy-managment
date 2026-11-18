import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, X, RefreshCw, AlertCircle } from 'lucide-react'
import { useAuth } from '../../../core/hooks/useAuth.js'
import { USER_ROLES } from '../../../core/constants/app.constants.js'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import CommonTable from '../../../components/tables/CommonTable'
import TableActions from '../../../components/tables/TableActions'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import { createAnimal, deleteAnimal, getAnimals, updateAnimal } from '../animals.service.js'
import { getFarms } from '../../farms/farms.service.js'
import { getPans } from '../../pans/pans.service.js'

const emptyForm = {
  farm_id: '',
  pan_id: '',
  tag_number: '',
  animal_type: '',
  breed: '',
  date_of_birth: '',
  gender: 'FEMALE',
  weight: '',
  status: 'ACTIVE',
}

const statuses = ['ACTIVE', 'SOLD', 'DECEASED']
const genders = ['FEMALE', 'MALE']
const animalTypes = ['COW', 'BUFFALO', 'GOAT', 'SHEEP', 'OTHER']
const input = 'mt-1 h-10 w-full rounded-md border px-3 text-sm'

function AnimalsPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState([])
  const [farms, setFarms] = useState([])
  const [pans, setPans] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState('')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const pageSize = 8
  const viewMode = modal === 'View'

  const loadData = useCallback(async () => {
    if (user?.role !== USER_ROLES.FARMER) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    try {
      const [animalResponse, farmResponse] = await Promise.all([
        getAnimals(),
        getFarms(),
      ])
      setAnimals(animalResponse.data.items)
      const farmItems = farmResponse.data.items
      setFarms(farmItems)
      const panResponses = await Promise.all(farmItems.map((farm) => getPans(farm.id)))
      setPans(panResponses.flatMap((response) => response.data.items))
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load animal records.')
    } finally {
      setLoading(false)
    }
  }, [user?.role])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filtered = useMemo(() => animals.filter((animal) => {
    const matchesSearch = [
      animal.tag_number,
      animal.animal_type,
      animal.breed,
      animal.gender,
      pans.find((pan) => pan.id === animal.pan_id)?.name,
    ].some((value) => String(value ?? '').toLowerCase().includes(search.toLowerCase()))

    return matchesSearch && (statusFilter === 'All' || animal.status === statusFilter)
  }), [animals, pans, search, statusFilter])

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const activeCount = animals.filter((animal) => animal.status === 'ACTIVE').length
  const soldCount = animals.filter((animal) => animal.status === 'SOLD').length
  const deceasedCount = animals.filter((animal) => animal.status === 'DECEASED').length

  const openModal = (type, animal = null) => {
    setSelected(animal)
    const pan = animal ? pans.find((item) => item.id === animal.pan_id) : null
    setForm(animal ? {
      farm_id: pan?.farm_id ?? '',
      pan_id: animal.pan_id,
      tag_number: animal.tag_number,
      animal_type: animal.animal_type,
      breed: animal.breed ?? '',
      date_of_birth: animal.date_of_birth ?? '',
      gender: animal.gender,
      weight: animal.weight == null ? '' : String(animal.weight),
      status: animal.status,
    } : { ...emptyForm, farm_id: farms[0]?.id ?? '' })
    setError('')
    setModal(type)
  }

  const closeModal = () => {
    setModal('')
    setSelected(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      pan_id: form.pan_id,
      tag_number: form.tag_number.trim(),
      animal_type: form.animal_type.trim(),
      breed: form.breed.trim() || null,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender,
      weight: form.weight === '' ? null : Number(form.weight),
      status: form.status,
    }

    try {
      if (selected) {
        const { data } = await updateAnimal(selected.id, {
          tag_number: payload.tag_number,
          animal_type: payload.animal_type,
          breed: payload.breed,
          date_of_birth: payload.date_of_birth,
          gender: payload.gender,
          weight: payload.weight,
          status: payload.status,
        })
        setAnimals((current) => current.map((animal) => animal.id === data.id ? data : animal))
      } else {
        const { data } = await createAnimal(payload)
        setAnimals((current) => [data, ...current])
        setPage(1)
      }
      closeModal()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to save the animal record.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (animal) => {
    if (!window.confirm(`Delete animal ${animal.tag_number}? Records with related history cannot be deleted.`)) return

    setError('')
    try {
      await deleteAnimal(animal.id)
      setAnimals((current) => current.filter((item) => item.id !== animal.id))
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete this animal record.')
    }
  }

  const columns = [
    { key: 'tag_number', label: 'TAG NUMBER' },
    { key: 'animal_type', label: 'TYPE' },
    { key: 'breed', label: 'BREED', render: (animal) => animal.breed || '—' },
    { key: 'gender', label: 'GENDER' },
    { key: 'date_of_birth', label: 'DATE OF BIRTH', render: (animal) => animal.date_of_birth || '—' },
    { key: 'weight', label: 'WEIGHT', render: (animal) => animal.weight == null ? '—' : `${animal.weight} kg` },
    {
      key: 'pan_id',
      label: 'PAN',
      render: (animal) => pans.find((pan) => pan.id === animal.pan_id)?.name || '—',
    },
    {
      key: 'status',
      label: 'STATUS',
      render: (animal) => <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">{animal.status}</span>,
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (animal) => (
        <TableActions
          onEdit={() => openModal('Edit', animal)}
          onView={() => openModal('View', animal)}
          onDelete={() => handleDelete(animal)}
        />
      ),
    },
  ]

  if (user?.role !== USER_ROLES.FARMER) {
    return (
      <div className="m-6 rounded-xl border border-amber-200 bg-white p-6 text-sm text-amber-800">
        The assigned-animal API for Doctor accounts is not available yet.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] p-6 text-[#1c211d]">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e6e1] pb-5">
        <div>
          <h1 className="text-2xl font-bold">Animals Registry</h1>
          <p className="mt-1 text-sm text-gray-500">Animal records registered to your farm.</p>
        </div>
        <button
          type="button"
          onClick={() => openModal('Add')}
          disabled={!pans.length || loading}
          className="flex h-10 items-center gap-2 rounded-md bg-[#2f7657] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} /> Add New Animal
        </button>
      </header>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Animals" value={animals.length} subtitle="Registered animals" />
        <StatCard title="Active" value={activeCount} subtitle="Active animal records" />
        <StatCard title="Sold" value={soldCount} subtitle="Animals marked sold" />
        <StatCard title="Deceased" value={deceasedCount} subtitle="Animals marked deceased" />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1) }}
            placeholder="Search tag, type, breed or pan..."
            className="h-10 w-full rounded-md border bg-white pl-9 pr-9 text-sm outline-none focus:border-green-700"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-3 text-gray-400" aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }}
          className="h-10 rounded-md border bg-white px-3 text-sm"
        >
          <option value="All">All statuses</option>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <button type="button" onClick={loadData} className="flex h-10 items-center gap-2 rounded-md border bg-white px-3 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-white p-3 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button type="button" onClick={loadData} className="ml-auto underline">Retry</button>
        </div>
      )}

      {pans.length === 0 && !loading && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-white p-3 text-sm text-amber-800">
          Create a pan for your farm before registering animals.
        </p>
      )}

      <section className="overflow-visible rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-gray-500">
            <RefreshCw className="animate-spin" size={16} /> Loading animals...
          </div>
        ) : rows.length ? (
          <CommonTable columns={columns} data={rows} />
        ) : (
          <TableEmptyState message={error ? 'Animal records could not be loaded.' : 'No animal records found.'} />
        )}
        <div className="flex flex-wrap justify-between gap-3 border-t px-6 py-4 text-xs">
          <span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} animals</span>
          <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
        </div>
      </section>

      <CommonModal isOpen={!!modal} onClose={closeModal} title={`${modal} Animal`}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">Farm
            <select
              required
              disabled={viewMode || Boolean(selected)}
              value={form.farm_id}
              onChange={(event) => {
                const farmId = event.target.value
                const farmPans = pans.filter((pan) => pan.farm_id === farmId)
                setForm((current) => ({ ...current, farm_id: farmId, pan_id: farmPans[0]?.id ?? '' }))
              }}
              className={input}
            >
              <option value="">Select a farm</option>
              {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Pan
            <select required disabled={viewMode || Boolean(selected) || !form.farm_id} value={form.pan_id} onChange={(event) => setForm((current) => ({ ...current, pan_id: event.target.value }))} className={input}>
              <option value="">Select a pan</option>
              {pans.filter((pan) => pan.farm_id === form.farm_id).map((pan) => <option key={pan.id} value={pan.id}>{pan.name}{pan.pen_number ? ` · ${pan.pen_number}` : ''}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Tag number
            <input required disabled={viewMode} maxLength={100} value={form.tag_number} onChange={(event) => setForm((current) => ({ ...current, tag_number: event.target.value }))} className={input} />
          </label>
          <label className="text-sm font-medium">Animal type
            <select required disabled={viewMode} value={form.animal_type} onChange={(event) => setForm((current) => ({ ...current, animal_type: event.target.value }))} className={input}>
              <option value="">Select type</option>
              {[...new Set([...animalTypes, ...animals.map((animal) => animal.animal_type)])].map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Breed
            <input disabled={viewMode} maxLength={100} value={form.breed} onChange={(event) => setForm((current) => ({ ...current, breed: event.target.value }))} className={input} />
          </label>
          <label className="text-sm font-medium">Date of birth
            <input disabled={viewMode} type="date" value={form.date_of_birth} onChange={(event) => setForm((current) => ({ ...current, date_of_birth: event.target.value }))} className={input} />
          </label>
          <label className="text-sm font-medium">Gender
            <select required disabled={viewMode} value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))} className={input}>
              {genders.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Weight (kg)
            <input disabled={viewMode} min="0" step="0.01" type="number" value={form.weight} onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))} className={input} />
          </label>
          <label className="text-sm font-medium">Status
            <select disabled={viewMode} value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className={input}>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <div className="col-span-full flex justify-end gap-2">
            <button type="button" onClick={closeModal} className="rounded-md border px-4 py-2 text-sm">{viewMode ? 'Close' : 'Cancel'}</button>
            {!viewMode && (
              <button type="submit" disabled={saving} className="rounded-md bg-[#2f7657] px-4 py-2 text-sm text-white disabled:opacity-50">
                {saving ? 'Saving...' : selected ? 'Save Changes' : 'Add Animal'}
              </button>
            )}
          </div>
        </form>
      </CommonModal>
    </div>
  )
}

export default AnimalsPage
