import React, { useState } from 'react';
import { Customer, AppSettings } from '../types';
import {
  Plus,
  Filter,
  ArrowUpDown,
  Phone,
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  Search,
  Sparkles,
  UserCheck,
  Edit2,
  Trash2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface CustomersViewProps {
  customers: Customer[];
  settings: AppSettings;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddNewCustomer: () => void;
  onOpenWhatsAppReminder: (customer: Customer) => void;
  onViewProfile: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  isMobileLayout?: boolean;
  isOwnerUnlocked?: boolean;
  onRequestOwnerUnlock?: (actionTitle?: string, onApproved?: () => void) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  settings,
  searchQuery,
  onSearchChange,
  onAddNewCustomer,
  onOpenWhatsAppReminder,
  onViewProfile,
  onDeleteCustomer,
  isMobileLayout = false,
  isOwnerUnlocked = false,
  onRequestOwnerUnlock,
}) => {
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due' | 'purchase' | 'name'>('due');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleAddCustomerClick = () => {
    if (!isOwnerUnlocked && onRequestOwnerUnlock) {
      onRequestOwnerUnlock('Add New Customer', () => onAddNewCustomer());
      return;
    }
    onAddNewCustomer();
  };

  const handleDeleteCustomerClick = (id: string) => {
    if (!isOwnerUnlocked && onRequestOwnerUnlock) {
      onRequestOwnerUnlock('Delete Customer Record', () => onDeleteCustomer(id));
      return;
    }
    onDeleteCustomer(id);
  };

  // Filter & Sort customers
  const filteredCustomers = customers
    .filter((cust) => {
      const matchQuery =
        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.phone.includes(searchQuery);
      const matchTier = filterTier === 'all' || cust.tier.toLowerCase() === filterTier.toLowerCase();
      return matchQuery && matchTier;
    })
    .sort((a, b) => {
      if (sortBy === 'due') return b.dueAmount - a.dueAmount;
      if (sortBy === 'purchase') return b.totalPurchase - a.totalPurchase;
      return a.name.localeCompare(b.name);
    });

  // Mobile layout matching Image 11
  if (isMobileLayout) {
    return (
      <div id="customers-mobile-view" className="p-4 space-y-5 pb-24 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="font-serif-luxury text-3xl font-bold text-[#E5B842]">
              Customers
            </h1>
            <p className="text-xs text-[#8A95A6] mt-0.5">
              Manage your luxury clientele
            </p>
          </div>
          <button
            onClick={handleAddCustomerClick}
            className="w-10 h-10 rounded-full bg-[#E5B842] text-[#121417] flex items-center justify-center shadow-lg active:scale-95 cursor-pointer"
            title={isOwnerUnlocked ? 'Add Customer' : 'Add Customer (Owner PIN Required)'}
          >
            {isOwnerUnlocked ? (
              <Plus className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Lock className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Staff / Owner Status Banner on Mobile */}
        {!isOwnerUnlocked ? (
          <div className="bg-[#151922] border border-[#2B3545] rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Lock className="w-3.5 h-3.5 text-[#E5B842] shrink-0" />
              <span>Staff Mode (Read-Only Customer Data)</span>
            </div>
            <button
              onClick={() => onRequestOwnerUnlock?.('Unlock Owner Mode')}
              className="text-[#E5B842] font-bold text-[11px] uppercase tracking-wider"
            >
              Unlock
            </button>
          </div>
        ) : (
          <div className="bg-[#181E27] border border-[#E5B842]/30 rounded-xl p-2.5 px-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#E5B842]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E5B842] shrink-0" />
              <span className="font-semibold text-[11px]">Owner Mode: Full Client Editing Enabled</span>
            </div>
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search clients..."
            className="w-full bg-[#16191F] border border-[#242A33] text-sm text-[#E2E8F0] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#E5B842] transition-colors placeholder-[#6A7788]"
          />
          <Search className="w-4 h-4 text-[#7A8799] absolute left-3.5 top-3.5 pointer-events-none" />
        </div>

        {/* Customer Cards List */}
        <div className="space-y-4">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="bg-[#16191F] border border-[#242A33] rounded-2xl p-5 shadow-lg relative space-y-4"
            >
              {/* Top Row: Avatar, Name, Tier, 3-dots */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1B2028] to-[#2B3340] border border-[#E5B842]/40 flex items-center justify-center font-serif text-base font-bold text-[#E5B842]">
                    {cust.initials}
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
                      {cust.name}
                    </h3>
                    <p className="text-xs text-[#8A95A6]">
                      {cust.tier === 'VIP'
                        ? 'VIP Client'
                        : cust.tier === 'ELITE'
                        ? 'Elite Client'
                        : cust.tier === 'NEW'
                        ? 'New Client'
                        : 'Regular'}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === cust.id ? null : cust.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#7E8B9C] hover:text-[#E2E8F0]"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {activeMenuId === cust.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-[#1D222A] border border-[#2F3744] rounded-lg shadow-xl py-1 z-30 text-xs">
                      <button
                        onClick={() => {
                          onViewProfile(cust);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-[#E2E8F0] hover:bg-[#28303C]"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteCustomerClick(cust.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-[#FF6B6B] hover:bg-[#28303C] flex items-center justify-between"
                      >
                        <span>Delete Client</span>
                        {!isOwnerUnlocked && <Lock className="w-3 h-3 text-[#FF6B6B]" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Purchase & Due Amount */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#8A95A6] uppercase block">
                    TOTAL PURCHASE
                  </span>
                  <div className="font-serif-luxury text-xl font-bold text-[#E2E8F0] mt-1">
                    {formatCurrency(cust.totalPurchase, settings.currency, true)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#8A95A6] uppercase block">
                    DUE AMOUNT
                  </span>
                  <div
                    className={`font-serif-luxury text-xl font-bold mt-1 ${
                      cust.dueAmount > 0 ? 'text-[#FF7E70]' : 'text-[#E2E8F0]'
                    }`}
                  >
                    {cust.dueAmount > 0
                      ? formatCurrency(cust.dueAmount, settings.currency, true)
                      : `${settings.currency}0`}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {cust.dueAmount > 0 ? (
                <button
                  id={`cust-whatsapp-btn-${cust.id}`}
                  onClick={() => onOpenWhatsAppReminder(cust)}
                  className="w-full bg-[#E5B842] hover:bg-[#F3C757] text-[#121417] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                  <span>WHATSAPP REMINDER</span>
                </button>
              ) : (
                <div className="w-full bg-[#1A1F26] border border-[#29323E] text-[#60A5FA] font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs tracking-wider uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">FULLY PAID</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop layout matching Image 1
  return (
    <div id="customers-desktop-view" className="p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Staff / Owner Access Notice */}
      {!isOwnerUnlocked ? (
        <div className="bg-[#141822] border border-[#2B3545] rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-[#94A3B8]">
            <div className="w-8 h-8 rounded-lg bg-[#1E2532] border border-[#2E394A] flex items-center justify-center text-[#E5B842] shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#E2E8F0]">Staff Access Mode: Read-Only Customer Directory</span>
              <p className="text-[11px] text-[#808E9F] mt-0.5">
                Employees can browse client files, view balances, and trigger WhatsApp due payment reminders. Adding, editing, or deleting customer files requires Owner PIN.
              </p>
            </div>
          </div>
          <button
            onClick={() => onRequestOwnerUnlock?.('Authorize Customer Modifications')}
            className="px-4 py-2 bg-[#E5B842]/10 border border-[#E5B842]/40 hover:bg-[#E5B842]/20 text-[#E5B842] rounded-lg font-bold text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Unlock Owner Access</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#141C24] border border-[#E5B842]/30 rounded-xl px-5 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#E5B842]">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold text-xs">Owner Mode Active: Full Customer Creation & Record Modification Enabled</span>
          </div>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              id="cust-filter-btn"
              onClick={() => setFilterTier(filterTier === 'all' ? 'VIP' : filterTier === 'VIP' ? 'ELITE' : filterTier === 'ELITE' ? 'REGULAR' : 'all')}
              className="bg-transparent hover:bg-[#1A1E26] border border-[#2B323E] text-[#D1D8E0] text-xs font-semibold py-2.5 px-4 rounded-md uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-[#E5B842]" />
              <span>FILTER{filterTier !== 'all' ? `: ${filterTier}` : ''}</span>
            </button>
          </div>

          {/* Sort Dropdown */}
          <button
            id="cust-sort-btn"
            onClick={() => setSortBy(sortBy === 'due' ? 'purchase' : sortBy === 'purchase' ? 'name' : 'due')}
            className="bg-transparent hover:bg-[#1A1E26] border border-[#2B323E] text-[#D1D8E0] text-xs font-semibold py-2.5 px-4 rounded-md uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#E5B842]" />
            <span>SORT BY: {sortBy.toUpperCase()}</span>
          </button>
        </div>

        {/* Add New Customer Button */}
        <button
          id="cust-add-new-btn"
          onClick={handleAddCustomerClick}
          className="bg-[#E5B842] hover:bg-[#F3C757] text-[#121417] text-xs font-bold py-2.5 px-5 rounded-md uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
        >
          {isOwnerUnlocked ? (
            <Plus className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <Lock className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>ADD NEW CUSTOMER</span>
        </button>
      </div>

      {/* 3-Column Customer Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-[#14171E] border border-[#232832] rounded-2xl p-10 text-center space-y-4 col-span-full">
          <div className="w-14 h-14 rounded-full bg-[#1E232E] border border-[#2F3746] flex items-center justify-center mx-auto text-[#E5B842]">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
              {customers.length === 0 ? 'No Customers Added Yet' : 'No Matching Customers'}
            </h3>
            <p className="text-xs text-[#8A95A6] max-w-md mx-auto mt-1">
              {customers.length === 0
                ? 'Your client ledger is clean. Add your VIP clients to track jewelry purchases, dues, and send WhatsApp payment receipts.'
                : 'Try adjusting your search query or tier filters.'}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleAddCustomerClick}
              className="bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] font-bold text-xs px-5 py-2.5 rounded-lg inline-flex items-center gap-2 cursor-pointer shadow-lg uppercase tracking-wider"
            >
              {isOwnerUnlocked ? (
                <Plus className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Lock className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>Add First Customer</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            id={`customer-card-${cust.id}`}
            className="bg-[#14171D] border border-[#232832] rounded-xl p-6 shadow-lg relative flex flex-col justify-between hover:border-[#343D4C] transition-all"
          >
            {/* Header: Avatar, Name, Phone, 3-dots */}
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1E232C] border border-[#2B3340] flex items-center justify-center font-serif text-base font-bold text-[#8A95A6]">
                    {cust.initials}
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-xl font-bold text-[#E2E8F0]">
                      {cust.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#7A8799] mt-0.5">
                      <Phone className="w-3 h-3 text-[#7A8799]" />
                      <span>{cust.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === cust.id ? null : cust.id)}
                    className="text-[#64748B] hover:text-[#E2E8F0] p-1 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {activeMenuId === cust.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-[#1A1F27] border border-[#2B3342] rounded-lg shadow-xl py-1 z-30 text-xs">
                      <button
                        onClick={() => {
                          onViewProfile(cust);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-[#E2E8F0] hover:bg-[#252C37]"
                      >
                        Profile Details
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteCustomerClick(cust.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 text-[#FF6B6B] hover:bg-[#252C37] flex items-center justify-between"
                      >
                        <span>Remove</span>
                        {!isOwnerUnlocked && <Lock className="w-3 h-3 text-[#FF6B6B]" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2 Column Stats: Total Purchase & Due Amount */}
              <div className="grid grid-cols-2 gap-4 my-6 pt-2 border-t border-[#1C2028]">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#718096] uppercase block">
                    TOTAL PURCHASE
                  </span>
                  <div className="font-serif-luxury text-xl font-bold text-[#E2E8F0] mt-1.5">
                    {formatCurrency(cust.totalPurchase, settings.currency)}
                  </div>
                </div>

                <div className="border-l border-[#1F242D] pl-4">
                  <span className="text-[10px] font-bold tracking-widest text-[#718096] uppercase block">
                    DUE AMOUNT
                  </span>
                  <div
                    className={`font-serif-luxury text-xl font-bold mt-1.5 ${
                      cust.dueAmount > 0 ? 'text-[#FF7E70]' : 'text-[#E2E8F0]'
                    }`}
                  >
                    {formatCurrency(cust.dueAmount, settings.currency)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Tier Badge & Action */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1C2028]">
              <span className="px-3 py-1 bg-[#1C2027] border border-[#2A313C] rounded-md text-[10px] font-bold tracking-widest text-[#8A95A6] uppercase">
                {cust.tier}
              </span>

              {cust.dueAmount > 0 ? (
                <button
                  id={`desktop-cust-remind-btn-${cust.id}`}
                  onClick={() => onOpenWhatsAppReminder(cust)}
                  className="border border-[#D4AF37] text-[#E5B842] hover:bg-[#E5B842] hover:text-[#121417] text-[11px] font-bold py-1.5 px-4 rounded-md uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>REMINDER</span>
                </button>
              ) : (
                <button
                  onClick={() => onViewProfile(cust)}
                  className="text-xs font-semibold text-[#8A95A6] hover:text-[#E5B842] tracking-wider uppercase transition-colors"
                >
                  VIEW PROFILE
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
