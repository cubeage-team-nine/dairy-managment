// src/modules/doctor-requests/components/VeterinaryHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Check, Menu, X, Plus, Clock, AlertCircle } from 'lucide-react';
import { NOTIFICATIONS_DATA } from '../doctor-requests.constants.js';

export default function VeterinaryHeader({
  searchQuery,
  setSearchQuery,
  onOpenNewRequestModal,
  onToggleMobileSidebar,
}) {
  const [dutyStatus, setDutyStatus] = useState('ON DUTY');
  const [showDutyDropdown, setShowDutyDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);

  const dutyRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dutyRef.current && !dutyRef.current.contains(event.target)) {
        setShowDutyDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const getDutyBadgeClasses = () => {
    switch (dutyStatus) {
      case 'ON DUTY':
        return 'bg-[#e8f5ec] text-[#1b6b3e] border-[#bfe3c8] hover:bg-[#d8eedf]';
      case 'ON BREAK':
        return 'bg-[#fef9c3] text-[#ca8a04] border-[#fef08a] hover:bg-[#fef08a]';
      case 'EMERGENCY ONLY':
        return 'bg-[#fee2e2] text-[#dc2626] border-[#fca5a5] hover:bg-[#fecaca]';
      case 'OFF DUTY':
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200';
    }
  };

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-1">
      {/* Title & Mobile Hamburger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 border border-gray-200"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl md:text-[26px] font-extrabold text-gray-900 tracking-tight">
            Veterinary Requests Queue
          </h1>
        </div>

        {/* Quick Mobile Add Button */}
        {onOpenNewRequestModal && (
          <button
            type="button"
            onClick={onOpenNewRequestModal}
            className="md:hidden flex items-center justify-center p-2 rounded-lg bg-[#1a4d2e] text-white"
            title="Create Request"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right Controls: Search, Notifications, Duty Status */}
      <div className="flex items-center flex-wrap sm:flex-nowrap gap-3">
        {/* Search Bar matching screenshot */}
        <div className="relative flex-1 sm:w-72 md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search animals, requests, labs..."
            className="w-full pl-9 pr-9 py-2 bg-[#f9fafb] hover:bg-[#f3f4f6] focus:bg-white text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-[#1b6b3e]/20 focus:border-[#1b6b3e] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifDropdown((prev) => !prev)}
            className="relative p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Popover */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">
                    Live Case Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs text-[#1b6b3e] hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 py-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 hover:bg-gray-50 transition-colors ${
                      notif.unread ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          notif.type === 'emergency'
                            ? 'bg-rose-500'
                            : notif.type === 'lab'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 leading-tight">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                          {notif.description}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 inline-block">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Badge: ON DUTY toggle */}
        <div className="relative" ref={dutyRef}>
          <button
            type="button"
            onClick={() => setShowDutyDropdown((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold tracking-wider rounded-lg border transition-all cursor-pointer ${getDutyBadgeClasses()}`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                dutyStatus === 'ON DUTY'
                  ? 'bg-emerald-500 animate-pulse'
                  : dutyStatus === 'ON BREAK'
                  ? 'bg-amber-500'
                  : dutyStatus === 'EMERGENCY ONLY'
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-gray-400'
              }`}
            />
            <span>{dutyStatus}</span>
          </button>

          {showDutyDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Change Status
              </div>
              {[
                { label: 'ON DUTY', desc: 'Accepting all farm visits' },
                { label: 'EMERGENCY ONLY', desc: 'Urgent calls only' },
                { label: 'ON BREAK', desc: 'Paused for 45 mins' },
                { label: 'OFF DUTY', desc: 'Shift concluded' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setDutyStatus(item.label);
                    setShowDutyDropdown(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="font-bold text-gray-900 block">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {item.desc}
                    </span>
                  </div>
                  {dutyStatus === item.label && (
                    <Check className="w-3.5 h-3.5 text-[#1b6b3e] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
