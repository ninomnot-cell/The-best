import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import { FiscalYearClosing } from '../types';
import { 
  Lock, 
  Unlock, 
  Calendar, 
  DollarSign, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet, 
  ShieldAlert, 
  Loader2,
  PieChart,
  X
} from 'lucide-react';

export const YearEndClosingPage: React.FC = () => {
  const { 
    fiscalClosings, 
    closeFiscalYear, 
    isPresident, 
    savingsRecords, 
    payments, 
    expenses, 
    members,
    clubSettings 
  } = useClub();

  const [selectedYear, setSelectedYear] = useState<number>(clubSettings.currentFiscalYear || 2026);
  const [closingNotes, setClosingNotes] = useState<string>('');

  // Confirmation Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [confirmYearInput, setConfirmYearInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Print Report Modal
  const [printReportClosing, setPrintReportClosing] = useState<FiscalYearClosing | null>(null);

  const isClosed = useMemo(() => {
    return fiscalClosings.some(c => Number(c.fiscalYear) === Number(selectedYear));
  }, [fiscalClosings, selectedYear]);

  // Year Preview Calculations
  const previewMetrics = useMemo(() => {
    const yearSavings = savingsRecords
      .filter(s => s.year === selectedYear)
      .reduce((sum, s) => sum + s.amount, 0);

    const yearPayments = payments.filter(p => new Date(p.paymentDate).getFullYear() === selectedYear);
    const interestIncome = yearPayments.reduce((sum, p) => sum + p.interestPaid, 0);
    const lateFees = yearPayments.reduce((sum, p) => sum + (p.lateFee || 0), 0);

    const yearExpenses = expenses
      .filter(e => !e.isVoided && new Date(e.expenseDate).getFullYear() === selectedYear)
      .reduce((sum, e) => sum + e.amount, 0);

    const netProfit = interestIncome + lateFees - yearExpenses;
    const totalDividends = Math.max(0, netProfit);

    return {
      yearSavings,
      interestIncome,
      lateFees,
      yearExpenses,
      netProfit,
      totalDividends
    };
  }, [selectedYear, savingsRecords, payments, expenses]);

  const handleConfirmClose = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (confirmYearInput.trim() !== String(selectedYear)) {
      setErrorMessage(`សូមវាយបញ្ចូលលេខឆ្នាំ "${selectedYear}" អោយបានត្រឹមត្រូវដើម្បីបញ្ជាក់!`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await closeFiscalYear(selectedYear, closingNotes.trim());
      if (res.success) {
        setIsModalOpen(false);
        setConfirmYearInput('');
        setClosingNotes('');
      } else {
        setErrorMessage(res.error || 'បរាជ័យក្នុងការបិទបញ្ជីប្រចាំឆ្នាំ');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'មានបញ្ហាក្នុងការបិទបញ្ជី');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              បិទបញ្ជីប្រចាំឆ្នាំ (Year-End Closing)
            </h1>
            <p className="text-xs text-slate-500">
              គណនាចំណូល ភាគលាភ ចំណាយ និងចាក់សោរបញ្ជីប្រចាំឆ្នាំ (សម្រាប់ប្រធានក្លឹប)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">ជ្រើសរើសឆ្នាំ:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>ឆ្នាំ {y}</option>
            ))}
          </select>
        </div>
      </div>

      {!isPresident && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600" />
          <span>លោកអ្នកអាចមើលរបាយការណ៍បិទបញ្ជីបានតែប៉ុណ្ណោះ (សិទ្ធិបិទបញ្ជីជាផ្លូវការមានតែប្រធានក្លឹប)</span>
        </div>
      )}

      {/* Year Status Banner */}
      <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
        isClosed ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-3">
          {isClosed ? (
            <Lock className="w-6 h-6 text-purple-700 shrink-0 animate-pulse" />
          ) : (
            <Unlock className="w-6 h-6 text-emerald-600 shrink-0" />
          )}
          <div>
            <div className="text-sm font-bold">
              {isClosed ? `ឆ្នាំ ${selectedYear} ត្រូវបានបិទបញ្ជីចាក់សោរ (Closed & Locked)` : `ឆ្នាំ ${selectedYear} កំពុងដំណើរការ (Open)`}
            </div>
            <div className="text-xs opacity-80">
              {isClosed 
                ? 'ទិន្នន័យប្រាក់សន្សំ ចំណាយ និងកម្ចីនៃឆ្នាំនេះត្រូវបានចាក់សោរមិនអាចកែប្រែបានឡើយ' 
                : 'អាចធ្វើការបិទបញ្ជី និងគណនាភាគលាភចុងក្រោយបាន'}
            </div>
          </div>
        </div>

        {isClosed && (
          <button
            onClick={() => {
              const closedRec = fiscalClosings.find(c => Number(c.fiscalYear) === Number(selectedYear));
              if (closedRec) setPrintReportClosing(closedRec);
            }}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ពរបាយការណ៍</span>
          </button>
        )}
      </div>

      {/* Preview Metrics Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 text-xs">
        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[#00609C]" />
          <span>ទិន្នន័យសង្ខេបចុងឆ្នាំ {selectedYear} (Closing Preview)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="text-[11px] text-slate-500 font-sans">ប្រាក់សន្សំសរុបក្នុងឆ្នាំ (Total Savings)</div>
            <div className="text-lg font-bold text-slate-900">${previewMetrics.yearSavings.toFixed(2)}</div>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1">
            <div className="text-[11px] text-emerald-700 font-sans">ចំណូលការប្រាក់សរុប (Interest Income)</div>
            <div className="text-lg font-bold text-emerald-800">${previewMetrics.interestIncome.toFixed(2)}</div>
          </div>

          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl space-y-1">
            <div className="text-[11px] text-blue-700 font-sans">ថ្លៃពិន័យបង់យឺត (Late Penalty Fees)</div>
            <div className="text-lg font-bold text-blue-800">${previewMetrics.lateFees.toFixed(2)}</div>
          </div>

          <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-xl space-y-1">
            <div className="text-[11px] text-rose-700 font-sans">ចំណាយសរុបប្រចាំឆ្នាំ (Total Expenses)</div>
            <div className="text-lg font-bold text-rose-800">${previewMetrics.yearExpenses.toFixed(2)}</div>
          </div>

          <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl space-y-1">
            <div className="text-[11px] text-purple-700 font-sans">ចំណេញសុទ្ធ (Net Profit)</div>
            <div className="text-lg font-bold text-purple-800">${previewMetrics.netProfit.toFixed(2)}</div>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
            <div className="text-[11px] text-amber-800 font-sans">ភាគលាភត្រូវបែងចែក (Total Dividends)</div>
            <div className="text-lg font-bold text-amber-900">${previewMetrics.totalDividends.toFixed(2)}</div>
          </div>
        </div>

        {/* Notes & Actions */}
        {!isClosed && isPresident && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1 font-sans">
                កំណត់សម្គាល់ការបិទបញ្ជី (Closing Notes)
              </label>
              <textarea
                rows={2}
                placeholder="ឧ. បានបិទបញ្ជីប្រចាំឆ្នាំ ២០២៦ និងអនុម័តបែងចែកភាគលាភដោយគណៈកម្មការ..."
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-white bg-purple-700 hover:bg-purple-800 rounded-xl font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>បិទបញ្ជីប្រចាំឆ្នាំ {selectedYear} ជាផ្លូវការ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-[#00609C]" />
          <span>ប្រវត្តិបិទបញ្ជីប្រចាំឆ្នាំ (Past Year-End Closings)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">ឆ្នាំ</th>
                <th className="py-2.5 px-3 text-right">ប្រាក់សន្សំ</th>
                <th className="py-2.5 px-3 text-right">ចំណូលការប្រាក់</th>
                <th className="py-2.5 px-3 text-right">ចំណាយ</th>
                <th className="py-2.5 px-3 text-right">ចំណេញសុទ្ធ</th>
                <th className="py-2.5 px-3 text-right">ភាគលាភ</th>
                <th className="py-2.5 px-3">អ្នកបិទបញ្ជី</th>
                <th className="py-2.5 px-3 text-center">របាយការណ៍</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fiscalClosings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    មិនទាន់មានប្រវត្តិបិទបញ្ជីប្រចាំឆ្នាំនៅឡើយទេ
                  </td>
                </tr>
              ) : (
                fiscalClosings.map((fc) => (
                  <tr key={fc.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-purple-900 whitespace-nowrap">
                      ឆ្នាំ {fc.fiscalYear}
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-700 whitespace-nowrap">
                      ${fc.totalSavings.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-right text-emerald-700 whitespace-nowrap">
                      ${fc.interestIncome.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-right text-rose-700 whitespace-nowrap">
                      ${fc.totalExpenses.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      ${fc.netProfit.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-amber-800 whitespace-nowrap">
                      ${fc.totalDividends.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-28 truncate whitespace-nowrap">
                      {fc.closedBy}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setPrintReportClosing(fc)}
                        className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                        title="មើលរបាយការណ៍បោះពុម្ព"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-purple-800 font-bold text-sm">
                <Lock className="w-5 h-5 text-purple-700" />
                <span>បញ្ជាក់ការបិទបញ្ជីប្រចាំឆ្នាំ {selectedYear}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold">⚠️ ការប្រុងប្រយ័ត្នខ្ពស់ ៖</p>
              <p>បន្ទាប់ពីបិទបញ្ជី ទិន្នន័យប្រាក់សន្សំ ចំណាយ និងការបង់ប្រាក់កម្ចីនៃឆ្នាំ {selectedYear} នឹងត្រូវចាក់សោរមិនអាចកែប្រែបានឡើយ!</p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleConfirmClose} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  សូមវាយបញ្ចូលលេខឆ្នាំ <span className="font-bold text-purple-800">"{selectedYear}"</span> ដើម្បីបញ្ជាក់ *
                </label>
                <input
                  type="text"
                  required
                  placeholder={String(selectedYear)}
                  value={confirmYearInput}
                  onChange={(e) => setConfirmYearInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-center text-sm focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-white bg-purple-700 hover:bg-purple-800 rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'កំពុងបិទបញ្ជី...' : 'បញ្ជាក់បិទបញ្ជីជាផ្លូវការ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Year-End Report Modal */}
      {printReportClosing && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6 border border-slate-200 print-modal-content">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <div className="font-bold text-sm text-slate-900">
                របាយការណ៍បិទបញ្ជីប្រចាំឆ្នាំ {printReportClosing.fiscalYear}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#00609C] hover:bg-[#004f80] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>បោះពុម្ព (Print Report)</span>
                </button>
                <button
                  onClick={() => setPrintReportClosing(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="space-y-6 text-slate-900 text-xs">
              <div className="text-center space-y-1 border-b pb-4 border-slate-200">
                <div className="font-bold text-base text-[#00609C]">
                  {clubSettings.clubNameKhmer}
                </div>
                <div className="font-extrabold text-sm text-purple-900">
                  របាយការណ៍បិទបញ្ជី និងបែងចែកភាគលាភប្រចាំឆ្នាំ {printReportClosing.fiscalYear}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  កាលបរិច្ឆេទបិទបញ្ជី: {printReportClosing.closedAt} · រៀបចំដោយ: {printReportClosing.closedBy}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 font-mono">
                <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <div className="text-slate-500 font-sans text-[11px]">ប្រាក់សន្សំសរុបក្នុងឆ្នាំ</div>
                  <div className="text-sm font-bold">${printReportClosing.totalSavings.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <div className="text-emerald-800 font-sans text-[11px]">ចំណូលការប្រាក់សរុប</div>
                  <div className="text-sm font-bold text-emerald-800">${printReportClosing.interestIncome.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <div className="text-blue-800 font-sans text-[11px]">ថ្លៃពិន័យបង់យឺត</div>
                  <div className="text-sm font-bold text-blue-800">${printReportClosing.lateFees.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <div className="text-rose-800 font-sans text-[11px]">ចំណាយសរុបប្រចាំឆ្នាំ</div>
                  <div className="text-sm font-bold text-rose-800">${printReportClosing.totalExpenses.toFixed(2)}</div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between font-mono">
                <div>
                  <div className="font-bold font-sans text-purple-900 text-sm">ចំណេញសុទ្ធ & ភាគលាភសរុប</div>
                  <div className="text-[10px] text-purple-700 font-sans">Net Profit & Total Dividend Pool</div>
                </div>
                <div className="text-xl font-extrabold text-purple-900">
                  ${printReportClosing.totalDividends.toFixed(2)}
                </div>
              </div>

              {printReportClosing.notes && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <div className="font-bold mb-0.5">កំណត់សម្គាល់ ៖</div>
                  <p className="text-slate-600">{printReportClosing.notes}</p>
                </div>
              )}

              {/* Signature Section */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center font-bold">
                <div>
                  <p className="text-slate-600 mb-12">បេឡាធិការសមាគម</p>
                  <p className="text-slate-900">(ហត្ថលេខា និងឈ្មោះ)</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-12">ប្រធានសមាគម ឌឹ បេស៍ ក្លឹប</p>
                  <p className="text-slate-900">(ហត្ថលេខា និងត្រា)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
