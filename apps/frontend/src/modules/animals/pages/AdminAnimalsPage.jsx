import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, PawPrint, Plus, RefreshCw, Search } from 'lucide-react'
import StatCard from '../../../components/common/StatCard.jsx'
import CommonModal from '../../../components/modals/CommonModal.jsx'
import CommonTable from '../../../components/tables/CommonTable.jsx'
import TableActions from '../../../components/tables/TableActions.jsx'
import TableEmptyState from '../../../components/tables/TableEmptyState.jsx'
import TablePagination from '../../../components/tables/TablePagination.jsx'
import {
  createAdminAnimal,
  deleteAdminAnimal,
  getAdminAnimalOptions,
  getAdminAnimals,
  updateAdminAnimal,
} from '../animals.service.js'

const blankForm = {
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
const input = 'mt-1 h-10 w-full rounded-md border px-3 text-sm'
const pageSize = 10

export default function AdminAnimalsPage() {
  const [animals, setAnimals] = useState([])
  const [farms, setFarms] = useState([])
  const [pans, setPans] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState('')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(blankForm)
  const viewMode = modal === 'view'

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [animalResponse, optionsResponse] = await Promise.all([
        getAdminAnimals(),
        getAdminAnimalOptions(),
      ])
      setAnimals(animalResponse.data.items)
      setFarms(optionsResponse.data.farms)
      setPans(optionsResponse.data.pans)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load Admin animal records.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = useMemo(() => animals.filter((animal) => (
    [animal.tag_number, animal.animal_type, animal.breed, animal.farm_name, animal.farmer_name]
      .some((value) => String(value ?? '').toLowerCase().includes(search.toLowerCase()))
  )), [animals, search])
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const openForm = (mode, animal = null) => {
    const pan = animal && pans.find((item) => item.id === animal.pan_id)
    setSelected(animal)
    setForm(animal ? {
      farm_id: pan?.farm_id ?? animal.farm_id ?? '',
      pan_id: animal.pan_id,
      tag_number: animal.tag_number,
      animal_type: animal.animal_type,
      breed: animal.breed ?? '',
      date_of_birth: animal.date_of_birth ?? '',
      gender: animal.gender,
      weight: animal.weight == null ? '' : String(animal.weight),
      status: animal.status,
    } : { ...blankForm, farm_id: farms[0]?.id ?? '', pan_id: pans.find((item) => item.farm_id === farms[0]?.id)?.id ?? '' })
    setError('')
    setModal(mode)
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
        await updateAdminAnimal(selected.id, {
          tag_number: payload.tag_number,
          animal_type: payload.animal_type,
          breed: payload.breed,
          date_of_birth: payload.date_of_birth,
          gender: payload.gender,
          weight: payload.weight,
          status: payload.status,
        })
        setSuccess('Animal record updated.')
      } else {
        await createAdminAnimal(payload)
        setSuccess('Animal record created.')
      }
      closeModal()
      await loadData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to save the animal record.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (animal) => {
    if (!window.confirm(`Delete animal ${animal.tag_number}? Records with history cannot be deleted.`)) return
    setError('')
    setSuccess('')
    try {
      await deleteAdminAnimal(animal.id)
      setSuccess(`Animal ${animal.tag_number} deleted.`)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete this animal.')
    }
  }

  const columns = [
    { key: 'tag_number', label: 'TAG' },
    { key: 'animal_type', label: 'TYPE' },
    { key: 'farm_name', label: 'FARM' },
    { key: 'pan_name', label: 'PEN' },
    { key: 'farmer_name', label: 'FARMER' },
    { key: 'status', label: 'STATUS' },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (animal) => (
        <TableActions
          onEdit={() => openForm('edit', animal)}
          onView={() => openForm('view', animal)}
          onDelete={() => remove(animal)}
        />
      ),
    },
  ]

  return (
    <main className="min-h-screen space-y-6 bg-[#f7f8f3] p-5 text-gray-800 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PawPrint className="text-green-800" size={30} />
          <div><h1 className="text-2xl font-semibold">Animal Management</h1><p className="text-sm text-gray-500">Manage animal records across registered farms.</p></div>
        </div>
        <button type="button" onClick={() => openForm('add')} disabled={!pans.length || loading} className="flex items-center gap-2 rounded-lg bg-green-800 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
          <Plus size={17} /> Add Animal
        </button>
      </header>

      {error && !modal && <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16} />{error}<button type="button" className="ml-auto underline" onClick={loadData}>Retry</button></div>}
      {success && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Animals" value={animals.length} subtitle="Across all registered farms" icon={PawPrint} />
        <StatCard title="Active Animals" value={animals.filter((item) => item.status === 'ACTIVE').length} subtitle="Active database records" />
        <StatCard title="Registered Farms" value={farms.length} subtitle="Farms with available pens" />
      </div>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <h2 className="font-semibold">Animal Registry ({filtered.length})</h2>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 rounded-lg border px-3"><Search size={16} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search animal, farmer, farm..." className="py-2 text-sm outline-none" /></label>
            <button type="button" onClick={loadData} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><RefreshCw size={14} /> Refresh</button>
          </div>
        </div>
        {loading ? <div className="p-12 text-center text-sm text-gray-500">Loading animal records...</div> : rows.length ? <CommonTable columns={columns} data={rows} /> : <TableEmptyState message={error ? 'Animal records could not be loaded.' : 'No animal records found.'} />}
        <div className="flex justify-between border-t px-5 py-4 text-xs"><span>{filtered.length} records</span><TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} /></div>
      </section>

      <CommonModal isOpen={Boolean(modal)} onClose={closeModal} title={viewMode ? 'Animal Details' : selected ? 'Edit Animal' : 'Add Animal'}>
        {viewMode && selected ? (
          <div className="space-y-3 text-sm">
            {[
              ['Tag Number', selected.tag_number], ['Type', selected.animal_type], ['Breed', selected.breed],
              ['Farm', selected.farm_name], ['Pen', selected.pan_name], ['Farmer', selected.farmer_name],
              ['Gender', selected.gender], ['Date of Birth', selected.date_of_birth], ['Weight (kg)', selected.weight], ['Status', selected.status],
            ].map(([label, value]) => <p key={label}><b>{label}:</b> {value || '—'}</p>)}
            <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2">Close</button>
          </div>
        ) : (
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">Farm
              <select required disabled={Boolean(selected)} value={form.farm_id} onChange={(event) => {
                const farmId = event.target.value
                setForm((current) => ({ ...current, farm_id: farmId, pan_id: pans.find((pan) => pan.farm_id === farmId)?.id ?? '' }))
              }} className={input}>
                <option value="">Select farm</option>{farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name} · {farm.farmer_name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Pen
              <select required disabled={viewMode || Boolean(selected)} value={form.pan_id} onChange={(event) => setForm((current) => ({ ...current, pan_id: event.target.value }))} className={input}>
                <option value="">Select pen</option>{pans.filter((pan) => pan.farm_id === form.farm_id).map((pan) => <option key={pan.id} value={pan.id}>{pan.name}{pan.pen_number ? ` · ${pan.pen_number}` : ''}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Tag Number<input required maxLength={100} disabled={viewMode} value={form.tag_number} onChange={(event) => setForm((current) => ({ ...current, tag_number: event.target.value }))} className={input} /></label>
            <label className="text-sm font-medium">Animal Type<input required maxLength={50} disabled={viewMode} value={form.animal_type} onChange={(event) => setForm((current) => ({ ...current, animal_type: event.target.value }))} className={input} /></label>
            <label className="text-sm font-medium">Breed<input maxLength={100} disabled={viewMode} value={form.breed} onChange={(event) => setForm((current) => ({ ...current, breed: event.target.value }))} className={input} /></label>
            <label className="text-sm font-medium">Gender
              <select disabled={viewMode} value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))} className={input}><option value="FEMALE">Female</option><option value="MALE">Male</option></select>
            </label>
            <label className="text-sm font-medium">Date of Birth<input type="date" disabled={viewMode} value={form.date_of_birth} onChange={(event) => setForm((current) => ({ ...current, date_of_birth: event.target.value }))} className={input} /></label>
            <label className="text-sm font-medium">Weight (kg)<input type="number" min="0" max="999999.99" step="0.01" disabled={viewMode} value={form.weight} onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))} className={input} /></label>
            <label className="text-sm font-medium">Status
              <select disabled={viewMode} value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className={input}><option value="ACTIVE">Active</option><option value="SOLD">Sold</option><option value="DECEASED">Deceased</option></select>
            </label>
            {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{error}</p>}
            <div className="flex justify-end gap-3 border-t pt-4 sm:col-span-2">
              <button type="button" onClick={closeModal} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
              {!viewMode && <button type="submit" disabled={saving} className="rounded-lg bg-green-800 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Animal'}</button>}
            </div>
          </form>
        )}
      </CommonModal>
    </main>
  )
}
