import React, { useState } from 'react';
import {
  Search,
  Bell,
  Edit3,
  MapPin,
  X,
  Compass,
  Droplets,
  Sun,
  Plus,
  Upload,
  Copy,
  ShieldCheck,
  ZoomIn,
  TrendingUp,
  CheckCircle2,
  LayoutDashboard,
  Home,
  BookOpen,
  Milk,
  Wheat,
  Percent,
  Activity,
  AlertTriangle,
  FileText,
  CheckSquare,
  Wrench,
  Stethoscope,
  ShoppingBag,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronRight
} from 'lucide-react';

export default function FarmersPage() {
  // Farm Details State
  const [farmData, setFarmData] = useState({
    name: 'Kailash Dairy & Breeding Farm',
    location: 'Rohtak, Haryana, India',
    landArea: '12.5 Acres',
    farmType: 'Semi-Automated Commercial Dairy',
    regId: 'IN-HR-2026-F409',
    established: '2018',
    status: 'Operational',
  });

  // Modal & Sidebar & Interactive States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-farm');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...farmData });
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeMapFilter, setActiveMapFilter] = useState('all');
  const [selectedZone, setSelectedZone] = useState(null);

  // Notifications Mock Data
  const notifications = [
    { id: 1, text: 'Vaccination completed for Pasture B cattle', time: '10m ago', unread: true },
    { id: 2, text: 'Milking Parlour #2 automated cleaning done', time: '1h ago', unread: true },
    { id: 3, text: 'Soil moisture report updated for Zone 3', time: '3h ago', unread: false },
  ];

  // Gallery Photos Data
  const [gallery, setGallery] = useState([
    {
      id: 1,
      src: '/milking_parlour.jpg',
      title: 'Automated Milking Parlour',
      desc: 'High-efficiency 24-stall herringbone parlour equipped with electronic milk meters.',
      tag: 'Infrastructure',
      date: 'Aug 2026'
    },
    {
      id: 2,
      src: '/cows_pasture.jpg',
      title: 'Open Pasture Grazing Area',
      desc: 'Rotational clover pastures equipped with automated water troughs and shade shelters.',
      tag: 'Pasture Land',
      date: 'Aug 2026'
    }
  ]);

  // New photo state for upload modal
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Infrastructure');

  // Pasture Map Interactive Zones
  const pastureZones = [
    { id: 'zone-1', name: 'Pasture Zone A (North)', area: '4.2 Acres', status: 'Active Grazing', cows: 38, moisture: '78%', top: '25%', left: '35%', color: 'bg-emerald-500' },
    { id: 'zone-2', name: 'Pasture Zone B (South)', area: '3.8 Acres', status: 'Resting/Regrowth', cows: 0, moisture: '84%', top: '72%', left: '72%', color: 'bg-lime-500' },
    { id: 'zone-3', name: 'Solar Farm Array', area: '1.2 Acres', status: '98.5% Energy Yield', output: '45 kW', top: '56%', left: '46%', color: 'bg-amber-500' },
    { id: 'zone-4', name: 'Freshwater Retention Pond', area: '0.8 Acres', status: 'Capacity 92%', depth: '4.5 m', top: '58%', left: '55%', color: 'bg-sky-500' },
  ];

  // Handle Edit Form Submit
  const handleSaveDetails = (e) => {
    e.preventDefault();
    setFarmData({ ...editForm });
    setIsEditModalOpen(false);
  };

  // Handle Copy Registration ID
  const handleCopyRegId = () => {
    navigator.clipboard.writeText(farmData.regId);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Handle Add Photo
  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!newPhotoTitle) return;
    const newEntry = {
      id: Date.now(),
      src: '/cows_pasture.jpg',
      title: newPhotoTitle,
      desc: 'Recently added infrastructure facility gallery photo.',
      tag: newPhotoCategory,
      date: 'Just now'
    };
    setGallery([newEntry, ...gallery]);
    setNewPhotoTitle('');
    setIsUploadModalOpen(false);
  };

  // Navigation Items for Left Sidebar
  const navGroups = [
    {
      group: 'CORE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'my-farm', label: 'My Farm', icon: Home, active: true },
        { id: 'records', label: 'Farm Logbook', icon: BookOpen },
      ]
    },
    {
      group: 'OPERATIONS',
      items: [
        { id: 'milk-rec', label: 'Milk Recording', icon: Milk },
        { id: 'feed-mgmt', label: 'Feed Management', icon: Wheat },
        { id: 'herd-analytics', label: 'Breeding & Herd', icon: Percent },
        { id: 'vet-health', label: 'Health & Vet', icon: Activity },
        { id: 'alerts', label: 'Alerts & Logs', icon: AlertTriangle },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'tasks', label: 'Daily Tasks', icon: CheckSquare },
      ]
    },
    {
      group: 'SERVICES',
      items: [
        { id: 'equipment', label: 'Equipment', icon: Wrench },
        { id: 'vet-services', label: 'Vet Services', icon: Stethoscope },
        { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
      ]
    },
    {
      group: 'ACCOUNT',
      items: [
        { id: 'profile', label: 'Profile Setup', icon: User },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F5F0] text-stone-800 font-sans flex flex-col md:flex-row selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-5 right-5 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">Registration ID copied to clipboard!</span>
        </div>
      )}

      {/* MOBILE HEADER BAR */}
      <div className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
            SD
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 leading-none">Smart Dairy</h2>
            <span className="text-[9px] font-semibold text-emerald-700 tracking-wider">FARMER PLATFORM</span>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-stone-200/80 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-stone-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
              SD
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900 leading-tight tracking-tight">
                Smart Dairy
              </h2>
              <span className="text-[10px] uppercase font-extrabold text-emerald-600 tracking-widest block">
                FARMER PLATFORM
              </span>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.group}>
                <h4 className="px-3 text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-1.5">
                  {group.group}
                </h4>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#DDF4E4] text-[#1D6C3E] shadow-2xs font-bold'
                            : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#1D6C3E]' : 'text-stone-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#1D6C3E]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Logout Button */}
        <div className="pt-4 border-t border-stone-100">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 pb-16">
        
        {/* TOP NAVBAR / HEADER */}
        <header className="sticky top-0 z-30 bg-[#F6F5F0]/90 backdrop-blur-md border-b border-stone-200/60 px-4 sm:px-8 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Page Title */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
                My Farm
              </h1>
            </div>

            {/* Search Bar & User Profile */}
            <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto justify-end">
              
              {/* Search Input */}
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search animals, tasks, guides..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#EFECE6] border border-stone-300/60 rounded-full text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2.5 bg-stone-200/70 hover:bg-stone-300/80 rounded-full text-stone-700 transition-colors focus:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#F6F5F0]"></span>
                </button>

                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-stone-100 flex items-center justify-between">
                      <span className="font-bold text-sm text-stone-900">Notifications</span>
                      <span className="text-xs text-emerald-600 font-semibold cursor-pointer hover:underline">Mark all read</span>
                    </div>
                    <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
                      {notifications.map((item) => (
                        <div key={item.id} className="px-4 py-3 hover:bg-stone-50 transition cursor-pointer">
                          <p className="text-xs font-medium text-stone-800">{item.text}</p>
                          <span className="text-[10px] text-stone-400 mt-1 block">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
                    alt="Rajesh Kumar"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/80 group-hover:ring-emerald-600 transition"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="hidden sm:block">
                  <h4 className="text-sm font-bold text-stone-900 group-hover:text-emerald-700 transition leading-tight">
                    Rajesh Kumar
                  </h4>
                  <p className="text-[11px] text-stone-500 font-medium">Head Dairy Farmer</p>
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* CONTAINER BODY */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
          
          {/* Quick Stats Bar */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3.5 border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-700">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-semibold">Total Cattle</p>
                <p className="text-lg font-bold text-stone-900">142 Head</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-3.5 border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg text-blue-700">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-semibold">Daily Milk Output</p>
                <p className="text-lg font-bold text-stone-900">1,850 L</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3.5 border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-lg text-amber-700">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-semibold">Weather & Soil</p>
                <p className="text-lg font-bold text-stone-900">28°C / 78%</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3.5 border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 rounded-lg text-purple-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-semibold">Farm Health Index</p>
                <p className="text-lg font-bold text-emerald-600">98% Optimal</p>
              </div>
            </div>
          </div>

          {/* 2-COLUMN MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              {/* CARD 1: FARM DETAILS CARD */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
                
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                      {farmData.name}
                    </h2>
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-sm animate-pulse"
                      title="Active Registered Farm"
                    ></span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setEditForm({ ...farmData });
                      setIsEditModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#DDF4E4] hover:bg-[#CBEBD5] text-[#1D6C3E] rounded-xl font-semibold text-sm transition-all duration-200 shadow-2xs hover:scale-[1.02] active:scale-95 shrink-0"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Farm Details</span>
                  </button>
                </div>

                {/* Card Content Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  
                  <div>
                    <h4 className="text-[11px] uppercase font-bold text-stone-400 tracking-wider mb-1">
                      Location
                    </h4>
                    <p className="text-sm font-semibold text-stone-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      {farmData.location}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[11px] uppercase font-bold text-stone-400 tracking-wider mb-1">
                      Total Land Area
                    </h4>
                    <p className="text-sm font-semibold text-stone-800">
                      {farmData.landArea}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[11px] uppercase font-bold text-stone-400 tracking-wider mb-1">
                      Farm Type
                    </h4>
                    <p className="text-sm font-semibold text-stone-800">
                      {farmData.farmType}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[11px] uppercase font-bold text-stone-400 tracking-wider mb-1">
                      Registration ID
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                        {farmData.regId}
                      </span>
                      <button
                        onClick={handleCopyRegId}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition"
                        title="Copy Registration ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* CARD 2: FARM INFRASTRUCTURE PHOTO GALLERY */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs relative">
                
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                      Farm Infrastructure Photo Gallery
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5 font-medium">Visual inspection & facilities catalog</p>
                  </div>
                  
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Photo
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/60 shadow-2xs hover:shadow-md cursor-pointer transition-all duration-300 aspect-[4/3]"
                    >
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                      <div className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/40">
                        <ZoomIn className="w-4 h-4" />
                      </div>

                      <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                        <span className="inline-block px-2 py-0.5 bg-emerald-500/90 text-[10px] font-bold rounded-md uppercase tracking-wider mb-1">
                          {photo.tag}
                        </span>
                        <h4 className="text-sm font-bold text-white line-clamp-1 leading-snug">
                          {photo.title}
                        </h4>
                        <p className="text-[11px] text-stone-200/90 line-clamp-1 font-medium mt-0.5">
                          {photo.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: PASTURE MAPPING */}
            <div className="lg:col-span-5">
              
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs h-full flex flex-col justify-between hover:shadow-md transition-shadow">
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                      Pasture Mapping & Location
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5 font-medium">GIS Land Division & Infrastructure</p>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
                    <button
                      onClick={() => setActiveMapFilter('all')}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition ${activeMapFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveMapFilter('zones')}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition ${activeMapFilter === 'zones' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'}`}
                    >
                      Zones
                    </button>
                  </div>
                </div>

                {/* Map Graphic Container */}
                <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 bg-[#5ca832] group shadow-inner h-[500px] sm:h-[550px]">
                  
                  {/* Clean Vector SVG Pasture Map Graphic (Matching Figma 100%) */}
                  <svg className="w-full h-full" viewBox="0 0 400 550" preserveAspectRatio="none">
                    <defs>
                      <pattern id="field-grid-1" width="12" height="12" patternUnits="userSpaceOnUse">
                        <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#68b438" strokeWidth="0.8"/>
                      </pattern>
                      <pattern id="field-grid-2" width="16" height="16" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="16" y2="16" stroke="#4c9324" strokeWidth="0.8"/>
                      </pattern>
                      <pattern id="pivot-circle" width="30" height="30" patternUnits="userSpaceOnUse">
                        <circle cx="15" cy="15" r="12" fill="none" stroke="#71bf3e" strokeWidth="0.8"/>
                      </pattern>
                    </defs>

                    {/* Background Field Base */}
                    <rect width="400" height="550" fill="#58a32d" />

                    {/* Individual Pasture Plots with Vibrant HSL Greens & Dashed Boundary Lines */}
                    {/* Top Left Plot */}
                    <rect x="10" y="10" width="180" height="100" fill="#66b835" stroke="#1d4ed8" strokeWidth="1.5" strokeDasharray="3,3" />
                    {/* Top Right Plot */}
                    <rect x="200" y="10" width="190" height="130" fill="#559e2b" stroke="#1d4ed8" strokeWidth="1.5" strokeDasharray="3,3" />
                    
                    {/* Middle Left Field */}
                    <rect x="10" y="120" width="140" height="130" fill="url(#field-grid-1)" stroke="#1d4ed8" strokeWidth="1.5" />
                    
                    {/* Pivot Circular Pasture (Middle Right) */}
                    <rect x="160" y="150" width="230" height="110" fill="#61b230" stroke="#1d4ed8" strokeWidth="1.5" strokeDasharray="3,3" />
                    <circle cx="270" cy="205" r="42" fill="url(#pivot-circle)" stroke="#3f7c1d" strokeWidth="1" />

                    {/* Central Facility Area (Solar Array, Water Pond, Roads) */}
                    <g transform="translate(190, 270)">
                      {/* Facility Perimeter Base */}
                      <rect x="0" y="0" width="95" height="100" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" rx="4"/>
                      
                      {/* Solar Panels Grid */}
                      <rect x="8" y="8" width="40" height="55" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1"/>
                      <line x1="8" y1="22" x2="48" y2="22" stroke="#60a5fa" strokeWidth="0.8"/>
                      <line x1="8" y1="36" x2="48" y2="36" stroke="#60a5fa" strokeWidth="0.8"/>
                      <line x1="8" y1="50" x2="48" y2="50" stroke="#60a5fa" strokeWidth="0.8"/>
                      <line x1="28" y1="8" x2="28" y2="63" stroke="#60a5fa" strokeWidth="0.8"/>

                      {/* Water Retention Pond */}
                      <circle cx="70" cy="30" r="16" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5"/>
                      <circle cx="70" cy="30" r="10" fill="#0284c7" opacity="0.4"/>

                      {/* Barns / Garden Grid */}
                      <rect x="8" y="68" width="75" height="24" fill="#86efac" stroke="#16a34a" strokeWidth="1"/>
                      <line x1="25" y1="68" x2="25" y2="92" stroke="#16a34a" strokeWidth="0.8"/>
                      <line x1="45" y1="68" x2="45" y2="92" stroke="#16a34a" strokeWidth="0.8"/>
                      <line x1="65" y1="68" x2="65" y2="92" stroke="#16a34a" strokeWidth="0.8"/>
                    </g>

                    {/* Bottom Pasture Fields */}
                    <rect x="10" y="260" width="170" height="120" fill="url(#field-grid-2)" stroke="#1d4ed8" strokeWidth="1.5" />
                    <rect x="295" y="270" width="95" height="150" fill="#4d9025" stroke="#1d4ed8" strokeWidth="1.5" strokeDasharray="3,3" />

                    <rect x="10" y="390" width="270" height="70" fill="#67b935" stroke="#1d4ed8" strokeWidth="1.5" strokeDasharray="3,3" />
                    <rect x="290" y="430" width="100" height="110" fill="#58a12c" stroke="#1d4ed8" strokeWidth="1.5" />
                    
                    <circle cx="340" cy="485" r="30" fill="url(#pivot-circle)" stroke="#376d19" strokeWidth="1" />

                    <rect x="10" y="470" width="270" height="70" fill="#5fae2e" stroke="#1d4ed8" strokeWidth="1.5" strokeDasharray="3,3" />

                    {/* Main Access Roads / Pathways (Light Cream/White Lines) */}
                    <path d="M 0 115 L 400 115" stroke="#f8fafc" strokeWidth="4" />
                    <path d="M 195 0 L 195 550" stroke="#f8fafc" strokeWidth="4" />
                    <path d="M 285 270 L 285 550" stroke="#f8fafc" strokeWidth="3" />
                    <path d="M 0 385 L 285 385" stroke="#f8fafc" strokeWidth="3" />
                  </svg>

                  {/* Interactive Map Hotspots/Markers */}
                  {pastureZones.map((zone) => (
                    <div
                      key={zone.id}
                      style={{ top: zone.top, left: zone.left }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
                      onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
                    >
                      <span className="relative flex h-5 w-5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${zone.color} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-5 w-5 ${zone.color} border-2 border-white shadow-md hover:scale-125 transition-transform`}></span>
                      </span>

                      {/* Floating Marker Tooltip */}
                      {selectedZone?.id === zone.id && (
                        <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-48 bg-stone-900/95 backdrop-blur-md text-white text-xs rounded-xl p-3 shadow-2xl border border-stone-700 z-30 animate-in fade-in zoom-in-95">
                          <div className="flex items-center justify-between border-b border-stone-700 pb-1.5 mb-1.5">
                            <span className="font-bold text-emerald-400">{zone.name}</span>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedZone(null); }}>
                              <X className="w-3 h-3 text-stone-400 hover:text-white" />
                            </button>
                          </div>
                          <p className="text-[11px] text-stone-300">Area: <strong className="text-white">{zone.area}</strong></p>
                          <p className="text-[11px] text-stone-300">Status: <strong className="text-white">{zone.status}</strong></p>
                          {zone.cows !== undefined && (
                            <p className="text-[11px] text-stone-300">Grazing Cows: <strong className="text-emerald-400">{zone.cows} Head</strong></p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Map Control HUD Overlay */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-stone-900/80 backdrop-blur-md p-1.5 rounded-xl border border-stone-700/60 text-white shadow-md">
                    <button className="p-1.5 hover:bg-stone-700/80 rounded-lg transition" title="Zoom In">
                      <Plus className="w-4 h-4" />
                    </button>
                    <div className="w-full h-px bg-stone-700/60"></div>
                    <button className="p-1.5 hover:bg-stone-700/80 rounded-lg transition" title="Reset Orientation">
                      <Compass className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>

                  {/* Map Legend */}
                  <div className="absolute bottom-3 inset-x-3 bg-stone-950/85 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-stone-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Solar
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-sky-500"></span> Water
                      </span>
                    </div>
                    <span className="text-stone-400 font-mono text-[10px]">GPS: 28.8955° N, 76.6066° E</span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

      {/* EDIT FARM DETAILS MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <h3 className="text-xl font-bold text-stone-900">Edit Farm Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Farm Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Total Land Area
                  </label>
                  <input
                    type="text"
                    value={editForm.landArea}
                    onChange={(e) => setEditForm({ ...editForm, landArea: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Registration ID
                  </label>
                  <input
                    type="text"
                    value={editForm.regId}
                    onChange={(e) => setEditForm({ ...editForm, regId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Farm Type
                </label>
                <select
                  value={editForm.farmType}
                  onChange={(e) => setEditForm({ ...editForm, farmType: e.target.value })}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Semi-Automated Commercial Dairy">Semi-Automated Commercial Dairy</option>
                  <option value="Fully Automated Smart Dairy">Fully Automated Smart Dairy</option>
                  <option value="Organic Free-Range Breeding Farm">Organic Free-Range Breeding Farm</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-stone-800/80 hover:bg-stone-700 text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-[16/9] w-full bg-black">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6 text-white bg-stone-900">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">{selectedPhoto.title}</h3>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/30">
                  {selectedPhoto.tag}
                </span>
              </div>
              <p className="text-sm text-stone-300 font-medium">{selectedPhoto.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD PHOTO MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-lg font-bold text-stone-900">Add Infrastructure Photo</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Photo Title
                </label>
                <input
                  type="text"
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  placeholder="e.g. Solar Energy Feed Shed"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Category
                </label>
                <select
                  value={newPhotoCategory}
                  onChange={(e) => setNewPhotoCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Pasture Land">Pasture Land</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Livestock">Livestock</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center bg-stone-50 hover:bg-stone-100 transition cursor-pointer">
                <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-stone-600">Click to upload or drag photo here</p>
                <p className="text-[10px] text-stone-400 mt-1">PNG, JPG up to 10MB</p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
