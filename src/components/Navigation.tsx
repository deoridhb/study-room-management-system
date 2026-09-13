import React, { useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Grid3X3,
  Users,
  Clock,
  CreditCard,
  PieChart,
  MessageSquare,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
  QrCode,
  Search,
  Building2,
  Shield,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '../types';

export type TabType =
  | 'dashboard'
  | 'seats'
  | 'students'
  | 'attendance'
  | 'payments'
  | 'expenses'
  | 'whatsapp'
  | 'reports'
  | 'settings';

export interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingPaymentCount: number;
  expiringCount: number;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
  onOpenMobileDrawer?: () => void;
  libraryName?: string;
  role?: UserRole;
  onOpenScanner?: () => void;
  onOpenCommandPalette?: () => void;
  onRoleChange?: (role: UserRole) => void;
}

interface NavItemDef {
  id: TabType;
  label: string;
  shortLabel: string;
  category: 'operations' | 'members' | 'admin';
  icon: any;
  description: string;
  badge?: string;
  badgeColor?: string;
  highlight?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingPaymentCount,
  expiringCount,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
  onOpenMobileDrawer,
  libraryName = 'Central Study Room',
  role = 'admin',
  onOpenScanner,
  onOpenCommandPalette,
  onRoleChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabBtnRef = useRef<HTMLButtonElement>(null);

