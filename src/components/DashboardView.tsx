import React, { useState, useMemo } from 'react';
import {
  Student,
  Seat,
  AttendanceSession,
  PaymentRecord,
  ExpenseRecord,
  ReminderLog,
  ActivityLog,
} from '../types';
import {
  Users,
  Grid3X3,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  QrCode,
  UserPlus,
  Send,
  CheckCircle2,
  Receipt,
  Search,
  ChevronRight,
  LogOut,
  Sparkles,
  Phone,
  MessageCircle,
  Building2,
  Calendar,
  Layers,
  Plus,
  Check,
  Zap,
  UserCheck,
} from 'lucide-react';

interface DashboardViewProps {
  students: Student[];
  seats: Seat[];
  sessions: AttendanceSession[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  reminders: ReminderLog[];
  activityLogs: ActivityLog[];
  onOpenScanner: () => void;
  onOpenCheckIn?: () => void;
  onCheckIn?: (student: Student) => void;
  onOpenAddStudent: () => void;
  onOpenRecordPayment: () => void;
  onOpenAddExpense?: () => void;
  onOpenWhatsAppReminders: () => void;
  onCheckOut: (student: Student) => void;
  onNavigateToTab: (tab: any) => void;
  onSendSingleReminder: (student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  seats,
  sessions,
  payments,
  expenses,
  reminders,
  activityLogs,
  onOpenScanner,
  onOpenCheckIn,
  onCheckIn,
  onOpenAddStudent,
  onOpenRecordPayment,
  onOpenAddExpense,
  onOpenWhatsAppReminders,
  onCheckOut,
  onNavigateToTab,
  onSendSingleReminder,
}) => {
  const [insideSearch, setInsideSearch] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<'all' | 'morning' | 'evening' | 'fullday'>('all');
  const [attendanceFilter, setAttendanceFilter] = useState<'inside' | 'outside' | 'all'>('inside');
  const [quickCheckInStudentId, setQuickCheckInStudentId] = useState<string>('');
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

  // Metrics calculation
  const totalSeats = seats.length || 30;
  const occupiedSeats = seats.filter(s => s.status === 'occupied').length;
  const availableSeats = seats.filter(s => s.status === 'available').length;
  const reservedSeats = seats.filter(s => s.status === 'reserved').length;
  const maintenanceSeats = seats.filter(s => s.status === 'maintenance').length;
  const occupancyPercent = totalSeats > 0 ? Math.min(100, Math.round((occupiedSeats / totalSeats) * 100)) : 0;

  const activeStudents = students.filter(s => s.status === 'active').length;
  const expiredStudents = students.filter(s => s.status === 'expired').length;

  // Pending payments
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'partial');
  const totalPendingDues = pendingPayments.reduce((acc, p) => acc + p.pendingAmount, 0);

  // Financials: monthly revenue & expenses
  const monthlyRevenue = payments.reduce((acc, p) => acc + p.amountPaid, 0);
  const monthlyExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netIncome = monthlyRevenue - monthlyExpenses;
  const profitMargin = monthlyRevenue > 0 ? Math.round((netIncome / monthlyRevenue) * 100) : 0;

  // Active sessions inside
  const activeSessions = sessions.filter(s => s.status === 'inside');
  const insideStudentIds = useMemo(() => new Set(activeSessions.map(s => s.studentId)), [activeSessions]);
  const outsideStudents = useMemo(() => students.filter(s => !insideStudentIds.has(s.id)), [students, insideStudentIds]);

