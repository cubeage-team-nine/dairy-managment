// src/modules/doctor-requests/components/NewRequestModal.jsx
import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import {
  PRIORITY_TYPES,
  REQUEST_STATUS,
  ACTIVE_LABS,
} from '../doctor-requests.constants.js';

export default function NewRequestModal({ onClose, onAddRequest }) {
  const [formData, setFormData] = useState({
    farmerName: '',
    farmName: '',
    farmerPhone: '',
    farmerLocation: '',
    animalId: '',
    breed: 'HF Cross',
    age: '3 Years',
    lactation: '2nd Lactation',
    issueDescription: '',
    detailedSymptoms: '',
    priority: PRIORITY_TYPES.NORMAL,
    suggestedLab: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.farmerName || !formData.animalId || !formData.issueDescription) {
      alert('Please fill out farmer name, animal ID, and issue description.');
      return;
    }

    const randomId = `REQ-${Math.floor(9015 + Math.random() * 900)}`;
    const newRequest = {
      ...formData,
      id: randomId,
      status: REQUEST_STATUS.NEW,
      createdAt: 'Just now',
      farmName: formData.farmName || `${formData.farmerName}'s Farm`,
      farmerPhone: formData.farmerPhone || '+91 98000 00000',
      farmerLocation: formData.farmerLocation || 'Local District Dairy Sector',
    };

    onAddRequest(newRequest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f9fafb]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#1a4d2e] text-white">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-gray-900">
              Log Emergency / Clinic Visit Request
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Farmer Full Name *
              </label>
              <input
                type="text"
                name="farmerName"
                value={formData.farmerName}
                onChange={handleChange}
                placeholder="e.g. Ramesh Patel"
                required
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b6b3e]/20 focus:border-[#1b6b3e] outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Farm / Dairy Co-op Name
              </label>
              <input
                type="text"
                name="farmName"
                value={formData.farmName}
                onChange={handleChange}
                placeholder="e.g. Somnath Organic Dairy"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b6b3e]/20 focus:border-[#1b6b3e] outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Animal ID / Tag *
              </label>
              <input
                type="text"
                name="animalId"
                value={formData.animalId}
                onChange={handleChange}
                placeholder="e.g. COW-5099 (HF)"
                required
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b6b3e]/20 focus:border-[#1b6b3e] outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Priority Urgency *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b6b3e]/20 focus:border-[#1b6b3e] outline-hidden font-bold"
              >
                <option value={PRIORITY_TYPES.URGENT}>URGENT (Immediate)</option>
                <option value={PRIORITY_TYPES.NORMAL}>NORMAL (Standard Visit)</option>
                <option value={PRIORITY_TYPES.LOW}>LOW (Routine / Scheduled)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Issue Description (Short) *
            </label>
            <input
              type="text"
              name="issueDescription"
              value={formData.issueDescription}
              onChange={handleChange}
              placeholder="e.g. Severe mastitis in right front quarter with fever"
              required
              className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b6b3e]/20 focus:border-[#1b6b3e] outline-hidden"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Clinical Symptoms & Observations
            </label>
            <textarea
              rows={2}
              name="detailedSymptoms"
              value={formData.detailedSymptoms}
              onChange={handleChange}
              placeholder="Temperature, milk consistency, appetite, duration of illness..."
              className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b6b3e]/20 focus:border-[#1b6b3e] outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Farmer Contact Phone
              </label>
              <input
                type="text"
                name="farmerPhone"
                value={formData.farmerPhone}
                onChange={handleChange}
                placeholder="+91 98XXX XXXXX"
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b6b3e]/20 focus:border-[#1b6b3e] outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Link Diagnostic Lab
              </label>
              <select
                name="suggestedLab"
                value={formData.suggestedLab}
                onChange={handleChange}
                className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1b6b3e]/20 focus:border-[#1b6b3e] outline-hidden"
              >
                <option value="">None (Doctor Evaluation First)</option>
                {ACTIVE_LABS.map((lab) => (
                  <option key={lab.id} value={lab.name}>
                    {lab.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#1a4d2e] hover:bg-[#143d24] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Add to Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
