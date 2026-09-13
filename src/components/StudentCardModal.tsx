import React, { useEffect, useState } from 'react';
import { Student } from '../types';
import { generateQrDataUrl } from '../utils/qr';
import { X, Printer, Download, CheckCircle2, ShieldAlert } from 'lucide-react';

interface StudentCardModalProps {
  student: Student | null;
  libraryName?: string;
  libraryAddress?: string;
  isOpen?: boolean;
  onClose: () => void;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({
  student,
  libraryName = 'Study Room & Reading Lounge',
  libraryAddress,
  isOpen = true,
  onClose,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (student) {
      generateQrDataUrl(student.qrToken || student.id, 260).then(url => {
        setQrUrl(url);
      });
    }
  }, [student]);

  if (!student || !isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `QR_${student.id}_${student.fullName.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <div
      id="student-card-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 print:p-0 print:bg-white"
    >
      <div
        id="student-card-modal-container"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:w-full"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-semibold text-slate-800 text-xs sm:text-sm">Student Digital ID & QR Pass</h3>
          </div>
          <button
            id="close-student-card-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body - Styled as a Premium Membership Smart ID Card */}
        <div className="p-3.5 sm:p-6 max-h-[80vh] overflow-y-auto">
          <div
            id="printable-student-card"
            className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-4 sm:p-6 shadow-xl border border-slate-700/60 relative overflow-hidden"
          >
            {/* Background geometric accents */}
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

            {/* Header / Library branding */}
            <div className="flex items-start justify-between border-b border-slate-700/70 pb-3 mb-4">
              <div>
                <p className="text-[10px] tracking-wider uppercase font-semibold text-emerald-400">
                  Authorized Student Pass
                </p>
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                  {libraryName}
                </h4>
              </div>
              <div className="bg-slate-800/90 border border-slate-700 px-2 py-1 rounded-md text-[11px] font-mono text-slate-300">
                {student.id}
              </div>
            </div>

            {/* Content: QR code & Student Info */}
            <div className="flex flex-col items-center">
              {/* High-Resolution QR Box */}
              <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-md border-2 border-slate-100 flex flex-col items-center mb-4">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`QR Code for ${student.fullName}`}
                    className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
                  />
                ) : (
                  <div className="w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-700 mt-1">
                  {student.qrToken}
                </span>
              </div>

              {/* Student Details */}
              <div className="w-full text-center space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">{student.fullName}</h3>
                <p className="text-xs text-slate-300 font-medium flex items-center justify-center gap-1 flex-wrap">
                  <span>📱 {student.phone}</span>
                  {student.isMinor && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] px-1.5 py-0.5 rounded">
                      Minor (Consent OK)
                    </span>
                  )}
                </p>
              </div>

              {/* Meta Grid */}
              <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-700/70 text-xs">
                <div className="bg-slate-800/60 rounded-lg p-2 border border-slate-700/40">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
                    Assigned Seat
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                    {student.assignedSeat || 'Unassigned'}
                  </span>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2 border border-slate-700/40">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
                    Valid Until
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-200">
                    {student.membershipExpiry}
                  </span>
                </div>
              </div>

              {/* Status footer inside card */}
              <div className="w-full mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  {student.status === 'active' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">Active Pass</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-300 font-medium capitalize">{student.status}</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] text-slate-500">Scan at Entry/Exit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50 print:hidden gap-3">
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Show on phone screen or print as ID card
          </p>
          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            <button
              id="download-student-qr-btn"
              onClick={handleDownload}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download QR
            </button>
            <button
              id="print-student-card-btn"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
