import { useEffect, useMemo, useState } from 'react'
import { Droplets, HeartPulse, Wallet, Heart, Activity, Search, Download, FileText, Milk, AlertTriangle } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import { getAnimals } from '../../animals/animals.service'
import { getBreedingRecords } from '../../breeding/breeding.service'
import { getFeedRecords } from '../../feed/feed.service'
import { getMyHealthRecords } from '../../farmers/farmers.service'
import { getMastitisRecords } from '../../mastitis/mastitis.service'
import { getMilkRecords } from '../../milk/milk.service'
import { getMilkIncomeSummary } from '../../finance/finance.service'

const types = [
  { name: 'Animal Summary', icon: Milk },
  { name: 'Milk Yield', icon: Droplets },
  { name: 'Health Summary', icon: HeartPulse },
  { name: 'Breeding Records', icon: Heart },
  { name: 'Mastitis Records', icon: Activity },
  { name: 'Feed Audit', icon: Activity },
  { name: 'Financial Log', icon: Wallet },
]
const periods = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last 6 Months', 'This Year']
const groups = ['Individual Animal ID', 'Date', 'Category']
const list = (response) => response?.data?.items ?? response?.data ?? []
const errorText = (error) => error.response?.data?.detail || 'Unable to load report data.'
const columns = (...fields) => fields.map(([key, label]) => ({ key, label }))
const formatDate = (date) => date ? new Date(`${date}T00:00:00`).toLocaleDateString() : '—'
const reportDefinitions = {
  'Animal Summary': {
    title: 'Animal Summary Report',
    dateField: null,
    categoryField: 'animal_type',
    animalField: 'tag_number',
    fields: columns(['tag_number', 'Animal Tag'], ['animal_type', 'Type'], ['breed', 'Breed'], ['gender', 'Gender'], ['date_of_birth', 'Date of Birth'], ['weight', 'Weight'], ['status', 'Status']),
  },
  'Milk Yield': {
    title: 'Milk Production Report',
    dateField: 'record_date',
    categoryField: 'animal_tag',
    animalField: 'animal_tag',
    fields: columns(['record_date', 'Date'], ['animal_tag', 'Animal Tag'], ['morning_quantity', 'Morning (L)'], ['evening_quantity', 'Evening (L)'], ['total_quantity', 'Total (L)'], ['fat', 'Fat %'], ['snf', 'SNF %'], ['milk_rate', 'Rate'], ['milk_value', 'Value']),
  },
  'Health Summary': {
    title: 'Animal Health Summary',
    dateField: 'visit_date',
    categoryField: 'disease',
    animalField: 'animal_tag',
    fields: columns(['visit_date', 'Date'], ['animal_tag', 'Animal Tag'], ['disease', 'Health Issue'], ['treatment', 'Treatment'], ['medicine', 'Medicine'], ['dose', 'Dose']),
  },
  'Breeding Records': {
    title: 'Breeding Records Report',
    dateField: 'ai_date',
    categoryField: 'pregnancy_status',
    animalField: 'animal_tag',
    fields: columns(['animal_tag', 'Animal Tag'], ['breed', 'Breed'], ['lactation_number', 'Lactation'], ['ai_date', 'AI Date'], ['pregnancy_status', 'Pregnancy Status'], ['pregnancy_confirmation_date', 'Confirmed'], ['calving_date', 'Calving Date']),
  },
  'Mastitis Records': {
    title: 'Mastitis Records Report',
    dateField: 'test_date',
    categoryField: 'result',
    animalField: 'animal_tag',
    fields: columns(['animal_tag', 'Animal Tag'], ['test_date', 'Test Date'], ['test_name', 'Test'], ['result', 'Result'], ['treatment', 'Treatment'], ['recovery_date', 'Recovery Date'], ['follow_up_date', 'Follow-up']),
  },
  'Feed Audit': {
    title: 'Feed Management Report',
    dateField: 'record_date',
    categoryField: 'feed_type_name',
    animalField: 'animal_tag',
    fields: columns(['record_date', 'Date'], ['animal_tag', 'Animal Tag'], ['feed_type_name', 'Feed Type'], ['quantity', 'Quantity'], ['unit', 'Unit']),
  },
  'Financial Log': {
    title: 'Milk Income Report',
    dateField: 'record_date',
    categoryField: 'type',
    animalField: 'animal_tag',
    fields: columns(['record_date', 'Date'], ['animal_tag', 'Animal Tag'], ['total_quantity', 'Milk (L)'], ['milk_rate', 'Rate'], ['milk_value', 'Milk Value']),
  },
}

