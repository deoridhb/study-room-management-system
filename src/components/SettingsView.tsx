import React, { useState } from 'react';
import { SystemSettings, ActivityLog } from '../types';
import {
  Settings,
  ShieldCheck,
  Building,
  Clock,
  MessageSquare,
  Volume2,
  RotateCcw,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface SettingsViewProps {
  settings: SystemSettings;
  activityLogs: ActivityLog[];
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  activityLogs,
  onUpdateSettings,
  onResetData,
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <span>Library Configuration & Audit Trail (§20 & §22)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage study hall parameters, WhatsApp reminder triggers, and system audit logs.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Library Profile */}
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>Library / Study Room Profile</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Library Name</label>
                  <input
                    type="text"
                    required
                    value={formData.libraryName}
                    onChange={e => setFormData({ ...formData, libraryName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={e => setFormData({ ...formData, operatingHours: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Desk Capacity</label>
                  <input
                    type="number"
                    value={formData.totalSeats}
                    onChange={e => setFormData({ ...formData, totalSeats: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Automation Parameters (§17, §23a) */}
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Automation Parameters</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-900">Enable Automated Daily Reminders</p>
                    <p className="text-[11px] text-slate-500">
                      Dispatches Utility templates automatically when membership is due.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.automatedRemindersEnabled}
                    onChange={e =>
                      setFormData({ ...formData, automatedRemindersEnabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Reminder Days in Advance
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={formData.reminderDaysBeforeExpiry}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          reminderDaysBeforeExpiry: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Scheduled Daily Send Time
                    </label>
                    <input
                      type="time"
                      value={formData.reminderCronTime}
                      onChange={e =>
                        setFormData({ ...formData, reminderCronTime: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Kiosk & Audio Settings */}
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span>Kiosk Scanner Audio & Operational Feedback</span>
              </h3>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="font-semibold text-slate-900">Web Audio API Feedback Beeps</p>
                  <p className="text-[11px] text-slate-500">
                    Plays sound chimes on successful scan, rejection, or checkout.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.audioFeedbackEnabled}
                  onChange={e =>
                    setFormData({ ...formData, audioFeedbackEnabled: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onResetData}
                className="px-3 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Seed Demo Data</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* Audit Trail Log Stream (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Audit Trail & Security Logs (`activity_logs`)
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                {activityLogs.length} Events
              </span>
            </div>

            <div className="mt-4 space-y-3 overflow-y-auto max-h-[480px] pr-1">
              {activityLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Actor: {log.user}</span>
                    <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Immutable log trail stored in local system state.
          </div>
        </div>
      </div>
    </div>
  );
};
