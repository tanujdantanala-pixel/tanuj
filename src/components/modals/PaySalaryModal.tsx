import React, { useState } from 'react';
import { StaffMember, SalaryPayment, AttendanceRecord, AppSettings } from '../../types';
import {
  X,
  CreditCard,
  Sparkles,
  Calculator,
  IndianRupee,
  CheckCircle,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface PaySalaryModalProps {
  staff: StaffMember;
  attendanceRecords: AttendanceRecord[];
  settings: AppSettings;
  onRecordPayment: (payment: SalaryPayment) => void;
  onClose: () => void;
}

export const PaySalaryModal: React.FC<PaySalaryModalProps> = ({
  staff,
  attendanceRecords,
  settings,
  onRecordPayment,
  onClose,
}) => {
  const currentMonthStr = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Filter attendance records for this employee in the selected month
  const monthRecords = attendanceRecords.filter(
    (r) => r.staffId === staff.id && r.date.startsWith(selectedMonth)
  );

  const initialDaysPresent = monthRecords.filter((r) => r.status === 'Present').length;
  const initialDaysHalf = monthRecords.filter((r) => r.status === 'Half-day').length;
  const initialDaysAbsent = monthRecords.filter((r) => r.status === 'Absent').length;
  const initialOtHours = monthRecords.reduce((acc, r) => acc + (r.overtimeHours || 0), 0);

  // Editable breakdown states
  const [daysPresent, setDaysPresent] = useState<number>(initialDaysPresent || 26);
  const [daysHalf, setDaysHalf] = useState<number>(initialDaysHalf || 0);
  const [daysAbsent, setDaysAbsent] = useState<number>(initialDaysAbsent || 4);
  const [overtimeHours, setOvertimeHours] = useState<number>(initialOtHours || 0);

  const [baseSalary, setBaseSalary] = useState<number>(staff.baseSalary || 35000);
  const [bonus, setBonus] = useState<number>(staff.bonus || 0);
  const [allowancePerDay, setAllowancePerDay] = useState<number>(staff.dailyAllowance || 0);
  const [deductions, setDeductions] = useState<number>(staff.deductions || 0);
  const [advanceDeducted, setAdvanceDeducted] = useState<number>(staff.advanceTaken || 0);

  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [referenceNo, setReferenceNo] = useState<string>(
    `PAY-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [notes, setNotes] = useState<string>('Monthly salary settlement');

  // Mathematical Calculation
  const totalDaysInMonth = 30;
  const calculatedBasePay =
    staff.salaryType === 'daily'
      ? baseSalary * daysPresent + (baseSalary / 2) * daysHalf
      : (baseSalary / totalDaysInMonth) * daysPresent + (baseSalary / (totalDaysInMonth * 2)) * daysHalf;

  const totalAllowance = allowancePerDay * daysPresent;
  const overtimeRate = staff.overtimeRatePerHour || 200;
  const calculatedOtPay = overtimeHours * overtimeRate;

  const totalEarnings = calculatedBasePay + totalAllowance + calculatedOtPay + bonus;
  const totalDeductions = deductions + advanceDeducted;
  const netPayable = Math.max(0, Math.round(totalEarnings - totalDeductions));

  const [amountPaying, setAmountPaying] = useState<number>(netPayable);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payment: SalaryPayment = {
      id: `sal-pay-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.name,
      month: selectedMonth,
      paymentDate,
      baseSalary,
      daysPresent,
      daysHalf,
      daysAbsent,
      overtimeHours,
      overtimePay: calculatedOtPay,
      allowance: totalAllowance,
      bonus,
      deductions,
      advanceDeducted,
      netPayable,
      netPaid: amountPaying,
      paymentMethod,
      referenceNo: referenceNo.trim() || undefined,
      notes: notes.trim() || undefined,
      status: amountPaying >= netPayable ? 'PAID' : 'PARTIAL',
    };

    onRecordPayment(payment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#14171E] border border-[#2B3342] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#232832] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F2530] border border-[#2F3947] flex items-center justify-center text-[#E5B842]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
                Process Salary Payment
              </h3>
              <p className="text-xs text-[#8A95A6]">
                {staff.name} • {staff.role} ({staff.department})
              </p>
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
          {/* Month & Date Selection */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#0E1013] border border-[#232832] rounded-xl">
            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                SALARY FOR MONTH
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-[#161A22] border border-[#2A3342] text-xs text-[#E5B842] font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#E5B842]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                PAYMENT DATE
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-[#161A22] border border-[#2A3342] text-xs text-[#E2E8F0] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#E5B842]"
              />
            </div>
          </div>

          {/* Attendance Breakdown Input */}
          <div className="p-3.5 bg-[#101318] border border-[#242A34] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#E5B842]">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                <span>Attendance Log (Auto-Synced from Calendar)</span>
              </div>
              <span className="text-[11px] text-[#8A95A6] font-normal">30-Day Base</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  Days Present
                </label>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={daysPresent}
                  onChange={(e) => setDaysPresent(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-emerald-400 font-bold rounded px-2 py-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  Half-Days (50%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={daysHalf}
                  onChange={(e) => setDaysHalf(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-amber-400 font-bold rounded px-2 py-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  Days Absent
                </label>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={daysAbsent}
                  onChange={(e) => setDaysAbsent(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-rose-400 font-bold rounded px-2 py-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#718096] uppercase font-bold block mb-1">
                  OT Hours ({settings.currency}{overtimeRate}/h)
                </label>
                <input
                  type="number"
                  min="0"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#181C23] border border-[#2F3745] text-xs text-[#E5B842] font-bold rounded px-2 py-1.5"
                />
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Earnings */}
            <div className="p-3 bg-[#101318] border border-[#242A34] rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                EARNINGS (+)
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8A95A6]">Base Pay Calculated:</span>
                  <span className="text-[#E2E8F0] font-bold">
                    {settings.currency} {Math.round(calculatedBasePay).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8A95A6]">Daily Allowances:</span>
                  <span className="text-[#E2E8F0] font-bold">
                    + {settings.currency} {totalAllowance.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8A95A6]">Overtime Earnings:</span>
                  <span className="text-[#E2E8F0] font-bold">
                    + {settings.currency} {Math.round(calculatedOtPay).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#232832]">
                  <span className="text-[#8A95A6]">Special Performance Bonus:</span>
                  <input
                    type="number"
                    value={bonus}
                    onChange={(e) => setBonus(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-[#181C23] border border-[#2F3745] text-xs text-emerald-400 font-bold rounded px-2 py-1 text-right"
                  />
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="p-3 bg-[#101318] border border-[#242A34] rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                DEDUCTIONS (-)
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8A95A6]">Advance Salary Deducted:</span>
                  <input
                    type="number"
                    value={advanceDeducted}
                    onChange={(e) => setAdvanceDeducted(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-[#181C23] border border-[#2F3745] text-xs text-rose-400 font-bold rounded px-2 py-1 text-right"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8A95A6]">Penalties / Other Deductions:</span>
                  <input
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-[#181C23] border border-[#2F3745] text-xs text-rose-400 font-bold rounded px-2 py-1 text-right"
                  />
                </div>

                <div className="pt-2 text-[10px] text-[#718096]">
                  {staff.bankDetails?.upiId && (
                    <div>UPI: {staff.bankDetails.upiId}</div>
                  )}
                  {staff.bankDetails?.accountNumber && (
                    <div>A/C: {staff.bankDetails.accountNumber} ({staff.bankDetails.bankName})</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Net Payable Banner */}
          <div className="p-4 bg-gradient-to-r from-[#181E28] to-[#252E3E] border border-[#3B465A] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block">
                NET PAYABLE SALARY
              </span>
              <div className="text-2xl font-serif-luxury font-bold text-[#E5B842]">
                {settings.currency} {netPayable.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="text-right">
              <label className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider block mb-1">
                AMOUNT TO PAY NOW
              </label>
              <input
                type="number"
                value={amountPaying}
                onChange={(e) => setAmountPaying(parseFloat(e.target.value) || 0)}
                className="w-32 bg-[#101318] border border-[#E5B842] text-sm text-[#E5B842] font-bold rounded-lg px-2.5 py-1.5 text-right"
              />
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                PAYMENT METHOD
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-xs text-[#E2E8F0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#E5B842]"
              >
                <option value="UPI">UPI Transfer (GPay / PhonePe / Paytm)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT / IMPS / RTGS)</option>
                <option value="Cash">Cash Voucher</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                TRANSACTION / VOUCHER REF NO
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full bg-[#181C23] border border-[#272E3A] text-xs text-[#E2E8F0] rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Form Actions */}
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
              className="px-6 py-2.5 rounded-lg bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm & Record Salary Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
