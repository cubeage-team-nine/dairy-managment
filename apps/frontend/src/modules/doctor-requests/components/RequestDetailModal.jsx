// src/modules/doctor-requests/components/RequestDetailModal.jsx
import React from 'react';
import {
  X,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileCheck,
  Activity,
  Heart,
  Stethoscope,
} from 'lucide-react';
import { PRIORITY_STYLES, REQUEST_STATUS } from '../doctor-requests.constants.js';

export default function RequestDetailModal({
  request,
  onClose,
  onAccept,
  onDecline,
  onResolve,
}) {
  if (!request) return null;

  const priorityStyle = PRIORITY_STYLES[request.priority] || PRIORITY_STYLES.NORMAL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#fbfbfa]">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-gray-900 tracking-tight">
              {request.id}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-md border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
            >
              {request.priority} PRIORITY
            </span>
            <span className="text-xs text-gray-500 font-medium">
              Reported {request.createdAt}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Issue Summary Card */}
          <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/70">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              Primary Issue
            </span>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              {request.issueDescription}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {request.detailedSymptoms}
            </p>
          </div>

          {/* Grid: Farmer & Animal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Farmer / Farm Info */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Farmer & Location
              </span>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-bold text-gray-900 block">
                    {request.farmerName}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 block">
                    {request.farmName}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <a
                    href={`tel:${request.farmerPhone}`}
                    className="hover:underline text-gray-800 font-medium"
                  >
                    {request.farmerPhone}
                  </a>
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span>{request.farmerLocation}</span>
                </div>
              </div>
            </div>

            {/* Animal Info */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Animal Profile
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Animal Tag / ID:</span>
                  <span className="font-bold text-gray-900">{request.animalId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Breed:</span>
                  <span className="font-semibold text-gray-800">{request.breed}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Age:</span>
                  <span className="font-semibold text-gray-800">{request.age}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Lactation Stage:</span>
                  <span className="font-semibold text-gray-800">{request.lactation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic & Lab Routing if applicable */}
          {request.suggestedLab && (
            <div className="bg-amber-50/50 rounded-xl p-3.5 border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Diagnostic Lab Linked: {request.suggestedLab}
                  </span>
                  <span className="text-[11px] text-gray-600">
                    Samples will be fast-tracked for rapid culture & PCR sensitivity.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Prescription & Outcome if completed */}
          {request.prescription && (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2 mb-1.5 text-[#1b6b3e]">
                <FileCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Administered Prescription & Outcome
                </span>
              </div>
              <p className="text-xs font-medium text-gray-800">
                {request.prescription}
              </p>
              {request.completedAt && (
                <span className="text-[11px] text-gray-500 mt-2 block">
                  Resolved on: {request.completedAt}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <a
            href={`tel:${request.farmerPhone}`}
            className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            Direct Call Farmer
          </a>

          <div className="flex items-center gap-2.5">
            {request.status === REQUEST_STATUS.NEW && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onDecline(request);
                    onClose();
                  }}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                >
                  Decline Case
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAccept(request);
                    onClose();
                  }}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#1a4d2e] hover:bg-[#143d24] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept & Assign Visit
                </button>
              </>
            )}

            {request.status === REQUEST_STATUS.IN_PROGRESS && (
              <button
                type="button"
                onClick={() => {
                  if (onResolve) onResolve(request);
                  onClose();
                }}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#1a4d2e] hover:bg-[#143d24] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Case Resolved
              </button>
            )}

            {request.status === REQUEST_STATUS.COMPLETED && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl transition-all"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
