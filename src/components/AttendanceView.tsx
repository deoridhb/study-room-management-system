import React, { useState } from 'react';
import { Student, AttendanceSession, Seat } from '../types';
import { downloadCsv } from '../utils/exportCsv';
import {
  Clock,
  QrCode,
  Download,
  Filter,
  UserCheck,
  LogOut,
  Wifi,
  ShieldAlert,
  Search,
  PlusCircle,
} from 'lucide-react';

interface AttendanceViewProps {
  students: Student[];
  sessions: AttendanceSession[];
  seats: Seat[];
  onOpenScanner: () => void;
  onCheckIn: (student: Student) => void;
  onCheckOut: (student: Student) => void;
  onManualOverride: (studentId: string, action: 'in' | 'out', notes?: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  sessions,
  seats,
  onOpenScanner,
  onCheckIn,
  onCheckOut,
  onManualOverride,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'inside' | 'outside'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [overrideStudentId, setOverrideStudentId] = useState('');
  const [overrideAction, setOverrideAction] = useState<'in' | 'out'>('in');
  const [overrideNote, setOverrideNote] = useState('');
  const [showOverridePanel, setShowOverridePanel] = useState(false);

  const filteredSessions = sessions.filter(session => {
    const matchesFilter =
      filterType === 'all' || session.status === filterType;

    const matchesSearch =
      session.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.seatNumber.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleExportCsv = () => {
    const headers = [
      'Session ID',
      'Student ID',
      'Student Name',
      'Desk Number',
      'Check-in Time',
      'Check-out Time',
      'Duration (Minutes)',
      'Status',
      'Manual Override',
    ];

    const rows = sessions.map(s => [
      s.id,
      s.studentId,
      s.studentName,
      s.seatNumber,
      s.checkInTime,
      s.checkOutTime || 'Ongoing',
      s.durationMinutes || (s.status === 'inside' ? 'Active' : '-'),
      s.status,
      s.isManualOverride ? 'Yes' : 'No',
    ]);

    downloadCsv('Attendance_Sessions_Log', headers, rows);
  };

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideStudentId) return;

    onManualOverride(overrideStudentId, overrideAction, overrideNote);
    setOverrideStudentId('');
    setOverrideNote('');
    setShowOverridePanel(false);
  };

  const insideCount = sessions.filter(s => s.status === 'inside').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>Attendance & Entry/Exit Tracking</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automated QR check-ins, study session durations, manual overrides, and offline sync queue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="export-attendance-csv-btn"
            onClick={handleExportCsv}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="toggle-override-panel-btn"
            onClick={() => setShowOverridePanel(!showOverridePanel)}
            className="px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manual Override</span>
          </button>

          <button
            id="launch-scanner-attendance-btn"
            onClick={onOpenScanner}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Launch Kiosk Scanner</span>
          </button>
        </div>
      </div>

      {/* Manual Override Form Panel (Collapsible) */}
      {showOverridePanel && (
        <form
          onSubmit={handleApplyOverride}
          className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl shadow-xs space-y-3 text-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60">
            <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-700" />
              <span>Admin Manual Entry / Exit Override (§8 Manual Override)</span>
            </h4>
            <span className="text-[11px] text-indigo-700">
              Use when student forgot card or phone battery died
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Student</label>
              <select
                required
                value={overrideStudentId}
                onChange={e => setOverrideStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- Choose Student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.id}) • Seat: {s.assignedSeat || 'Unassigned'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Action</label>
              <select
                value={overrideAction}
                onChange={e => setOverrideAction(e.target.value as 'in' | 'out')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-indigo-600 font-semibold"
              >
                <option value="in">Force Check-in (Mark Inside)</option>
                <option value="out">Force Check-out (Mark Outside)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason / Note</label>
              <input
                type="text"
                placeholder="e.g. Phone battery discharged"
                value={overrideNote}
                onChange={e => setOverrideNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowOverridePanel(false)}
              className="px-3 py-1.5 rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-white bg-indigo-700 hover:bg-indigo-600 font-semibold shadow-xs"
            >
              Apply Override
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-attendance-input"
            type="text"
            placeholder="Search by student name, ID, or desk..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex-1 sm:flex-none ${
              filterType === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            All Logs ({sessions.length})
          </button>
          <button
            onClick={() => setFilterType('inside')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex-1 sm:flex-none flex items-center justify-center gap-1.5 ${
              filterType === 'inside'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Currently Inside ({insideCount})</span>
          </button>
          <button
            onClick={() => setFilterType('outside')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex-1 sm:flex-none ${
              filterType === 'outside'
                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            Completed Sessions
          </button>
        </div>
      </div>

      {/* Sessions Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Desk</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3">Check-out</th>
                <th className="px-4 py-3">Study Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.length > 0 ? (
                filteredSessions.map(session => {
                  const student = students.find(s => s.id === session.studentId);
                  const isInside = session.status === 'inside';
                  const checkInDate = new Date(session.checkInTime);
                  const checkOutDate = session.checkOutTime ? new Date(session.checkOutTime) : null;

                  let durationDisplay = '-';
                  if (session.durationMinutes) {
                    const hrs = Math.floor(session.durationMinutes / 60);
                    const mins = session.durationMinutes % 60;
                    durationDisplay = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
                  } else if (isInside) {
                    const diffMins = Math.max(1, Math.round((Date.now() - checkInDate.getTime()) / (1000 * 60)));
                    const hrs = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;
                    durationDisplay = hrs > 0 ? `${hrs}h ${mins}m (Active)` : `${mins}m (Active)`;
                  }

                  return (
                    <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          {session.seatNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{session.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {session.studentId}
                          {session.isManualOverride && (
                            <span className="ml-1.5 text-amber-700 bg-amber-50 px-1 rounded text-[10px]">
                              Manual Override
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <div className="text-[10px] text-slate-400">
                          {checkInDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {checkOutDate ? (
                          <>
                            {checkOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <div className="text-[10px] text-slate-400">
                              {checkOutDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">In Session</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold">
                        <span className={isInside ? 'text-emerald-700' : 'text-slate-700'}>
                          {durationDisplay}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isInside ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Inside
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                            Exit Recorded
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isInside && student && (
                          <button
                            id={`attendance-checkout-btn-${student.id}`}
                            onClick={() => onCheckOut(student)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Check-out</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No attendance records found matching filters.
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
