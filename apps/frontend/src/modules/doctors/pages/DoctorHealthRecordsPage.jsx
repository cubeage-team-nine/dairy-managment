import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, Plus, SlidersHorizontal, MoreHorizontal, MapPin, HeartPulse, Activity, CheckCircle, AlertTriangle } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import api from '../../../core/services/api'
import { DOCTOR_PROFILE } from '../../doctor-requests/doctor-requests.constants'

/* ── constants ───────────────────────────────────────────────────────────── */
const STATUSES   = ['Healthy', 'Under Treatment', 'Critical', 'Recovered', 'Follow-up Required']
const STATUS_STYLE = {
  Healthy:               'bg-green-50  text-green-700  border-green-200',
  'Under Treatment':     'bg-orange-50 text-orange-600 border-orange-200',
  Critical:              'bg-red-50    text-red-600    border-red-200',
  Recovered:             'bg-green-50  text-green-700  border-green-200',
  'Follow-up Required':  'bg-blue-50   text-blue-700   border-blue-200',
}

const blank = {
  animalTag:'', animalName:'', animalType:'Cow', breed:'', age:'', gender:'Female',
  farmerName:'', farmName:'', village:'', taluka:'', district:'',
  diagnosis:'', symptoms:'', treatment:'', medicine:'', dosage:'',
  treatmentDate: new Date().toISOString().slice(0,10),
  followUpDate:'', doctorNotes:'', status:'Under Treatment',
}

const inp = 'w-full border rounded-lg p-3 text-sm outline-none focus:border-green-700'
const Lbl = ({ label, children }) => <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">{label}{children}</label>
const Field = ({ label, value }) => (
  <div className="rounded-lg border bg-gray-50 p-3">
    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-0.5 text-sm font-semibold text-gray-700">{value || '—'}</p>
  </div>
)
const Badge = ({ label }) => (
  <span className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLE[label] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>{label}</span>
)

