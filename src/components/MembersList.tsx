import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { Member } from '../types';
import { 
  Users, 
  Phone, 
  Calendar, 
  PiggyBank, 
  TrendingUp, 
  Plus, 
  X, 
  CheckCircle2, 
  FileText,
  CreditCard,
  Building,
  UserCheck,
  Edit3,
  LogIn,
  ShieldCheck,
  Briefcase,
  Mail,
  MapPin,
  KeyRound,
  Download
} from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';
import { exportMembersToCSV } from '../utils/exportCsv';

export const MembersList: React.FC = () => {
  const { 
    members, 
    savingsRecords, 
    loans, 
    addMember, 
    selectedMemberForDetail, 
    setSelectedMemberForDetail,
    setCurrentTab,
    setSelectedLoanForSchedule,
    currentUser,
    quickLoginAsMember,
    setIsLoginModalOpen
  } = useClub();

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberNameKh, setNewMemberNameKh] = useState('');
  const [newMemberNameEn, setNewMemberNameEn] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberIdCard, setNewMemberIdCard] = useState('');
  const [newMemberJoinDate, setNewMemberJoinDate] = useState('2026-10-27');
  const [newMemberRole, setNewMemberRole] = useState<'ប្រធានក្លឹប' | 'អនុប្រធាន' | 'បេឡាធិការ' | 'គណនេយ្យករ' | 'សមាជិក'>('សមាជិក');
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [newMemberCommitment, setNewMemberCommitment] = useState(100);

  const totalClubSavings = members.reduce((sum, m) => sum + m.totalSavings, 0);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberNameKh || !newMemberPhone || !newMemberIdCard) return;

    addMember({
      nameKhmer: newMemberNameKh,
      nameEnglish: newMemberNameEn,
      phone: newMemberPhone,
      idCardNumber: newMemberIdCard,
      joinDate: newMemberJoinDate,
      role: newMemberRole,
      monthlyCommitment: Number(newMemberCommitment),
      address: newMemberAddress,
      status: 'ACTIVE'
    });

    setIsAddModalOpen(false);
    setNewMemberNameKh('');
    setNewMemberNameEn('');
    setNewMemberPhone('');
    setNewMemberIdCard('');
    setNewMemberAddress('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00609C]" />
            <span>បញ្ជីសមាជិកស្ថាបនិក (៨ នាក់)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            សមាជិកនីមួយៗមានកាតព្វកិច្ចសន្សំប្រាក់ប្រចាំខែ និងសិទ្ធិទទួលបានកម្ចីព្រមទាំងភាគលាភវិនិយោគ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportMembersToCSV(members, totalClubSavings)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-xs cursor-pointer"
            title="ទាញយកបញ្ជីសមាជិកជា CSV (Excel)"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>ទាញយក CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>បន្ថែមសមាជិកថ្មី</span>
          </button>
        </div>
      </div>

      {/* Members Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((member) => {
          const sharePercentage = totalClubSavings > 0 
            ? ((member.totalSavings / totalClubSavings) * 100).toFixed(1) 
            : '0';
          const isCurrent = currentUser?.id === member.id;

          return (
            <div
              key={member.id}
              className={`bg-white border rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between ${
                isCurrent 
                  ? 'border-[#00609C] ring-2 ring-blue-500/20' 
                  : 'border-slate-200 hover:border-[#00609C]'
              }`}
            >
              <div>
                {/* Top Row: Code & Role */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-semibold text-[#00609C]">
                      {member.memberCode}
                    </span>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>អ្នកកំពុងប្រើ</span>
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    member.role === 'ប្រធានក្លឹប'
                      ? 'bg-amber-100 text-amber-900 font-semibold'
                      : member.role === 'អនុប្រធាន'
                      ? 'bg-blue-100 text-blue-900'
                      : member.role === 'បេឡាធិការ' || member.role === 'គណនេយ្យករ'
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {member.role}
                  </span>
                </div>

                {/* Profile Head */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00609C] to-blue-400 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {member.nameKhmer.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <h2 className="text-sm font-bold text-slate-900 truncate">
                      {member.nameKhmer}
                    </h2>
                    <div className="text-[11px] text-slate-500 truncate font-sans">
                      {member.nameEnglish || '—'}
                    </div>
                  </div>
                </div>

                {/* Info Fields */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-800">{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>ចូលរួម: <span className="font-mono">{member.joinDate}</span></span>
                  </div>
                  {member.occupation && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">មុខរបរ: <span className="text-slate-800">{member.occupation}</span></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>អត្តសញ្ញាណប័ណ្ណ: <span className="font-mono">{member.idCardNumber}</span></span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">ទឹកប្រាក់សន្សំសរុប:</span>
                    <span className="font-bold text-[#00609C] font-mono tabular-nums text-sm">
                      ${member.totalSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">ចំណែកក្នុងមូលនិធិ:</span>
                    <span className="font-semibold text-slate-700 font-mono">
                      {sharePercentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">ភាគលាភទទួលបាន:</span>
                    <span className="font-semibold text-emerald-600 font-mono">
                      +${member.totalDividendsEarned.toLocaleString()}
                    </span>
                  </div>

                  {member.activeLoanAmount > 0 && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                      <span className="text-rose-600 font-medium">កម្ចីកំពុងជំពាក់:</span>
                      <span className="font-bold text-rose-600 font-mono">
                        ${member.activeLoanAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setEditingMember(member)}
                    className="py-1.5 px-2 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                    title="កែប្រែព័ត៌មានផ្ទាល់ខ្លួន"
                  >
                    <Edit3 className="w-3 h-3 text-[#00609C]" />
                    <span>កែព័ត៌មាន</span>
                  </button>

                  {isCurrent ? (
                    <span className="py-1.5 px-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg text-center flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>គណនីសកម្ម</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => quickLoginAsMember(member.id)}
                      className="py-1.5 px-2 text-[11px] font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                      title="Log in ចូលប្រើជាសមាជិកនេះ"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>Log in ចូល</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedMemberForDetail(member)}
                  className="w-full py-1.5 text-xs font-semibold text-[#00609C] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer text-center"
                >
                  មើលប្រវត្តិបង់ប្រាក់ & គណនី →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Details & History Modal */}
      {selectedMemberForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#00609C] text-white font-bold text-lg flex items-center justify-center">
                  {selectedMemberForDetail.nameKhmer.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedMemberForDetail.nameKhmer}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-[#00609C] rounded font-mono">
                      {selectedMemberForDetail.memberCode}
                    </span>
                    {currentUser?.id === selectedMemberForDetail.id && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>គណនីបច្ចុប្បន្ន</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedMemberForDetail.nameEnglish || '—'} · តួនាទី: <span className="font-semibold text-slate-700">{selectedMemberForDetail.role}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingMember(selectedMemberForDetail);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>កែប្រែព័ត៌មាន</span>
                </button>
                <button
                  onClick={() => setSelectedMemberForDetail(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Financial Overview Cards for this Member */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5">
                <div className="text-xs text-slate-600">ទឹកប្រាក់សន្សំសរុប</div>
                <div className="text-xl font-bold text-[#00609C] font-mono tabular-nums mt-1">
                  ${selectedMemberForDetail.totalSavings.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  កាតព្វកិច្ច: ${selectedMemberForDetail.monthlyCommitment}/ខែ
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5">
                <div className="text-xs text-slate-600">ភាគលាភទទួលបាន</div>
                <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
                  +${selectedMemberForDetail.totalDividendsEarned.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  ផ្អែកលើការប្រាក់ពីកម្ចី
                </div>
              </div>

              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3.5">
                <div className="text-xs text-slate-600">កម្ចីសកម្មក្នុងក្លឹប</div>
                <div className="text-xl font-bold text-[#F15A24] font-mono tabular-nums mt-1">
                  ${selectedMemberForDetail.activeLoanAmount.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  អត្រាពិសេស ១.២%/ខែ
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-slate-50 rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">ព័ត៌មានលម្អិតទំនាក់ទំនង និងគណនី៖</span>
                <button
                  onClick={() => setEditingMember(selectedMemberForDetail)}
                  className="text-xs text-[#00609C] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>កែប្រែព័ត៌មាននេះ</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>លេខទូរស័ព្ទ: <strong className="font-mono text-slate-900">{selectedMemberForDetail.phone}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>កាលបរិច្ឆេទចូលរួម: <strong className="font-mono text-slate-900">{selectedMemberForDetail.joinDate}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>អត្តសញ្ញាណប័ណ្ណ: <strong className="font-mono text-slate-900">{selectedMemberForDetail.idCardNumber}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>មុខរបរ/អាជីវកម្ម: <strong className="text-slate-900">{selectedMemberForDetail.occupation || 'មិនទាន់បញ្ជាក់'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>អ៊ីមែល: <strong className="font-mono text-slate-900">{selectedMemberForDetail.email || '—'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>កូដ PIN ចូលប្រើ: <strong className="font-mono text-slate-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{selectedMemberForDetail.pin || '1234'}</strong></span>
                </div>
                <div className="sm:col-span-2 flex items-start gap-1.5 pt-1 border-t border-slate-200/60">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>អាសយដ្ឋាន: <strong className="text-slate-900">{selectedMemberForDetail.address || 'រាជធានីភ្នំពេញ'}</strong></span>
                </div>
              </div>
            </div>

            {/* Payment History Table (ប្រវត្តិការបង់ប្រាក់) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-[#00609C]" />
                  <span>ប្រវត្តិការបង់ប្រាក់សន្សំប្រចាំខែ (Payment Records)</span>
                </h3>
                <span className="text-xs text-slate-500">
                  សរុប {savingsRecords.filter(r => r.memberId === selectedMemberForDetail.id).length} ខែ
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">ខែ/ឆ្នាំ</th>
                      <th className="py-2.5 px-3 font-semibold">កាលបរិច្ឆេទបង់</th>
                      <th className="py-2.5 px-3 font-semibold">ចំនួនទឹកប្រាក់</th>
                      <th className="py-2.5 px-3 font-semibold">មធ្យោបាយ</th>
                      <th className="py-2.5 px-3 font-semibold">លេខកូដវិក្កយបត្រ</th>
                      <th className="py-2.5 px-3 font-semibold">អ្នកកត់ត្រា</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {savingsRecords
                      .filter(r => r.memberId === selectedMemberForDetail.id)
                      .map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-medium text-slate-900 font-mono">
                            ខែ {rec.month}/{rec.year}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono">
                            {rec.paymentDate}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 font-mono tabular-nums">
                            ${rec.amount.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {rec.paymentMethod}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                            {rec.referenceNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {rec.recordedBy}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Member Loans if any */}
            {loans.some(l => l.borrowerId === selectedMemberForDetail.id) && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  កម្ចីក្នុងសមាគមរបស់សមាជិកនេះ
                </h3>
                <div className="space-y-2">
                  {loans
                    .filter(l => l.borrowerId === selectedMemberForDetail.id)
                    .map(loan => (
                      <div key={loan.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-900">{loan.loanCode} - {loan.purpose}</div>
                          <div className="text-slate-500">
                            ដើម: ${loan.principalAmount} · ការប្រាក់: {loan.monthlyInterestRate}%/ខែ · រយៈពេល: {loan.termMonths} ខែ
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedLoanForSchedule(loan);
                            setSelectedMemberForDetail(null);
                            setCurrentTab('loans');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#00609C] rounded hover:bg-[#004f80] cursor-pointer"
                        >
                          មើលតារាងបង់
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingMember(selectedMemberForDetail);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>កែប្រែព័ត៌មានផ្ទាល់ខ្លួន</span>
                </button>

                {currentUser?.id !== selectedMemberForDetail.id && (
                  <button
                    onClick={() => {
                      quickLoginAsMember(selectedMemberForDetail.id);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-[#00609C] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log in ចូលប្រើគណនីនេះ</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedMemberForDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                បិទផ្ទាំង
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                ចុះឈ្មោះសមាជិកថ្មី (New Member)
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ឈ្មោះជាភាសាខ្មែរ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. សុខ ចិន្តា"
                  value={newMemberNameKh}
                  onChange={(e) => setNewMemberNameKh(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ឈ្មោះជាអក្សរឡាតាំង (English Name)
                </label>
                <input
                  type="text"
                  placeholder="Sok Chenda"
                  value={newMemberNameEn}
                  onChange={(e) => setNewMemberNameEn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    លេខទូរស័ព្ទ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="012 345 678"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    លេខអត្តសញ្ញាណប័ណ្ណ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="010293847"
                    value={newMemberIdCard}
                    onChange={(e) => setNewMemberIdCard(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    តួនាទីក្នុងក្លឹប
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  >
                    <option value="សមាជិក">សមាជិក</option>
                    <option value="ប្រធានក្លឹប">ប្រធានក្លឹប</option>
                    <option value="អនុប្រធាន">អនុប្រធាន</option>
                    <option value="បេឡាធិការ">បេឡាធិការ</option>
                    <option value="គណនេយ្យករ">គណនេយ្យករ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    កាតព្វកិច្ចសន្សំ/ខែ ($)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={newMemberCommitment}
                    onChange={(e) => setNewMemberCommitment(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  កាលបរិច្ឆេទចូលរួម
                </label>
                <input
                  type="date"
                  value={newMemberJoinDate}
                  onChange={(e) => setNewMemberJoinDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  អាសយដ្ឋានបច្ចុប្បន្ន
                </label>
                <textarea
                  rows={2}
                  placeholder="រាជធានីភ្នំពេញ..."
                  value={newMemberAddress}
                  onChange={(e) => setNewMemberAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg font-medium cursor-pointer"
                >
                  រក្សាទុកសមាជិក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Profile Modal */}
      {editingMember && (
        <EditProfileModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
};
