import React, { useState } from 'react';

const DynamicMilkLoggingPage = () => {
  const [records, setRecords] = useState([
    { id: 1, tag: '#COW-4091', name: 'Lakshmi', breed: 'Jersey Purebred', morning: 15.2, evening: 14.2, fat: 4.2, snf: 8.8, quality: 'A-Grade' },
    { id: 2, tag: '#COW-4092', name: 'Gauri', breed: 'Holstein Friesian', morning: 16.5, evening: 15.6, fat: 4.0, snf: 8.6, quality: 'A-Grade' },
    { id: 3, tag: '#COW-4093', name: 'Champa', breed: 'Gir Cross', morning: 12.0, evening: 11.5, fat: 4.5, snf: 9.0, quality: 'Premium' },
    { id: 4, tag: '#COW-4094', name: 'Radha', breed: 'Sahiwal', morning: 7.0, evening: 7.2, fat: 3.8, snf: 8.2, quality: 'Standard' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // Update table row inputs dynamically
  const handleInputChange = (id, field, value) => {
    setRecords((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: value === '' ? '' : (field === 'name' ? value : parseFloat(value) || value) } : row
      )
    );
  };

  // Add a new animal row
  const handleAddRow = () => {
    const nextId = records.length + 1;
    const newRecord = {
      id: Date.now(),
      tag: `#COW-409${nextId}`,
      name: `Cow ${nextId}`,
      breed: 'Jersey Purebred',
      morning: 0,
      evening: 0,
      fat: 4.0,
      snf: 8.5,
      quality: 'Standard',
    };
    setRecords([...records, newRecord]);
  };

  // Delete an animal row
  const handleDeleteRow = (id) => {
    setRecords(records.filter((row) => row.id !== id));
  };

  // 1. Dynamic Metric: Total Collected Today
  const totalCollected = records.reduce(
    (sum, r) => sum + (Number(r.morning) || 0) + (Number(r.evening) || 0),
    0
  );

  // 2. Dynamic Metric: Average Yield / Cow
  const avgYield = records.length > 0 ? totalCollected / records.length : 0;

  // 3. Dynamic Metric: Today's Champion (Highest total yield)
  const champion = records.length > 0
    ? records.reduce((maxRow, current) => {
        const currentTotal = (Number(current.morning) || 0) + (Number(current.evening) || 0);
        const maxTotal = (Number(maxRow.morning) || 0) + (Number(maxRow.evening) || 0);
        return currentTotal > maxTotal ? current : maxRow;
      }, records[0])
    : null;

  const championYield = champion ? ((Number(champion.morning) || 0) + (Number(champion.evening) || 0)).toFixed(1) : '0';

  // Filtered list for search bar
  const filteredRecords = records.filter(
    (row) =>
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fbfbfa] p-6 md:p-10 space-y-8 font-sans text-slate-800">
      {/* Top Navigation */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Milk Recording Logging
        </h1>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search animals, tasks, guides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 bg-slate-100/80 border-none rounded-lg px-4 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#235339]/20"
          />
        </div>
      </header>

      {/* Fully Dynamic Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Collected Today */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm relative flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">Total Collected Today</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#235339] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-4xl font-extrabold text-slate-900">{totalCollected.toFixed(1)} L</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#235339]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
              Target: 180 L
            </div>
          </div>
        </div>

        {/* Card 2: Average Yield/Cow */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm relative flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">Average Yield/Cow</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#235339] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-4xl font-extrabold text-slate-900">{avgYield.toFixed(1)} L</div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#235339]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
              Optimal lactation curve
            </div>
          </div>
        </div>

        {/* Card 3: Today's Champion */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm relative flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">Today's Champion</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#235339] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-3xl font-extrabold text-slate-900">
              {champion ? `${champion.name} (${championYield}L)` : 'N/A'}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#235339]">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
              {champion ? champion.breed : 'No data'}
            </div>
          </div>
        </div>
      </section>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm text-sm font-medium text-slate-700 w-fit">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Date: 2026-03-24 (Today)
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddRow}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
          >
            + Add Animal
          </button>
          <button className="bg-[#235339] hover:bg-[#1a3f2b] text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-sm text-sm">
            Save Milk Records
          </button>
        </div>
      </div>

      {/* Dynamic Data Table */}
      <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Herd Tag</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Morning Milking (L)</th>
                <th className="px-6 py-4">Evening Milking (L)</th>
                <th className="px-6 py-4">Total Yield</th>
                <th className="px-6 py-4">Fat %</th>
                <th className="px-6 py-4">SNF %</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((row) => {
                const totalYield = (Number(row.morning) || 0) + (Number(row.evening) || 0);

                return (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{row.tag}</td>

                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => handleInputChange(row.id, 'name', e.target.value)}
                        className="w-28 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#235339]"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.1"
                        value={row.morning}
                        onChange={(e) => handleInputChange(row.id, 'morning', e.target.value)}
                        className="w-20 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#235339]"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.1"
                        value={row.evening}
                        onChange={(e) => handleInputChange(row.id, 'evening', e.target.value)}
                        className="w-20 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#235339]"
                      />
                    </td>

                    <td className="px-6 py-4 font-bold text-[#235339]">
                      {totalYield.toFixed(1)} L
                    </td>

                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.1"
                        value={row.fat}
                        onChange={(e) => handleInputChange(row.id, 'fat', e.target.value)}
                        className="w-16 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#235339]"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.1"
                        value={row.snf}
                        onChange={(e) => handleInputChange(row.id, 'snf', e.target.value)}
                        className="w-16 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#235339]"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DynamicMilkLoggingPage;