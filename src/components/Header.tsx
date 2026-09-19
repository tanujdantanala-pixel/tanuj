import React, { useState } from 'react';
import { ScreenType, AppSettings, ViewMode } from '../types';
import {
  Bell,
  Settings as SettingsIcon,
  Smartphone,
  Monitor,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenType;
  settings: AppSettings;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSettings: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  isOwnerUnlocked?: boolean;
  onLockStore?: () => void;
  onRequestOwnerUnlock?: (actionTitle?: string, onApproved?: () => void) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  settings,
  searchQuery,
  onSearchChange,
  onOpenSettings,
  isOwnerUnlocked = false,
  onLockStore,
  onRequestOwnerUnlock,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'LUXURY MANAGEMENT DASHBOARD';
      case 'products':
        return 'Fine Jewellery Inventory';
      case 'attendance':
        return 'Employee Attendance Register';
      case 'staff':
        return 'Staff & Payroll Suite';
      case 'customers':
        return 'Customer Relations';
      case 'billing':
        return 'Luxury Billing Suite';
      default:
        return 'Sri Vyshnavi Jewellery';
    }
  };

  const getSearchPlaceholder = () => {
    switch (currentScreen) {
      case 'products':
        return 'Search gold, diamonds, huid...';
      case 'attendance':
        return 'Search staff attendance...';
      case 'customers':
        return 'Search customers...';
      case 'staff':
        return 'Search staff...';
      case 'billing':
        return 'Search catalog or items...';
      default:
        return 'Search transactions or stock...';
    }
  };

  return (
    <header
      id="desktop-header"
      className="h-20 bg-[#101317] border-b border-[#20252D] px-8 flex items-center justify-between sticky top-0 z-20"
    >
      {/* Title */}
      <div className="flex items-center gap-4">
        <h1
          id="header-screen-title"
          className={`${
            currentScreen === 'dashboard'
              ? 'text-sm sm:text-base font-cinzel tracking-[0.2em] uppercase text-[#E5B842] font-semibold'
              : 'text-2xl font-serif-luxury font-bold text-[#E5B842]'
          }`}
        >
          {getScreenTitle()}
        </h1>

        {/* Live Gold Rate Ticker */}
        <div className="hidden lg:flex items-center gap-2 bg-[#171B21] border border-[#2B323D] px-3 py-1.5 rounded-full text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[#9BA5B5]">22K Gold:</span>
          <span className="font-semibold text-[#E5B842]">
            {settings.currency} {settings.goldRate22k.toLocaleString('en-IN')}/g
          </span>
          <TrendingUp className="w-3 h-3 text-emerald-400" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Global Search Bar (when relevant) */}
        {currentScreen === 'customers' && (
          <div className="hidden md:flex items-center relative w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={getSearchPlaceholder()}
              className="w-full bg-[#161A20] border border-[#272D37] text-sm text-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#E5B842] transition-colors placeholder-[#677383]"
            />
            <svg
              className="w-4 h-4 text-[#7A8799] absolute left-3 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="header-notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full bg-[#181C22] border border-[#282F3A] flex items-center justify-center text-[#9CA3AF] hover:text-[#E5B842] hover:border-[#E5B842]/40 transition-colors cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E5B842] animate-pulse"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-80 bg-[#16191F] border border-[#2B323D] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#242A33] mb-3">
                <span className="font-serif text-sm font-bold text-[#E5B842]">Live Store Alerts</span>
                <span className="text-[10px] bg-[#E5B842]/20 text-[#E5B842] px-2 py-0.5 rounded-full font-semibold">
                  3 New
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-[#1B2027] rounded-lg border border-[#272D37] flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#E5B842] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#E2E8F0]">Invoice #INV-0892 Cleared</p>
                    <p className="text-[#8492A6] text-[11px]">₹4,25,000 paid by Ananya Reddy</p>
                  </div>
                </div>
                <div className="p-2.5 bg-[#1B2027] rounded-lg border border-[#272D37] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#E2E8F0]">Gold Price Updated</p>
                    <p className="text-[#8492A6] text-[11px]">22K at ₹6,150/g • 24K at ₹6,720/g</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Owner / Staff Access Status & Clear Switch Control */}
        {isOwnerUnlocked ? (
          <div className="flex items-center gap-2 bg-[#1A1F29] border border-[#E5B842]/40 p-1 pl-2.5 rounded-xl shadow-md">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E5B842]">
              <ShieldCheck className="w-4 h-4 text-[#E5B842]" />
              <span className="hidden md:inline">OWNER</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <button
              id="header-switch-to-staff-btn"
              onClick={onLockStore}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 hover:text-red-200 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Lock store and switch back to Staff Mode"
            >
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>Switch to Staff</span>
            </button>
          </div>
        ) : (
          <button
            id="header-staff-unlock-btn"
            onClick={() => onRequestOwnerUnlock?.('Unlock Owner Mode')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161A22] border border-[#2B3545] hover:border-[#E5B842]/50 text-xs font-bold text-[#94A3B8] hover:text-[#E2E8F0] transition-all cursor-pointer shadow-sm active:scale-95"
            title="Staff Mode (Read-Only): Click to enter Owner PIN"
          >
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#E5B842]" />
              <span className="hidden sm:inline">STAFF MODE</span>
            </div>
            <span className="text-[10px] bg-[#E5B842] text-[#111418] font-bold px-2 py-0.5 rounded-md">
              UNLOCK OWNER
            </span>
          </button>
        )}

        {/* Settings gear */}
        <button
          id="header-settings-btn"
          onClick={() => {
            if (!isOwnerUnlocked && onRequestOwnerUnlock) {
              onRequestOwnerUnlock('Access Settings & Rates', () => onOpenSettings());
              return;
            }
            onOpenSettings();
          }}
          className="w-10 h-10 rounded-full bg-[#181C22] border border-[#282F3A] flex items-center justify-center text-[#9CA3AF] hover:text-[#E5B842] hover:border-[#E5B842]/40 transition-colors cursor-pointer"
          title="Store Settings & Rates"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-[#242A33]">
          <div className="w-10 h-10 rounded-full ring-2 ring-[#E5B842]/40 overflow-hidden bg-[#242A33]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"
              alt="Admin Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
