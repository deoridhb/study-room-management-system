import React from 'react';
import { PaymentRecord, Student, SystemSettings } from '../types';
import { X, Printer, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  payment: PaymentRecord | null;
  student?: Student;
  settings?: SystemSettings;
  isOpen?: boolean;
  libraryName?: string;
  libraryAddress?: string;
  libraryPhone?: string;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  payment,
  student,
  settings,
  isOpen = true,
  libraryName,
  libraryAddress,
  libraryPhone,
  onClose,
}) => {
  if (!payment || !isOpen) return null;

  const libName = libraryName || settings?.libraryName || 'Study Room & Reading Hall';
  const libAddress = libraryAddress || settings?.address || 'City Center';
  const libPhone = libraryPhone || settings?.contactPhone || settings?.phone || '+91 98765 43210';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-4 print:p-0 print:bg-white"
    >
      <div
        id="receipt-modal-container"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:w-full max-h-[95vh] flex flex-col"
      >
        {/* Modal bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <h3 className="font-semibold text-slate-800 text-xs sm:text-sm">Official Fee Payment Receipt</h3>
          </div>
          <button
            id="close-receipt-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Sheet */}
        <div className="p-4 sm:p-8 print:p-4 text-slate-800 font-sans overflow-y-auto flex-1" id="printable-receipt">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 uppercase">
              {libName}
            </h2>
            <p className="text-xs text-slate-600 mt-1">{libAddress}</p>
            <p className="text-xs text-slate-600">Contact: {libPhone}</p>
            <div className="inline-block mt-2.5 px-3 py-1 bg-slate-100 border border-slate-300 rounded-md text-[11px] font-semibold uppercase tracking-wider text-slate-800">
              Fee Acknowledgement Receipt
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-5 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Receipt No:</p>
              <p className="font-bold text-slate-900 font-mono text-xs sm:text-sm">{payment.receiptNo}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-medium text-[11px]">Date Issued:</p>
              <p className="font-semibold text-slate-800 text-xs">{payment.paymentDate}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Student Name:</p>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">{payment.studentName}</p>
              <p className="text-[10px] text-slate-500 font-mono">ID: {payment.studentId}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-medium text-[11px]">Allocated Desk:</p>
              <p className="font-bold text-emerald-700 font-mono text-xs sm:text-sm">
                Seat {student?.assignedSeat || 'Unassigned'}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto mb-5">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2 text-center hidden sm:table-cell">Plan Period</th>
                  <th className="px-3 py-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-slate-900">{payment.planName}</p>
                    <p className="text-[10px] text-slate-500 sm:hidden">
                      {student?.membershipStart || payment.paymentDate} to {student?.membershipExpiry || payment.dueDate}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-center text-slate-600 font-medium hidden sm:table-cell">
                    {student?.membershipStart || payment.paymentDate} to {student?.membershipExpiry || payment.dueDate}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                    ₹{payment.totalFee.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={1} className="px-3 py-2 text-right font-medium text-slate-600 sm:hidden">
                    Total Plan Fee:
                  </td>
                  <td colSpan={2} className="px-3 py-2 text-right font-medium text-slate-600 hidden sm:table-cell">
                    Total Plan Fee:
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-slate-900">
                    ₹{payment.totalFee.toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr className="bg-emerald-50/70 text-emerald-950 font-semibold">
                  <td colSpan={1} className="px-3 py-2 text-right sm:hidden">
                    Amount Received:
                  </td>
                  <td colSpan={2} className="px-3 py-2 text-right hidden sm:table-cell">
                    Amount Received:
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-emerald-700 text-xs sm:text-sm">
                    ₹{payment.amountPaid.toLocaleString('en-IN')}
                  </td>
                </tr>
                {payment.pendingAmount > 0 && (
                  <tr className="text-amber-800 font-semibold">
                    <td colSpan={1} className="px-3 py-2 text-right sm:hidden">
                      Balance Due:
                    </td>
                    <td colSpan={2} className="px-3 py-2 text-right hidden sm:table-cell">
                      Balance Due:
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-amber-700">
                      ₹{payment.pendingAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>

          {/* Payment Method & Signatures */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <p className="text-slate-500 font-medium text-[11px]">Payment Mode:</p>
              <p className="font-semibold text-slate-800 uppercase tracking-wide text-xs">
                {payment.paymentMethod.replace('_', ' ')}
              </p>
              {payment.transactionRef && (
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Ref: {payment.transactionRef}
                </p>
              )}
              <div className="flex items-center gap-1 text-emerald-700 mt-1.5 font-medium text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Payment Verified</span>
              </div>
            </div>

            <div className="flex flex-col items-end justify-end text-right">
              <div className="w-24 sm:w-32 border-b border-slate-400 mb-1" />
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-700">Authorized Signatory</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500">{libName}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-slate-50 print:hidden shrink-0">
          <p className="text-[11px] text-slate-500 hidden sm:block">Generated automatically by system</p>
          <button
            id="print-receipt-btn"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Official Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
