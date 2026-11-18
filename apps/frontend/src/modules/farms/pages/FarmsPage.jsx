import { useCallback, useEffect, useState } from 'react'
import {
  Search, SlidersHorizontal, MoreHorizontal,
  Warehouse, Layers, RefreshCw, AlertCircle, Eye,
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import { getAdminFarms } from '../farms.service'

const SkeletonRow = () => (
  <tr className="border-t animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3 rounded bg-gray-200 w-24" />
      </td>
    ))}
  </tr>
)

export default function FarmsPage() {
  const [items, setItems]           = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const pageSize                    = 10

  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const [modal, setModal]           = useState('')   // '' | 'view'
  const [selected, setSelected]     = useState(null)
  const [menu, setMenu]             = useState(null)

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const loadFarms = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, page_size: pageSize }
      if (debouncedSearch) params.search = debouncedSearch
      const { data } = await getAdminFarms(params)
      setItems(data.items ?? [])
      setTotal(data.total ?? 0)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load farms.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { loadFarms() }, [loadFarms])

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-gray-800">
      <main className="space-y-6 p-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Farm Management</h1>
            <p className="mt-1 text-sm text-gray-500">View all registered farms and their farmer details.</p>
          </div>
          <button
            type="button"
            onClick={loadFarms}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-medium hover:border-green-700 hover:text-green-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Total Farms"   value={total}  subtitle="All registered farms"   icon={Warehouse} />
          <StatCard title="This Page"     value={items.length} subtitle="Farms on this page" icon={Layers}  />
          <StatCard title="Total Animals" value={items.reduce((s, f) => s + (f.total_animals ?? 0), 0)} subtitle="Active animals (this page)" icon={Layers} />
        </div>

        {/* ── Error ────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-[380px]">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search farm name, village, farmer..."
              className="w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700"
            />
          </div>
          <span className="ml-auto text-xs text-gray-500">{total} total farms</span>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className="overflow-visible rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[11px] font-medium text-gray-500">
                <tr>
                  {['FARM NAME', 'FARMER', 'MOBILE', 'VILLAGE', 'ANIMALS', ''].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : items.map((f) => (
                    <tr key={f.id} className="border-t transition-colors hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-800">
                            <Warehouse size={16} />
                          </div>
                          <p className="text-xs font-semibold text-gray-800">{f.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600">{f.farmer_name ?? '—'}</td>
                      <td className="px-5 py-4 text-xs text-gray-600">{f.farmer_mobile ?? '—'}</td>
                      <td className="px-5 py-4 text-xs text-gray-600">{f.village ?? '—'}</td>
                      <td className="px-5 py-4 text-xs font-medium text-gray-700">{f.total_animals ?? 0}</td>
                      <td className="relative px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setMenu(menu === f.id ? null : f.id)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        {menu === f.id && (
                          <div className="absolute right-8 top-10 z-20 w-36 rounded-xl border bg-white p-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() => { setSelected(f); setModal('view'); setMenu(null) }}
                              className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-1.5"
                            >
                              <Eye size={13} /> View Details
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && !items.length && (
            <TableEmptyState message={search ? 'No farms match your search.' : 'No farms registered yet.'} />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-xs text-gray-500">
            <span>
              Showing {total ? (page - 1) * pageSize + 1 : 0} –{' '}
              {Math.min(page * pageSize, total)} of {total} farms
            </span>
            <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          </div>
        </div>
      </main>

      {/* ── View Modal ───────────────────────────────────────────────────── */}
      <CommonModal isOpen={modal === 'view'} onClose={() => { setModal(''); setSelected(null) }} title="Farm Details">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-green-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-800 text-white">
                <Warehouse size={22} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">{selected.name}</p>
                <p className="text-xs text-gray-500">{selected.village ?? 'Village not set'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Farmer',       selected.farmer_name ?? '—'],
                ['Mobile',       selected.farmer_mobile ?? '—'],
                ['Village',      selected.village ?? '—'],
                ['Pincode',      selected.pincode ?? '—'],
                ['Total Animals', selected.total_animals ?? 0],
                ['Address',      selected.address ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border bg-gray-50 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">{value}</p>
                </div>
              ))}
            </div>
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
        )}
      </CommonModal>
    </div>
  )
}
