import React, { useState } from 'react';
import { Student, MembershipPlan, Seat, PaymentRecord, AttendanceSession } from '../types';
import { downloadCsv } from '../utils/exportCsv';
import {
  Users,
  Search,
  UserPlus,
  QrCode,
  Send,
  Edit2,
  ShieldCheck,
  Download,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Phone,
  RefreshCw,
  ExternalLink,
  Filter,
  UserCheck,
  LogOut,
} from 'lucide-react';

interface StudentsViewProps {
  students: Student[];
  plans: MembershipPlan[];
  seats: Seat[];
  payments: PaymentRecord[];
  sessions?: AttendanceSession[];
  onOpenAddStudent: () => void;
  onOpenCheckIn?: () => void;
  onCheckInStudent?: (student: Student) => void;
  onCheckOutStudent?: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onViewStudentCard: (student: Student) => void;
  onSendWhatsAppReminder: (student: Student) => void;
  onRenewStudent: (student: Student) => void;
  onToggleStatus: (studentId: string, newStatus: Student['status']) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  plans,
  seats,
  payments,
  sessions = [],
  onOpenAddStudent,
  onOpenCheckIn,
  onCheckInStudent,
  onCheckOutStudent,
  onEditStudent,
  onViewStudentCard,
  onSendWhatsAppReminder,
  onRenewStudent,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'active' | 'expiring' | 'dues' | 'minors'>('all');

  // Counts for quick chips
  const now = new Date();
  const warningDate = new Date();
  warningDate.setDate(now.getDate() + 3);

