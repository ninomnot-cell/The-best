import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Loan, BorrowerType, LoanStatus, LoanPayment } from '../types';
import { 
  HandCoins, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  Bell, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  UserMinus,
  ArrowRight,
  Download,
  DollarSign,
  History,
  Trash2,
  Printer,
  X,
  Receipt
} from 'lucide-react';
import { LoanScheduleModal } from './LoanScheduleModal';
import { LoanContractModal } from './LoanContractModal';
import { exportLoansToCSV } from '../utils/exportCsv';

export const LoansManager: React.FC = () => {
  const { 
    loans, 
    members,
    payments,
    setCurrentTab, 
    selectedLoanForSchedule, 
    setSelectedLoanForSchedule,
    selectedLoanForContract,
    setSelectedLoanForContract,
    setIsRepaymentModalOpen,
    setPreselectedLoanForRepayment,
    setSelectedReceiptForPrint,
    voidLoanPayment
  } = useClub();

  const [borrowerFilter, setBorrowerFilter] = useState<'ALL' | 'MEMBER' | 'EXTERNAL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LoanStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment History Modal state
  const [selectedLoanForHistory, setSelectedLoanForHistory] = useState<Loan | null>(null);
  const [voidingPaymentId, setVoidingPaymentId] = useState<string | null>(null);
  const [isVoiding, setIsVoiding] = useState<boolean>(false);

  const filteredLoans = loans.filter(loan => {
    const matchesBorrower = borrowerFilter === 'ALL' || loan.borrowerType === borrowerFilter;
    const matchesStatus = statusFilter === 'ALL' || loan.status === statusFilter;
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loan.loanCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loan.borrowerPhone.includes(searchQuery);
    return matchesBorrower && matchesStatus && matchesSearch;
  });

  const totalPrincipal = loans.reduce((sum, l) => sum + l.principalAmount, 0);
  const totalRemaining = loans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const totalInterestCollected = loans.reduce((sum, l) => sum + l.totalPaidInterest, 0);

  const handleVoidPayment = async (payment: LoanPayment) => {
    const confirmMsg = `តើអ្នកប្រាកដជាចង់មោឃភាព (Void) ការបង់ប្រាក់លេខវិក្កយបត្រ "${payment.receiptNumber}" នេះមែនទេ? \n\nប្រាក់ដែលបានបង់ដើម $${payment.principalPaid} និងការប្រាក់ $${payment.interestPaid} នឹងត្រូវបង្វិលចូលសមតុល្យជំពាក់ដើមវិញ ហើយស្ថានភាពកាលវិភាគបង់ប្រាក់លើកទី #${payment.installmentNumber} នឹងត្រូវស្តារឡើងវិញទៅ 'រង់ចាំបង់'។`;
    
    if (!window.confirm(confirmMsg)) return;

    setVoidingPaymentId(payment.id);
    setIsVoiding(true);

    try {
      const success = await voidLoanPayment(payment.id);
      if (success) {
        alert(`បានមោឃភាពការបង់ប្រាក់លេខវិក្កយបត្រ ${payment.receiptNumber} ដោយជោគជ័យ!`);
      }
    } catch (err: any) {
      alert(`បរាជ័យក្នុងការមោឃភាព៖ ${err.message}`);
    } finally {
      setIsVoiding(false);
      setVoidingPaymentId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-[#F15A24]" />
            <span>គ្រប់គ្រងកម្ចី & តារាងបង់ប្រាក់ (Loans Management)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            បែងចែកកម្ចីសមាជិកក្នុងសមាគម (ការប្រាក់ទាប) និងកម្ចីអ្នកក្រៅសមាគម (បង់រំលស់ដើម+ការប្រាក់)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportLoansToCSV(filteredLoans, members)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-xs cursor-pointer"
            title="ទាញយកបញ្ជីកម្ចីជា CSV (Excel)"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>ទាញយក CSV</span>
          </button>

          <button
            onClick={() => {
              setPreselectedLoanForRepayment(null);
              setIsRepaymentModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            <DollarSign className="w-4 h-4" />
            <span>កត់ត្រាការបង់ប្រាក់</span>
          </button>

          <button
            onClick={() => setCurrentTab('applications')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#F15A24] hover:bg-[#d94814] rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>បង្កើតពាក្យស្នើសុំកម្ចីថ្មី</span>
          </button>
        </div>
      </div>

      {/* Top Financial Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">ទំហំប្រាក់កម្ចីបញ្ចេញសរុប</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            ${totalPrincipal.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            សរុប {loans.length} កិច្ចសន្យាកម្ចី
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">សមតុល្យដើមនៅជំពាក់ (Outstanding)</div>
          <div className="text-xl font-bold text-[#F15A24] font-mono tabular-nums mt-1">
            ${totalRemaining.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            កំពុងដំណើរការសងប្រចាំខែ
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">ការប្រាក់ប្រមូលបានសរុប</div>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            +${totalInterestCollected.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            បញ្ចូលក្នុងមូលនិធិភាគលាភ
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Segmented control for borrower type */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setBorrowerFilter('ALL')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
                borrowerFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              កម្ចីទាំងអស់ ({loans.length})
            </button>
            <button
              onClick={() => setBorrowerFilter('MEMBER')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                borrowerFilter === 'MEMBER' ? 'bg-white text-[#00609C] font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>សមាជិកក្នុង ({loans.filter(l => l.borrowerType === 'MEMBER').length})</span>
            </button>
            <button
              onClick={() => setBorrowerFilter('EXTERNAL')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                borrowerFilter === 'EXTERNAL' ? 'bg-white text-[#F15A24] font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserMinus className="w-3.5 h-3.5" />
              <span>អ្នកក្រៅសមាគម ({loans.filter(l => l.borrowerType === 'EXTERNAL').length})</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ ឬកូដកម្ចី..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
            />
          </div>
        </div>

        {/* Comparison Notice banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">លក្ខខណ្ឌកម្ចី៖</span>
            <span>• សមាជិកក្នុង៖ អត្រា <strong className="text-slate-800 font-mono">1.2%/ខែ</strong> ធានាដោយប្រាក់សន្សំក្នុងក្លឹប</span>
            <span>• អ្នកក្រៅសមាគម៖ អត្រា <strong className="text-slate-800 font-mono">2.5%/ខែ</strong> បង់រំលស់ដើម+ការប្រាក់ មានទ្រព្យធានាបញ្ចាំ</span>
          </div>
        </div>
      </div>

      {/* Main Loans Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-3.5 font-semibold">កូដកម្ចី</th>
                <th className="py-3 px-3 font-semibold">អ្នកខ្ចីប្រាក់</th>
                <th className="py-3 px-3 font-semibold">ប្រភេទ</th>
                <th className="py-3 px-3 font-semibold text-right">ដើមខ្ចី ($)</th>
                <th className="py-3 px-3 font-semibold text-center">ការប្រាក់</th>
                <th className="py-3 px-3 font-semibold text-center">រយៈពេល</th>
                <th className="py-3 px-3 font-semibold text-right">បានសងរួច</th>
                <th className="py-3 px-3 font-semibold text-right">នៅជំពាក់</th>
                <th className="py-3 px-3 font-semibold text-center">ស្ថានភាព</th>
                <th className="py-3 px-3 font-semibold text-right">ឯកសារ & សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-slate-500">
                    មិនមានកម្ចីណាមួយត្រូវតាមលក្ខខណ្ឌស្វែងរកនេះឡើយ
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3.5 font-mono font-medium text-[#00609C]">
                      {loan.loanCode}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{loan.borrowerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{loan.borrowerPhone}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        loan.borrowerType === 'MEMBER'
                          ? 'bg-blue-50 text-[#00609C]'
                          : 'bg-orange-50 text-[#F15A24]'
                      }`}>
                        {loan.borrowerType === 'MEMBER' ? 'សមាជិកក្នុង' : 'អ្នកក្រៅ'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono tabular-nums">
                      ${loan.principalAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="font-mono font-bold text-[#00609C]">
                        {loan.monthlyInterestRate}% /ខែ
                      </div>
                      <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded mt-0.5 ${
                        loan.interestMethod === 'FLAT'
                          ? 'bg-blue-50 text-blue-700'
                          : loan.interestMethod === 'INTEREST_ONLY'
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {loan.interestMethod === 'FLAT' 
                          ? 'ការប្រាក់ថេរ' 
                          : loan.interestMethod === 'INTEREST_ONLY' 
                          ? 'បង់តែការប្រាក់' 
                          : 'ការប្រាក់ថយចុះ'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center text-slate-600 font-mono">
                      {loan.termMonths} ខែ
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-emerald-700 tabular-nums">
                      ${loan.totalPaidPrincipal.toLocaleString()}
                      <div className="text-[10px] text-emerald-600">
                        +${loan.totalPaidInterest} ការប្រាក់
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-rose-600 font-mono tabular-nums">
                      ${loan.remainingBalance.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        loan.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : loan.status === 'OVERDUE'
                          ? 'bg-rose-100 text-rose-800'
                          : loan.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {loan.status === 'ACTIVE' ? 'កំពុងដំណើរការ' : loan.status === 'OVERDUE' ? 'ហួសកំណត់' : 'សងចប់'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {loan.status !== 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setPreselectedLoanForRepayment({ loanId: loan.id });
                              setIsRepaymentModalOpen(true);
                            }}
                            title="កត់ត្រាការបង់ប្រាក់កម្ចី"
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span>បង់ប្រាក់</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedLoanForHistory(loan)}
                          title="មើលប្រវត្តិការបង់ប្រាក់"
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5 text-slate-600" />
                          <span>ប្រវត្តិ</span>
                        </button>

                        <button
                          onClick={() => setSelectedLoanForSchedule(loan)}
                          title="មើលតារាងបង់ប្រាក់ប្រចាំខែ"
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
                          <span>តារាង</span>
                        </button>

                        <button
                          onClick={() => setSelectedLoanForContract(loan)}
                          title="មើលកិច្ចសន្យាខ្ចីប្រាក់ផ្លូវការ"
                          className="px-2 py-1 text-[11px] font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>កិច្ចសន្យា</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Modal for a specific loan */}
      {selectedLoanForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00609C] flex items-center justify-center font-bold">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    ប្រវត្តិការបង់ប្រាក់កម្ចី (Payment History)
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    កូដកម្ចី៖ {selectedLoanForHistory.loanCode} · អ្នកខ្ចី៖ {selectedLoanForHistory.borrowerName} ({selectedLoanForHistory.borrowerPhone})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLoanForHistory(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Loan Payment History Table */}
            {(() => {
              const loanPayments = payments.filter(p => p.loanId === selectedLoanForHistory.id);
              if (loanPayments.length === 0) {
                return (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                    មិនទាន់មានប្រវត្តិបង់ប្រាក់សម្រាប់កម្ចីនេះនៅឡើយទេ។
                  </div>
                );
              }

              return (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">លេខវិក្កយបត្រ</th>
                        <th className="py-2.5 px-3 font-semibold">កាលបរិច្ឆេទ</th>
                        <th className="py-2.5 px-3 font-semibold text-center">លើកទី</th>
                        <th className="py-2.5 px-3 font-semibold text-right">ប្រាក់ដើម ($)</th>
                        <th className="py-2.5 px-3 font-semibold text-right">ការប្រាក់ ($)</th>
                        <th className="py-2.5 px-3 font-semibold text-right">ថ្លៃពិន័យ ($)</th>
                        <th className="py-2.5 px-3 font-semibold text-right">សរុបបានបង់ ($)</th>
                        <th className="py-2.5 px-3 font-semibold text-center">វិធីសាស្ត្រ</th>
                        <th className="py-2.5 px-3 font-semibold text-right">សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loanPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 font-mono">
                          <td className="py-2.5 px-3 font-bold text-[#00609C]">
                            {p.receiptNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800">
                            {p.paymentDate}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                            #{p.installmentNumber || 1}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-900">
                            ${p.principalPaid.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-700">
                            ${p.interestPaid.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-amber-800">
                            ${p.lateFee.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                            ${p.amountPaid.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedReceiptForPrint({ payment: p, loan: selectedLoanForHistory })}
                                title="មើលនិងបោះពុម្ពវិក្កយបត្រ"
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold cursor-pointer flex items-center gap-1"
                              >
                                <Printer className="w-3 h-3" />
                                <span>វិក្កយបត្រ</span>
                              </button>

                              <button
                                onClick={() => handleVoidPayment(p)}
                                disabled={isVoiding && voidingPaymentId === p.id}
                                title="មោឃភាពការបង់ប្រាក់នេះ (Void)"
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600" />
                                <span>មោឃភាព</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLoanForHistory(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                បិទផ្ទាំង
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amortization Schedule Modal */}
      {selectedLoanForSchedule && (
        <LoanScheduleModal
          loan={selectedLoanForSchedule}
          onClose={() => setSelectedLoanForSchedule(null)}
          onOpenContract={(loan) => {
            setSelectedLoanForSchedule(null);
            setSelectedLoanForContract(loan);
          }}
        />
      )}

      {/* Loan Contract Modal */}
      {selectedLoanForContract && (
        <LoanContractModal
          loan={selectedLoanForContract}
          onClose={() => setSelectedLoanForContract(null)}
        />
      )}
    </div>
  );
};

