import React from 'react';
import { ScreenType } from '../types';
import {
  LayoutDashboard,
  Gem,
  CalendarDays,
  Briefcase,
  Users,
  ReceiptText,
  Settings,
  Plus,
  Sparkles,
  Lock,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onNewSaleClick: () => void;
  onOpenSettings: () => void;
  isOwnerUnlocked?: boolean;
  onLockStore?: () => void;
  onRequestOwnerUnlock?: (actionTitle?: string, onApproved?: () => void) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onNewSaleClick,
  onOpenSettings,
  isOwnerUnlocked = false,
  onLockStore,
  onRequestOwnerUnlock,
}) => {
  const navItems = [
    { id: 'dashboard' as ScreenType, label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'products' as ScreenType, label: 'PRODUCTS & VAULT', icon: Gem },
    { id: 'attendance' as ScreenType, label: 'ATTENDANCE CALENDAR', icon: CalendarDays },
    { id: 'staff' as ScreenType, label: 'STAFF & SALARY', icon: Briefcase, isOwnerOnly: true },
    { id: 'customers' as ScreenType, label: 'CUSTOMERS CRM', icon: Users },
    { id: 'billing' as ScreenType, label: 'BILLING & INVOICE', icon: ReceiptText },
  ];

  const handleNavClick = (id: ScreenType, isOwnerOnly?: boolean) => {
    if (isOwnerOnly && !isOwnerUnlocked && onRequestOwnerUnlock) {
      onRequestOwnerUnlock('Access Staff & Payroll Suite', () => onNavigate(id));
      return;
    }
    onNavigate(id);
  };

  const handleSettingsClick = () => {
    if (!isOwnerUnlocked && onRequestOwnerUnlock) {
      onRequestOwnerUnlock('Access Settings & Rates', () => onOpenSettings());
      return;
    }
    onOpenSettings();
  };

  return (
    <aside
      id="desktop-sidebar"
      className="w-64 bg-[#111418] border-r border-[#222730] flex flex-col justify-between h-screen sticky top-0 select-none z-30 shrink-0"
    >
      {/* Brand & Logo Header */}
      <div>
        <div className="p-5 pb-4">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B6B1F] to-[#E5B842] flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-4 h-4 text-[#111418]" />
            </div>
            <div>
              <h1 className="font-serif-luxury text-base font-bold text-[#E5B842] leading-tight tracking-wide">
                Sri Vyshnavi Jewellery
              </h1>
              <div className="text-[10px] tracking-[0.15em] font-medium text-[#7D8899] uppercase">
                LUXURY MANAGEMENT
              </div>
            </div>
          </div>
        </div>

        {/* + NEW SALE Button */}
        <div className="px-4 mb-4">
          <button
            id="sidebar-new-sale-btn"
            onClick={onNewSaleClick}
            className="w-full bg-[#E5B842] hover:bg-[#F3C757] text-[#121417] font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-200 cursor-pointer tracking-wider text-xs uppercase active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>NEW SALE</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id, item.isOwnerOnly)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[11px] font-bold tracking-wider transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#1C2027] text-[#E5B842] border-l-3 border-[#E5B842] shadow-sm'
                    : 'text-[#8A95A6] hover:text-[#D1D8E0] hover:bg-[#16191F]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#E5B842]' : 'text-[#8A95A6]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.isOwnerOnly && !isOwnerUnlocked && (
                  <Lock className="w-3 h-3 text-[#E5B842]/70 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation & Role Security */}
      <div className="p-3 border-t border-[#1F242C] space-y-2.5">
        {isOwnerUnlocked ? (
          <div className="bg-[#181D26] border border-[#E5B842]/40 rounded-xl p-3 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E5B842]">
                <ShieldCheck className="w-4 h-4 text-[#E5B842]" />
                <span>STORE OWNER</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-[#8A95A6]">Full privileges active. Lock when leaving desk.</p>
            <button
              id="sidebar-switch-to-staff-btn"
              onClick={onLockStore}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-red-300 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Lock store back to Staff Mode"
            >
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>Switch Back to Staff</span>
            </button>
          </div>
        ) : (
          <div className="bg-[#151921] border border-[#27303E] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8A95A6]">
                <Lock className="w-3.5 h-3.5 text-[#E5B842]" />
                <span>STAFF MODE</span>
              </div>
              <span className="text-[10px] text-[#E5B842] font-semibold bg-[#E5B842]/15 px-1.5 py-0.5 rounded">
                PROTECTED
              </span>
            </div>
            <button
              id="sidebar-unlock-btn"
              onClick={() => onRequestOwnerUnlock?.('Unlock Owner Mode')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-[#111418] bg-[#E5B842] hover:bg-[#F3C757] transition-all cursor-pointer shadow-sm active:scale-95"
              title="Enter Owner PIN for unrestricted access"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#111418]" />
              <span>Unlock Owner Mode</span>
            </button>
          </div>
        )}

        <button
          id="sidebar-settings-btn"
          onClick={handleSettingsClick}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold tracking-wider text-[#8A95A6] hover:text-[#E2E8F0] hover:bg-[#16191F] transition-colors cursor-pointer text-left"
        >
          <Settings className="w-4 h-4 text-[#8A95A6]" />
          <span>SETTINGS & RATES</span>
        </button>
      </div>
    </aside>
  );
};
