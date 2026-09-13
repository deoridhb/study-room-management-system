import React, { useState } from 'react';
import { Seat, Student, AttendanceSession } from '../types';
import { X, CheckCircle2, UserPlus, AlertOctagon, UserX, Clock } from 'lucide-react';

interface SeatActionModalProps {
  seat: Seat | null;
  students?: Student[];
  sessions?: AttendanceSession[];
  isOpen?: boolean;
  onAssignStudent?: (seatId: string, studentId: string) => void;
  onAssign?: (seatNumber: string, studentId: string) => void;
  onReleaseSeat?: (seatId: string) => void;
  onRelease?: (seatNumber: string) => void;
  onToggleMaintenance?: ((seatId: string) => void) | ((seatNumber: string, isMaintenance: boolean) => void);
  onToggleReserved?: (seatId: string) => void;
  onClose: () => void;
}

export const SeatActionModal: React.FC<SeatActionModalProps> = ({
  seat,
  students = [],
  sessions = [],
  isOpen = true,
  onAssignStudent,
  onAssign,
  onReleaseSeat,
  onRelease,
  onToggleMaintenance,
  onToggleReserved,
  onClose,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  if (!seat || !isOpen) return null;

  const assignedStudent = (students || []).find(s => s.id === seat.assignedStudentId);
  const currentOccupant = (students || []).find(s => s.id === seat.currentOccupantStudentId);
  const currentSession = (sessions || []).find(
    s => s.studentId === seat.currentOccupantStudentId && s.status === 'inside'
  );

  const availableStudents = (students || []).filter(
    s => s.status === 'active' && (!s.assignedSeat || s.assignedSeat === seat.seatNumber)
  );

  return (
    <div
      id="seat-action-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div
        id="seat-action-modal-container"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-900 text-white font-mono font-bold text-base shadow-sm">
              {seat.seatNumber}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Seat Details & Actions</h3>
              <p className="text-xs text-slate-500 capitalize">Status: {seat.status}</p>
            </div>
          </div>
          <button
            id="close-seat-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Current Live Occupant */}
          {currentOccupant && currentSession && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">
                  Physically Inside Now
                </span>
                <span className="text-emerald-700 flex items-center gap-1 font-medium text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  Since {new Date(currentSession.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{currentOccupant.fullName}</p>
              <p className="text-slate-600 text-[11px]">ID: {currentOccupant.id} • 📱 {currentOccupant.phone}</p>
            </div>
          )}

          {/* Assigned Student */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
              Membership Desk Allocation
            </span>
            {assignedStudent ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{assignedStudent.fullName}</p>
                  <p className="text-slate-500 text-[11px]">
                    {assignedStudent.id} • Valid till: {assignedStudent.membershipExpiry}
                  </p>
                </div>
                <button
                  id="release-seat-student-btn"
                  onClick={() => {
                    if (onReleaseSeat) onReleaseSeat(seat.id);
                    else if (onRelease) onRelease(seat.seatNumber);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <UserX className="w-3.5 h-3.5" />
                  Release
                </button>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                <p className="text-slate-500 text-xs">No student is permanently allocated to this desk.</p>
                <div className="flex items-center gap-2">
                  <select
                    id="select-student-for-seat"
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-slate-900"
                  >
                    <option value="">-- Select Student to Allocate --</option>
                    {availableStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.id})
                      </option>
                    ))}
                  </select>
                  <button
                    id="confirm-assign-student-btn"
                    disabled={!selectedStudentId}
                    onClick={() => {
                      if (selectedStudentId) {
                        if (onAssignStudent) onAssignStudent(seat.id, selectedStudentId);
                        else if (onAssign) onAssign(seat.seatNumber, selectedStudentId);
                        setSelectedStudentId('');
                      }
                    }}
                    className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Assign
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Seat Operations: Toggle Maintenance / Reserve */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <button
              id="toggle-maintenance-btn"
              onClick={() => {
                if (onToggleMaintenance) {
                  (onToggleMaintenance as (id: string, isMaint: boolean) => void)(seat.id, seat.status !== 'maintenance');
                }
              }}
              className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                seat.status === 'maintenance'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>{seat.status === 'maintenance' ? 'Clear Maintenance' : 'Mark Maintenance'}</span>
            </button>

            <button
              id="toggle-reserved-btn"
              onClick={() => onToggleReserved?.(seat.id)}
              className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                seat.status === 'reserved'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>{seat.status === 'reserved' ? 'Unreserve' : 'Mark Reserved'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
