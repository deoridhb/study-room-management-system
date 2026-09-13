import React, { useState } from 'react';
import { Student, MembershipPlan, PaymentRecord, PaymentMethod } from '../types';
import { X, CreditCard, CheckCircle } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  students?: Student[];
  plans?: MembershipPlan[];
  preselectedStudent?: Student | null;
  onRecordPayment?: (payment: PaymentRecord) => void;
  onSave?: (payment: PaymentRecord) => void;
  onClose: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  students = [],
  plans = [],
  preselectedStudent,
  onRecordPayment,
  onSave,
  onClose,
}) => {
  const [studentId, setStudentId] = useState<string>(preselectedStudent?.id || '');
  const [planId, setPlanId] = useState<string>(preselectedStudent?.planId || 'plan_monthly');
  const [totalFee, setTotalFee] = useState<number>(1500);
  const [amountPaid, setAmountPaid] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  React.useEffect(() => {
    if (preselectedStudent) {
      setStudentId(preselectedStudent.id);
      setPlanId(preselectedStudent.planId);
      const plan = (plans || []).find(p => p.id === preselectedStudent.planId);
      if (plan) {
        setTotalFee(plan.price);
        setAmountPaid(plan.price);
      }
    }
  }, [preselectedStudent, plans, isOpen]);

  const handleStudentSelect = (sId: string) => {
    setStudentId(sId);
    const stu = (students || []).find(s => s.id === sId);
    if (stu) {
      setPlanId(stu.planId);
      const plan = (plans || []).find(p => p.id === stu.planId);
      if (plan) {
        setTotalFee(plan.price);
        setAmountPaid(plan.price);
      }
    }
  };

  const handlePlanSelect = (pId: string) => {
    setPlanId(pId);
    const plan = (plans || []).find(p => p.id === pId);
    if (plan) {
      setTotalFee(plan.price);
      setAmountPaid(plan.price);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;

    const student = (students || []).find(s => s.id === studentId);
    const plan = (plans || []).find(p => p.id === planId);
    if (!student || !plan) return;

    const pending = Math.max(0, totalFee - amountPaid);
    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      receiptNo,
      studentId: student.id,
      studentName: student.fullName,
      planId: plan.id,
      planName: plan.name,
      amountPaid: Number(amountPaid),
      pendingAmount: pending,
      totalFee: Number(totalFee),
      paymentDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      status: pending === 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'pending',
      transactionRef: transactionRef.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (onRecordPayment) {
      onRecordPayment(newPayment);
    } else if (onSave) {
      onSave(newPayment);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="record-payment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div
        id="record-payment-modal-container"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">Record Fee Payment</h3>
          </div>
          <button
            id="close-record-payment-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Student</label>
            <select
              id="payment-student-select"
              required
              value={studentId}
              onChange={e => handleStudentSelect(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 bg-white text-slate-800"
            >
              <option value="">-- Choose Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.id}) • Seat: {s.assignedSeat || 'None'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Membership Plan</label>
              <select
                id="payment-plan-select"
                value={planId}
                onChange={e => handlePlanSelect(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 bg-white text-slate-800"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                id="payment-method-select"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 bg-white text-slate-800 uppercase"
              >
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="cash">Cash Counter</option>
                <option value="bank_transfer">NetBanking / NEFT</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Due Fee (₹)</label>
              <input
                id="payment-total-fee-input"
                type="number"
                min="0"
                value={totalFee}
                onChange={e => setTotalFee(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount Paid Now (₹)</label>
              <input
                id="payment-amount-paid-input"
                type="number"
                min="0"
                value={amountPaid}
                onChange={e => setAmountPaid(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-emerald-800 font-bold"
              />
            </div>
          </div>

          {totalFee - amountPaid > 0 ? (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-semibold">
              Remaining Balance Due: ₹{(totalFee - amountPaid).toLocaleString('en-IN')}
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paid in Full</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Transaction ID / UTR (Optional)
            </label>
            <input
              id="payment-ref-input"
              type="text"
              placeholder="e.g. UPI/28392183/ICICI"
              value={transactionRef}
              onChange={e => setTransactionRef(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes</label>
            <input
              id="payment-notes-input"
              type="text"
              placeholder="Any remarks"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              id="cancel-payment-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-payment-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm"
            >
              Record & Generate Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
