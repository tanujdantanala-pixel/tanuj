import React, { useState } from 'react';
import { ScreenType } from '../types';
import { Menu, User, ArrowLeft, QrCode, Sparkles, Lock, ShieldCheck, KeyRound } from 'lucide-react';

interface MobileHeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenSettings: () => void;
  onOpenQrScanner?: () => void;
  isOwnerUnlocked?: boolean;
  onLockStore?: () => void;
  onRequestOwnerUnlock?: (actionTitle?: string, onApproved?: () => void) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentScreen,
  onNavigate,
  onOpenSettings,
  onOpenQrScanner,
  isOwnerUnlocked = false,
  onLockStore,
  onRequestOwnerUnlock,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isBilling = currentScreen === 'billing';

  const handleNavClick = (screen: ScreenType, isOwnerOnly?: boolean) => {
    setDrawerOpen(false);
    if (isOwnerOnly && !isOwnerUnlocked && onRequestOwnerUnlock) {
      onRequestOwnerUnlock('Access Staff Management', () => onNavigate(screen));
      return;
    }
    onNavigate(screen);
  };

  const handleSettingsClick = () => {
    setDrawerOpen(false);
    if (!isOwnerUnlocked && onRequestOwnerUnlock) {
      onRequestOwnerUnlock('Access Settings & Rates', () => onOpenSettings());
      return;
    }
    onOpenSettings();
  };

  return (
    <>
      <header
        id="mobile-header"
        className="h-16 bg-[#0E1013] border-b border-[#20252D] px-4 flex items-center justify-between sticky top-0 z-30 select-none"
      >
        {isBilling ? (
          <button
            id="mobile-billing-back-btn"
            onClick={() => onNavigate('dashboard')}
            className="w-10 h-10 flex items-center justify-center text-[#E5B842] hover:bg-[#1A1E24] rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <button
            id="mobile-menu-btn"
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-[#E5B842] hover:bg-[#1A1E24] rounded-lg transition-colors cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* Brand or Screen Title */}
        <div className="text-center">
          {isBilling ? (
            <h1 className="font-cinzel text-lg font-bold tracking-[0.2em] text-[#E5B842] uppercase">
              BILLING
            </h1>
          ) : (
            <h1 className="font-cinzel text-base sm:text-lg font-bold tracking-[0.15em] text-[#E5B842] uppercase truncate max-w-[180px] sm:max-w-none">
              SRI VYSHNAVI JE...
            </h1>
          )}
        </div>

        {/* Right Icon */}
        {isBilling ? (
          <button
            id="mobile-qr-scan-btn"
            onClick={onOpenQrScanner || onOpenSettings}
            className="w-10 h-10 flex items-center justify-center text-[#E5B842] hover:bg-[#1A1E24] rounded-lg transition-colors cursor-pointer"
            title="Scan Jewellery Tag"
          >
            <QrCode className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            {isOwnerUnlocked ? (
              <button
                id="mobile-switch-to-staff-btn"
                onClick={() => {
                  onLockStore?.();
                }}
                className="h-8 px-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 flex items-center gap-1.5 cursor-pointer text-xs font-bold active:scale-95 transition-all shadow-sm"
                title="Lock store and switch back to Staff Mode"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>Lock Staff</span>
              </button>
            ) : (
              <button
                id="mobile-staff-unlock-btn"
                onClick={() => {
                  if (onRequestOwnerUnlock) {
                    onRequestOwnerUnlock('Unlock Owner Mode');
                  } else {
                    handleSettingsClick();
                  }
                }}
                className="h-8 px-2.5 rounded-lg bg-[#161A22] border border-[#2B3545] text-[#94A3B8] flex items-center gap-1 cursor-pointer text-xs font-semibold active:scale-95 transition-all"
                title="Staff Mode (Tap to Unlock Owner PIN)"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#E5B842]" />
                <span className="text-[11px] text-[#E5B842] font-bold">Unlock</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Mobile Drawer Menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-[#111418] border-r border-[#242A33] h-full p-6 flex flex-col justify-between z-10 shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-[#242A33] mb-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B6B1F] to-[#E5B842] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#111418]" />
                </div>
                <div>
                  <h2 className="font-serif-luxury font-bold text-base text-[#E5B842]">
                    Sri Vyshnavi
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-[#8A95A6]">
                    Luxury Management
                  </p>
                </div>
              </div>

              {/* Role Indicator Card inside Drawer */}
              {isOwnerUnlocked ? (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4 text-[#E5B842]" />
                      <span>Owner Mode Active</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-[#8A95A6]">Full access to salaries, customer deletion & rates.</p>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      onLockStore?.();
                    }}
                    className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Lock className="w-3.5 h-3.5 text-red-400" />
                    <span>Switch Back to Staff Mode</span>
                  </button>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-[#161A22] border border-[#2B3545] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#94A3B8] font-bold">
                      <Lock className="w-3.5 h-3.5 text-[#E5B842]" />
                      <span>Staff Safe Mode</span>
                    </div>
                    <span className="text-[10px] bg-[#E5B842]/10 text-[#E5B842] font-bold px-1.5 py-0.5 rounded">PROTECTED</span>
                  </div>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      onRequestOwnerUnlock?.('Unlock Owner Mode');
                    }}
                    className="w-full py-2 bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Enter Owner PIN</span>
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold tracking-wider ${
                    currentScreen === 'dashboard'
                      ? 'bg-[#1C2027] text-[#E5B842] border-l-2 border-[#E5B842]'
                      : 'text-[#8A95A6] hover:bg-[#16191F]'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavClick('products')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold tracking-wider ${
                    currentScreen === 'products'
                      ? 'bg-[#1C2027] text-[#E5B842] border-l-2 border-[#E5B842]'
                      : 'text-[#8A95A6] hover:bg-[#16191F]'
                  }`}
                >
                  Products & Vault
                </button>
                <button
                  onClick={() => handleNavClick('attendance')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold tracking-wider ${
                    currentScreen === 'attendance'
                      ? 'bg-[#1C2027] text-[#E5B842] border-l-2 border-[#E5B842]'
                      : 'text-[#8A95A6] hover:bg-[#16191F]'
                  }`}
                >
                  Attendance Register
                </button>
                <button
                  onClick={() => handleNavClick('staff', true)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold tracking-wider flex items-center justify-between ${
                    currentScreen === 'staff'
                      ? 'bg-[#1C2027] text-[#E5B842] border-l-2 border-[#E5B842]'
                      : 'text-[#8A95A6] hover:bg-[#16191F]'
                  }`}
                >
                  <span>Staff & Payroll</span>
                  {!isOwnerUnlocked && <Lock className="w-3.5 h-3.5 text-[#E5B842]" />}
                </button>
                <button
                  onClick={() => handleNavClick('customers')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold tracking-wider ${
                    currentScreen === 'customers'
                      ? 'bg-[#1C2027] text-[#E5B842] border-l-2 border-[#E5B842]'
                      : 'text-[#8A95A6] hover:bg-[#16191F]'
                  }`}
                >
                  Customers (CRM)
                </button>
                <button
                  onClick={() => handleNavClick('billing')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold tracking-wider ${
                    currentScreen === 'billing'
                      ? 'bg-[#1C2027] text-[#E5B842] border-l-2 border-[#E5B842]'
                      : 'text-[#8A95A6] hover:bg-[#16191F]'
                  }`}
                >
                  Luxury Billing Suite
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-[#242A33] space-y-3">
              {isOwnerUnlocked ? (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onLockStore?.();
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg bg-[#E5B842]/10 border border-[#E5B842]/30 text-xs text-[#E5B842] font-bold flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock to Staff Mode</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onRequestOwnerUnlock?.('Unlock Owner Mode');
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-lg bg-[#161A22] border border-[#2B3545] text-xs text-[#94A3B8] font-bold flex items-center justify-between hover:text-[#E2E8F0]"
                >
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-[#E5B842]" />
                    <span>Unlock Owner Mode</span>
                  </div>
                  <span className="text-[10px] text-[#E5B842]">PIN</span>
                </button>
              )}

              <button
                onClick={handleSettingsClick}
                className="w-full text-left px-4 py-2.5 text-xs text-[#8A95A6] hover:text-[#E2E8F0] font-medium"
              >
                Store & Rates Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
