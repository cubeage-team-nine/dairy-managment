
import { useEffect, useState } from 'react'
import { Search, Bell } from 'lucide-react'
import api from '../../../core/services/api.js'

const fields = [
  ['name', 'Farm Name'],
  ['location', 'Location'],
  ['total_land_area', 'Total Land Area'],
  ['farm_type', 'Farm Type'],
]

export default function FarmsPage() {
  const [farm, setFarm] = useState(null)
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/farms').then(({ data }) => {
      const list = Array.isArray(data) ? data : data.items ?? []
      setFarm(list[0] || null)
      setForm(list[0] || {})
    }).catch(err => setError(
      err.response?.data?.detail || 'Unable to load farm'
    )).finally(() => setLoading(false))
  }, [])

  const saveFarm = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = Object.fromEntries(
        fields.map(([key]) => [key, form[key]])
      )
      const { data } = await api.put(`/farms/${farm.id}`, payload)
      const updated = data?.farm ?? data
      setFarm(updated)
      setForm(updated)
      setEditing(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#302e2c]">
      <style>{`
        @page { size: Letter portrait; margin: .3in; }
        @media print {
          .no-print { display: none !important; }
          .farm-layout { grid-template-columns: 1.7fr 1fr !important; }
          .farm-map { height: 5in !important; }
        }
      `}</style>

      <header className="no-print flex h-[65px] items-center justify-between border-b bg-white px-5">
        <h1 className="text-xl font-bold">My Farm</h1>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 rounded-lg border bg-[#faf8f5] px-3 py-2">
            <Search size={17} />
            <input placeholder="Search animals, tasks, guides..."
              className="w-44 bg-transparent text-xs outline-none" />
          </div>
          <Bell size={20} />
          <span className="text-sm font-medium">
            {farm?.farmer_name || 'Farmer'}
          </span>
        </div>
      </header>

      <main className="farm-layout grid grid-cols-1 items-start gap-4 p-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-xl border border-[#e8e1da] bg-white p-5">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">
                {loading ? 'Loading...' : farm?.name || 'My Farm'}
              </h2>
              <button disabled={!farm} onClick={() => setEditing(true)}
                className="no-print rounded-lg bg-[#d8f3dc] px-4 py-2 text-xs font-semibold text-[#347356] disabled:opacity-50">
                Edit Farm Details
              </button>
            </div>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                ['LOCATION', farm?.location],
                ['TOTAL LAND AREA', farm?.total_land_area ? `${farm.total_land_area} Acres` : '—'],
                ['FARM TYPE', farm?.farm_type],
                ['REGISTRATION ID', farm?.registration_id],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="mb-1 text-[10px] text-stone-400">{label}</p>
                  <p className="text-xs">{value || '—'}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#e8e1da] bg-white p-5">
            <h2 className="mb-4 text-base font-bold">
              Farm Infrastructure Photo Gallery
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <img src="/Img/Farm%201.jpg" alt="Dairy farm"
                className="h-[108px] w-full rounded-lg object-cover" />
              <img src="/Img/Farm%202.jpg" alt="Farm pasture"
                className="h-[108px] w-full rounded-lg object-cover" />
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-[#e8e1da] bg-white p-5">
          <h2 className="mb-4 text-base font-bold">
            Pasture Mapping &amp; Location
          </h2>
          <img src="/Img/Grid%20Map%20Panel.png" alt="Pasture map"
            className="farm-map h-[455px] w-full rounded-lg object-cover" />
        </section>
      </main>

      {editing && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveFarm}
            className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">Edit Farm Details</h2>
            {fields.map(([key, label]) => (
              <label key={key} className="block text-sm font-medium">
                {label}
                <input value={form[key] ?? ''}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="mt-1 w-full rounded-lg border p-2.5"
                  required={key === 'name'} />
              </label>
            ))}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(false)}
                className="rounded-lg border px-4 py-2">Cancel</button>
              <button disabled={saving}
                className="rounded-lg bg-green-700 px-4 py-2 text-white">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