export default function ReportsManagement() {
  const [type, setType] = useState('Milk Yield')
  const [period, setPeriod] = useState('Last 30 Days')
  const [group, setGroup] = useState('Individual Animal ID')
  const [search, setSearch] = useState('')
  const [history, setHistory] = useState([])
  const [datasets, setDatasets] = useState({})
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      getAnimals(), getMilkRecords(), getMyHealthRecords(), getBreedingRecords(),
      getMastitisRecords(), getFeedRecords(), getMilkIncomeSummary(),
    ])
      .then(([animals, milk, health, breeding, mastitis, feed, finance]) => {
        if (!active) return
        setDatasets({
          'Animal Summary': list(animals),
          'Milk Yield': list(milk),
          'Health Summary': list(health),
          'Breeding Records': list(breeding),
          'Mastitis Records': list(mastitis),
          'Feed Audit': list(feed),
          'Financial Log': list(milk),
        })
        setSummary(finance.data)
      })
      .catch((requestError) => {
        if (active) setError(errorText(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const report = reportDefinitions[type]
  const animalsById = useMemo(
    () => new Map((datasets['Animal Summary'] || []).map((animal) => [animal.id, animal])),
    [datasets],
  )
  const records = (datasets[type] || []).map((record) => {
    const animal = animalsById.get(record.animal_id)
    return { ...record, animal_tag: record.animal_tag ?? animal?.tag_number ?? '—' }
  })
  const now = new Date()
  const periodDays = { 'Last 7 Days': 7, 'Last 30 Days': 30, 'Last 3 Months': 90, 'Last 6 Months': 180, 'This Year': Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / 86400000) }[period]
  const since = new Date(now)
  since.setDate(now.getDate() - periodDays)
  const searched = records.filter((row) => {
    if (!Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase())) return false
    if (!report.dateField) return true
    const date = row[report.dateField]
    return date && new Date(`${date}T00:00:00`) >= since && new Date(`${date}T00:00:00`) <= now
  })
  const unique = new Set(searched.map((row) => row[report.animalField]).filter(Boolean)).size
  const totalMilkValue = searched.reduce((sum, row) => sum + Number(row.milk_value || 0), 0)
  const summaryCards = [
    { title: 'Total Records', value: searched.length, icon: FileText },
    { title: 'Unique Animals', value: unique, icon: Activity },
    { title: type === 'Financial Log' ? 'Milk Income' : 'Records with Follow-up', value: type === 'Financial Log' ? `₹ ${totalMilkValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : searched.filter((row) => row.follow_up_date || row.calving_date).length, icon: AlertTriangle },
  ]

  const display = (() => {
    if (group === 'Individual Animal ID') return searched
    const key = group === 'Date' ? report.dateField : report.categoryField
    if (!key) return searched
    const grouped = new Map()
    searched.forEach((row) => {
      const value = row[key] || 'Not specified'
      const current = grouped.get(value) || { group: value, records: 0, milk_value: 0 }
      current.records += 1
      current.milk_value += Number(row.milk_value || 0)
      grouped.set(value, current)
    })
    return [...grouped.values()]
  })()
  const displayColumns = group === 'Individual Animal ID'
    ? report.fields
    : columns(['group', group === 'Date' ? 'Date' : 'Category'], ['records', 'Records'], ...(type === 'Milk Yield' || type === 'Financial Log' ? [['milk_value', 'Milk Value']] : []))
  const downloadCSV = () => {
    const csvRows = [displayColumns.map((column) => column.label), ...display.map((row) => displayColumns.map((column) => row[column.key] ?? ''))]
    const csv = csvRows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = Object.assign(document.createElement('a'), { href: url, download: `${type.replaceAll(' ', '_')}.csv` })
    anchor.click()
    URL.revokeObjectURL(url)
    setHistory((items) => [`${report.title} - ${new Date().toLocaleDateString()}`, ...items].slice(0, 5))
  }
  const exportPDF = () => {
    setHistory((items) => [`${report.title} - ${new Date().toLocaleDateString()}`, ...items].slice(0, 5))
    window.print()
  }

  const renderTable = (tiny = false) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: tiny ? 10 : 12, textAlign: 'left' }}>
      <thead style={{ background: tiny ? '#1b6028' : '#faf9f6', color: tiny ? '#fff' : 'inherit' }}>
        <tr>{tiny && <th style={{ padding: '6px 8px' }}>#</th>}{displayColumns.map((column) => <th key={column.key} style={{ padding: '6px 8px', borderBottom: '1px solid #d7e7d5' }}>{column.label}</th>)}</tr>
      </thead>
      <tbody>
        {display.map((row, index) => <tr key={`${row.id ?? row.group ?? 'record'}-${index}`} style={{ background: tiny && index % 2 ? '#f5faf2' : 'transparent' }}>
          {tiny && <td style={{ padding: '6px 8px', borderBottom: '1px solid #d7e7d5' }}>{index + 1}</td>}
          {displayColumns.map((column) => <td key={column.key} style={{ padding: '6px 8px', borderBottom: '1px solid #d7e7d5' }}>{column.key.endsWith('_date') ? formatDate(row[column.key]) : row[column.key] ?? '—'}</td>)}
        </tr>)}
        {!display.length && <tr><td colSpan={displayColumns.length + (tiny ? 1 : 0)} style={{ padding: 24, textAlign: 'center' }}>{loading ? 'Loading records…' : 'No records found.'}</td></tr>}
      </tbody>
    </table>
  )

  return (
    <main className="min-h-screen bg-[#faf9f6] text-slate-800">
      <style>{`@media print {@page{size:A4 portrait;margin:12mm}.no-print{display:none!important}.pdf-report{display:block!important}body{background:white!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}.pdf-report{display:none}`}</style>
      <div className="no-print">
        <header className="flex flex-wrap justify-between gap-4 border-b bg-white p-5">
          <h1 className="text-xl font-bold">Report Generation & Analytics</h1>
          <div className="flex items-center gap-2 rounded-lg border px-3"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records..." className="w-40 py-2 text-sm outline-none" /></div>
        </header>
        {error && <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="space-y-6 p-5 md:p-8">
          <section><h2 className="mb-3 text-sm font-semibold">Select Report Type</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {types.map(({ name, icon: Icon }) => <button key={name} type="button" onClick={() => { setType(name); setSearch('') }} className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${type === name ? 'bg-[#2d6b52] text-white' : 'bg-white hover:border-emerald-500'}`}><Icon size={17} />{name}</button>)}
          </div></section>
          <div className="grid items-start gap-5 lg:grid-cols-[0.8fr_1.5fr]">
            <aside className="space-y-4 rounded-2xl border bg-white p-5">
              <h2 className="font-bold">Filter Variables</h2>
              <label className="block text-sm">Time Frame</label>
              <select value={period} onChange={(event) => setPeriod(event.target.value)} className="w-full rounded-lg border p-3 text-sm">{periods.map((value) => <option key={value}>{value}</option>)}</select>
              <label className="block text-sm">Group By</label>
              <select value={group} onChange={(event) => setGroup(event.target.value)} className="w-full rounded-lg border p-3 text-sm">{groups.map((value) => <option key={value}>{value}</option>)}</select>
              <hr />
              <h3 className="font-semibold">Recent Downloads</h3>
              {history.length ? history.map((item, index) => <div key={`${item}-${index}`} className="flex items-center gap-2 text-xs"><FileText size={15} className="text-emerald-700" /><span className="flex-1">{item}</span></div>) : <p className="text-xs text-gray-500">No reports downloaded this session.</p>}
              {type === 'Financial Log' && <p className="text-xs text-amber-700">Only milk income is supported. Expense data is not present in the current database schema.</p>}
            </aside>
            <section className="overflow-hidden rounded-2xl border bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5"><div><h2 className="font-bold">{report.title}</h2><p className="text-xs text-slate-500">{searched.length} records · {period}</p></div><div className="flex gap-2"><button type="button" onClick={downloadCSV} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><Download size={15} /> CSV</button><button type="button" onClick={exportPDF} className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm text-white"><FileText size={15} /> PDF</button></div></div>
              <div className="grid gap-3 p-5 sm:grid-cols-3">{summaryCards.map((card) => <StatCard key={card.title} {...card} />)}</div>
              {type === 'Financial Log' && <p className="px-5 pb-3 text-xs text-amber-700">Total recorded milk income: ₹ {Number(summary?.total_milk_value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}. Expenses and profit are unavailable because no corresponding model exists.</p>}
              <div className="overflow-x-auto p-5">{renderTable()}</div>
            </section>
          </div>
        </div>
      </div>
      <div className="pdf-report" style={{ background: 'white', color: '#243126', padding: 20, maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ borderBottom: '5px solid #1b6028', paddingBottom: 16, marginBottom: 20 }}>
          <h1 style={{ color: '#1b6028' }}>DAIRY MANAGEMENT SYSTEM</h1>
          <p>REPORT DATE: {new Date().toLocaleDateString()}</p>
        </header>
        <h2>{report.title}</h2><p>{period}</p>
        {renderTable(true)}
        <p style={{ marginTop: 16 }}>Total records: {searched.length}{type === 'Financial Log' ? ` · Milk income: ₹ ${totalMilkValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : ''}</p>
      </div>
    </main>
  )
}
