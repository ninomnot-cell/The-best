import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  LogIn, 
  X, 
  UserCheck, 
  KeyRound, 
  Phone, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { 
    members, 
    currentUser, 
    login, 
    quickLoginAsMember, 
    isLoginModalOpen, 
    setIsLoginModalOpen 
  } = useClub();

  const [loginInput, setLoginInput] = useState('');
  const [pinInput, setPinInput] = useState('1234');
  const [errorMessage, setErrorMessage] = useState('');
  const [loginMode, setLoginMode] = useState<'quick' | 'form'>('quick');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginInput.trim()) {
      setErrorMessage('សូមវាយបញ្ចូលលេខទូរស័ព្ទ ឬលេខកូដសមាជិក');
      return;
    }

    const success = login(loginInput.trim(), pinInput.trim());
    if (!success) {
      setErrorMessage('លេខទូរស័ព្ទ/កូដសមាជិក ឬលេខកូដ PIN មិនត្រឹមត្រូវឡើយ (PIN លំនាំដើម: 1234)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/THE_BEST_LOGO2_e1c656fe.png" 
              alt="Logo" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ចូលប្រើប្រព័ន្ធសមាគម (Log In)
              </h2>
              <p className="text-xs text-slate-500">
                ឌឹ បេស៍ ហ្វាមីលី ក្លឹប / The Best Family Club
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Quick Login and Manual PIN Login */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setLoginMode('quick')}
            className={`flex-1 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              loginMode === 'quick' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            ចូលរហ័ស (សមាជិកទាំង ៨)
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('form')}
            className={`flex-1 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              loginMode === 'form' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            ចូលតាមលេខទូរស័ព្ទ & PIN
          </button>
        </div>

        {loginMode === 'quick' ? (
          /* Quick Click Member Selector */
          <div className="space-y-3">
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ជ្រើសរើសគណនីសមាជិកដើម្បីចូលប្រើប្រព័ន្ធភ្លាមៗ ៖</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto p-1">
              {members.map((member) => {
                const isCurrent = currentUser?.id === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => quickLoginAsMember(member.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-[#00609C] bg-blue-50/50 ring-1 ring-[#00609C]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-full bg-[#00609C] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {member.nameKhmer.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                          <span>{member.nameKhmer}</span>
                          {isCurrent && <span className="text-[10px] text-[#00609C] font-semibold">(បច្ចុប្បន្ន)</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {member.memberCode} · {member.role}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Manual Login Form */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                លេខទូរស័ព្ទ ឬលេខកូដសមាជិក *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="ឧ. 012 889 901 ឬ TBF-001"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                លេខកូដសម្ងាត់ PIN (៤ ខ្ទង់) *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="1234"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] font-mono tracking-widest text-xs"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                លេខកូដ PIN លំនាំដើមរបស់សមាជិកទាំងអស់គឺ៖ <strong className="font-mono text-slate-700">1234</strong> (អាចប្តូរបានក្នុងព័ត៌មានផ្ទាល់ខ្លួន)
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>ចូលប្រើប្រព័ន្ធ</span>
              </button>
            </div>
          </form>
        )}

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
          <div className="font-semibold text-slate-800 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>សិទ្ធិប្រើប្រាស់តាមតួនាទី ៖</span>
          </div>
          <p>
            • <strong>ប្រធានក្លឹប / គណនេយ្យករ / បេឡា ៖</strong> មានសិទ្ធិអនុម័តកម្ចី កត់ត្រាការបង់ប្រាក់សន្សំ និងគ្រប់គ្រងប្រតិបត្តិការទាំងអស់។<br />
            • <strong>សមាជិកទូទៅ ៖</strong> អាចមើលប្រវត្តិសន្សំ ប្រាក់សរុប ភាគលាភ កែប្រែព័ត៌មានផ្ទាល់ខ្លួន និងដាក់ពាក្យស្នើសុំកម្ចី។
          </p>
        </div>
      </div>
    </div>
  );
};
