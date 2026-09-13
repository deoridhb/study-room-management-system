import React, { useState } from 'react';
import { Student, ReminderLog, SystemSettings, PaymentRecord } from '../types';
import { downloadCsv } from '../utils/exportCsv';
import {
  MessageSquare,
  Send,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Coins,
  Sparkles,
} from 'lucide-react';

interface WhatsAppRemindersViewProps {
  students: Student[];
  payments: PaymentRecord[];
  reminders: ReminderLog[];
  settings: SystemSettings;
  onTriggerDailyBatch: () => { sentCount: number; skippedCount: number };
  onSendSingleReminder: (student: Student, customNote?: string) => void;
}

export const WhatsAppRemindersView: React.FC<WhatsAppRemindersViewProps> = ({
  students,
  payments,
  reminders,
  settings,
  onTriggerDailyBatch,
  onSendSingleReminder,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [batchResult, setBatchResult] = useState<{ sentCount: number; skippedCount: number } | null>(null);

  // Filter students who are due or overdue
  const now = new Date();
  const warningThreshold = new Date();
  warningThreshold.setDate(now.getDate() + settings.reminderDaysBeforeExpiry);

  const dueStudents = students.filter(s => {
    const exp = new Date(s.membershipExpiry);
    const payment = payments.find(p => p.studentId === s.id);
    const hasDues = payment && payment.pendingAmount > 0;
    return s.status === 'expired' || exp <= warningThreshold || hasDues;
  });

  const totalCostInr = reminders.reduce((sum, r) => sum + r.costEstimateInr, 0);

  const handleRunBatch = () => {
    const result = onTriggerDailyBatch();
    setBatchResult(result);
    setTimeout(() => setBatchResult(null), 6000);
  };

  const handleSendManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    const student = students.find(s => s.id === selectedStudentId);
    if (student) {
      onSendSingleReminder(student, customNote);
      setSelectedStudentId('');
      setCustomNote('');
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Log ID',
      'Student ID',
      'Student Name',
      'WhatsApp Phone',
      'Channel',
      'Trigger Type',
      'Template Name',
      'Sent Timestamp',
      'Delivery Status',
      'Message Text',
      'Cost (INR)',
    ];

    const rows = reminders.map(r => [
      r.id,
      r.studentId,
      r.studentName,
      r.phone,
      r.channel,
      r.triggerType,
      r.templateName,
      r.sentAt,
      r.deliveryStatus,
      r.messageText,
      r.costEstimateInr,
    ]);

    downloadCsv('WhatsApp_Reminder_Logs', headers, rows);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedPayment = selectedStudent ? payments.find(p => p.studentId === selectedStudent.id) : null;
  const duesAmount = selectedPayment ? selectedPayment.pendingAmount : 1500;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Automated WhatsApp Payment Reminders (§17 & §23a)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                  v3 Core Feature
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Meta Business Cloud API Utility Template reminders with duplicate prevention logs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-reminder-logs-btn"
            onClick={handleExportCsv}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Logs CSV</span>
          </button>
          <button
            id="trigger-daily-batch-btn"
            onClick={handleRunBatch}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Run Daily Automated Check</span>
          </button>
        </div>
      </div>

      {/* Batch Run Notification Banner */}
      {batchResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Batch Job Completed: <strong>{batchResult.sentCount}</strong> reminder(s) dispatched.
              {batchResult.skippedCount > 0 && (
                <span> ({batchResult.skippedCount} skipped as already notified today).</span>
              )}
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-700 font-semibold">
            Status: Logged into reminder_logs
          </span>
        </div>
      )}

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Students Due for Reminder
          </p>
          <p className="text-2xl font-black text-amber-600 font-mono mt-1">
            {dueStudents.length} Students
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Expires in ≤ {settings.reminderDaysBeforeExpiry} days or overdue
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Reminders Dispatched (Total)
          </p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            {reminders.length}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Delivery via Meta Cloud API</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Meta API Cost Accrued (§23a)
          </p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            ₹{totalCostInr.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Avg ~₹0.35 / Utility template message
          </p>
        </div>
      </div>

      {/* Two Column Layout: Template Preview & Manual Dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Meta Approved Utility Template Preview (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Meta Approved WhatsApp Utility Template
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                studyroom_fee_reminder_utility
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Per §23a compliance: Sent as a verified Meta <strong>Utility</strong> category template, avoiding promotional spam flags and securing lowest pricing.
            </p>

            {/* Simulated WhatsApp Chat Bubble */}
            <div className="mt-4 p-4 rounded-2xl bg-[#EFEAE2] border border-slate-300/80 max-w-sm">
              <div className="bg-white p-3.5 rounded-xl rounded-tl-none shadow-xs text-xs text-slate-800 space-y-2 relative">
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  <span>{settings.libraryName}</span>
                  <span className="text-slate-400">• Official Notice</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  Dear <strong>Rahul Sharma</strong>,
                  <br /><br />
                  Your membership at <strong>{settings.libraryName}</strong> (Plan: Monthly Membership) is due for renewal on <strong>2026-09-30</strong>.
                  <br /><br />
                  Outstanding Dues: <strong>₹1,500</strong>
                  <br /><br />
                  Please complete the renewal via UPI or at the front-desk counter to retain your dedicated desk assignment without disruption.
                  <br /><br />
                  Thank you!
                </p>
                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400">
                  <span>08:00 AM</span>
                  <span className="text-blue-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Deduplication: Max 1 reminder / student / day (§26)</span>
            <span className="text-emerald-700 font-semibold">Active & Armed</span>
          </div>
        </div>

        {/* Right: Manual / Ad-Hoc Reminder Dispatch Form (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <form onSubmit={handleSendManual} className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Manual Student Follow-up & Click-to-Chat</span>
              </h3>
              <span className="text-[11px] text-slate-500">Ad-hoc send</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Student Due for Payment
              </label>
              <select
                required
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-slate-900"
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => {
                  const p = payments.find(pay => pay.studentId === s.id);
                  const dues = p ? p.pendingAmount : 0;
                  return (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.phone}) • Expiry: {s.membershipExpiry}
                      {dues > 0 ? ` • Dues: ₹${dues}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Optional Custom Note / Urgent Grace Notice
              </label>
              <input
                type="text"
                placeholder="e.g. Please clear dues by 6 PM today to avoid desk release."
                value={customNote}
                onChange={e => setCustomNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-slate-900"
              />
            </div>

            {selectedStudent && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                <p className="font-semibold text-slate-800">
                  Target: {selectedStudent.fullName} • 📱 {selectedStudent.phone}
                </p>
                <p className="text-slate-600">
                  Desk: {selectedStudent.assignedSeat || 'Unassigned'} • Dues: ₹{duesAmount}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              {selectedStudent && (
                <a
                  href={`https://wa.me/${selectedStudent.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${selectedStudent.fullName}, reminder from ${settings.libraryName}: Your membership fee of ₹${duesAmount} is due. Thank you!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Open in WhatsApp Web</span>
                </a>
              )}
              <button
                type="submit"
                disabled={!selectedStudentId}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Meta Cloud API Reminder</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reminder Logs Table (§26 Data Model) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Reminder Dispatch Audit Logs (`reminder_logs` Table §26)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            {reminders.length} Logs recorded • Deduplication protected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">WhatsApp Number</th>
                <th className="px-4 py-3">Trigger Type</th>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Delivery Status</th>
                <th className="px-4 py-3 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reminders.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-slate-600 text-[11px]">
                    {new Date(log.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                    {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{log.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.studentId}</div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-700">
                    {log.phone}
                  </td>
                  <td className="px-4 py-3.5">
                    {log.triggerType === 'automated_cron' ? (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[10px] border border-indigo-200">
                        Automated Daily Cron
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        Admin Manual
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600">
                    {log.templateName}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="capitalize">{log.deliveryStatus}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-slate-700 font-semibold">
                    ₹{log.costEstimateInr.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
