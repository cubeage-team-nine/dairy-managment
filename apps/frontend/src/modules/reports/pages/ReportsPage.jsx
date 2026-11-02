import { useState } from 'react'
import { Droplets, HeartPulse, Wallet, Heart, Activity, Search, Download, FileText, Milk, CalendarDays, AlertTriangle } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'

const data = {
  'Milk Yield':       { title: 'Daily Milk Production Report',  cols: ['Date', 'Herd Size', 'Avg Yield', 'Fat %', 'Anomalies'],   rows: [['May 14','48 cows','186 L','3.8%','None'],['May 13','48 cows','184 L','3.9%','Mastitis alert'],['May 12','47 cows','180 L','3.8%','None']] },
  'Health Summary':   { title: 'Animal Health Summary',          cols: ['Date', 'Animal ID', 'Condition', 'Treatment', 'Status'],   rows: [['May 14','COW-101','Mastitis','Medicine','Recovering'],['May 13','COW-104','Fever','Medication','Healthy']] },
  'Financial Log':    { title: 'Revenue & Expense Ledger',       cols: ['Date', 'Description', 'Category', 'Amount', 'Status'],     rows: [['May 14','Milk Sales','Income','₹12,500','Received'],['May 13','Cattle Feed','Expense','₹3,200','Paid']] },
  'Breeding Records': { title: 'Breeding Records Report',        cols: ['Date', 'Animal ID', 'Activity', 'Result', 'Status'],       rows: [['May 14','COW-101','Health Check','Normal','Done'],['May 13','COW-104','Insemination','Pending','Review']] },
  'Feed Audit':       { title: 'Feed Consumption Report',        cols: ['Date', 'Feed Type', 'Quantity', 'Cost', 'Remarks'],        rows: [['May 14','Green Fodder','120 kg','₹2,400','Normal'],['May 13','Concentrate','45 kg','₹1,800','Stock Low']] },
}
const types   = [{ name:'Milk Yield',icon:Droplets },{ name:'Health Summary',icon:HeartPulse },{ name:'Financial Log',icon:Wallet },{ name:'Breeding Records',icon:Heart },{ name:'Feed Audit',icon:Activity }]
const periods = ['Last 7 Days','Last 30 Days','Last 3 Months','Last 6 Months','This Year']
const groups  = ['Individual Animal ID','Herd','Date','Category']

