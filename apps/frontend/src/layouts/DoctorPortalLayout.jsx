// src/layouts/DoctorPortalLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import VeterinarySidebar from '../modules/doctor-requests/components/VeterinarySidebar.jsx';
import LabInfoModal from '../modules/doctor-requests/components/LabInfoModal.jsx';

export default function DoctorPortalLayout() {
  const [activeLabModal, setActiveLabModal] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fcfcfb] flex font-sans antialiased text-gray-900 selection:bg-[#ddf2e2] selection:text-[#1b6b3e]">
      {/* Desktop Left Sidebar matching screenshot */}
      <VeterinarySidebar
        className="hidden md:flex"
        activeLabModal={activeLabModal}
        setActiveLabModal={setActiveLabModal}
      />

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
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

      {/* Main Doctor Portal Content Area */}
      <div className="flex-1 min-w-0">
        <Outlet
          context={{
            onToggleMobileSidebar: () => setMobileSidebarOpen((prev) => !prev),
            setActiveLabModal,
          }}
        />
      </div>

      {/* Active Lab Modal */}
      {activeLabModal && (
        <LabInfoModal
          lab={activeLabModal}
          onClose={() => setActiveLabModal(null)}
        />
      )}
    </div>
  );
}