  // Unified attendance items (showing both inside & outside students seamlessly)
  const unifiedAttendanceItems = useMemo(() => {
    // Inside items
    const insideList = activeSessions.map(session => {
      const student = students.find(s => s.id === session.studentId) || ({
        id: session.studentId,
        fullName: session.studentName,
        phone: '',
        planId: 'plan_monthly',
        status: 'active',
        membershipExpiry: '2026-12-31',
      } as Student);

      const isExpired =
        student.status === 'expired' ||
        new Date(student.membershipExpiry).getTime() < Date.now() - 24 * 60 * 60 * 1000;

      return {
        id: session.id,
        studentId: session.studentId,
        studentName: session.studentName,
        phoneNumber: student.phone || (student as any).phoneNumber || '',
        planType: (student as any).planType || student.planId || 'Monthly',
        seatNumber: session.seatNumber,
        isInside: true,
        checkInTime: session.checkInTime,
        membershipExpiry: student.membershipExpiry,
        isExpired,
        student,
        session,
      };
    });

    // Outside items
    const outsideList = outsideStudents.map(student => {
      const isExpired =
        student.status === 'expired' ||
        new Date(student.membershipExpiry).getTime() < Date.now() - 24 * 60 * 60 * 1000;

      return {
        id: `outside_${student.id}`,
        studentId: student.id,
        studentName: student.fullName,
        phoneNumber: student.phone || (student as any).phoneNumber || '',
        planType: (student as any).planType || student.planId || 'Monthly',
        seatNumber: student.assignedSeat || 'Floating',
        isInside: false,
        membershipExpiry: student.membershipExpiry,
        isExpired,
        student,
      };
    });

    let base: typeof insideList;
    if (insideSearch.trim()) {
      // When searching, always match across all students so user can quickly check in or check out
      base = [...insideList, ...outsideList];
    } else {
      if (attendanceFilter === 'inside') {
        base = insideList;
      } else if (attendanceFilter === 'outside') {
        base = outsideList;
      } else {
        base = [...insideList, ...outsideList];
      }
    }

    return base.filter(item => {
      if (selectedPlanFilter !== 'all') {
        const pStr = (item.planType || '').toLowerCase();
        if (!pStr.includes(selectedPlanFilter.toLowerCase())) return false;
      }

      if (!insideSearch.trim()) return true;
      const q = insideSearch.toLowerCase();
      const matchName = item.studentName.toLowerCase().includes(q);
      const matchSeat = item.seatNumber.toLowerCase().includes(q);
      const matchId = item.studentId.toLowerCase().includes(q);
      const matchPhone = item.phoneNumber.includes(q);

      return matchName || matchSeat || matchId || matchPhone;
    });
  }, [activeSessions, outsideStudents, students, insideSearch, selectedPlanFilter, attendanceFilter]);

  // Keep filteredActiveSessions for backward compatibility if referenced elsewhere
  const filteredActiveSessions = useMemo(() => {
    return activeSessions.filter(session => {
      const student = students.find(s => s.id === session.studentId);
      if (selectedPlanFilter !== 'all') {
        const pStr = ((student as any)?.planType || student?.planId || '').toLowerCase();
        if (!pStr.includes(selectedPlanFilter.toLowerCase())) return false;
      }

      if (!insideSearch.trim()) return true;
      const q = insideSearch.toLowerCase();
      const matchName = session.studentName.toLowerCase().includes(q);
      const matchSeat = session.seatNumber.toLowerCase().includes(q);
      const matchId = session.studentId.toLowerCase().includes(q);
      const matchPhone = student ? (student.phone || (student as any).phoneNumber || '').includes(q) : false;

      return matchName || matchSeat || matchId || matchPhone;
    });
  }, [activeSessions, students, insideSearch, selectedPlanFilter]);

  // Urgent students (due in <= 3 days or already expired)
  const urgentStudents = useMemo(() => {
    const now = new Date();
    const warningDate = new Date();
    warningDate.setDate(now.getDate() + 3);

    return students.filter(s => {
      const expDate = new Date(s.membershipExpiry);
      return s.status === 'expired' || expDate <= warningDate;
    });
  }, [students]);

  // Current Shift Estimation
  const currentHour = new Date().getHours();
  const currentShiftName =
    currentHour >= 6 && currentHour < 14
      ? 'Morning Shift (06:00 - 14:00)'
      : currentHour >= 14 && currentHour < 22
      ? 'Evening Shift (14:00 - 22:00)'
      : 'Night / 24x7 Shift';