  const activeCount = students.filter(s => s.status === 'active').length;
  const expiringCount = students.filter(s => {
    const exp = new Date(s.membershipExpiry);
    return s.status === 'expired' || exp <= warningDate;
  }).length;
  const duesCount = students.filter(s => {
    const p = payments.find(pay => pay.studentId === s.id);
    return p && p.pendingAmount > 0;
  }).length;
  const minorsCount = students.filter(s => s.isMinor).length;

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      (s.assignedSeat && s.assignedSeat.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesPlan = planFilter === 'all' || s.planId === planFilter;

    // Quick filter check
    let matchesQuick = true;
    if (quickFilter === 'active') {
      matchesQuick = s.status === 'active';
    } else if (quickFilter === 'expiring') {
      const exp = new Date(s.membershipExpiry);
      matchesQuick = s.status === 'expired' || exp <= warningDate;
    } else if (quickFilter === 'dues') {
      const p = payments.find(pay => pay.studentId === s.id);
      matchesQuick = Boolean(p && p.pendingAmount > 0);
    } else if (quickFilter === 'minors') {
      matchesQuick = Boolean(s.isMinor);
    }

    return matchesSearch && matchesStatus && matchesPlan && matchesQuick;
  });

  const handleExportCsv = () => {
    const headers = [
      'Student ID',
      'Full Name',
      'Phone (WhatsApp)',
      'Email',
      'Address',
      'Emergency Contact',
      'Is Minor',
      'Guardian Consent',
      'Membership Plan',
      'Assigned Seat',
      'Start Date',
      'Expiry Date',
      'Status',
      'QR Credential Token',
    ];

    const rows = students.map(s => {
      const plan = plans.find(p => p.id === s.planId);
      return [
        s.id,
        s.fullName,
        s.phone,
        s.email,
        s.address,
        s.emergencyContact,
        s.isMinor ? 'Yes' : 'No',
        s.guardianConsent ? 'Yes' : 'No',
        plan?.name || s.planId,
        s.assignedSeat || 'Unassigned',
        s.membershipStart,
        s.membershipExpiry,
        s.status,
        s.qrToken,
      ];
    });

    downloadCsv('Students_Directory', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Student & Membership Registry ({students.length} Total Enrolled)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage registrations, desk allocations, QR credential passes, and fee collection receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenCheckIn && (
            <button
              id="top-checkin-student-btn"
              onClick={onOpenCheckIn}
              className="px-3.5 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Check In Student</span>
            </button>
          )}
          <button
            id="export-students-csv-btn"
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            id="open-add-student-btn"
            onClick={onOpenAddStudent}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5 ring-1 ring-slate-800"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Register New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Quick Chips Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setQuickFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              quickFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Students ({students.length})
          </button>
          <button
            onClick={() => setQuickFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              quickFilter === 'active'
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Active ({activeCount})</span>
          </button>
          <button
            onClick={() => setQuickFilter('expiring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              quickFilter === 'expiring'
                ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Expiring / Due ({expiringCount})</span>
          </button>
          <button
            onClick={() => setQuickFilter('dues')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              quickFilter === 'dues'
                ? 'bg-rose-800 text-white border-rose-800 shadow-2xs'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-rose-500" />
            <span>Unpaid Dues ({duesCount})</span>
          </button>
          <button
            onClick={() => setQuickFilter('minors')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              quickFilter === 'minors'
                ? 'bg-indigo-800 text-white border-indigo-800 shadow-2xs'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Minors ({minorsCount})</span>
          </button>
        </div>

        {/* Search and Secondary Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-students-input"
              type="text"
              placeholder="Search by student name, ID (STU-1001), phone, or desk (A01)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 bg-slate-50/50 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              id="filter-student-status-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              id="filter-student-plan-select"
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:border-slate-900"
            >
              <option value="all">All Plans</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Data List & Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Mobile Cards (sm:hidden: No horizontal scrolling required on phones) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => {
              const plan = plans.find(p => p.id === student.planId);
              const payment = payments.find(p => p.studentId === student.id);
              const isExpiringSoon =
                new Date(student.membershipExpiry).getTime() - Date.now() <=
                3 * 24 * 60 * 60 * 1000;
              const isExpired = student.status === 'expired' || new Date(student.membershipExpiry) < new Date();

              return (
                <div key={student.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/70 transition-colors">
                  {/* Top: Name, ID, Desk */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {student.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                          <span>{student.fullName}</span>
                          {student.isMinor && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-bold border border-amber-300">
                              Minor
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {student.id}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 font-mono">
                      {student.assignedSeat ? (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-2xs">
                          {student.assignedSeat}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px]">
                          Floating
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phone</span>
                      <a
                        href={`tel:${student.phone}`}
                        className="font-mono font-semibold text-slate-800 hover:underline"
                      >
                        {student.phone}
                      </a>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Fee Status</span>
                      {payment && payment.pendingAmount > 0 ? (
                        <span className="font-bold text-rose-700 text-[11px]">
                          ₹{payment.pendingAmount} Due
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700 text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Paid</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Plan</span>
                      <span className="font-medium text-slate-700 truncate block">
                        {plan?.name || student.planId}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Validity</span>
                      <span className="font-mono text-slate-700 block">
                        {student.membershipExpiry}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-1.5">
                    <div>
                      {student.status === 'active' ? (
                        isExpiringSoon ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Expiring Soon
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Active
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 capitalize">
                          {student.status}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Check-In or Check-Out button */}
                      {sessions.some(s => s.studentId === student.id && s.status === 'inside') ? (
                        <button
                          id={`checkout-mob-${student.id}`}
                          title="Currently Inside - Click to Check Out"
                          onClick={() => onCheckOutStudent?.(student)}
                          className="px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 shadow-2xs flex items-center gap-1"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Out</span>
                        </button>
                      ) : (
                        <button
                          id={`checkin-mob-${student.id}`}
                          title="Check In Student"
                          onClick={() => onCheckInStudent?.(student)}
                          className="px-2 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 shadow-2xs flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>Check In</span>
                        </button>
                      )}

                      <button
                        id={`view-card-mob-${student.id}`}
                        title="View / Print Digital QR ID Pass"
                        onClick={() => onViewStudentCard(student)}
                        className="p-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 shadow-2xs"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`wa-reminder-mob-${student.id}`}
                        title="Send WhatsApp Notice"
                        onClick={() => onSendWhatsAppReminder(student)}
                        className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`renew-mob-${student.id}`}
                        title="Renew Plan"
                        onClick={() => onRenewStudent(student)}
                        className="p-1.5 text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                      </button>

                      <button
                        id={`edit-mob-${student.id}`}
                        title="Edit Student"
                        onClick={() => onEditStudent(student)}
                        className="p-1.5 text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 shadow-2xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No students match current search or filters.
            </div>
          )}
        </div>

        {/* Desktop Table (hidden sm:block) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Student & ID</th>
                <th className="px-4 py-3">Contact Details</th>
                <th className="px-4 py-3">Allocated Desk</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Validity</th>
                <th className="px-4 py-3">Fee Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const plan = plans.find(p => p.id === student.planId);
                  const payment = payments.find(p => p.studentId === student.id);
                  const isExpiringSoon =
                    new Date(student.membershipExpiry).getTime() - Date.now() <=
                    3 * 24 * 60 * 60 * 1000;
                  const isExpired = student.status === 'expired' || new Date(student.membershipExpiry) < new Date();

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & ID with initial avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{student.fullName}</span>
                              {student.isMinor && (
                                <span
                                  title="Minor: Guardian Consent Verified"
                                  className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-bold border border-amber-300 flex items-center gap-0.5"
                                >
                                  <ShieldCheck className="w-2.5 h-2.5 text-amber-700" />
                                  Minor
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {student.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone / WhatsApp */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-800 font-semibold">{student.phone}</span>
                          <a
                            href={`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                            title="Direct WhatsApp Chat"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                          {student.email || 'No email registered'}
                        </div>
                      </td>

                      {/* Desk */}
                      <td className="px-4 py-3.5 font-mono">
                        {student.assignedSeat ? (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold shadow-2xs">
                            {student.assignedSeat}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px]">
                            Floating
                          </span>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800">
                          {plan?.name || student.planId}
                        </span>
                        <div className="text-[11px] text-slate-500 font-mono">
                          ₹{plan?.price || 1500} / mo
                        </div>
                      </td>

                      {/* Validity & Status */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800 font-mono">
                          {student.membershipExpiry}
                        </div>
                        <div className="mt-0.5">
                          {student.status === 'active' ? (
                            isExpiringSoon ? (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Expiring Soon
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                Active
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 capitalize">
                              {student.status}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fee Dues */}
                      <td className="px-4 py-3.5">
                        {payment && payment.pendingAmount > 0 ? (
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              ₹{payment.pendingAmount} Due
                            </span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Paid</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Check-In / Check-Out */}
                          {sessions.some(s => s.studentId === student.id && s.status === 'inside') ? (
                            <button
                              id={`checkout-btn-${student.id}`}
                              title="Currently inside - click to check out"
                              onClick={() => onCheckOutStudent?.(student)}
                              className="px-2 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 shadow-2xs flex items-center gap-1"
                            >
                              <LogOut className="w-3 h-3 text-rose-600" />
                              <span>Check Out</span>
                            </button>
                          ) : (
                            <button
                              id={`checkin-btn-${student.id}`}
                              title="Check In Student to Study Hall"
                              onClick={() => onCheckInStudent?.(student)}
                              className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-300 shadow-2xs flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Check In</span>
                            </button>
                          )}

                          {/* QR Card Button */}
                          <button
                            id={`view-card-${student.id}`}
                            title="View / Print Digital QR ID Pass"
                            onClick={() => onViewStudentCard(student)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-2xs"
                          >
                            <QrCode className="w-4 h-4 text-indigo-600" />
                          </button>

                          {/* WhatsApp Reminder Button */}
                          <button
                            id={`wa-reminder-${student.id}`}
                            title="Send WhatsApp Fee / Validity Notice"
                            onClick={() => onSendWhatsAppReminder(student)}
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200 shadow-2xs"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Renew Membership */}
                          <button
                            id={`renew-${student.id}`}
                            title="Renew Membership Plan"
                            onClick={() => onRenewStudent(student)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-2xs"
                          >
                            <RefreshCw className="w-4 h-4 text-emerald-600" />
                          </button>

                          {/* Edit Student */}
                          <button
                            id={`edit-${student.id}`}
                            title="Edit Student Information"
                            onClick={() => onEditStudent(student)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shadow-2xs"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">No students match current search or filters.</p>
                    <p className="text-xs text-slate-400 mt-1">Try changing the quick filter or search terms above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
