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
  const navItems: {
    id: TabType;
    label: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
    highlight?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'seats', label: 'Seat Map', icon: Grid3X3 },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
      badge: expiringCount > 0 ? `${expiringCount} Due` : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    {
      id: 'payments',
      label: 'Fees & Dues',
      icon: CreditCard,
      badge: pendingPaymentCount > 0 ? `${pendingPaymentCount}` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    { id: 'expenses', label: 'Expenses', icon: PieChart },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageSquare,
      highlight: true,
    },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      id="main-navigation-bar"
      className="bg-slate-100/70 border-b border-slate-200/80 overflow-x-auto scrollbar-none sticky top-16 z-20 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1.5 py-2 min-w-max">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/90 ring-1 ring-slate-900/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? item.highlight
                        ? 'text-emerald-600'
                        : 'text-indigo-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <span className="px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                    Auto
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
