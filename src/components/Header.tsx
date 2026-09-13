import React, { useState, useEffect } from 'react';
import { SystemSettings, UserRole } from '../types';
import {
  Clock,
  Shield,
  User as UserIcon,
  QrCode,
  CheckCircle2,
  Building2,
  Radio,
  Cloud,
  LogIn,
  LogOut,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  settings: SystemSettings;
  role?: UserRole;
  insideCount?: number;
  totalSeats?: number;
  seats?: any[];
  students?: any[];
  currentUser?: User | null;
  isFirebaseConnected?: boolean;
  onRoleChange?: (role: UserRole) => void;
  onOpenScanner?: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  role = 'admin',
  insideCount = 0,
  totalSeats,
  seats,
  currentUser,
  isFirebaseConnected = true,
  onRoleChange,
  onOpenScanner,
  onLogin,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const effectiveTotalSeats = totalSeats || seats?.length || settings.totalSeats || 30;
  const occupancyPercent = Math.round((insideCount / effectiveTotalSeats) * 100);

  return (
    <header
      id="main-app-header"
      className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Hall Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
                  {settings.libraryName}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Hall Open ({settings.openingTime} - {settings.closingTime})
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate hidden sm:block">
                {settings.address}
              </p>
            </div>
          </div>

          {/* Center/Right stats & tools */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">
                {currentTime.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
              </span>
            </div>

            {/* Live Occupancy Metric Badge */}
            <div
              id="header-occupancy-badge"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
            >
              <div className="text-right">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {insideCount} / {totalSeats}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {occupancyPercent}% Occupied
                </div>
              </div>
              <div className="w-10 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                />
              </div>
            </div>

            {/* Unattended Kiosk Scanner Action */}
            <button
              id="launch-kiosk-btn"
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-xs transition-colors"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Launch Kiosk Scanner</span>
              <span className="sm:hidden">Scanner</span>
            </button>

            {/* Firebase Cloud Status Badge */}
            <div
              id="header-firebase-status"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-[11px] font-medium text-emerald-800"
              title="Connected to Firebase Firestore (asia-south1)"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firebase Cloud</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Role Switcher (§3.1, §32 Q2) */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
              <button
                id="role-admin-toggle"
                onClick={() => onRoleChange?.('admin')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  role === 'admin'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3 h-3 text-indigo-600" />
                <span className="hidden md:inline">Owner</span>
              </button>
              <button
                id="role-staff-toggle"
                onClick={() => onRoleChange?.('staff')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  role === 'staff'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserIcon className="w-3 h-3 text-emerald-600" />
                <span className="hidden md:inline">Front Desk</span>
              </button>
            </div>

            {/* Firebase Google Auth Button / Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Admin'}
                    className="w-7 h-7 rounded-full border border-slate-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <button
                  id="firebase-signout-btn"
                  onClick={onLogout}
                  title="Sign out of Firebase"
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="firebase-signin-btn"
                onClick={onLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
