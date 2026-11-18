import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Database, Plus, Search, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import CommonModal from '../../../components/modals/CommonModal'
import CommonTable from '../../../components/tables/CommonTable'
import TableEmptyState from '../../../components/tables/TableEmptyState'
import TablePagination from '../../../components/tables/TablePagination'
import { getAnimals } from '../../animals/animals.service'
import { getMilkRecords } from '../../milk/milk.service'
import { createExpense, createMilkIncome, deleteExpense, deleteMilkIncome, getExpenses, getMilkIncomeSummary, updateExpense, updateMilkIncome } from '../finance.service'

const categories = ['Animal Feed', 'Medicines', 'Veterinary Services', 'Animal Purchase', 'Equipment', 'Transportation', 'Farm Maintenance', 'Other']
const normalizeCategory = (value) => ({ Medicine: 'Medicines', 'Other Expenses': 'Other' }[value] || value)
const paymentMethods = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other']
const blank = () => ({ title: '', category: 'Animal Feed', amount: '', expense_date: new Date().toISOString().slice(0, 10), animal_id: '', description: '', payment_method: 'Cash' })
const blankIncome = () => ({ quantity: '', milk_rate: '', record_date: new Date().toISOString().slice(0, 10), milk_session: 'Morning', customer_name: '', description: '' })
const money = (amount) => `₹ ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
const list = (response) => response?.data?.items ?? response?.data ?? []
const errorText = (error) => error.response?.data?.detail || 'Unable to load financial records.'
const input = 'w-full rounded-lg border p-2.5 text-sm outline-none focus:border-emerald-500'
const PAGE_SIZE = 10

export default function FinanceManagement() {
  const [milkRecords, setMilkRecords] = useState([])
  const [summary, setSummary] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [animals, setAnimals] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [incomeModal, setIncomeModal] = useState(false)
  const [incomeEditing, setIncomeEditing] = useState(null)
  const [incomeForm, setIncomeForm] = useState(blankIncome)
  const [savingIncome, setSavingIncome] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [milkResponse, summaryResponse, expenseResponse, animalResponse] = await Promise.all([
        getMilkRecords(), getMilkIncomeSummary(), getExpenses(), getAnimals(),
      ])
      setMilkRecords(list(milkResponse))
      setSummary(summaryResponse.data)
      setExpenses(list(expenseResponse))
      setAnimals(list(animalResponse))
    } catch (loadError) {
      setError(errorText(loadError))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { load() }, [load])

  const income = Number(summary?.total_milk_value ?? 0)
  const monthIncome = Number(summary?.current_month_milk_value ?? 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  const filteredExpenses = useMemo(() => expenses.filter((expense) => {
    const text = [expense.title, expense.category, expense.description, expense.payment_method, expense.animal_tag].join(' ').toLowerCase()
    return text.includes(search.toLowerCase()) && (category === 'All' || normalizeCategory(expense.category) === category) &&
      (!fromDate || expense.expense_date >= fromDate) && (!toDate || expense.expense_date <= toDate)
  }), [expenses, search, category, fromDate, toDate])
  const pageRows = filteredExpenses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((expense) => ({ ...expense, category: normalizeCategory(expense.category) }))

  const openAdd = () => { setEditing(null); setForm(blank()); setError(''); setNotice(''); setModal(true) }
  const openEdit = (expense) => {
    setEditing(expense)
    setForm({ title: expense.title, category: normalizeCategory(expense.category), amount: String(expense.amount), expense_date: expense.expense_date, animal_id: expense.animal_id || '', description: expense.description || '', payment_method: expense.payment_method || 'Other' })
    setError(''); setNotice(''); setModal(true)
  }
  const openAddIncome = () => { setIncomeEditing(null); setIncomeForm(blankIncome()); setError(''); setNotice(''); setIncomeModal(true) }
  const openEditIncome = (record) => {
    setIncomeEditing(record)
    setIncomeForm({ quantity: String(record.total_quantity ?? ''), milk_rate: String(record.milk_rate ?? ''), record_date: record.record_date, milk_session: record.milk_session, customer_name: record.customer_name || '', description: record.description || '' })
    setError(''); setNotice(''); setIncomeModal(true)
  }
  const changeIncome = (event) => setIncomeForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const saveExpense = async (event) => {
    event.preventDefault()
    setSaving(true); setError(''); setNotice('')
    const payload = { ...form, amount: Number(form.amount), animal_id: form.animal_id || null, description: form.description.trim() || null, payment_method: form.payment_method || null }
    try {
      if (editing) await updateExpense(editing.id, payload)
      else await createExpense(payload)
      setModal(false); setEditing(null)
      setNotice(editing ? 'Expense updated.' : 'Expense saved.')
      await load()
    } catch (saveError) {
      setError(errorText(saveError))
    } finally {
      setSaving(false)
    }
  }
  const removeExpense = async (expense) => {
    if (!window.confirm(`Delete expense “${expense.title}”?`)) return
    setError(''); setNotice('')
    try {
      await deleteExpense(expense.id)
      setNotice('Expense deleted.')
      await load()
    } catch (deleteError) {
      setError(errorText(deleteError))
    }
  }
  const saveIncome = async (event) => {
    event.preventDefault()
    setSavingIncome(true); setError(''); setNotice('')
    const payload = { ...incomeForm, quantity: Number(incomeForm.quantity), milk_rate: Number(incomeForm.milk_rate), customer_name: incomeForm.customer_name.trim() || null, description: incomeForm.description.trim() || null }
    try {
      if (incomeEditing) await updateMilkIncome(incomeEditing.id, payload)
      else await createMilkIncome(payload)
      setIncomeModal(false); setIncomeEditing(null)
      setNotice(incomeEditing ? 'Milk income updated.' : 'Milk income saved.')
      await load()
    } catch (saveError) {
      setError(errorText(saveError))
    } finally {
      setSavingIncome(false)
    }
  }
  const removeIncome = async (record) => {
    if (!window.confirm('Delete this milk income record?')) return
    setError(''); setNotice('')
    try {
      await deleteMilkIncome(record.id)
      setNotice('Milk income deleted.')
      await load()
    } catch (deleteError) {
      setError(errorText(deleteError))
    }
  }

  const expenseColumns = [
    { key: 'expense_date', label: 'DATE' },
    { key: 'title', label: 'EXPENSE', render: (expense) => <>{expense.title}<p className="text-xs text-slate-500">{expense.description || '—'}</p></> },
    { key: 'category', label: 'CATEGORY' },
    { key: 'animal_tag', label: 'ANIMAL', render: (expense) => expense.animal_tag || 'Farm-wide' },
    { key: 'payment_method', label: 'PAYMENT' },
    { key: 'amount', label: 'AMOUNT', render: (expense) => <span className="font-semibold text-rose-700">{money(expense.amount)}</span> },
    { key: 'actions', label: 'ACTIONS', render: (expense) => <div className="flex gap-2"><button type="button" onClick={() => openEdit(expense)} className="text-xs font-medium text-emerald-800 underline">Edit</button><button type="button" onClick={() => removeExpense(expense)} className="text-xs font-medium text-red-600 underline">Delete</button></div> },
  ]
  const incomeRows = milkRecords.map((record) => ({
    ...record,
  }))
  const incomeColumns = [
    { key: 'record_date', label: 'DATE' },
    { key: 'milk_session', label: 'SESSION', render: (row) => row.milk_session || 'Milk Production' },
    { key: 'customer_name', label: 'DAIRY / CUSTOMER', render: (row) => row.customer_name || '—' },
    { key: 'total_quantity', label: 'QUANTITY', render: (row) => row.total_quantity == null ? '—' : `${row.total_quantity} L` },
    { key: 'milk_rate', label: 'RATE / LITRE', render: (row) => row.milk_rate == null ? '—' : money(row.milk_rate) },
    { key: 'milk_value', label: 'TOTAL AMOUNT', render: (row) => <span className="font-semibold text-emerald-700">{money(row.milk_value)}</span> },
    { key: 'description', label: 'DESCRIPTION', render: (row) => row.description || '—' },
    { key: 'actions', label: 'ACTIONS', render: (row) => row.milk_session ? <div className="flex gap-2"><button type="button" onClick={() => openEditIncome(row)} className="text-xs font-medium text-emerald-800 underline">Edit</button><button type="button" onClick={() => removeIncome(row)} className="text-xs font-medium text-red-600 underline">Delete</button></div> : '—' },
  ]

  return <main className="min-h-screen bg-slate-50 p-4 text-slate-800 md:p-7">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-3xl font-bold">Finance Management</h1><p className="mt-2 text-sm text-slate-500">Track saved milk income and farm expenses.</p></div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={openAddIncome} className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-white hover:bg-emerald-800"><Plus size={16}/>Add Milk Income</button><button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-rose-700 px-4 py-3 text-white hover:bg-rose-800"><Plus size={16}/>Add Expense</button></div>
    </header>
    {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"><p>{error}</p><button type="button" onClick={load} className="mt-2 underline">Try again</button></div>}
    {notice && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Total Milk Income" value={money(income)} subtitle="Saved milk value" icon={TrendingUp}/>
      <StatCard title="This Month" value={money(monthIncome)} subtitle={summary?.month_start ? `Since ${summary.month_start}` : 'Current month milk value'} icon={Wallet}/>
      <StatCard title="Total Expenses" value={money(totalExpenses)} subtitle={`${expenses.length} saved expenses`} icon={TrendingDown}/>
      <StatCard title="Net Balance" value={money(income - totalExpenses)} subtitle="Milk income minus expenses" icon={Database}/>
    </div>
    <div className="mb-6 grid gap-5 md:grid-cols-2">
      <section className="rounded-xl border bg-white p-5"><h2 className="mb-3 font-bold">Milk Income</h2><p className="text-2xl font-semibold text-emerald-700">{money(income)}</p><p className="mt-2 text-sm text-slate-500">Calculated from saved milk production records.</p></section>
      <section className="rounded-xl border bg-white p-5"><h2 className="mb-3 font-bold">Expenses</h2><p className="text-2xl font-semibold text-rose-700">{money(totalExpenses)}</p><p className="mt-2 text-sm text-slate-500">Calculated from your saved expense records.</p></section>
    </div>
    <section className="mb-6 overflow-hidden rounded-xl border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5"><h2 className="font-bold">Farm Expenses</h2><div className="flex flex-wrap gap-2">
        <div className="relative"><Search size={16} className="absolute left-3 top-2.5 text-slate-400"/><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search expenses..." className="w-44 rounded-lg border py-2 pl-9 pr-3 text-sm"/></div>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }} className="rounded-lg border p-2 text-sm"><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <label className="flex items-center gap-1 text-xs text-slate-500"><CalendarDays size={14}/>From<input type="date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} className="rounded border p-1.5"/></label>
        <label className="flex items-center gap-1 text-xs text-slate-500">To<input type="date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1) }} className="rounded border p-1.5"/></label>
      </div></div>
      <div className="p-4">{loading ? <p className="py-6 text-sm text-slate-500">Loading expenses…</p> : pageRows.length ? <CommonTable columns={expenseColumns} data={pageRows}/> : <TableEmptyState message="No expenses match your filters."/>}
        {!loading && <div className="mt-4 border-t pt-4"><TablePagination page={page} pageSize={PAGE_SIZE} total={filteredExpenses.length} onPageChange={setPage}/></div>}
      </div>
    </section>
    <section className="overflow-hidden rounded-xl border bg-white"><div className="border-b p-5"><h2 className="font-bold">Milk Income</h2></div><div className="p-4">{loading ? <p className="py-6 text-sm text-slate-500">Loading milk income…</p> : incomeRows.length ? <CommonTable columns={incomeColumns} data={incomeRows}/> : <TableEmptyState message="No milk income records found. Add an income record or save production records."/>}</div></section>
    <CommonModal isOpen={modal} onClose={() => { if (!saving) setModal(false) }} title={editing ? 'Edit Expense' : 'Add Expense'}>
      <form onSubmit={saveExpense} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">Expense Title<input required maxLength={150} value={form.title} name="title" onChange={change} className={input} placeholder="e.g. Cattle feed purchase"/></label>
        <label className="text-sm font-medium">Category<select required value={form.category} name="category" onChange={change} className={input}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium">Amount<input required min="0.01" step="0.01" type="number" value={form.amount} name="amount" onChange={change} className={input}/></label>
        <label className="text-sm font-medium">Expense Date<input required type="date" value={form.expense_date} name="expense_date" onChange={change} className={input}/></label>
        <label className="text-sm font-medium">Animal (optional)<select value={form.animal_id} name="animal_id" onChange={change} className={input}><option value="">Farm-wide expense</option>{animals.map((animal) => <option key={animal.id} value={animal.id}>{animal.tag_number} · {animal.animal_type}</option>)}</select></label>
        <label className="text-sm font-medium">Payment Method<select value={form.payment_method} name="payment_method" onChange={change} className={input}>{paymentMethods.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium sm:col-span-2">Description / Notes<textarea rows={3} value={form.description} name="description" onChange={change} className={input}/></label>
        {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
        <div className="flex justify-end gap-2 border-t pt-3 sm:col-span-2"><button type="button" disabled={saving} onClick={() => setModal(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button disabled={saving} className="rounded-lg bg-rose-700 px-4 py-2 text-sm text-white disabled:opacity-60">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Save Expense'}</button></div>
      </form>
    </CommonModal>
    <CommonModal isOpen={incomeModal} onClose={() => { if (!savingIncome) setIncomeModal(false) }} title={incomeEditing ? 'Edit Milk Income' : 'Add Milk Income'}>
      <form onSubmit={saveIncome} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Milk Quantity (Litres)<input required min="0.01" step="0.01" type="number" name="quantity" value={incomeForm.quantity} onChange={changeIncome} className={input}/></label>
        <label className="text-sm font-medium">Milk Rate per Litre<input required min="0.01" step="0.01" type="number" name="milk_rate" value={incomeForm.milk_rate} onChange={changeIncome} className={input}/></label>
        <div className="rounded-lg bg-emerald-50 p-3 sm:col-span-2"><span className="text-xs text-emerald-800">Total Amount (calculated)</span><p className="text-lg font-semibold text-emerald-900">{money((Number(incomeForm.quantity) || 0) * (Number(incomeForm.milk_rate) || 0))}</p></div>
        <label className="text-sm font-medium">Date<input required type="date" name="record_date" value={incomeForm.record_date} onChange={changeIncome} className={input}/></label>
        <label className="text-sm font-medium">Milk Session<select required name="milk_session" value={incomeForm.milk_session} onChange={changeIncome} className={input}><option>Morning</option><option>Evening</option></select></label>
        <label className="text-sm font-medium sm:col-span-2">Dairy / Customer Name<input maxLength={150} name="customer_name" value={incomeForm.customer_name} onChange={changeIncome} className={input}/></label>
        <label className="text-sm font-medium sm:col-span-2">Description<textarea rows={3} name="description" value={incomeForm.description} onChange={changeIncome} className={input}/></label>
        {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
        <div className="flex justify-end gap-2 border-t pt-3 sm:col-span-2"><button type="button" disabled={savingIncome} onClick={() => setIncomeModal(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button disabled={savingIncome} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-60">{savingIncome ? 'Saving…' : incomeEditing ? 'Save Changes' : 'Save Milk Income'}</button></div>
      </form>
    </CommonModal>
  </main>
}
