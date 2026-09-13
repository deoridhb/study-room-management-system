import React, { useState } from 'react';
import { PaymentRecord, Student, MembershipPlan } from '../types';
import { downloadCsv } from '../utils/exportCsv';
import {
  CreditCard,
  PlusCircle,
  Download,
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  Send,
  ArrowUpRight,
} from 'lucide-react';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  students: Student[];
  plans: MembershipPlan[];
  onOpenRecordPayment: () => void;
  onViewReceipt: (payment: PaymentRecord) => void;
  onSendReminder: (student: Student) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  students,
  plans,
  onOpenRecordPayment,
  onViewReceipt,
  onSendReminder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all');

  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalPending = payments.reduce((sum, p) => sum + p.pendingAmount, 0);
  const paidCount = payments.filter(p => p.status === 'paid').length;
  const pendingCount = payments.filter(p => p.status === 'pending' || p.status === 'partial').length;

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesSearch =
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receiptNo.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleExportCsv = () => {
    const headers = [
      'Receipt No',
      'Student ID',
      'Student Name',
      'Membership Plan',
      'Total Fee (INR)',
      'Amount Paid (INR)',
      'Pending Due (INR)',
      'Payment Date',
      'Due Date',
      'Payment Method',
      'Status',
      'Transaction Ref',
    ];

    const rows = payments.map(p => [
      p.receiptNo,
      p.studentId,
      p.studentName,
      p.planName,
      p.totalFee,
      p.amountPaid,
      p.pendingAmount,
      p.paymentDate,
      p.dueDate,
      p.paymentMethod,
      p.status,
      p.transactionRef || '-',
    ]);

    downloadCsv('Fee_Payments_Register', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <span>Fee & Payment Dashboard (§12 & §13)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track student fee collections, generate printable receipts, and follow up on pending dues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="export-payments-csv-btn"
            onClick={handleExportCsv}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            id="record-payment-btn"
            onClick={onOpenRecordPayment}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Record Fee Payment</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Total Collected
          </p>
          <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
            ₹{totalCollected.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{paidCount} fully paid records</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Outstanding Balance
          </p>
          <p className="text-2xl font-black text-rose-600 font-mono mt-1">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{pendingCount} students pending</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Collection Rate
          </p>
          <p className="text-2xl font-black text-indigo-700 font-mono mt-1">
            {totalCollected + totalPending > 0
              ? Math.round((totalCollected / (totalCollected + totalPending)) * 100)
              : 100}
            %
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Realized fee percentage</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Accepted Modes
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-bold text-slate-700">
              UPI
            </span>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-bold text-slate-700">
              Cash
            </span>
            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-bold text-slate-700">
              IMPS
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-payments-input"
            type="text"
            placeholder="Search by student name, ID, or receipt number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            All ({payments.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              statusFilter === 'paid'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            Paid ({paidCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              statusFilter === 'pending'
                ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            Pending Dues ({pendingCount})
          </button>
        </div>
      </div>

      {/* Payment Dashboard List & Table (§13 PRD Format) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile Cards (sm:hidden: No horizontal scrolling) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredPayments.length > 0 ? (
            filteredPayments.map(payment => {
              const student = students.find(s => s.id === payment.studentId);

              return (
                <div key={payment.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/70 transition-colors">
                  {/* Top: Receipt #, Date & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {payment.receiptNo}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {payment.paymentDate}
                      </span>
                    </div>

                    <div>
                      {payment.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Paid
                        </span>
                      ) : payment.status === 'partial' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          Partial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Student & Plan */}
                  <div>
                    <div className="font-bold text-xs text-slate-900">{payment.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                      <span>{payment.studentId}</span>
                      <span>•</span>
                      <span className="text-slate-700 font-sans">{payment.planName}</span>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Paid</span>
                      <span className="font-mono font-black text-emerald-700 text-xs">
                        ₹{payment.amountPaid.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Due</span>
                      {payment.pendingAmount > 0 ? (
                        <span className="font-mono font-bold text-rose-600 text-xs">
                          ₹{payment.pendingAmount.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="font-mono text-slate-400 text-xs">₹0</span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">Method</span>
                      <span className="uppercase text-[10px] font-semibold text-slate-600">
                        {payment.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    {payment.pendingAmount > 0 && student && (
                      <button
                        id={`send-due-reminder-mob-${student.id}`}
                        onClick={() => onSendReminder(student)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Due Reminder</span>
                      </button>
                    )}

                    <button
                      id={`view-receipt-btn-mob-${payment.id}`}
                      onClick={() => onViewReceipt(payment)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Receipt className="w-3.5 h-3.5 text-slate-500" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No payment records found matching filters.
            </div>
          )}
        </div>

        {/* Desktop Table View (hidden sm:block) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Paid Amount</th>
                <th className="px-4 py-3">Pending Due</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Receipt / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map(payment => {
                  const student = students.find(s => s.id === payment.studentId);

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {payment.receiptNo}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {payment.paymentDate}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{payment.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {payment.studentId}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {payment.planName}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-700 text-sm">
                        ₹{payment.amountPaid.toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3.5 font-mono font-semibold">
                        {payment.pendingAmount > 0 ? (
                          <span className="text-rose-600 font-bold">
                            ₹{payment.pendingAmount.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-slate-400">₹0</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 uppercase font-medium text-slate-600">
                        {payment.paymentMethod.replace('_', ' ')}
                      </td>

                      <td className="px-4 py-3.5">
                        {payment.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </span>
                        ) : payment.status === 'partial' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" />
                            Partial
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {payment.pendingAmount > 0 && student && (
                            <button
                              id={`send-due-reminder-${student.id}`}
                              title="Send WhatsApp Payment Due Reminder"
                              onClick={() => onSendReminder(student)}
                              className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span className="hidden sm:inline">Remind</span>
                            </button>
                          )}

                          <button
                            id={`view-receipt-btn-${payment.id}`}
                            onClick={() => onViewReceipt(payment)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs"
                          >
                            <Receipt className="w-3.5 h-3.5 text-slate-500" />
                            <span>Receipt</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    No payment records found matching filters.
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
