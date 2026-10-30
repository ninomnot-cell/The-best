import React from 'react';
import { LoanPayment, Loan } from '../types';
import { Printer, X, CheckCircle2, Building2, Phone, Calendar, Hash, FileText } from 'lucide-react';

interface PrintReceiptModalProps {
  payment: LoanPayment | null;
  loan: Loan | null;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  payment,
  loan,
  onClose,
}) => {
  if (!payment || !loan) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
        {/* Action Header (No print) */}
        <div className="no-print flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>វិក្កយបត្របង់ប្រាក់ផ្លូវការ (Official Repayment Receipt)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#00609C] hover:bg-[#004f80] text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពវិក្កយបត្រ (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT CONTAINER */}
        <div className="printable-receipt border border-slate-300 rounded-xl p-6 bg-white space-y-6 text-slate-800">
          {/* Receipt Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/aistudio/THE_BEST_LOGO2_e1c656fe.png" 
                alt="The Best Family Club Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-[#00609C] tracking-tight">
                  ឌឹ បេស៍ ហ្វាមីលី ក្លឹប
                </h1>
                <p className="text-xs font-bold text-[#F15A24] uppercase tracking-wider">
                  The Best Family Club
                </p>
                <p className="text-[11px] text-slate-500">
                  រាជធានីភ្នំពេញ · ទូរស័ព្ទ៖ 012 889 901 / 098 776 543
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-1">
                បង្កាន់ដៃទទួលប្រាក់ / RECEIPT
              </div>
              <div className="font-mono text-xs font-bold text-slate-900">
                លេខវិក្កយបត្រ៖ <span className="text-[#00609C]">{payment.receiptNumber}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                កាលបរិច្ឆេទ៖ {payment.paymentDate}
              </div>
            </div>
          </div>

          {/* Borrower & Loan Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <div><span className="text-slate-500">ឈ្មោះអ្នកខ្ចី (Borrower)៖</span> <strong className="text-slate-900 font-bold">{loan.borrowerName}</strong></div>
              <div><span className="text-slate-500">លេខទូរស័ព្ទ (Phone)៖</span> <span className="font-mono font-semibold">{loan.borrowerPhone}</span></div>
              <div><span className="text-slate-500">អត្តសញ្ញាណប័ណ្ណ (ID Card)៖</span> <span className="font-mono">{loan.borrowerIdCard}</span></div>
            </div>
            <div className="space-y-1 text-right">
              <div><span className="text-slate-500">លេខកូដកម្ចី (Loan Code)៖</span> <strong className="font-mono text-[#00609C]">{loan.loanCode}</strong></div>
              <div><span className="text-slate-500">លើកទីនៃការបង់ (Installment)៖</span> <strong className="font-mono">លើកទី {payment.installmentNumber || 1} / {loan.termMonths}</strong></div>
              <div><span className="text-slate-500">វិធីសាស្ត្របង់ (Method)៖</span> <strong className="font-mono uppercase text-emerald-700">{payment.paymentMethod}</strong></div>
            </div>
          </div>

          {/* Payment Breakdown Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800 text-white font-bold">
                <tr>
                  <th className="py-2.5 px-3">បរិយាយ / Description</th>
                  <th className="py-2.5 px-3 text-right">ចំនួនទឹកប្រាក់ / Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3">
                    ប្រាក់ដើមត្រូវបង់សង (Principal Paid - Installment #{payment.installmentNumber || 1})
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    ${payment.principalPaid.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">
                    ការប្រាក់ប្រចាំខែ (Interest Paid - {loan.monthlyInterestRate}%)
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                    ${payment.interestPaid.toFixed(2)}
                  </td>
                </tr>
                {payment.lateFee > 0 && (
                  <tr className="bg-amber-50/50">
                    <td className="py-2 px-3 text-amber-900">
                      ថ្លៃពិន័យបង់យឺតយ៉ាវ (Late Penalty Fee)
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-amber-900">
                      ${payment.lateFee.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-800">
                  <td className="py-2.5 px-3 text-slate-900">
                    សរុបទឹកប្រាក់បានទទួលបានស្តែង (TOTAL AMOUNT RECEIVED)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-base text-[#00609C]">
                    ${payment.amountPaid.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes & Recorded By */}
          <div className="flex items-start justify-between text-xs pt-2">
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold block">កំណត់សម្គាល់ (Notes) ៖</span>
              <p className="text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-200 min-w-48">
                {payment.notes || 'គ្មានកំណត់សម្គាល់'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">អ្នកកត់ត្រាទទួលប្រាក់ (Recorded By) ៖</span>
              <span className="font-bold text-slate-900 font-mono text-xs block mt-0.5">{payment.recordedBy}</span>
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-8 grid grid-cols-2 text-center text-xs">
            <div>
              <p className="font-bold text-slate-800">ហត្ថលេខាអ្នកបង់ប្រាក់</p>
              <p className="text-[10px] text-slate-400 font-khmer mt-1">Borrower's Signature</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900">{loan.borrowerName}</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">ហត្ថលេខា និងត្រាបេឡាក្លឹប</p>
              <p className="text-[10px] text-slate-400 font-khmer mt-1">Cashier & Club Stamp</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] border border-dashed border-emerald-500 text-emerald-700 px-3 py-1 rounded uppercase font-mono tracking-widest font-bold">
                  [ បានទទួលប្រាក់រួច - PAID ]
                </span>
              </div>
              <p className="font-bold text-slate-900">{payment.recordedBy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
