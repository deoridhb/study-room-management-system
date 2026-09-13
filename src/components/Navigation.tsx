import React from 'react';
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
} from 'lucide-react';

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

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingPaymentCount: number;
  expiringCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingPaymentCount,
  expiringCount,
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'seats' as TabType, label: 'Visual Seat Map', icon: Grid3X3 },
    {
      id: 'students' as TabType,
      label: 'Students',
      icon: Users,
      badge: expiringCount > 0 ? `${expiringCount} Due` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { id: 'attendance' as TabType, label: 'Attendance & Scans', icon: Clock },
    {
      id: 'payments' as TabType,
      label: 'Fees & Payments',
      icon: CreditCard,
      badge: pendingPaymentCount > 0 ? `${pendingPaymentCount}` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    { id: 'expenses' as TabType, label: 'Expenses & Budget', icon: PieChart },
    {
      id: 'whatsapp' as TabType,
      label: 'WhatsApp Reminders',
      icon: MessageSquare,
      highlight: true,
    },
    { id: 'reports' as TabType, label: 'Reports & CSV', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Settings & Audit', icon: Settings },
  ];

  return (
    <nav
      id="main-navigation-bar"
      className="bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-2 min-w-max">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? item.highlight
                        ? 'text-emerald-600'
                        : 'text-indigo-600'
                      : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    v3 Auto
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
