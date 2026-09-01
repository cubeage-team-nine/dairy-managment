import React, { useState } from 'react';

function BreedingRecordsPage() {
  const [records, setRecords] = useState([
    { id: 1, tag: '#COW-4091', name: 'Lakshmi', breedingDate: '2025-11-15', serviceType: 'Artificial Insemination', sire: 'Holstein-A12', status: 'Confirmed Pregnant', dueDate: '2026-08-22', technician: 'Dr. Sharma' },
    { id: 2, tag: '#COW-4092', name: 'Gauri', breedingDate: '2026-01-10', serviceType: 'Artificial Insemination', sire: 'Jersey-J88', status: 'Pending Check', dueDate: '2026-10-17', technician: 'Dr. Sharma' },
    { id: 3, tag: '#COW-4093', name: 'Champa', breedingDate: '2025-05-04', serviceType: 'Natural Breeding', sire: 'Bull-B01', status: 'Calved', dueDate: '2026-02-10', technician: 'Farm Staff' },
    { id: 4, tag: '#COW-4094', name: 'Radha', breedingDate: '2026-02-18', serviceType: 'Artificial Insemination', sire: 'Sahiwal-S04', status: 'In Heat', dueDate: '2026-11-25', technician: 'Dr. Patil' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = Add Mode, number = Edit Mode
  const [formData, setFormData] = useState({
    tag: '',
    name: '',
    breedingDate: new Date().toISOString().split('T')[0],
    serviceType: 'Artificial Insemination',
    sire: '',
    status: 'In Heat',
    dueDate: '',
    technician: '',
  });

  // Calculate Gestation Due Date (283 days)
  const calculateDueDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setDate(date.getDate() + 283);
    return date.toISOString().split('T')[0];
  };

  // Open Modal for Creating New Record
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      tag: '',
      name: '',
      breedingDate: new Date().toISOString().split('T')[0],
      serviceType: 'Artificial Insemination',
      sire: '',
      status: 'In Heat',
      dueDate: calculateDueDate(new Date().toISOString().split('T')[0]),
      technician: '',
    });
    setIsModalOpen(true);
  };

  // Open Modal for Editing Existing Record
  const handleOpenEditModal = (record) => {
    setEditingId(record.id);
    setFormData({ ...record });
    setIsModalOpen(true);
  };

  // Handle Input Changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'breedingDate') {
      setFormData((prev) => ({
        ...prev,
        breedingDate: value,
        dueDate: calculateDueDate(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Save Record (Handles both Create and Update)
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      // UPDATE Existing Record
      setRecords((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...formData, dueDate: formData.dueDate || calculateDueDate(formData.breedingDate) }
            : item
        )
      );
    } else {
      // CREATE New Record
      const newRecord = {
        id: Date.now(),
        ...formData,
        dueDate: formData.dueDate || calculateDueDate(formData.breedingDate),
      };
      setRecords([newRecord, ...records]);
    }

    setIsModalOpen(false);
  };

  // Inline Status Change Handler
  const handleStatusChange = (id, newStatus) => {
    setRecords(records.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  // Delete Handler
  const handleDelete = (id) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  // KPI Calculations
  const totalPregnant = records.filter((r) => r.status === 'Confirmed Pregnant').length;
  const pendingChecks = records.filter((r) => r.status === 'Pending Check').length;
  const inHeat = records.filter((r) => r.status === 'In Heat').length;

  // Filtered List for Table
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed Pregnant': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Pending Check': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'In Heat': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Calved': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] p-6 md:p-10 space-y-8 font-sans text-slate-800">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Breeding Records</h1>
          <p className="text-sm text-slate-500">Track inseminations, pregnancy diagnoses, and expected calving dates.</p>
        </div>

        <input
          type="text"
          placeholder="Search cow tag or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 bg-slate-100/80 border-none rounded-lg px-4 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#235339]/20"
        />
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">Confirmed Pregnant</span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#235339] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-4xl font-extrabold text-slate-900">{totalPregnant}</div>
            <div className="text-xs font-semibold text-[#235339]">Active Gestation</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">Pending PD Checks</span>
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-4xl font-extrabold text-slate-900">{pendingChecks}</div>
            <div className="text-xs font-semibold text-amber-700">Due for ultrasound / palpation</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-slate-500">Active Heat Observations</span>
            <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="text-4xl font-extrabold text-slate-900">{inHeat}</div>
            <div className="text-xs font-semibold text-purple-700">Ready for insemination</div>
          </div>
        </div>
      </section>

      {/* Actions and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {['All', 'Confirmed Pregnant', 'Pending Check', 'In Heat', 'Calved'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-[#235339] hover:bg-[#1a3f2b] text-white font-medium px-5 py-2.5 rounded-full transition-colors shadow-sm text-sm"
        >
          + Log Breeding Event
        </button>
      </div>

      {/* Data Table */}
      <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-[11px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Herd Tag</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Breeding Date</th>
                <th className="px-6 py-4">Service Type</th>
                <th className="px-6 py-4">Sire / Bull</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expected Due Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{row.tag}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{row.name}</td>
                  <td className="px-6 py-4 text-slate-600">{row.breedingDate}</td>
                  <td className="px-6 py-4 text-slate-600">{row.serviceType}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{row.sire}</td>
                  <td className="px-6 py-4">
                    <select
                      value={row.status}
                      onChange={(e) => handleStatusChange(row.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusBadge(
                        row.status
                      )} focus:outline-none`}
                    >
                      <option value="In Heat">In Heat</option>
                      <option value="Pending Check">Pending Check</option>
                      <option value="Confirmed Pregnant">Confirmed Pregnant</option>
                      <option value="Calved">Calved</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#235339]">{row.dueDate}</td>
                  <td className="px-6 py-4 text-center space-x-3">
                    {/* Update / Edit Button */}
                    <button
                      onClick={() => handleOpenEditModal(row)}
                      className="text-[#235339] hover:text-[#1a3f2b] text-xs font-bold underline"
                    >
                      Update
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dynamic Modal (Create & Update) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Update Breeding Record' : 'Log Breeding Event'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Herd Tag</label>
                  <input
                    type="text"
                    name="tag"
                    required
                    placeholder="#COW-4095"
                    value={formData.tag}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#235339]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Animal Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Sundari"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#235339]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Breeding Date</label>
                  <input
                    type="date"
                    name="breedingDate"
                    required
                    value={formData.breedingDate}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#235339]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Service Type</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#235339]/30"
                  >
                    <option value="Artificial Insemination">Artificial Insemination</option>
                    <option value="Natural Breeding">Natural Breeding</option>
                    <option value="Embryo Transfer">Embryo Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Sire / Bull Code</label>
                  <input
                    type="text"
                    name="sire"
                    required
                    placeholder="Holstein-A12"
                    value={formData.sire}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#235339]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#235339]/30"
                  >
                    <option value="In Heat">In Heat</option>
                    <option value="Pending Check">Pending Check</option>
                    <option value="Confirmed Pregnant">Confirmed Pregnant</option>
                    <option value="Calved">Calved</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Technician / Inseminator</label>
                  <input
                    type="text"
                    name="technician"
                    placeholder="Dr. Sharma"
                    value={formData.technician}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#235339]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Expected Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate || calculateDueDate(formData.breedingDate)}
                    onChange={handleFormChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#235339]/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#235339] hover:bg-[#1a3f2b] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  {editingId ? 'Save Changes' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BreedingRecordsPage;