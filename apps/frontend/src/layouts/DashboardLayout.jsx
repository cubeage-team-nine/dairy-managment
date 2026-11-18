import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import Breadcrumb from '../components/layout/Breadcrumb.jsx'



const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        sidebarOpen={mobileSidebarOpen}
        onToggleSidebar={() => setMobileSidebarOpen((open) => !open)}
      />

      <div className="relative flex min-w-0">
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onNavigate={() => setMobileSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1 p-4 pt-[10px] sm:p-6 sm:pt-[10px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout

