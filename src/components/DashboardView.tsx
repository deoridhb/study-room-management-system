import React from 'react';
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
  UserCheck,
  ChevronRight,
  LogOut,
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
  // Metrics calculation
  const totalSeats = seats.length;
  const occupiedSeats = seats.filter(s => s.status === 'occupied').length;
  const availableSeats = seats.filter(s => s.status === 'available').length;
  const reservedSeats = seats.filter(s => s.status === 'reserved').length;
  const maintenanceSeats = seats.filter(s => s.status === 'maintenance').length;
  const occupancyPercent = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

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
          className="rounded-2xl bg-amber-50 border border-amber-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-amber-900">
                Action Required: {urgentStudents.length} Students have Expired or Due Memberships
              </p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                {urgentStudents.map(s => s.fullName).slice(0, 3).join(', ')}
                {urgentStudents.length > 3 ? ` and ${urgentStudents.length - 3} others` : ''} need payment renewal.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="dash-run-whatsapp-btn"
              onClick={onOpenWhatsAppReminders}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send WhatsApp Reminders</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary 6 Executive Metric Cards (§5 PRD Table) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Current Occupancy */}
        <div
          id="metric-occupancy-card"
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Occupancy</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <Grid3X3 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              {occupiedSeats} <span className="text-xs font-medium text-slate-400">/ {totalSeats}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium mt-1">
              <span className="text-emerald-600 font-bold">{occupancyPercent}%</span> full • {availableSeats} free
            </div>
          </div>
        </div>

        {/* Card 2: Active Memberships */}
        <div
          id="metric-memberships-card"
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Memberships</span>
            <span className="p-1 rounded-md bg-indigo-50 text-indigo-600">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              {activeStudents} <span className="text-xs font-medium text-slate-400">Active</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              {expiredStudents > 0 ? (
                <span className="text-amber-600 font-semibold">{expiredStudents} expired</span>
              ) : (
                'All accounts active'
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Pending Fees */}
        <div
          id="metric-pending-fees-card"
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Fees</span>
            <span className="p-1 rounded-md bg-rose-50 text-rose-600">
              <CreditCard className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-rose-600 font-mono tracking-tight">
              {pendingPayments.length} <span className="text-xs font-medium text-slate-500">Students</span>
            </div>
            <div className="text-[11px] text-rose-700 font-semibold mt-1">
              ₹{totalPendingDues.toLocaleString('en-IN')} outstanding
            </div>
          </div>
        </div>

        {/* Card 4: Monthly Revenue */}
        <div
          id="metric-revenue-card"
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Revenue</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              ₹{monthlyRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-0.5">
              <span>Gross fees collected</span>
            </div>
          </div>
        </div>

        {/* Card 5: Monthly Expenses */}
        <div
          id="metric-expenses-card"
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Expenses</span>
            <span className="p-1 rounded-md bg-slate-100 text-slate-700">
              <Receipt className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              ₹{monthlyExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Rent, Power, Wi-Fi, etc.
            </div>
          </div>
        </div>

        {/* Card 6: Net Operating Income (§16) */}
        <div
          id="metric-net-income-card"
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Net Income</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-700">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <div className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
              netIncome >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}>
              ₹{netIncome.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Rev − Expenses
            </div>
          </div>
        </div>
      </div>

      {/* Quick Operational Command Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
          <span className="font-bold text-slate-900">Quick Desk Controls:</span>
          <span>Open scanner, register student, or record counter fee receipt.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="dash-kiosk-btn"
            onClick={onOpenScanner}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Launch Kiosk Scanner</span>
          </button>
          <button
            id="dash-add-student-btn"
            onClick={onOpenAddStudent}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Add Student</span>
          </button>
          <button
            id="dash-record-payment-btn"
            onClick={onOpenRecordPayment}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Students Currently Inside Reading Hall (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-900">
                Currently Inside Reading Hall ({activeSessions.length} Students)
              </h2>
            </div>
            <button
              id="view-all-attendance-link"
              onClick={() => onNavigateToTab('attendance')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <span>Full Attendance Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Desk</th>
                  <th className="px-4 py-2.5">Student Name</th>
                  <th className="px-4 py-2.5">Check-in Time</th>
                  <th className="px-4 py-2.5">Duration</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSessions.length > 0 ? (
                  activeSessions.map(session => {
                    const student = students.find(s => s.id === session.studentId);
                    const checkInDate = new Date(session.checkInTime);
                    const nowMs = Date.now();
                    const diffMins = Math.max(1, Math.round((nowMs - checkInDate.getTime()) / (1000 * 60)));
                    const hrs = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;

                    return (
                      <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                            {session.seatNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {session.studentName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {session.studentId}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-emerald-700">
                          {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            id={`checkout-btn-${session.studentId}`}
                            onClick={() => {
                              if (student) onCheckOut(student);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Check-out</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No students are currently inside the hall.
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-indigo-600" />
                <span>Live Seat Occupancy Map</span>
              </h3>
              <button
                id="view-full-seat-map-btn"
                onClick={() => onNavigateToTab('seats')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>Interactive Grid</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Compact Mini Visual 30-Seat Grid */}
            <div className="mt-3 grid grid-cols-6 gap-1.5">
              {seats.map(seat => {
                const isOccupied = seat.status === 'occupied';
                const isReserved = seat.status === 'reserved';
                const isMaint = seat.status === 'maintenance';

                return (
                  <div
                    key={seat.id}
                    title={`Seat ${seat.seatNumber}: ${seat.status}`}
                    className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-1 text-center transition-transform hover:scale-105 cursor-pointer ${
                      isOccupied
                        ? 'bg-slate-900 border-slate-800 text-white font-bold'
                        : isReserved
                        ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                        : isMaint
                        ? 'bg-rose-100 border-rose-300 text-rose-800 line-through'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-400 font-medium'
                    }`}
                    onClick={() => onNavigateToTab('seats')}
                  >
                    <span className="text-[10px] font-mono leading-none">{seat.seatNumber}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-slate-900" /> Occupied ({occupiedSeats})
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Available ({availableSeats})
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Reserved ({reservedSeats})
              </span>
            </div>
          </div>

          {/* Activity / Audit Logs Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Recent System Activity</span>
              </h3>
              <button
                id="view-all-logs-btn"
                onClick={() => onNavigateToTab('settings')}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                View Audit Trail
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {activityLogs.slice(0, 4).map(log => (
                <div key={log.id} className="text-xs flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 rounded-md bg-slate-100 text-slate-600 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{log.action}</span>
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
