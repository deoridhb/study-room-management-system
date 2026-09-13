import React, { useState, useEffect } from 'react';
import { SystemSettings, UserRole } from '../types';
import {
  Clock,
  Shield,
  User as UserIcon,
  QrCode,
  Building2,
  Cloud,
  LogIn,
  LogOut,
  Search,
  Menu,
  UserCheck,
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
  pendingPaymentCount?: number;
  expiringCount?: number;
  onRoleChange?: (role: UserRole) => void;
  onOpenScanner?: () => void;
  onOpenCheckIn?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenMobileMenu?: () => void;
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
  pendingPaymentCount = 0,
  expiringCount = 0,
  onRoleChange,
  onOpenScanner,
  onOpenCheckIn,
  onOpenCommandPalette,
  onOpenMobileMenu,
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
      className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95 w-full"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-4">
          {/* Left: Brand & Library Name (Responsive & never forces overflow) */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial sm:shrink-0">
            {/* Mobile Menu Hamburger */}
            <button
              id="mobile-menu-hamburger-btn"
              onClick={onOpenMobileMenu}
              className="sm:hidden p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-xl border border-slate-200 shrink-0 relative transition-colors shadow-2xs"
              title="All Sections Menu (9)"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-slate-800" />
              {(pendingPaymentCount > 0 || expiringCount > 0) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm ring-1 ring-slate-800">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>

            <div className="min-w-0 flex-1 sm:flex-initial">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-base lg:text-lg font-black text-slate-900 tracking-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
                  {settings.libraryName}
                </h1>
                <span className="hidden 2xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Open ({settings.openingTime} - {settings.closingTime})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block whitespace-nowrap">
                {settings.address}
              </p>
            </div>
          </div>

          {/* Center: Global Search & Command Bar (IN VIEW FOR TABLET & DESKTOP) */}
          <div className="hidden sm:flex flex-1 max-w-sm md:max-w-md lg:max-w-lg mx-2 sm:mx-3">
            <button
              id="global-command-search-trigger"
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-500 bg-slate-100/90 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/90 rounded-xl transition-all shadow-2xs group"
              title="Search students, desks, phones, fees, or run commands (⌘K)"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                <span className="font-medium text-slate-600 truncate">
                  Search student, desk, phone, or action...
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 font-semibold shrink-0 ml-2">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 shadow-2xs text-slate-600">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right: Quick Tools & Status Controls (STREAMLINED & NEVER OVERFLOWING) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Live Occupancy Metric Badge */}
            <div
              id="header-occupancy-badge"
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs shrink-0"
              title={`Live Occupancy: ${insideCount} of ${effectiveTotalSeats} desks (${occupancyPercent}%)`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 font-mono">
                {insideCount}/{effectiveTotalSeats}
              </span>
              <span className="hidden lg:inline text-[10px] text-slate-500 font-semibold">
                ({occupancyPercent}%)
              </span>
            </div>

            {/* Quick Student Check-In Button */}
            {onOpenCheckIn && (
              <button
                id="header-quick-checkin-btn"
                onClick={onOpenCheckIn}
                className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-300/80 rounded-xl shadow-2xs transition-all shrink-0"
                title="Check In Student"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold">Check In</span>
              </button>
            )}

            {/* Unattended Kiosk Scanner Action (GUARANTEED VISIBLE ON ALL SCREENS) */}
            <button
              id="launch-kiosk-btn"
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-xs transition-all ring-1 ring-slate-800 group shrink-0"
              title="Open Front Desk QR Scanner Kiosk"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="hidden sm:inline">Scanner</span>
              <span className="sm:hidden text-[11px]">Scan</span>
            </button>

            {/* Cloud Firestore Status Badge */}
            <div
              id="header-firebase-status"
              className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800 shrink-0"
              title="Synchronized with Cloud Firestore"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-[10px]">Cloud</span>
            </div>

            {/* Role Switcher (Hidden on narrow mobile to guarantee no overflow; already in drawer) */}
            <button
              id="header-role-toggle-btn"
              onClick={() => onRoleChange?.(role === 'admin' ? 'staff' : 'admin')}
              className="hidden xs:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 transition-colors shadow-2xs shrink-0"
              title={`Current Role: ${role === 'admin' ? 'Owner / Admin' : 'Front Desk Staff'}`}
            >
              {role === 'admin' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="hidden md:inline">Owner</span>
                </>
              ) : (
                <>
                  <UserIcon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden md:inline">Staff</span>
                </>
              )}
            </button>

            {/* User Profile / Firebase Auth */}
            {currentUser ? (
              <div className="flex items-center gap-1 shrink-0 pl-0.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Admin'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-300 ring-2 ring-indigo-500/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-indigo-500/20">
                    {((currentUser.displayName || currentUser.email || 'U')[0] || 'U').toUpperCase()}
                  </div>
                )}
                <button
                  id="firebase-signout-btn"
                  onClick={onLogout}
                  title="Sign out"
                  className="hidden sm:block p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="firebase-signin-btn"
                onClick={onLogin}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors shrink-0"
                title="Sign in with Google"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden md:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dedicated Search Bar - ALWAYS IN VIEW (under 640px) */}
        <div className="sm:hidden pb-2.5 pt-0.5">
          <button
            id="mobile-global-search-bar"
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl transition-all shadow-2xs"
            title="Search student, desk, phone, action (⌘K)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-600">
                Search student, desk, phone, action...
              </span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-mono text-slate-600 font-semibold shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
