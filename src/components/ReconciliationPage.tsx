import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import { CashReconciliation } from '../types';
import { 
  Scale, 
  Save, 
  Calendar, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Loader2,
  FileCheck2
} from 'lucide-react';

export const ReconciliationPage: React.FC = () => {
  const { 
    reconciliations, 
    addReconciliation, 
    members, 
    savingsRecords, 
    loans, 
    payments, 
    expenses, 
    isOfficer 
  } = useClub();

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);

  const [actualCash, setActualCash] = useState<number | ''>('');
  const [actualBank, setActualBank] = useState<number | ''>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute System Balance up to the end of selected year & month
  const calculatedSystemBalance = useMemo(() => {
    // Cutoff date = last day of selected year & month
    const endDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`;

    // 1. Savings up to cutoff
    const totalSavings = savingsRecords
      .filter(s => {
        if (s.year < selectedYear) return true;
        if (s.year === selectedYear && s.month <= selectedMonth) return true;
        return false;
      })
      .reduce((sum, s) => sum + s.amount, 0);

    // 2. Interest & Late fees up to cutoff
    const filteredPayments = payments.filter(p => p.paymentDate <= endDateStr);
    const totalInterest = filteredPayments.reduce((sum, p) => sum + p.interestPaid, 0);
    const totalLateFees = filteredPayments.reduce((sum, p) => sum + (p.lateFee || 0), 0);

    // 3. Active Loan Principal Disbursed up to cutoff
    const totalActiveLoansDisbursed = loans
      .filter(l => l.startDate <= endDateStr && (l.status === 'ACTIVE' || l.status === 'OVERDUE'))
      .reduce((sum, l) => sum + l.remainingBalance, 0);

    // 4. Expenses up to cutoff
    const totalExpenses = expenses
      .filter(e => !e.isVoided && e.expenseDate <= endDateStr)
      .reduce((sum, e) => sum + e.amount, 0);

    return totalSavings + totalInterest + totalLateFees - totalActiveLoansDisbursed - totalExpenses;
  }, [selectedYear, selectedMonth, savingsRecords, payments, loans, expenses]);

  const cashVal = typeof actualCash === 'number' ? actualCash : 0;
  const bankVal = typeof actualBank === 'number' ? actualBank : 0;
  const totalActual = cashVal + bankVal;
  const difference = totalActual - calculatedSystemBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isOfficer) {
      setErrorMessage('លោកអ្នកគ្មានសិទ្ធិផ្ទៀងផ្ទាត់សាច់ប្រាក់ឡើយ (មានតែប្រធាន ឬបេឡាធិការ)');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await addReconciliation({
        periodYear: Number(selectedYear),
        periodMonth: Number(selectedMonth),
        systemBalance: calculatedSystemBalance,
        actualCash: cashVal,
        actualBank: bankVal,
        notes: notes.trim() || undefined
      });

      if (ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
      } else {
        setErrorMessage('បរាជ័យក្នុងការរក្សាទុកទិន្នន័យផ្ទៀងផ្ទាត់សាច់ប្រាក់');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'មានបញ្ហាក្នុងការរក្សាទុក');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              ផ្ទៀងផ្ទាត់សាច់ប្រាក់ប្រចាំខែ (Monthly Cash Reconciliation)
            </h1>
            <p className="text-xs text-slate-500">
              ផ្ទៀងផ្ទាត់សមតុល្យសាច់ប្រាក់ក្នុងប្រព័ន្ធ ជាមួយសាច់ប្រាក់បេឡាជាក់ស្តែង និងគណនីធនាគារ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">ជ្រើសរើសខែ/ឆ្នាំ:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>ឆ្នាំ {y}</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>ខែ {m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error / Success Alerts */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-bold">បានរក្សាទុកកំណត់ត្រាផ្ទៀងផ្ទាត់សាច់ប្រាក់ដោយជោគជ័យ!</span>
        </div>
      )}

      {/* Main Reconciliation Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: System Balance */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-slate-500 font-bold">
              <FileCheck2 className="w-4 h-4 text-[#00609C]" />
              <span>សមតុល្យតាមប្រព័ន្ធ (System Balance)</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              ${calculatedSystemBalance.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-400">
              គណនាតាមរូបមន្ត: ភាគលាភ + ប្រាក់សន្សំ + ការប្រាក់ - កម្ចីសកម្ម - ចំណាយ
            </p>
          </div>

          {/* Card 2: Actual Cash & Bank Inputs */}
          <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>សាច់ប្រាក់ជាក់ស្តែង (Actual Count)</span>
              </span>
              <span className="text-xs font-mono font-extrabold text-[#00609C]">
                សរុបជាក់ស្តែង: ${totalActual.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  សាច់ប្រាក់ក្នុងបេឡា (Cash in Hand) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    disabled={!isOfficer}
                    placeholder="0.00"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl font-mono font-bold bg-white focus:outline-none focus:border-[#00609C] disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ប្រាក់ក្នុងគណនីធនាគារ (Bank Balance) *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    disabled={!isOfficer}
                    placeholder="0.00"
                    value={actualBank}
                    onChange={(e) => setActualBank(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl font-mono font-bold bg-white focus:outline-none focus:border-[#00609C] disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Difference Display Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 font-mono ${
          difference === 0 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900 animate-pulse'
        }`}>
          <div className="flex items-center gap-3">
            {difference === 0 ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold font-sans">
                {difference === 0 ? 'សាច់ប្រាក់ត្រូវគ្នា 100% (No Difference)' : 'មានគម្លាតសាច់ប្រាក់ (Discrepancy Detected!)'}
              </div>
              <div className="text-[11px] opacity-80 font-sans">
                {difference === 0 
                  ? 'ទិន្នន័យប្រព័ន្ធ និងសាច់ប្រាក់ជាក់ស្តែងត្រូវគ្នាល្អឥតខ្ចោះ' 
                  : 'សាច់ប្រាក់ជាក់ស្តែង មិនស្មើនឹងសាច់ប្រាក់ក្នុងប្រព័ន្ធឡើយ'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-sans opacity-70">ផលសង (Difference)</div>
            <div className={`text-xl font-extrabold ${difference === 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              ${difference > 0 ? `+${difference.toFixed(2)}` : difference.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            កំណត់សម្គាល់បន្ថែម (Notes / Reason)
          </label>
          <textarea
            rows={2}
            disabled={!isOfficer}
            placeholder="ឧ. សាច់ប្រាក់ជាក់ស្តែងបានផ្ទៀងផ្ទាត់ដោយបេឡាធិការ រួចរាល់..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C] disabled:bg-slate-100"
          />
        </div>

        {/* Submit */}
        {isOfficer && (
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-white bg-[#00609C] hover:bg-[#004f80] rounded-xl font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>កំពុងរក្សាទុក...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុកលទ្ធផលផ្ទៀងផ្ទាត់</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Past Reconciliation History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
          <History className="w-4 h-4 text-[#00609C]" />
          <span>ប្រវត្តិផ្ទៀងផ្ទាត់សាច់ប្រាក់ (Reconciliation History)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">ខែ/ឆ្នាំ</th>
                <th className="py-2.5 px-3 text-right">សមតុល្យប្រព័ន្ធ</th>
                <th className="py-2.5 px-3 text-right">ប្រាក់សុទ្ធ</th>
                <th className="py-2.5 px-3 text-right">ធនាគារ</th>
                <th className="py-2.5 px-3 text-right">ផលសង</th>
                <th className="py-2.5 px-3">អ្នកកត់ត្រា</th>
                <th className="py-2.5 px-3">កំណត់សម្គាល់</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {reconciliations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    មិនទាន់មានប្រវត្តិផ្ទៀងផ្ទាត់សាច់ប្រាក់នៅឡើយទេ
                  </td>
                </tr>
              ) : (
                reconciliations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      ខែ {rec.periodMonth}/{rec.periodYear}
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-700 whitespace-nowrap">
                      ${rec.systemBalance.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-right text-emerald-700 whitespace-nowrap">
                      ${rec.actualCash.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-right text-blue-700 whitespace-nowrap">
                      ${rec.actualBank.toFixed(2)}
                    </td>

                    <td className={`py-2.5 px-3 text-right font-extrabold whitespace-nowrap ${
                      rec.difference === 0 ? 'text-emerald-600' : 'text-rose-600 bg-rose-50'
                    }`}>
                      ${rec.difference.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-32 truncate whitespace-nowrap">
                      {rec.recordedBy}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 font-sans max-w-xs truncate whitespace-nowrap">
                      {rec.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
