import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import { MemberExit, PaymentMethod } from '../types';
import { 
  UserMinus, 
  DollarSign, 
  Printer, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  History, 
  Loader2,
  FileCheck2,
  ShieldAlert
} from 'lucide-react';

export const MemberExitPage: React.FC = () => {
  const { 
    members, 
    loans, 
    memberExits, 
    exitMember, 
    isOfficer, 
    clubSettings 
  } = useClub();

  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [exitDate, setExitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payoutMethod, setPayoutMethod] = useState<PaymentMethod>('ABA_PAY');
  const [notes, setNotes] = useState<string>('');
  const [hasWrittenDebtNote, setHasWrittenDebtNote] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Printable Exit Receipt State
  const [activePrintExit, setActivePrintExit] = useState<MemberExit | null>(null);

  // Active members who can exit (Excludes President, Treasurer, and already LEFT members)
  const eligibleMembers = useMemo(() => {
    return members.filter(m => 
      m.status === 'ACTIVE' && 
      m.role !== 'ប្រធានក្លឹប' && 
      m.role !== 'បេឡាធិការ'
    );
  }, [members]);

  const selectedMember = useMemo(() => {
    return members.find(m => m.id === selectedMemberId) || null;
  }, [members, selectedMemberId]);

  // Calculations for selected member
  const savingsAtExit = selectedMember ? selectedMember.totalSavings : 0;
  const dividendsAtExit = selectedMember ? selectedMember.totalDividendsEarned : 0;

  const activeLoans = useMemo(() => {
    if (!selectedMemberId) return [];
    return loans.filter(l => l.borrowerId === selectedMemberId && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));
  }, [loans, selectedMemberId]);

  const loanDeduction = useMemo(() => {
    return activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
  }, [activeLoans]);

  const payoutAmount = savingsAtExit + dividendsAtExit - loanDeduction;
  const isNegative = payoutAmount < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedMemberId) {
      setErrorMessage('សូមជ្រើសរើសសមាជិកដែលត្រូវចាកចេញ!');
      return;
    }

    if (isNegative && !hasWrittenDebtNote) {
      setErrorMessage('ទឹកប្រាក់ទូទាត់អវិជ្ជមាន! ត្រូវតែគ្រីកទទួលស្គាល់លិខិតជំពាក់បំណុលជាលាយលក្ខណ៍អក្សរ។');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await exitMember(selectedMemberId, {
        exitDate,
        payoutMethod,
        notes: notes.trim() || undefined,
        hasWrittenDebtNote
      });

      if (res.success && res.exitRecord) {
        setActivePrintExit(res.exitRecord);
        setSelectedMemberId('');
        setNotes('');
        setHasWrittenDebtNote(false);
      } else {
        setErrorMessage(res.error || 'បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពសមាជិកចាកចេញ');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'មានបញ្ហាក្នុងការទូទាត់សមាជិកចាកចេញ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <UserMinus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              សមាជិកចាកចេញ & ទូទាត់ភាគលាភ (Member Exit & Settlement)
            </h1>
            <p className="text-xs text-slate-500">
              គណនាប្រាក់សន្សំ បូកភាគលាភ ដកបំណុលកម្ចីដែលនៅខ្វះ និងចេញលិខិតទូទាត់ចាកចេញ
            </p>
          </div>
        </div>

        {!isOfficer && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>របៀបមើលរំលង (Read-Only)</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Exit Form */}
      {isOfficer && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 text-xs">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <UserMinus className="w-4 h-4 text-[#00609C]" />
            <span>ទម្រង់រៀបចំទូទាត់សមាជិកចាកចេញ (Exit Form)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ជ្រើសរើសសមាជិកចាកចេញ *
              </label>
              <select
                required
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C] font-semibold"
              >
                <option value="">-- ជ្រើសរើសសមាជិក --</option>
                {eligibleMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nameKhmer} ({m.memberCode})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                ប្រធាន និងបេឡាធិការ ត្រូវប្តូរមុខតំណែងមុននឹងចាកចេញ
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                កាលបរិច្ឆេទចាកចេញ *
              </label>
              <input
                type="date"
                required
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-[#00609C]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                វិធីសាស្ត្រទូទាត់ប្រាក់
              </label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C]"
              >
                <option value="ABA_PAY">ABA PAY (ផ្ទេរតាមធនាគារ)</option>
                <option value="CASH">ប្រាក់សុទ្ធ (Cash)</option>
                <option value="WING">Wing (វីង)</option>
              </select>
            </div>
          </div>

          {/* Breakdown Cards */}
          {selectedMember && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 font-mono">
              <div className="text-xs font-bold font-sans text-slate-800 pb-2 border-b border-slate-200">
                ការគណនាទូទាត់សម្រាប់: <span className="text-[#00609C] font-extrabold">{selectedMember.nameKhmer}</span> ({selectedMember.memberCode})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-sans">1. ប្រាក់សន្សំសរុប (Savings)</div>
                  <div className="text-base font-bold text-slate-900">${savingsAtExit.toFixed(2)}</div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="text-[10px] text-emerald-700 font-sans">2. ភាគលាភបង្កើនបាន (Dividends)</div>
                  <div className="text-base font-bold text-emerald-700">+${dividendsAtExit.toFixed(2)}</div>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <div className="text-[10px] text-rose-700 font-sans">3. កាត់កម្ចីនៅខ្វះ (Loan Balance)</div>
                  <div className="text-base font-bold text-rose-700">-${loanDeduction.toFixed(2)}</div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 font-mono ${
                isNegative ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
                <div>
                  <div className="font-bold text-sm font-sans">
                    {isNegative ? 'សមាជិកនៅជំពាក់បំណុលសមាគម (Net Owed to Club)' : 'ប្រាក់សរុបត្រូវទូទាត់ជូនសមាជិក (Net Payout Amount)'}
                  </div>
                  <div className="text-[10px] font-sans opacity-80">
                    រូបមន្ត: ប្រាក់សន្សំ (${savingsAtExit}) + ភាគលាភ (${dividendsAtExit}) - បំណុលកម្ចី (${loanDeduction})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold">
                    ${payoutAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Debt Note Checkbox if Negative */}
              {isNegative && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2">
                  <p className="font-bold font-sans">⚠️ ទឹកប្រាក់ទូទាត់អវិជ្ជមាន (${payoutAmount.toFixed(2)}) ៖</p>
                  <label className="flex items-start gap-2 font-sans cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasWrittenDebtNote}
                      onChange={(e) => setHasWrittenDebtNote(e.target.checked)}
                      className="mt-0.5 rounded text-[#00609C] focus:ring-[#00609C]"
                    />
                    <span>
                      បានទទួលស្គាល់ និងមានលិខិតកិច្ចសន្យាទទួលស្គាល់បំណុលជាលាយលក្ខណ៍អក្សរពីសមាជិកចាកចេញរួចរាល់ហើយ
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              កំណត់សម្គាល់ការចាកចេញ (Notes)
            </label>
            <textarea
              rows={2}
              placeholder="ឧ. សមាជិកសុំចាកចេញដោយសារផ្លាស់ប្តូរអាសយដ្ឋានរស់នៅ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C]"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting || !selectedMemberId || (isNegative && !hasWrittenDebtNote)}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-white bg-amber-600 hover:bg-amber-700 rounded-xl font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>កំពុងទូទាត់...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>រក្សាទុក & ចេញលិខិតទូទាត់ចាកចេញ</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Exit History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-[#00609C]" />
          <span>ប្រវត្តិសមាជិកចាកចេញ (Exit History Records)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">លេខវិក្កយបត្រ</th>
                <th className="py-2.5 px-3">ឈ្មោះសមាជិក</th>
                <th className="py-2.5 px-3">កាលបរិច្ឆេទ</th>
                <th className="py-2.5 px-3 text-right">ប្រាក់សន្សំ</th>
                <th className="py-2.5 px-3 text-right">ភាគលាភ</th>
                <th className="py-2.5 px-3 text-right">កាត់កម្ចី</th>
                <th className="py-2.5 px-3 text-right">ទឹកប្រាក់ទូទាត់</th>
                <th className="py-2.5 px-3 text-center">លិខិត</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberExits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    មិនទាន់មានប្រវត្តិសមាជិកចាកចេញនៅឡើយទេ
                  </td>
                </tr>
              ) : (
                memberExits.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {ex.receiptNumber}
                    </td>

                    <td className="py-2.5 px-3 font-sans font-bold text-[#00609C] whitespace-nowrap">
                      {ex.memberName}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {ex.exitDate}
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-700 whitespace-nowrap">
                      ${ex.savingsAtExit.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-right text-emerald-700 whitespace-nowrap">
                      ${ex.dividendsAtExit.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-right text-rose-700 whitespace-nowrap">
                      ${ex.loanDeduction.toFixed(2)}
                    </td>

                    <td className={`py-2.5 px-3 text-right font-extrabold whitespace-nowrap ${
                      ex.payoutAmount >= 0 ? 'text-amber-800' : 'text-rose-600'
                    }`}>
                      ${ex.payoutAmount.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setActivePrintExit(ex)}
                        className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                        title="បោះពុម្ពលិខិតទូទាត់"
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

      {/* Printable Exit Receipt Modal */}
      {activePrintExit && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6 border border-slate-200 print-modal-content">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <div className="font-bold text-sm text-slate-900">
                លិខិតទូទាត់សមាជិកចាកចេញ #{activePrintExit.receiptNumber}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#00609C] hover:bg-[#004f80] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>បោះពុម្ពលិខិត (Print)</span>
                </button>
                <button
                  onClick={() => setActivePrintExit(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Printable Body */}
            <div className="space-y-5 text-xs text-slate-900">
              <div className="text-center space-y-1 border-b pb-4 border-slate-200">
                <div className="font-bold text-base text-[#00609C]">
                  {clubSettings.clubNameKhmer}
                </div>
                <div className="font-extrabold text-sm text-amber-900">
                  លិខិតទូទាត់ប្រាក់សន្សំ និងចាកចេញពីសមាគម (MEMBER EXIT RECEIPT)
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  លេខវិក្កយបត្រ: {activePrintExit.receiptNumber} · កាលបរិច្ឆេទ: {activePrintExit.exitDate}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 font-sans">
                <div>
                  <span className="text-slate-500">ឈ្មោះសមាជិក:</span>
                  <span className="font-bold ml-2">{activePrintExit.memberName}</span>
                </div>
                <div>
                  <span className="text-slate-500">អ្នករៀបចំទូទាត់:</span>
                  <span className="font-bold ml-2 font-mono">{activePrintExit.paidBy}</span>
                </div>
              </div>

              {/* Table Breakdown */}
              <div className="border rounded-xl overflow-hidden font-mono">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 font-sans text-slate-600 font-bold border-b">
                    <tr>
                      <th className="py-2 px-3">រៀបរាប់</th>
                      <th className="py-2 px-3 text-right">ចំនួនទឹកប្រាក់</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-3">1. ប្រាក់សន្សំប្រចាំខែសរុប (Total Savings)</td>
                      <td className="py-2 px-3 text-right font-bold">${activePrintExit.savingsAtExit.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">2. ភាគលាភបង្កើនបាន (Dividends Earned)</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">+${activePrintExit.dividendsAtExit.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">3. កាត់កម្ចីដែលនៅខ្វះ (Outstanding Loan Balance)</td>
                      <td className="py-2 px-3 text-right font-bold text-rose-700">-${activePrintExit.loanDeduction.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-amber-50/70 font-extrabold">
                      <td className="py-2.5 px-3 font-sans text-amber-900">ទឹកប្រាក់សរុបដែលបានទូទាត់ (Net Payout)</td>
                      <td className="py-2.5 px-3 text-right text-amber-900 text-sm">${activePrintExit.payoutAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {activePrintExit.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                  <strong>កំណត់សម្គាល់:</strong> {activePrintExit.notes}
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center font-bold">
                <div>
                  <p className="text-slate-600 mb-12">សមាជិកសុំចាកចេញ</p>
                  <p className="text-slate-900">(ហត្ថលេខា និងឈ្មោះ)</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-12">ប្រធាន/បេឡាធិការសមាគម</p>
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
