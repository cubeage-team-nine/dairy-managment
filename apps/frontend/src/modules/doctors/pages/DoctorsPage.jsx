import { useMemo, useState } from 'react'
import { Search, Plus, SlidersHorizontal, MoreHorizontal, Stethoscope, UserCheck, UserX, Clock, CheckCircle, XCircle } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'

/* ─── constants ─────────────────────────────────────────────────────────── */
const blank = { firstName: '', lastName: '', qualification: '', specialization: '', regNumber: '', experience: '', email: '', phone: '' }
const inp   = 'w-full border rounded-lg p-3 text-sm outline-none focus:border-green-700'
const specializations = ['Bovine Medicine', 'Dairy Nutrition', 'Reproduction', 'Surgery', 'Pathology', 'Other']

// Status badge colours — covers all 4 statuses
const BADGE = {
  Active:   'bg-green-50  text-green-700  border-green-200',
  Pending:  'bg-orange-50 text-orange-600 border-orange-200',
  Rejected: 'bg-red-50    text-red-600    border-red-200',
  Inactive: 'bg-gray-100  text-gray-500   border-gray-200',
}

// Small reusable badge — used in table, view modal, and pending cards
const StatusBadge = ({ status }) => (
  <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-semibold ${BADGE[status] ?? BADGE.Inactive}`}>
    {status}
  </span>
)

// Pending request card — approve / reject workflow
const PendingRequestCard = ({ d, onApprove, onReject, onView }) => (
  <div className="flex flex-col gap-3 rounded-xl border border-orange-100 bg-orange-50/40 p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
          {d.firstName[0]}{d.lastName[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Dr. {d.firstName} {d.lastName}</p>
          <p className="text-xs text-gray-500">{d.specialization}</p>
        </div>
      </div>
      <StatusBadge status="Pending" />
    </div>

    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
      <span><b>Qualification:</b> {d.qualification}</span>
      <span><b>Reg. No.:</b> {d.regNumber}</span>
      <span><b>Experience:</b> {d.experience} yrs</span>
      {d.email && <span><b>Email:</b> {d.email}</span>}
      {d.phone && <span><b>Phone:</b> {d.phone}</span>}
    </div>

    <div className="flex flex-wrap items-center gap-2 border-t border-orange-100 pt-3">
      <button type="button" onClick={() => onApprove(d.id)}
        className="flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800">
        <CheckCircle size={14} /> Approve & Activate
      </button>
      <button type="button" onClick={() => onReject(d.id)}
        className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
        <XCircle size={14} /> Reject
      </button>
      <button type="button" onClick={() => onView(d)}
        className="ml-auto text-xs text-green-700 underline hover:text-green-900">
        View Details
      </button>
    </div>
  </div>
)

/* ─── page ───────────────────────────────────────────────────────────────── */
export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([
    { id: 1, firstName: 'Arjun',   lastName: 'Sharma', qualification: 'BVSc & AH',  specialization: 'Bovine Medicine', regNumber: 'MH-VET-1042', experience: 8,  email: 'arjun@vetcare.in',  phone: '9876543210', status: 'Active'   },
    { id: 2, firstName: 'Priya',   lastName: 'Desai',  qualification: 'MVSc',        specialization: 'Dairy Nutrition', regNumber: 'GJ-VET-0387', experience: 5,  email: 'priya@vetcare.in',  phone: '9123456780', status: 'Active'   },
    { id: 3, firstName: 'Kiran',   lastName: 'Patil',  qualification: 'BVSc & AH',  specialization: 'Reproduction',    regNumber: 'KA-VET-2210', experience: 3,  email: 'kiran@vetcare.in',  phone: '',           status: 'Inactive' },
    { id: 4, firstName: 'Neha',    lastName: 'Joshi',  qualification: 'PhD Vet Sci', specialization: 'Pathology',       regNumber: 'RJ-VET-0091', experience: 12, email: 'neha@vetcare.in',   phone: '9988776655', status: 'Active'   },
    { id: 5, firstName: 'Suresh',  lastName: 'Nair',   qualification: 'MVSc',        specialization: 'Surgery',         regNumber: 'TN-VET-0556', experience: 7,  email: '',                  phone: '9871122334', status: 'Active'   },
    { id: 6, firstName: 'Meera',   lastName: 'Iyer',   qualification: 'BVSc & AH',  specialization: 'Bovine Medicine', regNumber: 'MH-VET-2088', experience: 2,  email: 'meera@vetcare.in',  phone: '9090909090', status: 'Pending'  },
    { id: 7, firstName: 'Rahul',   lastName: 'More',   qualification: 'MVSc',        specialization: 'Surgery',         regNumber: 'GJ-VET-1190', experience: 4,  email: 'rahul@vetcare.in',  phone: '9112233445', status: 'Pending'  },
  ])

  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('All')
  const [showFilter, setShowFilter] = useState(false)
  const [modal, setModal]           = useState('')   // '' | 'add' | 'edit' | 'view'
  const [selected, setSelected]     = useState(null)
  const [form, setForm]             = useState(blank)
  const [menu, setMenu]             = useState(null)
  const [page, setPage]             = useState(1)
  const pageSize = 5
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  /* ── derived data ─────────────────────────────────────────────────────── */
  const pending  = useMemo(() => doctors.filter(d => d.status === 'Pending'),  [doctors])

  // Main table shows all non-Pending doctors, filtered by search + status tab
  const filtered = useMemo(() => doctors.filter(d =>
    d.status !== 'Pending' &&
    `${d.firstName} ${d.lastName} ${d.specialization} ${d.regNumber}`.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'All' || d.status === filter)
  ), [doctors, search, filter])

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)

  /* ── workflow handlers ────────────────────────────────────────────────── */
  const approve = id => setDoctors(old => old.map(d => d.id === id ? { ...d, status: 'Active'   } : d))
  const reject  = id => setDoctors(old => old.map(d => d.id === id ? { ...d, status: 'Rejected' } : d))
  const toggleStatus = id => setDoctors(old => old.map(d =>
    d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d
  ))

  /* ── modal helpers ────────────────────────────────────────────────────── */
  const openAdd  = () => { setForm(blank); setSelected(null); setModal('add') }
  const openEdit = d  => { setSelected(d); setForm({ ...blank, ...d, experience: String(d.experience) }); setModal('edit') }
  const openView = d  => { setSelected(d); setModal('view') }
  const close    = () => { setModal(''); setSelected(null); setForm(blank) }

  const save = e => {
    e.preventDefault()
    const item = { ...form, experience: Number(form.experience) }
    if (modal === 'add') {
      // New doctors always start as Pending — they appear in the approval section
      setDoctors(old => [{ ...item, id: Date.now(), status: 'Pending' }, ...old])
    } else {
      setDoctors(old => old.map(d => d.id === selected.id ? { ...d, ...item } : d))
    }
    close()
  }

  /* ── form fields config ───────────────────────────────────────────────── */
  const formFields = [
    ['firstName',     'text',   'First Name',              true ],
    ['lastName',      'text',   'Last Name',               true ],
    ['qualification', 'text',   'Qualification (BVSc…)',   true ],
    ['regNumber',     'text',   'Registration Number',     true ],
    ['experience',    'number', 'Years of Experience',     true ],
    ['email',         'email',  'Email Address',           false],
    ['phone',         'text',   'Phone Number',            false],
  ]

  /* ── stats ────────────────────────────────────────────────────────────── */
  const count = s => doctors.filter(d => d.status === s).length

  return (
    <div className="min-h-screen bg-[#f7f8f3] text-gray-800">
      <main className="p-8 space-y-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Doctor Management</h1>
            <p className="text-gray-500 mt-1">Manage veterinary doctors and their registration approval.</p>
          </div>
          <button type="button" onClick={openAdd}
            className="bg-green-800 hover:bg-green-900 text-white px-5 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg">
            <Plus size={19} /> Add Doctor
          </button>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard title="Total Doctors"     value={doctors.length}    subtitle="All registered doctors"   icon={Stethoscope} />
          <StatCard title="Pending Requests"  value={count('Pending')}  subtitle="Awaiting approval"        icon={Clock}       />
          <StatCard title="Active Doctors"    value={count('Active')}   subtitle="Approved & can log in"    icon={UserCheck}   />
          <StatCard title="Rejected"          value={count('Rejected')} subtitle="Registration rejected"    icon={UserX}       />
        </div>

        {/* ── Pending Verification Section ─────────────────────────────── */}
        {pending.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">Pending Verification Requests</h2>
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                {pending.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pending.map(d => (
                <PendingRequestCard
                  key={d.id}
                  d={d}
                  onApprove={approve}
                  onReject={reject}
                  onView={openView}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-[360px]">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, specialization, reg no..."
              className="w-full bg-white border rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-green-700" />
          </div>
          <div className="relative">
            <button type="button" onClick={() => setShowFilter(v => !v)}
              className="bg-white border rounded-xl px-5 py-3 flex items-center gap-2 font-medium text-sm">
              <SlidersHorizontal size={17} /> Filters
            </button>
            {showFilter && (
              <div className="absolute z-10 top-14 left-0 bg-white border rounded-xl shadow-lg w-36 p-2">
                {['All', 'Active', 'Inactive', 'Rejected'].map(s => (
                  <button key={s} type="button"
                    onClick={() => { setFilter(s); setShowFilter(false); setPage(1) }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-green-50 ${filter === s ? 'font-semibold text-green-800' : ''}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          {filter !== 'All' && (
            <button type="button" onClick={() => { setFilter('All'); setPage(1) }}
              className="text-xs text-gray-400 hover:text-gray-700 underline">
              Clear filter
            </button>
          )}
          <span className="ml-auto text-xs text-gray-500">{filtered.length} records</span>
        </div>

        {/* ── Onboarded Doctors Table ───────────────────────────────────── */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Onboarded Doctors</h2>
          <div className="bg-white border rounded-2xl overflow-visible shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-[11px]">
                  <tr>
                    {['DOCTOR', 'QUALIFICATION', 'SPECIALIZATION', 'REG. NUMBER', 'EXPERIENCE', 'STATUS', ''].map(h =>
                      <th key={h} className="px-5 py-4 font-medium whitespace-nowrap">{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(d => (
                    <tr key={d.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
                            {d.firstName[0]}{d.lastName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{d.firstName} {d.lastName}</p>
                            {d.email && <p className="text-[10px] text-gray-400">{d.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-600">{d.qualification}</td>
                      <td className="px-5 py-4 text-xs text-gray-600">{d.specialization}</td>
                      <td className="px-5 py-4 text-xs font-medium text-green-800">{d.regNumber}</td>
                      <td className="px-5 py-4 text-xs text-gray-600">{d.experience} yrs</td>
                      <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                      <td className="px-5 py-4 relative">
                        <button type="button" onClick={() => setMenu(menu === d.id ? null : d.id)}
                          className="text-gray-400 hover:text-gray-700">
                          <MoreHorizontal size={20} />
                        </button>
                        {menu === d.id && (
                          <div className="absolute right-8 top-10 z-20 bg-white shadow-lg border rounded-xl w-36 p-1">
                            <button type="button" onClick={() => { openView(d); setMenu(null) }}
                              className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-gray-50">View Profile</button>
                            <button type="button" onClick={() => { openEdit(d); setMenu(null) }}
                              className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-gray-50">Edit</button>
                            {(d.status === 'Active' || d.status === 'Inactive') && (
                              <button type="button" onClick={() => { toggleStatus(d.id); setMenu(null) }}
                                className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-gray-50">
                                {d.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                            <button type="button"
                              onClick={() => { if (window.confirm(`Delete Dr. ${d.firstName} ${d.lastName}?`)) { setDoctors(old => old.filter(x => x.id !== d.id)); setMenu(null) } }}
                              className="w-full text-left text-xs px-3 py-2 rounded-lg text-red-600 hover:bg-red-50">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!rows.length && <TableEmptyState message="No doctors found." />}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 text-xs text-gray-500">
              <span>
                Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} doctors
              </span>
              <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
            </div>
          </div>
        </div>
      </main>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <CommonModal isOpen={modal === 'add' || modal === 'edit'} onClose={close}
        title={modal === 'add' ? 'Add New Doctor' : 'Edit Doctor'}>
        <form onSubmit={save} className="space-y-4">
          {modal === 'add' && (
            <p className="rounded-lg bg-orange-50 px-4 py-2.5 text-xs text-orange-700">
              New doctors will be added with <b>Pending</b> status and require approval before they can log in.
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            {formFields.map(([name, type, placeholder, required]) => (
              <label key={name} className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                {placeholder}
                <input name={name} type={type} required={required}
                  min={type === 'number' ? 0 : undefined}
                  placeholder={placeholder} value={form[name]} onChange={set}
                  className={inp} />
              </label>
            ))}
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Specialization
              <select name="specialization" value={form.specialization} onChange={set} className={inp}>
                <option value="">Select specialization</option>
                {specializations.map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
            {/* Status only editable on Edit, not Add (Add is always Pending) */}
            {modal === 'edit' && (
              <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
                Status
                <select name="status" value={form.status} onChange={set} className={inp}>
                  <option>Pending</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Rejected</option>
                </select>
              </label>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="bg-green-800 text-white rounded-lg px-5 py-2 text-sm font-semibold">
              {modal === 'add' ? 'Submit for Approval' : 'Save Changes'}
            </button>
          </div>
        </form>
      </CommonModal>

      {/* ── View Profile Modal ───────────────────────────────────────────── */}
      <CommonModal isOpen={modal === 'view'} onClose={close} title="Doctor Profile">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl bg-green-50 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-800 text-xl font-bold text-white">
                {selected.firstName[0]}{selected.lastName[0]}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">Dr. {selected.firstName} {selected.lastName}</p>
                <p className="text-sm text-gray-500">{selected.specialization}</p>
                <div className="mt-1"><StatusBadge status={selected.status} /></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['Qualification',    selected.qualification],
                ['Registration No.', selected.regNumber],
                ['Experience',       `${selected.experience} years`],
                ['Specialization',   selected.specialization],
                ['Email',            selected.email  || '—'],
                ['Phone',            selected.phone  || '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border bg-gray-50 p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">{value}</p>
                </div>
              ))}
            </div>

            {/* Quick approve/reject from view modal if still pending */}
            {selected.status === 'Pending' && (
              <div className="flex gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4">
                <button type="button" onClick={() => { approve(selected.id); close() }}
                  className="flex-1 rounded-lg bg-green-700 py-2 text-xs font-semibold text-white hover:bg-green-800">
                  Approve & Activate
                </button>
                <button type="button" onClick={() => { reject(selected.id); close() }}
                  className="flex-1 rounded-lg border border-red-300 bg-white py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                  Reject
                </button>
              </div>
            )}

            <div className="flex justify-end border-t pt-4">
              <button type="button" onClick={close} className="rounded-lg border px-5 py-2 text-sm">Close</button>
            </div>
          </div>
        )}
      </CommonModal>
    </div>
  )
}
