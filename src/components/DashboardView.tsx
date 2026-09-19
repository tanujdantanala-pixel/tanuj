import React, { useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  StockMetal,
  AppSettings,
  Product,
  StaffMember,
  AttendanceRecord,
} from '../types';
import {
  Wallet,
  Calculator,
  Gem,
  Plus,
  ArrowRight,
  TrendingUp,
  Package,
  CalendarDays,
  Sparkles,
  CreditCard,
  Layers,
  Clock,
  Radio,
  Lock,
  ShieldCheck,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ReceiptText,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface DashboardViewProps {
  transactions: Transaction[];
  stockMetals: StockMetal[];
  products: Product[];
  staffList: StaffMember[];
  attendanceRecords: AttendanceRecord[];
  settings: AppSettings;
  onNewBill: () => void;
  onAddStock: () => void;
  onNavigateToProducts: () => void;
  onNavigateToAttendance: () => void;
  onNavigateToStaff: () => void;
  onNavigateToBilling: () => void;
  isMobileLayout?: boolean;
  isOwnerUnlocked?: boolean;
  onLockStore?: () => void;
  onRequestOwnerUnlock?: (actionTitle?: string, onApproved?: () => void) => void;
}

type ChartMetric = 'revenue' | 'invoices' | 'aov';

interface MonthlyDataPoint {
  monthKey: string;
  monthLabel: string;
  revenue: number;
  invoices: number;
  aov: number;
  growth: number; // percentage vs prior month
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  stockMetals,
  products,
  staffList,
  attendanceRecords,
  settings,
  onNewBill,
  onAddStock,
  onNavigateToProducts,
  onNavigateToAttendance,
  onNavigateToStaff,
  onNavigateToBilling,
  isMobileLayout = false,
  isOwnerUnlocked = false,
  onLockStore,
  onRequestOwnerUnlock,
}) => {
  // Real-time Live Clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('revenue');
  const [timeRange, setTimeRange] = useState<'6M' | '12M' | 'ALL'>('6M');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Dynamic calculations from real user data
  const totalRevenue = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const todayTransactions = transactions.filter((t) => t.date === todayStr);
  const todayRevenue = todayTransactions.reduce((acc, t) => acc + (t.amount || 0), 0);

  const presentTodayCount = staffList.filter((s) => {
    const rec = attendanceRecords.find((r) => r.staffId === s.id && r.date === todayStr);
    return rec?.status === 'Present';
  }).length;

  const totalVaultPcs = products.reduce((acc, p) => acc + (p.stockCount || 0), 0);

  // Group transactions by month to compute monthly revenue trends for Recharts
  const monthlyRevenueData = useMemo<MonthlyDataPoint[]>(() => {
    // Collect all unique months or default to last 6 months
    const monthMap = new Map<string, { revenue: number; invoices: number }>();

    // Seed trailing 6 months so chart is continuous even if some months have 0
    const now = new Date();
    const monthsToSeed = timeRange === '12M' ? 12 : timeRange === 'ALL' ? 18 : 6;

    for (let i = monthsToSeed - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, { revenue: 0, invoices: 0 });
    }

    // Accumulate actual transaction data
    transactions.forEach((tx) => {
      if (!tx.date) return;
      const monthKey = tx.date.substring(0, 7); // 'YYYY-MM'
      const existing = monthMap.get(monthKey);
      if (existing) {
        existing.revenue += tx.amount || 0;
        existing.invoices += 1;
      } else if (timeRange === 'ALL') {
        monthMap.set(monthKey, { revenue: tx.amount || 0, invoices: 1 });
      }
    });

    // Convert to sorted array
    const sortedKeys = Array.from(monthMap.keys()).sort();
    let prevRevenue = 0;

    return sortedKeys.map((key) => {
      const { revenue, invoices } = monthMap.get(key)!;
      const [year, month] = key.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthLabel = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      const aov = invoices > 0 ? Math.round(revenue / invoices) : 0;
      let growth = 0;
      if (prevRevenue > 0) {
        growth = Math.round(((revenue - prevRevenue) / prevRevenue) * 100);
      }
      prevRevenue = revenue;

      return {
        monthKey: key,
        monthLabel,
        revenue,
        invoices,
        aov,
        growth,
      };
    });
  }, [transactions, timeRange]);

  // Key monthly statistics
  const currentMonthData = monthlyRevenueData[monthlyRevenueData.length - 1];
  const previousMonthData = monthlyRevenueData[monthlyRevenueData.length - 2];
  const momGrowthRate =
    previousMonthData && previousMonthData.revenue > 0
      ? Math.round(
          ((currentMonthData.revenue - previousMonthData.revenue) / previousMonthData.revenue) * 100
        )
      : currentMonthData?.growth || 0;

  const peakMonth = useMemo(() => {
    if (monthlyRevenueData.length === 0) return null;
    return monthlyRevenueData.reduce((max, curr) => (curr.revenue > max.revenue ? curr : max));
  }, [monthlyRevenueData]);

  const avgMonthlyRevenue = useMemo(() => {
    const activeMonths = monthlyRevenueData.filter((m) => m.revenue > 0);
    if (activeMonths.length === 0) return 0;
    const sum = activeMonths.reduce((acc, m) => acc + m.revenue, 0);
    return Math.round(sum / activeMonths.length);
  }, [monthlyRevenueData]);

  // Format Recharts Y-Axis
  const formatYAxis = (val: number) => {
    if (selectedMetric === 'invoices') return `${val}`;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  return (
    <div id="dashboard-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Real-time System Bar & Owner Security Switcher */}
      <div
        id="dashboard-system-ribbon"
        className="bg-[#12151B] border border-[#232A35] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg"
      >
        {/* Left: Real-time Live Clock & MCX Market Status */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#1A1F29] border border-[#2D3645] px-3 py-1.5 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-[#E2E8F0] tracking-wide">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-[#718096]">IST</span>
          </div>

          <div className="text-xs text-[#8A95A6] hidden md:flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#E5B842]" />
            <span>
              {currentTime.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#E5B842]/10 border border-[#E5B842]/20 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#E5B842]">
            <Radio className="w-3 h-3 text-[#E5B842] animate-spin" />
            <span>MCX BULLION LIVE</span>
          </div>
        </div>

        {/* Right: Explicit Owner vs Staff Role Switcher */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {isOwnerUnlocked ? (
            <div className="flex items-center gap-2 bg-[#1A1F29] border border-[#E5B842]/40 p-1 pl-2.5 rounded-lg">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#E5B842]" />
                <span className="text-xs font-bold text-[#E5B842]">OWNER MODE</span>
              </div>
              <button
                id="dashboard-switch-to-staff-btn"
                onClick={onLockStore}
                className="px-3 py-1 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Switch back to Staff Mode"
              >
                <Lock className="w-3 h-3 text-red-400" />
                <span>Switch to Staff</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#151921] border border-[#2B3545] p-1 pl-2.5 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#8A95A6]" />
                <span className="text-xs font-semibold text-[#8A95A6]">STAFF MODE</span>
              </div>
              <button
                id="dashboard-unlock-owner-btn"
                onClick={() => onRequestOwnerUnlock?.('Unlock Owner Controls')}
                className="px-3 py-1 bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] text-xs font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Enter Owner PIN to unlock full management"
              >
                <span>Unlock Owner</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#E5B842] uppercase tracking-widest bg-[#E5B842]/10 border border-[#E5B842]/20 px-2.5 py-0.5 rounded-full">
              ENTERPRISE JEWELLERY MANAGEMENT
            </span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#E2E8F0] mt-1">
            {settings.storeName}
          </h2>
          <p className="text-xs text-[#8A95A6] mt-0.5">
            Real-time bullion rates, monthly growth trends, inventory valuation & staff attendance
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onNavigateToProducts}
            className="bg-[#1E232E] hover:bg-[#28303E] text-[#E5B842] border border-[#E5B842]/30 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <Gem className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>

          <button
            onClick={onNewBill}
            className="bg-[#E5B842] hover:bg-[#F3C757] text-[#111418] font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Sale Invoice</span>
          </button>
        </div>
      </div>

      {/* Live Bullion Ticker Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-gradient-to-r from-[#1A180E] to-[#14171E] border border-[#E5B842]/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#E5B842] uppercase tracking-wider block">
                22K Hallmark Gold Rate
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-xl font-bold text-[#E5B842] mt-0.5">
              {settings.currency} {settings.goldRate22k.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal">/ gram</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E5B842]/10 border border-[#E5B842]/30 flex items-center justify-center text-[#E5B842]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#1A180E] to-[#14171E] border border-[#E5B842]/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#E5B842] uppercase tracking-wider block">
                24K Pure Bullion Rate
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-xl font-bold text-[#E5B842] mt-0.5">
              {settings.currency} {settings.goldRate24k.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal">/ gram</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E5B842]/10 border border-[#E5B842]/30 flex items-center justify-center text-[#E5B842]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#14171E] border border-[#2B3342] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                Fine Silver 999 Rate
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-xl font-bold text-[#E2E8F0] mt-0.5">
              {settings.currency} {settings.silverRate.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal">/ gram</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1E2530] border border-[#2F3746] flex items-center justify-center text-[#94A3B8]">
            <Gem className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* RECHARTS: MONTHLY REVENUE GROWTH TRENDS CHART CARD  */}
      {/* ---------------------------------------------------- */}
      <div
        id="dashboard-revenue-chart-card"
        className="bg-[#13171F] border border-[#222936] rounded-2xl p-5 sm:p-6 shadow-xl space-y-6"
      >
        {/* Header with Title & Interactive Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[#212733]">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#E5B842]/10 border border-[#E5B842]/30 flex items-center justify-center text-[#E5B842]">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-[#E2E8F0] flex items-center gap-2">
                  <span>Monthly Revenue & Growth Trends</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/20 px-2 py-0.5 rounded-full">
                    REAL-TIME LEDGER
                  </span>
                </h3>
                <p className="text-xs text-[#8A95A6]">
                  Track historical revenue trajectory, invoice velocity, and month-over-month store expansion
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Metric Toggle */}
            <div className="bg-[#181D26] border border-[#2B3545] p-1 rounded-lg flex items-center gap-1 text-xs">
              <button
                id="chart-metric-revenue"
                onClick={() => setSelectedMetric('revenue')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  selectedMetric === 'revenue'
                    ? 'bg-[#E5B842] text-[#111418] shadow-sm'
                    : 'text-[#8A95A6] hover:text-[#E2E8F0]'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                id="chart-metric-invoices"
                onClick={() => setSelectedMetric('invoices')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  selectedMetric === 'invoices'
                    ? 'bg-[#E5B842] text-[#111418] shadow-sm'
                    : 'text-[#8A95A6] hover:text-[#E2E8F0]'
                }`}
              >
                Invoices
              </button>
              <button
                id="chart-metric-aov"
                onClick={() => setSelectedMetric('aov')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  selectedMetric === 'aov'
                    ? 'bg-[#E5B842] text-[#111418] shadow-sm'
                    : 'text-[#8A95A6] hover:text-[#E2E8F0]'
                }`}
              >
                Avg Ticket
              </button>
            </div>

            {/* Timeframe Range */}
            <div className="bg-[#181D26] border border-[#2B3545] p-1 rounded-lg flex items-center gap-1 text-xs">
              {(['6M', '12M', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  id={`chart-range-${range}`}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                    timeRange === range
                      ? 'bg-[#2B3545] text-[#E5B842]'
                      : 'text-[#718096] hover:text-[#E2E8F0]'
                  }`}
                >
                  {range === '6M' ? 'Last 6M' : range === '12M' ? '12 Months' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Badges for Owner Intelligence */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#181D26] border border-[#252D3B] p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-[#8A95A6] uppercase tracking-wider block">
              Total Invoiced Period
            </span>
            <div className="text-lg sm:text-xl font-serif-luxury font-bold text-[#E5B842] mt-0.5">
              {formatCurrency(totalRevenue, settings.currency)}
            </div>
            <div className="text-[10px] text-[#718096] mt-0.5">
              {transactions.length} total completed orders
            </div>
          </div>

          <div className="bg-[#181D26] border border-[#252D3B] p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-[#8A95A6] uppercase tracking-wider block">
              Current Month Run
            </span>
            <div className="text-lg sm:text-xl font-serif-luxury font-bold text-[#34D399] mt-0.5">
              {formatCurrency(currentMonthData?.revenue || 0, settings.currency)}
            </div>
            <div className="text-[10px] text-[#34D399] mt-0.5 flex items-center gap-1">
              {momGrowthRate >= 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3" />
                  <span>+{momGrowthRate}% vs last month</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 text-red-400" />
                  <span className="text-red-400">{momGrowthRate}% vs last month</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-[#181D26] border border-[#252D3B] p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-[#8A95A6] uppercase tracking-wider block">
              Avg Monthly Velocity
            </span>
            <div className="text-lg sm:text-xl font-serif-luxury font-bold text-[#38BDF8] mt-0.5">
              {formatCurrency(avgMonthlyRevenue, settings.currency)}
            </div>
            <div className="text-[10px] text-[#718096] mt-0.5">Rolling average / month</div>
          </div>

          <div className="bg-[#181D26] border border-[#252D3B] p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-[#8A95A6] uppercase tracking-wider block">
              Peak Month Performance
            </span>
            <div className="text-lg sm:text-xl font-serif-luxury font-bold text-[#F59E0B] mt-0.5 truncate">
              {peakMonth?.monthLabel || 'N/A'}
            </div>
            <div className="text-[10px] text-[#F59E0B] mt-0.5">
              {peakMonth ? formatCurrency(peakMonth.revenue, settings.currency) : '—'}
            </div>
          </div>
        </div>

        {/* The Recharts SVG Canvas */}
        <div className="w-full h-80 pt-2 select-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyRevenueData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueGoldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E5B842" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#E5B842" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="invoicesBlueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="aovGreenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34D399" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#34D399" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#212835" vertical={false} />

              <XAxis
                dataKey="monthLabel"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#2A3343' }}
                dy={8}
              />

              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as MonthlyDataPoint;
                    return (
                      <div className="bg-[#111419] border border-[#E5B842]/40 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 z-50">
                        <div className="font-bold text-[#E5B842] border-b border-[#252D3B] pb-1">
                          {label}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[#8A95A6]">Total Sales:</span>
                          <span className="font-bold text-[#E2E8F0]">
                            {formatCurrency(data.revenue, settings.currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[#8A95A6]">Invoices Cleared:</span>
                          <span className="font-semibold text-[#38BDF8]">{data.invoices} bills</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[#8A95A6]">Avg Ticket (AOV):</span>
                          <span className="font-semibold text-[#34D399]">
                            {formatCurrency(data.aov, settings.currency)}
                          </span>
                        </div>
                        {data.growth !== 0 && (
                          <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#252D3B]">
                            <span className="text-[#8A95A6]">MoM Velocity:</span>
                            <span
                              className={`font-bold ${
                                data.growth > 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {data.growth > 0 ? `+${data.growth}%` : `${data.growth}%`}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {selectedMetric === 'revenue' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E5B842"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGoldGradient)"
                    name="Monthly Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#E5B842"
                    strokeWidth={2.5}
                    dot={{ fill: '#E5B842', r: 4, strokeWidth: 2, stroke: '#111418' }}
                    activeDot={{ r: 6, fill: '#F3C757', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </>
              )}

              {selectedMetric === 'invoices' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="invoices"
                    stroke="#38BDF8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#invoicesBlueGradient)"
                    name="Invoice Count"
                  />
                  <Line
                    type="monotone"
                    dataKey="invoices"
                    stroke="#38BDF8"
                    strokeWidth={2.5}
                    dot={{ fill: '#38BDF8', r: 4, strokeWidth: 2, stroke: '#111418' }}
                    activeDot={{ r: 6, fill: '#7DD3FC', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </>
              )}

              {selectedMetric === 'aov' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="aov"
                    stroke="#34D399"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#aovGreenGradient)"
                    name="Average Ticket Value"
                  />
                  <Line
                    type="monotone"
                    dataKey="aov"
                    stroke="#34D399"
                    strokeWidth={2.5}
                    dot={{ fill: '#34D399', r: 4, strokeWidth: 2, stroke: '#111418' }}
                    activeDot={{ r: 6, fill: '#6EE7B7', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4 Key Business Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Invoiced Revenue */}
        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales Invoiced</span>
            <Wallet className="w-4 h-4 text-[#E5B842]" />
          </div>
          <div className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#E5B842]">
            {formatCurrency(totalRevenue, settings.currency)}
          </div>
          <p className="text-[10px] text-[#718096] mt-1">
            {transactions.length} Total recorded invoices
          </p>
        </div>

        {/* Today's Sales */}
        <div className="bg-[#14171E] border border-[#232832] rounded-xl p-4">
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Today's Sales</span>
            <Calculator className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#34D399]">
            {formatCurrency(todayRevenue, settings.currency)}
          </div>
          <p className="text-[10px] text-[#718096] mt-1">
            {todayTransactions.length} Invoices today
          </p>
        </div>

        {/* Products in Vault */}
        <div
          onClick={onNavigateToProducts}
          className="bg-[#14171E] border border-[#232832] hover:border-[#E5B842]/50 rounded-xl p-4 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Catalog & Vault</span>
            <Package className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#E2E8F0]">
            {products.length} <span className="text-xs font-normal text-[#8A95A6]">({totalVaultPcs} in stock)</span>
          </div>
          <p className="text-[10px] text-[#38BDF8] mt-1 flex items-center gap-1">
            <span>Manage product photos</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Attendance Today */}
        <div
          onClick={onNavigateToAttendance}
          className="bg-[#14171E] border border-[#232832] hover:border-[#E5B842]/50 rounded-xl p-4 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[#8A95A6] mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Today's Attendance</span>
            <CalendarDays className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#F59E0B]">
            {presentTodayCount} / {staffList.length}
          </div>
          <p className="text-[10px] text-[#F59E0B] mt-1 flex items-center gap-1">
            <span>Open Attendance Calendar</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Grid: Recent Invoices & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Column */}
        <div className="lg:col-span-2 bg-[#14171E] border border-[#232832] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#232832]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E2E8F0]">
              <Wallet className="w-4 h-4 text-[#E5B842]" />
              <span>Recent Sales Invoices</span>
            </div>
            <button
              onClick={onNavigateToBilling}
              className="text-xs text-[#E5B842] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View Billing Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#718096] space-y-2">
              <p>No billing transactions created yet.</p>
              <button
                onClick={onNewBill}
                className="px-4 py-2 bg-[#E5B842] text-[#111418] font-bold rounded-lg cursor-pointer"
              >
                Create First Invoice
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#1D222B]">
              {transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between hover:bg-[#171B24] px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#1D222B] border border-[#2E3746] flex items-center justify-center text-[#E5B842] font-bold text-xs">
                      {tx.customerName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#E2E8F0]">{tx.customerName}</div>
                      <div className="text-[10px] text-[#718096]">
                        {tx.invoiceNumber} • {tx.itemName || 'Jewellery Pieces'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-[#E5B842]">
                      {formatCurrency(tx.amount, settings.currency)}
                    </div>
                    <div className="text-[10px] text-[#34D399] font-medium">{tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Operations Sidebar */}
        <div className="bg-[#14171E] border border-[#232832] rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="font-serif-luxury text-sm font-bold text-[#E2E8F0] pb-2 border-b border-[#232832]">
            Store Quick Operations
          </h3>

          <div className="space-y-2.5">
            <button
              onClick={onNavigateToProducts}
              className="w-full p-3 bg-[#101318] hover:bg-[#191F2B] border border-[#242A34] rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E5B842]/10 text-[#E5B842] flex items-center justify-center">
                  <Gem className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#E2E8F0] group-hover:text-[#E5B842]">
                    Products & Photos
                  </div>
                  <div className="text-[10px] text-[#718096]">Add jewelry with your photos</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#718096] group-hover:text-[#E5B842]" />
            </button>

            <button
              onClick={onNavigateToAttendance}
              className="w-full p-3 bg-[#101318] hover:bg-[#191F2B] border border-[#242A34] rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#E2E8F0] group-hover:text-[#38BDF8]">
                    Daily Attendance Calendar
                  </div>
                  <div className="text-[10px] text-[#718096]">Punch in Present / Absent</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#718096] group-hover:text-[#38BDF8]" />
            </button>

            <button
              onClick={onNavigateToStaff}
              className="w-full p-3 bg-[#101318] hover:bg-[#191F2B] border border-[#242A34] rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#34D399]/10 text-[#34D399] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#E2E8F0] group-hover:text-[#34D399]">
                    Salary & Payroll Analysis
                  </div>
                  <div className="text-[10px] text-[#718096]">Disburse salary & print pay slips</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#718096] group-hover:text-[#34D399]" />
            </button>

            <button
              onClick={onNewBill}
              className="w-full p-3 bg-[#101318] hover:bg-[#191F2B] border border-[#242A34] rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#E2E8F0] group-hover:text-[#F59E0B]">
                    Instant Tax Billing
                  </div>
                  <div className="text-[10px] text-[#718096]">Calculate GST, HUID & print invoice</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#718096] group-hover:text-[#F59E0B]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
