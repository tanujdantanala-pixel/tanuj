import React, { useState } from 'react';
import {
  StaffMember,
  StaffStatus,
  PayrollStatus,
  SalaryPayment,
  AttendanceRecord,
  AppSettings,
} from '../types';
import {
  Search,
  Filter,
  Plus,
  Star,
  CheckCircle,
  Clock,
  Briefcase,
  TrendingUp,
  MoreVertical,
  DollarSign,
  CreditCard,
  Printer,
  Calendar,
  Sparkles,
  Edit3,
  Trash2,
  Users,
  ChevronRight,
  ShieldAlert,
  KeyRound,
  Lock,
} from 'lucide-react';
import { PaySalaryModal } from './modals/PaySalaryModal';
import { SalarySlipModal } from './modals/SalarySlipModal';

interface StaffViewProps {
  staffList: StaffMember[];
  attendanceRecords: AttendanceRecord[];
  salaryPayments: SalaryPayment[];
  settings: AppSettings;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNewStaff: () => void;
  onEditStaff: (staff: StaffMember) => void;
  onUpdateStatus: (id: string, status: StaffStatus) => void;
  onUpdatePayroll: (id: string, payrollStatus: PayrollStatus) => void;
  onDeleteStaff: (id: string) => void;
  onRecordSalaryPayment: (payment: SalaryPayment) => void;
  onDeleteSalaryPayment?: (paymentId: string) => void;
  onLoadSampleStaff?: () => void;
  onNavigateToAttendance?: () => void;
  isMobileLayout?: boolean;
  isOwnerUnlocked?: boolean;
  onRequestOwnerUnlock?: (actionTitle?: string, onApproved?: () => void) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  staffList,
  attendanceRecords,
  salaryPayments,
  settings,
  searchQuery,
  onSearchChange,
  onAddNewStaff,
  onEditStaff,
  onUpdateStatus,
  onUpdatePayroll,
  onDeleteStaff,
  onRecordSalaryPayment,
  onDeleteSalaryPayment,
  onLoadSampleStaff,
  onNavigateToAttendance,
  isMobileLayout,
  isOwnerUnlocked = false,
  onRequestOwnerUnlock,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'payroll_analysis' | 'payment_history'>('payroll_analysis');
  const [selectedStaffForPay, setSelectedStaffForPay] = useState<StaffMember | null>(null);
  const [selectedPaymentForSlip, setSelectedPaymentForSlip] = useState<SalaryPayment | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  if (!isOwnerUnlocked) {
    return (
      <div id="staff-owner-locked" className="p-6 sm:p-12 max-w-xl mx-auto my-12 text-center space-y-6 animate-in fade-in duration-200">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#947124]/30 to-[#E5B842]/20 border border-[#E5B842]/40 flex items-center justify-center mx-auto text-[#E5B842] shadow-2xl">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#E5B842] uppercase tracking-widest bg-[#E5B842]/10 border border-[#E5B842]/20 px-3 py-1 rounded-full">
            OWNER PROTECTED AREA
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#E2E8F0] mt-2">
            Staff & Payroll Suite Locked
          </h2>
          <p className="text-xs sm:text-sm text-[#8A95A6] max-w-md mx-auto">
            Employee salaries, wage formulas, payment disbursements, and staff roster management are restricted to the Store Owner.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onRequestOwnerUnlock?.('Access Staff & Payroll Suite')}
            className="w-full sm:w-auto bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] font-bold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider active:scale-95"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock with Owner PIN</span>
          </button>

          {onNavigateToAttendance && (
            <button
              onClick={onNavigateToAttendance}
              className="w-full sm:w-auto bg-[#171B22] hover:bg-[#202632] text-[#D1D8E0] border border-[#2B3545] font-semibold text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#E5B842]" />
              <span>Go to Attendance Register</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-[#718096] pt-4 border-t border-[#232B38]">
          <span>Store Security: Default PIN is <strong className="text-[#E5B842]">1234</strong> (configurable in Settings).</span>
        </div>
      </div>
    );
  }

  const currentMonthStr = new Date().toISOString().substring(0, 7); // e.g. '2026-08'

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
  );

  // Total payroll calculations for current month
  const totalBaseLiability = staffList.reduce((acc, s) => acc + (s.baseSalary || 0), 0);
  const currentMonthPayments = salaryPayments.filter((p) => p.month === currentMonthStr);
  const totalPaidThisMonth = currentMonthPayments.reduce((acc, p) => acc + (p.netPaid || 0), 0);
  const totalPendingLiability = Math.max(0, totalBaseLiability - totalPaidThisMonth);

  return (
    <div id="staff-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#E5B842] uppercase tracking-widest bg-[#E5B842]/10 border border-[#E5B842]/20 px-2.5 py-0.5 rounded-full">
              STAFF MANAGEMENT & SALARY ENGINE
            </span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#E2E8F0] mt-1">
            Employees & Payroll Analysis
          </h2>
          <p className="text-xs text-[#8A95A6] mt-0.5">
            Monitor daily attendance, compute base & daily wages, and record salary disbursements
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateToAttendance && (
            <button
              onClick={onNavigateToAttendance}
              className="bg-[#1E232D] hover:bg-[#28303E] text-[#E5B842] border border-[#E5B842]/30 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Attendance Register</span>
            </button>
          )}

          <button
            onClick={onAddNewStaff}
            className="bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Salary & Payroll KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Staff</span>
            <Users className="w-4 h-4 text-[#E5B842]" />
          </div>
          <div className="text-xl font-bold text-[#E2E8F0]">{staffList.length}</div>
          <p className="text-[10px] text-[#718096] mt-0.5">Active workforce</p>
        </div>

        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Base Liability</span>
            <DollarSign className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-xl font-bold text-[#38BDF8]">
            {settings.currency} {totalBaseLiability.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-[#718096] mt-0.5">Estimated gross liability</p>
        </div>

        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Paid This Month</span>
            <CheckCircle className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="text-xl font-bold text-[#34D399]">
            {settings.currency} {totalPaidThisMonth.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-[#718096] mt-0.5">Disbursed via UPI/Bank</p>
        </div>

        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Liability</span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-xl font-bold text-[#F59E0B]">
            {settings.currency} {totalPendingLiability.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-[#718096] mt-0.5">Unsettled wages</p>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#232832] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('payroll_analysis')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'payroll_analysis'
                ? 'bg-[#E5B842] text-[#111418] shadow-md'
                : 'text-[#8A95A6] hover:text-[#E2E8F0] hover:bg-[#1A1F29]'
            }`}
          >
            Salary & Wage Analysis
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-[#E5B842] text-[#111418] shadow-md'
                : 'text-[#8A95A6] hover:text-[#E2E8F0] hover:bg-[#1A1F29]'
            }`}
          >
            Staff Directory & Shifts
          </button>
          <button
            onClick={() => setActiveTab('payment_history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'payment_history'
                ? 'bg-[#E5B842] text-[#111418] shadow-md'
                : 'text-[#8A95A6] hover:text-[#E2E8F0] hover:bg-[#1A1F29]'
            }`}
          >
            Payment Slips & Ledger ({salaryPayments.length})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search staff, role, phone..."
              className="w-full bg-[#14171E] border border-[#242A34] text-xs text-[#E2E8F0] pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-[#E5B842]"
            />
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {staffList.length === 0 ? (
        <div className="bg-[#14171E] border border-[#232832] rounded-2xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#1E232E] border border-[#2F3746] flex items-center justify-center mx-auto text-[#E5B842]">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0]">
              No Employees In Store
            </h3>
            <p className="text-xs text-[#8A95A6] max-w-md mx-auto mt-1">
              Your staff list is completely clean. Add your master craftsmen, gemologists, sales executives, and cashier staff to manage salary calculations & biometric daily logs.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onAddNewStaff}
              className="bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-lg uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add First Employee</span>
            </button>

            {onLoadSampleStaff && (
              <button
                onClick={onLoadSampleStaff}
                className="bg-[#1E232E] hover:bg-[#28303E] text-[#E5B842] border border-[#E5B842]/30 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Sample Staff</span>
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* TAB 1: SALARY & WAGE ANALYSIS TABLE */}
      {staffList.length > 0 && activeTab === 'payroll_analysis' && (
        <div className="bg-[#14171E] border border-[#232832] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#101318] border-b border-[#232832] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E2E8F0]">
              <DollarSign className="w-4 h-4 text-[#E5B842]" />
              <span>Monthly Salary Calculation & Payable Analysis ({currentMonthStr})</span>
            </div>
            <span className="text-xs text-[#8A95A6]">
              Calculated dynamically from Calendar Attendance
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E2E8F0]">
              <thead className="bg-[#0E1013] border-b border-[#232832] text-[10px] text-[#718096] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Wage Structure</th>
                  <th className="py-3 px-4 text-center">Month Attendance</th>
                  <th className="py-3 px-4 text-right">Gross Payable</th>
                  <th className="py-3 px-4 text-right">Paid So Far</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Salary Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D222B]">
                {filteredStaff.map((staff) => {
                  // Attendance calculation for current month
                  const monthRecords = attendanceRecords.filter(
                    (r) => r.staffId === staff.id && r.date.startsWith(currentMonthStr)
                  );
                  const daysPresent = monthRecords.filter((r) => r.status === 'Present').length;
                  const daysHalf = monthRecords.filter((r) => r.status === 'Half-day').length;
                  const daysAbsent = monthRecords.filter((r) => r.status === 'Absent').length;
                  const otHours = monthRecords.reduce((acc, r) => acc + (r.overtimeHours || 0), 0);

                  // Base salary calculation
                  const calculatedEarned =
                    staff.salaryType === 'daily'
                      ? (staff.baseSalary || 1000) * daysPresent + ((staff.baseSalary || 1000) / 2) * daysHalf
                      : ((staff.baseSalary || 30000) / 30) * daysPresent +
                        ((staff.baseSalary || 30000) / 60) * daysHalf;

                  const otPay = otHours * (staff.overtimeRatePerHour || 200);
                  const allowance = daysPresent * (staff.dailyAllowance || 0);
                  const grossPayable = Math.max(0, Math.round(calculatedEarned + otPay + allowance + (staff.bonus || 0) - (staff.deductions || 0) - (staff.advanceTaken || 0)));

                  // Payments made for this staff this month
                  const paidRecords = salaryPayments.filter(
                    (p) => p.staffId === staff.id && p.month === currentMonthStr
                  );
                  const totalPaid = paidRecords.reduce((acc, p) => acc + p.netPaid, 0);

                  const isCleared = totalPaid >= (grossPayable > 0 ? grossPayable : staff.baseSalary);

                  return (
                    <tr key={staff.id} className="hover:bg-[#171B24] transition-colors">
                      {/* Staff Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1E2530] border border-[#2F3746] flex items-center justify-center font-bold text-xs text-[#E5B842] shrink-0">
                            {staff.initials}
                          </div>
                          <div>
                            <div className="font-bold text-[#E2E8F0]">{staff.name}</div>
                            <div className="text-[11px] text-[#718096]">
                              {staff.role} • {staff.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Salary Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-[#E5B842]">
                          {settings.currency} {staff.baseSalary.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-[#718096]">
                          {staff.salaryType === 'monthly' ? 'Monthly Base' : 'Daily Wage'}
                          {staff.dailyAllowance ? ` + ₹${staff.dailyAllowance}/day` : ''}
                        </div>
                      </td>

                      {/* Attendance Summary */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-[#0E1013] border border-[#232832] px-2.5 py-1 rounded-lg text-[11px]">
                          <span className="text-emerald-400 font-bold">{daysPresent}P</span>
                          <span className="text-[#718096]">•</span>
                          <span className="text-amber-400 font-bold">{daysHalf}H</span>
                          <span className="text-[#718096]">•</span>
                          <span className="text-rose-400 font-bold">{daysAbsent}A</span>
                          {otHours > 0 && (
                            <>
                              <span className="text-[#718096]">•</span>
                              <span className="text-[#E5B842] font-bold">{otHours}h OT</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Gross Payable */}
                      <td className="py-3.5 px-4 text-right font-bold text-[#E2E8F0]">
                        {settings.currency} {grossPayable.toLocaleString('en-IN')}
                      </td>

                      {/* Paid So Far */}
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {settings.currency} {totalPaid.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isCleared
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                              : totalPaid > 0
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isCleared ? 'CLEARED' : totalPaid > 0 ? 'PARTIAL' : 'PENDING'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedStaffForPay(staff)}
                          className="px-3 py-1.5 bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] rounded-lg font-bold text-xs flex items-center gap-1.5 ml-auto shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Process Salary</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF DIRECTORY & ROSTER */}
      {staffList.length > 0 && activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-[#14171E] border border-[#232832] hover:border-[#384252] rounded-2xl p-5 space-y-4 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1E2530] to-[#2B3545] border border-[#374357] flex items-center justify-center font-bold text-sm text-[#E5B842] shadow-inner">
                      {staff.initials}
                    </div>
                    <div>
                      <h3 className="font-serif-luxury text-base font-bold text-[#E2E8F0]">
                        {staff.name}
                      </h3>
                      <p className="text-xs text-[#8A95A6]">{staff.role}</p>
                      <p className="text-[10px] text-[#718096]">{staff.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditStaff(staff)}
                      className="w-7 h-7 rounded-lg text-[#718096] hover:text-[#E5B842] hover:bg-[#1E2530] flex items-center justify-center cursor-pointer transition-colors"
                      title="Edit Employee"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteStaff(staff.id)}
                      className="w-7 h-7 rounded-lg text-[#718096] hover:text-rose-400 hover:bg-[#1E2530] flex items-center justify-center cursor-pointer transition-colors"
                      title="Delete Employee (Undo available for 30s)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-[#0E1013] rounded-lg border border-[#212630]">
                    <span className="text-[#718096]">Phone:</span>
                    <span className="font-mono text-[#E2E8F0]">{staff.phone}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#0E1013] rounded-lg border border-[#212630]">
                    <span className="text-[#718096]">Base Salary:</span>
                    <span className="font-bold text-[#E5B842]">
                      {settings.currency} {staff.baseSalary.toLocaleString('en-IN')} (
                      {staff.salaryType})
                    </span>
                  </div>
                  {staff.bankDetails?.upiId && (
                    <div className="flex items-center justify-between p-2 bg-[#0E1013] rounded-lg border border-[#212630]">
                      <span className="text-[#718096]">UPI ID:</span>
                      <span className="font-mono text-[#38BDF8] text-[11px]">
                        {staff.bankDetails.upiId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#20252E] flex items-center justify-between">
                <button
                  onClick={() =>
                    onUpdateStatus(
                      staff.id,
                      staff.status === 'Present' ? 'Absent' : 'Present'
                    )
                  }
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                    staff.status === 'Present'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  Status: {staff.status}
                </button>

                <button
                  onClick={() => setSelectedStaffForPay(staff)}
                  className="px-3 py-1 bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Pay Wage</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SALARY PAYMENT SLIPS & VOUCHERS LEDGER */}
      {activeTab === 'payment_history' && (
        <div className="bg-[#14171E] border border-[#232832] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#101318] border-b border-[#232832] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E2E8F0]">
              <Printer className="w-4 h-4 text-[#E5B842]" />
              <span>Official Salary Payment Vouchers & Slips</span>
            </div>
            <span className="text-xs text-[#8A95A6]">
              {salaryPayments.length} Payment Vouchers Recorded
            </span>
          </div>

          {salaryPayments.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#718096]">
              No salary payments recorded yet. Click "Process Salary" in the Salary & Wage Analysis tab to disburse employee pay.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#E2E8F0]">
                <thead className="bg-[#0E1013] border-b border-[#232832] text-[10px] text-[#718096] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Voucher No</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4">Disbursement Date</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Net Amount Paid</th>
                    <th className="py-3 px-4 text-right">Print Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D222B]">
                  {salaryPayments.map((pay) => {
                    const staffObj = staffList.find((s) => s.id === pay.staffId);
                    return (
                      <tr key={pay.id} className="hover:bg-[#171B24] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[#E5B842] font-bold">
                          {pay.referenceNo || pay.id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#E2E8F0]">
                          {pay.staffName}
                        </td>
                        <td className="py-3.5 px-4 text-[#8A95A6]">{pay.month}</td>
                        <td className="py-3.5 px-4 text-[#8A95A6]">{pay.paymentDate}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-[#101318] border border-[#27303E] rounded text-[11px] text-[#38BDF8]">
                            {pay.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                          {settings.currency} {pay.netPaid.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedPaymentForSlip(pay)}
                            className="px-3 py-1 bg-[#1E2530] hover:bg-[#2B3545] text-[#E5B842] border border-[#E5B842]/30 rounded-lg font-bold text-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View Slip</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pay Salary Modal */}
      {selectedStaffForPay && (
        <PaySalaryModal
          staff={selectedStaffForPay}
          attendanceRecords={attendanceRecords}
          settings={settings}
          onRecordPayment={onRecordSalaryPayment}
          onClose={() => setSelectedStaffForPay(null)}
        />
      )}

      {/* Salary Slip Modal */}
      {selectedPaymentForSlip && (
        <SalarySlipModal
          payment={selectedPaymentForSlip}
          staff={staffList.find((s) => s.id === selectedPaymentForSlip.staffId)}
          settings={settings}
          onClose={() => setSelectedPaymentForSlip(null)}
        />
      )}
    </div>
  );
};
