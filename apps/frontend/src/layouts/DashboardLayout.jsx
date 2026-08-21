import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar.jsx'
import Navbar from '../components/layout/Navbar.jsx'
import Breadcrumb from '../components/layout/Breadcrumb.jsx'



const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar/>

      <div className="flex">
        <Sidebar />

        <main className="flex-1 min-w-0 p-6 pt-[10px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout

