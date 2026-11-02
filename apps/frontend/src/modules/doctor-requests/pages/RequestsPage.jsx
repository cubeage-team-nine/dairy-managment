// src/modules/doctor-requests/pages/RequestsPage.jsx
import { useState, useMemo } from 'react';
import VeterinaryHeader from '../components/VeterinaryHeader.jsx';
import RequestsTable from '../components/RequestsTable.jsx';
import RequestDetailModal from '../components/RequestDetailModal.jsx';
import DeclineRequestModal from '../components/DeclineRequestModal.jsx';
import NewRequestModal from '../components/NewRequestModal.jsx';
import LabInfoModal from '../components/LabInfoModal.jsx';
import { INITIAL_REQUESTS, REQUEST_STATUS } from '../doctor-requests.constants.js';
import { Plus, Check, X } from 'lucide-react';

export default function RequestsPage() {
  const [requestsList, setRequestsList]           = useState(INITIAL_REQUESTS);
  const [activeTab, setActiveTab]                 = useState(REQUEST_STATUS.NEW);
  const [searchQuery, setSearchQuery]             = useState('');
  const [selectedRequest, setSelectedRequest]     = useState(null);
  const [declineModalRequest, setDeclineModalRequest] = useState(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [activeLabModal, setActiveLabModal]       = useState(null);
  const [toast, setToast]                         = useState(null);

  const counts = useMemo(() => ({
    [REQUEST_STATUS.NEW]:         requestsList.filter(r => r.status === REQUEST_STATUS.NEW).length,
    [REQUEST_STATUS.IN_PROGRESS]: requestsList.filter(r => r.status === REQUEST_STATUS.IN_PROGRESS).length,
    [REQUEST_STATUS.COMPLETED]:   requestsList.filter(r => r.status === REQUEST_STATUS.COMPLETED).length,
  }), [requestsList]);

  const filteredRequests = useMemo(() => requestsList.filter(req => {
    if (req.status !== activeTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      req.id.toLowerCase().includes(q) ||
      req.farmerName.toLowerCase().includes(q) ||
      req.farmName.toLowerCase().includes(q) ||
      req.animalId.toLowerCase().includes(q) ||
      req.issueDescription.toLowerCase().includes(q) ||
      req.priority.toLowerCase().includes(q) ||
      (req.suggestedLab && req.suggestedLab.toLowerCase().includes(q))
    );
  }), [requestsList, activeTab, searchQuery]);

  const showToast = (message, type = 'success', action = null) => {
    setToast({ message, type, action });
    setTimeout(() => setToast(prev => prev?.message === message ? null : prev), 4500);
  };

  const handleAccept = req => {
    setRequestsList(prev => prev.map(item =>
      item.id === req.id
        ? { ...item, status: REQUEST_STATUS.IN_PROGRESS, inProgressStage: 'Accepted & Assigned to Dr. Amit Patel' }
        : item
    ));
    showToast(`Request ${req.id} accepted and moved to In Progress.`);
  };

  const handleConfirmDecline = (requestId, { reason }) => {
    const declined = requestsList.find(r => r.id === requestId);
    setRequestsList(prev => prev.filter(item => item.id !== requestId));
    showToast(
      `Request ${requestId} declined (${reason.split('/')[0].trim()}).`,
      'info',
      { label: 'Undo', onClick: () => { if (declined) { setRequestsList(prev => [declined, ...prev]); showToast(`Request ${requestId} restored.`); } } }
    );
  };

  const handleResolve = req => {
    setRequestsList(prev => prev.map(item =>
      item.id === req.id
        ? { ...item, status: REQUEST_STATUS.COMPLETED, completedAt: 'Just now', prescription: item.prescription || 'Clinical examination completed; standard recovery protocol administered.' }
        : item
    ));
    showToast(`Case ${req.id} successfully marked as Resolved!`);
  };

  const handleAddRequest = newReq => {
    setRequestsList(prev => [newReq, ...prev]);
    setActiveTab(REQUEST_STATUS.NEW);
    showToast(`New request ${newReq.id} added to the live queue!`);
  };

  const tabBtn = (status, label) => (
    <button
      type="button"
      onClick={() => setActiveTab(status)}
      className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
        activeTab === status ? 'bg-[#1a4d2e] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label} ({counts[status]})
    </button>
  );

  return (
    <div className="flex min-h-full flex-col px-4 py-6 sm:px-6">
      {/* Header — search + notifications + on-duty badge */}
      <VeterinaryHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewRequestModal={() => setShowNewRequestModal(true)}
        onToggleMobileSidebar={() => {}}
      />

      {/* Status tabs + Manual Request button */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {tabBtn(REQUEST_STATUS.NEW,         'New Requests')}
          {tabBtn(REQUEST_STATUS.IN_PROGRESS, 'In Progress')}
          {tabBtn(REQUEST_STATUS.COMPLETED,   'Completed')}
        </div>
        <button
          type="button"
          onClick={() => setShowNewRequestModal(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-[#1b6b3e] shadow-sm transition-colors hover:bg-emerald-50"
        >
          <Plus className="h-4 w-4" /> Manual Request
        </button>
      </div>

      {/* Requests table */}
      <div className="flex-1">
        <RequestsTable
          requests={filteredRequests}
          currentStatus={activeTab}
          onAccept={handleAccept}
          onDecline={req => setDeclineModalRequest(req)}
          onRowClick={req => setSelectedRequest(req)}
          onResolve={handleResolve}
        />
      </div>

      {/* Modals */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAccept={handleAccept}
          onDecline={req => setDeclineModalRequest(req)}
          onResolve={handleResolve}
        />
      )}
      {declineModalRequest && (
        <DeclineRequestModal
          request={declineModalRequest}
          onClose={() => setDeclineModalRequest(null)}
          onConfirmDecline={handleConfirmDecline}
        />
      )}
      {showNewRequestModal && (
        <NewRequestModal
          onClose={() => setShowNewRequestModal(false)}
          onAddRequest={handleAddRequest}
        />
      )}
      {activeLabModal && (
        <LabInfoModal
          lab={activeLabModal}
          onClose={() => setActiveLabModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-xs text-white shadow-xl">
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toast.message}</span>
          {toast.action && (
            <button type="button" onClick={toast.action.onClick} className="ml-2 font-bold text-emerald-400 underline hover:text-emerald-300">
              {toast.action.label}
            </button>
          )}
          <button type="button" onClick={() => setToast(null)} className="ml-1 text-gray-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
