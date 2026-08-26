// src/modules/doctor-requests/components/DeclineRequestModal.jsx
import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { DECLINE_REASONS } from '../doctor-requests.constants.js';

export default function DeclineRequestModal({ request, onClose, onConfirmDecline }) {
  const [selectedReason, setSelectedReason] = useState(DECLINE_REASONS[0]);
  const [customNote, setCustomNote] = useState('');

  if (!request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmDecline(request.id, {
      reason: selectedReason,
      note: customNote,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#fff5f5]">
          <div className="flex items-center gap-2.5 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-extrabold text-base text-gray-900">
              Decline Request {request.id}
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-600 mb-3">
              Declining will notify{' '}
              <strong className="text-gray-900">{request.farmerName}</strong> (
              {request.farmName}) and re-route the case to backup veterinarians in
              the zone.
            </p>

            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Select Primary Reason
            </label>
            <div className="space-y-2">
              {DECLINE_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? 'bg-rose-50/60 border-rose-300 text-rose-900 font-semibold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="declineReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Additional Remarks for Farmer (Optional)
            </label>
            <textarea
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Advised cold compress on udder and contact Dr. Sharma at +91 98..."
              className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden"
            />
          </div>

          {/* Footer Buttons */}
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
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Confirm Decline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
