import { useMemo, useState } from 'react'
import { Plus, Search, Wallet, TrendingUp, TrendingDown, Database } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import CommonTable from '../../../components/tables/CommonTable'
import TableActions from '../../../components/tables/TableActions'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'

const initial = [
  { id: 1, date: '2026-10-15', type: 'Income',  category: 'Milk Sales',    description: 'Milk sold to dairy union', amount: 12000 },
  { id: 2, date: '2026-10-14', type: 'Expense', category: 'Feed',          description: 'Green fodder purchase',    amount: 5500  },
  { id: 3, date: '2026-10-12', type: 'Expense', category: 'Medicines',     description: 'Animal medicines',         amount: 2800  },
  { id: 4, date: '2026-10-10', type: 'Income',  category: 'Cattle Sales',  description: 'Cattle sale',              amount: 30000 },
  { id: 5, date: '2026-10-08', type: 'Expense', category: 'Labor',         description: 'Worker salary',            amount: 9500  },
]
const cats = ['Milk Sales', 'Cattle Sales', 'Feed', 'Medicines', 'Labor', 'Utilities', 'Maintenance', 'Others']
const empty = { date: new Date().toISOString().slice(0, 10), type: 'Income', category: 'Milk Sales', description: '', amount: '' }
const money = n => '₹ ' + Number(n || 0).toLocaleString('en-IN')
const inp = 'mt-1 w-full rounded-lg border p-2.5 text-sm outline-none focus:border-emerald-500'

