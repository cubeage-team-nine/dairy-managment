import { useState } from 'react'
import { Droplets, ClipboardList, Trophy } from 'lucide-react'
import StatCard from '../../../components/common/StatCard'

const initial = [
  { id: 1, tag: '#COW-4091', name: 'Lakshmi', morning: 15.2, evening: 14.2, fat: 4.2, snf: 8.8, breed: 'Jersey Purebred' },
  { id: 2, tag: '#COW-4092', name: 'Gauri', morning: 16.5, evening: 15.6, fat: 4, snf: 8.6, breed: 'Holstein Friesian' },
  { id: 3, tag: '#COW-4093', name: 'Champa', morning: 12, evening: 11.5, fat: 4.5, snf: 9, breed: 'Gir Cross' },
  { id: 4, tag: '#COW-4094', name: 'Radha', morning: 7, evening: 7.2, fat: 3.8, snf: 8.2, breed: 'Sahiwal' }
]

const input = 'rounded border bg-slate-50 px-2 py-1 outline-none focus:ring-1 focus:ring-green-700'

function MilkLoggingPage() {
  const [records, setRecords] = useState(initial)
  const [search, setSearch] = useState('')

  const update = (id, key, value) => {
    setRecords(old =>
      old.map(r =>
        r.id === id
          ? { ...r, [key]: key === 'name' ? value : value === '' ? '' : Number(value) }
          : r
      )
    )
  }

  const add = () => {
    setRecords(old => [
      ...old,
      {
        id: Date.now(),
        tag: `#COW-${4091 + old.length}`,
        name: `Cow ${old.length + 1}`,
        morning: 0,
        evening: 0,
        fat: 4,
        snf: 8.5,
        breed: 'Jersey Purebred'
      }
    ])
  }

  const total = records.reduce(
    (sum, r) => sum + (+r.morning || 0) + (+r.evening || 0), 0
  )

  const champion = records.length
    ? records.reduce((a, b) =>
        (+b.morning + +b.evening) > (+a.morning + +a.evening) ? b : a
      )
    : null

  const filtered = records.filter(r =>
    `${r.name} ${r.tag}`.toLowerCase().includes(search.toLowerCase())
  )

  const cards = [
    ['Total Collected Today', `${total.toFixed(1)} L`, 'Target: 180 L', Droplets],
    ['Average Yield/Cow', `${(total / (records.length || 1)).toFixed(1)} L`, 'Optimal lactation curve', ClipboardList],
    ["Today's Champion", champion?.name || 'N/A', champion?.breed || 'No data', Trophy]
  ]

  return (
    <div className="min-h-screen space-y-6 bg-[#fbfbfa] p-6 text-slate-800">

      {/* Header */}
      <header className="flex flex-wrap justify-between gap-4 border-b pb-4">
        <h1 className="text-2xl font-bold">Milk Recording Logging</h1>

        <input
          placeholder="Search animals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm"
        />
      </header>

      {/* Dynamic Stat Cards */}
      <section className="grid gap-5 md:grid-cols-3">
        {cards.map(([title, value, subtitle, icon]) => (
          <StatCard
            key={title}
            title={title}
            value={value}
            subtitle={subtitle}
            icon={icon}
          />
        ))}
      </section>

      {/* Date and Actions */}
      <div className="flex flex-wrap justify-between gap-3 rounded-xl border bg-white p-4">
        <span className="text-sm">
          Date: {new Date().toLocaleDateString()}
        </span>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={add}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            + Add Animal
          </button>

          <button
            type="button"
            onClick={() => alert('Milk records saved!')}
            className="rounded-lg bg-[#235339] px-5 py-2 text-sm text-white"
          >
            Save Milk Records
          </button>
        </div>
      </div>

      {/* Milk Records Table */}
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {['Herd Tag', 'Name', 'Morning (L)', 'Evening (L)', 'Total Yield', 'Fat %', 'SNF %', 'Actions'].map(h => (
                <th key={h} className="px-5 py-4">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">

                <td className="px-5 py-4 font-bold">{r.tag}</td>

                {['name', 'morning', 'evening'].map(k => (
                  <td key={k} className="px-5 py-4">
                    <input
                      type={k === 'name' ? 'text' : 'number'}
                      step="0.1"
                      value={r[k]}
                      onChange={e => update(r.id, k, e.target.value)}
                      className={`${input} ${k === 'name' ? 'w-28' : 'w-20'}`}
                    />
                  </td>
                ))}

                <td className="px-5 py-4 font-bold text-green-700">
                  {((+r.morning || 0) + (+r.evening || 0)).toFixed(1)} L
                </td>

                {['fat', 'snf'].map(k => (
                  <td key={k} className="px-5 py-4">
                    <input
                      type="number"
                      step="0.1"
                      value={r[k]}
                      onChange={e => update(r.id, k, e.target.value)}
                      className={`${input} w-16`}
                    />
                  </td>
                ))}

                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setRecords(old => old.filter(x => x.id !== r.id))}
                    className="text-xs font-semibold text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <p className="p-6 text-center text-gray-500">
            No records found
          </p>
        )}
      </div>
    </div>
  )
}

export default MilkLoggingPage