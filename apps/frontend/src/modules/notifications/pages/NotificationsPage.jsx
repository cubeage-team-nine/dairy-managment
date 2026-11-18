import { useCallback, useEffect, useState } from 'react'
import { Bell, CheckCircle2, Clock3, LoaderCircle, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../core/hooks/useAuth.js'
import RoutePath from '../../../core/constants/routes.constant.js'
import { createReminder, deleteReminder, getNotifications, updateReminder } from '../notifications.service.js'
import { getMyAnimals } from '../../farmers/farmers.service.js'
import { showInfoToast, showSuccessToast } from '../../../core/services/toastNotifications.js'

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/10'
const initialForm = { title: '', description: '', category: 'OTHER', reminder_date: '', animal_id: '' }

export default function NotificationsPage() {
  const { user } = useAuth()
  const role = user?.role
  const isFarmer = role === 'FARMER'
  const isDoctor = role === 'DOCTOR'
  const [items, setItems] = useState([])
  const [animals, setAnimals] = useState([])
  const [form, setForm] = useState(initialForm)
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getNotifications()
      setItems(response.items || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    if (isFarmer) getMyAnimals().then((response) => setAnimals(response.data?.items || [])).catch(() => setAnimals([]))
  }, [refresh, isFarmer])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true); setError(''); setNotice('')
    try {
      await createReminder({ ...form, animal_id: form.animal_id || null })
      setForm(initialForm); setNotice('Reminder saved.'); await refresh()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save this reminder.')
    } finally { setSaving(false) }
  }

  const changeReminder = async (item, changes) => {
    if (item.source !== 'FARMER_REMINDER') return
    setError('')
    try {
      await updateReminder(item.id, changes)
      if (Object.hasOwn(changes, 'is_read')) showInfoToast(changes.is_read ? 'Reminder marked as read.' : 'Reminder marked as unread.')
      if (Object.hasOwn(changes, 'status')) showSuccessToast(changes.status === 'COMPLETED' ? 'Reminder completed.' : 'Reminder reopened.')
      await refresh()
    } catch (err) { setError(err.response?.data?.detail || 'Could not update the reminder.') }
  }

  const remove = async (item) => {
    setError('')
    try { await deleteReminder(item.id); await refresh() }
    catch (err) { setError(err.response?.data?.detail || 'Could not delete the reminder.') }
  }

  const visible = items.filter((item) => filter === 'ALL' || item.status === filter)
  const title = isFarmer ? 'Notifications & Reminders' : isDoctor ? 'Treatment Follow-up Reminders' : 'System Notifications'

  return <div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-sm font-medium text-green-800">GauVikas</p><h1 className="text-2xl font-bold text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-500">Saved reminders and dates already recorded in farm workflows.</p></div>
      <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-green-800"><Bell size={18}/><span className="text-sm font-semibold">{items.filter((item) => item.status === 'PENDING').length} pending</span></div>
    </header>

    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

    {isFarmer && <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Create a reminder</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium text-slate-700">Title<input required maxLength={150} className={`${inputClass} mt-1`} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/></label>
        <label className="text-sm font-medium text-slate-700">Date<input required type="date" className={`${inputClass} mt-1`} value={form.reminder_date} onChange={(e) => setForm({ ...form, reminder_date: e.target.value })}/></label>
        <label className="text-sm font-medium text-slate-700">Type<select className={`${inputClass} mt-1`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{['OTHER','PREGNANCY_CONFIRMATION','EXPECTED_CALVING','CALVING_UPDATE','TREATMENT_FOLLOW_UP','MASTITIS_FOLLOW_UP','DMI_MISMATCH'].map((x) => <option key={x} value={x}>{x.replaceAll('_',' ').toLowerCase().replace(/^./, c => c.toUpperCase())}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-1">Animal (optional)<select className={`${inputClass} mt-1`} value={form.animal_id} onChange={(e) => setForm({ ...form, animal_id: e.target.value })}><option value="">Farm-wide reminder</option>{animals.map((animal) => <option key={animal.id} value={animal.id}>{animal.tag_number} · {animal.animal_type}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-4">Description<textarea rows={2} className={`${inputClass} mt-1`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label>
      </div>
      <div className="mt-4 flex justify-end"><button disabled={saving} className="rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Add Reminder'}</button></div>
    </form>}

    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4"><div><h2 className="font-semibold text-slate-900">{isDoctor ? 'Follow-up schedule' : 'Notifications'}</h2><p className="text-xs text-slate-500">Workflow records are read from the related animal and treatment data.</p></div><select aria-label="Filter by status" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="COMPLETED">Completed</option></select></div>
      {loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={18}/>Loading notifications…</div>
        : visible.length === 0 ? <div className="p-12 text-center"><Clock3 className="mx-auto mb-2 text-slate-300"/><p className="font-medium text-slate-700">No {filter === 'ALL' ? '' : filter.toLowerCase()} notifications</p><p className="mt-1 text-sm text-slate-500">New reminders will appear here when saved.</p></div>
          : <ul className="divide-y divide-slate-100">{visible.map((item) => <li key={`${item.source}-${item.id}`} className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
            <div className="flex min-w-0 flex-1 gap-3"><span className={`mt-1 rounded-full p-2 ${item.status === 'COMPLETED' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700'}`}>{item.status === 'COMPLETED' ? <CheckCircle2 size={17}/> : <Bell size={17}/>}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{item.title}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{item.status}</span><span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] text-green-800">{String(item.category || '').replaceAll('_',' ')}</span></div>
              {item.description && <p className="mt-1 text-sm text-slate-600">{item.description}</p>}
              <p className="mt-2 text-sm text-slate-500">{item.reminder_date} {item.animal_tag ? `· Animal ${item.animal_tag}` : ''} {item.farm_name ? `· ${item.farm_name}` : ''}</p>
              {(item.farmer_name || item.doctor_name) && <p className="mt-1 text-xs text-slate-500">{item.farmer_name ? `Farmer: ${item.farmer_name}` : ''}{item.doctor_name ? ` · Doctor: ${item.doctor_name}` : ''}</p>}
            </div></div>
            <div className="flex shrink-0 items-center gap-2">{isFarmer && item.source === 'FARMER_REMINDER' && <><button type="button" onClick={() => changeReminder(item, { is_read: !item.is_read })} className="rounded-lg border px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">{item.is_read ? 'Read' : 'Mark read'}</button><button type="button" onClick={() => changeReminder(item, { status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' })} className="rounded-lg border px-3 py-2 text-xs font-medium text-green-800 hover:bg-green-50">{item.status === 'COMPLETED' ? 'Reopen' : 'Complete'}</button><button type="button" title="Delete reminder" onClick={() => remove(item)} className="rounded-lg border p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"><Trash2 size={15}/></button></>}{isDoctor && <Link to={RoutePath.DOCTOR_HEALTH_RECORDS} className="rounded-lg border border-green-800 px-3 py-2 text-xs font-semibold text-green-800 hover:bg-green-50">Update follow-up</Link>}</div>
          </li>)}</ul>}
    </section>
  </div>
}
