import React, { useState } from 'react';
import { Customer, CustomerTier } from '../../types';
import { X, UserPlus, Sparkles } from 'lucide-react';

interface AddCustomerModalProps {
  onAdd?: (customer: Customer) => void;
  onSave?: (customer: Customer) => void;
  onClose: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  onAdd,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<CustomerTier>('VIP');
  const [totalPurchase, setTotalPurchase] = useState<string>('0');
  const [dueAmount, setDueAmount] = useState<string>('0');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter the customer name.');
      return;
    }

    const nameParts = name.trim().split(' ');
    const initials =
      nameParts.length > 1
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      initials,
      phone: phone.trim() || '+91 98765 00000',
      email: email.trim() || undefined,
      totalPurchase: parseFloat(totalPurchase) || 0,
      dueAmount: parseFloat(dueAmount) || 0,
      tier,
      lastVisit: 'Today',
      notes: notes.trim() || undefined,
    };

    const addHandler = onAdd || onSave;
    if (addHandler) {
      addHandler(newCustomer);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#14171D] border border-[#2B3342] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-[#232832] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F2530] border border-[#2F3947] flex items-center justify-center text-[#E5B842]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
                Add New Customer
              </h3>
              <p className="text-xs text-[#8A95A6]">Register client into jewellery CRM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7E8B9C] hover:text-[#E2E8F0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
              FULL NAME *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Radhika Mandhana"
              className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                PHONE (WHATSAPP) *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                TIER STATUS
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as CustomerTier)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              >
                <option value="VIP">VIP</option>
                <option value="ELITE">ELITE</option>
                <option value="REGULAR">REGULAR</option>
                <option value="NEW">NEW</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                INITIAL PURCHASE (₹)
              </label>
              <input
                type="number"
                value={totalPurchase}
                onChange={(e) => setTotalPurchase(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                DUE AMOUNT (₹)
              </label>
              <input
                type="number"
                value={dueAmount}
                onChange={(e) => setDueAmount(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#FF7E70] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
              PREFERENCES / NOTES
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prefers 22k Temple jewellery, family wedding in Nov"
              className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#232832]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#8A95A6] hover:text-[#E2E8F0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#E5B842] hover:bg-[#F3C757] text-[#121417] font-bold text-xs uppercase tracking-wider transition-all"
            >
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
