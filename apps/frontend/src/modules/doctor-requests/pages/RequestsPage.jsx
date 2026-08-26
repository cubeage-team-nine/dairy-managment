// src/modules/doctor-requests/pages/RequestsPage.jsx
import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import VeterinarySidebar from '../components/VeterinarySidebar.jsx';
import VeterinaryHeader from '../components/VeterinaryHeader.jsx';
import RequestsTable from '../components/RequestsTable.jsx';
import RequestDetailModal from '../components/RequestDetailModal.jsx';
import DeclineRequestModal from '../components/DeclineRequestModal.jsx';
import NewRequestModal from '../components/NewRequestModal.jsx';
import LabInfoModal from '../components/LabInfoModal.jsx';
import {
  INITIAL_REQUESTS,
  REQUEST_STATUS,
} from '../doctor-requests.constants.js';
import { Plus, Check, Undo2, X } from 'lucide-react';

export default function RequestsPage() {
  const outletContext = useOutletContext();
  const hasParentLayout = Boolean(outletContext);

  const [requestsList, setRequestsList] = useState(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState(REQUEST_STATUS.NEW);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [declineModalRequest, setDeclineModalRequest] = useState(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [activeLabModal, setActiveLabModal] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const counts = useMemo(() => {
    return {
      [REQUEST_STATUS.NEW]: requestsList.filter(
        (r) => r.status === REQUEST_STATUS.NEW
      ).length,
      [REQUEST_STATUS.IN_PROGRESS]: requestsList.filter(
        (r) => r.status === REQUEST_STATUS.IN_PROGRESS
      ).length,
      [REQUEST_STATUS.COMPLETED]: requestsList.filter(
        (r) => r.status === REQUEST_STATUS.COMPLETED
      ).length,
    };
  }, [requestsList]);

  const filteredRequests = useMemo(() => {
    return requestsList.filter((req) => {
      const matchesTab = req.status === activeTab;
      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        req.id.toLowerCase().includes(query) ||
        req.farmerName.toLowerCase().includes(query) ||
        req.farmName.toLowerCase().includes(query) ||
        req.animalId.toLowerCase().includes(query) ||
        req.issueDescription.toLowerCase().includes(query) ||
        req.priority.toLowerCase().includes(query) ||
        (req.suggestedLab && req.suggestedLab.toLowerCase().includes(query))
      );
    });
  }, [requestsList, activeTab, searchQuery]);

  const showToast = (message, type = 'success', action = null) => {
    setToast({ message, type, action });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const handleAccept = (req) => {
    setRequestsList((prev) =>
      prev.map((item) =>
        item.id === req.id
          ? {
              ...item,
              status: REQUEST_STATUS.IN_PROGRESS,
              inProgressStage: 'Accepted & Assigned to Dr. Amit Patel',
            }
          : item
      )
    );
    showToast(`Request ${req.id} accepted and moved to In Progress.`, 'success');
  };

  const handleConfirmDecline = (requestId, { reason, note }) => {
    const declinedItem = requestsList.find((r) => r.id === requestId);
    setRequestsList((prev) => prev.filter((item) => item.id !== requestId));

    showToast(
      `Request ${requestId} declined (${reason.split('/')[0].trim()}).`,
      'info',
      {
        label: 'Undo',
        onClick: () => {
          if (declinedItem) {
            setRequestsList((prev) => [declinedItem, ...prev]);
            showToast(`Request ${requestId} restored to queue.`, 'success');
          }
        },
      }
    );
  };

  const handleResolve = (req) => {
    setRequestsList((prev) =>
      prev.map((item) =>
        item.id === req.id
          ? {
              ...item,
              status: REQUEST_STATUS.COMPLETED,
              completedAt: 'Just now',
              prescription:
                item.prescription ||
                'Clinical examination completed; standard recovery protocol administered.',
            }
          : item
      )
    );
    showToast(`Case ${req.id} successfully marked as Resolved!`, 'success');
  };

  const handleAddRequest = (newReq) => {
    setRequestsList((prev) => [newReq, ...prev]);
    setActiveTab(REQUEST_STATUS.NEW);
    showToast(`New request ${newReq.id} added to the live queue!`, 'success');
  };

  const handleToggleSidebar = () => {
    if (outletContext?.onToggleMobileSidebar) {
      outletContext.onToggleMobileSidebar();
    } else {
      setMobileSidebarOpen((prev) => !prev);
    }
  };

  const content = (
    <div className="flex-1 flex flex-col min-w-0 px-4 sm:px-8 py-6 max-w-7xl">
      {/* Top Header */}
      <VeterinaryHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewRequestModal={() => setShowNewRequestModal(true)}
        onToggleMobileSidebar={handleToggleSidebar}
      />

      {/* Filter Tabs & Quick Action Bar matching screenshot */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        {/* Pill Tabs: New Requests (8) | In Progress (12) | Completed (24) */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab(REQUEST_STATUS.NEW)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === REQUEST_STATUS.NEW
                ? 'bg-[#1a4d2e] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            New Requests ({counts[REQUEST_STATUS.NEW]})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(REQUEST_STATUS.IN_PROGRESS)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === REQUEST_STATUS.IN_PROGRESS
                ? 'bg-[#1a4d2e] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            In Progress ({counts[REQUEST_STATUS.IN_PROGRESS]})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(REQUEST_STATUS.COMPLETED)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === REQUEST_STATUS.COMPLETED
                ? 'bg-[#1a4d2e] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Completed ({counts[REQUEST_STATUS.COMPLETED]})
          </button>
        </div>

        {/* Quick Create Manual Request Button */}
        <button
          type="button"
          onClick={() => setShowNewRequestModal(true)}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 text-[#1b6b3e] border border-emerald-200 font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Manual Request</span>
        </button>
      </div>

      {/* Requests Table */}
      <main className="flex-1">
        <RequestsTable
          requests={filteredRequests}
          currentStatus={activeTab}
          onAccept={handleAccept}
          onDecline={(req) => setDeclineModalRequest(req)}
          onRowClick={(req) => setSelectedRequest(req)}
          onResolve={handleResolve}
        />
      </main>

      {/* Modals */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAccept={handleAccept}
          onDecline={(req) => setDeclineModalRequest(req)}
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

      {/* Floating Action Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-800 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={toast.action.onClick}
              className="ml-2 font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              {toast.action.label}
            </button>
          )}
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-white ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );

  if (hasParentLayout) {
    return content;
  }

  return (
    <div className="min-h-screen bg-[#fcfcfb] flex font-sans antialiased text-gray-900 selection:bg-[#ddf2e2] selection:text-[#1b6b3e]">
      <VeterinarySidebar
        className="hidden md:flex"
        activeLabModal={activeLabModal}
        setActiveLabModal={setActiveLabModal}
      />

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <VeterinarySidebar
          setActiveLabModal={(lab) => {
            setActiveLabModal(lab);
            setMobileSidebarOpen(false);
          }}
        />
      </div>

      {content}
    </div>
  );
}
