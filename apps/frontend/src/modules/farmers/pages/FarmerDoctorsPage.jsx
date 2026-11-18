import { useEffect, useMemo, useState } from 'react'
import { Search, Stethoscope, Phone, Award, CheckCircle, AlertCircle } from 'lucide-react'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import StatCard from '../../../components/common/StatCard'
import {
  getApprovedDoctors,
  getMyAnimals,
  getMyHealthRequests,
  submitHealthRequest,
} from '../farmers.service'

const blank = { selection_mode: 'MANUAL', doctor_id: '', animal_id: '', priority: 'MEDIUM', request_description: '' }
const input = 'w-full rounded-lg border p-3 text-sm outline-none focus:border-green-700'
const list = (response) => response?.data?.items ?? response?.data ?? []
const errorText = (error) => error.response?.data?.detail || error.message || 'Unable to complete the request.'
const noDoctorsMessage = 'Currently, no doctors are available. Please try again later.'
const statusClass = (status) => ({
  PENDING: 'bg-orange-50 text-orange-600',
  ACCEPTED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-600',
}[status] || 'bg-gray-100 text-gray-600')

export default function FarmerDoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [animals, setAnimals] = useState([])
  const [requests, setRequests] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(blank)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [doctorResponse, animalResponse, requestResponse] = await Promise.all([
        getApprovedDoctors(),
        getMyAnimals(),
        getMyHealthRequests(),
      ])
      setDoctors(list(doctorResponse).filter((doctor) => doctor.is_available === true))
      setAnimals(list(animalResponse))
      setRequests(list(requestResponse))
    } catch (requestError) {
      setError(errorText(requestError))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const animalsById = useMemo(
    () => new Map(animals.map((animal) => [animal.id, animal])),
    [animals],
  )
  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.full_name} ${doctor.specialization ?? ''} ${doctor.qualification ?? ''}`
      .toLowerCase().includes(search.toLowerCase()))
  const pendingCount = requests.filter((request) => request.status === 'PENDING').length
  const openRequest = () => {
    setError('')
    setNotice('')
    setForm(blank)
    setModal(true)
  }
  const close = () => {
    setModal(false)
    setForm(blank)
  }
  const change = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      if (form.selection_mode === 'MANUAL') {
        const latestDoctorsResponse = await getApprovedDoctors()
        const latestDoctors = list(latestDoctorsResponse).filter((doctor) => doctor.is_available === true)
        setDoctors(latestDoctors)
        if (!latestDoctors.some((doctor) => doctor.id === form.doctor_id)) {
          setError('The selected doctor is no longer available. Please choose another doctor.')
          return
        }
      }
      await submitHealthRequest({
        selection_mode: form.selection_mode,
        doctor_id: form.selection_mode === 'MANUAL' ? form.doctor_id : null,
        animal_id: form.animal_id,
        priority: form.priority,
        request_description: form.request_description.trim(),
      })
      close()
      setNotice('Your service request was submitted.')
      await load()
    } catch (requestError) {
      setError(errorText(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f3] p-6 text-gray-800">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="mt-1 text-sm text-gray-500">View approved veterinary doctors and send animal service requests.</p>
        </div>
        <button type="button" onClick={openRequest} className="flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-900">
          <Stethoscope size={17} /> Send Health Request
        </button>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Available Doctors" value={doctors.length} subtitle="Approved and ready for requests" icon={CheckCircle} />
        <StatCard title="My Requests" value={requests.length} subtitle="Submitted service requests" icon={AlertCircle} />
        <StatCard title="Pending Requests" value={pendingCount} subtitle="Awaiting a response" icon={AlertCircle} />
      </div>
      <section className="mb-8 rounded-xl border bg-white p-4">
        <div className="mb-4 flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search doctors by name or specialization..." className="min-w-0 flex-1 border-0 text-sm outline-none" />
        </div>
        {loading ? <p className="py-6 text-sm text-gray-500">Loading available doctors…</p>
          : filteredDoctors.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <article key={doctor.id} className="rounded-xl border p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-full bg-green-50 p-3 text-green-800"><Stethoscope size={20} /></div>
                  <div><h2 className="font-semibold">{doctor.full_name}</h2><p className="text-xs text-gray-500">{doctor.specialization || 'Veterinary Doctor'}</p></div>
                </div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-green-700"><span className="h-2 w-2 rounded-full bg-green-500"/>Available</p>
                <p className="mb-2 flex items-center gap-2 text-sm text-gray-600"><Award size={15} />{doctor.qualification || 'Qualification not listed'}</p>
                {doctor.experience_years != null && <p className="mb-2 text-sm text-gray-600">{doctor.experience_years} years of experience</p>}
                {doctor.mobile_number && <p className="flex items-center gap-2 text-sm text-gray-600"><Phone size={15} />{doctor.mobile_number}</p>}
              </article>
            ))}
          </div> : <TableEmptyState message={doctors.length ? 'No doctors match your search.' : noDoctorsMessage} />}
      </section>

      <section className="rounded-xl border bg-white">
        <div className="border-b p-5"><h2 className="font-semibold">My Doctor Requests</h2></div>
        {loading ? <p className="p-5 text-sm text-gray-500">Loading requests…</p>
          : requests.length ? <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500"><tr>
                <th className="p-4">REQUESTED</th><th className="p-4">ANIMAL</th><th className="p-4">DESCRIPTION</th><th className="p-4">DOCTOR</th><th className="p-4">STATUS</th>
              </tr></thead>
              <tbody>{requests.map((request) => (
                <tr key={request.id} className="border-t">
                  <td className="p-4">{new Date(request.requested_at).toLocaleDateString()}</td>
                  <td className="p-4">{request.animal_tag ?? animalsById.get(request.animal_id)?.tag_number ?? '—'}</td>
                  <td className="max-w-sm p-4">{request.request_description || '—'}</td>
                  <td className="p-4">{request.doctor_name || (request.selection_mode === 'AUTO' ? 'Auto selection · awaiting acceptance' : 'Awaiting assignment')}{request.doctor_specialization && <p className="text-xs text-gray-500">{request.doctor_specialization}{request.doctor_experience_years != null ? ` · ${request.doctor_experience_years} yrs` : ''}</p>}</td>
                  <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${statusClass(request.status)}`}>{request.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div> : <TableEmptyState message="No doctor requests have been submitted." />}
      </section>

      <CommonModal isOpen={modal} onClose={close} title="Send Animal Health Request">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">Doctor selection</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={form.selection_mode === 'MANUAL'} onClick={() => setForm((current) => ({ ...current, selection_mode: 'MANUAL' }))} className={`rounded-lg border px-3 py-2 text-sm ${form.selection_mode === 'MANUAL' ? 'border-green-800 bg-green-50 text-green-900' : 'bg-white'}`}>Manual Selection</button>
              <button type="button" aria-pressed={form.selection_mode === 'AUTO'} onClick={() => setForm((current) => ({ ...current, selection_mode: 'AUTO', doctor_id: '' }))} className={`rounded-lg border px-3 py-2 text-sm ${form.selection_mode === 'AUTO' ? 'border-green-800 bg-green-50 text-green-900' : 'bg-white'}`}><Stethoscope size={15} className="mr-1 inline"/>Auto Select Doctor</button>
            </div>
            {form.selection_mode === 'MANUAL'
              ? <label className="block text-sm font-medium">Select Doctor
                <select required name="doctor_id" value={form.doctor_id} onChange={change} className={input}>
                  <option value="">Select an available doctor</option>
                  {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.full_name} · {doctor.specialization || 'Veterinary Doctor'}{doctor.qualification ? ` · ${doctor.qualification}` : ''}{doctor.experience_years != null ? ` · ${doctor.experience_years} yrs` : ''} · Available</option>)}
                </select>
                {!doctors.length && <p className="mt-1 text-xs text-amber-700">{noDoctorsMessage}</p>}
              </label>
              : <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Your request will be offered to available approved doctors. The first doctor to accept will be assigned.</p>}
          </div>
          <label className="block text-sm font-medium">Animal
            <select required name="animal_id" value={form.animal_id} onChange={change} className={input}>
              <option value="">Select an animal</option>
              {animals.map((animal) => <option key={animal.id} value={animal.id}>{animal.tag_number} · {animal.animal_type}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Priority
            <select name="priority" value={form.priority} onChange={change} className={input}>
              {['LOW','MEDIUM','HIGH','EMERGENCY'].map((priority) => <option key={priority}>{priority}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Request Description
            <textarea required minLength={1} maxLength={10000} name="request_description" value={form.request_description} onChange={change} rows={5} className={input} placeholder="Describe the health issue or service needed." />
          </label>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button disabled={submitting} className="rounded-lg bg-green-800 px-5 py-2 text-sm text-white disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit Request'}</button>
          </div>
        </form>
      </CommonModal>
    </div>
  )
}
