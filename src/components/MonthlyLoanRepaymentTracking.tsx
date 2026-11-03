import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useClub } from '../context/ClubContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MonthlyRepaymentView, BorrowerType } from '../types';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  HandCoins, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  FileText, 
  ShieldAlert,
  RefreshCw,
  ArrowUpDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

const KHMER_MONTHS = [
  'មករា (Jan)', 'កុម្ភៈ (Feb)', 'មីនា (Mar)', 'មេសា (Apr)',
  'ឧសភា (May)', 'មិថុនា (Jun)', 'កក្កដា (Jul)', 'សីហា (Aug)',
  'កញ្ញា (Sep)', 'តុលា (Oct)', 'វិច្ឆិកា (Nov)', 'ធ្នូ (Dec)'
];

export const MonthlyLoanRepaymentTracking: React.FC = () => {
  const { 
    loans, 
    currentUser, 
    isOfficer, 
    setIsRepaymentModalOpen, 
    setPreselectedLoanForRepayment,
    refreshData 
  } = useClub();

  // Get current year & month in Asia/Phnom_Penh timezone by default
  const defaultYearMonth = useMemo(() => {
    try {
      const phnomPenhStr = new Intl.DateTimeFormat('en-CA', { 
        timeZone: 'Asia/Phnom_Penh',
        year: 'numeric',
        month: '2-digit'
      }).format(new Date()); // Format: YYYY-MM
      const [y, m] = phnomPenhStr.split('-').map(Number);
      return { year: y || new Date().getFullYear(), month: m || new Date().getMonth() + 1 };
    } catch {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth() + 1 };
    }
  }, []);

  const [selectedYear, setSelectedYear] = useState<number>(defaultYearMonth.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultYearMonth.month);
  
  const [repayments, setRepayments] = useState<MonthlyRepaymentView[]>([]);
  const [overdueLateFeesMap, setOverdueLateFeesMap] = useState<Record<string, { late_fee: number; days_late: number }>>({});
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string>('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'OVERDUE'>('ALL');
  const [borrowerTypeFilter, setBorrowerTypeFilter] = useState<'ALL' | 'MEMBER' | 'EXTERNAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Access control checks
  const userRole = currentUser?.role || '';
  const isPresident = userRole === 'ប្រធានក្លឹប';
  const isTreasurer = userRole === 'បេឡាធិការ';
  const isAccountant = userRole === 'គណនេយ្យករ';
  const isAuthorizedViewer = isPresident || isTreasurer || isAccountant || isOfficer;
  const canRecordOrExport = isPresident || isTreasurer;

  // Fetch data from Supabase view v_monthly_repayments
  const fetchMonthlyData = useCallback(async () => {
    setIsLoading(true);
    setFetchError('');

    try {
      if (isSupabaseConfigured) {
        // Query v_monthly_repayments view
        const { data: viewData, error: viewError } = await supabase
          .from('v_monthly_repayments')
          .select('*')
          .eq('due_year', selectedYear)
          .eq('due_month', selectedMonth);

        if (viewError) {
          throw new Error(viewError.message);
        }

        // Query v_overdue_installments view for late fee lookup
        const { data: overdueData } = await supabase
          .from('v_overdue_installments')
          .select('schedule_id, late_fee, days_late');

        const lateFeeMap: Record<string, { late_fee: number; days_late: number }> = {};
        if (overdueData && Array.isArray(overdueData)) {
          overdueData.forEach((item: any) => {
            if (item.schedule_id) {
              lateFeeMap[item.schedule_id] = {
                late_fee: parseFloat(item.late_fee) || 0,
                days_late: parseInt(item.days_late) || 0
              };
            }
          });
        }
        setOverdueLateFeesMap(lateFeeMap);

        if (viewData) {
          setRepayments(viewData as MonthlyRepaymentView[]);
        } else {
          setRepayments([]);
        }
      } else {
        // Fallback for offline mode using local loans context
        const localRows: MonthlyRepaymentView[] = [];
        loans.forEach((loan) => {
          loan.schedule.forEach((inst) => {
            const [yStr, mStr] = inst.dueDate.split('-');
            const instYear = parseInt(yStr);
            const instMonth = parseInt(mStr);

            if (instYear === selectedYear && instMonth === selectedMonth) {
              const isPaid = inst.status === 'PAID';
              const today = new Date();
              const due = new Date(inst.dueDate);
              const isPastDue = today > due && !isPaid;
              const daysLate = isPastDue ? Math.ceil((today.getTime() - due.getTime()) / (1000 * 3600 * 24)) : 0;

              let pGroup: 'PAID_ON_TIME' | 'PAID_LATE' | 'OVERDUE' | 'UPCOMING' = 'UPCOMING';
              if (isPaid) {
                pGroup = (inst.paidDate && new Date(inst.paidDate) > due) ? 'PAID_LATE' : 'PAID_ON_TIME';
              } else if (isPastDue) {
                pGroup = 'OVERDUE';
              }

              localRows.push({
                schedule_id: inst.id || `${loan.id}-${inst.installmentNumber}`,
                loan_id: loan.id,
                loan_code: loan.loanCode,
                borrower_type: loan.borrowerType,
                borrower_name: loan.borrowerName,
                borrower_phone: loan.borrowerPhone,
                installment_number: inst.installmentNumber,
                due_date: inst.dueDate,
                due_year: instYear,
                due_month: instMonth,
                principal_amount: inst.principal,
                interest_amount: inst.interest,
                total_due: inst.totalDue,
                paid_toward_installment: inst.paidAmount || (isPaid ? inst.totalDue : 0),
                remaining_due: isPaid ? 0 : inst.totalDue,
                schedule_status: isPaid ? 'PAID' : isPastDue ? 'OVERDUE' : 'PENDING',
                paid_date: inst.paidDate || null,
                receipt_number: inst.receiptNumber || null,
                payment_group: pGroup,
                days_late: daysLate
              });
            }
          });
        });
        setRepayments(localRows);
      }
    } catch (err: any) {
      console.error('Error fetching v_monthly_repayments:', err);
      setFetchError(err.message || 'មិនអាចទាញយកទិន្នន័យពី Supabase បានទេ');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth, loans]);

  useEffect(() => {
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  // Handlers for Month Navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Summary Metrics Calculation for Selected Month
  const summaryMetrics = useMemo(() => {
    const totalInstallments = repayments.length;
    const distinctBorrowers = new Set(repayments.map(r => r.loan_id)).size;

    let paidCount = 0;
    let paidLateCount = 0;
    let overdueCount = 0;
    let upcomingCount = 0;

    let totalAmountDue = 0;
    let totalCollected = 0;

    repayments.forEach(r => {
      totalAmountDue += r.total_due;

      const isPaid = r.schedule_status === 'PAID' || r.payment_group === 'PAID_ON_TIME' || r.payment_group === 'PAID_LATE';
      
      if (isPaid) {
        paidCount++;
        if (r.payment_group === 'PAID_LATE' || (r.days_late > 0)) {
          paidLateCount++;
        }
        // Handle legacy paid rows where paid_toward_installment < total_due by treating as total_due
        const collectedVal = r.paid_toward_installment >= r.total_due ? r.paid_toward_installment : r.total_due;
        totalCollected += collectedVal;
      } else {
        totalCollected += (r.paid_toward_installment || 0);
        if (r.payment_group === 'OVERDUE' || r.schedule_status === 'OVERDUE' || r.days_late > 0) {
          overdueCount++;
        } else {
          upcomingCount++;
        }
      }
    });

    const unpaidCount = totalInstallments - paidCount;
    const totalOutstanding = Math.max(0, totalAmountDue - totalCollected);
    const collectionPercentage = totalAmountDue > 0 ? (totalCollected / totalAmountDue) * 100 : 0;

    return {
      totalInstallments,
      distinctBorrowers,
      paidCount,
      paidLateCount,
      unpaidCount,
      overdueCount,
      upcomingCount,
      totalAmountDue,
      totalCollected,
      totalOutstanding,
      collectionPercentage
    };
  }, [repayments]);

  // Filtered and Sorted Data Table Rows
  const filteredRepayments = useMemo(() => {
    return repayments.filter(item => {
      // Status Filter
      if (statusFilter === 'PAID') {
        const isPaid = item.schedule_status === 'PAID' || item.payment_group === 'PAID_ON_TIME' || item.payment_group === 'PAID_LATE';
        if (!isPaid) return false;
      } else if (statusFilter === 'UNPAID') {
        const isPaid = item.schedule_status === 'PAID' || item.payment_group === 'PAID_ON_TIME' || item.payment_group === 'PAID_LATE';
        if (isPaid || item.payment_group === 'OVERDUE') return false;
      } else if (statusFilter === 'OVERDUE') {
        const isOverdue = item.payment_group === 'OVERDUE' || (item.schedule_status !== 'PAID' && item.days_late > 0);
        if (!isOverdue) return false;
      }

      // Borrower Type Filter
      if (borrowerTypeFilter !== 'ALL' && item.borrower_type !== borrowerTypeFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = item.loan_code.toLowerCase().includes(q);
        const matchName = item.borrower_name.toLowerCase().includes(q);
        const matchPhone = item.borrower_phone.includes(q);
        if (!matchCode && !matchName && !matchPhone) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort Order: OVERDUE first, then UPCOMING by due date, then PAID_LATE, then PAID_ON_TIME
      const groupPriority: Record<string, number> = {
        'OVERDUE': 1,
        'UPCOMING': 2,
        'PAID_LATE': 3,
        'PAID_ON_TIME': 4
      };
      const prioA = groupPriority[a.payment_group] || 5;
      const prioB = groupPriority[b.payment_group] || 5;

      if (prioA !== prioB) return prioA - prioB;
      return a.due_date.localeCompare(b.due_date);
    });
  }, [repayments, statusFilter, borrowerTypeFilter, searchQuery]);

  // Totals for bottom of data table
  const tableTotals = useMemo(() => {
    let due = 0;
    let paid = 0;
    let rem = 0;
    let lateFeeSum = 0;

    filteredRepayments.forEach(item => {
      due += item.total_due;
      const isPaid = item.schedule_status === 'PAID' || item.payment_group === 'PAID_ON_TIME' || item.payment_group === 'PAID_LATE';
      const actualPaid = isPaid ? (item.paid_toward_installment >= item.total_due ? item.paid_toward_installment : item.total_due) : (item.paid_toward_installment || 0);
      paid += actualPaid;
      rem += isPaid ? 0 : Math.max(0, item.total_due - actualPaid);

      const lateFeeVal = overdueLateFeesMap[item.schedule_id]?.late_fee || 0;
      lateFeeSum += lateFeeVal;
    });

    return { due, paid, rem, lateFeeSum };
  }, [filteredRepayments, overdueLateFeesMap]);

  // Trigger Record Repayment Modal
  const handleOpenRecordRepayment = (loanId: string, instNum: number) => {
    setPreselectedLoanForRepayment({
      loanId,
      installmentNumber: instNum
    });
    setIsRepaymentModalOpen(true);
  };

  // Export to Excel with SheetJS (XLSX)
  const handleExportExcel = async () => {
    if (!canRecordOrExport) return;

    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary Data
      const summaryData = [
        ['របាយការណ៍សង្ខេបការបង់ប្រាក់កម្ចីប្រចាំខែ (Monthly Loan Repayment Summary)'],
        [`ឆ្នាំ ${selectedYear} - ខែ ${selectedMonth}`],
        [],
        ['សូចនាករ (Metric)', 'តម្លៃ (Value)'],
        ['ចំនួនអ្នកខ្ចីត្រូវបង់សរុប (Borrowers Due)', summaryMetrics.distinctBorrowers],
        ['ចំនួនលើកត្រូវបង់សរុប (Installments Due)', summaryMetrics.totalInstallments],
        ['ចំនួនលើកបង់រួច (Paid Installments)', summaryMetrics.paidCount],
        ['  - ក្នុងនោះបង់យឺត (Paid Late)', summaryMetrics.paidLateCount],
        ['ចំនួនលើកមិនទាន់បង់ (Unpaid Installments)', summaryMetrics.unpaidCount],
        ['  - ក្នុងនោះហួសកំណត់ (Overdue)', summaryMetrics.overdueCount],
        ['  - ជិតដល់ថ្ងៃបង់ (Upcoming)', summaryMetrics.upcomingCount],
        ['ទឹកប្រាក់ត្រូវបង់សរុប (Total Amount Due $)', summaryMetrics.totalAmountDue],
        ['ទឹកប្រាក់ប្រមូលបានសរុប (Total Collected $)', summaryMetrics.totalCollected],
        ['ទឹកប្រាក់នៅខ្វះសរុប (Total Outstanding $)', summaryMetrics.totalOutstanding],
        ['អត្រាភាគរយប្រមូលបាន (Collection Rate %)', `${summaryMetrics.collectionPercentage.toFixed(1)}%`]
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 45 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'សង្ខេប');

      // Sheet 2: Detailed Rows
      const detailedRows = filteredRepayments.map((r, idx) => {
        const isPaid = r.schedule_status === 'PAID' || r.payment_group === 'PAID_ON_TIME' || r.payment_group === 'PAID_LATE';
        const actualPaid = isPaid ? (r.paid_toward_installment >= r.total_due ? r.paid_toward_installment : r.total_due) : (r.paid_toward_installment || 0);
        const remVal = isPaid ? 0 : Math.max(0, r.total_due - actualPaid);
        const lateFeeVal = overdueLateFeesMap[r.schedule_id]?.late_fee || 0;
        const daysLateVal = r.days_late || overdueLateFeesMap[r.schedule_id]?.days_late || 0;

        let statusText = 'ជិតដល់ថ្ងៃ';
        if (r.payment_group === 'PAID_ON_TIME') statusText = 'បង់ទាន់ពេល';
        else if (r.payment_group === 'PAID_LATE') statusText = 'បង់យឺត';
        else if (r.payment_group === 'OVERDUE') statusText = 'ហួសកំណត់';

        return {
          'ល.រ': idx + 1,
          'លេខកូដកម្ចី': r.loan_code,
          'ឈ្មោះអ្នកខ្ចី': r.borrower_name,
          'ប្រភេទ': r.borrower_type === 'MEMBER' ? 'សមាជិក' : 'ក្រៅ',
          'ទូរស័ព្ទ': r.borrower_phone,
          'លើកទី': r.installment_number,
          'កាលបរិច្ឆេទកំណត់': r.due_date,
          'ប្រាក់ដើម ($)': r.principal_amount,
          'ការប្រាក់ ($)': r.interest_amount,
          'ត្រូវបង់សរុប ($)': r.total_due,
          'បានបង់ ($)': actualPaid,
          'នៅខ្វះ ($)': remVal,
          'ស្ថានភាព': statusText,
          'ថ្ងៃបង់': r.paid_date || '-',
          'លេខវិក្កយបត្រ': r.receipt_number || '-',
          'ចំនួនថ្ងៃយឺត': daysLateVal,
          'ថ្លៃពិន័យ ($)': lateFeeVal
        };
      });

      const wsDetails = XLSX.utils.json_to_sheet(detailedRows);
      wsDetails['!cols'] = [
        { wch: 6 }, { wch: 15 }, { wch: 22 }, { wch: 10 }, { wch: 14 },
        { wch: 8 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 16 },
        { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 18 },
        { wch: 12 }, { wch: 14 }
      ];
      XLSX.utils.book_append_sheet(wb, wsDetails, 'លម្អិត');

      // Export file
      const monthFormatted = String(selectedMonth).padStart(2, '0');
      const filename = `loan-repayments-${selectedYear}-${monthFormatted}.xlsx`;
      XLSX.writeFile(wb, filename);

      // Audit Log insertion into Supabase
      if (isSupabaseConfigured) {
        const userEmail = currentUser?.email || 'officer@club.org';
        await supabase.from('audit_log').insert([{
          table_name: 'v_monthly_repayments',
          action: 'EXPORT',
          new_data: { 
            year: selectedYear, 
            month: selectedMonth, 
            filter: statusFilter, 
            borrowerType: borrowerTypeFilter,
            count: filteredRepayments.length 
          },
          changed_by: userEmail
        }]);
      }
    } catch (err) {
      console.error('Error exporting Excel:', err);
      alert('បរាជ័យក្នុងការនាំចេញរបាយការណ៍ Excel');
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Restricted Access View Notice if user is not authorized
  if (!isAuthorizedViewer) {
    return (
      <div className="bg-[#00609C]/5 border border-[#00609C]/20 rounded-2xl p-8 text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          អ្នកមិនមានសិទ្ធិចូលមើលទំព័រនេះទេ
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          ទំព័រ <strong>«តាមដានការបង់ប្រាក់កម្ចីប្រចាំខែ»</strong> ត្រូវបានកម្រិតសម្រាប់តែ <strong>ប្រធានក្លឹប</strong>, <strong>បេឡាធិការ</strong> និង <strong>គណនេយ្យករ</strong> តែប៉ុណ្ណោះ។
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00609C] mb-1">
            <span className="px-2.5 py-0.5 bg-blue-50 rounded-md font-mono">v_monthly_repayments</span>
            <span>·</span>
            <span>ប្រព័ន្ធគ្រប់គ្រងការប្រមូលប្រាក់កម្ចី</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            តាមដានការបង់ប្រាក់កម្ចីប្រចាំខែ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ពិនិត្យកាលវិភាគបង់ប្រាក់កម្ចី ភាគរយប្រមូលបាន ស្ថានភាពហួសកំណត់ និងកត់ត្រាការបង់
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 no-print">
          <button
            onClick={fetchMonthlyData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="ទាញយកទិន្នន័យថ្មីពី Supabase DB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#00609C]' : ''}`} />
            <span>{isLoading ? 'កំពុងទាញ...' : 'Refetch'}</span>
          </button>

          {canRecordOrExport && (
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>នាំចេញ Excel</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>បោះពុម្ព / PDF</span>
          </button>
        </div>
      </div>

      {/* Month & Year Picker Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-[#004f80] to-[#00609C] rounded-2xl p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-orange-300 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-orange-200 font-medium">ជ្រើសរើសខែ និងឆ្នាំប្រតិបត្តិការ</div>
            <div className="text-lg font-bold">
              ខែ {KHMER_MONTHS[selectedMonth - 1]} ឆ្នាំ {selectedYear}
            </div>
          </div>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handlePrevMonth}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
            title="ខែមុន"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden md:inline">ខែមុន</span>
          </button>

          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md p-1.5 rounded-xl">
            {/* Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-white text-xs font-bold px-2 py-1 focus:outline-none cursor-pointer"
            >
              {KHMER_MONTHS.map((mName, idx) => (
                <option key={idx + 1} value={idx + 1} className="text-slate-900 font-sans">
                  ខែទី {idx + 1}: {mName}
                </option>
              ))}
            </select>

            <span className="text-white/40">|</span>

            {/* Year Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-white text-xs font-bold px-2 py-1 focus:outline-none cursor-pointer font-mono"
            >
              {[selectedYear - 3, selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1, selectedYear + 2].map((y) => (
                <option key={y} value={y} className="text-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
            title="ខែបន្ទាប់"
          >
            <span className="hidden md:inline">ខែបន្ទាប់</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fetch Error Warning */}
      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchMonthlyData}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg cursor-pointer"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      )}

      {/* 4 Summary Cards for Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Borrowers Due */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">អ្នកខ្ចីត្រូវបង់ប្រាក់</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00609C] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {summaryMetrics.distinctBorrowers} <span className="text-sm font-normal text-slate-500">នាក់</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              សរុប <strong className="font-mono text-slate-700">{summaryMetrics.totalInstallments}</strong> លើកក្នុងខែនេះ
            </div>
          </div>
        </div>

        {/* Card 2: Paid Installments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">បានបង់ប្រាក់រួច</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 tabular-nums">
              {summaryMetrics.paidCount} <span className="text-sm font-normal text-slate-500">/ {summaryMetrics.totalInstallments} លើក</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              ក្នុងនោះបង់យឺត ៖ <span className="font-bold text-amber-600 font-mono">{summaryMetrics.paidLateCount}</span> លើក
            </div>
          </div>
        </div>

        {/* Card 3: Unpaid & Overdue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">មិនទាន់បានបង់</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {summaryMetrics.unpaidCount} <span className="text-sm font-normal text-slate-500">លើក</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              ហួសកំណត់ ៖ <strong className="text-rose-600 font-mono">{summaryMetrics.overdueCount}</strong> លើក
            </div>
          </div>
        </div>

        {/* Card 4: Collection Status & Percentage */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ស្ថានភាពប្រមូលប្រាក់</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#F15A24] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                ${summaryMetrics.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-[#00609C] font-mono">
                {summaryMetrics.collectionPercentage.toFixed(1)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-[#00609C] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, summaryMetrics.collectionPercentage))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>ត្រូវបង់: ${summaryMetrics.totalAmountDue.toLocaleString()}</span>
              <span>ខ្វះ: <span className="text-rose-600 font-bold">${summaryMetrics.totalOutstanding.toLocaleString()}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#00609C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ទាំងអស់ ({repayments.length})
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'PAID'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            បង់រួច ({summaryMetrics.paidCount})
          </button>
          <button
            onClick={() => setStatusFilter('UNPAID')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'UNPAID'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            មិនទាន់បង់ ({summaryMetrics.upcomingCount})
          </button>
          <button
            onClick={() => setStatusFilter('OVERDUE')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'OVERDUE'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ហួសកំណត់ ({summaryMetrics.overdueCount})
          </button>
        </div>

        {/* Search & Type Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Borrower Type Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={borrowerTypeFilter}
              onChange={(e) => setBorrowerTypeFilter(e.target.value as any)}
              className="py-1.5 px-2.5 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#00609C] bg-white cursor-pointer"
            >
              <option value="ALL">ប្រភេទ ៖ ទាំងអស់</option>
              <option value="MEMBER">ប្រភេទ ៖ សមាជិក</option>
              <option value="EXTERNAL">ប្រភេទ ៖ អ្នកក្រៅ</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ស្វែងរកតាមលេខកូដ ឈ្មោះ ឬលេខទូរស័ព្ទ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#00609C] w-56"
            />
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Printable Header Notice */}
        <div className="hidden print:block p-6 text-center border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">សមាគម ឌឹ បេស៍ ហ្វាមីលី ក្លឹប</h2>
          <h3 className="text-base font-semibold text-slate-700 mt-1">
            តារាងតាមដានការបង់ប្រាក់កម្ចីប្រចាំខែ {selectedMonth}/{selectedYear}
          </h3>
          <div className="text-xs text-slate-500 mt-1">
            កាលបរិច្ឆេទបោះពុម្ព ៖ {new Date().toLocaleDateString('km-KH')}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#00609C]" />
            <span>កំពុងទាញយកទិន្នន័យពី Supabase Database...</span>
          </div>
        ) : filteredRepayments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            មិនមានទិន្នន័យកាលវិភាគបង់ប្រាក់សម្រាប់ខែ {selectedMonth}/{selectedYear} ដែលត្រូវគ្នានឹងការតម្រងឡើយ។
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px] tracking-wider">
                  <th className="p-3">លេខកូដ</th>
                  <th className="p-3">អ្នកខ្ចី</th>
                  <th className="p-3">ប្រភេទ</th>
                  <th className="p-3">ទូរស័ព្ទ</th>
                  <th className="p-3 text-center">លើកទី</th>
                  <th className="p-3">ថ្ងៃផុតកំណត់</th>
                  <th className="p-3 text-right">ត្រូវបង់សរុប</th>
                  <th className="p-3 text-right">បានបង់</th>
                  <th className="p-3 text-right">នៅខ្វះ</th>
                  <th className="p-3 text-center">ស្ថានភាព</th>
                  <th className="p-3">ថ្ងៃបង់</th>
                  <th className="p-3 font-mono">លេខវិក្កយបត្រ</th>
                  <th className="p-3 text-center">យឺត</th>
                  <th className="p-3 text-right">ពិន័យ</th>
                  <th className="p-3 text-center no-print">សកម្មភាព</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredRepayments.map((row) => {
                  const isPaid = row.schedule_status === 'PAID' || row.payment_group === 'PAID_ON_TIME' || row.payment_group === 'PAID_LATE';
                  const actualPaid = isPaid ? (row.paid_toward_installment >= row.total_due ? row.paid_toward_installment : row.total_due) : (row.paid_toward_installment || 0);
                  const remaining = isPaid ? 0 : Math.max(0, row.total_due - actualPaid);
                  const lateFeeVal = overdueLateFeesMap[row.schedule_id]?.late_fee || 0;
                  const daysLateVal = row.days_late || overdueLateFeesMap[row.schedule_id]?.days_late || 0;

                  return (
                    <tr 
                      key={row.schedule_id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        row.payment_group === 'OVERDUE' ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Loan Code */}
                      <td className="p-3 font-mono font-bold text-[#00609C] whitespace-nowrap">
                        {row.loan_code}
                      </td>

                      {/* Borrower Name */}
                      <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                        {row.borrower_name}
                      </td>

                      {/* Borrower Type */}
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.borrower_type === 'MEMBER' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {row.borrower_type === 'MEMBER' ? 'សមាជិក' : 'អ្នកក្រៅ'}
                        </span>
                      </td>

                      {/* Borrower Phone */}
                      <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                        {row.borrower_phone}
                      </td>

                      {/* Installment Number */}
                      <td className="p-3 text-center font-mono font-bold text-slate-700">
                        #{row.installment_number}
                      </td>

                      {/* Due Date */}
                      <td className="p-3 font-mono text-slate-700 whitespace-nowrap">
                        {row.due_date}
                      </td>

                      {/* Total Due */}
                      <td className="p-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ${row.total_due.toFixed(2)}
                      </td>

                      {/* Paid Amount */}
                      <td className="p-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                        ${actualPaid.toFixed(2)}
                      </td>

                      {/* Remaining Due */}
                      <td className="p-3 text-right font-mono font-bold text-rose-600 tabular-nums">
                        ${remaining.toFixed(2)}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3 text-center whitespace-nowrap">
                        {row.payment_group === 'PAID_ON_TIME' && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>បង់ទាន់ពេល</span>
                          </span>
                        )}
                        {row.payment_group === 'PAID_LATE' && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>បង់យឺត ({daysLateVal}ថ្ងៃ)</span>
                          </span>
                        )}
                        {row.payment_group === 'OVERDUE' && (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px] inline-flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            <span>ហួសកំណត់ ({daysLateVal}ថ្ងៃ)</span>
                          </span>
                        )}
                        {row.payment_group === 'UPCOMING' && (
                          <span className="px-2.5 py-1 bg-sky-100 text-sky-800 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>ជិតដល់ថ្ងៃ</span>
                          </span>
                        )}
                      </td>

                      {/* Paid Date */}
                      <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                        {row.paid_date || '-'}
                      </td>

                      {/* Receipt Number */}
                      <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                        {row.receipt_number || '-'}
                      </td>

                      {/* Days Late */}
                      <td className="p-3 text-center font-mono text-slate-700">
                        {daysLateVal > 0 ? (
                          <span className="text-rose-600 font-bold">{daysLateVal}</span>
                        ) : (
                          '0'
                        )}
                      </td>

                      {/* Late Fee */}
                      <td className="p-3 text-right font-mono font-bold text-amber-700 tabular-nums">
                        {lateFeeVal > 0 ? `$${lateFeeVal.toFixed(2)}` : '$0.00'}
                      </td>

                      {/* Action Button */}
                      <td className="p-3 text-center no-print whitespace-nowrap">
                        {isPaid ? (
                          <span className="text-[11px] font-semibold text-emerald-600">
                            រួចរាល់
                          </span>
                        ) : canRecordOrExport ? (
                          <button
                            onClick={() => handleOpenRecordRepayment(row.loan_id, row.installment_number)}
                            className="px-3 py-1 text-xs font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <HandCoins className="w-3 h-3" />
                            <span>កត់ត្រាបង់</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            មិនទាន់បង់
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Table Footer / Summary Totals Row */}
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td colSpan={6} className="p-3 text-right uppercase tracking-wider text-xs">
                    សរុបសរុប (Totals) ៖
                  </td>
                  <td className="p-3 text-right font-mono text-slate-900 tabular-nums">
                    ${tableTotals.due.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-700 tabular-nums">
                    ${tableTotals.paid.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono text-rose-600 tabular-nums">
                    ${tableTotals.rem.toFixed(2)}
                  </td>
                  <td colSpan={4} className="p-3 text-right text-xs">
                    សរុបពិន័យ ៖
                  </td>
                  <td className="p-3 text-right font-mono text-amber-800 tabular-nums">
                    ${tableTotals.lateFeeSum.toFixed(2)}
                  </td>
                  <td className="p-3 no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
