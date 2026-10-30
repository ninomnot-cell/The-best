import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  Lock, 
  Mail, 
  UserPlus, 
  LogIn, 
  ShieldCheck, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

interface SupabaseAuthPageProps {
  onSuccess?: () => void;
  onContinueOffline?: () => void;
}

export const SupabaseAuthPage: React.FC<SupabaseAuthPageProps> = ({ 
  onSuccess,
  onContinueOffline 
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('សូមបញ្ចូលអ៊ីមែល និងលេខកូដសម្ងាត់ (Email and password are required)');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('លេខកូដសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ (Password must be at least 6 characters)');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          setErrorMessage(
            error.message === 'Invalid login credentials' 
              ? 'អ៊ីមែល ឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវឡើយ។ សូមពិនិត្យឡើងវិញ ឬចុះឈ្មោះគណនីថ្មី។'
              : `បរាជ័យក្នុងការចូលប្រើ៖ ${error.message}`
          );
        } else {
          setSuccessMessage('បានចូលប្រើប្រព័ន្ធដោយជោគជ័យ! កំពុងទាញយកទិន្នន័យពី Supabase...');
          if (onSuccess) onSuccess();
        }
      } else {
        const { error, data } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          setErrorMessage(`បរាជ័យក្នុងការបង្កើតគណនី៖ ${error.message}`);
        } else {
          if (data.session) {
            setSuccessMessage('បង្កើតគណនី និងចូលប្រើប្រព័ន្ធជោគជ័យ!');
            if (onSuccess) onSuccess();
          } else {
            setSuccessMessage('បង្កើតគណនីបានជោគជ័យ! សូមពិនិត្យអ៊ីមែលរបស់អ្នកដើម្បីផ្ទៀងផ្ទាត់ ឬចូលប្រើប្រព័ន្ធ។');
            setMode('login');
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'មានបញ្ហាមិនរំពឹងទុកកើតឡើង');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00609C]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#F15A24]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-3">
          <img 
            src="/assets/aistudio/THE_BEST_LOGO2_e1c656fe.png" 
            alt="The Best Family Club Logo" 
            className="h-14 w-auto object-contain bg-white/90 p-2 rounded-xl shadow-lg"
          />
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-white font-khmer">
          ឌឹ បេស៍ ហ្វាមីលី ក្លឹប
        </h1>
        <p className="text-center text-xs text-orange-400 font-bold uppercase tracking-widest mt-0.5">
          The Best Family Club Management
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          ប្រព័ន្ធគ្រប់គ្រងសមាជិក ការសន្សំប្រាក់ កម្ចី និងទិន្នន័យ Realtime (Supabase Cloud Sync)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200/80">
          {/* Supabase Status Alert */}
          {!isSupabaseConfigured ? (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>សូមកំណត់ Supabase Environment Variables</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                មិនទាន់ឃើញកំណត់ <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_URL</code> និង <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> ក្នុងកំណត់ត្រា Environment នៅឡើយ។
              </p>
              {onContinueOffline && (
                <button
                  onClick={onContinueOffline}
                  className="w-full mt-2 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>បន្តប្រើប្រាស់ទិន្នន័យ Demo បណ្ដោះអាសន្ន</span>
                </button>
              )}
            </div>
          ) : (
            <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">បានតភ្ជាប់ Supabase Cloud DB៖</span>
                <span className="text-emerald-700 block font-mono text-[11px] truncate">
                  {import.meta.env.VITE_SUPABASE_URL}
                </span>
              </div>
            </div>
          )}

          {/* Login / Sign Up Tab Switch */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 rounded-md transition-all cursor-pointer text-center ${
                mode === 'login' 
                  ? 'bg-white text-[#00609C] shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ចូលប្រើប្រព័ន្ធ (Sign In)
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 rounded-md transition-all cursor-pointer text-center ${
                mode === 'signup' 
                  ? 'bg-white text-[#00609C] shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ចុះឈ្មោះគណនី (Sign Up)
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl leading-relaxed">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl leading-relaxed font-semibold">
                {successMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                អាសយដ្ឋានអ៊ីមែល (Email Address) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@thebestclub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C] focus:ring-1 focus:ring-[#00609C] text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                លេខកូដសម្ងាត់ (Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C] focus:ring-1 focus:ring-[#00609C] text-xs font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                លេខកូដសម្ងាត់យ៉ាងតិច ៦ តួអក្សរ
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#00609C] hover:bg-[#004f80] text-white font-bold rounded-xl transition-colors cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>ចូលប្រើប្រព័ន្ធតាម Supabase Auth</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>ចុះឈ្មោះគណនី Supabase</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials hint */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
            <div className="font-semibold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00609C]" />
              <span>ព័ត៌មានអំពី Supabase Auth ៖</span>
            </div>
            <p className="leading-relaxed">
              ទិន្នន័យទាំងអស់ (សមាជិក ៨ នាក់ កម្ចី និងប្រាក់សន្សំ) ត្រូវទាញយក និងរក្សាទុកក្នុង Supabase Database ដោយស្វ័យប្រវត្តិ ព្រមទាំងបច្ចុប្បន្នភាព Realtime ឆ្លងកាត់គ្រប់ឧបករណ៍។
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
