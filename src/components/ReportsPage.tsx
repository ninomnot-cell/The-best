import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Member, Loan, ExpenseRecord } from '../types';
import * as XLSX from 'xlsx';
import { 
  Printer, 
  FileSpreadsheet, 
  Users, 
  HandCoins, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  Filter, 
  FileText, 
  ShieldAlert 
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { 
    members, 
    savingsRecords, 
    loans, 
    payments, 
    expenses, 
    clubSettings, 
    isOfficer, 
    currentUser, 
    supabaseUser 
  } = useClub();

  // Selected report type
  type ReportType = 'MEMBER_STATEMENT' | 'LOAN_STATEMENT' | 'OVERDUE_AGING' | 'INCOME_EXPENSE' | 'YEAR_END';
  const [reportType, setReportType] = useState<ReportType>('MEMBER_STATEMENT');

  // Filter state
  const userEmail = (supabaseUser?.email || currentUser?.email || '').toLowerCase();
  const linkedMember = members.find(m => 
    (currentUser && m.id === currentUser.id) ||
    (m.email && m.email.toLowerCase() === userEmail)
  );

  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    linkedMember?.id || members[0]?.id || ''
  );
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // If not officer, restrict selection to linked member only
  const targetMember = isOfficer 
    ? members.find(m => m.id === selectedMemberId) || members[0]
    : linkedMember || members[0];

  // Printable action
  const handlePrint = () => {
    window.print();
  };

  // Export to Excel using XLSX
  const handleExportExcel = () => {
    let filename = `Report_${reportType}_${selectedYear}.xlsx`;
    let ws: XLSX.WorkSheet;

    if (reportType === 'MEMBER_STATEMENT') {
      const m = targetMember;
      const mSavings = savingsRecords.filter(s => s.memberId === m?.id);
      const mLoans = loans.filter(l => l.borrowerId === m?.id);

      const data = [
        ['របាយការណ៍សមាជិក (Member Statement)'],
        ['សមាគម:', clubSettings.clubNameKhmer],
        ['ឈ្មោះសមាជិក:', m?.nameKhmer, 'លេខកូដ:', m?.memberCode],
        ['លេខទូរស័ព្ទ:', m?.phone, 'ចូលរួម:', m?.joinDate],
        [''],
        ['១. ប្រវត្តិការបង់ប្រាក់សន្សំ'],
        ['ឆ្នាំ', 'ខែ', 'ទឹកប្រាក់ ($)', 'កាលបរិច្ឆេទ', 'វិធីសាស្ត្រ', 'លេខ Ref'],
        ...mSavings.map(s => [s.year, s.month, s.amount, s.paymentDate, s.paymentMethod, s.referenceNumber]),
        [''],
        ['២. បញ្ជីកម្ចី និងការបង់សង'],
        ['កូដកម្ចី', 'ដើមខ្ចី ($)', 'ការប្រាក់ (%/ខែ)', 'នៅជំពាក់ ($)', 'ស្ថានភាព'],
        ...mLoans.map(l => [l.loanCode, l.principalAmount, l.monthlyInterestRate, l.remainingBalance, l.status])
      ];

      ws = XLSX.utils.aoa_to_sheet(data);
      filename = `Member_Statement_${m?.memberCode || 'all'}.xlsx`;

    } else if (reportType === 'LOAN_STATEMENT') {
      const data = [
        ['របាយការណ៍កម្ចីសរុប និងកាលវិភាគសង (Loan Statement)'],
        ['សមាគម:', clubSettings.clubNameKhmer],
        ['កាលបរិច្ឆេទ:', new Date().toISOString().split('T')[0]],
        [''],
        ['កូដកម្ចី', 'អ្នកខ្ចី', 'ប្រភេទ', 'ដើមខ្ចី ($)', 'ការប្រាក់ (%/ខែ)', 'រយៈពេល (ខែ)', 'បានសងដើម ($)', 'នៅជំពាក់ ($)', 'ស្ថានភាព'],
        ...loans.map(l => [
          l.loanCode,
          l.borrowerName,
          l.borrowerType === 'MEMBER' ? 'សមាជិកក្នុង' : 'អ្នកក្រៅ',
          l.principalAmount,
          l.monthlyInterestRate,
          l.termMonths,
          l.totalPaidPrincipal,
          l.remainingBalance,
          l.status
        ])
      ];
      ws = XLSX.utils.aoa_to_sheet(data);
      filename = `Loan_Statement_${selectedYear}.xlsx`;

    } else if (reportType === 'OVERDUE_AGING') {
      const today = new Date();
      const overdueList: any[] = [];

      loans.forEach(loan => {
        if (loan.status === 'COMPLETED' || loan.status === 'REJECTED') return;
        loan.schedule.forEach(inst => {
          if (inst.status === 'PAID') return;
          const due = new Date(inst.dueDate);
          const diffDays = Math.ceil((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
          if (diffDays > 0) {
            overdueList.push({
              loanCode: loan.loanCode,
              borrowerName: loan.borrowerName,
              phone: loan.borrowerPhone,
              installment: inst.installmentNumber,
              dueDate: inst.dueDate,
              daysLate: diffDays,
              totalDue: inst.totalDue,
              bracket: diffDays <= 30 ? '1-30 ថ្ងៃ' : diffDays <= 60 ? '31-60 ថ្ងៃ' : diffDays <= 90 ? '61-90 ថ្ងៃ' : '90+ ថ្ងៃ'
            });
          }
        });
      });

      const data = [
        ['របាយការណ៍វិភាគអាយុបំណុលហួសកំណត់ (Overdue Aging Report)'],
        ['សមាគម:', clubSettings.clubNameKhmer],
        ['កាលបរិច្ឆេទ:', new Date().toISOString().split('T')[0]],
        [''],
        ['កូដកម្ចី', 'អ្នកខ្ចី', 'ទូរស័ព្ទ', 'លើកទី', 'ថ្ងៃផុតកំណត់', 'ចំនួនថ្ងៃហួស', 'ទឹកប្រាក់ជំពាក់ ($)', 'ក្រុមអាយុបំណុល'],
        ...overdueList.map(o => [o.loanCode, o.borrowerName, o.phone, o.installment, o.dueDate, o.daysLate, o.totalDue, o.bracket])
      ];
      ws = XLSX.utils.aoa_to_sheet(data);
      filename = `Overdue_Aging_Report.xlsx`;

    } else if (reportType === 'INCOME_EXPENSE') {
      const totalInterest = loans.reduce((sum, l) => sum + l.totalPaidInterest, 0);
      const totalLateFees = payments.reduce((sum, p) => sum + (p.lateFee || 0), 0);
      const activeExpenses = expenses.filter(e => !e.isVoided);
      const totalExp = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
      const netProfit = totalInterest + totalLateFees - totalExp;

      const data = [
        ['របាយការណ៍ចំណូល-ចំណាយប្រចាំខែ/ឆ្នាំ (Income & Expense Report)'],
        ['សមាគម:', clubSettings.clubNameKhmer],
        ['ឆ្នាំ:', selectedYear],
        [''],
        ['១. ប្រភពចំណូល (Revenues)'],
        ['ចំណូលការប្រាក់កម្ចីប្រមូលបាន', totalInterest],
        ['ចំណូលថ្លៃពិន័យបង់យឺតយ៉ាវ', totalLateFees],
        ['សរុបចំណូលទាំងអស់', totalInterest + totalLateFees],
        [''],
        ['២. ព័ត៌មានចំណាយ (Expenses)'],
        ['កាលបរិច្ឆេទ', 'ប្រភេទចំណាយ', 'ពិពណ៌នា', 'ចំនួនទឹកប្រាក់ ($)', 'អ្នកកត់ត្រា'],
        ...activeExpenses.map(e => [e.expenseDate, e.category, e.description, e.amount, e.recordedBy]),
        ['សរុបចំណាយទាំងអស់', '', '', totalExp, ''],
        [''],
        ['៣. លទ្ធផលហិរញ្ញវត្ថុ'],
        ['ចំណេញសទ្ធ (Net Profit)', netProfit]
      ];
      ws = XLSX.utils.aoa_to_sheet(data);
      filename = `Income_Expense_Report_${selectedYear}.xlsx`;

    } else {
      // YEAR_END Report
      const activeMembers = members.filter(m => m.status === 'ACTIVE');
      const totalSavings = activeMembers.reduce((sum, m) => sum + m.totalSavings, 0);
      const totalInterest = loans.reduce((sum, l) => sum + l.totalPaidInterest, 0);
      const totalLateFees = payments.reduce((sum, p) => sum + (p.lateFee || 0), 0);
      const totalExp = expenses.filter(e => !e.isVoided).reduce((sum, e) => sum + e.amount, 0);
      const netProfit = totalInterest + totalLateFees - totalExp;

      const data = [
        ['របាយការណ៍សរុបចុងឆ្នាំ និងភាគលាភ (Year-End Financial Report)'],
        ['សមាគម:', clubSettings.clubNameKhmer],
        ['ឆ្នាំប្រតិបត្តិការ:', selectedYear],
        [''],
        ['ប្រាក់សន្សំសរុបក្នុងមូលនិធិ:', totalSavings],
        ['ចំណូលការប្រាក់សរុប:', totalInterest],
        ['ចំណូលថ្លៃពិន័យសរុប:', totalLateFees],
        ['ចំណាយប្រតិបត្តិការសរុប:', totalExp],
        ['ប្រាក់ចំណេញសុទ្ធ:', netProfit],
        [''],
        ['តារាងបែងចែកភាគលាភតាមសមាជិក៖'],
        ['កូដសមាជិក', 'ឈ្មោះសមាជិក', 'ប្រាក់សន្សំសរុប ($)', 'ភាគរយក្នុងមូលនិធិ (%)', 'ភាគលាភទទួលបាន ($)'],
        ...activeMembers.map(m => {
          const sharePct = totalSavings > 0 ? (m.totalSavings / totalSavings) : 0;
          const div = netProfit * sharePct;
          return [m.memberCode, m.nameKhmer, m.totalSavings, (sharePct * 100).toFixed(2) + '%', div.toFixed(2)];
        })
      ];
      ws = XLSX.utils.aoa_to_sheet(data);
      filename = `Year_End_Report_${selectedYear}.xlsx`;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#00609C]" />
            <span>ប្រព័ន្ធបង្កើតរបាយការណ៍ផ្លូវការ (Financial Reports)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ទាញយករាយការណ៍ផ្លូវការជា Excel ឬបោះពុម្ពជា PDF សម្រាប់សមាជិក និងកិច្ចប្រជុំសមាគម
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ព / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setReportType('MEMBER_STATEMENT')}
            className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              reportType === 'MEMBER_STATEMENT' ? 'bg-[#00609C] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>(a) របាយការណ៍សមាជិក</span>
          </button>

          {isOfficer ? (
            <>
              <button
                onClick={() => setReportType('LOAN_STATEMENT')}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  reportType === 'LOAN_STATEMENT' ? 'bg-[#00609C] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <HandCoins className="w-3.5 h-3.5" />
                <span>(b) របាយការណ៍កម្ចីសរុប</span>
              </button>

              <button
                onClick={() => setReportType('OVERDUE_AGING')}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  reportType === 'OVERDUE_AGING' ? 'bg-[#00609C] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
                <span>(c) អាយុបំណុលហួសកំណត់</span>
              </button>

              <button
                onClick={() => setReportType('INCOME_EXPENSE')}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  reportType === 'INCOME_EXPENSE' ? 'bg-[#00609C] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>(d) ចំណូល-ចំណាយ</span>
              </button>

              <button
                onClick={() => setReportType('YEAR_END')}
                className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  reportType === 'YEAR_END' ? 'bg-[#00609C] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>(e) របាយការណ៍ចុងឆ្នាំ</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 italic">
              (សមាជិកធម្មតាអាចមើលបានតែរបាយការណ៍សមាជិកផ្ទាល់ខ្លួន)
            </span>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-slate-100">
          {reportType === 'MEMBER_STATEMENT' && isOfficer && (
            <div className="flex items-center gap-2">
              <label className="text-slate-600 font-medium">ជ្រើសរើសសមាជិក៖</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nameKhmer} ({m.memberCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="text-slate-600 font-medium">ឆ្នាំប្រតិបត្តិការ៖</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-medium font-mono"
            >
              <option value={2026}>២០២៦</option>
              <option value={2025}>២០២៥</option>
              <option value={2024}>២០២៤</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRINT AREA PREVIEW */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none font-sans">
        {/* Print Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/THE_BEST_LOGO2_e1c656fe.png" 
              alt="Logo" 
              className="h-12 w-auto object-contain"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {clubSettings.clubNameKhmer}
              </h2>
              <div className="text-xs text-slate-500">
                (The Best Family Club) · ឆ្នាំប្រតិបត្តិការ {selectedYear}
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600">
            <div>ថ្ងៃបោះពុម្ព៖ <span className="font-mono">{new Date().toISOString().split('T')[0]}</span></div>
            <div className="font-bold text-[#00609C]">របាយការណ៍ផ្លូវការ</div>
          </div>
        </div>

        {/* REPORT TYPE A: Member Statement */}
        {reportType === 'MEMBER_STATEMENT' && (
          <div className="space-y-6 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-slate-500 block text-[11px]">ឈ្មោះសមាជិក៖</span>
                <span className="text-sm font-bold text-slate-900">{targetMember?.nameKhmer} ({targetMember?.memberCode})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">លេខទូរស័ព្ទ៖</span>
                <span className="font-mono font-medium">{targetMember?.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ប្រាក់សន្សំសរុប៖</span>
                <span className="font-mono font-bold text-[#00609C]">${targetMember?.totalSavings.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ភាគលាភទទួលបាន៖</span>
                <span className="font-mono font-bold text-emerald-700">+${targetMember?.totalDividendsEarned.toLocaleString()}</span>
              </div>
            </div>

            {/* Savings section */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">១. ប្រវត្តិការបង់ប្រាក់សន្សំប្រចាំខែ (Monthly Savings)</h3>
              <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 font-semibold">ឆ្នាំ/ខែ</th>
                    <th className="py-2 px-3 font-semibold text-right">ទឹកប្រាក់សន្សំ ($)</th>
                    <th className="py-2 px-3 font-semibold">ថ្ងៃបង់</th>
                    <th className="py-2 px-3 font-semibold text-center">វិធីសាស្ត្រ</th>
                    <th className="py-2 px-3 font-semibold font-mono">លេខ Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {savingsRecords.filter(s => s.memberId === targetMember?.id).map((s) => (
                    <tr key={s.id}>
                      <td className="py-2 px-3">ឆ្នាំ {s.year} - ខែ {s.month}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#00609C]">${s.amount}</td>
                      <td className="py-2 px-3 font-mono">{s.paymentDate}</td>
                      <td className="py-2 px-3 text-center">{s.paymentMethod}</td>
                      <td className="py-2 px-3 font-mono">{s.referenceNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Loans section */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">២. កម្ចីសកម្ម និងកាលវិភាគបង់ (Loans & Repayment)</h3>
              {loans.filter(l => l.borrowerId === targetMember?.id).map(l => (
                <div key={l.id} className="p-3 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex justify-between font-mono font-bold text-slate-800">
                    <span>កូដកម្ចី: {l.loanCode}</span>
                    <span>ដើមខ្ចី: ${l.principalAmount.toLocaleString()} | នៅជំពាក់: ${l.remainingBalance.toLocaleString()}</span>
                  </div>
                  <table className="w-full text-[11px] text-left border border-slate-100">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="py-1 px-2">លើកទី</th>
                        <th className="py-1 px-2">ថ្ងៃផុតកំណត់</th>
                        <th className="py-1 px-2 text-right">ដើម</th>
                        <th className="py-1 px-2 text-right">ការប្រាក់</th>
                        <th className="py-1 px-2 text-right">សរុប</th>
                        <th className="py-1 px-2 text-center">ស្ថានភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {l.schedule.map(inst => (
                        <tr key={inst.installmentNumber}>
                          <td className="py-1 px-2">#{inst.installmentNumber}</td>
                          <td className="py-1 px-2">{inst.dueDate}</td>
                          <td className="py-1 px-2 text-right">${inst.principal.toFixed(2)}</td>
                          <td className="py-1 px-2 text-right">${inst.interest.toFixed(2)}</td>
                          <td className="py-1 px-2 text-right font-bold">${inst.totalDue.toFixed(2)}</td>
                          <td className="py-1 px-2 text-center">{inst.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORT TYPE B: Loan Statement */}
        {reportType === 'LOAN_STATEMENT' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">របាយការណ៍កម្ចីសរុបក្នុងសមាគម (Overall Loans Report)</h3>
            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 font-semibold">កូដកម្ចី</th>
                  <th className="py-2 px-3 font-semibold">អ្នកខ្ចី</th>
                  <th className="py-2 px-3 font-semibold">ប្រភេទ</th>
                  <th className="py-2 px-3 font-semibold text-right">ដើមខ្ចី ($)</th>
                  <th className="py-2 px-3 font-semibold text-center">អត្រា</th>
                  <th className="py-2 px-3 font-semibold text-right">បានសងដើម ($)</th>
                  <th className="py-2 px-3 font-semibold text-right">នៅជំពាក់ ($)</th>
                  <th className="py-2 px-3 font-semibold text-center">ស្ថានភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {loans.map(l => (
                  <tr key={l.id}>
                    <td className="py-2 px-3 font-bold text-[#00609C]">{l.loanCode}</td>
                    <td className="py-2 px-3 font-sans font-medium">{l.borrowerName}</td>
                    <td className="py-2 px-3 font-sans">{l.borrowerType === 'MEMBER' ? 'សមាជិកក្នុង' : 'អ្នកក្រៅ'}</td>
                    <td className="py-2 px-3 text-right font-bold">${l.principalAmount.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center">{l.monthlyInterestRate}%</td>
                    <td className="py-2 px-3 text-right text-emerald-700">${l.totalPaidPrincipal.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-rose-600 font-bold">${l.remainingBalance.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center font-sans">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT TYPE C: Overdue Aging Report */}
        {reportType === 'OVERDUE_AGING' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">របាយការណ៍វិភាគអាយុបំណុលហួសកំណត់ (Overdue Aging Breakdown)</h3>
            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 font-semibold">កូដកម្ចី</th>
                  <th className="py-2 px-3 font-semibold">អ្នកខ្ចី</th>
                  <th className="py-2 px-3 font-semibold">ទូរស័ព្ទ</th>
                  <th className="py-2 px-3 font-semibold text-center">លើកទី</th>
                  <th className="py-2 px-3 font-semibold">ថ្ងៃផុតកំណត់</th>
                  <th className="py-2 px-3 font-semibold text-right">ចំនួនថ្ងៃហួស</th>
                  <th className="py-2 px-3 font-semibold text-right">ទឹកប្រាក់ជំពាក់ ($)</th>
                  <th className="py-2 px-3 font-semibold text-center">ក្រុមអាយុបំណុល</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {(() => {
                  const today = new Date();
                  const list: any[] = [];
                  loans.forEach(loan => {
                    if (loan.status === 'COMPLETED' || loan.status === 'REJECTED') return;
                    loan.schedule.forEach(inst => {
                      if (inst.status === 'PAID') return;
                      const due = new Date(inst.dueDate);
                      const diffDays = Math.ceil((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
                      if (diffDays > 0) {
                        list.push({
                          loanCode: loan.loanCode,
                          borrowerName: loan.borrowerName,
                          phone: loan.borrowerPhone,
                          installment: inst.installmentNumber,
                          dueDate: inst.dueDate,
                          daysLate: diffDays,
                          totalDue: inst.totalDue,
                          bracket: diffDays <= 30 ? '1-30 ថ្ងៃ' : diffDays <= 60 ? '31-60 ថ្ងៃ' : diffDays <= 90 ? '61-90 ថ្ងៃ' : '90+ ថ្ងៃ'
                        });
                      }
                    });
                  });

                  if (list.length === 0) {
                    return (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-500 font-sans">
                          មិនមានបំណុលហួសកំណត់ណាមួយឡើយ
                        </td>
                      </tr>
                    );
                  }

                  return list.map((o, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-bold text-[#00609C]">{o.loanCode}</td>
                      <td className="py-2 px-3 font-sans font-medium">{o.borrowerName}</td>
                      <td className="py-2 px-3">{o.phone}</td>
                      <td className="py-2 px-3 text-center">#{o.installment}</td>
                      <td className="py-2 px-3">{o.dueDate}</td>
                      <td className="py-2 px-3 text-right text-rose-600 font-bold">{o.daysLate} ថ្ងៃ</td>
                      <td className="py-2 px-3 text-right font-bold">${o.totalDue.toFixed(2)}</td>
                      <td className="py-2 px-3 text-center font-sans">
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-[10px]">
                          {o.bracket}
                        </span>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT TYPE D: Monthly Income & Expense Report */}
        {reportType === 'INCOME_EXPENSE' && (
          <div className="space-y-6 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">របាយការណ៍ចំណូល-ចំណាយប្រចាំឆ្នាំ {selectedYear}</h3>
            
            {(() => {
              const totalInterest = loans.reduce((sum, l) => sum + l.totalPaidInterest, 0);
              const totalLateFees = payments.reduce((sum, p) => sum + (p.lateFee || 0), 0);
              const activeExpenses = expenses.filter(e => !e.isVoided);
              const totalExp = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
              const netProfit = totalInterest + totalLateFees - totalExp;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 font-mono">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-[11px] font-sans text-slate-600">សរុបចំណូល (ការប្រាក់+ពិន័យ)</div>
                      <div className="text-lg font-bold text-emerald-700">${(totalInterest + totalLateFees).toFixed(2)}</div>
                    </div>

                    <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                      <div className="text-[11px] font-sans text-slate-600">សរុបចំណាយប្រតិបត្តិការ</div>
                      <div className="text-lg font-bold text-rose-700">${totalExp.toFixed(2)}</div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-[11px] font-sans text-slate-600">ចំណេញសុទ្ធ (Net Profit)</div>
                      <div className="text-lg font-bold text-[#00609C]">${netProfit.toFixed(2)}</div>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-800 text-xs">បញ្ជីចំណាយលម្អិត៖</h4>
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 font-semibold">កាលបរិច្ឆេទ</th>
                        <th className="py-2 px-3 font-semibold">ប្រភេទចំណាយ</th>
                        <th className="py-2 px-3 font-semibold">ពិពណ៌នា</th>
                        <th className="py-2 px-3 font-semibold text-right">ទឹកប្រាក់ ($)</th>
                        <th className="py-2 px-3 font-semibold">អ្នកកត់ត្រា</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeExpenses.map(e => (
                        <tr key={e.id}>
                          <td className="py-2 px-3 font-mono">{e.expenseDate}</td>
                          <td className="py-2 px-3">{e.category}</td>
                          <td className="py-2 px-3">{e.description}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">${e.amount.toFixed(2)}</td>
                          <td className="py-2 px-3">{e.recordedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        {/* REPORT TYPE E: Year-End Report */}
        {reportType === 'YEAR_END' && (
          <div className="space-y-6 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">របាយការណ៍សរុបចុងឆ្នាំ និងភាគលាភបែងចែក (Year-End Financial Statement)</h3>
            
            {(() => {
              const activeMembers = members.filter(m => m.status === 'ACTIVE');
              const totalSavings = activeMembers.reduce((sum, m) => sum + m.totalSavings, 0);
              const totalInterest = loans.reduce((sum, l) => sum + l.totalPaidInterest, 0);
              const totalLateFees = payments.reduce((sum, p) => sum + (p.lateFee || 0), 0);
              const totalExp = expenses.filter(e => !e.isVoided).reduce((sum, e) => sum + e.amount, 0);
              const netProfit = totalInterest + totalLateFees - totalExp;

              return (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between"><span>ប្រាក់សន្សំសរុបក្នុងមូលនិធិ៖</span> <strong className="font-mono text-[#00609C]">${totalSavings.toLocaleString()}</strong></div>
                    <div className="flex justify-between"><span>ចំណូលការប្រាក់ + ថ្លៃពិន័យ៖</span> <strong className="font-mono text-emerald-700">${(totalInterest + totalLateFees).toFixed(2)}</strong></div>
                    <div className="flex justify-between"><span>ចំណាយប្រតិបត្តិការសរុប៖</span> <strong className="font-mono text-rose-600">${totalExp.toFixed(2)}</strong></div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-sm"><span>ប្រាក់ចំណេញសុទ្ធសម្រាប់បែងចែកភាគលាភ៖</span> <strong className="font-mono text-emerald-700 font-bold">${netProfit.toFixed(2)}</strong></div>
                  </div>

                  <h4 className="font-bold text-slate-800 text-xs">តារាងបែងចែកភាគលាភតាមសមាជិកសកម្ម ({activeMembers.length} នាក់)៖</h4>
                  <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 font-semibold">កូដ</th>
                        <th className="py-2 px-3 font-semibold">ឈ្មោះសមាជិក</th>
                        <th className="py-2 px-3 font-semibold text-right">ប្រាក់សន្សំ ($)</th>
                        <th className="py-2 px-3 font-semibold text-center">ចំណែក (%)</th>
                        <th className="py-2 px-3 font-semibold text-right font-bold text-emerald-700">ភាគលាភទទួលបាន ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {activeMembers.map(m => {
                        const sharePct = totalSavings > 0 ? (m.totalSavings / totalSavings) : 0;
                        const div = netProfit * sharePct;
                        return (
                          <tr key={m.id}>
                            <td className="py-2 px-3 font-bold text-[#00609C]">{m.memberCode}</td>
                            <td className="py-2 px-3 font-sans font-medium">{m.nameKhmer}</td>
                            <td className="py-2 px-3 text-right">${m.totalSavings.toLocaleString()}</td>
                            <td className="py-2 px-3 text-center">{(sharePct * 100).toFixed(2)}%</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700">${div.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        )}

        {/* Signatures Footer for Print */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs text-slate-700 print:grid">
          <div>
            <div className="font-bold">រៀបចំដោយ (បេឡាធិការ)</div>
            <div className="h-16"></div>
            <div className="font-medium text-slate-900">
              {members.find(m => m.role === 'បេឡាធិការ')?.nameKhmer || '..........................'}
            </div>
          </div>

          <div>
            <div className="font-bold">បានត្រួតពិនិត្យ និងអនុម័ត (ប្រធានក្លឹប)</div>
            <div className="h-16"></div>
            <div className="font-medium text-slate-900">
              {members.find(m => m.role === 'ប្រធានក្លឹប')?.nameKhmer || '..........................'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
