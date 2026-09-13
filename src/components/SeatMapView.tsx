import React, { useState } from 'react';
import { Seat, Student, AttendanceSession } from '../types';
import {
  Grid3X3,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertOctagon,
  User,
  Sparkles,
} from 'lucide-react';

interface SeatMapViewProps {
  seats: Seat[];
  students: Student[];
  sessions: AttendanceSession[];
  onSelectSeat: (seat: Seat) => void;
}

export const SeatMapView: React.FC<SeatMapViewProps> = ({
  seats,
  students,
  sessions,
  onSelectSeat,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const occupiedCount = seats.filter(s => s.status === 'occupied').length;
  const availableCount = seats.filter(s => s.status === 'available').length;
  const reservedCount = seats.filter(s => s.status === 'reserved').length;
  const maintenanceCount = seats.filter(s => s.status === 'maintenance').length;

  const filteredSeats = seats.filter(s => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  // Group seats by rows (A, B, C, D, E)
  const rows = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-6">
      {/* Header & Status Summary Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-indigo-600" />
            <span>Interactive Visual Seat Allocation & Occupancy Map</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time reading hall layout (30 desks). Click any desk to reassign, release, or view occupant details.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="filter-seat-all"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            All Desks ({seats.length})
          </button>
          <button
            id="filter-seat-occupied"
            onClick={() => setFilterStatus('occupied')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
              filterStatus === 'occupied'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-slate-900" />
            <span>Occupied ({occupiedCount})</span>
          </button>
          <button
            id="filter-seat-available"
            onClick={() => setFilterStatus('available')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
              filterStatus === 'available'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Available ({availableCount})</span>
          </button>
          <button
            id="filter-seat-reserved"
            onClick={() => setFilterStatus('reserved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
              filterStatus === 'reserved'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Reserved ({reservedCount})</span>
          </button>
          <button
            id="filter-seat-maintenance"
            onClick={() => setFilterStatus('maintenance')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
              filterStatus === 'maintenance'
                ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Maintenance ({maintenanceCount})</span>
          </button>
        </div>
      </div>

      {/* Hall Front Stage / Entry Indicator */}
      <div className="w-full max-w-2xl mx-auto py-2 px-6 bg-slate-100 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
        <span>Entrance & Scanner Kiosk Area</span>
      </div>

      {/* Visual Desk Grid by Rows */}
      <div className="space-y-4">
        {rows.map(rowLetter => {
          const rowSeats = filteredSeats.filter(s => s.row === rowLetter);
          if (rowSeats.length === 0) return null;

          return (
            <div
              key={rowLetter}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs"
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center font-mono">
                  {rowLetter}
                </span>
                <span>Row {rowLetter} (Desks {rowLetter}01 – {rowLetter}06)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {rowSeats.map(seat => {
                  const assignedStudent = students.find(s => s.id === seat.assignedStudentId);
                  const currentOccupant = students.find(s => s.id === seat.currentOccupantStudentId);
                  const activeSession = sessions.find(
                    s => s.studentId === seat.currentOccupantStudentId && s.status === 'inside'
                  );

                  const isOccupied = seat.status === 'occupied';
                  const isReserved = seat.status === 'reserved';
                  const isMaint = seat.status === 'maintenance';
                  const isAvail = seat.status === 'available';

                  return (
                    <button
                      key={seat.id}
                      id={`seat-card-${seat.seatNumber}`}
                      onClick={() => onSelectSeat(seat)}
                      className={`relative text-left p-3.5 rounded-2xl border transition-all duration-200 group flex flex-col justify-between min-h-[110px] ${
                        isOccupied
                          ? 'bg-slate-900 border-slate-800 text-white shadow-md hover:border-slate-600'
                          : isReserved
                          ? 'bg-amber-50 border-amber-300 text-amber-950 hover:border-amber-500 shadow-xs'
                          : isMaint
                          ? 'bg-rose-50 border-rose-300 text-rose-950 hover:border-rose-400'
                          : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500 hover:shadow-md'
                      }`}
                    >
                      {/* Top bar of seat card */}
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`font-mono font-black text-sm tracking-tight ${
                            isOccupied ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {seat.seatNumber}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            isOccupied
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isReserved
                              ? 'bg-amber-200 text-amber-900'
                              : isMaint
                              ? 'bg-rose-200 text-rose-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {seat.status}
                        </span>
                      </div>

                      {/* Middle: Student details if present */}
                      <div className="my-2 min-w-0">
                        {currentOccupant ? (
                          <div className="truncate">
                            <p
                              className={`text-xs font-bold truncate ${
                                isOccupied ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {currentOccupant.fullName}
                            </p>
                            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5 font-mono">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Inside
                              {activeSession && ` • ${new Date(activeSession.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </p>
                          </div>
                        ) : assignedStudent ? (
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {assignedStudent.fullName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                              Allocated (Outside)
                            </p>
                          </div>
                        ) : isMaint ? (
                          <div className="flex items-center gap-1 text-rose-700 text-xs font-medium">
                            <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                            <span>Out of Order</span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 font-medium">
                            Ready for assign
                          </p>
                        )}
                      </div>

                      {/* Bottom action hint */}
                      <div
                        className={`text-[10px] pt-1.5 border-t font-medium flex items-center justify-between ${
                          isOccupied
                            ? 'border-slate-800 text-slate-400'
                            : 'border-slate-100 text-slate-400'
                        }`}
                      >
                        <span>Click to manage</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