// Sample records — replaced by API once /doctor/health-records is implemented
const SAMPLE = [
  {
    id:'HR-R001', requestId:'HR-1002', date:'2026-10-27', followUpDate:'2026-11-10',
    animal:{ name:'Gauri', tag:'#COW-1082', type:'Cow', breed:'Jersey', age:'3 Yrs', gender:'Female' },
    farmer:{ name:'Krishna Murthy', mobile:'9823456789', farm:'Balaji Dairy', village:'Talegaon', taluka:'Maval', district:'Pune', state:'Maharashtra', pincode:'410507', address:'Plot 12, Kheda Highway, Talegaon' },
    diagnosis:'Clinical Mastitis – Left Rear Quarter', symptoms:'Swollen quarter, clotted milk, warmth on palpation.',
    treatment:'Intramammary infusion – Ceftiofur 125mg OD × 3 days', medicine:'Ceftiofur', dosage:'125mg OD',
    doctorNotes:'CMT positive +++. Milk sample sent for culture. Review in 5 days.', status:'Under Treatment',
    doctor: DOCTOR_PROFILE.name,
    history: [],
  },
  {
    id:'HR-R002', requestId:'HR-1003', date:'2026-10-26', followUpDate:'',
    animal:{ name:'Ganga', tag:'#COW-2041', type:'Cow', breed:'Gir', age:'5 Yrs', gender:'Female' },
    farmer:{ name:'Devendra Ji', mobile:'9712388452', farm:'Ganga Bovines', village:'Radhanpur', taluka:'Mehsana', district:'Mehsana', state:'Gujarat', pincode:'384240', address:'Village Radhanpur, Mehsana Dist.' },
    diagnosis:'Pregnancy Confirmed – Day 62 Post-AI', symptoms:'No clinical signs. Routine confirmation.',
    treatment:'No treatment required. Mineral supplementation advised.', medicine:'Mineral Mixture', dosage:'50g / day in feed',
    doctorNotes:'Pregnancy confirmed by rectal palpation. Expected calving ~Jul 2027.', status:'Healthy',
    doctor: DOCTOR_PROFILE.name,
    history: [],
  },
  {
    id:'HR-R003', requestId:'HR-1005', date:'2026-10-24', followUpDate:'2026-11-01',
    animal:{ name:'Meera', tag:'#COW-3105', type:'Buffalo', breed:'Murrah', age:'6 Yrs', gender:'Female' },
    farmer:{ name:'Anand Verma', mobile:'9423111223', farm:'GreenPastures Dairy', village:'Chhatral', taluka:'Kalol', district:'Gandhinagar', state:'Gujarat', pincode:'382729', address:'Chhatral GIDC Road' },
    diagnosis:'Frothy Bloat – Post-ingestion of Fermented Clover', symptoms:'Severe left paralumbar distension, respiratory distress.',
    treatment:'Trocharization + 50ml silicone antifoaming agent PO + rumen contents relief', medicine:'Simethicone', dosage:'50ml PO stat',
    doctorNotes:'Responded well to trocharization. Restrict fresh legume access for 2 weeks.', status:'Recovered',
    doctor: DOCTOR_PROFILE.name,
    history: [],
  },
  {
    id:'HR-R004', requestId:'HR-1006', date:'2026-10-23', followUpDate:'2026-10-30',
    animal:{ name:'Durga', tag:'#COW-1980', type:'Cow', breed:'Sahiwal', age:'4 Yrs', gender:'Female' },
    farmer:{ name:'Meena Devi', mobile:'9724566778', farm:'Kisan Dairy Co-op', village:'Viramgam', taluka:'Viramgam', district:'Ahmedabad', state:'Gujarat', pincode:'382150', address:'Viramgam Outskirts' },
    diagnosis:'Interdigital Dermatitis (Foot Rot)', symptoms:'Lameness right hind, foul odor, interdigital erosion.',
    treatment:'Hoof trimming, copper sulfate bandage, systemic antibiotics', medicine:'Oxytetracycline', dosage:'20mg/kg IV × 3 days',
    doctorNotes:'Bandage change every 2 days. Monitor for worsening. Zinc supplementation started.', status:'Follow-up Required',
    doctor: DOCTOR_PROFILE.name,
    history: [],
  },
  {
    id:'HR-R005', requestId:'HR-1007', date:'2026-10-22', followUpDate:'',
    animal:{ name:'Kamala', tag:'#COW-8812', type:'Cow', breed:'HF', age:'3.8 Yrs', gender:'Female' },
    farmer:{ name:'Kanti Bhai Solanki', mobile:'9824455112', farm:'Panchamrit Farms', village:'Godhra', taluka:'Godhra', district:'Panchmahal', state:'Gujarat', pincode:'389001', address:'Godhra Bypass Road' },
    diagnosis:'Sole Ulcer – Grade 2 with Digital Dermatitis', symptoms:'Chronic lameness, subsolar haemorrhage, horn separation.',
    treatment:'Orthopedic shoe fitted, topical oxytetracycline spray, corrective trim', medicine:'Oxytetracycline Spray', dosage:'Topical twice daily',
    doctorNotes:'Good prognosis with 6-week rest and orthopedic shoe.', status:'Recovered',
    doctor: DOCTOR_PROFILE.name,
    history: [],
  },
  {
    id:'HR-R006', requestId:'HR-1008', date:'2026-10-21', followUpDate:'2026-10-28',
    animal:{ name:'Saraswati', tag:'#COW-6019', type:'Buffalo', breed:'Mehsana', age:'5.5 Yrs', gender:'Female' },
    farmer:{ name:'Dinesh Chaudhary', mobile:'9879922331', farm:'Banas Cattle Care', village:'Deesa', taluka:'Deesa', district:'Banaskantha', state:'Gujarat', pincode:'385535', address:'Deesa Highway' },
    diagnosis:'Uterine Prolapse – Surgically Replaced', symptoms:'Uterus extruded post-calving, Grade 3 prolapse.',
    treatment:'Manual replacement under epidural, Buhner suture placed, systemic antibiotics + NSAIDs', medicine:'Ceftiofur + Flunixin', dosage:'Ceftiofur 2mg/kg, Flunixin 1.1mg/kg BID',
    doctorNotes:'Suture intact. Monitor for re-prolapse. Remove suture Day 7.', status:'Under Treatment',
    doctor: DOCTOR_PROFILE.name,
    history: [],
  },
]