  const todayDateString = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE COCKPIT HEADER BAR (DESKTOP OPTIMIZED) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Operations Cockpit</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {todayDateString}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentShiftName}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy tracking, front desk kiosk control, and daily collections ledger.
          </p>
        </div>

        {/* Live Pulse Stats Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Occupancy</p>
              <p className="font-mono font-black text-slate-900 text-sm leading-none mt-0.5">
                {occupiedSeats} <span className="text-xs font-normal text-slate-400">/ {totalSeats}</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs font-mono">
              {occupancyPercent}%
            </div>
          </div>

          <button
            id="dash-quick-kiosk-btn"
            onClick={onOpenScanner}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all ring-1 ring-slate-800 hover:scale-[1.02]"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Kiosk Scanner</span>
            <span className="sm:hidden">Scan</span>
          </button>
        </div>
      </div>

      {/* 2. URGENT NOTIFICATIONS BANNER */}
      {urgentStudents.length > 0 && (
        <div
          id="dashboard-urgent-alerts-banner"
          className="rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 shadow-2xs mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-950 text-sm">
                Attention Required: {urgentStudents.length} Students have Expired or Due Memberships
              </p>
              <p className="text-amber-800 text-xs mt-0.5">
                {urgentStudents.map(s => s.fullName).slice(0, 3).join(', ')}
                {urgentStudents.length > 3 ? ` and ${urgentStudents.length - 3} others` : ''} have upcoming expiries or overdue fees.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="dash-run-whatsapp-btn"
              onClick={onOpenWhatsAppReminders}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp Alerts</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. EXECUTIVE 6-METRIC GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: Live Occupancy */}
        <div
          id="metric-occupancy-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-200 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Live Occupancy
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {occupiedSeats} <span className="text-xs font-semibold text-slate-400">/ {totalSeats}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1">
              <span className="font-bold text-emerald-600">{occupancyPercent}%</span> full • {availableSeats} free
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  occupancyPercent >= 90 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Active Memberships */}
        <div
          id="metric-memberships-card"
          onClick={() => onNavigateToTab('students')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors">
              Students
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {activeStudents} <span className="text-xs font-semibold text-slate-400">Active</span>
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center justify-between">
              <span>{students.length} Enrolled</span>
              {expiredStudents > 0 && (
                <span className="text-amber-600 font-bold">{expiredStudents} exp</span>
              )}
            </div>
            <div className="text-[10px] text-indigo-600 font-bold mt-2 flex items-center gap-0.5">
              <span>View Directory</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Metric 3: Pending Fees */}
        <div
          id="metric-pending-fees-card"
          onClick={() => onNavigateToTab('payments')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-rose-200 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-rose-600 transition-colors">
              Pending Dues
            </span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black text-rose-600 font-mono tracking-tight">
              {pendingPayments.length} <span className="text-xs font-semibold text-slate-400">Due</span>
            </div>
            <div className="text-xs text-rose-700 font-bold mt-1">
              ₹{totalPendingDues.toLocaleString('en-IN')} pending
            </div>
            <div className="text-[10px] text-rose-600 font-bold mt-2 flex items-center gap-0.5">
              <span>Collect Dues</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Metric 4: Monthly Revenue */}
        <div
          id="metric-revenue-card"
          onClick={() => onNavigateToTab('payments')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-emerald-600 transition-colors">
              Revenue (Mtd)
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black text-slate-900 font-mono tracking-tight">
              ₹{monthlyRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-emerald-700 font-semibold mt-1">
              Gross fees collected
            </div>
            <div className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-0.5">
              <span>Fee Ledger</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Metric 5: Monthly Expenses */}
        <div
          id="metric-expenses-card"
          onClick={() => onNavigateToTab('expenses')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-slate-700 transition-colors">
              Expenses (Mtd)
            </span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black text-slate-900 font-mono tracking-tight">
              ₹{monthlyExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Utilities & rent bills
            </div>
            <div className="text-[10px] text-slate-600 font-bold mt-2 flex items-center gap-0.5">
              <span>View Expenses</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Metric 6: Net Operating Income */}
        <div
          id="metric-net-income-card"
          onClick={() => onNavigateToTab('reports')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-emerald-700 transition-colors">
              Net Margin
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl lg:text-3xl font-black font-mono tracking-tight ${
                netIncome >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              ₹{netIncome.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              {profitMargin >= 0 ? `+${profitMargin}% operating margin` : `${profitMargin}% margin`}
            </div>
            <div className="text-[10px] text-indigo-600 font-bold mt-2 flex items-center gap-0.5">
              <span>Financials</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. FRONT DESK OPERATIONAL COMMAND TOOLBAR (HIGH DESKTOP UTILITY) */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 text-white shadow-2xs">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm">
              Front Desk Command Suite
            </p>
            <p className="text-[11px] text-slate-500">
              Scan student QR codes, register walk-ins, log fee payments, or record operational expenses.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenCheckIn && (
            <button
              id="dash-checkin-student-btn"
              onClick={onOpenCheckIn}
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs ring-1 ring-emerald-600"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Check In Student</span>
            </button>
          )}

          <button
            id="dash-kiosk-btn"
            onClick={onOpenScanner}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs ring-1 ring-slate-800"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Launch QR Scanner</span>
          </button>

          <button
            id="dash-add-student-btn"
            onClick={onOpenAddStudent}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ New Student</span>
          </button>

          <button
            id="dash-record-payment-btn"
            onClick={onOpenRecordPayment}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-2xs"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Record Fee</span>
          </button>

          {onOpenAddExpense && (
            <button
              id="dash-record-expense-btn"
              onClick={onOpenAddExpense}
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-2xs"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-600" />
              <span>+ Expense</span>
            </button>
          )}

          <button
            id="dash-whatsapp-quick-btn"
            onClick={onOpenWhatsAppReminders}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-2xs"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp (Auto)</span>
          </button>
        </div>
      </div>

      {/* 5. MAIN EXECUTIVE TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: LIVE OCCUPANTS IN READING HALL (7 COLS) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col min-w-0">
          {/* Header with Search and Shift Filters */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Currently Inside Reading Hall</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900 text-white">
                      {activeSessions.length}
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenCheckIn && (
                  <button
                    id="dash-quick-checkin-modal-btn"
                    onClick={onOpenCheckIn}
                    className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                    title="Open Check-in Terminal"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+ Check In Student</span>
                  </button>
                )}
                <button
                  id="view-all-attendance-link"
                  onClick={() => onNavigateToTab('attendance')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Full Attendance Logs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter and Instant Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by student name, desk, phone or ID..."
                  value={insideSearch}
                  onChange={e => setInsideSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 w-full shadow-2xs"
                />
              </div>

              {/* Plan Filter Pills */}
              <div className="flex items-center space-x-1 bg-white p-0.5 rounded-xl border border-slate-200 shrink-0 text-[11px] font-semibold">
                <button
                  onClick={() => setSelectedPlanFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedPlanFilter === 'all'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedPlanFilter('morning')}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    selectedPlanFilter === 'morning'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Morning
                </button>
                <button
                  onClick={() => setSelectedPlanFilter('evening')}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    selectedPlanFilter === 'evening'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Evening
                </button>
                <button
                  onClick={() => setSelectedPlanFilter('fullday')}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    selectedPlanFilter === 'fullday'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  24x7
                </button>
              </div>
            </div>

            {/* Attendance View Filter: Inside / Outside / All + Fast Check-in Dropdown */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
              <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  id="filter-inside-btn"
                  onClick={() => setAttendanceFilter('inside')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    attendanceFilter === 'inside'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span>Inside ({activeSessions.length})</span>
                </button>
                <button
                  type="button"
                  id="filter-outside-btn"
                  onClick={() => setAttendanceFilter('outside')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    attendanceFilter === 'outside'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                  <span>Outside / Eligible ({outsideStudents.length})</span>
                </button>
                <button
                  type="button"
                  id="filter-all-btn"
                  onClick={() => setAttendanceFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    attendanceFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>All ({students.length})</span>
                </button>
              </div>

              {/* Quick Inline Student Check-In Dropdown */}
              {outsideStudents.length > 0 && onCheckIn && (
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <select
                    id="quick-checkin-select"
                    value={quickCheckInStudentId}
                    onChange={e => setQuickCheckInStudentId(e.target.value)}
                    className="px-2 py-1 text-[11px] border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-emerald-600 flex-1 sm:max-w-[170px] truncate"
                  >
                    <option value="">-- Quick Desk Check In --</option>
                    {outsideStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.assignedSeat || 'Desk'})
                      </option>
                    ))}
                  </select>
                  <button
                    id="quick-checkin-exec-btn"
                    disabled={!quickCheckInStudentId}
                    onClick={() => {
                      const studentToIn = students.find(s => s.id === quickCheckInStudentId);
                      if (studentToIn) {
                        onCheckIn(studentToIn);
                        setQuickCheckInStudentId('');
                      }
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>Check In</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Table View (>= 640px) */}
          <div className="hidden sm:block overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Desk</th>
                  <th className="px-4 py-3">Student Details</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status / Time</th>
                  <th className="px-4 py-3">Duration / Validity</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unifiedAttendanceItems.length > 0 ? (
                  unifiedAttendanceItems.map(item => {
                    const student = item.student;
                    const checkInDate = item.checkInTime ? new Date(item.checkInTime) : null;
                    const nowMs = Date.now();
                    const diffMins = checkInDate
                      ? Math.max(1, Math.round((nowMs - checkInDate.getTime()) / (1000 * 60)))
                      : 0;
                    const hrs = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs shadow-2xs transition-colors ${
                              item.isInside
                                ? 'bg-slate-900 text-white group-hover:bg-indigo-600'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {item.seatNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 text-xs">
                            {item.studentName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>{item.studentId}</span>
                            {item.phoneNumber && (
                              <>
                                <span>•</span>
                                <span>{item.phoneNumber}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                            {item.planType || 'General'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {item.isInside && checkInDate ? (
                            <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span>Outside</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold">
                          {item.isInside ? (
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs border ${
                                hrs >= 6
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
                            </span>
                          ) : (
                            <span className={`text-[11px] font-normal ${item.isExpired ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                              Till: {item.membershipExpiry}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {student && (
                              <button
                                onClick={() => onSendSingleReminder(student)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Send WhatsApp Message"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {item.isInside ? (
                              <button
                                id={`checkout-btn-${item.studentId}`}
                                onClick={() => {
                                  if (student) onCheckOut(student);
                                }}
                                className="px-3 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                title="Check-out student and free up desk"
                              >
                                <LogOut className="w-3 h-3" />
                                <span>Check-out</span>
                              </button>
                            ) : (
                              <button
                                id={`checkin-btn-${item.studentId}`}
                                onClick={() => {
                                  if (onCheckIn && student) onCheckIn(student);
                                }}
                                className="px-3 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                title="Check in student to reading hall"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Check In</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      {insideSearch || selectedPlanFilter !== 'all' ? (
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-700 text-xs">No students match current filters</p>
                          <p className="text-[11px] text-slate-400">Try clearing search term or switching plan filters.</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="font-bold text-slate-700 text-sm">
                            {attendanceFilter === 'outside'
                              ? 'No students currently outside'
                              : 'No students currently inside the reading hall'}
                          </p>
                          <p className="text-xs text-slate-400">Use the Kiosk Scanner or Quick Check-in to log arrivals.</p>
                          <button
                            onClick={onOpenScanner}
                            className="mt-2 px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-xl shadow-xs inline-flex items-center gap-1.5"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Open Scanner</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (< 640px) */}
          <div className="sm:hidden divide-y divide-slate-100 flex-1">
            {unifiedAttendanceItems.length > 0 ? (
              unifiedAttendanceItems.map(item => {
                const student = item.student;
                const checkInDate = item.checkInTime ? new Date(item.checkInTime) : null;
                const nowMs = Date.now();
                const diffMins = checkInDate
                  ? Math.max(1, Math.round((nowMs - checkInDate.getTime()) / (1000 * 60)))
                  : 0;
                const hrs = Math.floor(diffMins / 60);
                const mins = diffMins % 60;

                return (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`px-2 py-1 rounded-lg font-mono font-bold text-xs shrink-0 shadow-2xs ${
                          item.isInside
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {item.seatNumber}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {item.studentName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          {item.isInside && checkInDate ? (
                            <>
                              <span>In: {checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">
                                {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-500">
                              Outside • Valid: {item.membershipExpiry}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.isInside ? (
                        <button
                          id={`checkout-btn-mobile-${item.studentId}`}
                          onClick={() => {
                            if (student) onCheckOut(student);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Check-out</span>
                        </button>
                      ) : (
                        <button
                          id={`checkin-btn-mobile-${item.studentId}`}
                          onClick={() => {
                            if (onCheckIn && student) onCheckIn(student);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>Check In</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p className="font-semibold text-xs text-slate-600">
                  {attendanceFilter === 'outside' ? 'No students currently outside' : 'No students currently inside'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Tap Kiosk Scanner or use Quick Check-in.</p>
              </div>
            )}
          </div>

          {/* Table Footer Status */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              Showing {unifiedAttendanceItems.length} students ({activeSessions.length} inside, {outsideStudents.length} outside)
            </span>
            <span className="font-mono text-[10px] text-slate-400">Automated Live Sync</span>
          </div>
        </div>

        {/* RIGHT COLUMN: 30-SEAT VISUAL MAP & RECENT ACTIVITY (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 30-Desk Visual Map Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-indigo-600" />
                <span>30-Desk Interactive Grid</span>
              </h3>
              <button
                id="view-full-seat-map-btn"
                onClick={() => onNavigateToTab('seats')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                <span>Full Seat Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hover Tooltip / Status Display */}
            {hoveredSeat ? (
              <div className="mt-3 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between animate-in fade-in duration-100 shadow-xs">
                <span className="font-mono font-bold text-emerald-400">Desk {hoveredSeat.seatNumber}:</span>
                <span className="capitalize font-medium text-slate-200 truncate ml-2">
                  {hoveredSeat.status === 'occupied' ? (
                    <span>
                      Occupied • {students.find(s => s.id === hoveredSeat.currentOccupantStudentId)?.fullName || 'Student'}
                    </span>
                  ) : hoveredSeat.status === 'reserved' ? (
                    <span className="text-amber-300">Reserved for registered member</span>
                  ) : hoveredSeat.status === 'maintenance' ? (
                    <span className="text-rose-300">Under repair / maintenance</span>
                  ) : (
                    <span className="text-emerald-300">Available for Check-in</span>
                  )}
                </span>
              </div>
            ) : (
              <div className="mt-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Hover over any desk to inspect occupant details</span>
                <span className="text-indigo-600 font-bold">Click to manage</span>
              </div>
            )}

            {/* 30-Seat Grid (6 columns x 5 rows) */}
            <div className="mt-3 grid grid-cols-6 gap-2">
              {seats.map(seat => {
                const isOccupied = seat.status === 'occupied';
                const isReserved = seat.status === 'reserved';
                const isMaint = seat.status === 'maintenance';
                const occupant = students.find(s => s.id === seat.currentOccupantStudentId);

                return (
                  <button
                    key={seat.id}
                    onMouseEnter={() => setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    onClick={() => onNavigateToTab('seats')}
                    title={`Desk ${seat.seatNumber}: ${seat.status}${occupant ? ` (${occupant.fullName})` : ''}`}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 text-center transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xs relative group ${
                      isOccupied
                        ? 'bg-slate-900 border-slate-800 text-white font-black ring-2 ring-emerald-500/40 shadow-xs'
                        : isReserved
                        ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold'
                        : isMaint
                        ? 'bg-rose-100 border-rose-300 text-rose-800 line-through'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-500 hover:text-emerald-700 font-bold'
                    }`}
                  >
                    <span className="text-xs font-mono leading-none">{seat.seatNumber}</span>
                    {isOccupied && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Seat Legend with Accurate Counts */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 mt-4 pt-3 border-t border-slate-100 gap-2">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="h-2.5 w-2.5 rounded-md bg-slate-900 ring-1 ring-slate-800" />
                <span>Occupied ({occupiedSeats})</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="h-2.5 w-2.5 rounded-md bg-white border border-slate-300" />
                <span>Free ({availableSeats})</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="h-2.5 w-2.5 rounded-md bg-amber-200 border border-amber-300" />
                <span>Reserved ({reservedSeats})</span>
              </span>
            </div>
          </div>

          {/* Quick Dues Action Widget */}
          {pendingPayments.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200 shadow-xs p-4 sm:p-5">
              <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-rose-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Overdue Fee Collections ({pendingPayments.length})
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateToTab('payments')}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                >
                  Manage All
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {pendingPayments.slice(0, 3).map(payment => {
                  const student = students.find(s => s.id === payment.studentId);
                  return (
                    <div
                      key={payment.id}
                      className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{payment.studentName}</p>
                        <p className="text-[11px] text-rose-700 font-bold font-mono">
                          ₹{payment.pendingAmount.toLocaleString('en-IN')} pending
                        </p>
                      </div>
                      {student && (
                        <button
                          onClick={() => onSendSingleReminder(student)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-2xs"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Remind</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Audit & System Activity Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Recent System Activity</span>
              </h3>
              <button
                id="view-all-logs-btn"
                onClick={() => onNavigateToTab('settings')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
              >
                Audit Trail
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {activityLogs.length > 0 ? (
                activityLogs.slice(0, 4).map(log => (
                  <div key={log.id} className="text-xs flex items-start gap-2.5">
                    <div className="mt-0.5 p-1 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 truncate">{log.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {log.details}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No recent activity recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