export default function ReportsManagement() {
  const [type, setType]       = useState('Milk Yield')
  const [period, setPeriod]   = useState('Last 30 Days')
  const [group, setGroup]     = useState('Individual Animal ID')
  const [search, setSearch]   = useState('')
  const [history, setHistory] = useState(['Monthly Production - April','Health Summary - Q1','Revenue Breakdown'])

  const report  = data[type]
  const rows    = report.rows.filter(r => r.join(' ').toLowerCase().includes(search.toLowerCase()))
  const statusIdx = report.cols.findIndex(c => /status|remark|anomal|result/i.test(c))
  const uniqueIdx = report.cols.findIndex(c => /animal id|animal/i.test(c))
  const unique  = new Set(rows.map(r => r[uniqueIdx >= 0 ? uniqueIdx : 1])).size
  const alerts  = rows.filter(r => /ongoing|pending|alert|low|review|recovering/i.test(r[statusIdx] ?? '')).length
  const summary = type === 'Health Summary'
    ? [{ title:'Animals Checked', value:unique, icon:Milk },{ title:'Total Checkups', value:rows.length, icon:Heart },{ title:'Ongoing Treatments', value:alerts, icon:AlertTriangle }]
    : [{ title:'Total Records', value:rows.length, icon:FileText },{ title:'Unique Entries', value:unique, icon:Activity },{ title:'Pending / Alerts', value:alerts, icon:AlertTriangle }]

  const downloadCSV = () => {
    const csv = [report.cols.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv],{ type:'text/csv' })), download:`${type.replaceAll(' ','_')}.csv` })
    a.click(); URL.revokeObjectURL(a.href)
  }
  const exportPDF = () => { setHistory(h => [report.title,...h].slice(0,5)); window.print() }

  // Shared table — screen preview (plain) and PDF (tiny=true, with serial no. + striped rows)
  const Tbl = ({ tiny }) => (
    <table style={{ width:'100%', borderCollapse:'collapse', fontSize: tiny ? 10 : 12, textAlign:'left' }}>
      <thead style={{ background: tiny ? '#1b6028' : '#faf9f6', color: tiny ? '#fff' : 'inherit' }}>
        <tr>
          {tiny && <th style={{ padding:'6px 8px' }}>Sr.</th>}
          {report.cols.map(c => <th key={c} style={{ padding:'6px 8px', borderBottom:'1px solid #d7e7d5' }}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r,i) => (
          <tr key={i} style={{ background: tiny ? (i%2 ? '#f5faf2' : '#fff') : 'transparent', pageBreakInside:'avoid', breakInside:'avoid' }}>
            {tiny && <td style={{ padding:'6px 8px', borderBottom:'1px solid #d7e7d5' }}>{i+1}</td>}
            {r.map((v,j) => <td key={j} style={{ padding:'6px 8px', borderBottom:'1px solid #d7e7d5' }}>{v}</td>)}
          </tr>
        ))}
        {!rows.length && <tr><td colSpan={report.cols.length+(tiny?1:0)} style={{ padding:24, textAlign:'center' }}>No records found.</td></tr>}
      </tbody>
      {tiny && (
        <tfoot>
          <tr style={{ background:'#f0f7e9', fontWeight:'bold', color:'#1b6028', borderTop:'2px solid #1b6028' }}>
            <td colSpan={report.cols.length} style={{ padding:'6px 8px', textAlign:'center' }}>TOTAL</td>
            <td style={{ padding:'6px 8px' }}>{rows.length} Records</td>
          </tr>
        </tfoot>
      )}
    </table>
  )

  return (
    <main className="min-h-screen bg-[#faf9f6] text-slate-800">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          .no-print { display: none !important; }
          .pdf-report { display: block !important; }
          main { min-height: 0 !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .pdf-report { display: none; }
      `}</style>

      {/* ── SCREEN UI ── */}
      <div className="no-print">
        <header className="flex flex-wrap justify-between gap-4 border-b bg-white p-5">
          <h1 className="text-xl font-bold">Report Generation & Analytics</h1>
          <div className="flex items-center gap-2 rounded-lg border px-3">
            <Search size={16}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="w-40 py-2 text-sm outline-none"/>
          </div>
        </header>

        <div className="space-y-6 p-5 md:p-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold">Select Report Type</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {types.map(({ name, icon: Icon }) => (
                <button key={name} type="button" onClick={() => { setType(name); setSearch('') }}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${type===name ? 'bg-[#2d6b52] text-white' : 'bg-white hover:border-emerald-500'}`}>
                  <Icon size={17}/> {name}
                </button>
              ))}
            </div>
          </section>

          <div className="grid items-start gap-5 lg:grid-cols-[0.8fr_1.5fr]">
            <aside className="space-y-4 rounded-2xl border bg-white p-5">
              <h2 className="font-bold">Filter Variables</h2>
              <label className="block text-sm">Time Frame</label>
              <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full rounded-lg border p-3 text-sm">{periods.map(x => <option key={x}>{x}</option>)}</select>
              <label className="block text-sm">Group By</label>
              <select value={group} onChange={e => setGroup(e.target.value)} className="w-full rounded-lg border p-3 text-sm">{groups.map(x => <option key={x}>{x}</option>)}</select>
              <hr/>
              <h3 className="font-semibold">Recent Downloads</h3>
              {history.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <FileText size={15} className="text-emerald-700"/>
                  <span className="flex-1">{item}</span>
                  <button type="button" onClick={downloadCSV}><Download size={15}/></button>
                </div>
              ))}
            </aside>

            <section className="min-w-0 rounded-2xl border bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold">PREVIEW: {report.title}</h2>
                  <p className="mt-1 text-xs text-slate-400">{period} · Group by {group}</p>
                </div>
                <button type="button" onClick={exportPDF} className="rounded-lg border border-emerald-700 px-4 py-2 text-sm text-emerald-800">Export PDF</button>
              </div>
              <div className="mt-5 overflow-x-auto rounded-lg border"><Tbl/></div>
              <p className="mt-3 text-xs text-slate-400">Showing {rows.length} records</p>
              <button type="button" onClick={downloadCSV} className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white">Download CSV</button>
            </section>
          </div>
        </div>
      </div>

      {/* ── PDF LAYOUT — hidden on screen, visible on print only ── */}
      <div className="pdf-report" style={{ background:'white', color:'#243126', padding:20, maxWidth:1100, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'5px solid #1b6028', paddingBottom:16, marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ background:'#1b6028', borderRadius:12, padding:12, color:'white', display:'flex' }}><Milk size={36}/></div>
            <div>
              <div style={{ fontSize:18, fontWeight:800, color:'#1b6028' }}>DAIRY MANAGEMENT SYSTEM</div>
              <div style={{ fontSize:10, color:'#6b7280' }}>Smart dairy operations • Milk collection • Billing</div>
            </div>
          </div>
          <div style={{ textAlign:'right', fontSize:11 }}>
            <div style={{ color:'#6b7280', fontSize:10 }}>REPORT DATE</div>
            <b>{new Date().toLocaleDateString('en-GB')}</b>
            <div style={{ color:'#6b7280', fontSize:10, marginTop:6 }}>GENERATED BY</div>
            <b>Rahul Patil</b>
          </div>
        </div>

        {/* Report title bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f0f7e9', borderLeft:'8px solid #1b6028', borderRadius:6, padding:12, marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ background:'#1b6028', borderRadius:'50%', padding:8, color:'white', display:'flex' }}><HeartPulse size={22}/></div>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:'#1b6028' }}>{report.title.toUpperCase()}</div>
              <div style={{ fontSize:10, color:'#6b7280' }}>Dairy farm generated report</div>
            </div>
          </div>
          <div style={{ border:'1px solid #86efac', borderRadius:20, padding:'4px 12px', fontSize:10, fontWeight:700, color:'#1b6028', background:'white', display:'flex', alignItems:'center', gap:4 }}>
            <CalendarDays size={12}/> {period}
          </div>
        </div>

        {/* Farmer details */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', border:'1px solid #d7e7d5', borderRadius:6, padding:'8px 0', marginBottom:20 }}>
          {[['FARMER NAME','Rahul Patil'],['FARMER ID','F-1024'],['VILLAGE','Shirur']].map(([label,value],i,arr) => (
            <div key={label} style={{ padding:'4px 12px', borderRight: i<arr.length-1 ? '1px solid #d7e7d5' : 'none' }}>
              <div style={{ fontSize:9, color:'#6b7280' }}>{label}</div>
              <div style={{ fontSize:12, fontWeight:700 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Data table */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <span style={{ fontSize:11, fontWeight:800, color:'#1b6028' }}>REPORT DETAILS</span>
          <div style={{ flex:1, height:2, background:'#d7e7d5' }}/>
        </div>
        <Tbl tiny/>

        {/* Summary */}
        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0 12px' }}>
          <span style={{ fontSize:11, fontWeight:800, color:'#1b6028' }}>SUMMARY</span>
          <div style={{ flex:1, height:2, background:'#d7e7d5' }}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          {summary.map(({ title, value, icon }, i) => (
            <div key={title} style={{ border:`1px solid ${i===2?'#1b6028':'#d7e7d5'}`, background: i===2?'#1b6028':'white', color: i===2?'white':'inherit', borderRadius:10, padding:10 }}>
              <StatCard title={title} value={value} icon={icon}/>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign:'center', fontSize:10, color:'#6b7280', marginTop:20 }}>This is a system-generated report and is valid without a physical stamp.</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', borderTop:'1px solid #d7e7d5', marginTop:16, paddingTop:12, fontSize:11 }}>
          <span>● Generated by <b>Rahul Patil</b></span>
          <div style={{ textAlign:'center', borderTop:'1px solid #9ca3af', width:140, paddingTop:6 }}>Authorized Signature</div>
          <span>Page <b>1</b></span>
        </div>
        <div style={{ background:'#1b6028', color:'white', textAlign:'center', fontSize:11, padding:'8px 12px', borderRadius:6, marginTop:16 }}>
          Thank you for using Dairy Management System.
        </div>
      </div>
    </main>
  )
}
