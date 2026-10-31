import React, { useState, useEffect, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  X, 
  Search, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  User,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { PaymentMethod, RepaymentScheduleItem } from '../types';

export const RecordRepaymentModal: React.FC = () => {
  const { 
    loans, 
    payments,
    isRepaymentModalOpen, 
    setIsRepaymentModalOpen, 
    preselectedLoanForRepayment,
    setPreselectedLoanForRepayment,
    recordLoanPaymentTransaction,
    supabaseUser,
    currentUser,
    clubSettings
  } = useClub();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState<number>(1);
  const [paymentDate, setPaymentDate] = useState<string>('2026-10-29'); // Today
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [lateFee, setLateFee] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ABA_PAY');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Auto-generate unique receipt number format: RC-YYYYMMDD-001
  const generateReceiptNumber = () => {
    const todayStr = '20261029';
    const count = (payments ? payments.length : 0) + 1;
    return `RC-${todayStr}-${String(count).padStart(3, '0')}`;
  };

  // Preselect or reset state when modal opens
  useEffect(() => {
    if (isRepaymentModalOpen) {
      setErrorMessage('');
      const autoReceipt = generateReceiptNumber();
      setReceiptNumber(autoReceipt);

      // Active or overdue loans
      const activeLoans = loans.filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE');

      if (preselectedLoanForRepayment?.loanId) {
        setSelectedLoanId(preselectedLoanForRepayment.loanId);
        const targetLoan = loans.find(l => l.id === preselectedLoanForRepayment.loanId);
        if (targetLoan) {
          const instNum = preselectedLoanForRepayment.installmentNumber || 
            (targetLoan.schedule.find(s => s.status !== 'PAID')?.installmentNumber || 1);
          
          setSelectedInstallmentNumber(instNum);
          const inst = targetLoan.schedule.find(s => s.installmentNumber === instNum);
          if (inst) {
            setAmountPaid(String(inst.totalDue));
          }
        }
      } else if (activeLoans.length > 0) {
        const firstLoan = activeLoans[0];
        setSelectedLoanId(firstLoan.id);
        const firstUnpaidInst = firstLoan.schedule.find(s => s.status !== 'PAID')?.installmentNumber || 1;
        setSelectedInstallmentNumber(firstUnpaidInst);
        const inst = firstLoan.schedule.find(s => s.installmentNumber === firstUnpaidInst);
        if (inst) {
          setAmountPaid(String(inst.totalDue));
        }
      }
    }
  }, [isRepaymentModalOpen, preselectedLoanForRepayment, loans]);

  // Selected Loan Object
  const selectedLoan = useMemo(() => {
    return loans.find(l => l.id === selectedLoanId) || null;
  }, [loans, selectedLoanId]);

  // Available Unpaid Installments for Selected Loan
  const availableInstallments = useMemo(() => {
    if (!selectedLoan) return [];
    return selectedLoan.schedule;
  }, [selectedLoan]);

  // Selected Installment Object
  const selectedInstallment = useMemo(() => {
    if (!selectedLoan) return null;
    return selectedLoan.schedule.find(s => s.installmentNumber === selectedInstallmentNumber) || null;
  }, [selectedLoan, selectedInstallmentNumber]);

  // Calculate Automatic Late Fee based on clubSettings
  const calculatedLateFee = useMemo(() => {
    if (!selectedInstallment || selectedInstallment.status === 'PAID') return 0;
    const today = new Date(paymentDate || '2026-10-29');
    const due = new Date(selectedInstallment.dueDate);
    const diffDays = Math.ceil((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
    const grace = clubSettings.graceDays || 0;
    if (diffDays <= grace) return 0;

    const daysLate = diffDays;
    const feeType = clubSettings.lateFeeType || 'NONE';
    const feeVal = clubSettings.lateFeeValue || 0;

    if (feeType === 'FLAT') return feeVal;
    if (feeType === 'PERCENT_PER_DAY') return Math.round(selectedInstallment.totalDue * (feeVal / 100) * daysLate * 100) / 100;
    if (feeType === 'PERCENT_PER_MONTH') return Math.round(selectedInstallment.totalDue * (feeVal / 100) * (daysLate / 30) * 100) / 100;
    return 0;
  }, [selectedInstallment, paymentDate, clubSettings]);

  useEffect(() => {
    setLateFee(String(calculatedLateFee));
  }, [calculatedLateFee]);

  // When selected loan changes, auto-select oldest unpaid installment
  const handleLoanChange = (loanId: string) => {
    setSelectedLoanId(loanId);
    setErrorMessage('');
    const target = loans.find(l => l.id === loanId);
    if (target) {
      const unpaidInst = target.schedule.find(s => s.status !== 'PAID')?.installmentNumber || 1;
      setSelectedInstallmentNumber(unpaidInst);
      const inst = target.schedule.find(s => s.installmentNumber === unpaidInst);
      if (inst) {
        setAmountPaid(String(inst.totalDue));
      }
    }
  };

  // When selected installment changes, set default amount
  const handleInstallmentChange = (instNum: number) => {
    setSelectedInstallmentNumber(instNum);
    setErrorMessage('');
    if (selectedLoan) {
      const inst = selectedLoan.schedule.find(s => s.installmentNumber === instNum);
      if (inst) {
        setAmountPaid(String(inst.totalDue));
      }
    }
  };

  // Filtered loans list for dropdown search
  const filteredLoans = useMemo(() => {
    if (!searchTerm.trim()) {
      return loans.filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE');
    }
    const term = searchTerm.toLowerCase();
    return loans.filter(l => 
      l.loanCode.toLowerCase().includes(term) || 
      l.borrowerName.toLowerCase().includes(term) ||
      l.borrowerPhone.includes(term)
    );
  }, [loans, searchTerm]);

  if (!isRepaymentModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedLoan) {
      setErrorMessage('សូមជ្រើសរើសកម្ចីដែលត្រូវបង់សង');
      return;
    }

    if (!selectedInstallment) {
      setErrorMessage('សូមជ្រើសរើសលើកទីនៃការបង់សង');
      return;
    }

    if (selectedInstallment.status === 'PAID') {
      setErrorMessage(`លើកទី ${selectedInstallment.installmentNumber} នេះត្រូវបានបង់ប្រាក់រួចរាល់ហើយ! មិនអាចបង់ស្ទួនបានទេ។`);
      return;
    }

    const payVal = parseFloat(amountPaid);
    if (isNaN(payVal) || payVal <= 0) {
      setErrorMessage('ចំនួនទឹកប្រាក់បង់ត្រូវតែធំជាង 0');
      return;
    }

    const receiptClean = receiptNumber.trim();
    if (!receiptClean) {
      setErrorMessage('សូមបញ្ចូលលេខវិក្កយបត្រទទួលប្រាក់');
      return;
    }

    // Check duplicate receipt numbers
    const isDuplicate = payments.some(p => p.receiptNumber.toLowerCase() === receiptClean.toLowerCase());
    if (isDuplicate) {
      setErrorMessage(`លេខវិក្កយបត្រ "${receiptClean}" មានរួចហើយក្នុងប្រព័ន្ធ! សូមប្រើប្រាស់លេខផ្សេង។`);
      return;
    }

    const lateFeeVal = parseFloat(lateFee) || 0;
    const defaultCalculatedLateFee = calculatedLateFee;

    // Requirement 1: If officer changes late fee from calculated amount, require typing reason in notes
    if (Math.abs(lateFeeVal - defaultCalculatedLateFee) > 0.01 && !notes.trim()) {
      setErrorMessage(`អ្នកបានកែប្រែថ្លៃពិន័យពី $${defaultCalculatedLateFee} ទៅ $${lateFeeVal}។ សូមបញ្ចូលមូលហេតុនៃការកែប្រែក្នុងកំណត់សម្គាល់ (Notes)!`);
      return;
    }

    // Calculate principal and interest breakdown
    let principalPaid = 0;
    let interestPaid = 0;

    if (payVal >= selectedInstallment.totalDue) {
      principalPaid = selectedInstallment.principal;
      interestPaid = selectedInstallment.interest;
    } else {
      // Partial payment logic: Pay interest portion first, remainder goes to principal
      if (payVal <= selectedInstallment.interest) {
        interestPaid = payVal;
        principalPaid = 0;
      } else {
        interestPaid = selectedInstallment.interest;
        principalPaid = payVal - selectedInstallment.interest;
      }
    }

    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'Admin (គណៈកម្មការ)';

    setIsSubmitting(true);

    try {
      const success = await recordLoanPaymentTransaction({
        loanId: selectedLoan.id,
        scheduleId: selectedInstallment.id,
        installmentNumber: selectedInstallment.installmentNumber,
        paymentDate: paymentDate,
        amountPaid: payVal,
        principalPaid,
        interestPaid,
        lateFee: lateFeeVal,
        paymentMethod,
        receiptNumber: receiptClean,
        recordedBy: userEmail,
        notes: notes.trim()
      });

      if (success) {
        setIsRepaymentModalOpen(false);
        setPreselectedLoanForRepayment(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'បរាជ័យក្នុងការកត់ត្រាការបង់ប្រាក់');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                កត់ត្រាការបង់ប្រាក់កម្ចី (Record Repayment)
              </h2>
              <p className="text-xs text-slate-500">
                កត់ត្រាការបង់ប្រាក់សងដើម ការប្រាក់ និងប្រព័ន្ធកាត់តុល្យភាព Supabase DB
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsRepaymentModalOpen(false);
              setPreselectedLoanForRepayment(null);
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Step 1: Select Loan */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">
              ១. ជ្រើសរើសកម្ចីដែលត្រូវបង់សង *
            </label>
            
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមលេខកូដកម្ចី ឈ្មោះ ឬលេខទូរស័ព្ទ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#00609C]"
              />
            </div>

            <select
              required
              value={selectedLoanId}
              onChange={(e) => handleLoanChange(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:border-[#00609C] bg-white"
            >
              <option value="" disabled>-- ជ្រើសរើសកម្ចី --</option>
              {filteredLoans.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.loanCode} — {l.borrowerName} ({l.borrowerPhone}) [នៅសល់ ${l.remainingBalance}]
                </option>
              ))}
            </select>

            {/* Selected Loan Details Summary Card */}
            {selectedLoan && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#00609C]">
                  <span>អ្នកខ្ចី៖ {selectedLoan.borrowerName}</span>
                  <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-[11px]">{selectedLoan.loanCode}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
                  <div>ប្រាក់ដើមដើមគ្រា៖ ${selectedLoan.principalAmount}</div>
                  <div>សមតុល្យនៅសល់៖ <strong className="text-rose-600">${selectedLoan.remainingBalance}</strong></div>
                  <div>អត្រាការប្រាក់៖ {selectedLoan.monthlyInterestRate}% / ខែ</div>
                  <div>វិធីសាស្ត្រ៖ {selectedLoan.interestMethod}</div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Select Installment */}
          {selectedLoan && (
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">
                ២. ជ្រើសរើសលើកទីនៃការបង់សង (Installment) *
              </label>
              <select
                required
                value={selectedInstallmentNumber}
                onChange={(e) => handleInstallmentChange(Number(e.target.value))}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#00609C] bg-white font-mono"
              >
                {availableInstallments.map((inst) => {
                  const isPaid = inst.status === 'PAID';
                  return (
                    <option key={inst.installmentNumber} value={inst.installmentNumber} disabled={isPaid}>
                      លើកទី {inst.installmentNumber} — ផុតកំណត់៖ {inst.dueDate} [ត្រូវបង់សរុប៖ ${inst.totalDue} (ដើម $${inst.principal} + ការ $${inst.interest})] {isPaid ? '✔ បានបង់រួច' : ''}
                    </option>
                  );
                })}
              </select>

              {selectedInstallment && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">កាលបរិច្ឆេទផុតកំណត់៖</span>{' '}
                    <strong className="font-mono text-slate-900">{selectedInstallment.dueDate}</strong>
                  </div>
                  <div className="font-mono">
                    <span className="text-slate-500">ប្រាក់ដើម៖</span> ${selectedInstallment.principal} + <span className="text-slate-500">ការប្រាក់៖</span> ${selectedInstallment.interest}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment Amount, Date, Late Fee, Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ចំនួនទឹកប្រាក់បង់សរុប ($) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C] font-mono font-bold text-sm text-[#00609C]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ថ្លៃពិន័យបង់យឺត Late Fee ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={lateFee}
                onChange={(e) => setLateFee(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C] font-mono text-xs text-amber-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                កាលបរិច្ឆេទបង់ (Payment Date) *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C] font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                វិធីសាស្ត្របង់ (Payment Method) *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full py-2 px-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#00609C] bg-white font-semibold"
              >
                <option value="ABA_PAY">ABA PAY (ផ្ទេរតាម App)</option>
                <option value="CASH">CASH (សាច់ប្រាក់ផ្ទាល់)</option>
                <option value="WING">WING (ផ្ទេរតាមវីង)</option>
                <option value="AC_LEDA">AC_LEDA (អេស៊ីលីដា)</option>
                <option value="OTHER">OTHER (ផ្សេងៗ)</option>
              </select>
            </div>
          </div>

          {/* Receipt Number & Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              លេខវិក្កយបត្រទទួលប្រាក់ (Receipt Number) *
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="RC-20261029-001"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C] font-mono font-bold text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              កំណត់សម្គាល់បន្ថែម (Notes)
            </label>
            <textarea
              rows={2}
              placeholder="បញ្ជាក់ព័ត៌មានបន្ថែម (បើមាន)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C] text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsRepaymentModalOpen(false);
                setPreselectedLoanForRepayment(null);
              }}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold cursor-pointer"
            >
              បោះបង់
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-white bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>រក្សាទុក និងបង្កើតវិក្កយបត្រ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
