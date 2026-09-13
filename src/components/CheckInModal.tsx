import React, { useState, useEffect } from 'react';
import { Student, Seat, AttendanceSession } from '../types';
import {
  X,
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogOut,
  Sparkles,
  MapPin,
  Phone,
  Calendar,
  ShieldAlert,
} from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  seats: Seat[];
  sessions: AttendanceSession[];
  preselectedStudent?: Student | null;
  preselectedSeatNumber?: string | null;
  onCheckIn: (student: Student, chosenSeatNumber: string, overrideExpired?: boolean) => void;
  onCheckOut?: (student: Student) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  students,
  seats,
  sessions,
  preselectedStudent,
  preselectedSeatNumber,
  onCheckIn,
  onCheckOut,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [chosenSeat, setChosenSeat] = useState<string>('');
  const [allowExpiredOverride, setAllowExpiredOverride] = useState(false);

  // Available vacant seats
  const availableSeats = seats.filter(s => s.status === 'available' && s.status !== 'maintenance');

  // Initialize or reset selected student and seat when modal opens or preselected props change
  useEffect(() => {
    if (isOpen) {
      const initialStudent = preselectedStudent || (students.length > 0 ? students[0] : null);
      if (initialStudent) {
        setSelectedStudentId(initialStudent.id);
      }
      setSearchQuery('');
      setAllowExpiredOverride(false);
    }
  }, [isOpen, preselectedStudent, students]);

  // When selected student changes, determine default seat
  useEffect(() => {
    if (!selectedStudentId) return;
    const currentStudent = students.find(s => s.id === selectedStudentId);
    if (!currentStudent) return;

    if (preselectedSeatNumber) {
      setChosenSeat(preselectedSeatNumber);
      return;
    }

    // Check if student's assigned desk is available
    if (currentStudent.assignedSeat) {
      const assignedDesk = seats.find(s => s.seatNumber === currentStudent.assignedSeat);
      if (assignedDesk && assignedDesk.status !== 'occupied' && assignedDesk.status !== 'maintenance') {
        setChosenSeat(currentStudent.assignedSeat);
        return;
      }
    }

    // Fallback to first available desk
    if (availableSeats.length > 0) {
      setChosenSeat(availableSeats[0].seatNumber);
    } else {
      setChosenSeat('');
    }
  }, [selectedStudentId, preselectedSeatNumber, seats, students]);

  if (!isOpen) return null;

  // Selected student object
  const currentStudent = students.find(s => s.id === selectedStudentId) || preselectedStudent || students[0];

  // Check if student is currently inside
  const activeSession = currentStudent
    ? sessions.find(s => s.studentId === currentStudent.id && s.status === 'inside')
    : undefined;
  const isCurrentlyInside = !!activeSession;

  // Check if student's membership is expired
  const isExpired = currentStudent
    ? currentStudent.status === 'expired' ||
      new Date(currentStudent.membershipExpiry).getTime() < Date.now() - 24 * 60 * 60 * 1000
    : false;

  // Filtered students for search dropdown
  const filteredStudents = students.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.fullName && s.fullName.toLowerCase().includes(q)) ||
      (s.id && s.id.toLowerCase().includes(q)) ||
      ((s.phone || (s as any).phoneNumber || '').includes(q)) ||
      (s.assignedSeat && s.assignedSeat.toLowerCase().includes(q))
    );
  });

  const handleConfirmCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    const seatToAssign = chosenSeat || currentStudent.assignedSeat || (availableSeats[0] ? availableSeats[0].seatNumber : 'A01');
    onCheckIn(currentStudent, seatToAssign, isExpired ? true : allowExpiredOverride);
    onClose();
  };

  const handleConfirmCheckOut = () => {
    if (!currentStudent) return;
    if (onCheckOut) {
      onCheckOut(currentStudent);
    }
    onClose();
  };

  return (
    <div
      id="check-in-student-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="check-in-student-modal-container"
        className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Check-In Student</h3>
              <p className="text-xs text-slate-500">Record study hall entry & allocate desk</p>
            </div>
          </div>

          <button
            id="close-checkin-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleConfirmCheckIn} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {/* Step 1: Select Student */}
          <div>
            <label className="block font-bold text-slate-800 text-xs mb-1.5">
              1. Select Student to Check In
            </label>

            {/* Quick Search */}
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Type name, phone, or student ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>

            {/* Student Dropdown / Selector */}
            <select
              id="checkin-select-student"
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
            >
              {filteredStudents.map(s => {
                const inside = sessions.some(sess => sess.studentId === s.id && sess.status === 'inside');
                return (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.id}) — {((s as any).planType || s.planId || 'Plan').toString().toUpperCase()} {inside ? '• [INSIDE]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Student Identity Card Preview */}
          {currentStudent && (
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                isCurrentlyInside
                  ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                  : isExpired
                  ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                  : 'bg-slate-50/80 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    {currentStudent.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {currentStudent.fullName}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {currentStudent.id} • {currentStudent.phone || (currentStudent as any).phoneNumber || 'No phone'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${
                      isCurrentlyInside
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : isExpired
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                    }`}
                  >
                    {isCurrentlyInside ? 'Inside Now' : ((currentStudent as any).planType || currentStudent.planId || 'Plan')}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Exp: {currentStudent.membershipExpiry}
                  </p>
                </div>
              </div>

              {/* Already Checked-In Alert */}
              {isCurrentlyInside && activeSession && (
                <div className="mt-3 pt-3 border-t border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Already checked in at Desk <strong>{activeSession.seatNumber}</strong> since{' '}
                      {new Date(activeSession.checkInTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <button
                    type="button"
                    id="modal-direct-checkout-btn"
                    onClick={handleConfirmCheckOut}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Check Out Now</span>
                  </button>
                </div>
              )}

              {/* Expired Membership Alert */}
              {!isCurrentlyInside && isExpired && (
                <div className="mt-3 pt-3 border-t border-rose-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-800 font-semibold">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Membership Expired on {currentStudent.membershipExpiry}. Renewal due.
                    </span>
                  </div>

                  <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-rose-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowExpiredOverride}
                      onChange={e => setAllowExpiredOverride(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span className="text-[11px] text-slate-700 font-medium">
                      Front Desk Override: Allow access today despite expiration
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Desk Selection */}
          {!isCurrentlyInside && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 text-xs">
                  2. Allocate Study Desk / Seat
                </label>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  {availableSeats.length} Desks Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Student Assigned Desk
                  </label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 flex items-center justify-between">
                    <span>{currentStudent?.assignedSeat || 'Floating / Flexible'}</span>
                    {currentStudent?.assignedSeat && (
                      <span className="text-[10px] text-indigo-600 font-semibold">Preferred</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Check-in Desk Choice
                  </label>
                  <select
                    id="checkin-select-seat"
                    value={chosenSeat}
                    onChange={e => setChosenSeat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-indigo-600 shadow-2xs"
                  >
                    {currentStudent?.assignedSeat && (
                      <option value={currentStudent.assignedSeat}>
                        Desk {currentStudent.assignedSeat} (Student Assigned)
                      </option>
                    )}
                    {availableSeats.map(seat => (
                      <option key={seat.id} value={seat.seatNumber}>
                        Desk {seat.seatNumber} ({seat.status})
                      </option>
                    ))}
                    {availableSeats.length === 0 && !currentStudent?.assignedSeat && (
                      <option value="">No Desks Available</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              id="cancel-checkin-btn"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            {!isCurrentlyInside && (
              <button
                type="submit"
                id="confirm-checkin-submit-btn"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 ring-1 ring-emerald-600 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {isExpired ? 'Override & Check In' : 'Check In'}{' '}
                  {currentStudent ? currentStudent.fullName.split(' ')[0] : 'Student'} to{' '}
                  {chosenSeat || 'Desk'}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
