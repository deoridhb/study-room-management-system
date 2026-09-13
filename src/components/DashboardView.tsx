import React, { useState } from 'react';
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
  onOpenAddStudent: () => void;
  onOpenRecordPayment: () => void;
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
  onOpenAddStudent,
  onOpenRecordPayment,
  onOpenWhatsAppReminders,
  onCheckOut,
  onNavigateToTab,
  onSendSingleReminder,
}) => {
  const [insideSearch, setInsideSearch] = useState('');
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

  // Active sessions inside
  const activeSessions = sessions.filter(s => s.status === 'inside');
  const filteredActiveSessions = activeSessions.filter(session => {
    if (!insideSearch.trim()) return true;
    const q = insideSearch.toLowerCase();
    return (
      session.studentName.toLowerCase().includes(q) ||
      session.seatNumber.toLowerCase().includes(q) ||
      session.studentId.toLowerCase().includes(q)
    );
  });

  // Expiring soon students (within next 3 days or already expired)
  const now = new Date();
  const warningDate = new Date();
  warningDate.setDate(now.getDate() + 3);

  const urgentStudents = students.filter(s => {
    const expDate = new Date(s.membershipExpiry);
    return s.status === 'expired' || expDate <= warningDate;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if any students need immediate attention */}
      {urgentStudents.length > 0 && (
        <div
          id="dashboard-urgent-alerts-banner"
          className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-950 text-sm">
                Attention Needed: {urgentStudents.length} Students have Expired or Due Memberships
              </p>
              <p className="text-amber-800 text-xs mt-0.5">
                {urgentStudents.map(s => s.fullName).slice(0, 3).join(', ')}
                {urgentStudents.length > 3 ? ` and ${urgentStudents.length - 3} others` : ''} need payment renewal to secure their desks.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="dash-run-whatsapp-btn"
              onClick={onOpenWhatsAppReminders}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp Reminders</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary 6 Executive Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Current Occupancy */}
        <div
          id="metric-occupancy-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Live Occupancy
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Grid3X3 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {occupiedSeats} <span className="text-xs font-semibold text-slate-400">/ {totalSeats}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1.5">
              <span className="font-bold text-emerald-600">{occupancyPercent}%</span> full • {availableSeats} free
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  occupancyPercent >= 90 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Active Memberships */}
        <div
          id="metric-memberships-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Memberships
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {activeStudents} <span className="text-xs font-semibold text-slate-400">Active</span>
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1.5">
              {expiredStudents > 0 ? (
                <span className="text-amber-600 font-bold">{expiredStudents} expired</span>
              ) : (
                'All accounts active'
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Pending Fees */}
        <div
          id="metric-pending-fees-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors cursor-pointer"
          onClick={() => onNavigateToTab('payments')}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pending Dues
            </span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono tracking-tight">
              {pendingPayments.length} <span className="text-xs font-semibold text-slate-400">Due</span>
            </div>
            <div className="text-xs text-rose-700 font-bold mt-1.5">
              ₹{totalPendingDues.toLocaleString('en-IN')} uncollected
            </div>
          </div>
        </div>

        {/* Card 4: Monthly Revenue */}
        <div
          id="metric-revenue-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Revenue (Mtd)
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              ₹{monthlyRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-emerald-700 font-semibold mt-1.5">
              Gross fees collected
            </div>
          </div>
        </div>

        {/* Card 5: Monthly Expenses */}
        <div
          id="metric-expenses-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Expenses (Mtd)
            </span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              ₹{monthlyExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1.5">
              Rent, Power, Wi-Fi
            </div>
          </div>
        </div>

        {/* Card 6: Net Operating Income */}
        <div
          id="metric-net-income-card"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Net Profit
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                netIncome >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              ₹{netIncome.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1.5">
              Revenue minus expenses
            </div>
          </div>
        </div>
      </div>

      {/* Quick Operational Command Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
          <span className="font-bold text-slate-900">Front Desk Controls:</span>
          <span>Quickly scan student QR code, register a walk-in, or record fee payments.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="dash-kiosk-btn"
            onClick={onOpenScanner}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Launch Kiosk Scanner</span>
          </button>
          <button
            id="dash-add-student-btn"
            onClick={onOpenAddStudent}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Add Student</span>
          </button>
          <button
            id="dash-record-payment-btn"
            onClick={onOpenRecordPayment}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-2xs"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Students Currently Inside Reading Hall (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Currently Inside Reading Hall ({activeSessions.length} Students)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter search in currently inside */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter desk / name..."
                  value={insideSearch}
                  onChange={e => setInsideSearch(e.target.value)}
                  className="pl-7 pr-3 py-1 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-slate-900 w-36 sm:w-44"
                />
              </div>
              <button
                id="view-all-attendance-link"
                onClick={() => onNavigateToTab('attendance')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 shrink-0"
              >
                <span>Full Logs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Desk</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Check-in</th>
                  <th className="px-4 py-3">Time Inside</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActiveSessions.length > 0 ? (
                  filteredActiveSessions.map(session => {
                    const student = students.find(s => s.id === session.studentId);
                    const checkInDate = new Date(session.checkInTime);
                    const nowMs = Date.now();
                    const diffMins = Math.max(1, Math.round((nowMs - checkInDate.getTime()) / (1000 * 60)));
                    const hrs = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;

                    return (
                      <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-2xs">
                            {session.seatNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">
                            {session.studentName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {session.studentId}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono">
                          {checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                            {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            id={`checkout-btn-${session.studentId}`}
                            onClick={() => {
                              if (student) onCheckOut(student);
                            }}
                            className="px-3 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Check-out</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                      {insideSearch ? (
                        <span>No students inside matching "{insideSearch}"</span>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-600">No students are currently inside the hall</p>
                          <p className="text-xs text-slate-400">Use the Kiosk Scanner or Quick Search to check students in.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Visual Seat Map Preview & Today's Activity Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Visual Seat Map Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-indigo-600" />
                <span>Live Seat Occupancy Grid</span>
              </h3>
              <button
                id="view-full-seat-map-btn"
                onClick={() => onNavigateToTab('seats')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                <span>Interactive View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hover tooltip hint */}
            {hoveredSeat && (
              <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] flex items-center justify-between animate-in fade-in duration-100">
                <span className="font-mono font-bold">Desk {hoveredSeat.seatNumber}:</span>
                <span className="capitalize font-semibold text-emerald-400">
                  {hoveredSeat.status}
                  {hoveredSeat.currentOccupantStudentId &&
                    ` • ${students.find(s => s.id === hoveredSeat.currentOccupantStudentId)?.fullName || 'Student'}`}
                </span>
              </div>
            )}

            {/* Compact Mini Visual 30-Seat Grid */}
            <div className="mt-3 grid grid-cols-6 gap-2">
              {seats.map(seat => {
                const isOccupied = seat.status === 'occupied';
                const isReserved = seat.status === 'reserved';
                const isMaint = seat.status === 'maintenance';

                return (
                  <div
                    key={seat.id}
                    onMouseEnter={() => setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    title={`Seat ${seat.seatNumber}: ${seat.status}`}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 text-center transition-all duration-150 hover:scale-105 cursor-pointer shadow-2xs ${
                      isOccupied
                        ? 'bg-slate-900 border-slate-800 text-white font-bold ring-2 ring-emerald-500/30'
                        : isReserved
                        ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold'
                        : isMaint
                        ? 'bg-rose-100 border-rose-300 text-rose-800 line-through'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-500 hover:text-emerald-700 font-semibold'
                    }`}
                    onClick={() => onNavigateToTab('seats')}
                  >
                    <span className="text-[11px] font-mono leading-none">{seat.seatNumber}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-md bg-slate-900" /> Occupied ({occupiedSeats})
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-md bg-white border border-slate-300" /> Free ({availableSeats})
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2.5 w-2.5 rounded-md bg-amber-200 border border-amber-300" /> Reserved ({reservedSeats})
              </span>
            </div>
          </div>

          {/* Activity / Audit Logs Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
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

            <div className="mt-3 space-y-3">
              {activityLogs.slice(0, 4).map(log => (
                <div key={log.id} className="text-xs flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded-lg bg-slate-100 text-slate-600 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {log.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