export default function FinanceManagement() {
  const [data, setData] = useState(initial)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [modal, setModal] = useState('')   // '' | 'form' | 'view'
  const [editId, setEditId] = useState(null)
  const [viewRecord, setViewRecord] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 5
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const sum = t => data.filter(x => x.type === t).reduce((s, x) => s + Number(x.amount), 0)
  const income = sum('Income'), expenses = sum('Expense'), profit = income - expenses

  const filtered = useMemo(() => data.filter(x =>
    `${x.category} ${x.description} ${x.type}`.toLowerCase().includes(search.toLowerCase()) &&
    (typeFilter === 'All' || x.type === typeFilter)
  ), [data, search, typeFilter])

  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const openAdd  = () => { setEditId(null); setForm(empty); setModal('form') }
  const openEdit = x => { setEditId(x.id); setForm({ ...x, amount: String(x.amount) }); setModal('form') }
  const openView = x => { setViewRecord(x); setModal('view') }
  const close    = () => { setModal(''); setEditId(null); setForm(empty); setViewRecord(null) }

  const save = e => {
    e.preventDefault()
    const item = { ...form, id: editId || Date.now(), amount: Number(form.amount) }
    setData(d => editId ? d.map(x => x.id === editId ? item : x) : [item, ...d])
    close()
  }

  const columns = [
    { key: 'date', label: 'DATE' },
    { key: 'type', label: 'TYPE', render: x =>
      <span className={`rounded-full px-2 py-1 text-xs ${x.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{x.type}</span>
    },
    { key: 'category', label: 'CATEGORY' },
    { key: 'description', label: 'DESCRIPTION' },
    { key: 'amount', label: 'AMOUNT', render: x =>
      <span className={`font-semibold ${x.type === 'Income' ? 'text-emerald-600' : 'text-red-500'}`}>{money(x.amount)}</span>
    },
    { key: 'actions', label: 'ACTIONS', render: x =>
      <TableActions
        onEdit={() => openEdit(x)}
        onView={() => openView(x)}
        onDelete={() => window.confirm('Delete transaction?') && setData(d => d.filter(t => t.id !== x.id))}
      />
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 md:p-7">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Finance Management</h1>
          <p className="mt-2 text-sm text-slate-500">Track income, expenses and manage your farm finances.</p>
        </div>
        <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-700">
          <Plus size={18} /> Add Transaction
        </button>
      </header>

      {/* Stat Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Income"       value={money(income)}   subtitle="All income records"       icon={TrendingUp} />
        <StatCard title="Total Expenses"     value={money(expenses)} subtitle="All expense records"      icon={TrendingDown} />
        <StatCard title="Net Profit"         value={money(profit)}   subtitle="Income minus expenses"    icon={Wallet} />
        <StatCard title="Total Transactions" value={data.length}     subtitle="Recorded transactions"    icon={Database} />
      </div>

      {/* Charts */}
      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-xl border bg-white p-5">
          <h2 className="mb-5 font-bold">Income vs Expenses</h2>
          {[['Income', income, 'bg-emerald-500'], ['Expenses', expenses, 'bg-orange-400']].map(([label, amount, color]) => (
            <div key={label} className="mb-5">
              <div className="mb-2 flex justify-between text-sm"><span>{label}</span><b>{money(amount)}</b></div>
              <div className="h-3 rounded-full bg-slate-100">
                <div style={{ width: `${amount / Math.max(income, expenses, 1) * 100}%` }} className={`h-3 rounded-full ${color}`} />
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border bg-white p-5">
          <h2 className="mb-4 font-bold">Expense Breakdown</h2>
          {cats.map(c => {
            const n = data.filter(x => x.category === c && x.type === 'Expense').reduce((s, x) => s + Number(x.amount), 0)
            return n ? (
              <div key={c} className="mb-4">
                <div className="mb-1 flex justify-between text-sm"><span>{c}</span><span>{money(n)}</span></div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div style={{ width: `${n / Math.max(expenses, 1) * 100}%` }} className="h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            ) : null
          })}
        </section>
      </div>

      {/* Transactions Table */}
      <section className="mt-5 overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <h2 className="font-bold">Transactions</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search..." className="w-44 rounded-lg border py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" />
            </div>
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="rounded-lg border p-2 text-sm">
              <option value="All">All</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>
        </div>
        <div className="p-4">
          {rows.length
            ? <CommonTable columns={columns} data={rows} />
            : <TableEmptyState message="No transactions found." />}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs text-slate-500">
            <span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} transactions</span>
            <TablePagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
          </div>
        </div>
      </section>

      {/* Category Summary Table */}
      <section className="mt-5 rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-bold">Category Wise Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[450px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr><th className="p-3">Category</th><th className="p-3">Income</th><th className="p-3">Expense</th></tr>
            </thead>
            <tbody className="divide-y">
              {cats.map(c => {
                const inc = data.filter(x => x.category === c && x.type === 'Income').reduce((s, x) => s + x.amount, 0)
                const exp = data.filter(x => x.category === c && x.type === 'Expense').reduce((s, x) => s + x.amount, 0)
                return (inc || exp) ? (
                  <tr key={c}>
                    <td className="p-3">{c}</td>
                    <td className="p-3 text-emerald-600">{inc ? money(inc) : '—'}</td>
                    <td className="p-3 text-red-500">{exp ? money(exp) : '—'}</td>
                  </tr>
                ) : null
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add / Edit Modal */}
      <CommonModal isOpen={modal === 'form'} onClose={close} title={editId ? 'Edit Transaction' : 'Add Transaction'}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">Date
              <input required name="date" type="date" value={form.date} onChange={set} className={inp} />
            </label>
            <label className="text-sm">Type
              <select name="type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, category: e.target.value === 'Income' ? 'Milk Sales' : 'Feed' }))} className={inp}>
                <option>Income</option><option>Expense</option>
              </select>
            </label>
            <label className="text-sm">Category
              <select name="category" value={form.category} onChange={set} className={inp}>
                {cats.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-sm">Amount (₹)
              <input required name="amount" type="number" min="0" value={form.amount} onChange={set} className={inp} />
            </label>
            <label className="text-sm sm:col-span-2">Description
              <input required name="description" value={form.description} onChange={set} className={inp} />
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" className="rounded-lg bg-emerald-600 px-5 py-2 text-sm text-white">{editId ? 'Update' : 'Save Transaction'}</button>
          </div>
        </form>
      </CommonModal>

      {/* View Modal */}
      <CommonModal isOpen={modal === 'view'} onClose={close} title="Transaction Details">
        {viewRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[['Date', 'date'], ['Type', 'type'], ['Category', 'category'], ['Amount', 'amount'], ['Description', 'description']].map(([label, key]) => (
                <div key={key} className={key === 'description' ? 'col-span-2' : ''}>
                  <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
                  <p className="rounded-lg border bg-slate-50 p-2.5 text-sm">
                    {key === 'amount' ? money(viewRecord[key]) : viewRecord[key]}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-end border-t pt-4">
              <button type="button" onClick={close} className="rounded-lg border px-5 py-2 text-sm">Close</button>
            </div>
          </div>
        )}
      </CommonModal>
    </main>
  )
}
