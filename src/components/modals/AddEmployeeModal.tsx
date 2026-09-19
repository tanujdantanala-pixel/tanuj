import React, { useState } from 'react';
import { StaffMember, StaffStatus, PayrollStatus, BankDetails } from '../../types';
import { X, UserPlus, Sparkles, Building, CreditCard, DollarSign } from 'lucide-react';

interface AddEmployeeModalProps {
  staffToEdit?: StaffMember | null;
  onSave?: (staff: StaffMember) => void;
  onAdd?: (staff: StaffMember) => void;
  onClose: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  staffToEdit,
  onSave,
  onAdd,
  onClose,
}) => {
  const [name, setName] = useState(staffToEdit?.name || '');
  const [role, setRole] = useState(staffToEdit?.role || 'Sales Associate');
  const [department, setDepartment] = useState(staffToEdit?.department || 'Bridal Atelier');
  const [phone, setPhone] = useState(staffToEdit?.phone || '');
  const [email, setEmail] = useState(staffToEdit?.email || '');
  const [schedule, setSchedule] = useState(staffToEdit?.schedule || '09:30 AM - 07:30 PM');
  const [rating, setRating] = useState(staffToEdit?.rating?.toString() || '4.8');
  
  // Salary and Payroll Setup
  const [salaryType, setSalaryType] = useState<'monthly' | 'daily'>(
    staffToEdit?.salaryType || 'monthly'
  );
  const [baseSalary, setBaseSalary] = useState(
    staffToEdit?.baseSalary?.toString() || '30000'
  );
  const [dailyAllowance, setDailyAllowance] = useState(
    staffToEdit?.dailyAllowance?.toString() || '100'
  );
  const [overtimeRatePerHour, setOvertimeRatePerHour] = useState(
    staffToEdit?.overtimeRatePerHour?.toString() || '200'
  );
  const [advanceTaken, setAdvanceTaken] = useState(
    staffToEdit?.advanceTaken?.toString() || '0'
  );

  // Bank details
  const [bankName, setBankName] = useState(staffToEdit?.bankDetails?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(staffToEdit?.bankDetails?.accountNumber || '');
  const [ifsc, setIfsc] = useState(staffToEdit?.bankDetails?.ifsc || '');
  const [upiId, setUpiId] = useState(staffToEdit?.bankDetails?.upiId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const bankDetails: BankDetails = {
      bankName: bankName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      ifsc: ifsc.trim() || undefined,
      upiId: upiId.trim() || undefined,
    };

    const newStaff: StaffMember = {
      id: staffToEdit?.id || `staff-${Date.now()}`,
      name: name.trim(),
      initials,
      role: role.trim(),
      department: department.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      schedule: schedule.trim(),
      rating: parseFloat(rating) || 4.8,
      status: staffToEdit?.status || 'Present',
      payrollStatus: staffToEdit?.payrollStatus || 'Pending',
      salaryType,
      baseSalary: parseFloat(baseSalary) || 25000,
      dailyAllowance: parseFloat(dailyAllowance) || 0,
      overtimeRatePerHour: parseFloat(overtimeRatePerHour) || 0,
      advanceTaken: parseFloat(advanceTaken) || 0,
      bankDetails,
      joinDate: staffToEdit?.joinDate || new Date().toISOString().split('T')[0],
    };

    const saveHandler = onSave || onAdd;
    if (saveHandler) {
      saveHandler(newStaff);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#14171E] border border-[#2B3342] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        <div className="p-5 sm:p-6 border-b border-[#232832] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F2530] border border-[#2F3947] flex items-center justify-center text-[#E5B842]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
                {staffToEdit ? 'Edit Employee Details' : 'Add New Store Employee'}
              </h3>
              <p className="text-xs text-[#8A95A6]">Configure role, shifts, wage rates & bank details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7E8B9C] hover:text-[#E2E8F0] hover:bg-[#1E232D]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                FULL NAME *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Varma"
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                PHONE NUMBER *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98451 12345"
                className="w-full bg-[#181C23] border border-[#272E3A] text-sm text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                ROLE / DESIGNATION
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Master Goldsmith / Sales Executive"
                className="w-full bg-[#181C23] border border-[#272E3A] text-xs text-[#E2E8F0] rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                DEPARTMENT
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-xs text-[#E2E8F0] rounded-lg px-3 py-2"
              >
                <option value="Bridal Atelier">Bridal Atelier</option>
                <option value="Diamond Gallery">Diamond Gallery</option>
                <option value="Bullion & Vault">Bullion & Vault</option>
                <option value="Billing & Cashier">Billing & Cashier</option>
                <option value="Management">Store Management</option>
                <option value="Security">Security & Logistics</option>
              </select>
            </div>
          </div>

          {/* SALARY STRUCTURE */}
          <div className="p-3.5 bg-[#101318] border border-[#242A34] rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#E5B842]">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Salary & Compensation Structure</span>
              </span>
              <div className="flex items-center gap-1 bg-[#181C23] p-0.5 rounded border border-[#2F3745]">
                <button
                  type="button"
                  onClick={() => setSalaryType('monthly')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    salaryType === 'monthly'
                      ? 'bg-[#E5B842] text-[#111418]'
                      : 'text-[#8A95A6]'
                  }`}
                >
                  Monthly Base
                </button>
                <button
                  type="button"
                  onClick={() => setSalaryType('daily')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    salaryType === 'daily'
                      ? 'bg-[#E5B842] text-[#111418]'
                      : 'text-[#8A95A6]'
                  }`}
                >
                  Daily Wage
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  {salaryType === 'monthly' ? 'Base Salary (₹/mo)' : 'Daily Wage (₹/day)'} *
                </label>
                <input
                  type="number"
                  required
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-[#E5B842] font-bold rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  Daily Allowance (₹)
                </label>
                <input
                  type="number"
                  value={dailyAllowance}
                  onChange={(e) => setDailyAllowance(e.target.value)}
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-[#E2E8F0] rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  OT Rate (₹/hr)
                </label>
                <input
                  type="number"
                  value={overtimeRatePerHour}
                  onChange={(e) => setOvertimeRatePerHour(e.target.value)}
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-[#E2E8F0] rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  Advance Taken (₹)
                </label>
                <input
                  type="number"
                  value={advanceTaken}
                  onChange={(e) => setAdvanceTaken(e.target.value)}
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-rose-400 font-bold rounded px-2.5 py-1.5"
                />
              </div>
            </div>
          </div>

          {/* Bank & UPI Information */}
          <div className="p-3.5 bg-[#101318] border border-[#242A34] rounded-xl space-y-2.5">
            <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#E5B842]" />
              <span>Banking & Direct Payment Info</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  Bank Name & Branch
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank, Jubilee Hills"
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-[#E2E8F0] rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 50100458923145"
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-[#E2E8F0] font-mono rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  placeholder="e.g. HDFC0001234"
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-[#E2E8F0] font-mono rounded px-2.5 py-1.5 uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  UPI ID (GPay / PhonePe)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. rajesh@okhdfcbank"
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-[#E5B842] font-mono rounded px-2.5 py-1.5"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#232832]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#8A95A6] hover:text-[#E2E8F0] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#E5B842] hover:bg-[#F3C757] text-[#121417] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95"
            >
              {staffToEdit ? 'Save Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
