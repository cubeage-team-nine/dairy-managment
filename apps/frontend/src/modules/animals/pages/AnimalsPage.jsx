import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Bell,
  Columns2,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useAuth } from '../../../core/hooks/useAuth.js'
import { ROLE_LABELS } from '../../../core/constants/app.constants.js'

const INITIAL_ANIMALS = [
  {
    id: 1,
    herdTag: '#COW-4091',
    name: 'Lakshmi',
    breed: 'Jersey Purebred',
    category: 'Milking',
    age: '4.2 Yrs',
    status: 'Active',
    milkYield: '29.4 L/day',
  },
  {
    id: 2,
    herdTag: '#COW-4092',
    name: 'Gauri',
    breed: 'Holstein Friesian',
    category: 'Milking',
    age: '5.1 Yrs',
    status: 'Pregnant',
    milkYield: '32.1 L/day',
  },
  {
    id: 3,
    herdTag: '#COW-4093',
    name: 'Ganga',
    breed: 'Sahiwal',
    category: 'Dry',
    age: '3.8 Yrs',
    status: 'Active',
    milkYield: '0 L/day',
  },
  {
    id: 4,
    herdTag: '#COW-4094',
    name: 'Radha',
    breed: 'Gir',
    category: 'Milking',
    age: '4.0 Yrs',
    status: 'Sick',
    milkYield: '14.2 L/day',
  },
]

const EMPTY_FORM = {
  herdTag: '',
  name: '',
  breed: '',
  category: 'Milking',
  age: '',
  status: 'Active',
  milkYield: '',
}

const PAGE_SIZE = 4

function AnimalsPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState(INITIAL_ANIMALS)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [breedFilter, setBreedFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)

  const [modalType, setModalType] = useState(null)
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [actionMenu, setActionMenu] = useState(null)

  // Dynamic Unique Options for Filters
  const categories = useMemo(() => [...new Set(animals.map((a) => a.category))], [animals])
  const breeds = useMemo(() => [...new Set(animals.map((a) => a.breed))], [animals])
  const statuses = useMemo(() => [...new Set(animals.map((a) => a.status))], [animals])

  // Filtered List based on Search & Select Controls
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        animal.name.toLowerCase().includes(q) ||
        animal.herdTag.toLowerCase().includes(q) ||
        animal.breed.toLowerCase().includes(q) ||
        animal.category.toLowerCase().includes(q)

      const matchCat = categoryFilter === 'All' || animal.category === categoryFilter
      const matchBreed = breedFilter === 'All' || animal.breed === breedFilter
      const matchStatus = statusFilter === 'All' || animal.status === statusFilter

      return matchSearch && matchCat && matchBreed && matchStatus
    })
  }, [animals, searchQuery, categoryFilter, breedFilter, statusFilter])

  // Dynamic Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAnimals.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visibleAnimals = useMemo(() => {
    return filteredAnimals.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  }, [filteredAnimals, currentPage])

  const firstItem = filteredAnimals.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const lastItem = Math.min(currentPage * PAGE_SIZE, filteredAnimals.length)

  // Modal Handlers
  const closeModal = () => {
    setModalType(null)
    setSelectedAnimal(null)
    setFormData(EMPTY_FORM)
  }

  const openAddModal = () => {
    setActionMenu(null)
    setSelectedAnimal(null)
    setFormData(EMPTY_FORM)
    setModalType('add')
  }

  const openViewModal = (animal) => {
    setActionMenu(null)
    setSelectedAnimal(animal)
    setModalType('view')
  }

  const openEditModal = (animal) => {
    setActionMenu(null)
    setSelectedAnimal(animal)
    setFormData({
      herdTag: animal.herdTag.replace('#', ''),
      name: animal.name,
      breed: animal.breed,
      category: animal.category,
      age: animal.age.replace(' Yrs', ''),
      status: animal.status,
      milkYield: animal.milkYield.replace(' L/day', ''),
    })
    setModalType('edit')
  }

  const openDeleteModal = (animal) => {
    setActionMenu(null)
    setSelectedAnimal(animal)
    setModalType('delete')
  }

  const toggleActionMenu = (event, animal) => {
    if (actionMenu?.animal.id === animal.id) {
      setActionMenu(null)
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    setActionMenu({ animal, rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right } })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formattedTag = formData.herdTag.startsWith('#') ? formData.herdTag : `#${formData.herdTag}`
    const formattedAge = formData.age.endsWith('Yrs') ? formData.age : `${formData.age} Yrs`
    const formattedYield = formData.milkYield.endsWith('L/day') ? formData.milkYield : `${formData.milkYield} L/day`

    if (modalType === 'add') {
      const newAnimal = {
        id: Date.now(),
        ...formData,
        herdTag: formattedTag,
        age: formattedAge,
        milkYield: formattedYield,
      }
      setAnimals((prev) => [newAnimal, ...prev])
      setPage(1)
    } else if (modalType === 'edit' && selectedAnimal) {
      setAnimals((prev) =>
        prev.map((a) =>
          a.id === selectedAnimal.id
            ? {
                ...a,
                ...formData,
                herdTag: formattedTag,
                age: formattedAge,
                milkYield: formattedYield,
              }
            : a
        )
      )
    }
    closeModal()
  }

  const handleDelete = () => {
    if (!selectedAnimal) return
    setAnimals((prev) => prev.filter((a) => a.id !== selectedAnimal.id))
    closeModal()
  }

  const handleFilterChange = (setter, value) => {
    setter(value)
    setPage(1)
  }

  // Display user details dynamically
  const userName = user?.name || 'Farmer Admin'
  const userRoleText = user?.role ? ROLE_LABELS[user.role] : 'Smart Dairy User'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="-m-6 min-h-screen bg-[#fbfaf7] text-[#1c211d]">
      {/* ==============================================
          TOP HEADER BAR
      =============================================== */}
      <header className="flex flex-col gap-4 border-b border-[#e5e6e1] bg-white px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#161a17]">
          Animals Registry
        </h1>

        <div className="flex items-center gap-5">
          {/* Dynamic Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c928e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search animals, tags, breeds..."
              className="h-9 w-full rounded-md border border-[#e2e3dd] bg-[#f7f8f4] pl-9 pr-3 text-xs text-[#1c211d] outline-none transition placeholder:text-[#8c928e] focus:border-[#2f7657] focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9da39e] hover:text-[#1c211d]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Notification Button */}
          <button
            type="button"
            className="relative rounded-full p-2 text-[#68716b] hover:bg-[#f3f4ef]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          {/* Dynamic User Profile Badge */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f7657] text-xs font-bold text-white shadow-xs">
              {userInitial}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[#1c211d]">{userName}</span>
              <span className="text-[10px] text-[#787f7a]">{userRoleText}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ==============================================
          MAIN CONTENT AREA
      =============================================== */}
      <main className="p-8 space-y-5">
        {/* Filter Controls & Add Button (Crisp rounded-md border) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect
              label="Category"
              value={categoryFilter}
              options={categories}
              onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
            />
            <FilterSelect
              label="Breed"
              value={breedFilter}
              options={breeds}
              onChange={(e) => handleFilterChange(setBreedFilter, e.target.value)}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              options={statuses}
              onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#2f7657] px-4 text-xs font-semibold text-white transition hover:bg-[#256046]"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Animal</span>
          </button>
        </div>

        {/* Animals Table Card */}
        <div className="rounded-xl border border-[#e2e3dd] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e8e9e3] bg-white">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#828984]">HERD TAG</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#828984]">NAME</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#828984]">BREED</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#828984]">CATEGORY</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#828984]">AGE</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#828984]">STATUS</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#828984]">MILK YIELD</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#828984]">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ecede7]">
                {visibleAnimals.map((animal, idx) => (
                  <tr
                    key={animal.id}
                    className={`transition-colors ${
                      idx % 2 === 1 ? 'bg-[#faf9f6]' : 'bg-white'
                    } hover:bg-[#f3f4ef]`}
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-bold text-[#161a17]">
                      {animal.herdTag}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-[#1c211d]">
                      {animal.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-[#5e6560]">
                      {animal.breed}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-[#5e6560]">
                      {animal.category}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-[#5e6560]">
                      {animal.age}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs">
                      <StatusBadge status={animal.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs font-semibold text-[#1c211d]">
                      {animal.milkYield}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(animal)}
                          className="rounded-md p-1.5 text-[#737a75] hover:bg-[#e7e9e3] hover:text-[#1c211d]"
                          aria-label={`Edit ${animal.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => toggleActionMenu(e, animal)}
                          className="rounded-md p-1.5 text-[#737a75] hover:bg-[#e7e9e3] hover:text-[#1c211d]"
                          aria-label={`Actions for ${animal.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {visibleAnimals.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-14 text-center">
                      <p className="text-sm font-bold text-[#1c211d]">No matching animals found</p>
                      <p className="mt-1 text-xs text-[#7a817c]">
                        Try searching for a different keyword or updating your category/breed filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Dynamic Table Footer */}
          <div className="flex flex-col gap-3 border-t border-[#e2e3dd] bg-white px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#737a75]">
              Showing {firstItem} to {lastItem} of {filteredAnimals.length} animals
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="h-8 rounded-md border border-[#dcded8] bg-white px-3.5 text-xs font-medium text-[#303631] hover:bg-[#f4f5f0] disabled:cursor-not-allowed disabled:text-[#a0a6a1]"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="h-8 rounded-md bg-[#2f7657] px-3.5 text-xs font-medium text-white hover:bg-[#256046] disabled:cursor-not-allowed disabled:bg-[#9abfb0]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Dynamic Action Menu Portal */}
      {actionMenu && (
        <ActionMenuPortal
          anchorRect={actionMenu.rect}
          onClose={() => setActionMenu(null)}
          onView={() => openViewModal(actionMenu.animal)}
          onEdit={() => openEditModal(actionMenu.animal)}
          onDelete={() => openDeleteModal(actionMenu.animal)}
        />
      )}

      {/* Add / Edit Modal */}
      {(modalType === 'add' || modalType === 'edit') && (
        <Modal
          title={modalType === 'add' ? 'Add New Animal' : 'Edit Animal'}
          description={modalType === 'add' ? 'Enter the details of the new animal.' : 'Update animal information below.'}
          onClose={closeModal}
        >
          <AnimalForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            submitText={modalType === 'add' ? 'Add Animal' : 'Save Changes'}
          />
        </Modal>
      )}

      {/* View Modal */}
      {modalType === 'view' && selectedAnimal && (
        <Modal title="Animal Details" description={`Information for ${selectedAnimal.name}`} onClose={closeModal}>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <DetailItem label="Herd Tag" value={selectedAnimal.herdTag} />
            <DetailItem label="Name" value={selectedAnimal.name} />
            <DetailItem label="Breed" value={selectedAnimal.breed} />
            <DetailItem label="Category" value={selectedAnimal.category} />
            <DetailItem label="Age" value={selectedAnimal.age} />
            <div className="rounded-lg border border-[#e2e3dd] bg-[#faf9f6] p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#7a817c]">Status</p>
              <StatusBadge status={selectedAnimal.status} />
            </div>
            <DetailItem label="Milk Yield" value={selectedAnimal.milkYield} />
          </div>
          <div className="mt-6 flex justify-end gap-2.5">
            <button type="button" onClick={closeModal} className="h-9 rounded-md border border-[#dedfd9] bg-white px-4 text-xs font-semibold text-[#252a26] hover:bg-[#f4f0]">
              Close
            </button>
            <button type="button" onClick={() => openEditModal(selectedAnimal)} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#2f7657] px-4 text-xs font-semibold text-white hover:bg-[#256046]">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {modalType === 'delete' && selectedAnimal && (
        <Modal title="Delete Animal" description="This action cannot be undone." onClose={closeModal}>
          <p className="text-xs leading-relaxed text-[#686f6a]">
            Are you sure you want to remove <span className="font-bold text-[#161a17]">{selectedAnimal.name}</span> ({selectedAnimal.herdTag}) from your herd list?
          </p>
          <div className="mt-6 flex justify-end gap-2.5">
            <button type="button" onClick={closeModal} className="h-9 rounded-md border border-[#dedfd9] bg-white px-4 text-xs font-semibold text-[#252a26] hover:bg-[#f4f5f0]">
              Cancel
            </button>
            <button type="button" onClick={handleDelete} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ============================================================
   SUB-COMPONENTS WITH CRISP RADIUS
============================================================ */

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={onChange}
        className="h-9 cursor-pointer appearance-none rounded-md border border-[#dedfd9] bg-white pl-3 pr-8 text-xs font-medium text-[#2d332e] outline-none transition hover:bg-[#fafaf8] focus:border-[#2f7657]"
      >
        <option value="All">{label}: All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {label}: {opt}
          </option>
        ))}
      </select>
      <Columns2 className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#737a75]" />
    </div>
  )
}

function StatusBadge({ status }) {
  const badgeStyles = {
    Active: 'bg-[#dff3e5] text-[#367c4f]',
    Pregnant: 'bg-[#dff1ff] text-[#2783ba]',
    Sick: 'bg-[#ffe4e4] text-[#d94b4b]',
    Inactive: 'bg-[#eeeeeb] text-[#686e69]',
  }

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold ${
        badgeStyles[status] ?? 'bg-[#eeeeeb] text-[#686e69]'
      }`}
    >
      {status}
    </span>
  )
}

function AnimalForm({ formData, onChange, onSubmit, onCancel, submitText }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Herd Tag" name="herdTag" value={formData.herdTag} onChange={onChange} placeholder="COW-4095" required />
        <FormField label="Animal Name" name="name" value={formData.name} onChange={onChange} placeholder="e.g. Nandini" required />
        <FormField label="Breed" name="breed" value={formData.breed} onChange={onChange} placeholder="e.g. Gir" required />
        <SelectField label="Category" name="category" value={formData.category} onChange={onChange} options={['Milking', 'Dry', 'Calf', 'Heifer', 'Bull']} />
        <FormField label="Age (Years)" name="age" type="number" min="0" step="0.1" value={formData.age} onChange={onChange} placeholder="4.2" required />
        <SelectField label="Status" name="status" value={formData.status} onChange={onChange} options={['Active', 'Pregnant', 'Sick', 'Inactive']} />
        <FormField label="Milk Yield (L/day)" name="milkYield" type="number" min="0" step="0.1" value={formData.milkYield} onChange={onChange} placeholder="20" required />
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="h-9 rounded-md border border-[#dedfd9] bg-white px-4 text-xs font-semibold text-[#252a26] hover:bg-[#f4f5f0]">
          Cancel
        </button>
        <button type="submit" className="h-9 rounded-md bg-[#2f7657] px-4 text-xs font-semibold text-white hover:bg-[#256046]">
          {submitText}
        </button>
      </div>
    </form>
  )
}

function FormField({ label, name, value, onChange, type = 'text', ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#252a26]">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="h-10 w-full rounded-md border border-[#dedfd9] bg-[#fafaf8] px-3 text-xs text-[#252a26] outline-none transition placeholder:text-[#9a9f9b] focus:border-[#2f7657] focus:bg-white"
        {...props}
      />
    </label>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#252a26]">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-10 w-full rounded-md border border-[#dedfd9] bg-[#fafaf8] px-3 text-xs text-[#252a26] outline-none focus:border-[#2f7657] focus:bg-white"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}

function Modal({ title, description, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#dedfd9] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#e8e9e3] px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-[#1c211d]">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-[#7a817c]">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-[#737a75] hover:bg-[#f4f5f0]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function ActionMenuPortal({ anchorRect, onClose, onView, onEdit, onDelete }) {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && onClose()
    const handlePositionChange = () => onClose()

    document.addEventListener('pointerdown', handleOutsideClick)
    window.addEventListener('resize', handlePositionChange)
    window.addEventListener('scroll', handlePositionChange, true)

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
      window.removeEventListener('resize', handlePositionChange)
      window.removeEventListener('scroll', handlePositionChange, true)
    }
  }, [onClose])

  if (typeof document === 'undefined' || typeof window === 'undefined') return null

  const MENU_WIDTH = 148, MENU_HEIGHT = 124, GAP = 6, VIEWPORT_PADDING = 8
  const hasRoomBelow = window.innerHeight - anchorRect.bottom >= MENU_HEIGHT + GAP
  let top = hasRoomBelow ? anchorRect.bottom + GAP : anchorRect.top - MENU_HEIGHT - GAP
  top = Math.max(VIEWPORT_PADDING, top)

  let left = Math.max(VIEWPORT_PADDING, Math.min(anchorRect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING))

  return createPortal(
    <div ref={menuRef} style={{ top, left, width: MENU_WIDTH }} className="fixed z-[100] overflow-hidden rounded-md border border-[#dedfd9] bg-white py-1 shadow-xl">
      <button type="button" onClick={onView} className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-medium text-[#2d332e] hover:bg-[#f4f5f0]">
        <Eye className="h-3.5 w-3.5" /> View
      </button>
      <button type="button" onClick={onEdit} className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-medium text-[#2d332e] hover:bg-[#f4f5f0]">
        <Pencil className="h-3.5 w-3.5" /> Edit
      </button>
      <button type="button" onClick={onDelete} className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50">
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
    </div>,
    document.body
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-md border border-[#e2e3dd] bg-[#faf9f6] p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a817c]">{label}</p>
      <p className="mt-1.5 text-xs font-bold text-[#1c211d]">{value}</p>
    </div>
  )
}

export default AnimalsPage