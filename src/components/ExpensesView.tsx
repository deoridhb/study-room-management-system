import React, { useState } from 'react';
import { ExpenseRecord, BudgetCategory, ExpenseCategory } from '../types';
import { downloadCsv } from '../utils/exportCsv';
import {
  PieChart,
  PlusCircle,
  Download,
  Receipt,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface ExpensesViewProps {
  expenses: ExpenseRecord[];
  budgets: BudgetCategory[];
  onOpenAddExpense: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  budgets,
  onOpenAddExpense,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgetedAmount, 0);
  const totalVariance = totalBudgeted - totalSpent;

  const filteredExpenses = expenses.filter(
    e => selectedCategory === 'all' || e.category === selectedCategory
  );

  const handleExportCsv = () => {
    const headers = [
      'Expense ID',
      'Category',
      'Amount (INR)',
      'Date',
      'Description',
      'Payment Method',
      'Bill / Receipt Ref',
    ];

    const rows = expenses.map(e => [
      e.id,
      e.category,
      e.amount,
      e.date,
      e.description,
      e.paymentMethod,
      e.receiptRef || '-',
    ]);

    downloadCsv('Operational_Expenses_Ledger', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <span>Expense & Budget Management (§14 & §15)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track reading hall operating expenses, utility bills, maintenance overheads, and variance against budget.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="export-expenses-csv-btn"
            onClick={handleExportCsv}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            id="open-add-expense-btn"
            onClick={onOpenAddExpense}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Primary 3 Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Total Monthly Budget
          </p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            ₹{totalBudgeted.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Allocated operational budget</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Actual Spent This Month
          </p>
          <p className="text-2xl font-black text-slate-900 font-mono mt-1">
            ₹{totalSpent.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{expenses.length} expense items recorded</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
            Net Budget Variance
          </p>
          <p
            className={`text-2xl font-black font-mono mt-1 ${
              totalVariance >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {totalVariance >= 0 ? '+' : ''}₹{totalVariance.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {totalVariance >= 0 ? 'Under budget (Favorable)' : 'Over budget'}
          </p>
        </div>
      </div>

      {/* Budget Management Table (§15 PRD Format) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Budget Variance Analysis Table (§15)
          </h3>
          <span className="text-[11px] text-slate-500">
            Variance = Budgeted − Actual
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Expense Category</th>
                <th className="px-4 py-3 text-right">Budget (₹)</th>
                <th className="px-4 py-3 text-right">Actual Spent (₹)</th>
                <th className="px-4 py-3 text-right">Variance (₹)</th>
                <th className="px-4 py-3 text-center">Budget Utilization</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgets.map(b => {
                // calculate actual spend for this category from expense logs
                const categoryActual = expenses
                  .filter(e => e.category === b.category)
                  .reduce((sum, e) => sum + e.amount, 0);

                const variance = b.budgetedAmount - categoryActual;
                const percent =
                  b.budgetedAmount > 0
                    ? Math.round((categoryActual / b.budgetedAmount) * 100)
                    : 0;

                return (
                  <tr key={b.category} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      {b.label}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-700">
                      ₹{b.budgetedAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                      ₹{categoryActual.toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right font-mono font-bold ${
                        variance >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {variance >= 0 ? '+' : ''}₹{variance.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="w-32 mx-auto">
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                          <span>{percent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percent > 100
                                ? 'bg-rose-500'
                                : percent > 85
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {variance >= 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          On Track
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Over Budget
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Expense Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Operational Expenses Ledger ({filteredExpenses.length} Records)
          </h3>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-800"
          >
            <option value="all">All Categories</option>
            {budgets.map(b => (
              <option key={b.category} value={b.category}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Bill Ref</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-slate-600">
                    {expense.date}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="capitalize font-semibold text-slate-800 px-2 py-0.5 bg-slate-100 rounded-md">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 font-medium">
                    {expense.description}
                  </td>
                  <td className="px-4 py-3.5 uppercase font-medium text-slate-600">
                    {expense.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px]">
                    {expense.receiptRef || '-'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
