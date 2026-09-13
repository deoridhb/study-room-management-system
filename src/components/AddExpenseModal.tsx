import React, { useState } from 'react';
import { ExpenseRecord, ExpenseCategory, PaymentMethod } from '../types';
import { X, Receipt, PlusCircle } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onAddExpense?: (expense: ExpenseRecord) => void;
  onSave?: (expense: ExpenseRecord) => void;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onAddExpense,
  onSave,
  onClose,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('maintenance');
  const [amount, setAmount] = useState<number>(1000);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [receiptRef, setReceiptRef] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description.trim()) return;

    const newExpense: ExpenseRecord = {
      id: `exp_${Date.now()}`,
      category,
      amount: Number(amount),
      date,
      description: description.trim(),
      paymentMethod,
      receiptRef: receiptRef.trim() || undefined,
    };

    if (onAddExpense) {
      onAddExpense(newExpense);
    } else if (onSave) {
      onSave(newExpense);
    }
    onClose();
  };

  return (
    <div
      id="add-expense-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div
        id="add-expense-modal-container"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-base">Add Operational Expense</h3>
          </div>
          <button
            id="close-add-expense-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Category</label>
              <select
                id="expense-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 bg-white text-slate-800 capitalize"
              >
                <option value="rent">Premises Rent</option>
                <option value="electricity">Electricity / Power</option>
                <option value="internet">Internet / Wi-Fi Fiber</option>
                <option value="cleaning">Cleaning & Sanitation</option>
                <option value="maintenance">Repairs & Maintenance</option>
                <option value="furniture">Furniture & Desks</option>
                <option value="equipment">Equipment & Inverter</option>
                <option value="stationery">Stationery & Printing</option>
                <option value="staff">Staff Stipend</option>
                <option value="other">Other Operational</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Amount (₹)</label>
              <input
                id="expense-amount-input"
                type="number"
                min="1"
                required
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Date</label>
              <input
                id="expense-date-input"
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                id="expense-method-select"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 bg-white text-slate-800 uppercase"
              >
                <option value="upi">UPI / GPay</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">NetBanking</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description / Vendor Details <span className="text-rose-500">*</span>
            </label>
            <input
              id="expense-desc-input"
              type="text"
              required
              placeholder="e.g. AC servicing and gas refill"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Bill / Invoice Reference No.
            </label>
            <input
              id="expense-bill-ref-input"
              type="text"
              placeholder="e.g. INV-998231"
              value={receiptRef}
              onChange={e => setReceiptRef(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 text-slate-800 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              id="cancel-expense-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-expense-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
