// src/modules/doctor-requests/components/LabInfoModal.jsx
import React from 'react';
import { X, Activity, Phone, MapPin, CheckCircle, Clock } from 'lucide-react';

export default function LabInfoModal({ lab, onClose }) {
  if (!lab) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#f9fafb]">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full shrink-0 animate-pulse"
              style={{ backgroundColor: lab.statusColor }}
            />
            <h3 className="font-extrabold text-sm text-gray-900 truncate">
              {lab.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle className="w-4 h-4" />
              <span className="font-bold">Portal Direct Integrated</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              {lab.turnaround}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-gray-900 block">Facility Location</strong>
                {lab.location}
              </span>
            </div>

            <div className="flex items-start gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-gray-900 block">Direct Hotline</strong>
                {lab.phone}
              </span>
            </div>

            <div className="flex items-start gap-2 text-gray-600">
              <Activity className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-gray-900 block">Diagnostic Capabilities</strong>
                {lab.testsAvailable}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
