import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Download, FileText, RefreshCw } from 'lucide-react'
import StatCard from '../../../components/common/StatCard.jsx'
import TableEmptyState from '../../../components/tables/TableEmptyState.jsx'
import api from '../../../core/services/api.js'

const reportOptions = [
  { value: 'animals', label: 'Animal Summary' },
  { value: 'milk', label: 'Milk Production' },
  { value: 'feed', label: 'Feed Management' },
  { value: 'health', label: 'Health Records' },
  { value: 'breeding', label: 'Breeding Records' },
  { value: 'mastitis', label: 'Mastitis Records' },
  { value: 'finance', label: 'Finance (Milk Income)' },
]
const numberFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })
const title = (field) => field.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
const stringify = (value) => {
  if (value == null || value === '') return '—'
  if (typeof value === 'number') return numberFormat.format(value)
  return String(value)
}

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState('animals')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadReport = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/admin/reports', {
        params: {
          report_type: reportType,
          ...(fromDate ? { from_date: fromDate } : {}),
          ...(toDate ? { to_date: toDate } : {}),
        },
      })
      setReport(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load this report.')
    } finally {
      setLoading(false)
    }
  }, [reportType, fromDate, toDate])

  useEffect(() => { loadReport() }, [loadReport])

  const columns = useMemo(() => {
    const first = report?.items?.[0]
    return first ? Object.keys(first).filter((key) => key !== 'id') : []
  }, [report])

  const exportCsv = () => {
    const rows = [
      columns.map(title),
      ...(report?.items ?? []).map((item) => columns.map((field) => item[field] ?? '')),
    ]
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = Object.assign(document.createElement('a'), {
      href: url,
      download: `gauvikas_${reportType}_report.csv`,
    })
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const totals = report?.totals ?? {}
  const cards = [
    { title: 'Records', value: totals.records ?? 0, subtitle: 'Matching saved database records', icon: FileText },
    ...(reportType === 'milk' || reportType === 'finance'
      ? [
          { title: 'Milk Quantity (L)', value: numberFormat.format(totals.milk_quantity ?? 0), subtitle: 'Recorded production', icon: FileText },
          { title: 'Milk Income', value: `₹ ${numberFormat.format(totals.milk_income ?? 0)}`, subtitle: 'From existing milk values', icon: FileText },
        ]
      : reportType === 'feed'
        ? [{
            title: 'Feed Quantity by Unit',
            value: Object.entries(totals)
              .filter(([key]) => key.startsWith('feed_quantity_'))
              .map(([key, value]) => `${numberFormat.format(value)} ${key.slice('feed_quantity_'.length)}`)
              .join(' · ') || '0',
            subtitle: 'Summed separately for each stored unit',
            icon: FileText,
          }]
        : []),
  ]

  return (
    <main className="min-h-screen space-y-6 bg-[#f7f8f3] p-5 text-gray-800 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold">Admin Reports</h1><p className="mt-1 text-sm text-gray-500">Build reports from records stored across registered farms.</p></div>
        <button type="button" onClick={exportCsv} disabled={!report?.items?.length} className="flex items-center gap-2 rounded-lg bg-green-800 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Download size={16} /> Export CSV</button>
      </header>

      <section className="grid gap-4 rounded-xl border bg-white p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <label className="text-sm font-medium">Report
          <select value={reportType} onChange={(event) => setReportType(event.target.value)} className="mt-1 w-full rounded-lg border p-2.5">
            {reportOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">From Date<input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => setFromDate(event.target.value)} className="mt-1 w-full rounded-lg border p-2.5" /></label>
        <label className="text-sm font-medium">To Date<input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} className="mt-1 w-full rounded-lg border p-2.5" /></label>
        <button type="button" onClick={loadReport} disabled={loading} className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm disabled:opacity-60"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh</button>
      </section>

      {error && <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16} />{error}</div>}
      {reportType === 'finance' && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Finance uses recorded milk income. Expense and profit data are unavailable because the existing database has no expense or transaction model.</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => <StatCard key={card.title} {...card} />)}
      </section>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-4">
          <div><h2 className="font-semibold">{reportOptions.find((option) => option.value === reportType)?.label}</h2><p className="mt-1 text-xs text-gray-500">{report?.items?.length ?? 0} rows</p></div>
          <FileText size={19} className="text-green-800" />
        </div>
        {loading ? <div className="p-12 text-center text-sm text-gray-500">Generating report from database records...</div> : report?.items?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{columns.map((field) => <th key={field} className="whitespace-nowrap px-4 py-3 font-medium">{title(field)}</th>)}</tr></thead>
              <tbody>{report.items.map((item, index) => <tr key={item.id ?? index} className="border-t hover:bg-gray-50">{columns.map((field) => <td key={field} className="whitespace-nowrap px-4 py-3">{stringify(item[field])}</td>)}</tr>)}</tbody>
            </table>
          </div>
        ) : <TableEmptyState message={error ? 'Report data could not be loaded.' : 'No records match this report and date range.'} />}
      </section>
    </main>
  )
}
