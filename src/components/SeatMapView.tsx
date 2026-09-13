import React, { useState } from 'react';
import { Seat, Student, AttendanceSession } from '../types';
import {
  Grid3X3,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  AlertOctagon,
  User,
  Sparkles,
  ArrowRight,
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
  const [searchQuery, setSearchQuery] = useState<string>('');

  const occupiedCount = seats.filter(s => s.status === 'occupied').length;
  const availableCount = seats.filter(s => s.status === 'available').length;
  const reservedCount = seats.filter(s => s.status === 'reserved').length;
  const maintenanceCount = seats.filter(s => s.status === 'maintenance').length;
  const occupancyPercent = seats.length > 0 ? Math.min(100, Math.round((occupiedCount / seats.length) * 100)) : 0;

  const filteredSeats = seats.filter(s => {
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const assignedStudent = students.find(st => st.id === s.assignedStudentId);
    const occupantStudent = students.find(st => st.id === s.currentOccupantStudentId);

    return (
      s.seatNumber.toLowerCase().includes(q) ||
      s.row.toLowerCase() === q ||
      (assignedStudent && assignedStudent.fullName.toLowerCase().includes(q)) ||
      (occupantStudent && occupantStudent.fullName.toLowerCase().includes(q))
    );
  });

  // Group seats by rows (A, B, C, D, E)
  const rows = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-6">
      {/* Header & Status Summary Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0">
              <Grid3X3 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Interactive Visual Seat Map
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time reading hall layout ({seats.length} total desks). Tap any desk to assign, release, or check-in.
          </p>
        </div>

        {/* Live Occupancy Metric Mini Bar */}
        <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl shrink-0">
          <div>
            <div className="text-xs font-bold text-slate-900 font-mono">
              {occupiedCount} / {seats.length} Desks Full
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {occupancyPercent}% Occupancy Rate
            </div>
          </div>
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden shrink-0">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search desk (A01) or student..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-slate-50/50 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            id="filter-seat-all"
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            All ({seats.length})
          </button>
          <button
            id="filter-seat-occupied"
            onClick={() => setFilterStatus('occupied')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
              filterStatus === 'occupied'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-slate-900" />
            <span>Occupied ({occupiedCount})</span>
          </button>
          <button
            id="filter-seat-available"
            onClick={() => setFilterStatus('available')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
              filterStatus === 'available'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Available ({availableCount})</span>
          </button>
          <button
            id="filter-seat-reserved"
            onClick={() => setFilterStatus('reserved')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
              filterStatus === 'reserved'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Reserved ({reservedCount})</span>
          </button>
          <button
            id="filter-seat-maintenance"
            onClick={() => setFilterStatus('maintenance')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
              filterStatus === 'maintenance'
                ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Out of Order ({maintenanceCount})</span>
          </button>
        </div>
      </div>

      {/* Hall Front Stage / Entry Indicator */}
      <div className="w-full max-w-xl mx-auto py-2 px-3 sm:px-6 bg-slate-100 rounded-2xl border border-slate-200 text-center text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xs">
        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="truncate">Main Reading Lounge Entrance & QR Kiosk</span>
        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
      </div>

      {/* Visual Desk Grid by Rows */}
      <div className="space-y-4">
        {rows.map(rowLetter => {
          const rowSeats = filteredSeats.filter(s => s.row === rowLetter);
          if (rowSeats.length === 0) return null;

          return (
            <div
              key={rowLetter}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono text-xs">
                    {rowLetter}
                  </span>
                  <span>Row {rowLetter} (Desks {rowLetter}01 – {rowLetter}06)</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 lowercase">
                  {rowSeats.length} desks displayed
                </span>
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

                  // Calculate time inside if active
                  let timeInsideStr = '';
                  if (activeSession) {
                    const diffMins = Math.max(1, Math.round((Date.now() - new Date(activeSession.checkInTime).getTime()) / (1000 * 60)));
                    const hrs = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;
                    timeInsideStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
                  }

                  return (
                    <button
                      key={seat.id}
                      id={`seat-card-${seat.seatNumber}`}
                      onClick={() => onSelectSeat(seat)}
                      className={`relative text-left p-3.5 rounded-2xl border transition-all duration-200 group flex flex-col justify-between min-h-[120px] shadow-2xs ${
                        isOccupied
                          ? 'bg-slate-900 border-slate-800 text-white hover:border-emerald-500 hover:shadow-md'
                          : isReserved
                          ? 'bg-amber-50/80 border-amber-300 text-amber-950 hover:border-amber-500 hover:shadow-md'
                          : isMaint
                          ? 'bg-rose-50/80 border-rose-300 text-rose-950 hover:border-rose-400'
                          : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500 hover:shadow-md hover:bg-emerald-50/20'
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
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            isOccupied
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isReserved
                              ? 'bg-amber-200 text-amber-900 font-bold'
                              : isMaint
                              ? 'bg-rose-200 text-rose-900 font-bold'
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
                            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5 font-mono">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Inside ({timeInsideStr})</span>
                            </p>
                          </div>
                        ) : assignedStudent ? (
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {assignedStudent.fullName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                              Allocated (Outside)
                            </p>
                          </div>
                        ) : isMaint ? (
                          <div className="flex items-center gap-1 text-rose-700 text-xs font-semibold">
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
                        className={`text-[10px] pt-1.5 border-t font-semibold flex items-center justify-between ${
                          isOccupied
                            ? 'border-slate-800 text-slate-400'
                            : 'border-slate-100 text-slate-400'
                        }`}
                      >
                        <span>Click to manage</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
