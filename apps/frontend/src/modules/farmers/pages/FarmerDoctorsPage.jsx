import { useEffect, useMemo, useState } from 'react'
import { Search, Stethoscope, MapPin, Phone, Award, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import StatCard from '../../../components/common/StatCard'
import { getApprovedDoctors, getMyAnimals, submitHealthRequest, autoAssignDoctor } from '../farmers.service'

/* ── sample doctors — replaced by API once /farmer/doctors is ready ──────── */
const SAMPLE_DOCTORS = [
  { id:1, name:'Dr. Arjun Sharma',  qualification:'BVSc & AH',  specialization:'Bovine Medicine',  experience:8,  location:'Pune, MH',     mobile:'9876543210', status:'Available', consultationType:'On-site',  regNo:'MH-VET-1042', image:'' },
  { id:2, name:'Dr. Priya Desai',   qualification:'MVSc',        specialization:'Dairy Nutrition',  experience:5,  location:'Anand, GJ',    mobile:'9123456780', status:'Busy',      consultationType:'On-site',  regNo:'GJ-VET-0387', image:'' },
  { id:3, name:'Dr. Kiran Patil',   qualification:'BVSc & AH',  specialization:'Reproduction',     experience:3,  location:'Bengaluru, KA',mobile:'',           status:'Available', consultationType:'On-site',  regNo:'KA-VET-2210', image:'' },
  { id:4, name:'Dr. Neha Joshi',    qualification:'PhD Vet Sci', specialization:'Pathology',        experience:12, location:'Jaipur, RJ',   mobile:'9988776655', status:'Off Duty',  consultationType:'On-site',  regNo:'RJ-VET-0091', image:'' },
  { id:5, name:'Dr. Suresh Nair',   qualification:'MVSc',        specialization:'Surgery',          experience:7,  location:'Chennai, TN',  mobile:'9871122334', status:'Available', consultationType:'On-site',  regNo:'TN-VET-0556', image:'' },
]

const SAMPLE_ANIMALS = [
  { id:1, tag:'#COW-4094', name:'Lakshmi', breed:'HF',      age:'4 Yrs' },
  { id:2, tag:'#COW-4022', name:'Gauri',   breed:'Jersey',  age:'3 Yrs' },
  { id:3, tag:'#COW-4105', name:'Radha',   breed:'Gir',     age:'5 Yrs' },
  { id:4, tag:'#COW-3980', name:'Kamala',  breed:'Sahiwal', age:'6 Yrs' },
]

const SEVERITIES   = ['Normal','Moderate','High','Emergency']
const SPECIALIZATIONS = ['All','Bovine Medicine','Dairy Nutrition','Reproduction','Surgery','Pathology','Other']
const blankForm = { animalId:'', problem:'', symptoms:'', severity:'Normal', duration:'', notes:'', problemDate:'', assignType:'auto', doctorId:'' }
const inp = 'w-full rounded-lg border p-3 text-sm outline-none focus:border-green-700'

const statusCls = s =>
  s === 'Available' ? 'bg-green-50 text-green-700 border-green-200'
  : s === 'Busy'    ? 'bg-orange-50 text-orange-600 border-orange-200'
  :                   'bg-gray-100 text-gray-500 border-gray-200'

const reqStatusCls = s =>
  s === 'Pending'     ? 'bg-orange-50 text-orange-600' :
  s === 'Accepted'    ? 'bg-blue-50 text-blue-700'     :
  s === 'In Progress' ? 'bg-purple-50 text-purple-700' :
  s === 'Completed'   ? 'bg-green-50 text-green-700'   :
  s === 'Rejected'    ? 'bg-red-50 text-red-600'        : 'bg-gray-50 text-gray-500'

export default function FarmerDoctorsPage() {
  const [doctors, setDoctors]     = useState(SAMPLE_DOCTORS)
  const [animals, setAnimals]     = useState(SAMPLE_ANIMALS)
  const [requests, setRequests]   = useState([])
  const [search, setSearch]       = useState('')
  const [fSpec, setFSpec]         = useState('All')
  const [fAvail, setFAvail]       = useState('All')
  const [modal, setModal]         = useState('')   // '' | 'request' | 'success' | 'view'
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [viewReq, setViewReq]     = useState(null)
  const [form, setForm]           = useState(blankForm)
  const [submitting, setSubmitting] = useState(false)
  const [lastReqId, setLastReqId]   = useState('')
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const selAnimal = animals.find(a => a.id === Number(form.animalId))

  useEffect(() => {
    getApprovedDoctors()
      .then(res => { const d = res.data?.data ?? res.data; if (Array.isArray(d) && d.length) setDoctors(d) })
      .catch(() => {})
    getMyAnimals()
      .then(res => { const d = res.data?.data ?? res.data; if (Array.isArray(d) && d.length) setAnimals(d) })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => doctors.filter(d => {
    const q = search.toLowerCase()
    return (!q || `${d.name} ${d.specialization} ${d.location}`.toLowerCase().includes(q)) &&
      (fSpec  === 'All' || d.specialization === fSpec) &&
      (fAvail === 'All' || d.status === fAvail)
  }), [doctors, search, fSpec, fAvail])

  const openRequest = (doc = null) => {
    setSelectedDoc(doc)
    setForm({ ...blankForm, assignType: doc ? 'specific' : 'auto', doctorId: doc ? String(doc.id) : '' })
    setModal('request')
  }
  const close = () => { setModal(''); setSelectedDoc(null); setForm(blankForm); setViewReq(null) }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.animalId || !form.problem.trim() || !form.symptoms.trim()) return
    setSubmitting(true)
    const payload = {
      animalId:     Number(form.animalId),
      animalTag:    selAnimal?.tag   ?? '',
      animalName:   selAnimal?.name  ?? '',
      breed:        selAnimal?.breed ?? '',
      age:          selAnimal?.age   ?? '',
      problem:      form.problem,
      symptoms:     form.symptoms,
      severity:     form.severity,
      duration:     form.duration,
      problemDate:  form.problemDate,
      notes:        form.notes,
      assignType:   form.assignType,
      doctorId:     form.assignType === 'specific' ? Number(form.doctorId) : null,
    }
    try {
      const fn  = form.assignType === 'auto' ? autoAssignDoctor : submitHealthRequest
      const res = await fn(payload)
      const reqId = res.data?.requestId ?? res.data?.id ?? `REQ-${Date.now()}`
      const newReq = {
        id: reqId, animalName: selAnimal?.name, animalTag: selAnimal?.tag,
        problem: form.problem, severity: form.severity,
        doctor: form.assignType === 'specific' ? doctors.find(d => d.id === Number(form.doctorId))?.name ?? 'Assigned' : 'Auto-assigned',
        date: new Date().toLocaleDateString('en-GB'), status: 'Pending',
      }
      setRequests(old => [newReq, ...old])
      setLastReqId(reqId)
      setModal('success')
    } catch {
      // Backend not ready — simulate locally
      const reqId = `REQ-${Date.now()}`
      const newReq = {
        id: reqId, animalName: selAnimal?.name, animalTag: selAnimal?.tag,
        problem: form.problem, severity: form.severity,
        doctor: form.assignType === 'specific' ? doctors.find(d => d.id === Number(form.doctorId))?.name ?? 'Pending assignment' : 'Auto-assigned',
        date: new Date().toLocaleDateString('en-GB'), status: 'Pending',
      }
      setRequests(old => [newReq, ...old])
      setLastReqId(reqId)
      setModal('success')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f3] p-6 text-gray-800">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="mt-1 text-sm text-gray-500">View approved veterinary doctors and send animal health requests.</p>
        </div>
        <button type="button" onClick={() => openRequest(null)}
          className="flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-900">
          <Stethoscope size={17}/> Send Health Request
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Available Doctors"  value={doctors.filter(d=>d.status==='Available').length}  subtitle="Ready for consultation" icon={CheckCircle}/>
        <StatCard title="My Requests"        value={requests.length}                                   subtitle="Health requests sent"   icon={AlertCircle}/>
        <StatCard title="Pending Review"     value={requests.filter(r=>r.status==='Pending').length}   subtitle="Awaiting doctor response" icon={Clock}/>
      </div>

      {/* Search + Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 text-gray-400" size={17}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, specialization, location..."
            className="w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700"/>
        </div>
        <select value={fSpec} onChange={e => setFSpec(e.target.value)} className="rounded-xl border bg-white px-4 py-3 text-sm">
          {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={fAvail} onChange={e => setFAvail(e.target.value)} className="rounded-xl border bg-white px-4 py-3 text-sm">
          <option value="All">Availability: All</option>
          {['Available','Busy','Off Duty'].map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-500">{filtered.length} doctors</span>
      </div>

      {/* Doctor Cards */}
      {filtered.length ? (
        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(d => (
            <div key={d.id} className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-800">
                  {d.name.split(' ').map(w=>w[0]).slice(1,3).join('')}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.qualification}</p>
                  <span className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusCls(d.status)}`}>{d.status}</span>
                </div>
              </div>
              <div className="flex-1 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2"><Stethoscope size={13} className="shrink-0 text-green-600"/><span>{d.specialization}</span></div>
                <div className="flex items-center gap-2"><Award size={13} className="shrink-0 text-green-600"/><span>{d.experience} years experience</span></div>
                <div className="flex items-center gap-2"><MapPin size={13} className="shrink-0 text-green-600"/><span>{d.location}</span></div>
                {d.mobile && <div className="flex items-center gap-2"><Phone size={13} className="shrink-0 text-green-600"/><span>{d.mobile}</span></div>}
                <div className="flex items-center gap-2"><Clock size={13} className="shrink-0 text-green-600"/><span>{d.consultationType}</span></div>
              </div>
              <button type="button" onClick={() => openRequest(d)} disabled={d.status === 'Off Duty'}
                className="mt-4 w-full rounded-xl bg-green-800 py-2.5 text-xs font-semibold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-40">
                Request Doctor
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-8"><TableEmptyState message="No doctors found matching your search."/></div>
      )}

      {/* My Health Requests */}
      {requests.length > 0 && (
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4"><h2 className="text-base font-bold text-gray-800">My Health Requests</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[11px] font-medium text-gray-500">
                <tr>{['REQ ID','ANIMAL','PROBLEM','DOCTOR','DATE','PRIORITY','STATUS',''].map(h=><th key={h} className="whitespace-nowrap px-5 py-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} className="border-t transition-colors hover:bg-gray-50">
                    <td className="px-5 py-3 text-xs font-bold text-green-800">{r.id}</td>
                    <td className="px-5 py-3">
                      <p className="text-xs font-semibold text-gray-800">{r.animalName}</p>
                      <p className="text-[10px] text-gray-400">{r.animalTag}</p>
                    </td>
                    <td className="max-w-[140px] truncate px-5 py-3 text-xs text-gray-600">{r.problem}</td>
                    <td className="px-5 py-3 text-xs text-gray-600">{r.doctor}</td>
                    <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{r.date}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${r.severity==='Emergency'?'bg-red-50 text-red-600':r.severity==='High'?'bg-orange-50 text-orange-600':'bg-gray-100 text-gray-500'}`}>{r.severity}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${reqStatusCls(r.status)}`}>{r.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => { setViewReq(r); setModal('view') }}
                        className="rounded-lg border px-3 py-1.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-50">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── HEALTH REQUEST FORM MODAL ──────────────────────────────────── */}
      <CommonModal isOpen={modal === 'request'} onClose={close} title={selectedDoc ? `Request: ${selectedDoc.name}` : 'Send Health Request'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* A. Animal Details */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">A. Animal Details</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 text-xs font-medium text-gray-600">Select Animal *
                <select name="animalId" required value={form.animalId} onChange={set} className={`mt-1 ${inp}`}>
                  <option value="">Choose your animal</option>
                  {animals.map(a => <option key={a.id} value={a.id}>{a.name} – {a.tag}</option>)}
                </select>
              </label>
              {selAnimal && <>
                <div className="rounded-lg border bg-gray-50 p-2.5 text-xs"><span className="text-gray-400">Tag:</span> <b>{selAnimal.tag}</b></div>
                <div className="rounded-lg border bg-gray-50 p-2.5 text-xs"><span className="text-gray-400">Breed:</span> <b>{selAnimal.breed}</b></div>
              </>}
            </div>
          </div>

          {/* B. Health Problem */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">B. Health Problem Details</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2 text-xs font-medium text-gray-600">Health Problem / Condition *
                <input name="problem" required value={form.problem} onChange={set} placeholder="e.g. Fever, Mastitis, Limping" className={`mt-1 ${inp}`}/>
              </label>
              <label className="col-span-2 text-xs font-medium text-gray-600">Symptoms *
                <textarea name="symptoms" required rows={3} value={form.symptoms} onChange={set}
                  placeholder="Describe all visible symptoms in detail..."
                  className={`mt-1 ${inp} resize-none`}/>
              </label>
              <label className="text-xs font-medium text-gray-600">Severity *
                <select name="severity" value={form.severity} onChange={set} className={`mt-1 ${inp}`}>
                  {SEVERITIES.map(s=><option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-gray-600">Duration (e.g. 2 days)
                <input name="duration" value={form.duration} onChange={set} placeholder="How long has animal been sick?" className={`mt-1 ${inp}`}/>
              </label>
              <label className="text-xs font-medium text-gray-600">Problem Started Date
                <input name="problemDate" type="date" value={form.problemDate} onChange={set} className={`mt-1 ${inp}`}/>
              </label>
              <label className="text-xs font-medium text-gray-600">Additional Notes
                <input name="notes" value={form.notes} onChange={set} placeholder="Any other information..." className={`mt-1 ${inp}`}/>
              </label>
            </div>
          </div>

          {/* C. Doctor Assignment */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">C. Doctor Assignment</p>
            <div className="space-y-3">
              {/* Option 1 */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition hover:border-green-600 has-[:checked]:border-green-700 has-[:checked]:bg-green-50">
                <input type="radio" name="assignType" value="auto"
                  checked={form.assignType === 'auto'}
                  onChange={set} className="mt-0.5 accent-green-700"/>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Auto Assign Doctor</p>
                  <p className="mt-0.5 text-xs text-gray-500">System automatically finds the most suitable available doctor based on specialization and location.</p>
                </div>
              </label>
              {/* Option 2 */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition hover:border-green-600 has-[:checked]:border-green-700 has-[:checked]:bg-green-50">
                <input type="radio" name="assignType" value="specific"
                  checked={form.assignType === 'specific'}
                  onChange={set} className="mt-0.5 accent-green-700"/>
                <div className="w-full">
                  <p className="text-sm font-semibold text-gray-800">Choose Specific Doctor</p>
                  <p className="mt-0.5 text-xs text-gray-500">Select a doctor from the list of available approved doctors.</p>
                  {form.assignType === 'specific' && (
                    <select name="doctorId" required={form.assignType==='specific'} value={form.doctorId} onChange={set}
                      className={`mt-3 ${inp}`}>
                      <option value="">Select a doctor</option>
                      {doctors.filter(d => d.status !== 'Off Duty').map(d => (
                        <option key={d.id} value={d.id}>{d.name} – {d.specialization} ({d.status})</option>
                      ))}
                    </select>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={submitting}
              className="rounded-lg bg-green-800 px-5 py-2 text-sm font-semibold text-white hover:bg-green-900 disabled:opacity-50">
              {submitting ? 'Sending...' : 'Send Health Request'}
            </button>
          </div>
        </form>
      </CommonModal>

      {/* ── SUCCESS MODAL ──────────────────────────────────────────────── */}
      <CommonModal isOpen={modal === 'success'} onClose={close} title="Request Submitted">
        <div className="space-y-4 text-center">
          <div className="flex justify-center"><CheckCircle size={48} className="text-green-600"/></div>
          <h2 className="text-lg font-bold text-gray-800">Health Request Sent Successfully</h2>
          <p className="text-sm text-gray-600">Your health request has been submitted. Your assigned doctor will review and respond shortly.</p>
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-xs text-green-600">Request ID</p>
            <p className="text-base font-bold text-green-800">{lastReqId}</p>
          </div>
          <p className="text-xs text-gray-400">You can track the status in the "My Health Requests" section below.</p>
          <button type="button" onClick={close} className="mt-2 w-full rounded-xl bg-green-800 py-3 text-sm font-semibold text-white hover:bg-green-900">Done</button>
        </div>
      </CommonModal>

      {/* ── VIEW REQUEST DETAIL MODAL ──────────────────────────────────── */}
      <CommonModal isOpen={modal === 'view'} onClose={close} title="Request Details">
        {viewReq && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-500">{viewReq.id}</span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${reqStatusCls(viewReq.status)}`}>{viewReq.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Animal',viewReq.animalName],['Tag',viewReq.animalTag],['Health Problem',viewReq.problem],['Severity',viewReq.severity],['Assigned Doctor',viewReq.doctor],['Request Date',viewReq.date]].map(([label,value]) => (
                <div key={label} className="rounded-lg border bg-gray-50 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-700">{value || '—'}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end border-t pt-4">
              <button type="button" onClick={close} className="rounded-lg border px-5 py-2 text-sm">Close</button>
            </div>
          </div>
        )}
      </CommonModal>
    </div>
  )
}