/* ── page ────────────────────────────────────────────────────────────────── */
export default function DoctorHealthRecordsPage() {
  const [records, setRecords] = useState(SAMPLE)
  const [search, setSearch]   = useState('')
  const [fStatus, setFStatus] = useState('All')
  const [showFilter, setShowFilter] = useState(false)
  const [modal, setModal]     = useState('')   // '' | 'view' | 'add' | 'edit' | 'followup'
  const [selected, setSelected] = useState(null)
  const [form, setForm]       = useState(blank)
  const [fuForm, setFuForm]   = useState({ followUpDate:'', notes:'', status:'Under Treatment', nextCheckup:'' })
  const [menu, setMenu]       = useState(null)
  const [page, setPage]       = useState(1)
  const pageSize = 6
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  useEffect(() => {
    api.get('/doctor/health-records')
      .then(res => {
        const data = res.data?.data ?? res.data
        if (Array.isArray(data)) setRecords(data)
      })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => records.filter(r => {
    const q = search.toLowerCase()
    return (!q || `${r.animal.name} ${r.animal.tag} ${r.farmer.name} ${r.id} ${r.farmer.village} ${r.farmer.district} ${r.diagnosis}`.toLowerCase().includes(q)) &&
      (fStatus === 'All' || r.status === fStatus)
  }), [records, search, fStatus])

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const count = s => records.filter(r => r.status === s).length
  const hasF  = fStatus !== 'All' || search !== ''

  const openAdd  = () => { setForm({ ...blank, treatmentDate: new Date().toISOString().slice(0,10) }); setSelected(null); setModal('add') }
  const openEdit = r => { setSelected(r); setForm({ ...blank, ...r.animal, ...r.farmer, diagnosis:r.diagnosis, symptoms:r.symptoms, treatment:r.treatment, medicine:r.medicine, dosage:r.dosage, treatmentDate:r.date, followUpDate:r.followUpDate, doctorNotes:r.doctorNotes, status:r.status }); setModal('edit') }
  const openView = r => { setSelected(r); setModal('view') }
  const openFU   = r => { setSelected(r); setFuForm({ followUpDate:'', notes:'', status:r.status, nextCheckup:'' }); setModal('followup') }
  const close    = () => { setModal(''); setSelected(null); setMenu(null) }

  const saveRecord = useCallback(e => {
    e.preventDefault()
    const item = {
      id: selected?.id || `HR-R${Date.now()}`,
      requestId: selected?.requestId || '',
      date: form.treatmentDate,
      followUpDate: form.followUpDate,
      animal: { name:form.animalName, tag:form.animalTag, type:form.animalType, breed:form.breed, age:form.age, gender:form.gender },
      farmer: { name:form.farmerName, mobile:'', farm:form.farmName, village:form.village, taluka:form.taluka, district:form.district, state:'', pincode:'', address:'' },
      diagnosis:form.diagnosis, symptoms:form.symptoms, treatment:form.treatment,
      medicine:form.medicine, dosage:form.dosage, doctorNotes:form.doctorNotes,
      status:form.status, doctor:DOCTOR_PROFILE.name,
      history: selected?.history ?? [],
    }
    setRecords(old => modal === 'add' ? [item, ...old] : old.map(r => r.id === item.id ? item : r))
    if (modal === 'add') setPage(1)
    close()
  }, [form, selected, modal])

  const saveFollowUp = useCallback(e => {
    e.preventDefault()
    setRecords(old => old.map(r => r.id === selected.id ? {
      ...r,
      status: fuForm.status,
      followUpDate: fuForm.nextCheckup || r.followUpDate,
      history: [...(r.history ?? []), { date: new Date().toLocaleDateString('en-GB'), notes: fuForm.notes, status: fuForm.status }],
    } : r))
    close()
  }, [fuForm, selected])

  const del = r => { if (window.confirm(`Delete record ${r.id}?`)) { setRecords(old => old.filter(x => x.id !== r.id)); setMenu(null) } }

  const stats = [
    { title:'Total Records',        value:records.length,                  subtitle:'All health records',      icon:HeartPulse    },
    { title:'Under Treatment',      value:count('Under Treatment'),         subtitle:'Active cases',            icon:Activity      },
    { title:'Follow-up Required',   value:count('Follow-up Required'),      subtitle:'Needs review',            icon:AlertTriangle },
    { title:'Recovered',            value:count('Recovered') + count('Healthy'), subtitle:'Healthy animals',  icon:CheckCircle   },
  ]

  const formFields = [
    ['animalTag','text','Animal Tag',''], ['animalName','text','Animal Name',''],
    ['animalType','text','Animal Type','Cow'], ['breed','text','Breed',''],
    ['age','text','Age',''], ['gender','text','Gender','Female'],
    ['farmerName','text','Farmer Name',''], ['farmName','text','Farm Name',''],
    ['village','text','Village',''], ['taluka','text','Taluka',''],
    ['district','text','District',''], ['diagnosis','text','Diagnosis',''],
    ['symptoms','text','Symptoms',''], ['treatment','text','Treatment',''],
    ['medicine','text','Medicine',''], ['dosage','text','Dosage',''],
    ['treatmentDate','date','Treatment Date',''], ['followUpDate','date','Follow-up Date',''],
  ]

  return (
    <div className="min-h-screen bg-[#f7f8f3] p-6 text-gray-800">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage animal medical history, diagnoses, and treatment records.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16}/>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by animal, farmer, tag number..."
              className="w-64 rounded-xl border bg-white py-3 pl-9 pr-3 text-sm outline-none focus:border-green-700"/>
          </div>
          <button type="button" onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-green-800 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-900">
            <Plus size={16}/> Add Health Record
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(s => <StatCard key={s.title} {...s}/>)}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <button type="button" onClick={() => setShowFilter(v => !v)}
            className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium hover:border-green-700">
            <SlidersHorizontal size={16}/> Filters {hasF && <span className="h-2 w-2 rounded-full bg-green-700"/>}
          </button>
          {showFilter && (
            <div className="absolute left-0 top-12 z-20 w-56 space-y-3 rounded-2xl border bg-white p-4 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Health Status</p>
              <div className="flex flex-col gap-1.5">
                {['All', ...STATUSES].map(s => (
                  <button key={s} type="button" onClick={() => { setFStatus(s); setPage(1) }}
                    className={`rounded-lg px-3 py-1.5 text-left text-xs font-medium transition ${fStatus===s ? 'bg-green-700 text-white' : 'hover:bg-gray-50'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => { setFStatus('All'); setSearch(''); setPage(1); setShowFilter(false) }}
                className="w-full rounded-lg border py-2 text-xs text-gray-500 hover:bg-gray-50">Reset</button>
            </div>
          )}
        </div>
        {hasF && <button type="button" onClick={() => { setFStatus('All'); setSearch(''); setPage(1) }} className="text-xs text-gray-400 underline hover:text-gray-700">Clear filters</button>}
        <span className="ml-auto text-xs text-gray-500">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="overflow-visible rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[11px] font-medium text-gray-500">
              <tr>{['REC ID','ANIMAL','TAG','FARMER','LOCATION','DIAGNOSIS','DATE','STATUS','DOCTOR',''].map(h =>
                <th key={h} className="whitespace-nowrap px-4 py-4">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-bold text-green-800">{r.id}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-gray-800">{r.animal.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{r.animal.tag}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{r.farmer.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-1">
                      <MapPin size={11} className="mt-0.5 shrink-0 text-green-600"/>
                      <div className="text-[10px] leading-tight text-gray-600">
                        <p className="font-semibold">{r.farmer.village}</p>
                        <p>{r.farmer.taluka} · {r.farmer.district}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-xs text-gray-600">{r.diagnosis}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-3"><Badge label={r.status}/></td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.doctor}</td>
                  <td className="relative px-4 py-3">
                    <button type="button" onClick={() => setMenu(menu === r.id ? null : r.id)}
                      className="text-gray-400 hover:text-gray-700"><MoreHorizontal size={20}/></button>
                    {menu === r.id && (
                      <div className="absolute right-8 top-8 z-20 w-44 rounded-xl border bg-white p-1 shadow-lg">
                        {[['View Details', () => { openView(r); setMenu(null) },''],
                          ['Edit Record',  () => { openEdit(r); setMenu(null) },''],
                          ['Add Follow-up',() => { openFU(r);   setMenu(null) },''],
                          ['Delete',       () => del(r),'text-red-600 hover:bg-red-50']].map(([label,fn,cls]) => (
                          <button key={label} type="button" onClick={fn}
                            className={`w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-gray-50 ${cls}`}>{label}</button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <TableEmptyState message="No health records found."/>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-xs text-gray-500">
          <span>Showing {filtered.length ? (page-1)*pageSize+1 : 0} to {Math.min(page*pageSize, filtered.length)} of {filtered.length} records</span>
          <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage}/>
        </div>
      </div>

      {/* ── VIEW MODAL ────────────────────────────────────────────────── */}
      <CommonModal isOpen={modal === 'view'} onClose={close} title="Health Record Details">
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-500">{selected.id}</span>
              {selected.requestId && <span className="text-xs text-gray-400">← {selected.requestId}</span>}
              <Badge label={selected.status}/>
              <span className="ml-auto text-xs text-gray-400">{selected.date}</span>
            </div>
            <div><p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Animal Information</p>
              <div className="grid grid-cols-3 gap-2">
                {[['Name',selected.animal.name],['Tag',selected.animal.tag],['Type',selected.animal.type],['Breed',selected.animal.breed],['Age',selected.animal.age],['Gender',selected.animal.gender]].map(([l,v]) => <Field key={l} label={l} value={v}/>)}
              </div>
            </div>
            <div><p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-400"><MapPin size={11} className="text-green-600"/>Farmer & Location</p>
              <div className="grid grid-cols-3 gap-2">
                {[['Farmer',selected.farmer.name],['Farm',selected.farmer.farm],['Mobile',selected.farmer.mobile],['Village',selected.farmer.village],['Taluka',selected.farmer.taluka],['District',selected.farmer.district],['State',selected.farmer.state],['PIN',selected.farmer.pincode],['Address',selected.farmer.address]].map(([l,v]) => <Field key={l} label={l} value={v}/>)}
              </div>
            </div>
            <div><p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Medical Record</p>
              <div className="grid grid-cols-2 gap-2">
                {[['Diagnosis',selected.diagnosis],['Treatment Date',selected.date],['Medicine',selected.medicine],['Dosage',selected.dosage],['Follow-up Date',selected.followUpDate],['Doctor',selected.doctor]].map(([l,v]) => <Field key={l} label={l} value={v}/>)}
              </div>
              <div className="mt-2 rounded-lg border bg-gray-50 p-3"><p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Symptoms</p><p className="mt-1 text-sm text-gray-700">{selected.symptoms}</p></div>
              <div className="mt-2 rounded-lg border bg-gray-50 p-3"><p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Treatment Description</p><p className="mt-1 text-sm text-gray-700">{selected.treatment}</p></div>
              <div className="mt-2 rounded-lg border bg-gray-50 p-3"><p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Doctor Notes</p><p className="mt-1 text-sm text-gray-700">{selected.doctorNotes || '—'}</p></div>
            </div>
            {selected.history?.length > 0 && (
              <div><p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Follow-up History</p>
                {selected.history.map((h, i) => (
                  <div key={i} className="mb-2 rounded-lg border bg-blue-50 p-3">
                    <p className="text-[10px] font-semibold text-blue-700">{h.date} · <Badge label={h.status}/></p>
                    <p className="mt-1 text-xs text-gray-700">{h.notes}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => { close(); openFU(selected) }} className="rounded-lg border border-blue-300 px-4 py-2 text-sm text-blue-700 hover:bg-blue-50">Add Follow-up</button>
              <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Close</button>
            </div>
          </div>
        )}
      </CommonModal>

      {/* ── ADD / EDIT MODAL ──────────────────────────────────────────── */}
      <CommonModal isOpen={modal === 'add' || modal === 'edit'} onClose={close} title={modal === 'add' ? 'Add Health Record' : 'Edit Health Record'}>
        <form onSubmit={saveRecord} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {formFields.map(([name, type, label]) => (
              <Lbl key={name} label={label}>
                <input name={name} type={type} placeholder={label} value={form[name] ?? ''} onChange={set} className={inp}/>
              </Lbl>
            ))}
            <Lbl label="Doctor Notes">
              <textarea name="doctorNotes" rows={2} value={form.doctorNotes ?? ''} onChange={set} className={`${inp} resize-none`}/>
            </Lbl>
            <Lbl label="Health Status">
              <select name="status" value={form.status} onChange={set} className={inp}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Lbl>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="rounded-lg bg-green-800 px-5 py-2 text-sm font-semibold text-white hover:bg-green-900">
              {modal === 'add' ? 'Save Record' : 'Save Changes'}
            </button>
          </div>
        </form>
      </CommonModal>

      {/* ── FOLLOW-UP MODAL ───────────────────────────────────────────── */}
      <CommonModal isOpen={modal === 'followup'} onClose={close} title="Add Follow-up">
        {selected && (
          <form onSubmit={saveFollowUp} className="space-y-4">
            <div className="rounded-xl border bg-blue-50 p-3">
              <p className="text-xs font-semibold text-blue-700">{selected.id} · {selected.animal.name} ({selected.animal.tag})</p>
              <p className="mt-0.5 text-xs text-blue-600">{selected.diagnosis}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Lbl label="Follow-up Date"><input type="date" value={fuForm.followUpDate} onChange={e => setFuForm(f => ({ ...f, followUpDate:e.target.value }))} className={inp}/></Lbl>
              <Lbl label="Next Checkup Date"><input type="date" value={fuForm.nextCheckup} onChange={e => setFuForm(f => ({ ...f, nextCheckup:e.target.value }))} className={inp}/></Lbl>
              <Lbl label="Updated Health Status">
                <select value={fuForm.status} onChange={e => setFuForm(f => ({ ...f, status:e.target.value }))} className={inp}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Lbl>
            </div>
            <Lbl label="Follow-up Notes">
              <textarea required rows={3} value={fuForm.notes} onChange={e => setFuForm(f => ({ ...f, notes:e.target.value }))}
                placeholder="Describe findings, changes in condition, updated treatment..." className={`${inp} resize-none`}/>
            </Lbl>
            <div className="flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800">Save Follow-up</button>
            </div>
          </form>
        )}
      </CommonModal>
    </div>
  )
}
