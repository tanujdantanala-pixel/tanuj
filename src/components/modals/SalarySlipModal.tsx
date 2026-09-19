import React, { useRef } from 'react';
import { SalaryPayment, StaffMember, AppSettings } from '../../types';
import { X, Printer, Sparkles, Download, CheckCircle, Building } from 'lucide-react';

interface SalarySlipModalProps {
  payment: SalaryPayment;
  staff?: StaffMember;
  settings: AppSettings;
  onClose: () => void;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  payment,
  staff,
  settings,
  onClose,
}) => {
  const slipRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#14171E] border border-[#2B3342] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-[#232832] flex items-center justify-between bg-[#101318]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E5B842]">
            <Sparkles className="w-4 h-4" />
            <span>OFFICIAL LUXURY SALARY PAY SLIP</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7E8B9C] hover:text-[#E2E8F0] hover:bg-[#1E232D]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Pay Slip Body */}
        <div ref={slipRef} className="p-6 sm:p-8 space-y-6 text-xs text-[#E2E8F0] bg-[#14171D]">
          {/* Header */}
          <div className="text-center pb-4 border-b border-[#2B3342] space-y-1">
            <h2 className="font-serif-luxury text-xl font-bold text-[#E5B842] tracking-wider uppercase">
              {settings.storeName}
            </h2>
            <p className="text-[11px] text-[#A0AEC0]">{settings.address || 'Main Bullion Bazaar, Hyderabad'}</p>
            <p className="text-[10px] text-[#718096]">
              GSTIN: {settings.gstin || '36AAACS1429K1Z5'} • Phone: {settings.phone || '+91 98765 00000'}
            </p>
            <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-[#E5B842]/10 border border-[#E5B842]/20 text-[10px] font-bold text-[#E5B842] uppercase tracking-widest">
              MONTHLY SALARY SLIP • {payment.month}
            </div>
          </div>

          {/* Employee & Payment Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 p-3.5 bg-[#0E1013] border border-[#232832] rounded-xl text-xs">
            <div className="space-y-1">
              <div className="text-[#718096] text-[10px] uppercase font-bold">EMPLOYEE DETAILS</div>
              <div className="font-bold text-[#E2E8F0] text-sm">{payment.staffName}</div>
              <div className="text-[#8A95A6] text-[11px]">
                {staff?.role || 'Staff Member'} • {staff?.department || 'Operations'}
              </div>
              <div className="text-[#718096] text-[10px]">Phone: {staff?.phone || 'N/A'}</div>
            </div>

            <div className="space-y-1 text-right">
              <div className="text-[#718096] text-[10px] uppercase font-bold">VOUCHER DETAILS</div>
              <div className="font-mono text-[#E5B842] font-bold">{payment.referenceNo || payment.id}</div>
              <div className="text-[#8A95A6] text-[11px]">Date: {payment.paymentDate}</div>
              <div className="text-[#34D399] font-bold text-[11px]">
                Method: {payment.paymentMethod} ({payment.status})
              </div>
            </div>
          </div>

          {/* Attendance Breakdown */}
          <div className="grid grid-cols-4 gap-2 text-center p-2.5 bg-[#101318] border border-[#232832] rounded-xl text-[11px]">
            <div>
              <div className="text-[#718096] text-[10px]">Present</div>
              <div className="font-bold text-emerald-400">{payment.daysPresent} Days</div>
            </div>
            <div>
              <div className="text-[#718096] text-[10px]">Half-Day</div>
              <div className="font-bold text-amber-400">{payment.daysHalf} Days</div>
            </div>
            <div>
              <div className="text-[#718096] text-[10px]">Absent</div>
              <div className="font-bold text-rose-400">{payment.daysAbsent} Days</div>
            </div>
            <div>
              <div className="text-[#718096] text-[10px]">OT Hours</div>
              <div className="font-bold text-[#E5B842]">{payment.overtimeHours} hrs</div>
            </div>
          </div>

          {/* Earnings & Deductions Table */}
          <div className="border border-[#2B3342] rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 bg-[#101318] border-b border-[#2B3342] p-2.5 font-bold text-[10px] text-[#A0AEC0] uppercase tracking-wider">
              <div>EARNINGS (₹)</div>
              <div className="text-right">DEDUCTIONS (₹)</div>
            </div>

            <div className="divide-y divide-[#1F2530] text-xs">
              <div className="grid grid-cols-2 p-2.5">
                <div>
                  <span className="text-[#8A95A6]">Base Pay Earned:</span>
                  <span className="ml-2 font-bold text-[#E2E8F0]">
                    {settings.currency} {payment.baseSalary.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#8A95A6]">Advance Recovered:</span>
                  <span className="ml-2 font-bold text-rose-400">
                    - {settings.currency} {(payment.advanceDeducted || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-2.5">
                <div>
                  <span className="text-[#8A95A6]">Daily Allowance:</span>
                  <span className="ml-2 font-bold text-[#E2E8F0]">
                    + {settings.currency} {(payment.allowance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#8A95A6]">Penalties / TDS:</span>
                  <span className="ml-2 font-bold text-rose-400">
                    - {settings.currency} {(payment.deductions || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 p-2.5">
                <div>
                  <span className="text-[#8A95A6]">OT Pay + Bonus:</span>
                  <span className="ml-2 font-bold text-emerald-400">
                    + {settings.currency} {((payment.overtimePay || 0) + (payment.bonus || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right text-[#718096] text-[10px]">
                  Total Deductions: {settings.currency} {((payment.advanceDeducted || 0) + (payment.deductions || 0)).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Total Paid Row */}
            <div className="bg-[#181D26] p-3 border-t border-[#2B3342] flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider">
                  TOTAL NET SALARY DISBURSED
                </div>
                <div className="text-[10px] text-[#34D399] font-semibold">Payment Status: {payment.status}</div>
              </div>
              <div className="text-xl font-serif-luxury font-bold text-[#E5B842]">
                {settings.currency} {payment.netPaid.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10px] text-[#718096]">
            <div>
              <div className="border-t border-[#374151] pt-1 font-semibold text-[#A0AEC0]">
                Employee Signature / Acknowledgement
              </div>
            </div>
            <div>
              <div className="border-t border-[#374151] pt-1 font-semibold text-[#A0AEC0]">
                Authorized Signatory ({settings.storeName})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
