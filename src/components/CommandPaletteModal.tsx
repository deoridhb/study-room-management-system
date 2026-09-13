import React, { useState, useEffect, useRef } from 'react';
import { Student, Seat, AttendanceSession, PaymentRecord } from '../types';
import { TabType } from './Navigation';
import {
  Search,
  X,
  User,
  Grid3X3,
  CreditCard,
  QrCode,
  Send,
  LogOut,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  PieChart,
  MessageSquare,
  BarChart3,
  Settings,
  UserPlus,
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  seats: Seat[];
  sessions: AttendanceSession[];
  payments: PaymentRecord[];
  onNavigateToTab: (tab: TabType) => void;
  onSelectStudentCard: (student: Student) => void;
  onSelectSeat: (seat: Seat) => void;
  onCheckInStudent: (student: Student) => void;
  onCheckOutStudent: (student: Student) => void;
  onOpenRecordPayment: (student?: Student) => void;
  onSendWhatsAppReminder: (student: Student) => void;
  onOpenAddStudent: () => void;
  onOpenScanner: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  students,
  seats,
  sessions,
  payments,
  onNavigateToTab,
  onSelectStudentCard,
  onSelectSeat,
  onCheckInStudent,
  onCheckOutStudent,
  onOpenRecordPayment,
  onSendWhatsAppReminder,
  onOpenAddStudent,
  onOpenScanner,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keydown handler for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmedQuery = query.trim().toLowerCase();

  // Matched students
  const matchedStudents = trimmedQuery
    ? students.filter(
        s =>
          s.fullName.toLowerCase().includes(trimmedQuery) ||
          s.id.toLowerCase().includes(trimmedQuery) ||
          s.phone.includes(trimmedQuery) ||
          (s.assignedSeat && s.assignedSeat.toLowerCase().includes(trimmedQuery))
      ).slice(0, 5)
    : [];

  // Matched seats
  const matchedSeats = trimmedQuery
    ? seats.filter(
        s =>
          s.seatNumber.toLowerCase().includes(trimmedQuery) ||
          s.row.toLowerCase() === trimmedQuery
      ).slice(0, 4)
    : [];

  // Navigation Items
  const navOptions: { id: TabType; label: string; icon: any; category: string }[] = [
    { id: 'dashboard', label: 'Go to Executive Dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { id: 'seats', label: 'Go to Visual Seat Map & Layout', icon: Grid3X3, category: 'Navigation' },
    { id: 'students', label: 'Go to Student & Membership Directory', icon: User, category: 'Navigation' },
    { id: 'attendance', label: 'Go to Attendance & QR Scans', icon: Clock, category: 'Navigation' },
    { id: 'payments', label: 'Go to Fee Collection & Receipts', icon: CreditCard, category: 'Navigation' },
    { id: 'expenses', label: 'Go to Expenses & Operating Budget', icon: PieChart, category: 'Navigation' },
    { id: 'whatsapp', label: 'Go to WhatsApp Reminders & Queue', icon: MessageSquare, category: 'Navigation' },
    { id: 'reports', label: 'Go to Business Reports & CSV Export', icon: BarChart3, category: 'Navigation' },
    { id: 'settings', label: 'Go to System Settings & Audit Logs', icon: Settings, category: 'Navigation' },
  ];

  const matchedNav = trimmedQuery
    ? navOptions.filter(n => n.label.toLowerCase().includes(trimmedQuery) || n.id.includes(trimmedQuery))
    : navOptions.slice(0, 4);

  // Quick Action Shortcuts
  const quickActions = [
    {
      id: 'kiosk',
      label: 'Launch Unattended Kiosk QR Scanner',
      icon: QrCode,
      action: () => {
        onClose();
        onOpenScanner();
      },
    },
    {
      id: 'add-student',
      label: 'Register New Student Member',
      icon: UserPlus,
      action: () => {
        onClose();
        onOpenAddStudent();
      },
    },
    {
      id: 'record-pay',
      label: 'Record Counter Fee Payment Receipt',
      icon: CreditCard,
      action: () => {
        onClose();
        onOpenRecordPayment();
      },
    },
  ];

  const matchedActions = trimmedQuery
    ? quickActions.filter(a => a.label.toLowerCase().includes(trimmedQuery))
    : quickActions;

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-20 px-2.5 sm:px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="command-palette-modal"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <Search className="w-5 h-5 text-indigo-600 shrink-0 mr-3" />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            placeholder="Search student name, desk (e.g. A01), phone, or type an action..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 ml-2 rounded text-[11px] font-mono font-medium text-slate-400 bg-slate-200/70 border border-slate-300">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="overflow-y-auto p-3 space-y-4 divide-y divide-slate-100">
          {/* Matched Students Section */}
          {matchedStudents.length > 0 && (
            <div className="pt-2 first:pt-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1.5 flex items-center justify-between">
                <span>Students Found ({matchedStudents.length})</span>
                <span className="text-[10px] text-slate-400 lowercase">Click for actions</span>
              </div>
              <div className="space-y-1">
                {matchedStudents.map(student => {
                  const isInside = sessions.some(s => s.studentId === student.id && s.status === 'inside');
                  const p = payments.find(pay => pay.studentId === student.id);
                  const hasDues = p && p.pendingAmount > 0;

                  return (
                    <div
                      key={student.id}
                      className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isInside
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {student.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {student.fullName}
                            </span>
                            {isInside ? (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Inside
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                Outside
                              </span>
                            )}
                            {hasDues && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                Due ₹{p?.pendingAmount}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                            <span>ID: {student.id}</span>
                            <span>•</span>
                            <span>Desk: {student.assignedSeat || 'None'}</span>
                            <span>•</span>
                            <span>{student.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Action Buttons for this Student */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {isInside ? (
                          <button
                            onClick={() => {
                              onCheckOutStudent(student);
                              onClose();
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors flex items-center gap-1"
                            title="Quick Check-Out"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Check-out</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              onCheckInStudent(student);
                              onClose();
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1"
                            title="Quick Check-In"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Check-in</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onSelectStudentCard(student);
                            onClose();
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Digital QR ID Card"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onOpenRecordPayment(student);
                            onClose();
                          }}
                          className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Record Payment"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            onSendWhatsAppReminder(student);
                            onClose();
                          }}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Send WhatsApp Dues Reminder"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Desks Section */}
          {matchedSeats.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1.5">
                Desks Found ({matchedSeats.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchedSeats.map(seat => {
                  const occupant = students.find(s => s.id === seat.currentOccupantStudentId);
                  return (
                    <div
                      key={seat.id}
                      onClick={() => {
                        onSelectSeat(seat);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs">
                          {seat.seatNumber}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-800 capitalize">
                            Status: {seat.status}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                            {occupant ? occupant.fullName : 'No occupant'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions Section */}
          {matchedActions.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1.5">
                Fast Actions
              </div>
              <div className="space-y-1">
                {matchedActions.map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-800">
                          {action.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono group-hover:text-slate-600">
                        ↵ Enter
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Section */}
          {matchedNav.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1.5">
                System Views & Sections
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {matchedNav.map(nav => {
                  const Icon = nav.icon;
                  return (
                    <button
                      key={nav.id}
                      onClick={() => {
                        onNavigateToTab(nav.id);
                        onClose();
                      }}
                      className="text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {nav.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {trimmedQuery &&
            matchedStudents.length === 0 &&
            matchedSeats.length === 0 &&
            matchedActions.length === 0 &&
            matchedNav.length === 0 && (
              <div className="py-8 text-center text-slate-500">
                <p className="text-sm font-medium">No results found for "{query}"</p>
                <p className="text-xs text-slate-400 mt-1">
                  Try searching by student name, phone number, desk code (e.g. A01), or keyword.
                </p>
              </div>
            )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-2xs font-mono font-bold">
                ↵
              </kbd>{' '}
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-2xs font-mono font-bold">
                ESC
              </kbd>{' '}
              to close
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-slate-400">
            {students.length} students • {seats.length} desks
          </span>
        </div>
      </div>
    </div>
  );
};
