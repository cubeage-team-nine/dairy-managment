import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, LoaderCircle, Plus, Wheat } from 'lucide-react'
import CommonModal from '../../../components/modals/CommonModal.jsx'
import TableActions from '../../../components/tables/TableActions.jsx'
import TableEmptyState from '../../../components/tables/TableEmptyState.jsx'
import {
  createFeedType,
  deleteFeedType,
  getAdminFeedTypes,
  updateFeedType,
} from '../feed.service.js'

const blankForm = { name: '', unit: 'kg', description: '' }
const inputClass = 'w-full rounded-lg border p-3 text-sm outline-none focus:border-green-700'

export default function AdminFeedTypesPage() {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modal, setModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(blankForm)

  const loadTypes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getAdminFeedTypes()
      setTypes(response.data.items)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load feed types.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTypes()
  }, [loadTypes])

  const openAdd = () => {
    setSelected(null)
    setForm(blankForm)
    setError('')
    setModal(true)
  }

  const openEdit = (feedType) => {
    setSelected(feedType)
    setForm({
      name: feedType.name,
      unit: feedType.unit,
      description: feedType.description || '',
    })
    setError('')
    setModal(true)
  }

  const closeModal = () => {
    setModal(false)
    setSelected(null)
    setForm(blankForm)
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    const payload = {
      name: form.name.trim(),
      unit: form.unit.trim(),
      description: form.description.trim() || null,
    }
    try {
      if (selected) {
        await updateFeedType(selected.id, payload)
        setSuccess('Feed type updated.')
      } else {
        await createFeedType(payload)
        setSuccess('Feed type created.')
      }
      closeModal()
      await loadTypes()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to save this feed type.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (feedType) => {
    if (!window.confirm(`Delete "${feedType.name}"? Types already used by feed records cannot be deleted.`)) return
    setError('')
    setSuccess('')
    try {
      await deleteFeedType(feedType.id)
      setSuccess('Feed type deleted.')
      await loadTypes()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to delete this feed type.')
    }
  }

  return (
    <main className="min-h-screen space-y-6 bg-[#f7f8f3] p-8 text-gray-800">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Feed Type Management</h1>
          <p className="mt-2 text-sm text-gray-500">Manage the feed types available for farmer feed entries.</p>
        </div>
        <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-900">
          <Plus size={18} /> Add Feed Type
        </button>
      </header>

      {error && !modal && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} /> {error}
          <button type="button" onClick={loadTypes} className="ml-auto font-semibold underline">Retry</button>
        </div>
      )}
      {success && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{success}</p>}

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-gray-500"><LoaderCircle className="animate-spin" size={18} /> Loading feed types...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[11px] text-gray-500">
                  <tr>{['FEED TYPE', 'UNIT', 'DESCRIPTION', 'ACTIONS'].map((heading) => <th key={heading} className="px-5 py-4 font-medium">{heading}</th>)}</tr>
                </thead>
                <tbody>
                  {types.map((feedType) => (
                    <tr key={feedType.id} className="border-t hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm font-semibold"><span className="flex items-center gap-2"><Wheat size={16} className="text-green-700" />{feedType.name}</span></td>
                      <td className="px-5 py-4 text-sm text-gray-600">{feedType.unit}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{feedType.description || '—'}</td>
                      <td className="px-5 py-4"><TableActions onEdit={() => openEdit(feedType)} onDelete={() => remove(feedType)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!types.length && <TableEmptyState message="No feed types configured. Add a feed type to enable farmer feed entries." />}
          </>
        )}
      </section>

      <CommonModal isOpen={modal} onClose={closeModal} title={selected ? 'Edit Feed Type' : 'Add Feed Type'}>
        <form onSubmit={save} className="space-y-4">
          <label className="block text-xs font-medium text-gray-600">Feed Type Name
            <input autoFocus required maxLength={100} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-xs font-medium text-gray-600">Unit
            <input required maxLength={20} value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} className={`${inputClass} mt-1`} placeholder="e.g. kg" />
          </label>
          <label className="block text-xs font-medium text-gray-600">Description (optional)
            <textarea maxLength={2000} rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className={`${inputClass} mt-1`} />
          </label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={closeModal} disabled={saving} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-green-800 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? 'Saving...' : selected ? 'Save Changes' : 'Save Feed Type'}
            </button>
          </div>
        </form>
      </CommonModal>
    </main>
  )
}
