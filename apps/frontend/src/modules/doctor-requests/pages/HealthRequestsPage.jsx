import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, RefreshCw, CheckCircle, Clock, Stethoscope, XCircle, ClipboardList } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import { acceptRequest, rejectRequest, completeRequest, fetchHealthRequests } from '../doctor-requests.service'

const pageSize = 10
const statusColor = {
  PENDING: 'bg-amber-50 text-amber-700', ACCEPTED: 'bg-blue-50 text-blue-700',
  REJECTED: 'bg-red-50 text-red-700', COMPLETED: 'bg-green-50 text-green-700',
}
const dateText = (value) => value ? new Date(value).toLocaleString() : '—'

export default function HealthRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [completion, setCompletion] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await fetchHealthRequests()
      setRequests(data.items ?? [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load farmer requests assigned to your account.')
    } finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => requests.filter((request) => {
    const text = [request.id, request.farmer_name, request.farmer_contact, request.farm_name, request.animal_name, request.animal_tag,
      request.animal_type, request.breed, request.village, request.request_description].join(' ').toLowerCase()
    const requestedDate = request.requested_at?.slice(0, 10) || ''
    return (status === 'All' || request.status === status) && text.includes(search.toLowerCase()) &&
      (!fromDate || requestedDate >= fromDate) && (!toDate || requestedDate <= toDate)
  }), [requests, search, status, fromDate, toDate])
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const count = (value) => requests.filter((request) => request.status === value).length

  const act = async (request, action) => {
    setBusyId(request.id); setError(''); setNotice('')
    try {
      const response = action === 'accept' ? await acceptRequest(request.id)
        : action === 'reject' ? await rejectRequest(request.id)
          : await completeRequest(request.id, completion.trim())
      setRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: response.data.status } : item))
      setSelected(null); setCompletion('')
      setNotice(`Request ${action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'completed'}.`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to update this request.')
    } finally { setBusyId('') }
  }

  return <div className="space-y-6 p-5 text-slate-800 md:p-7">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-2xl font-bold">Health Requests</h1><p className="mt-1 text-sm text-slate-500">Farmer requests assigned to your doctor account.</p></div>
      <button type="button" onClick={load} disabled={loading} className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm"><RefreshCw size={15} className={loading ? 'animate-spin' : ''}/> Refresh</button>
    </header>
    {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700"><p>{error}</p>{!loading && <button type="button" onClick={load} className="mt-2 font-semibold underline">Try again</button>}</div>}
    {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard title="Total Requests" value={requests.length} subtitle="Assigned requests" icon={ClipboardList}/>
      <StatCard title="Pending" value={count('PENDING')} subtitle="Awaiting review" icon={Clock}/>
      <StatCard title="Accepted" value={count('ACCEPTED')} subtitle="In progress" icon={Stethoscope}/>
      <StatCard title="Rejected" value={count('REJECTED')} subtitle="Declined requests" icon={XCircle}/>
      <StatCard title="Completed" value={count('COMPLETED')} subtitle="Resolved" icon={CheckCircle}/>
      <StatCard title="Emergency" value={requests.filter((request) => request.priority === 'EMERGENCY' && request.status === 'PENDING').length} subtitle="Urgent pending" icon={XCircle}/>
    </div>
    <section className="overflow-hidden rounded-xl border bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b p-4">
        <div className="relative"><Search size={15} className="absolute left-3 top-2.5 text-slate-400"/><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search request, animal, farmer..." className="w-72 rounded-lg border py-2 pl-9 pr-3 text-sm"/></div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="rounded-lg border p-2 text-sm"><option>All</option>{['PENDING','ACCEPTED','REJECTED','COMPLETED'].map((value) => <option key={value}>{value}</option>)}</select>
        <label className="text-xs text-slate-500">From <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1) }} className="ml-1 rounded border p-2"/></label>
        <label className="text-xs text-slate-500">To <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1) }} className="ml-1 rounded border p-2"/></label>
      </div>
      {loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"><RefreshCw size={16} className="animate-spin"/> Loading farmer requests...</div>
        : rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500"><tr>{['REQUEST','FARMER','FARM','ANIMAL','VILLAGE','PRIORITY','REQUEST DATE','STATUS','ACTIONS'].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead>
          <tbody className="divide-y">{rows.map((request) => <tr key={request.id}>
            <td className="px-4 py-3"><button type="button" onClick={() => setSelected(request)} className="font-medium text-green-800 hover:underline">{String(request.id).slice(0, 8)}</button><p className="max-w-52 truncate text-xs text-slate-500">{request.request_description}</p></td>
            <td className="px-4 py-3">{request.farmer_name}<p className="text-xs text-slate-500">{request.farmer_contact}</p></td>
            <td className="px-4 py-3">{request.farm_name || '—'}</td>
            <td className="px-4 py-3">{request.animal_name}<p className="text-xs text-slate-500">{request.animal_type} · {request.breed || 'Breed not listed'}{request.animal_gender ? ` · ${request.animal_gender}` : ''}</p></td>
            <td className="px-4 py-3">{request.village || '—'}</td><td className="px-4 py-3">{request.priority || 'MEDIUM'}</td><td className="px-4 py-3">{dateText(request.requested_at)}</td>
            <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs ${statusColor[request.status] || 'bg-slate-100 text-slate-600'}`}>{request.status}</span></td>
            <td className="px-4 py-3"><div className="flex gap-2"><button type="button" onClick={() => setSelected(request)} className="text-xs text-slate-600 underline">Details</button>
              {request.status === 'PENDING' && <><button type="button" disabled={busyId === request.id} onClick={() => act(request, 'accept')} className="text-xs font-semibold text-green-700 disabled:opacity-50">Accept</button><button type="button" disabled={busyId === request.id} onClick={() => act(request, 'reject')} className="text-xs font-semibold text-red-600 disabled:opacity-50">Reject</button></>}
              {request.status === 'ACCEPTED' && <button type="button" onClick={() => { setSelected(request); setCompletion('') }} className="text-xs font-semibold text-blue-700">Complete</button>}
            </div></td>
          </tr>)}</tbody>
        </table></div> : <TableEmptyState message={search || status !== 'All' ? 'No matching requests.' : 'No farmer requests have been sent to your account yet.'}/>}
      {!loading && <div className="border-t p-4"><TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage}/></div>}
    </section>
    <CommonModal isOpen={Boolean(selected)} onClose={() => { setSelected(null); setCompletion('') }} title="Health Request Details">
      {selected && <div className="space-y-3 text-sm"><div><p className="text-xs uppercase text-slate-400">Request</p><p>{selected.id} · {dateText(selected.requested_at)}</p></div><div><p className="text-xs uppercase text-slate-400">Farmer</p><p>{selected.farmer_name} · {selected.farmer_contact || 'No phone listed'}</p></div><div><p className="text-xs uppercase text-slate-400">Farm</p><p>{selected.farm_name || '—'} · {selected.village || '—'}</p></div><div><p className="text-xs uppercase text-slate-400">Animal</p><p>{selected.animal_name} ({selected.animal_tag}) · {selected.animal_type} · {selected.breed || 'Breed not listed'}{selected.animal_gender ? ` · ${selected.animal_gender}` : ''}</p></div><div><p className="text-xs uppercase text-slate-400">Issue / symptoms reported</p><p className="whitespace-pre-wrap">{selected.request_description || '—'}</p></div>
        {selected.status === 'ACCEPTED' && <div><label className="text-xs font-medium">Treatment notes to save on completion<textarea value={completion} onChange={(e) => setCompletion(e.target.value)} rows={3} className="mt-1 w-full rounded border p-2"/></label><button type="button" disabled={!completion.trim() || busyId === selected.id} onClick={() => act(selected, 'complete')} className="mt-2 rounded-lg bg-green-800 px-4 py-2 text-xs text-white disabled:opacity-50">Save treatment and complete</button></div>}
      </div>}
    </CommonModal>
  </div>
}
