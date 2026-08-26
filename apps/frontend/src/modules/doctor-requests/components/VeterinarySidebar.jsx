// src/modules/doctor-requests/components/VeterinarySidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Users,
  Shield,
  AlertTriangle,
  User,
  Settings,
  Activity,
} from 'lucide-react';
import RoutePath from '../../../core/constants/routes.constant.js';
import { ACTIVE_LABS, DOCTOR_PROFILE } from '../doctor-requests.constants.js';

export default function VeterinarySidebar({
  activeLabModal,
  setActiveLabModal,
  className = '',
}) {
  const location = useLocation();

  const coreNavItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: RoutePath.DOCTOR_DASHBOARD || '/doctor/dashboard',
      showLabel: false,
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: FileText,
      path: RoutePath.DOCTOR_REQUESTS || '/doctor/requests',
      showLabel: true,
      badge: null,
    },
    {
      id: 'farmers',
      label: 'Farmers',
      icon: Users,
      path: RoutePath.DOCTOR_ASSIGNED_ANIMALS || '/doctor/assigned-animals',
      showLabel: false,
    },
    {
      id: 'health',
      label: 'Health Records',
      icon: Shield,
      path: RoutePath.DOCTOR_HEALTH_RECORDS || '/doctor/health-records',
      showLabel: false,
    },
    {
      id: 'alerts',
      label: 'Mastitis / Emergency',
      icon: AlertTriangle,
      path: RoutePath.DOCTOR_MASTITIS_CASES || '/doctor/mastitis-cases',
      showLabel: false,
    },
    {
      id: 'profile',
      label: 'Doctor Profile',
      icon: User,
      path: RoutePath.DOCTOR_PROFILE || '/doctor/profile',
      showLabel: false,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: RoutePath.DOCTOR_SETTINGS || '/doctor/settings',
      showLabel: false,
    },
  ];

  return (
    <aside
      className={`w-64 md:w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none ${className}`}
    >
      {/* Top Section */}
      <div className="p-5 flex flex-col">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-8 px-1">
          <div className="w-10 h-10 rounded-xl bg-[#1b4332] flex items-center justify-center shadow-xs text-white">
            <svg
              className="w-6 h-6 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-gray-900 leading-tight">
              Smart Dairy
            </span>
            <span className="text-[10px] font-bold tracking-widest text-[#1b6b3e] uppercase">
              Veterinary Portal
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-6">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">
              Veterinary Core
            </p>

            <nav className="space-y-1.5">
              {coreNavItems.map((item) => {
                const Icon = item.icon;
                const isRequestsRoute =
                  item.id === 'requests' &&
                  (location.pathname === item.path ||
                    location.pathname.includes('/doctor/requests'));
                const isActive = isRequestsRoute || location.pathname === item.path;

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    title={item.label}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                      isActive
                        ? 'bg-[#ddf2e2] text-[#1b6b3e] font-bold shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon
                      className={`w-[19px] h-[19px] shrink-0 ${
                        isActive ? 'text-[#1b6b3e]' : 'text-gray-500'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {item.showLabel || isActive ? (
                      <span className="truncate">{item.label}</span>
                    ) : (
                      <span className="truncate text-gray-600 hover:text-gray-900">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Active Labs Section */}
          <div className="pt-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">
              Active Labs
            </p>

            <div className="space-y-2 px-1">
              {ACTIVE_LABS.map((lab) => (
                <button
                  key={lab.id}
                  type="button"
                  onClick={() => setActiveLabModal && setActiveLabModal(lab)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors hover:bg-gray-50 group cursor-pointer"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
                    style={{ backgroundColor: lab.statusColor }}
                  />
                  <span className="text-xs font-semibold text-gray-700 truncate group-hover:text-gray-900">
                    {lab.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <Link
          to={RoutePath.DOCTOR_PROFILE || '/doctor/profile'}
          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <div className="relative">
            <img
              src={DOCTOR_PROFILE.avatarUrl}
              alt={DOCTOR_PROFILE.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#ddf2e2]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'flex';
                }
              }}
            />
            <div
              style={{ display: 'none' }}
              className="w-10 h-10 rounded-full bg-[#1b4332] text-white font-bold text-xs items-center justify-center ring-2 ring-[#ddf2e2]"
            >
              AP
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-gray-900 truncate group-hover:text-[#1b6b3e] transition-colors">
              {DOCTOR_PROFILE.name}
            </span>
            <span className="text-[11px] font-medium text-gray-500 truncate">
              {DOCTOR_PROFILE.title}
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
