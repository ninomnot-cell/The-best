import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  PiggyBank, 
  HandCoins, 
  TrendingUp, 
  Wallet, 
  Users, 
  Clock, 
  AlertCircle, 
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Database,
  Edit3,
  LogIn,
  UserCheck
} from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';

export const Dashboard: React.FC = () => {
  const { 
    stats, 
    loans, 
    members, 
    notifications, 
    setCurrentTab, 
    setSelectedLoanForSchedule,
    setSelectedLoanForContract,
    savingsRecords,
    currentUser,
    setIsLoginModalOpen,
    setSelectedMemberForDetail
  } = useClub();

  const [isEditingOwnProfile, setIsEditingOwnProfile] = useState(false);

  const internalLoansCount = loans.filter(l => l.borrowerType === 'MEMBER' && l.status === 'ACTIVE').length;
  const externalLoansCount = loans.filter(l => l.borrowerType === 'EXTERNAL' && (l.status === 'ACTIVE' || l.status === 'OVERDUE')).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Club Introduction */}
      <div className="bg-gradient-to-r from-[#004f80] to-[#00609C] rounded-2xl p-6 sm:p-8 text-white shadow-sm border border-slate-700/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-medium text-orange-200">
              <span>សមាគមស្វ័យគ្រប់គ្រង</span>
              <span>·</span>
              <span>សមាជិកស្ថាបនិក ៨ នាក់</span>
              <span>·</span>
              <span>ឆ្នាំប្រតិបត្តិការ ២០២៤-២០២៦</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              ផ្ទាំងគ្រប់គ្រងសមាគម ឌឹ បេស៍ ហ្វាមីលី ក្លឹប
            </h1>
            <p className="text-slate-200 text-sm leading-relaxed">
              ប្រព័ន្ធតាមដានទិន្នន័យរួមបញ្ចូលគ្នា សម្រាប់ការសន្សំប្រាក់ប្រចាំខែ កម្ចីសមាជិកក្នុង និងអ្នកក្រៅសមាគម ព្រមទាំងការបែងចែកភាគលាភប្រកបដោយតម្លាភាព។
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setCurrentTab('savings')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#00609C] bg-white hover:bg-slate-50 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              <PiggyBank className="w-4 h-4 text-[#F15A24]" />
              <span>កត់ត្រាប្រាក់សន្សំ</span>
            </button>
            <button
              onClick={() => setCurrentTab('applications')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#F15A24] hover:bg-[#d94814] rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              <HandCoins className="w-4 h-4" />
              <span>ស្នើសុំកម្ចីថ្មី</span>
            </button>
          </div>
        </div>
      </div>

      {/* Member Profile Quick Action Banner */}
      {currentUser ? (
        <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#00609C] to-blue-500 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
              {currentUser.nameKhmer.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">គណនីរបស់អ្នក ៖</span>
                <span className="font-bold text-slate-900 text-sm">{currentUser.nameKhmer}</span>
                <span className="font-mono text-[11px] font-semibold text-[#00609C] bg-blue-50 px-2 py-0.5 rounded">
                  {currentUser.memberCode}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <span>ទូរស័ព្ទ: <strong className="font-mono text-slate-700">{currentUser.phone}</strong></span>
                <span>សន្សំផ្ទាល់ខ្លួន: <strong className="font-mono text-[#00609C]">${currentUser.totalSavings.toLocaleString()}</strong></span>
                <span>ភាគលាភ: <strong className="font-mono text-emerald-600">+${currentUser.totalDividendsEarned.toLocaleString()}</strong></span>
                <span>កាតព្វកិច្ច: <strong className="font-mono text-slate-700">${currentUser.monthlyCommitment}/ខែ</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditingOwnProfile(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#00609C] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>កែប្រែព័ត៌មានផ្ទាល់ខ្លួន</span>
            </button>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ប្តូរគណនី</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <UserCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <span>លោកអ្នកមិនទាន់បាន Log In ឡើយ។ សូមជ្រើសរើស ឬ Log in គណនីសមាជិករបស់អ្នកដើម្បីកែប្រែព័ត៌មាន និងគ្រប់គ្រងប្រតិបត្តិការ។</span>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg cursor-pointer shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In ចូលប្រើប្រព័ន្ធ</span>
          </button>
        </div>
      )}

      {/* 4 Primary Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Savings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">មូលនិធិសន្សំសរុប</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#00609C]">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              ${stats.totalClubSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-emerald-600 font-medium font-mono">100%</span>
              <span>ការបង់សន្សំទៀងទាត់</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Loans */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">កម្ចីកំពុងដំណើរការ</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F15A24]">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              ${stats.totalActiveLoans.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span>សមាជិក {internalLoansCount} នាក់</span>
              <span>·</span>
              <span>អ្នកក្រៅ {externalLoansCount} នាក់</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Interest Earned */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ការប្រាក់ប្រមូលបាន</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-emerald-700 tabular-nums">
              +${stats.totalInterestEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span>សម្រាប់បែងចែកជាភាគលាភ</span>
            </div>
          </div>
        </div>

        {/* Card 4: Cash on Hand */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">សាច់ប្រាក់ជាក់ស្តែងក្នុងដៃ</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              ${stats.cashOnHand.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-slate-600">សមតុល្យបេឡាក្លឹបមានស្រាប់</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setCurrentTab('members')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#00609C] hover:bg-blue-50/20 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <Users className="w-4 h-4 text-[#00609C]" />
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00609C] transition-colors" />
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-800">សមាជិកទាំង ៨ នាក់</div>
          <div className="text-[11px] text-slate-500">មើលសមតុល្យ & ប្រវត្តិ</div>
        </button>

        <button
          onClick={() => setCurrentTab('loans')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#F15A24] hover:bg-orange-50/20 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <FileSpreadsheet className="w-4 h-4 text-[#F15A24]" />
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#F15A24] transition-colors" />
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-800">តារាងបង់ប្រាក់កម្ចី</div>
          <div className="text-[11px] text-slate-500">កាលវិភាគ & ការប្រាក់</div>
        </button>

        <button
          onClick={() => setCurrentTab('reminders')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-rose-400 hover:bg-rose-50/20 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-800">ជូនដំណឹង & SMS</div>
          <div className="text-[11px] text-slate-500">{notifications.length} កម្ចីត្រូវបង់</div>
        </button>

        <button
          onClick={() => setCurrentTab('database')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/20 text-left transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <Database className="w-4 h-4 text-indigo-600" />
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-800">រចនាសម្ព័ន្ធ Database</div>
          <div className="text-[11px] text-slate-500">ERD & SQL Schema</div>
        </button>
      </div>

      {/* Operational Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Loans Due & Action Alert */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                កាលវិភាគបង់ប្រាក់ដែលត្រូវយកចិត្តទុកដាក់
              </h2>
              <p className="text-xs text-slate-500">
                បញ្ជីកម្ចីដែលដល់កាលបរិច្ឆេទសង ឬហួសកាលកំណត់ ដែលតម្រូវឱ្យផ្ញើសារ SMS រំលឹក
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('reminders')}
              className="text-xs font-medium text-[#00609C] hover:underline whitespace-nowrap cursor-pointer"
            >
              មើលទាំងអស់ ({notifications.length}) →
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                មិនមានកម្ចីណាដល់ថ្ងៃកំណត់ ឬយឺតយ៉ាវទេនាពេលនេះ
              </div>
            ) : (
              notifications.map((item) => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {item.borrowerName}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.status === 'OVERDUE' 
                          ? 'bg-rose-100 text-rose-700' 
                          : item.status === 'DUE_TODAY'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {item.status === 'OVERDUE' ? 'ហួសកំណត់' : item.status === 'DUE_TODAY' ? 'ដល់ថ្ងៃត្រូវបង់ថ្ងៃនេះ' : 'ជិតដល់ថ្ងៃបង់'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>ទូរស័ព្ទ: <span className="font-mono">{item.borrowerPhone}</span></span>
                      <span>·</span>
                      <span>លើកទី <span className="font-mono">{item.installmentNumber}</span></span>
                      <span>·</span>
                      <span>ផុតកំណត់: <span className="font-mono font-medium">{item.dueDate}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">ទឹកប្រាក់ត្រូវបង់</div>
                      <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                        ${item.totalDue.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentTab('reminders')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg transition-colors cursor-pointer"
                    >
                      ផ្ញើ SMS
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: 8 Members Status Quick View */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                សមាជិកទាំង ៨ រូប
              </h2>
              <button
                onClick={() => setCurrentTab('members')}
                className="text-xs font-medium text-[#00609C] hover:underline cursor-pointer"
              >
                មើលលម្អិត →
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {members.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-700">
                      {m.nameKhmer.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{m.nameKhmer}</div>
                      <div className="text-[10px] text-slate-500">{m.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-slate-900 tabular-nums">
                      ${m.totalSavings.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-mono">
                      +${m.totalDividendsEarned} ភាគលាភ
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ការបង់សន្សំខែ ១០/២០២៦</span>
            <span className="font-semibold text-emerald-600 font-mono">៨ / ៨ នាក់ (100%)</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal from Dashboard */}
      {isEditingOwnProfile && currentUser && (
        <EditProfileModal
          member={currentUser}
          onClose={() => setIsEditingOwnProfile(false)}
        />
      )}
    </div>
  );
};
