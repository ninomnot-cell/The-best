import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Loan } from '../types';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt, 
  User, 
  Phone,
  Calendar,
  FileText
} from 'lucide-react';

interface LoanScheduleModalProps {
  loan: Loan;
  onClose: () => void;
  onOpenContract?: (loan: Loan) => void;
}

export const LoanScheduleModal: React.FC<LoanScheduleModalProps> = ({ 
  loan, 
  onClose,
  onOpenContract 
}) => {
  const { recordLoanRepayment } = useClub();
  const [payingInstallmentNum, setPayingInstallmentNum] = useState<number | null>(null);
  const [receiptNumber, setReceiptNumber] = useState(`RCT-${Math.floor(100000 + Math.random() * 900000)}`);
  const [paidDate, setPaidDate] = useState('2026-10-27');

  const handleConfirmPayment = (installmentNumber: number) => {
    recordLoanRepayment(loan.id, installmentNumber, receiptNumber);
    setPayingInstallmentNum(null);
    setReceiptNumber(`RCT-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const getMethodLabel = (method?: import('../types').InterestMethod) => {
    switch (method) {
      case 'FLAT':
        return 'វិធីសាស្ត្រការប្រាក់ថេរ';
      case 'DECLINING':
        return 'វិធីសាស្ត្រការប្រាក់ថយចុះ';
      case 'INTEREST_ONLY':
        return 'បង់តែការប្រាក់ & ដើមចុងគ្រា';
      default:
        return 'វិធីសាស្ត្រការប្រាក់ថយចុះ';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F15A24]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  តារាងកាលវិភាគបង់ប្រាក់កម្ចី (Amortization Schedule)
                </h2>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded font-mono ${
                  loan.borrowerType === 'MEMBER' 
                    ? 'bg-blue-100 text-[#00609C]' 
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {loan.borrowerType === 'MEMBER' ? 'កម្ចីសមាជិកក្នុង' : 'កម្ចីអ្នកក្រៅសមាគម'}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {getMethodLabel(loan.interestMethod)}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                លេខកូដកម្ចី: {loan.loanCode} · លេខកិច្ចសន្យា: {loan.contractNumber}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenContract && (
              <button
                onClick={() => onOpenContract(loan)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>មើលកិច្ចសន្យា</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>បោះពុម្ពតារាង (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Club Header */}
        <div className="hidden print:block text-center border-b border-slate-300 pb-4">
          <div className="text-lg font-bold text-[#00609C]">ឌឹ បេស៍ ហ្វាមីលី ក្លឹប / THE BEST FAMILY CLUB</div>
          <div className="text-sm font-semibold mt-1">
            តារាងកាលវិភាគបង់ប្រាក់កម្ចីប្រចាំខែ ({getMethodLabel(loan.interestMethod)})
          </div>
          <div className="text-xs text-slate-600">កាលបរិច្ឆេទបង្កើត: {loan.startDate} | លេខកិច្ចសន្យា: {loan.contractNumber}</div>
        </div>

        {/* Borrower & Loan Details Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-200">
          <div>
            <span className="text-slate-500 block">អ្នកខ្ចីប្រាក់៖</span>
            <span className="font-bold text-slate-900 text-sm">{loan.borrowerName}</span>
            <span className="text-slate-500 font-mono block">{loan.borrowerPhone}</span>
          </div>

          <div>
            <span className="text-slate-500 block">ចំនួនប្រាក់ដើមខ្ចី៖</span>
            <span className="font-bold text-[#00609C] font-mono text-sm tabular-nums">
              ${loan.principalAmount.toLocaleString()}
            </span>
            <span className="text-slate-500 block">
              ការប្រាក់: <span className="font-mono font-medium text-emerald-700">{loan.monthlyInterestRate}% /ខែ</span>
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">វិធីសាស្ត្រគណនា៖</span>
            <span className="font-bold text-slate-900 text-xs block">
              {getMethodLabel(loan.interestMethod)}
            </span>
            <span className="text-slate-500 font-mono block">
              {loan.termMonths} ខែ ({loan.startDate} ដល់ {loan.endDate})
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">សមតុល្យនៅជំពាក់៖</span>
            <span className="font-bold text-rose-600 font-mono text-sm tabular-nums">
              ${loan.remainingBalance.toLocaleString()}
            </span>
            <span className="text-slate-500 block">
              បានសងដើម: <span className="font-mono text-emerald-600">${loan.totalPaidPrincipal}</span>
            </span>
          </div>
        </div>

        {/* Repayment Schedule Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100/70 px-4 py-2.5 text-xs font-semibold text-slate-800 flex items-center justify-between border-b border-slate-200">
            <span>តារាងបង់ប្រាក់ប្រចាំខែទាំងដើមនិងការប្រាក់ (Monthly Installment Breakdown)</span>
            <span className="text-[11px] font-normal text-slate-500">
              សរុប {loan.schedule.length} លើក
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold text-center w-12">លើក</th>
                  <th className="py-2.5 px-3 font-semibold">កាលបរិច្ឆេទត្រូវបង់</th>
                  <th className="py-2.5 px-3 font-semibold text-right">សមតុល្យដើមគ្រា</th>
                  <th className="py-2.5 px-3 font-semibold text-right">ប្រាក់ដើម</th>
                  <th className="py-2.5 px-3 font-semibold text-right">ការប្រាក់</th>
                  <th className="py-2.5 px-3 font-semibold text-right font-bold text-slate-900">សរុបត្រូវបង់</th>
                  <th className="py-2.5 px-3 font-semibold text-right">សមតុល្យចុងគ្រា</th>
                  <th className="py-2.5 px-3 font-semibold text-center">ស្ថានភាព</th>
                  <th className="py-2.5 px-3 font-semibold text-right no-print">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loan.schedule.map((item) => (
                  <tr 
                    key={item.installmentNumber} 
                    className={`hover:bg-slate-50/70 ${
                      item.status === 'OVERDUE' ? 'bg-rose-50/40' : item.status === 'PAID' ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700 font-mono">
                      #{item.installmentNumber}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                      {item.dueDate}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                      ${item.beginningBalance.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 tabular-nums">
                      ${item.principal.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 tabular-nums">
                      ${item.interest.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${item.totalDue.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500 tabular-nums">
                      ${item.endingBalance.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'OVERDUE'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status === 'PAID' ? 'បានបង់រួច' : item.status === 'OVERDUE' ? 'ហួសកំណត់' : 'រង់ចាំបង់'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right no-print">
                      {item.status === 'PAID' ? (
                        <span className="text-[10px] text-slate-500 font-mono">
                          បង់: {item.paidDate} ({item.receiptNumber})
                        </span>
                      ) : (
                        <button
                          onClick={() => setPayingInstallmentNum(item.installmentNumber)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors cursor-pointer"
                        >
                          កត់ត្រាបានបង់
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Recording Single Installment Payment */}
        {payingInstallmentNum !== null && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
            <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-300">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>កត់ត្រាការបង់កម្ចីលើកទី #{payingInstallmentNum}</span>
                </h3>
                <button
                  onClick={() => setPayingInstallmentNum(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">លេខកូដបង្កាន់ដៃបង់ប្រាក់ (Receipt No.)</label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-[#00609C]"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">កាលបរិច្ឆេទជាក់ស្តែង</label>
                  <input
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#00609C]"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-600">
                  ប្រាក់ដើមនិងការប្រាក់នឹងត្រូវកត់ត្រាចូលបេឡាសមាគម និងកាត់បន្ថយសមតុល្យជំពាក់របស់ {loan.borrowerName}។
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setPayingInstallmentNum(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded font-medium cursor-pointer"
                  >
                    បោះបង់
                  </button>
                  <button
                    onClick={() => handleConfirmPayment(payingInstallmentNum)}
                    className="px-3 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded font-semibold cursor-pointer"
                  >
                    បញ្ជាក់ការទទួលប្រាក់
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer info for print */}
        <div className="hidden print:grid grid-cols-3 gap-6 pt-12 text-center text-xs">
          <div>
            <div className="font-semibold text-slate-800">អ្នកខ្ចីប្រាក់ (Borrower)</div>
            <div className="mt-16 text-slate-700 font-bold">{loan.borrowerName}</div>
          </div>
          <div>
            <div className="font-semibold text-slate-800">អ្នកធានា (Guarantor)</div>
            <div className="mt-16 text-slate-700 font-bold">{loan.guarantorName || 'N/A'}</div>
          </div>
          <div>
            <div className="font-semibold text-slate-800">តំណាងក្លឹប The Best Club</div>
            <div className="mt-16 text-slate-700 font-bold">{loan.approvedBy || 'គណៈកម្មការ'}</div>
          </div>
        </div>

        <div className="flex justify-end pt-2 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            បិទផ្ទាំង
          </button>
        </div>
      </div>
    </div>
  );
};
