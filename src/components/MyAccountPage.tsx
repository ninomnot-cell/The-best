import React from 'react';
import { useClub } from '../context/ClubContext';
import { 
  User, 
  PiggyBank, 
  HandCoins, 
  TrendingUp, 
  Calendar, 
  Phone, 
  CreditCard, 
  Briefcase, 
  Mail, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet 
} from 'lucide-react';

export const MyAccountPage: React.FC = () => {
  const { 
    members, 
    savingsRecords, 
    loans, 
    currentUser, 
    supabaseUser, 
    setSelectedLoanForSchedule, 
    setCurrentTab 
  } = useClub();

  // Find linked member record
  const userEmail = (supabaseUser?.email || currentUser?.email || '').toLowerCase();
  const linkedMember = members.find(m => 
    (currentUser && m.id === currentUser.id) ||
    (m.email && m.email.toLowerCase() === userEmail)
  );

  if (!linkedMember) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-xs text-amber-900 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>គណនីមិនទាន់បានភ្ជាប់ជាមួយសមាជិក (Unlinked Account)</span>
          </div>
          <p className="leading-relaxed">
            អ៊ីមែលគណនី <strong>{userEmail || 'បច្ចុប្បន្ន'}</strong> មិនទាន់ត្រូវបានភ្ជាប់ទៅនឹងទិន្នន័យសមាជិកណាមួយក្នុងប្រព័ន្ធនៅឡើយទេ។
          </p>
          <div className="p-3 bg-white/80 rounded-lg border border-amber-200 text-slate-700">
            សូមទាក់ទង <strong>ប្រធានក្លឹប</strong> ឬ <strong>បេឡាធិការ</strong> ដើម្បីកែប្រែព័ត៌មានប្រវត្តិរូប រួចបញ្ចូលអ៊ីមែលនេះទៅក្នុងទិន្នន័យសមាជិករបស់អ្នក។
          </div>
        </div>
      </div>
    );
  }

  // Filter own financial data
  const ownSavings = savingsRecords.filter(s => s.memberId === linkedMember.id);
  const ownLoans = loans.filter(l => l.borrowerId === linkedMember.id || l.borrowerPhone === linkedMember.phone);

  const monthsKhmer = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-r from-[#004f80] to-[#00609C] rounded-2xl p-6 text-white shadow-sm border border-slate-700/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md text-white font-bold text-2xl flex items-center justify-center border border-white/20 shrink-0">
              {linkedMember.nameKhmer.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  {linkedMember.nameKhmer}
                </h1>
                <span className="text-xs bg-white/20 font-mono px-2 py-0.5 rounded text-white font-semibold">
                  {linkedMember.memberCode}
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                  {linkedMember.role}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1 font-sans">
                {linkedMember.nameEnglish || '—'} · អ៊ីមែល: <span className="font-mono text-white">{linkedMember.email || userEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs bg-white/10 p-3 rounded-xl backdrop-blur-xs">
            <div>
              <span className="text-blue-200 block text-[10px]">កាលបរិច្ឆេទចូលរួម</span>
              <span className="font-mono font-bold">{linkedMember.joinDate}</span>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div>
              <span className="text-blue-200 block text-[10px]">ទូរស័ព្ទ</span>
              <span className="font-mono font-bold">{linkedMember.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>ប្រាក់សន្សំសរុបផ្ទាល់ខ្លួន</span>
            <PiggyBank className="w-4 h-4 text-[#00609C]" />
          </div>
          <div className="text-2xl font-bold text-[#00609C] font-mono tabular-nums">
            ${linkedMember.totalSavings.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            កាតព្វកិច្ចសន្សំ: ${linkedMember.monthlyCommitment}/ខែ
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>ភាគលាភទទួលបានសរុប</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            +${linkedMember.totalDividendsEarned.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            ផ្អែកលើការប្រាក់ពីកម្ចីក្លឹប
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>សមតុល្យកម្ចីកំពុងជំពាក់</span>
            <HandCoins className="w-4 h-4 text-[#F15A24]" />
          </div>
          <div className="text-2xl font-bold text-[#F15A24] font-mono tabular-nums">
            ${linkedMember.activeLoanAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">
            {ownLoans.filter(l => l.status === 'ACTIVE').length} កិច្ចសន្យាកំពុងដំណើរការ
          </div>
        </div>
      </div>

      {/* SECTION 1: Personal Savings History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-[#00609C]" />
            <span>ប្រវត្តិការបង់ប្រាក់សន្សំប្រចាំខែ (Monthly Savings History)</span>
          </h2>
          <span className="text-xs text-slate-500">
            សរុប {ownSavings.length} ប្រតិបត្តិការ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2.5 px-3 font-semibold">ឆ្នាំ/ខែ</th>
                <th className="py-2.5 px-3 font-semibold text-right">ទឹកប្រាក់សន្សំ ($)</th>
                <th className="py-2.5 px-3 font-semibold">កាលបរិច្ឆេទបង់</th>
                <th className="py-2.5 px-3 font-semibold text-center">វិធីសាស្ត្រ</th>
                <th className="py-2.5 px-3 font-semibold font-mono">លេខប្រតិបត្តិការ (Ref)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ownSavings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                    មិនទាន់មានកំណត់ត្រាប្រាក់សន្សំនៅឡើយទេ
                  </td>
                </tr>
              ) : (
                ownSavings.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 font-sans">
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      ឆ្នាំ {s.year} - ខែ {s.month} ({monthsKhmer[s.month - 1]})
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00609C] tabular-nums">
                      ${s.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {s.paymentDate}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {s.referenceNumber}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Personal Loans & Repayment Schedules */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HandCoins className="w-4 h-4 text-[#F15A24]" />
            <span>កម្ចី & កាលវិភាគសងប្រាក់ផ្ទាល់ខ្លួន (My Loans & Schedule)</span>
          </h2>
          <span className="text-xs text-slate-500">
            សរុប {ownLoans.length} កិច្ចសន្យា
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {ownLoans.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              អ្នកមិនមានកម្ចីសកម្មក្នុងក្លឹបនៅឡើយទេ
            </div>
          ) : (
            ownLoans.map((loan) => (
              <div key={loan.id} className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#00609C] text-sm">
                      {loan.loanCode}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      loan.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : loan.status === 'OVERDUE'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {loan.status === 'ACTIVE' ? 'កំពុងដំណើរការ' : loan.status === 'OVERDUE' ? 'ហួសកំណត់' : 'សងចប់'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span>ដើមខ្ចី: <strong className="text-slate-900">${loan.principalAmount.toLocaleString()}</strong></span>
                    <span>នៅជំពាក់: <strong className="text-rose-600">${loan.remainingBalance.toLocaleString()}</strong></span>
                    <span>អត្រា: <strong className="text-[#00609C]">{loan.monthlyInterestRate}%/ខែ</strong></span>
                  </div>
                </div>

                {/* Schedule preview */}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 font-semibold text-center">លើកទី</th>
                        <th className="py-2 px-3 font-semibold">ថ្ងៃផុតកំណត់</th>
                        <th className="py-2 px-3 font-semibold text-right">ដើមសង ($)</th>
                        <th className="py-2 px-3 font-semibold text-right">ការប្រាក់ ($)</th>
                        <th className="py-2 px-3 font-semibold text-right font-bold text-slate-900">សរុបត្រូវបង់ ($)</th>
                        <th className="py-2 px-3 font-semibold text-center">ស្ថានភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {loan.schedule.map((item) => (
                        <tr key={item.installmentNumber} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 text-center font-bold text-slate-700">#{item.installmentNumber}</td>
                          <td className="py-1.5 px-3 text-slate-800">{item.dueDate}</td>
                          <td className="py-1.5 px-3 text-right text-slate-700">${item.principal.toFixed(2)}</td>
                          <td className="py-1.5 px-3 text-right text-emerald-700">${item.interest.toFixed(2)}</td>
                          <td className="py-1.5 px-3 text-right font-bold text-slate-900">${item.totalDue.toFixed(2)}</td>
                          <td className="py-1.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'OVERDUE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {item.status === 'PAID' ? '✓ បានបង់' : item.status === 'OVERDUE' ? 'ហួសកំណត់' : 'រង់ចាំបង់'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
