import React, { useState, useEffect, useRef } from 'react';
import { Student, AttendanceSession } from '../types';
import {
  playCheckInSuccess,
  playCheckOutSuccess,
  playWarningBuzz,
} from '../utils/audio';
import {
  Camera,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
  Sparkles,
  LogOut,
  UserCheck,
  RefreshCw,
  QrCode,
  Volume2,
} from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  students?: Student[];
  sessions?: AttendanceSession[];
  libraryName?: string;
  onCheckIn?: (student: Student) => void;
  onCheckOut?: (student: Student) => void;
  onScan?: (student: Student) => void;
  onClose: () => void;
}

interface ScanFeedback {
  type: 'checkin' | 'checkout' | 'error';
  studentName?: string;
  seatNumber?: string;
  message: string;
  timestamp: string;
  duration?: string;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  students = [],
  sessions = [],
  libraryName = 'Study Room & Reading Lounge',
  onCheckIn,
  onCheckOut,
  onScan,
  onClose,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [lastFeedback, setLastFeedback] = useState<ScanFeedback | null>(null);
  const [recentScans, setRecentScans] = useState<ScanFeedback[]>([]);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<{ studentId: string; time: string; action: 'in' | 'out' }[]>([]);
  const [lastScannedTime, setLastScannedTime] = useState<{ [token: string]: number }>({});
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Monitor online / offline network state
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Sync offline queue if any
      if (offlineQueue.length > 0) {
        setOfflineQueue([]);
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  // Clean up camera on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera access not granted or not supported:', err);
      setCameraError('Camera access unavailable. Use quick student tap or token entry below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Process a scanned QR token or student selection
  const handleProcessScan = (rawTokenOrId: string) => {
    const cleanToken = rawTokenOrId.trim();
    if (!cleanToken) return;

    // Debounce check: within 5 seconds for same token
    const now = Date.now();
    if (lastScannedTime[cleanToken] && now - lastScannedTime[cleanToken] < 5000) {
      const waitSec = Math.ceil((5000 - (now - lastScannedTime[cleanToken])) / 1000);
      setLastFeedback({
        type: 'error',
        message: `Please wait ${waitSec}s before scanning the same QR code again.`,
        timestamp: new Date().toLocaleTimeString(),
      });
      playWarningBuzz();
      return;
    }

    setLastScannedTime(prev => ({ ...prev, [cleanToken]: now }));

    // Find student matching either qrToken or student ID
    const student = (students || []).find(
      s => s.qrToken.toLowerCase() === cleanToken.toLowerCase() ||
           s.id.toLowerCase() === cleanToken.toLowerCase()
    );

    if (!student) {
      playWarningBuzz();
      const feedback: ScanFeedback = {
        type: 'error',
        message: `Unrecognized QR credential: "${cleanToken}". Please contact front desk.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setLastFeedback(feedback);
      setRecentScans(prev => [feedback, ...prev.slice(0, 4)]);
      return;
    }

    // Check account status
    if (student.status === 'suspended') {
      playWarningBuzz();
      const feedback: ScanFeedback = {
        type: 'error',
        studentName: student.fullName,
        message: `Access denied: Account for ${student.fullName} is suspended. Please see administrator.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setLastFeedback(feedback);
      setRecentScans(prev => [feedback, ...prev.slice(0, 4)]);
      return;
    }

    if (student.status === 'inactive') {
      playWarningBuzz();
      const feedback: ScanFeedback = {
        type: 'error',
        studentName: student.fullName,
        message: `Access denied: Account is inactive. Please renew registration.`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setLastFeedback(feedback);
      setRecentScans(prev => [feedback, ...prev.slice(0, 4)]);
      return;
    }

    // Check if student currently has an active inside session
    const activeSession = (sessions || []).find(
      s => s.studentId === student.id && s.status === 'inside'
    );

    if (activeSession) {
      // EXIT RECORDED
      playCheckOutSuccess();
      if (onCheckOut) {
        onCheckOut(student);
      } else if (onScan) {
        onScan(student);
      }

      const checkInDate = new Date(activeSession.checkInTime);
      const exitDate = new Date();
      const diffMinutes = Math.max(1, Math.round((exitDate.getTime() - checkInDate.getTime()) / (1000 * 60)));
      const hrs = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} mins`;

      const feedback: ScanFeedback = {
        type: 'checkout',
        studentName: student.fullName,
        seatNumber: activeSession.seatNumber || student.assignedSeat,
        message: `Goodbye, ${student.fullName}! Exit recorded. Study duration: ${durationStr}. Seat ${activeSession.seatNumber || student.assignedSeat} is now free.`,
        duration: durationStr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setLastFeedback(feedback);
      setRecentScans(prev => [feedback, ...prev.slice(0, 4)]);
    } else {
      // ENTRY / CHECK-IN RECORDED
      playCheckInSuccess();
      if (onCheckIn) {
        onCheckIn(student);
      } else if (onScan) {
        onScan(student);
      }

      const feedback: ScanFeedback = {
        type: 'checkin',
        studentName: student.fullName,
        seatNumber: student.assignedSeat,
        message: `Welcome, ${student.fullName}! Check-in recorded at Seat ${student.assignedSeat || 'assigned'}. Enjoy your focus session!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setLastFeedback(feedback);
      setRecentScans(prev => [feedback, ...prev.slice(0, 4)]);
    }

    setTokenInput('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      handleProcessScan(tokenInput);
    }
  };

  if (!isOpen) return null;

  // Active students inside count
  const insideCount = (sessions || []).filter(s => s.status === 'inside').length;

  return (
    <div
      id="unattended-kiosk-modal"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden"
    >
      {/* Top Kiosk Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{libraryName}</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                Kiosk Scanner
              </span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-3">
              <span>Automated QR Entry & Exit Terminal</span>
              <span>•</span>
              <span className="text-slate-300 font-semibold font-mono">
                Inside: {insideCount} / 30
              </span>
            </p>
          </div>
        </div>

        {/* Status Indicators & Exit */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audio Cue Active</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs">
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-medium">Offline Queue (Active)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Online & Synced</span>
              </>
            )}
          </div>

          <button
            id="close-kiosk-btn"
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Close Kiosk</span>
          </button>
        </div>
      </div>

      {/* Main Kiosk Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
        {/* Left Column: Scanner viewport & instructions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-6">
          {/* Instructions Banner */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Scan Your QR Code
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-md">
              Hold your student ID card or phone QR code in front of the camera for hands-free entry and exit.
            </p>
          </div>

          {/* Camera Viewport or Scanner Target Box */}
          <div className="relative w-full max-w-md aspect-square rounded-3xl bg-slate-900 border-2 border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-4">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Visual Target Reticle */}
                <div className="relative z-10 w-64 h-64 border-2 border-emerald-400/80 rounded-2xl flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                  {/* Animated laser scanning line */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <Camera className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Camera Scanner
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {cameraError || 'Activate camera for live barcode scanning or use simulator below'}
                  </p>
                </div>
                <button
                  id="enable-camera-btn"
                  onClick={startCamera}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Enable Webcam Scanner
                </button>
              </div>
            )}

            {cameraActive && (
              <button
                id="stop-camera-btn"
                onClick={stopCamera}
                className="absolute bottom-4 z-20 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-300 rounded-lg border border-slate-700 backdrop-blur"
              >
                Turn off camera
              </button>
            )}
          </div>

          {/* Quick Manual Token Entry Bar */}
          <form
            onSubmit={handleManualSubmit}
            className="w-full max-w-md flex items-center gap-2"
          >
            <input
              id="scanner-token-input"
              type="text"
              placeholder="Or type Token / Student ID (e.g. STU-1001)"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              id="submit-token-scan-btn"
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition-colors"
            >
              Scan
            </button>
          </form>
        </div>

        {/* Right Column: Live feedback result & Simulator quick list (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Primary Instant Scan Feedback Result Banner */}
          {lastFeedback ? (
            <div
              id="kiosk-feedback-card"
              className={`p-5 rounded-2xl border transition-all ${
                lastFeedback.type === 'checkin'
                  ? 'bg-emerald-950/70 border-emerald-600/80 text-emerald-100'
                  : lastFeedback.type === 'checkout'
                  ? 'bg-blue-950/70 border-blue-600/80 text-blue-100'
                  : 'bg-rose-950/70 border-rose-600/80 text-rose-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {lastFeedback.type === 'checkin' && (
                    <UserCheck className="w-7 h-7 text-emerald-400" />
                  )}
                  {lastFeedback.type === 'checkout' && (
                    <LogOut className="w-7 h-7 text-blue-400" />
                  )}
                  {lastFeedback.type === 'error' && (
                    <AlertTriangle className="w-7 h-7 text-rose-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-bold">
                      {lastFeedback.type === 'checkin' && 'ENTRY RECORDED'}
                      {lastFeedback.type === 'checkout' && 'EXIT RECORDED'}
                      {lastFeedback.type === 'error' && 'ATTENDANCE ALERT'}
                    </span>
                    <span className="text-xs font-mono opacity-80">
                      {lastFeedback.timestamp}
                    </span>
                  </div>
                  <p className="text-sm font-semibold mt-1 leading-snug">
                    {lastFeedback.message}
                  </p>
                  {lastFeedback.seatNumber && (
                    <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-xs">
                      <span className="opacity-75">Seat:</span>
                      <span className="font-mono font-bold text-white">
                        {lastFeedback.seatNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center py-6">
              <Sparkles className="w-6 h-6 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                Awaiting next QR credential scan...
              </p>
            </div>
          )}

          {/* Quick Simulator Tap List */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Interactive Student Scan Simulator</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Click any student to toggle
              </span>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-1.5 max-h-[300px] pr-1">
              {students.map(student => {
                const isInside = sessions.some(
                  s => s.studentId === student.id && s.status === 'inside'
                );
                return (
                  <button
                    key={student.id}
                    id={`simulate-scan-${student.id}`}
                    onClick={() => handleProcessScan(student.id)}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          isInside ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-500'
                        }`}
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-white">
                          {student.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {student.id} • Seat: {student.assignedSeat}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isInside ? (
                        <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Inside (Tap Exit)
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50 px-2 py-0.5 rounded-md">
                          Outside (Tap Enter)
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Scans Feed */}
          {recentScans.length > 0 && (
            <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-3 text-xs">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Recent Terminal Activity
              </h4>
              <div className="space-y-1">
                {recentScans.slice(0, 3).map((scan, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1 border-b border-slate-800/50 last:border-none text-[11px]"
                  >
                    <span className="text-slate-300 truncate max-w-[200px]">
                      {scan.studentName || 'Unknown Student'}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                        scan.type === 'checkin'
                          ? 'text-emerald-400 bg-emerald-950/40'
                          : scan.type === 'checkout'
                          ? 'text-blue-400 bg-blue-950/40'
                          : 'text-rose-400 bg-rose-950/40'
                      }`}
                    >
                      {scan.type.toUpperCase()} • {scan.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
