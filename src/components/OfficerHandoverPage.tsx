import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  ShieldAlert, 
  UserCheck, 
  History, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Award,
  ArrowRight,
  Send
} from 'lucide-react';

export const OfficerHandoverPage: React.FC = () => {
  const { 
    currentUser, 
    members, 
    officerTerms, 
    transferOfficeRole 
  } = useClub();

  const isPresident = currentUser?.role === 'ប្រធានក្លឹប';

  // Form State
  const [selectedRole, setSelectedRole] = useState<'ប្រធានក្លឹប' | 'បេឡាធិការ'>('ប្រធានក្លឹប');
  
  // Filter active members who have an email address
  const eligibleMembers = members.filter(m => m.status === 'ACTIVE' && Boolean(m.email && m.email.trim() !== ''));

  const [selectedMemberId, setSelectedMemberId] = useState<string>(eligibleMembers[0]?.id || members[0]?.id || '');
  const [effectiveDate, setEffectiveDate] = useState<string>('2026-10-30');

  // Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmNameInput, setConfirmNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedNewMember = members.find(m => m.id === selectedMemberId);

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedNewMember) {
      alert('សូមជ្រើសរើសសមាជិកថ្មីដែលត្រូវទទួលមុខតំណែង');
      return;
    }

    if (selectedNewMember.role === selectedRole) {
      alert(`សមាជិក ${selectedNewMember.nameKhmer} កំពុងកាន់តំណែងជា ${selectedRole} រួចហើយ!`);
      return;
    }

    setConfirmNameInput('');
    setIsConfirmModalOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!selectedNewMember) return;
    if (confirmNameInput.trim() !== selectedNewMember.nameKhmer.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await transferOfficeRole(selectedRole, selectedNewMember.id, effectiveDate);

      if (!res.success) {
        setErrorMessage(res.error || 'បរាជ័យក្នុងការផ្ទេរមុខតំណែង');
      } else {
        setSuccessMessage(`បានផ្ទេរមុខតំណែង ${selectedRole} ជូនលោក/លោកស្រី ${selectedNewMember.nameKhmer} ដោយជោគជ័យ!`);
        setIsConfirmModalOpen(false);
      }
    } catch (err: any) {
      console.error('[Handover Error]:', err);
      setErrorMessage(err.message || 'បរាជ័យក្នុងការផ្ទេរមុខតំណែង');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#00609C]" />
            <span>ការប្តូរមុខតំណែងមន្ត្រី (Officer Handover)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ប្រព័ន្ធផ្ទេរមុខតំណែងប្រធានក្លឹប និងបេឡាធិការជាផ្លូវការ រក្សាប្រវត្តិអាណត្តិ និងទិន្នន័យ Supabase DB
          </p>
        </div>

        {/* Current User Status Chip */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs text-xs">
          <span className="text-slate-500">គណនីបច្ចុប្បន្ន៖</span>
          <strong className="text-slate-900 font-bold">{currentUser?.nameKhmer || 'Guest'}</strong>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isPresident ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
          }`}>
            {currentUser?.role || 'សមាជិក'}
          </span>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold mb-0.5">បរាជ័យក្នុងការផ្ទេរមុខតំណែង (Supabase Error) ៖</div>
            <div className="font-mono text-[11px] leading-relaxed break-all">{errorMessage}</div>
          </div>
          <button 
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Handover Form Section */}
      {isPresident ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#00609C]" />
                <span>ទម្រង់ផ្ទេរមុខតំណែង (Officer Handover Form)</span>
              </h2>
              <p className="text-xs text-slate-500">
                អាចប្រើប្រាស់បានតែប្រធានក្លឹបបច្ចុប្បន្នប៉ុណ្ណោះ។ ជ្រើសរើសមុខតំណែង និងសមាជិកដែលមានអ៊ីមែល
              </p>
            </div>
            <span className="text-[11px] bg-amber-50 text-amber-900 font-bold px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>សិទ្ធិប្រធានក្លឹប</span>
            </span>
          </div>

          <form onSubmit={handleOpenConfirmModal} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. Choose Role */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  ១. ជ្រើសរើសមុខតំណែងដែលត្រូវផ្ទេរ *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-[#00609C] bg-white text-xs"
                >
                  <option value="ប្រធានក្លឹប">ប្រធានក្លឹប (Club President)</option>
                  <option value="បេឡាធិការ">បេឡាធិការ (Club Treasurer)</option>
                </select>
              </div>

              {/* 2. Choose New Member */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  ២. ជ្រើសរើសសមាជិកថ្មីទទួលតំណែង *
                </label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-[#00609C] bg-white text-xs"
                >
                  {eligibleMembers.length === 0 ? (
                    <option value="" disabled>-- គ្មានសមាជិកដែលមានអ៊ីមែលឡើយ --</option>
                  ) : (
                    eligibleMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nameKhmer} ({m.memberCode}) — {m.email}
                      </option>
                    ))
                  )}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * បង្ហាញតែសមាជិក ACTIVE ដែលមានអ៊ីមែលត្រឹមត្រូវក្នុងប្រព័ន្ធ
                </span>
              </div>

              {/* 3. Effective Date */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  ៣. កាលបរិច្ឆេទចូលកាន់តំណែង *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    required
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:border-[#00609C]"
                  />
                </div>
              </div>
            </div>

            {/* Selected New Officer Preview Card */}
            {selectedNewMember && (
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-[#00609C] flex items-center justify-between">
                  <span>អ្នកទទួលតំណែង៖ {selectedNewMember.nameKhmer} ({selectedNewMember.nameEnglish || '—'})</span>
                  <span className="font-mono bg-blue-100 px-2 py-0.5 rounded text-[10px]">{selectedNewMember.memberCode}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 text-[11px] font-mono">
                  <div>ទូរស័ព្ទ៖ {selectedNewMember.phone}</div>
                  <div>អ៊ីមែល៖ {selectedNewMember.email || '—'}</div>
                  <div>តួនាទីបច្ចុប្បន្ន៖ {selectedNewMember.role}</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={eligibleMembers.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#00609C] hover:bg-[#004f80] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>បន្តទៅការផ្ទេរមុខតំណែង →</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Read-Only Notice for non-presidents */
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1.5 shadow-xs">
          <div className="font-bold flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-amber-700" />
            <span>ផ្ទាំងគ្រប់គ្រងសម្រាប់តែប្រធានក្លឹប (Read-Only Mode)</span>
          </div>
          <p className="leading-relaxed text-[11px] text-amber-800">
            ផ្ទាំងនេះសម្រាប់តែប្រធានក្លឹបបច្ចុប្បន្នប្រើប្រាស់ក្នុងការផ្ទេរមុខតំណែង។ អ្នកអាចមើលប្រវត្តិអាណត្តិប្រធាន និងបេឡាធិការខាងក្រោមបាន។
          </p>
        </div>
      )}

      {/* Officer Terms History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#00609C]" />
            <h2 className="text-sm font-bold text-slate-900">
              ប្រវត្តិអាណត្តិប្រធាន និងបេឡាធិការ (Officer Terms History)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            សរុប {officerTerms.length} អាណត្តិ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-4 font-semibold">ឈ្មោះមន្ត្រី / សមាជិក</th>
                <th className="py-3 px-4 font-semibold">មុខតំណែង</th>
                <th className="py-3 px-4 font-semibold">ថ្ងៃចាប់ផ្តើមអាណត្តិ</th>
                <th className="py-3 px-4 font-semibold">ថ្ងៃបញ្ចប់អាណត្តិ</th>
                <th className="py-3 px-4 font-semibold text-center">ស្ថានភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {officerTerms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-500">
                    មិនទាន់មានកំណត់ត្រាប្រវត្តិអាណន្តិនៅឡើយទេ
                  </td>
                </tr>
              ) : (
                officerTerms.map((term) => {
                  const isPresent = !term.termEnd;

                  return (
                    <tr key={term.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {term.memberName || 'សមាជិក'}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          term.role === 'ប្រធានក្លឹប'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {term.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        {term.termStart}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        {term.termEnd ? term.termEnd : <span className="text-emerald-600 font-bold font-sans">កំពុងកាន់តំណែង (Present)</span>}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isPresent
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isPresent ? 'សកម្ម (Active)' : 'បញ្ចប់ (Expired)'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION STRONG WARNING MODAL */}
      {isConfirmModalOpen && selectedNewMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5">
            {/* Warning Header */}
            <div className="flex items-center gap-3 text-rose-600 pb-3 border-b border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  ព្រមាន៖ បញ្ជាក់ការផ្ទេរមុខតំណែង {selectedRole}
                </h2>
                <p className="text-xs text-rose-600 font-semibold">
                  សូមអានលក្ខខណ្ឌព្រមានខាងក្រោមដោយប្រុងប្រយ័ត្ន!
                </p>
              </div>
            </div>

            {/* Strong Warning Notice */}
            <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl space-y-2 text-rose-900 text-xs">
              <div className="font-bold text-sm leading-relaxed text-rose-700">
                « អ្នកនឹងបាត់សិទ្ធិប្រធាន ហើយប្រធានថ្មីនឹងមានសិទ្ធិកែ និងលុបទិន្នន័យទាំងអស់ »
              </div>
              <p className="text-[11px] leading-relaxed text-rose-800">
                បន្ទាប់ពីការផ្ទេរត្រូវបានបញ្ជាក់ ប្រព័ន្ធនឹងប្តូរតួនាទីរបស់អ្នកទៅជា <strong>'សមាជិក'</strong> ហើយប្រគល់សិទ្ធិពេញលេញលើតួនាទី <strong>'{selectedRole}'</strong> ជូនលោក/លោកស្រី <strong>{selectedNewMember.nameKhmer}</strong> ភ្លាមៗ។
              </p>
            </div>

            {/* Details Summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 font-mono">
              <div><span className="text-slate-500 font-sans">មុខតំណែងផ្ទេរ៖</span> <strong className="text-slate-900 font-sans">{selectedRole}</strong></div>
              <div><span className="text-slate-500 font-sans">មន្ត្រីថ្មី៖</span> <strong className="text-[#00609C] font-sans">{selectedNewMember.nameKhmer}</strong> ({selectedNewMember.memberCode})</div>
              <div><span className="text-slate-500 font-sans">អ៊ីមែល៖</span> {selectedNewMember.email}</div>
              <div><span className="text-slate-500 font-sans">ថ្ងៃចូលកាន់តំណែង៖</span> {effectiveDate}</div>
            </div>

            {/* Require typing full Khmer name */}
            <div>
              <label className="block font-semibold text-slate-800 text-xs mb-1.5">
                ដើម្បីបញ្ជាក់ សូមវាយបញ្ចូលឈ្មោះខ្មែររបស់អ្នកទទួលតំណែង <strong className="text-rose-600 font-bold">«{selectedNewMember.nameKhmer}»</strong> ៖
              </label>
              <input
                type="text"
                placeholder={selectedNewMember.nameKhmer}
                value={confirmNameInput}
                onChange={(e) => setConfirmNameInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-xs focus:outline-none focus:border-rose-600"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold cursor-pointer"
              >
                បោះបង់
              </button>

              <button
                type="button"
                disabled={confirmNameInput.trim() !== selectedNewMember.nameKhmer.trim() || isSubmitting}
                onClick={handleConfirmTransfer}
                className="px-5 py-2 text-white bg-rose-600 hover:bg-rose-700 font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>បញ្ជាក់ការផ្ទេរមុខតំណែង</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
