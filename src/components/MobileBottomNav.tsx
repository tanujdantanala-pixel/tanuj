import React from 'react';
import { ScreenType } from '../types';
import { LayoutGrid, Gem, CalendarDays, ContactRound, Users, ReceiptText, Lock } from 'lucide-react';

interface MobileBottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  isOwnerUnlocked?: boolean;
  onRequestOwnerUnlock?: (actionTitle?: string, onApproved?: () => void) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentScreen,
  onNavigate,
  isOwnerUnlocked = false,
  onRequestOwnerUnlock,
}) => {
  const tabs = [
    { id: 'dashboard' as ScreenType, label: 'Home', icon: LayoutGrid },
    { id: 'products' as ScreenType, label: 'Products', icon: Gem },
    { id: 'attendance' as ScreenType, label: 'Calendar', icon: CalendarDays },
    { id: 'staff' as ScreenType, label: 'Payroll', icon: ContactRound, isOwnerOnly: true },
    { id: 'customers' as ScreenType, label: 'Clients', icon: Users },
    { id: 'billing' as ScreenType, label: 'Billing', icon: ReceiptText },
  ];

  const handleTabClick = (id: ScreenType, isOwnerOnly?: boolean) => {
    if (isOwnerOnly && !isOwnerUnlocked && onRequestOwnerUnlock) {
      onRequestOwnerUnlock('Access Staff & Payroll Suite', () => onNavigate(id));
      return;
    }
    onNavigate(id);
  };

  return (
    <nav
      id="mobile-bottom-navbar"
      className="fixed bottom-0 left-0 right-0 h-16 bg-[#0E1013] border-t border-[#20252D] px-1 flex items-center justify-around z-40 select-none shadow-[0_-5px_20px_rgba(0,0,0,0.6)]"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentScreen === tab.id;

        return (
          <button
            key={tab.id}
            id={`mobile-tab-${tab.id}`}
            onClick={() => handleTabClick(tab.id, tab.isOwnerOnly)}
            className={`flex flex-col items-center justify-center transition-all duration-200 cursor-pointer py-1 px-1.5 rounded-lg relative ${
              isActive
                ? 'bg-[#E5B842] text-[#121417] shadow-md'
                : 'text-[#8A95A6] hover:text-[#D1D8E0]'
            }`}
          >
            <div className="relative">
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#121417] stroke-[2.2]' : 'text-[#8A95A6]'}`} />
              {tab.isOwnerOnly && !isOwnerUnlocked && (
                <Lock className="w-2.5 h-2.5 text-[#E5B842] absolute -top-1 -right-2" />
              )}
            </div>
            <span
              className={`text-[9px] tracking-wider uppercase mt-0.5 ${
                isActive ? 'font-bold text-[#121417]' : 'font-semibold text-[#8A95A6]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
