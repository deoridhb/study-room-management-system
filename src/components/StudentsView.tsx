import React, { useState } from 'react';
import { Student, MembershipPlan, Seat, PaymentRecord } from '../types';
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
} from 'lucide-react';

interface StudentsViewProps {
  students: Student[];
  plans: MembershipPlan[];
  seats: Seat[];
  payments: PaymentRecord[];
  onOpenAddStudent: () => void;
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
  onOpenAddStudent,
  onEditStudent,
  onViewStudentCard,
  onSendWhatsAppReminder,
  onRenewStudent,
  onToggleStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      (s.assignedSeat && s.assignedSeat.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesPlan = planFilter === 'all' || s.planId === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
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
      {/* Top Header & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Student & Membership Registry ({students.length} Enrolled)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage registrations, desk allocations, QR credential cards, and WhatsApp notifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="export-students-csv-btn"
            onClick={handleExportCsv}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            id="open-add-student-btn"
            onClick={onOpenAddStudent}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Add New Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-students-input"
            type="text"
            placeholder="Search by Name, Student ID, Phone, Desk..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-800"
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

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Student & ID</th>
                <th className="px-4 py-3">Phone & Contact</th>
                <th className="px-4 py-3">Desk</th>
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

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & ID */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{student.fullName}</span>
                              {student.isMinor && (
                                <span
                                  title="Minor: Guardian Consent Verified"
                                  className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-semibold border border-amber-200 flex items-center gap-0.5"
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
                        <div className="font-mono text-slate-800 font-medium">
                          {student.phone}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                          {student.email || 'No email'}
                        </div>
                      </td>

                      {/* Desk */}
                      <td className="px-4 py-3.5 font-mono">
                        {student.assignedSeat ? (
                          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-900 font-bold border border-slate-200">
                            {student.assignedSeat}
                          </span>
                        ) : (
                          <span className="text-slate-400">Floating</span>
                        )}
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800">
                          {plan?.name || student.planId}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          ₹{plan?.price || 1500}
                        </div>
                      </td>

                      {/* Validity & Status */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">
                          {student.membershipExpiry}
                        </div>
                        <div>
                          {student.status === 'active' ? (
                            isExpiringSoon ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Expiring Soon
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Active
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 capitalize">
                              {student.status}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fee Dues */}
                      <td className="px-4 py-3.5">
                        {payment && payment.pendingAmount > 0 ? (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              ₹{payment.pendingAmount} Due
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Paid
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* QR Card Button */}
                          <button
                            id={`view-card-${student.id}`}
                            title="View / Print Digital QR ID Pass"
                            onClick={() => onViewStudentCard(student)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          >
                            <QrCode className="w-4 h-4 text-indigo-600" />
                          </button>

                          {/* WhatsApp Reminder Button */}
                          <button
                            id={`wa-reminder-${student.id}`}
                            title="Send Automated WhatsApp Payment Reminder"
                            onClick={() => onSendWhatsAppReminder(student)}
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                          >
                            <Send className="w-4 h-4" />
                          </button>

                          {/* Renew Membership */}
                          <button
                            id={`renew-${student.id}`}
                            title="Renew Membership Plan"
                            onClick={() => onRenewStudent(student)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          >
                            <RefreshCw className="w-4 h-4 text-emerald-600" />
                          </button>

                          {/* Edit Student */}
                          <button
                            id={`edit-${student.id}`}
                            title="Edit Student Information"
                            onClick={() => onEditStudent(student)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
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
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No students found matching current filters.
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
