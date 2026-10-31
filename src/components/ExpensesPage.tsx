import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import { ExpenseCategory, PaymentMethod, ExpenseRecord } from '../types';
import { 
  Receipt, 
  Plus, 
  Search, 
  Calendar, 
  Tag, 
  DollarSign, 
  CreditCard, 
  Ban, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  FileText,
  Loader2,
  Filter
} from 'lucide-react';

const CATEGORY_NAMES_KHMER: Record<ExpenseCategory, string> = {
  MEETING: 'ប្រជុំ & អាហារូបត្ថម្ភ (Meeting)',
  BANK_FEE: 'សេវាធនាគារ (Bank Fee)',
  PRINTING: 'បោះពុម្ព & ឯកសារ (Printing)',
  TRANSPORT: 'ធ្វើដំណើរ (Transport)',
  OTHER: 'ចំណាយផ្សេងៗ (Other)'
};

export const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, voidExpense, isOfficer, isYearClosed } = useClub();

  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('OTHER');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ABA_PAY');
  const [referenceNumber, setReferenceNumber] = useState<string>('');

  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Void Modal State
  const [selectedForVoid, setSelectedForVoid] = useState<ExpenseRecord | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!description.trim() || !amount || Number(amount) <= 0) {
      setErrorMessage('សូមបញ្ចូលបរិយាយ និងចំនួនទឹកប្រាក់ដែលត្រឹមត្រូវ!');
      return;
    }

    const year = new Date(expenseDate).getFullYear();
    if (isYearClosed(year)) {
      setErrorMessage(`ឆ្នាំ ${year} ត្រូវបានបិទបញ្ជីរួចរាល់ហើយ! មិនអាចបន្ថែមចំណាយបានទេ។`);
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await addExpense({
        expenseDate,
        category,
        description: description.trim(),
        amount: Number(amount),
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined
      });

      if (ok) {
        setDescription('');
        setAmount('');
        setReferenceNumber('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'មានបញ្ហាក្នុងការបន្ថែមចំណាយ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmVoid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForVoid) return;
    if (!voidReason.trim()) {
      alert('សូមបញ្ចូលមូលហេតុនៃការបោះបង់ចំណាយ!');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await voidExpense(selectedForVoid.id, voidReason.trim());
      if (ok) {
        setSelectedForVoid(null);
        setVoidReason('');
      }
    } catch (err: any) {
      alert(err.message || 'មិនអាចបោះបង់ចំណាយបានទេ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (filterCategory !== 'ALL' && exp.category !== filterCategory) return false;
      if (filterMonth !== 'ALL') {
        const monthStr = exp.expenseDate.slice(0, 7); // YYYY-MM
        if (monthStr !== filterMonth) return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const descMatch = exp.description.toLowerCase().includes(term);
        const refMatch = exp.referenceNumber?.toLowerCase().includes(term);
        const userMatch = exp.recordedBy.toLowerCase().includes(term);
        if (!descMatch && !refMatch && !userMatch) return false;
      }
      return true;
    });
  }, [expenses, filterCategory, filterMonth, searchTerm]);

  const totalActiveExpenses = useMemo(() => {
    return filteredExpenses.filter(e => !e.isVoided).reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const totalVoidedExpenses = useMemo(() => {
    return filteredExpenses.filter(e => e.isVoided).reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              ការគ្រប់គ្រងចំណាយសមាគម (Club Expenses)
            </h1>
            <p className="text-xs text-slate-500">
              កត់ត្រា និងដកពិសោធន៍ចំណាយរដ្ឋបាល ប្រជុំ បោះពុម្ព និងការធ្វើដំណើរ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <div>
            <div className="text-[10px] text-slate-500 font-medium">ចំណាយសរុប (សកម្ម)</div>
            <div className="text-base font-extrabold text-rose-600 font-mono">
              ${totalActiveExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          {totalVoidedExpenses > 0 && (
            <div className="pl-3 border-l border-slate-200">
              <div className="text-[10px] text-slate-400">បានបោះបង់ (Voided)</div>
              <div className="text-xs font-bold text-slate-400 line-through font-mono">
                ${totalVoidedExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Officers Add Form */}
      {isOfficer && (
        <form onSubmit={handleAddExpense} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Plus className="w-4 h-4 text-[#00609C]" />
            <span>កត់ត្រាចំណាយថ្មី (Add New Expense)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                កាលបរិច្ឆេទចំណាយ *
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ប្រភេទចំណាយ *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
              >
                {Object.entries(CATEGORY_NAMES_KHMER).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ចំនួនទឹកប្រាក់ ($ USD) *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:border-[#00609C]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                វិធីសាស្ត្របង់ប្រាក់
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
              >
                <option value="ABA_PAY">ABA PAY (ធនាគារ)</option>
                <option value="CASH">ប្រាក់សុទ្ធ (Cash)</option>
                <option value="WING">Wing (វីង)</option>
                <option value="OTHER">ផ្សេងៗ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                បរិយាយអំពីចំណាយ *
              </label>
              <input
                type="text"
                required
                placeholder="ឧ. ទិញទឹកសុទ្ធ និងនំសម្រាប់កិច្ចប្រជុំប្រចាំខែ"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                លេខវិក្កយបត្រ / ប្រតិបត្តិការ
              </label>
              <input
                type="text"
                placeholder="ឧ. TRX-883920"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#00609C]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-white bg-[#00609C] hover:bg-[#004f80] rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>កំពុងរក្សាទុក...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>រក្សាទុកចំណាយ</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Filter & List Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="ស្វែងរកបរិយាយ, លេខវិក្កយបត្រ, អ្នកកត់ត្រា..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>តម្រង:</span>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
            >
              <option value="ALL">គ្រប់ប្រភេទចំណាយ</option>
              {Object.entries(CATEGORY_NAMES_KHMER).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">កាលបរិច្ឆេទ</th>
                <th className="py-2.5 px-3">ប្រភេទចំណាយ</th>
                <th className="py-2.5 px-3">បរិយាយ</th>
                <th className="py-2.5 px-3 text-right">ចំនួនទឹកប្រាក់</th>
                <th className="py-2.5 px-3">វិធីសាស្ត្រ</th>
                <th className="py-2.5 px-3">អ្នកកត់ត្រា</th>
                <th className="py-2.5 px-3 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    មិនមានទិន្នន័យចំណាយឡើយ
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr 
                    key={exp.id} 
                    className={exp.isVoided ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50/80'}
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {exp.expenseDate}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-blue-50 text-[#00609C]">
                        {CATEGORY_NAMES_KHMER[exp.category] || exp.category}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs truncate">
                      <div className={exp.isVoided ? 'line-through text-slate-400' : ''}>
                        {exp.description}
                      </div>
                      {exp.isVoided && exp.voidReason && (
                        <div className="text-[10px] text-rose-600 font-normal italic">
                          មូលហេតុបោះបង់: {exp.voidReason} ({exp.voidedBy})
                        </div>
                      )}
                    </td>

                    <td className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${
                      exp.isVoided ? 'line-through text-slate-400' : 'text-rose-600'
                    }`}>
                      ${exp.amount.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 font-mono whitespace-nowrap">
                      {exp.paymentMethod}
                      {exp.referenceNumber && (
                        <span className="block text-[10px] text-slate-400">#{exp.referenceNumber}</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-32 whitespace-nowrap">
                      {exp.recordedBy}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {exp.isVoided ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-[10px] rounded-full">
                          បានបោះបង់ (Voided)
                        </span>
                      ) : isOfficer ? (
                        <button
                          onClick={() => setSelectedForVoid(exp)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md font-semibold text-[11px] cursor-pointer transition-colors"
                        >
                          <Ban className="w-3 h-3" />
                          <span>បោះបង់</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">សកម្ម</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Void Modal */}
      {selectedForVoid && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <Ban className="w-5 h-5" />
                <span>បញ្ជាក់ការបោះបង់ចំណាយ (Void Expense)</span>
              </div>
              <button
                onClick={() => setSelectedForVoid(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs font-mono">
              <div className="font-bold text-slate-800">{selectedForVoid.description}</div>
              <div className="text-slate-500">កាលបរិច្ឆេទ: {selectedForVoid.expenseDate}</div>
              <div className="text-rose-600 font-bold">ទឹកប្រាក់: ${selectedForVoid.amount.toFixed(2)}</div>
            </div>

            <form onSubmit={handleConfirmVoid} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  សូមបញ្ចូលមូលហេតុនៃការបោះបង់ (Void Reason) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="ឧ. បញ្ចូលច្រឡំលេខ / វិក្កយបត្រត្រូវបានលុបចោល..."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedForVoid(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-white bg-rose-600 hover:bg-rose-700 rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'កំពុងបោះបង់...' : 'បញ្ជាក់ការបោះបង់ (Confirm Void)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
