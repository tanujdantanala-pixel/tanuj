import React, { useState } from 'react';
import { StaffMember, AttendanceRecord, AttendanceStatus, AppSettings } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Clock,
  Check,
  Sparkles,
  Search,
  Filter,
  Users,
  AlertCircle,
  Plus,
  Lock,
  ShieldCheck,
} from 'lucide-react';

interface AttendanceViewProps {
  staffList: StaffMember[];
  attendanceRecords: AttendanceRecord[];
  settings: AppSettings;
  onUpdateAttendance?: (records: AttendanceRecord[]) => void;
  onMarkAttendance?: (
    staffId: string,
    date: string,
    status: AttendanceStatus,
    overtimeHours?: number,
    notes?: string
  ) => void;
  onBulkMarkAttendance?: (date: string, status: AttendanceStatus) => void;
  onNavigateToPayroll?: () => void;
  onNavigateToStaff?: () => void;
  onAddEmployeeClick?: () => void;
  onAddNewStaff?: () => void;
  isMobileLayout?: boolean;
  isOwnerUnlocked?: boolean;
  onRequestOwnerUnlock?: (actionTitle?: string, onApproved?: () => void) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  staffList,
  attendanceRecords,
  settings,
  onUpdateAttendance,
  onMarkAttendance,
  onBulkMarkAttendance,
  onNavigateToPayroll,
  onNavigateToStaff,
  onAddEmployeeClick,
  onAddNewStaff,
  isMobileLayout,
  isOwnerUnlocked = false,
  onRequestOwnerUnlock,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<'daily' | 'calendar'>('daily');
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);

  const navigateToSalaryOrStaff = onNavigateToPayroll || onNavigateToStaff;
  const triggerAddStaff = onAddEmployeeClick || onAddNewStaff;

  const showSaveNotice = (msg: string) => {
    setLastSavedNotice(msg);
    setTimeout(() => {
      setLastSavedNotice(null);
    }, 2500);
  };

  // Month navigation helpers
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Days in current month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper to get record for staff on a specific date
  const getRecord = (staffId: string, date: string): AttendanceRecord | undefined => {
    return attendanceRecords.find((r) => r.staffId === staffId && r.date === date);
  };

  // Mark single employee status for selected date
  const handleMarkStatus = (
    staffId: string,
    status: AttendanceStatus,
    overtimeHours?: number,
    notes?: string
  ) => {
    if (onMarkAttendance) {
      onMarkAttendance(staffId, selectedDate, status, overtimeHours, notes);
      showSaveNotice(`Marked ${status} for ${selectedDate}`);
      return;
    }

    const existingIndex = attendanceRecords.findIndex(
      (r) => r.staffId === staffId && r.date === selectedDate
    );

    const staffObj = staffList.find((s) => s.id === staffId);

    const newRecord: AttendanceRecord = {
      id: `${staffId}_${selectedDate}`,
      staffId,
      staffName: staffObj?.name || 'Staff',
      date: selectedDate,
      status,
      checkInTime: status === 'Present' || status === 'Half-day' ? '09:30 AM' : undefined,
      checkOutTime: status === 'Present' ? '07:30 PM' : status === 'Half-day' ? '02:00 PM' : undefined,
      overtimeHours: overtimeHours !== undefined ? overtimeHours : (existingIndex >= 0 ? attendanceRecords[existingIndex].overtimeHours : 0),
      notes: notes !== undefined ? notes : (existingIndex >= 0 ? attendanceRecords[existingIndex].notes : ''),
    };

    let updatedList = [...attendanceRecords];
    if (existingIndex >= 0) {
      updatedList[existingIndex] = newRecord;
    } else {
      updatedList.push(newRecord);
    }
    
    if (onUpdateAttendance) {
      onUpdateAttendance(updatedList);
    }
    showSaveNotice(`Marked ${status} for ${selectedDate}`);
  };

  // Quick action: Mark all filtered staff present for selected date
  const handleMarkAllPresent = () => {
    if (onBulkMarkAttendance) {
      onBulkMarkAttendance(selectedDate, 'Present');
      showSaveNotice(`All staff marked Present for ${selectedDate}`);
      return;
    }

    let updatedList = [...attendanceRecords];
    staffList.forEach((staff) => {
      const existingIndex = updatedList.findIndex(
        (r) => r.staffId === staff.id && r.date === selectedDate
      );
      const record: AttendanceRecord = {
        id: `${staff.id}_${selectedDate}`,
        staffId: staff.id,
        staffName: staff.name,
        date: selectedDate,
        status: 'Present',
        checkInTime: '09:30 AM',
        checkOutTime: '07:30 PM',
        overtimeHours: 0,
      };
      if (existingIndex >= 0) {
        updatedList[existingIndex] = record;
      } else {
        updatedList.push(record);
      }
    });

    if (onUpdateAttendance) {
      onUpdateAttendance(updatedList);
    }
    showSaveNotice(`All staff marked Present for ${selectedDate}`);
  };

  const handleMarkStatusWithLock = (
    staffId: string,
    status: AttendanceStatus,
    overtimeHours?: number,
    notes?: string
  ) => {
    if (!isOwnerUnlocked && onRequestOwnerUnlock) {
      onRequestOwnerUnlock('Mark Staff Attendance', () => {
        handleMarkStatus(staffId, status, overtimeHours, notes);
      });
      return;
    }
    handleMarkStatus(staffId, status, overtimeHours, notes);
  };

  const handleMarkAllPresentWithLock = () => {
    if (!isOwnerUnlocked && onRequestOwnerUnlock) {
      onRequestOwnerUnlock('Bulk Mark Attendance', () => {
        handleMarkAllPresent();
      });
      return;
    }
    handleMarkAllPresent();
  };

  // Selected date statistics
  const selectedDateRecords = attendanceRecords.filter((r) => r.date === selectedDate);
  const presentTodayCount = staffList.filter((s) => {
    const rec = getRecord(s.id, selectedDate);
    return rec?.status === 'Present';
  }).length;

  const halfDayTodayCount = staffList.filter((s) => {
    const rec = getRecord(s.id, selectedDate);
    return rec?.status === 'Half-day';
  }).length;

  const absentTodayCount = staffList.filter((s) => {
    const rec = getRecord(s.id, selectedDate);
    return rec?.status === 'Absent';
  }).length;

  const unmarkedCount = staffList.length - (presentTodayCount + halfDayTodayCount + absentTodayCount);

  const filteredStaff = staffList.filter((staff) =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="attendance-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#E5B842] uppercase tracking-widest bg-[#E5B842]/10 border border-[#E5B842]/20 px-2.5 py-0.5 rounded-full">
              DAILY BIOMETRIC & ATTENDANCE REGISTER
            </span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#E2E8F0] mt-1">
            Employee Attendance Calendar
          </h2>
          <p className="text-xs text-[#8A95A6] mt-0.5">
            Log daily punch-ins, overtime, half-days & sync with monthly payroll automatically
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastSavedNotice && (
            <div className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg animate-pulse">
              <Check className="w-3.5 h-3.5" />
              <span>{lastSavedNotice}</span>
            </div>
          )}

          {navigateToSalaryOrStaff && (
            <button
              onClick={navigateToSalaryOrStaff}
              className="bg-[#1E232D] hover:bg-[#28303E] text-[#E5B842] border border-[#E5B842]/30 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Salary & Payroll Analysis</span>
            </button>
          )}

          {staffList.length > 0 && (
            <button
              onClick={handleMarkAllPresentWithLock}
              className="bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              title={isOwnerUnlocked ? 'Mark all staff present' : 'Mark all present (Owner PIN Required)'}
            >
              {isOwnerUnlocked ? (
                <UserCheck className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Lock className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>Mark All Present Today</span>
            </button>
          )}
        </div>
      </div>

      {/* Staff / Owner Access Notice Banner */}
      {!isOwnerUnlocked ? (
        <div className="bg-[#141822] border border-[#2B3545] rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-[#94A3B8]">
            <div className="w-8 h-8 rounded-lg bg-[#1E2532] border border-[#2E394A] flex items-center justify-center text-[#E5B842] shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#E2E8F0]">Staff Access Mode: Attendance Register is Read-Only</span>
              <p className="text-[11px] text-[#808E9F] mt-0.5">
                Employees can browse calendar dates and daily status logs. Marking attendance, bulk punching, and overtime hours require Owner PIN verification.
              </p>
            </div>
          </div>
          <button
            onClick={() => onRequestOwnerUnlock?.('Authorize Attendance Changes')}
            className="px-4 py-2 bg-[#E5B842]/10 border border-[#E5B842]/40 hover:bg-[#E5B842]/20 text-[#E5B842] rounded-lg font-bold text-xs uppercase tracking-wider transition-all shrink-0 cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Unlock Owner</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#141C24] border border-[#E5B842]/30 rounded-xl px-5 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#E5B842]">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold text-xs">Owner Mode Active: Daily Punch & Biometric Register Adjustments Unlocked</span>
          </div>
        </div>
      )}

      {/* Date Selector & Metric Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Register Date</span>
            <CalendarIcon className="w-4 h-4 text-[#E5B842]" />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#0E1013] border border-[#2A3342] text-xs font-bold text-[#E5B842] px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#E5B842]"
          />
          <div className="text-[10px] text-[#718096] mt-1">
            {selectedDate === todayStr ? 'Today (Active)' : 'Selected Date'}
          </div>
        </div>

        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Present On Date</span>
            <UserCheck className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="text-xl font-bold text-[#34D399]">
            {presentTodayCount} / {staffList.length}
          </div>
          <p className="text-[10px] text-[#718096] mt-0.5">Full shifts recorded</p>
        </div>

        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Half-Days / Leave</span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-xl font-bold text-[#F59E0B]">{halfDayTodayCount}</div>
          <p className="text-[10px] text-[#718096] mt-0.5">50% wage calculated</p>
        </div>

        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Absent / Unmarked</span>
            <UserX className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-xl font-bold text-[#EF4444]">{absentTodayCount + unmarkedCount}</div>
          <p className="text-[10px] text-[#718096] mt-0.5">{absentTodayCount} marked absent</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#232832] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('daily')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewTab === 'daily'
                ? 'bg-[#E5B842] text-[#111418] shadow-md'
                : 'text-[#8A95A6] hover:text-[#E2E8F0] hover:bg-[#1A1F29]'
            }`}
          >
            Daily Punch Register
          </button>
          <button
            onClick={() => setViewTab('calendar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewTab === 'calendar'
                ? 'bg-[#E5B842] text-[#111418] shadow-md'
                : 'text-[#8A95A6] hover:text-[#E2E8F0] hover:bg-[#1A1F29]'
            }`}
          >
            Monthly Calendar Grid
          </button>
        </div>

        <div className="w-60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff name..."
              className="w-full bg-[#14171E] border border-[#242A34] text-xs text-[#E2E8F0] pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-[#E5B842]"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: DAILY PUNCH REGISTER */}
      {viewTab === 'daily' && (
        <div className="space-y-4">
          {filteredStaff.length === 0 ? (
            <div className="bg-[#14171E] border border-[#232832] rounded-2xl p-10 text-center space-y-4">
              <Users className="w-12 h-12 mx-auto text-[#718096] opacity-50" />
              <div>
                <h3 className="font-serif-luxury text-base font-bold text-[#E2E8F0]">
                  No Employees Found
                </h3>
                <p className="text-xs text-[#8A95A6] max-w-sm mx-auto mt-1">
                  Add your employees in the Employees & Salary tab first to start marking daily attendance.
                </p>
              </div>
              {triggerAddStaff && (
                <button
                  onClick={triggerAddStaff}
                  className="bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] font-bold text-xs px-4 py-2 rounded-lg cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Employee</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-[#14171E] border border-[#232832] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-[#101318] border-b border-[#232832] flex items-center justify-between">
                <span className="text-xs font-bold text-[#E2E8F0] flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#E5B842]" />
                  <span>Attendance for {selectedDate}</span>
                </span>
                <span className="text-xs text-[#8A95A6]">
                  {presentTodayCount} Present • {halfDayTodayCount} Half-day • {absentTodayCount} Absent
                </span>
              </div>

              <div className="divide-y divide-[#1D222B]">
                {filteredStaff.map((staff) => {
                  const record = getRecord(staff.id, selectedDate);
                  const status = record?.status;

                  return (
                    <div
                      key={staff.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#171B24] transition-colors"
                    >
                      {/* Employee Info */}
                      <div className="flex items-center gap-3 min-w-0 md:w-1/3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1E2530] to-[#2B3545] border border-[#374357] flex items-center justify-center font-bold text-xs text-[#E5B842] shrink-0">
                          {staff.initials || staff.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-serif-luxury text-sm font-bold text-[#E2E8F0] truncate">
                            {staff.name}
                          </h4>
                          <p className="text-[11px] text-[#8A95A6] truncate">
                            {staff.role} • {staff.department}
                          </p>
                        </div>
                      </div>

                      {/* Status Selector Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleMarkStatusWithLock(staff.id, 'Present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-[#101318] text-[#8A95A6] hover:text-emerald-400 hover:bg-[#1E2530] border border-[#27303E]'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          onClick={() => handleMarkStatusWithLock(staff.id, 'Half-day')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            status === 'Half-day'
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-[#101318] text-[#8A95A6] hover:text-amber-400 hover:bg-[#1E2530] border border-[#27303E]'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Half-Day</span>
                        </button>

                        <button
                          onClick={() => handleMarkStatusWithLock(staff.id, 'Absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            status === 'Absent'
                              ? 'bg-rose-600 text-white shadow-md'
                              : 'bg-[#101318] text-[#8A95A6] hover:text-rose-400 hover:bg-[#1E2530] border border-[#27303E]'
                          }`}
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        <button
                          onClick={() => handleMarkStatusWithLock(staff.id, 'Leave')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            status === 'Leave'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-[#101318] text-[#8A95A6] hover:text-blue-400 hover:bg-[#1E2530] border border-[#27303E]'
                          }`}
                        >
                          <span>Paid Leave</span>
                        </button>
                      </div>

                      {/* Overtime & Timing */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-[#101318] border border-[#242A34] px-2.5 py-1 rounded-lg">
                          <span className="text-[10px] text-[#718096]">OT (hrs):</span>
                          <input
                            type="number"
                            min="0"
                            max="12"
                            readOnly={!isOwnerUnlocked}
                            value={record?.overtimeHours || 0}
                            onClick={() => {
                              if (!isOwnerUnlocked && onRequestOwnerUnlock) {
                                onRequestOwnerUnlock('Adjust Overtime Hours');
                              }
                            }}
                            onChange={(e) =>
                              handleMarkStatusWithLock(
                                staff.id,
                                status || 'Present',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-10 bg-transparent text-xs text-[#E5B842] font-bold text-center focus:outline-none"
                          />
                        </div>

                        <span className="text-[11px] font-mono text-[#718096] hidden sm:inline">
                          {status === 'Present'
                            ? '09:30 AM - 07:30 PM'
                            : status === 'Half-day'
                            ? '09:30 AM - 02:00 PM'
                            : status === 'Absent'
                            ? 'No Punch'
                            : 'Unrecorded'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MONTHLY CALENDAR GRID */}
      {viewTab === 'calendar' && (
        <div className="bg-[#14171E] border border-[#232832] rounded-2xl p-5 space-y-4 shadow-xl">
          {/* Month Header Controller */}
          <div className="flex items-center justify-between pb-3 border-b border-[#232832]">
            <div className="flex items-center gap-3">
              <h3 className="font-serif-luxury text-lg font-bold text-[#E5B842]">
                {monthName}
              </h3>
              <span className="text-xs text-[#8A95A6]">Click any date to view & punch attendance</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg bg-[#181D26] hover:bg-[#232B38] text-[#E2E8F0] flex items-center justify-center cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date())}
                className="px-3 py-1 bg-[#181D26] hover:bg-[#232B38] text-[#E2E8F0] text-xs rounded-lg font-bold cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg bg-[#181D26] hover:bg-[#232B38] text-[#E2E8F0] flex items-center justify-center cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-[#718096] uppercase tracking-wider py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Tiles */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 bg-[#0E1013]/30 rounded-xl border border-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;

              // Compute attendance numbers for this specific day
              const dayRecords = attendanceRecords.filter((r) => r.date === dateStr);
              const presentCount = dayRecords.filter((r) => r.status === 'Present').length;
              const absentCount = dayRecords.filter((r) => r.status === 'Absent').length;
              const halfCount = dayRecords.filter((r) => r.status === 'Half-day').length;

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDate(dateStr);
                    setViewTab('daily');
                  }}
                  className={`h-22 p-2 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-[#E5B842] bg-[#E5B842]/10 shadow-lg'
                      : isToday
                      ? 'border-[#3B82F6] bg-[#171F2E]'
                      : 'border-[#222834] bg-[#11141A] hover:border-[#384357]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                        isToday
                          ? 'bg-[#3B82F6] text-white'
                          : isSelected
                          ? 'bg-[#E5B842] text-[#111418]'
                          : 'text-[#E2E8F0]'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayRecords.length > 0 && (
                      <span className="text-[10px] text-[#A0AEC0]">
                        {presentCount}/{staffList.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 text-[9px] w-full">
                    {presentCount > 0 && (
                      <div className="bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 px-1 py-0.2 rounded truncate">
                        {presentCount} Present
                      </div>
                    )}
                    {absentCount > 0 && (
                      <div className="bg-rose-950/70 border border-rose-500/30 text-rose-300 px-1 py-0.2 rounded truncate">
                        {absentCount} Absent
                      </div>
                    )}
                    {halfCount > 0 && (
                      <div className="bg-amber-950/70 border border-amber-500/30 text-amber-300 px-1 py-0.2 rounded truncate">
                        {halfCount} Half-day
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
