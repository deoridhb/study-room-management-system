import React, { useState, useEffect } from 'react';
import { SystemSettings, UserRole } from '../types';
import {
  Clock,
  Shield,
  User as UserIcon,
  QrCode,
  Building2,
  Radio,
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  Search,
  Sparkles,
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
  onOpenCommandPalette?: () => void;
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
  onOpenCommandPalette,
  onLogin,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Global shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenCommandPalette?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette]);

  const effectiveTotalSeats = totalSeats || seats?.length || settings.totalSeats || 30;
  const occupancyPercent = Math.min(100, Math.round((insideCount / effectiveTotalSeats) * 100));

  return (
    <header
      id="main-app-header"
      className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Brand & Hall Info */}
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm ring-1 ring-slate-800">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 truncate tracking-tight">
                  {settings.libraryName}
                </h1>
                <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Hall Open ({settings.openingTime} - {settings.closingTime})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                {settings.address}
              </p>
            </div>
          </div>

          {/* Center: Global Search & Command Bar (User-Friendly Spotlight) */}
          <div className="flex-1 max-w-xs md:max-w-md lg:max-w-lg hidden md:block">
            <button
              id="global-command-search-trigger"
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-500 bg-slate-100/80 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-xl transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span className="font-medium text-slate-600">
                  Search student, desk, phone, or action...
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 font-semibold">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right Tools & Status Indicators */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile search trigger */}
            <button
              id="mobile-search-trigger-btn"
              onClick={onOpenCommandPalette}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200"
              title="Search and Commands"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Live Clock */}
            <div className="hidden 2xl:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {/* Live Occupancy Metric Badge */}
            <div
              id="header-occupancy-badge"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs"
            >
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {insideCount} / {effectiveTotalSeats}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight">
                  {occupancyPercent}% Occupied
                </div>
              </div>
              <div className="w-10 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    occupancyPercent >= 90
                      ? 'bg-rose-500'
                      : occupancyPercent >= 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
            </div>

            {/* Unattended Kiosk Scanner Action */}
            <button
              id="launch-kiosk-btn"
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-xs transition-all ring-1 ring-slate-800 group"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Kiosk Scanner</span>
              <span className="sm:hidden">Scan</span>
            </button>

            {/* Firebase Cloud Status Badge */}
            <div
              id="header-firebase-status"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800"
              title="Real-time synchronized with Google Firestore cloud database"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-[10px]">Cloud Live</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Role Switcher */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                id="role-admin-toggle"
                onClick={() => onRoleChange?.('admin')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  role === 'admin'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Full Owner Mode (Financials, Settings, Audit)"
              >
                <Shield className="w-3 h-3 text-indigo-600" />
                <span className="hidden md:inline">Owner</span>
              </button>
              <button
                id="role-staff-toggle"
                onClick={() => onRoleChange?.('staff')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  role === 'staff'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Front Desk Receptionist Mode"
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
                    className="w-8 h-8 rounded-full border border-slate-300 ring-2 ring-indigo-500/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-indigo-500/20">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <button
                  id="firebase-signout-btn"
                  onClick={onLogout}
                  title="Sign out of Firebase"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="firebase-signin-btn"
                onClick={onLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors"
                title="Sign in with Google to enable multi-device sync"
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
