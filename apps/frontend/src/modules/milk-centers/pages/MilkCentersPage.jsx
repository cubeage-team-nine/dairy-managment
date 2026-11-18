import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search, Plus, SlidersHorizontal, MoreHorizontal,
  Milk, Building2, CheckCircle, XCircle, RefreshCw, AlertCircle,
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import { MC_BLANK, MC_STATUSES } from '../milk-centers.constants'
import {
  fetchMilkCenters,
  createMilkCenter,
  updateMilkCenter,
  deleteMilkCenter,
  toggleMilkCenterStatus,
} from '../milk-centers.service'

const inp = 'w-full border rounded-lg p-3 text-sm outline-none focus:border-green-700'

const SBadge = ({ active }) => (
  <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-semibold ${
    active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
  }`}>
    {active ? 'Active' : 'Inactive'}
  </span>
)

const Lbl = ({ label, children }) => (
  <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
    {label}{children}
  </label>
)

const Cell = ({ cls = '', children }) => (
  <td className={`px-5 py-4 text-xs ${cls}`}>{children}</td>
)

const SkeletonRow = () => (
  <tr className="border-t animate-pulse">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3 rounded bg-gray-200 w-20" />
      </td>
    ))}
  </tr>
)

const FIELDS = [
  ['name',                  'text',   'Center Name',          true ],
  ['code',                  'text',   'Center Code',          false],
  ['location',              'text',   'Location',             false],
  ['manager_name',          'text',   'Manager Name',         false],
  ['contact_number',        'tel',    'Contact Number',       false],
  ['email',                 'email',  'Email (optional)',     false],
  ['daily_capacity_litres', 'number', 'Daily Capacity (L)',   false],
]

// Map API shape → form shape and back
const toForm = (c) => ({
  name:                  c.name ?? '',
  code:                  c.code ?? '',
  location:              c.location ?? '',
  manager_name:          c.manager_name ?? '',
  contact_number:        c.contact_number ?? '',
  email:                 c.email ?? '',
  daily_capacity_litres: c.daily_capacity_litres != null ? String(c.daily_capacity_litres) : '',
  is_active:             c.is_active ?? true,
})

const toPayload = (form) => ({
  name:                  form.name,
  code:                  form.code || null,
  location:              form.location || null,
  manager_name:          form.manager_name || null,
  contact_number:        form.contact_number || null,
  email:                 form.email || null,
  daily_capacity_litres: form.daily_capacity_litres !== '' ? Number(form.daily_capacity_litres) : null,
  is_active:             form.is_active,
})

export default function MilkCentersPage() {
  const [items, setItems]           = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const pageSize                    = 10

  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [fStatus, setFStatus]       = useState('All')
  const [showFilter, setShowFilter] = useState(false)

  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [actionError, setActionError] = useState('')
  const [success, setSuccess]       = useState('')

  const [modal, setModal]           = useState('')   // '' | 'add' | 'edit' | 'view'
  const [selected, setSelected]     = useState(null)
  const [form, setForm]             = useState(MC_BLANK)
  const [menu, setMenu]             = useState(null)

  const set = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const loadCenters = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, page_size: pageSize }
      if (debouncedSearch) params.search = debouncedSearch
      if (fStatus === 'Active')   params.is_active = true
      if (fStatus === 'Inactive') params.is_active = false
      const { data } = await fetchMilkCenters(params)
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load milk centers.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, fStatus])

  useEffect(() => { loadCenters() }, [loadCenters])

  const activeCt   = items.filter((c) => c.is_active).length
  const inactiveCt = items.filter((c) => !c.is_active).length
  const totalCap   = items.reduce((s, c) => s + Number(c.daily_capacity_litres ?? 0), 0)

  const clear = () => { setFStatus('All'); setSearch(''); setPage(1) }

  const openAdd  = () => { setForm(MC_BLANK); setSelected(null); setModal('add') }
  const openEdit = (c) => { setSelected(c); setForm(toForm(c)); setModal('edit') }
  const openView = (c) => { setSelected(c); setModal('view') }
  const close    = () => { setModal(''); setSelected(null); setForm(MC_BLANK); setMenu(null); setActionError('') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setActionError('')
    try {
      const payload = toPayload(form)
      if (modal === 'add') {
        await createMilkCenter(payload)
        setSuccess('Milk center created.')
      } else {
        await updateMilkCenter(selected.id, payload)
        setSuccess('Milk center updated.')
      }
      close()
      await loadCenters()
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return
    setActionError('')
    try {
      await deleteMilkCenter(c.id)
      setSuccess('Milk center deleted.')
      await loadCenters()
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Delete failed.')
    }
    setMenu(null)
  }

  const handleToggle = async (c) => {
    setActionError('')
    try {
      await toggleMilkCenterStatus(c.id, !c.is_active)
      await loadCenters()
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Status update failed.')
    }
    setMenu(null)
  }

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-gray-800">
      <main className="space-y-6 p-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Milk Centers Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage milk collection centers, operators, and capacities.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={loadCenters}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-medium hover:border-green-700 hover:text-green-700 disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={openAdd}
              className="flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-900"
            >
              <Plus size={18} /> Add New Center
            </button>
          </div>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Centers"    value={total}        subtitle="All registered centers"   icon={Building2}   />
          <StatCard title="Active Centers"   value={activeCt}     subtitle="Currently operational"    icon={CheckCircle} />
          <StatCard title="Inactive Centers" value={inactiveCt}   subtitle="Not operational"          icon={XCircle}     />
          <StatCard title="Daily Capacity"   value={`${totalCap.toLocaleString('en-IN')} L`} subtitle="Total (this page)" icon={Milk} />
        </div>

        {/* ── Errors / Success ─────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {actionError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} /> {actionError}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-green-200 bg-white px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-[380px]">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search milk centers..."
              className="w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700"
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilter((v) => !v)}
              className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-medium hover:border-green-700"
            >
              <SlidersHorizontal size={17} /> Filters
              {fStatus !== 'All' && <span className="h-2 w-2 rounded-full bg-green-700" />}
            </button>
            {showFilter && (
              <div className="absolute left-0 top-14 z-10 w-44 space-y-2 rounded-xl border bg-white p-3 shadow-lg">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</p>
                <div className="flex gap-2">
                  {['All', ...MC_STATUSES].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setFStatus(s); setPage(1); setShowFilter(false) }}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        fStatus === s ? 'border-green-700 bg-green-700 text-white' : 'hover:border-green-600 hover:text-green-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { clear(); setShowFilter(false) }}
                  className="w-full rounded-lg border py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
          {(fStatus !== 'All' || search) && (
            <button type="button" onClick={clear} className="text-xs text-gray-400 underline hover:text-gray-700">
              Clear all
            </button>
          )}
          <span className="ml-auto text-xs text-gray-500">{total} total centers</span>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className="overflow-visible rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[11px] font-medium text-gray-500">
                <tr>
                  {['CENTER NAME', 'CODE', 'LOCATION', 'MANAGER', 'CONTACT', 'CAPACITY', 'STATUS', ''].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : items.map((c) => (
                    <tr key={c.id} className="border-t transition-colors hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-800">
                            <Milk size={16} />
                          </div>
                          <p className="text-xs font-semibold text-gray-800">{c.name}</p>
                        </div>
                      </td>
                      <Cell cls="font-medium text-green-800">{c.code ?? '—'}</Cell>
                      <Cell cls="text-gray-600">{c.location ?? '—'}</Cell>
                      <Cell cls="text-gray-600">{c.manager_name ?? '—'}</Cell>
                      <Cell cls="text-gray-600">{c.contact_number ?? '—'}</Cell>
                      <Cell cls="text-gray-600">
                        {c.daily_capacity_litres != null ? `${Number(c.daily_capacity_litres).toLocaleString('en-IN')} L` : '—'}
                      </Cell>
                      <td className="px-5 py-4"><SBadge active={c.is_active} /></td>
                      <td className="relative px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setMenu(menu === c.id ? null : c.id)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        {menu === c.id && (
                          <div className="absolute right-8 top-10 z-20 w-40 rounded-xl border bg-white p-1 shadow-lg">
                            {[
                              ['View Details', () => { openView(c); setMenu(null) }, ''],
                              ['Edit',         () => { openEdit(c); setMenu(null) }, ''],
                              [c.is_active ? 'Deactivate' : 'Activate', () => handleToggle(c), ''],
                              ['Delete', () => handleDelete(c), 'text-red-600 hover:bg-red-50'],
                            ].map(([label, fn, cls]) => (
                              <button
                                key={label}
                                type="button"
                                onClick={fn}
                                className={`w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50 ${cls}`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && !items.length && (
            <TableEmptyState message="No milk centers found." />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-xs text-gray-500">
            <span>
              Showing {total ? (page - 1) * pageSize + 1 : 0} –{' '}
              {Math.min(page * pageSize, total)} of {total} centers
            </span>
            <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </div>
        </div>
      </main>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <CommonModal
        isOpen={modal === 'add' || modal === 'edit'}
        onClose={close}
        title={modal === 'add' ? 'Add New Milk Center' : 'Edit Milk Center'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {actionError && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-xs text-red-700">{actionError}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            {FIELDS.map(([name, type, label, req]) => (
              <Lbl key={name} label={label}>
                <input
                  name={name}
                  type={type}
                  required={req}
                  min={type === 'number' ? 0 : undefined}
                  step={type === 'number' ? 'any' : undefined}
                  placeholder={label}
                  value={form[name]}
                  onChange={set}
                  className={inp}
                />
              </Lbl>
            ))}
            <Lbl label="Status">
              <select name="is_active" value={String(form.is_active)} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === 'true' }))} className={inp}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </Lbl>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-800 px-5 py-2 text-sm font-semibold text-white hover:bg-green-900 disabled:opacity-50"
            >
              {saving ? 'Saving…' : modal === 'add' ? 'Save Center' : 'Save Changes'}
            </button>
          </div>
        </form>
      </CommonModal>

      {/* ── View Modal ───────────────────────────────────────────────────── */}
      <CommonModal isOpen={modal === 'view'} onClose={close} title="Milk Center Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-green-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-800 text-white">
                <Milk size={22} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">{selected.name}</p>
                <p className="text-xs text-gray-500">{selected.code ?? ''} {selected.location ? `· ${selected.location}` : ''}</p>
                <div className="mt-1"><SBadge active={selected.is_active} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Code',           selected.code ?? '—'],
                ['Location',       selected.location ?? '—'],
                ['Manager',        selected.manager_name ?? '—'],
                ['Contact',        selected.contact_number ?? '—'],
                ['Email',          selected.email ?? '—'],
                ['Daily Capacity', selected.daily_capacity_litres != null ? `${Number(selected.daily_capacity_litres).toLocaleString('en-IN')} L` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border bg-gray-50 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-700">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => { close(); openEdit(selected) }}
                className="rounded-lg border border-green-700 px-4 py-2 text-sm text-green-800 hover:bg-green-50"
              >
                Edit
              </button>
              <button type="button" onClick={close} className="rounded-lg border px-5 py-2 text-sm">
                Close
              </button>
            </div>
          </div>
        )}
      </CommonModal>
    </div>
  )
}
