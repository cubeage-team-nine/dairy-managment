// src/modules/doctor-requests/components/RequestsTable.jsx
import React from 'react';
import {
  CheckCircle,
  XCircle,
  Eye,
  FileCheck,
  Stethoscope,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  PRIORITY_STYLES,
  REQUEST_STATUS,
} from '../doctor-requests.constants.js';

export default function RequestsTable({
  requests,
  currentStatus,
  onAccept,
  onDecline,
  onRowClick,
  onResolve,
}) {
  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#1b6b3e] flex items-center justify-center mx-auto mb-3">
          <Stethoscope className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">
          No Requests Found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          There are no queue items matching your active search query or filter
          criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100/90 shadow-sm overflow-hidden transition-all">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Table Header Row */}
          <thead>
            <tr className="border-b border-gray-100 bg-[#fdfdfc]">
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Request ID
              </th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Farmer / Farm
              </th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Animal ID
              </th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Issue Description
              </th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                Priority
              </th>
              <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body Rows */}
          <tbody className="divide-y divide-gray-100 text-sm">
            {requests.map((req) => {
              const priority = PRIORITY_STYLES[req.priority] || PRIORITY_STYLES.NORMAL;

              return (
                <tr
                  key={req.id}
                  onClick={() => onRowClick && onRowClick(req)}
                  className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                >
                  {/* REQUEST ID */}
                  <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap text-sm">
                    {req.id}
                  </td>

                  {/* FARMER / FARM */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-sm">
                        {req.farmerName}
                      </span>
                      <span className="text-xs text-gray-500 font-medium mt-0.5">
                        {req.farmName}
                      </span>
                    </div>
                  </td>

                  {/* ANIMAL ID */}
                  <td className="py-4 px-6 text-gray-800 font-medium whitespace-nowrap text-sm">
                    {req.animalId}
                  </td>

                  {/* ISSUE DESCRIPTION */}
                  <td className="py-4 px-6 text-gray-700 text-sm max-w-xs md:max-w-md truncate">
                    <span title={req.issueDescription}>
                      {req.issueDescription}
                    </span>
                  </td>

                  {/* PRIORITY BADGE */}
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-bold rounded-md tracking-wider border ${priority.bg} ${priority.text} ${priority.border}`}
                    >
                      {priority.label}
                    </span>
                  </td>

                  {/* ACTION BUTTONS */}
                  <td
                    className="py-4 px-6 text-center whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {req.status === REQUEST_STATUS.NEW && (
                      <div className="flex items-center justify-center gap-2">
                        {/* Accept Button */}
                        <button
                          type="button"
                          onClick={() => onAccept(req)}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-[#1a4d2e] hover:bg-[#143d24] active:scale-95 rounded-lg shadow-xs transition-all cursor-pointer"
                        >
                          Accept
                        </button>

                        {/* Decline Button */}
                        <button
                          type="button"
                          onClick={() => onDecline(req)}
                          className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 active:scale-95 border border-gray-300 rounded-lg transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {req.status === REQUEST_STATUS.IN_PROGRESS && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onResolve(req)}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1a4d2e] hover:bg-[#143d24] active:scale-95 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Resolve
                        </button>

                        <button
                          type="button"
                          onClick={() => onRowClick(req)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all"
                        >
                          Details
                        </button>
                      </div>
                    )}

                    {req.status === REQUEST_STATUS.COMPLETED && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onRowClick(req)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all flex items-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          Summary
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
