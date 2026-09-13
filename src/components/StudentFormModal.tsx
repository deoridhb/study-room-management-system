import React, { useState, useEffect } from 'react';
import { Student, MembershipPlan, Seat } from '../types';
import { generateRandomToken } from '../utils/qr';
import { X, UserPlus, Save, ShieldCheck } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  studentToEdit?: Student | null;
  editingStudent?: Student | null;
  plans?: MembershipPlan[];
  seats?: Seat[];
  onSave: (studentData: Partial<Student>) => void;
  onClose: () => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  studentToEdit,
  editingStudent,
  plans = [],
  seats = [],
  onSave,
  onClose,
}) => {
  const targetStudent = studentToEdit || editingStudent;
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isMinor, setIsMinor] = useState(false);
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [planId, setPlanId] = useState('plan_monthly');
  const [membershipStart, setMembershipStart] = useState('');
  const [membershipExpiry, setMembershipExpiry] = useState('');
  const [assignedSeat, setAssignedSeat] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'expired' | 'suspended'>('active');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (targetStudent) {
      setFullName(targetStudent.fullName);
      setPhone(targetStudent.phone);
      setEmail(targetStudent.email);
      setAddress(targetStudent.address);
      setEmergencyContact(targetStudent.emergencyContact);
      setIsMinor(targetStudent.isMinor);
      setGuardianConsent(targetStudent.guardianConsent);
      setPlanId(targetStudent.planId);
      setMembershipStart(targetStudent.membershipStart);
      setMembershipExpiry(targetStudent.membershipExpiry);
      setAssignedSeat(targetStudent.assignedSeat);
      setStatus(targetStudent.status);
      setNotes(targetStudent.notes || '');
    } else {
      // Default new student
      const today = new Date().toISOString().split('T')[0];
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      const expiryStr = expiry.toISOString().split('T')[0];

      setFullName('');
      setPhone('+91 ');
      setEmail('');
      setAddress('');
      setEmergencyContact('');
      setIsMinor(false);
      setGuardianConsent(false);
      setPlanId('plan_monthly');
      setMembershipStart(today);
      setMembershipExpiry(expiryStr);
      setAssignedSeat('');
      setStatus('active');
      setNotes('');
    }
  }, [studentToEdit, isOpen]);

  // When plan changes for a new student, automatically update expiry
  const handlePlanChange = (selectedPlanId: string) => {
    setPlanId(selectedPlanId);
    const plan = plans.find(p => p.id === selectedPlanId);
    if (plan && membershipStart) {
      const startDate = new Date(membershipStart);
      startDate.setDate(startDate.getDate() + plan.durationDays);
      setMembershipExpiry(startDate.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    const studentData: Partial<Student> = {
      fullName,
      phone,
      email,
      address,
      emergencyContact,
      isMinor,
      guardianConsent: isMinor ? guardianConsent : false,
      planId,
      membershipStart,
      membershipExpiry,
      assignedSeat,
      status,
      notes,
    };

    if (!studentToEdit) {
      const nextId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
      studentData.id = nextId;
      studentData.joiningDate = new Date().toISOString().split('T')[0];
      studentData.qrToken = generateRandomToken(nextId);
    }

    onSave(studentData);
    onClose();
  };

  if (!isOpen) return null;

  // Available seats
  const availableSeats = seats.filter(
    s => s.status === 'available' || (studentToEdit && s.seatNumber === studentToEdit.assignedSeat)
  );

  return (
    <div
      id="student-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="student-form-modal-container"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-base">
              {studentToEdit ? `Edit Student: ${studentToEdit.fullName}` : 'Register New Student'}
            </h3>
          </div>
          <button
            id="close-student-form-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="student-name-input"
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Phone <span className="text-rose-500">*</span>
              </label>
              <input
                id="student-phone-input"
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                id="student-email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
              <input
                id="student-emergency-input"
                type="text"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                placeholder="+91 98000 11223 (Parent / Guardian)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
            <input
              id="student-address-input"
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Flat / House No, Street, City"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
            />
          </div>

          {/* Minors & Guardian Consent (§23 & §32 Q3) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <input
                id="student-is-minor-checkbox"
                type="checkbox"
                checked={isMinor}
                onChange={e => setIsMinor(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="student-is-minor-checkbox" className="font-semibold text-slate-800 cursor-pointer">
                Student is under 18 years of age (Minor)
              </label>
            </div>

            {isMinor && (
              <div className="pl-6 pt-1 space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <input
                    id="student-guardian-consent-checkbox"
                    type="checkbox"
                    required={isMinor}
                    checked={guardianConsent}
                    onChange={e => setGuardianConsent(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="student-guardian-consent-checkbox" className="text-[11px] font-medium cursor-pointer">
                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                    Verified Guardian Consent form obtained for record keeping (§23 Compliance)
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Membership & Seat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Membership Plan</label>
              <select
                id="student-plan-select"
                value={planId}
                onChange={e => handlePlanChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800 bg-white"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                id="student-start-date-input"
                type="date"
                value={membershipStart}
                onChange={e => setMembershipStart(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                id="student-expiry-date-input"
                type="date"
                value={membershipExpiry}
                onChange={e => setMembershipExpiry(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800 font-semibold text-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Seat Desk</label>
              <select
                id="student-seat-select"
                value={assignedSeat}
                onChange={e => setAssignedSeat(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800 bg-white font-mono"
              >
                <option value="">-- No Fixed Desk (Floating) --</option>
                {availableSeats.map(s => (
                  <option key={s.id} value={s.seatNumber}>
                    Desk {s.seatNumber} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
              <select
                id="student-status-select"
                value={status}
                onChange={e => setStatus(e.target.value as 'active' | 'inactive' | 'expired' | 'suspended')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800 bg-white capitalize"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes & Study Goals</label>
            <textarea
              id="student-notes-input"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. UPSC CSE aspirant, requests quiet corner desk"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              id="cancel-student-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-student-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{studentToEdit ? 'Update Student' : 'Complete Registration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
