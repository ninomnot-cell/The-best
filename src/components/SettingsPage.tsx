import React, { useState, useEffect } from 'react';
import { useClub } from '../context/ClubContext';
import { LateFeeType } from '../types';
import { 
  Settings, 
  Save, 
  Building2, 
  Calendar, 
  Percent, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  Loader2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { clubSettings, updateClubSettings, isOfficer, refreshData } = useClub();

  const [clubNameKhmer, setClubNameKhmer] = useState(clubSettings.clubNameKhmer);
  const [currentFiscalYear, setCurrentFiscalYear] = useState<number>(clubSettings.currentFiscalYear);
  const [memberLoanRate, setMemberLoanRate] = useState<number>(clubSettings.memberLoanRate);
  const [externalLoanRate, setExternalLoanRate] = useState<number>(clubSettings.externalLoanRate);
  const [defaultMonthlyCommitment, setDefaultMonthlyCommitment] = useState<number>(clubSettings.defaultMonthlyCommitment);
  const [lateFeeType, setLateFeeType] = useState<LateFeeType>(clubSettings.lateFeeType);
  const [lateFeeValue, setLateFeeValue] = useState<number>(clubSettings.lateFeeValue);
  const [graceDays, setGraceDays] = useState<number>(clubSettings.graceDays);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setClubNameKhmer(clubSettings.clubNameKhmer);
    setCurrentFiscalYear(clubSettings.currentFiscalYear);
    setMemberLoanRate(clubSettings.memberLoanRate);
    setExternalLoanRate(clubSettings.externalLoanRate);
    setDefaultMonthlyCommitment(clubSettings.defaultMonthlyCommitment);
    setLateFeeType(clubSettings.lateFeeType);
    setLateFeeValue(clubSettings.lateFeeValue);
    setGraceDays(clubSettings.graceDays);
  }, [clubSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isOfficer) {
      setErrorMessage('លោកអ្នកគ្មានសិទ្ធិកែប្រែការកំណត់ប្រព័ន្ធឡើយ (មានតែប្រធាន ឬបេឡាធិការ)');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await updateClubSettings({
        clubNameKhmer: clubNameKhmer.trim(),
        currentFiscalYear: Number(currentFiscalYear),
        memberLoanRate: Number(memberLoanRate),
        externalLoanRate: Number(externalLoanRate),
        defaultMonthlyCommitment: Number(defaultMonthlyCommitment),
        lateFeeType,
        lateFeeValue: Number(lateFeeValue),
        graceDays: Number(graceDays)
      });

      if (ok) {
        setIsSaved(true);
        await refreshData();
        setTimeout(() => setIsSaved(false), 2500);
      } else {
        setErrorMessage('បរាជ័យក្នុងការរក្សាទុកការកំណត់ទៅកាន់ Supabase');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'មានបញ្ហាក្នុងការរក្សាទុក');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-[#00609C] rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              ការកំណត់រចនាសម្ព័ន្ធសមាគម (Club Settings)
            </h1>
            <p className="text-xs text-slate-500">
              គ្រប់គ្រងអត្រាការប្រាក់ ឆ្នាំប្រតិបត្តិការ ថ្លៃពិន័យយឺតយ៉ាវ និងកាតព្វកិច្ចសន្សំ
            </p>
          </div>
        </div>

        {!isOfficer && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>របៀបមើលរំលង (Read-Only)</span>
          </div>
        )}
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-bold">បានរក្សាទុកការកំណត់រចនាសម្ព័ន្ធដោយជោគជ័យក្នុង Supabase!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 text-xs">
        {/* Section 1: General Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#00609C]" />
            <span>ព័ត៌មានទូទៅសមាគម (General Details)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ឈ្មោះសមាគមជាភាសាខ្មែរ *
              </label>
              <input
                type="text"
                required
                disabled={!isOfficer}
                value={clubNameKhmer}
                onChange={(e) => setClubNameKhmer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] disabled:bg-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ឆ្នាំប្រតិបត្តិការបច្ចុប្បន្ន (Fiscal Year) *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  required
                  disabled={!isOfficer}
                  value={currentFiscalYear}
                  onChange={(e) => setCurrentFiscalYear(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:border-[#00609C] disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Loan Rates & Savings */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#F15A24]" />
            <span>អត្រាការប្រាក់កម្ចី & ប្រាក់សន្សំ (Interest & Savings Rates)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                អត្រាការប្រាក់សមាជិកក្នុង (%/ខែ)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  disabled={!isOfficer}
                  value={memberLoanRate}
                  onChange={(e) => setMemberLoanRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:border-[#00609C] disabled:bg-slate-100"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                អត្រាការប្រាក់លំនាំដើមសម្រាប់សមាជិកក្នុងក្លឹប
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                អត្រាការប្រាក់អ្នកក្រៅ (%/ខែ)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  disabled={!isOfficer}
                  value={externalLoanRate}
                  onChange={(e) => setExternalLoanRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:border-[#00609C] disabled:bg-slate-100"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                អត្រាការប្រាក់លំនាំដើមសម្រាប់អ្នកក្រៅសមាគម
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                កាតព្វកិច្ចសន្សំមូលដ្ឋាន ($ USD/ខែ)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  disabled={!isOfficer}
                  value={defaultMonthlyCommitment}
                  onChange={(e) => setDefaultMonthlyCommitment(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:border-[#00609C] disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Late Fees & Grace Days */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-600" />
            <span>ការបង់យឺតយ៉ាវ & ថ្លៃពិន័យ (Late Penalty & Grace Period)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ប្រភេទថ្លៃពិន័យបង់យឺត
              </label>
              <select
                disabled={!isOfficer}
                value={lateFeeType}
                onChange={(e) => setLateFeeType(e.target.value as LateFeeType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] disabled:bg-slate-100"
              >
                <option value="NONE">គ្មានថ្លៃពិន័យ (NONE)</option>
                <option value="FLAT">ចំនួនទឹកប្រាក់ថេរ ($ Flat)</option>
                <option value="PERCENT_PER_DAY">ភាគរយតាមថ្ងៃ (% Per Day)</option>
                <option value="PERCENT_PER_MONTH">ភាគរយតាមខែ (% Per Month)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                តម្លៃ/អត្រាពិន័យ (Late Fee Value)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                disabled={!isOfficer || lateFeeType === 'NONE'}
                value={lateFeeValue}
                onChange={(e) => setLateFeeValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:border-[#00609C] disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ចំនួនថ្ងៃអនុគ្រោះយឺតយ៉ាវ (Grace Days)
              </label>
              <input
                type="number"
                min="0"
                disabled={!isOfficer}
                value={graceDays}
                onChange={(e) => setGraceDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold focus:outline-none focus:border-[#00609C] disabled:bg-slate-100"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                ចំនួនថ្ងៃអនុគ្រោះមុនពេលគណនាពិន័យ
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isOfficer && (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-white bg-[#00609C] hover:bg-[#004f80] rounded-xl font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>កំពុងរក្សាទុក...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>រក្សាទុកការកំណត់</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