  const navItems: NavItemDef[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      shortLabel: 'Overview',
      category: 'operations',
      icon: LayoutDashboard,
      description: 'Real-time occupancy, revenue summary & fast shortcuts',
    },
    {
      id: 'seats',
      label: 'Seat Map',
      shortLabel: 'Seats',
      category: 'operations',
      icon: Grid3X3,
      description: '30-desk interactive visual map & desk assignments',
    },
    {
      id: 'students',
      label: 'Students',
      shortLabel: 'Students',
      category: 'members',
      icon: Users,
      description: 'Student directory, active plans & digital QR cards',
      badge: expiringCount > 0 ? `${expiringCount}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      shortLabel: 'Attendance',
      category: 'operations',
      icon: Clock,
      description: 'Live checked-in roster, entry/exit logs & manual scans',
    },
    {
      id: 'payments',
      label: 'Fees & Dues',
      shortLabel: 'Fees',
      category: 'members',
      icon: CreditCard,
      description: 'Fee records, printable receipts & pending dues ledger',
      badge: pendingPaymentCount > 0 ? `${pendingPaymentCount}` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    {
      id: 'expenses',
      label: 'Expenses',
      shortLabel: 'Expenses',
      category: 'admin',
      icon: PieChart,
      description: 'Utility bills, operational costs & monthly budgets',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Alerts',
      shortLabel: 'WhatsApp',
      category: 'members',
      icon: MessageSquare,
      description: 'Automated fee due alerts & expiry notice generator',
      highlight: true,
    },
    {
      id: 'reports',
      label: 'Reports',
      shortLabel: 'Reports',
      category: 'admin',
      icon: BarChart3,
      description: 'Revenue trends, occupancy metrics & CSV exports',
    },
    {
      id: 'settings',
      label: 'Settings & Audit',
      shortLabel: 'Settings',
      category: 'admin',
      icon: Settings,
      description: 'Library rules, opening hours & system audit trails',
    },
  ];

  // Auto-scroll active tab into view in horizontal pill strip on mobile WITHOUT scrolling the window
  useEffect(() => {
    if (activeTabBtnRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const btn = activeTabBtnRef.current;
      const targetScroll = btn.offsetLeft - (container.clientWidth - btn.clientWidth) / 2;
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
    // Guarantee window itself never has horizontal offset
    if (typeof window !== 'undefined' && window.scrollX !== 0) {
      window.scrollTo(0, window.scrollY);
    }
  }, [activeTab]);

  const activeItem = navItems.find(i => i.id === activeTab) || navItems[0];
  const ActiveIcon = activeItem.icon;

  const handleSelectTab = (tabId: TabType) => {
    onTabChange(tabId);
    onCloseMobileDrawer?.();
  };

  return (
    <>
      {/* 1. TOP DESKTOP & TABLET NAVIGATION BAR (md:flex) - ALL 9 ITEMS GUARANTEED VISIBLE */}
      <nav
        id="main-navigation-bar"
        className="hidden md:block bg-slate-50/95 border-b border-slate-200/90 w-full sticky top-14 sm:top-16 z-20 backdrop-blur-md shadow-2xs"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between gap-1 py-1.5 overflow-x-auto lg:overflow-x-visible scrollbar-none">
            {/* All 9 Menu Options - Seamlessly Fitted Across the Bar */}
            <div className="flex items-center gap-1 sm:gap-1.5 w-full justify-between min-w-max lg:min-w-0">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isSettings = item.id === 'settings';
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-1.5 px-2 xl:px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? isSettings
                          ? 'bg-slate-900 text-white shadow-xs border border-slate-900'
                          : 'bg-white text-slate-900 shadow-xs border border-slate-200/90 ring-1 ring-slate-900/5'
                        : isSettings
                        ? 'text-slate-800 bg-slate-200/80 hover:bg-slate-200 hover:text-slate-950 border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                    title={item.description}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                        isActive
                          ? isSettings
                            ? 'text-emerald-400'
                            : item.highlight
                            ? 'text-emerald-600'
                            : 'text-indigo-600'
                          : isSettings
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="xl:hidden">{item.shortLabel}</span>
                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border shrink-0 ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && !item.badge && (
                      <span className="hidden lg:inline-block px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider shrink-0">
                        Auto
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* 2. TOP MOBILE NAVIGATION STRIP (md:hidden) */}
      <div
        id="mobile-top-nav-bar"
        className="md:hidden bg-slate-100/95 border-b border-slate-200/90 sticky top-14 z-20 backdrop-blur-md px-2.5 py-1.5 space-y-1.5 shadow-2xs"
      >
        {/* Active Section Indicator + Quick Settings Shortcut + Drawer Launcher */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 shrink-0">
              <ActiveIcon className="w-3.5 h-3.5" />
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                {activeItem.label}
              </span>
              {activeItem.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${activeItem.badgeColor}`}
                >
                  {activeItem.badge}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Settings Action on Mobile */}
            <button
              id="mobile-quick-settings-btn"
              onClick={() => handleSelectTab('settings')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg border transition-colors shadow-2xs ${
                activeTab === 'settings'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
              }`}
              title="Open Settings & Audit"
            >
              <Settings className="w-3 h-3 text-slate-600" />
              <span>Settings</span>
            </button>

            {/* All Sections Drawer Trigger */}
            <button
              id="mobile-all-sections-trigger"
              onClick={onOpenMobileDrawer}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shrink-0 shadow-2xs"
            >
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>All (9)</span>
              <ChevronDown className="w-3 h-3 text-indigo-500" />
            </button>
          </div>
        </div>

        {/* Smoothly Scrollable Horizontal Pill Strip with All 9 Tabs */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth"
          >
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isSettings = item.id === 'settings';
              return (
                <button
                  key={item.id}
                  ref={isActive ? activeTabBtnRef : null}
                  id={`mobile-pill-tab-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? isSettings
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-indigo-600 text-white shadow-xs'
                      : isSettings
                      ? 'bg-slate-200 text-slate-800 border border-slate-300 font-bold'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? isSettings
                          ? 'text-emerald-400'
                          : 'text-white'
                        : isSettings
                        ? 'text-slate-800'
                        : item.highlight
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  />
                  <span>{item.shortLabel}</span>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. FIXED MOBILE BOTTOM NAVIGATION BAR (md:hidden) - PERMANENTLY FIXED & ALWAYS VISIBLE ON MOBILE */}
      <div
        id="mobile-bottom-navigation-bar"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-1 py-1 flex items-center justify-around safe-area-bottom pointer-events-auto"
      >
        {/* 1. Dashboard */}
        <button
          id="mobile-bottom-nav-dashboard"
          onClick={() => handleSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all flex-1 min-w-0 ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span className="text-[9.5px] leading-tight truncate max-w-full text-center">Overview</span>
        </button>

        {/* 2. Seat Map */}
        <button
          id="mobile-bottom-nav-seats"
          onClick={() => handleSelectTab('seats')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all flex-1 min-w-0 ${
            activeTab === 'seats'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Grid3X3 className="w-4 h-4 mb-0.5" />
          <span className="text-[9.5px] leading-tight truncate max-w-full text-center">Seats</span>
        </button>

        {/* 3. Students */}
        <button
          id="mobile-bottom-nav-students"
          onClick={() => handleSelectTab('students')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all flex-1 min-w-0 relative ${
            activeTab === 'students'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Users className="w-4 h-4 mb-0.5" />
            {expiringCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </div>
          <span className="text-[9.5px] leading-tight truncate max-w-full text-center">Students</span>
        </button>

        {/* 4. Attendance */}
        <button
          id="mobile-bottom-nav-attendance"
          onClick={() => handleSelectTab('attendance')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all flex-1 min-w-0 ${
            activeTab === 'attendance'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 mb-0.5" />
          <span className="text-[9.5px] leading-tight truncate max-w-full text-center">Attend</span>
        </button>

        {/* 5. Fees & Dues */}
        <button
          id="mobile-bottom-nav-payments"
          onClick={() => handleSelectTab('payments')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all flex-1 min-w-0 relative ${
            activeTab === 'payments'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <CreditCard className="w-4 h-4 mb-0.5" />
            {pendingPaymentCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </div>
          <span className="text-[9.5px] leading-tight truncate max-w-full text-center">Fees</span>
        </button>

        {/* 6. Settings / Active Secondary Module */}
        {(() => {
          const isSecondaryActive =
            activeTab === 'reports' || activeTab === 'expenses' || activeTab === 'whatsapp';
          const currentItem = isSecondaryActive ? navItems.find(i => i.id === activeTab) : null;
          const DisplayIcon = currentItem ? currentItem.icon : Settings;
          const displayLabel = currentItem ? currentItem.shortLabel : 'Settings';
          const isHighlight = activeTab === 'settings' || isSecondaryActive;

          return (
            <button
              id="mobile-bottom-nav-settings"
              onClick={() => handleSelectTab(isSecondaryActive ? activeTab : 'settings')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all flex-1 min-w-0 ${
                isHighlight
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <DisplayIcon className="w-4 h-4 mb-0.5" />
              <span className="text-[9.5px] leading-tight truncate max-w-full text-center">
                {displayLabel}
              </span>
            </button>
          );
        })()}
      </div>

      {/* 4. FULL-FEATURED MOBILE DRAWER OVERLAY */}
      {isMobileDrawerOpen && (
        <div
          id="mobile-drawer-backdrop"
          className="fixed inset-0 z-50 flex justify-start bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 md:hidden"
          onClick={onCloseMobileDrawer}
        >
          <div
            id="mobile-drawer-sheet"
            className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0 ring-1 ring-white/10">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-white text-sm tracking-tight truncate">
                    {libraryName}
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>All 9 Navigation Modules</span>
                  </p>
                </div>
              </div>

              <button
                id="close-mobile-drawer-btn"
                onClick={onCloseMobileDrawer}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search in Drawer */}
            <div className="p-3 border-b border-slate-100 bg-slate-50 shrink-0">
              <button
                id="drawer-search-trigger"
                onClick={() => {
                  onCloseMobileDrawer?.();
                  onOpenCommandPalette?.();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Search student, seat, action...</span>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                  ⌘K
                </span>
              </button>
            </div>

            {/* Grouped 9 Navigation Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              {/* Group 1: Operations & Desks */}
              <div>
                <p className="px-2 pb-1.5 text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
                  Study Hall Operations
                </p>
                <div className="space-y-1">
                  {navItems
                    .filter(item => item.category === 'operations')
                    .map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`drawer-item-${item.id}`}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                            isActive
                              ? 'bg-indigo-50 border border-indigo-200/80 text-indigo-950 font-bold shadow-2xs'
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${
                                isActive
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-xs truncate leading-tight">
                                {item.label}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-indigo-600' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Group 2: Members & Fee Collections */}
              <div>
                <p className="px-2 pb-1.5 text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
                  Students & Fee Management
                </p>
                <div className="space-y-1">
                  {navItems
                    .filter(item => item.category === 'members')
                    .map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          id={`drawer-item-${item.id}`}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                            isActive
                              ? 'bg-indigo-50 border border-indigo-200/80 text-indigo-950 font-bold shadow-2xs'
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${
                                isActive
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-xs truncate leading-tight">
                                  {item.label}
                                </p>
                                {item.badge && (
                                  <span
                                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${item.badgeColor}`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-indigo-600' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Group 3: Finance & System Administration (INCLUDES PROMINENT SETTINGS) */}
              <div>
                <p className="px-2 pb-1.5 text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
                  Finance & Administration
                </p>
                <div className="space-y-1">
                  {navItems
                    .filter(item => item.category === 'admin')
                    .map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const isSettings = item.id === 'settings';
                      return (
                        <button
                          key={item.id}
                          id={`drawer-item-${item.id}`}
                          onClick={() => handleSelectTab(item.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left ${
                            isActive
                              ? 'bg-indigo-50 border border-indigo-200/80 text-indigo-950 font-bold shadow-2xs'
                              : isSettings
                              ? 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${
                                isActive
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : isSettings
                                  ? 'bg-slate-900 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-xs truncate leading-tight">
                                {item.label}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-indigo-600' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2">
              {/* Quick Settings Action in Drawer */}
              <button
                id="drawer-open-settings-btn"
                onClick={() => handleSelectTab('settings')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>Open Settings & Audit</span>
              </button>

              {/* Quick Kiosk Launcher */}
              <button
                id="drawer-launch-kiosk-btn"
                onClick={() => {
                  onCloseMobileDrawer?.();
                  onOpenScanner?.();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-2xs transition-colors"
              >
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span>Launch QR Kiosk Scanner</span>
              </button>

              {/* Role Quick Toggle */}
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Access Mode:</span>
                </span>
                <button
                  id="drawer-role-toggle-btn"
                  onClick={() => onRoleChange?.(role === 'admin' ? 'staff' : 'admin')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  {role === 'admin' ? 'Owner / Admin' : 'Front Desk Reception'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
