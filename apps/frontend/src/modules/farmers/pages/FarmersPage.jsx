import { useCallback, useEffect, useState } from 'react'
import {
  Search, SlidersHorizontal, MoreHorizontal,
  Users, UserCheck, UserX, RefreshCw, AlertCircle, Eye,
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import { getFarmers, getFarmerById, updateFarmerStatus } from '../farmers.service'

const STATUS_BADGE = {
  ACTIVE:    'bg-green-50 text-green-700 border-green-200',
  INACTIVE:  'bg-gray-100 text-gray-500 border-gray-200',
  SUSPENDED: 'bg-orange-50 text-orange-600 border-orange-200',
  REJECTED:  'bg-red-50 text-red-600 border-red-200',
}
const STATUS_LABEL = { ACTIVE: 'Active', INACTIVE: 'Inactive', SUSPENDED: 'Suspended', REJECTED: 'Rejected' }

const StatusBadge = ({ status }) => (
  <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-semibold ${STATUS_BADGE[status] ?? STATUS_BADGE.INACTIVE}`}>
    {STATUS_LABEL[status] ?? status}
  </span>
)

// Skeleton row
const SkeletonRow = () => (
  <tr className="border-t animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3 rounded bg-gray-200 w-24" />
      </td>
    ))}
  </tr>
)

export default function AdminFarmersPage() {
  const [items, setItems]           = useState([])
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]             = useState(1)
  const pageSize                    = 10

  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filter, setFilter]         = useState('All')
  const [showFilter, setShowFilter] = useState(false)

  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [actionError, setActionError] = useState('')

  const [menu, setMenu]             = useState(null)
  const [modal, setModal]           = useState('')   // '' | 'view'
  const [selected, setSelected]     = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const loadFarmers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, page_size: pageSize }
      if (debouncedSearch) params.search = debouncedSearch
      const { data } = await getFarmers(params)
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(data.total_pages ?? 1)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load farmers.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { loadFarmers() }, [loadFarmers])

  // client-side status filter (data is already paginated by backend search)
  const filtered = filter === 'All'
    ? items
    : items.filter((f) => f.status === filter)

  // counts derived from current page — totals come from API
  const activeCt   = items.filter((f) => f.status === 'ACTIVE').length
  const inactiveCt = items.filter((f) => f.status !== 'ACTIVE').length

  const openView = async (farmer) => {
    setDetailLoading(true)
    setModal('view')
    try {
      const { data } = await getFarmerById(farmer.id)
      setSelected(data)
    } catch {
      setSelected(farmer)   // fall back to list item
    } finally {
      setDetailLoading(false)
    }
  }

  const handleStatusChange = async (farmer, newStatus) => {
    setActionError('')
    try {
      await updateFarmerStatus(farmer.id, { status: newStatus })
      await loadFarmers()
    } catch (err) {
      setActionError(err.response?.data?.detail || 'Status update failed.')
    }
    setMenu(null)
  }

  const nextStatus = (current) =>
    current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-gray-800">
      <main className="p-8 space-y-6">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Farmer Management</h1>
            <p className="text-gray-500 mt-1">
              Manage registered farmers and their account status.
            </p>
          </div>
          <button
            type="button"
            onClick={loadFarmers}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-medium hover:border-green-700 hover:text-green-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard title="Total Farmers"    value={total}       subtitle="All registered farmers" icon={Users}      />
          <StatCard title="Active Farmers"   value={activeCt}    subtitle="Active on this page"    icon={UserCheck}  />
          <StatCard title="Inactive Farmers" value={inactiveCt}  subtitle="Inactive on this page"  icon={UserX}      />
        </div>

        {/* ── Errors ───────────────────────────────────────────────────── */}
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

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-[360px]">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, village, mobile..."
              className="w-full bg-white border rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700"
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilter((v) => !v)}
              className="bg-white border rounded-xl px-5 py-3 flex items-center gap-2 font-medium text-sm"
            >
              <SlidersHorizontal size={17} /> Filters
              {filter !== 'All' && <span className="h-2 w-2 rounded-full bg-green-700" />}
            </button>
            {showFilter && (
              <div className="absolute z-10 top-14 left-0 bg-white border rounded-xl shadow-lg w-40 p-2">
                {['All', 'ACTIVE', 'INACTIVE', 'SUSPENDED'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setFilter(s); setShowFilter(false) }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-green-50 ${filter === s ? 'font-semibold text-green-800' : ''}`}
                  >
                    {STATUS_LABEL[s] ?? s}
                  </button>
                ))}
              </div>
            )}
          </div>
          {filter !== 'All' && (
            <button
              type="button"
              onClick={() => setFilter('All')}
              className="text-xs text-gray-400 hover:text-gray-700 underline"
            >
              Clear filter
            </button>
          )}
          <span className="ml-auto text-xs text-gray-500">
            {total} total farmers
          </span>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className="bg-white border rounded-2xl overflow-visible shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-[11px]">
                <tr>
                  {['FARMER', 'MOBILE', 'EMAIL', 'VILLAGE', 'ANIMALS', 'STATUS', ''].map((h) => (
                    <th key={h} className="px-5 py-4 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map((f) => (
                    <tr key={f.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
                            {(f.full_name ?? 'F')[0].toUpperCase()}
                          </div>
                          <p className="text-xs font-semibold text-gray-800">{f.full_name ?? '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600">{f.mobile_number}</td>
                      <td className="px-5 py-4 text-xs text-gray-600">{f.email ?? '—'}</td>
                      <td className="px-5 py-4 text-xs text-gray-600">{f.village ?? '—'}</td>
                      <td className="px-5 py-4 text-xs text-gray-700 font-medium">{f.animals_count ?? 0}</td>
                      <td className="px-5 py-4"><StatusBadge status={f.status} /></td>
                      <td className="px-5 py-4 relative">
                        <button
                          type="button"
                          onClick={() => setMenu(menu === f.id ? null : f.id)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        {menu === f.id && (
                          <div className="absolute right-8 top-10 z-20 bg-white shadow-lg border rounded-xl w-40 p-1">
                            <button
                              type="button"
                              onClick={() => { openView(f); setMenu(null) }}
                              className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                            >
                              <Eye size={13} /> View Details
                            </button>
                            {['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(f.status) && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(f, nextStatus(f.status))}
                                className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-gray-50"
                              >
                                {f.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && !filtered.length && (
            <TableEmptyState message={search ? 'No farmers match your search.' : 'No farmers registered yet.'} />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-xs text-gray-500">
            <span>
              Showing {total ? (page - 1) * pageSize + 1 : 0} –{' '}
              {Math.min(page * pageSize, total)} of {total} farmers
            </span>
            <TablePagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      </main>

      {/* ── View Detail Modal ─────────────────────────────────────────────── */}
      <CommonModal isOpen={modal === 'view'} onClose={() => { setModal(''); setSelected(null) }} title="Farmer Details">
        {detailLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-gray-400">
            <RefreshCw size={16} className="animate-spin mr-2" /> Loading...
          </div>
        ) : selected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-green-50 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-800 text-xl font-bold text-white">
                {(selected.full_name ?? 'F')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{selected.full_name ?? '—'}</p>
                <p className="text-sm text-gray-500">{selected.village ?? 'Village not set'}</p>
                <div className="mt-1"><StatusBadge status={selected.status} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Mobile',   selected.mobile_number],
                ['Email',    selected.email ?? '—'],
                ['Village',  selected.village ?? '—'],
                ['Pincode',  selected.pincode ?? '—'],
                ['Animals',  selected.animals_count ?? 0],
                ['Verified', selected.is_verified ? 'Yes' : 'No'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border bg-gray-50 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">{value}</p>
                </div>
              ))}
            </div>
            {selected.farms?.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Farms</p>
                <div className="space-y-2">
                  {selected.farms.map((farm) => (
                    <div key={farm.id} className="rounded-lg border bg-gray-50 px-3 py-2 text-xs text-gray-700">
                      <span className="font-semibold">{farm.name}</span>
                      {farm.village && <span className="text-gray-400"> · {farm.village}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end border-t pt-4">
              <button
                type="button"
                onClick={() => { setModal(''); setSelected(null) }}
                className="rounded-lg border px-5 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </CommonModal>
    </div>
  )
}
