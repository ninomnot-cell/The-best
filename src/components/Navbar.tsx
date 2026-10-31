import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  Bell, 
  Database, 
  PlusCircle, 
  Award, 
  Receipt, 
  Scale, 
  Lock, 
  UserMinus, 
  Settings, 
  FileCode2, 
  ChevronDown, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    notifications, 
    applications,
    currentUser,
    supabaseUser,
    supabaseSignOut,
    setIsLoginModalOpen,
    stats,
    isOfficer
  } = useClub();

  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  const pendingAppsCount = applications.filter(a => a.status === 'PENDING').length;
  const overdueOrDueCount = notifications.length;

  const handleNavClick = (tab: string) => {
    setCurrentTab(tab);
    setIsAdminDropdownOpen(false);
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand Wordmark with Logo */}
          <div 
            onClick={() => handleNavClick('dashboard')} 
            className="flex items-center gap-3 cursor-pointer whitespace-nowrap shrink-0 select-none"
          >
            <img 
              src="/assets/aistudio/THE_BEST_LOGO2_e1c656fe.png" 
              alt="The Best Family Club Logo" 
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-base font-bold text-[#00609C] tracking-tight leading-tight">
                ឌឹ បេស៍ ហ្វាមីលី ក្លឹប
              </span>
              <span className="text-[11px] font-semibold text-[#F15A24] tracking-wider uppercase leading-none">
                The Best Family Club
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-600">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`hover:text-[#00609C] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'border-[#00609C] text-[#00609C] font-bold'
                  : 'border-transparent'
              }`}
            >
              ផ្ទាំងគ្រប់គ្រង
            </button>

            <button
              onClick={() => handleNavClick('members')}
              className={`hover:text-[#00609C] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
                currentTab === 'members'
                  ? 'border-[#00609C] text-[#00609C] font-bold'
                  : 'border-transparent'
              }`}
            >
              សមាជិក ({stats.memberCount} នាក់)
            </button>

            <button
              onClick={() => handleNavClick('savings')}
              className={`hover:text-[#00609C] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
                currentTab === 'savings'
                  ? 'border-[#00609C] text-[#00609C] font-bold'
                  : 'border-transparent'
              }`}
            >
              ការសន្សំប្រចាំខែ
            </button>

            <button
              onClick={() => handleNavClick('loans')}
              className={`hover:text-[#00609C] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
                currentTab === 'loans'
                  ? 'border-[#00609C] text-[#00609C] font-bold'
                  : 'border-transparent'
              }`}
            >
              កម្ចី & តារាងបង់
            </button>

            <button
              onClick={() => handleNavClick('expenses')}
              className={`hover:text-[#00609C] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
                currentTab === 'expenses'
                  ? 'border-[#00609C] text-[#00609C] font-bold'
                  : 'border-transparent'
              }`}
            >
              ចំណាយសមាគម
            </button>

            <button
              onClick={() => handleNavClick('reports')}
              className={`hover:text-[#00609C] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
                currentTab === 'reports'
                  ? 'border-[#00609C] text-[#00609C] font-bold'
                  : 'border-transparent'
              }`}
            >
              របាយការណ៍
            </button>

            <button
              onClick={() => handleNavClick('my_account')}
              className={`hover:text-[#00609C] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
                currentTab === 'my_account'
                  ? 'border-[#00609C] text-[#00609C] font-bold'
                  : 'border-transparent'
              }`}
            >
              គណនីរបស់ខ្ញុំ
            </button>

            <button
              onClick={() => handleNavClick('reconcile')}
              className={`hover:text-[#00609C] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
                currentTab === 'reconcile'
                  ? 'border-[#00609C] text-[#00609C] font-bold'
                  : 'border-transparent'
              }`}
            >
              ផ្ទៀងផ្ទាត់សាច់ប្រាក់
            </button>

            {/* Admin & Management Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAdminDropdownOpen(prev => !prev)}
                className={`inline-flex items-center gap-1 hover:text-[#00609C] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 cursor-pointer ${
                  ['settings', 'year_end', 'exits', 'handover', 'audit_log', 'dividends', 'database'].includes(currentTab)
                    ? 'border-[#00609C] text-[#00609C] font-bold'
                    : 'border-transparent'
                }`}
              >
                <span>គ្រប់គ្រង/កំណត់</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isAdminDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs text-slate-700 animate-fadeIn"
                  onMouseLeave={() => setIsAdminDropdownOpen(false)}
                >
                  <button
                    onClick={() => handleNavClick('year_end')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-purple-600" />
                    <span>បិទបញ្ជីប្រចាំឆ្នាំ (Year-End)</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('exits')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <UserMinus className="w-3.5 h-3.5 text-amber-600" />
                    <span>សមាជិកចាកចេញ (Exit)</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('handover')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>ប្តូរមុខតំណែង (Handover)</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('settings')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-600" />
                    <span>ការកំណត់ប្រព័ន្ធ (Settings)</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('audit_log')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>ប្រវត្តិ Audit Log</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => handleNavClick('dividends')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ការប្រាក់ & ភាគលាភ</span>
                  </button>

                  <button
                    onClick={() => handleNavClick('database')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-slate-500"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>រចនាសម្ព័ន្ធ DB</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Actions + Reminders + Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton />

            <button
              onClick={() => handleNavClick('reminders')}
              title="ប្រព័ន្ធជូនដំណឹង & SMS រំលឹកសងកម្ចី"
              className="relative p-2 text-slate-600 hover:text-[#00609C] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {overdueOrDueCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full tabular-nums">
                  {overdueOrDueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('applications')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#F15A24] hover:bg-[#d94814] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ស្នើសុំកម្ចី</span>
              {pendingAppsCount > 0 && (
                <span className="bg-white text-[#F15A24] text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                  {pendingAppsCount}
                </span>
              )}
            </button>

            {/* Current Member Profile Info */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  title="ចុចដើម្បីប្តូរគណនីសមាជិក (Switch Member)"
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#00609C] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {currentUser.nameKhmer.charAt(0)}
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#00609C] truncate max-w-28">
                      {currentUser.nameKhmer}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono leading-none">
                      {currentUser.role}
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-1.5 text-xs font-bold text-[#00609C] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                ចូលប្រើ (Log In)
              </button>
            )}

            {/* Supabase Auth User & Logout */}
            {supabaseUser && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
                <div className="text-right hidden xl:block">
                  <div className="text-[10px] text-emerald-600 font-bold font-mono">
                    Supabase Auth Active
                  </div>
                  <div className="text-[11px] text-slate-600 truncate max-w-32 font-mono">
                    {supabaseUser.email}
                  </div>
                </div>
                <button
                  onClick={supabaseSignOut}
                  title="ចាកចេញពី Supabase Auth (Sign Out)"
                  className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  ចាកចេញ
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Sub-strip for small screens */}
        <div className="md:hidden flex items-center gap-2 py-2 border-t border-slate-100 overflow-x-auto text-xs font-medium">
          <button 
            onClick={() => handleNavClick('dashboard')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${currentTab === 'dashboard' ? 'bg-[#00609C] text-white' : 'text-slate-600'}`}
          >
            ផ្ទាំងគ្រប់គ្រង
          </button>
          <button 
            onClick={() => handleNavClick('members')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${currentTab === 'members' ? 'bg-[#00609C] text-white' : 'text-slate-600'}`}
          >
            សមាជិក ({stats.memberCount})
          </button>
          <button 
            onClick={() => handleNavClick('savings')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${currentTab === 'savings' ? 'bg-[#00609C] text-white' : 'text-slate-600'}`}
          >
            ការសន្សំ
          </button>
          <button 
            onClick={() => handleNavClick('loans')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${currentTab === 'loans' ? 'bg-[#00609C] text-white' : 'text-slate-600'}`}
          >
            កម្ចី
          </button>
          <button 
            onClick={() => handleNavClick('expenses')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${currentTab === 'expenses' ? 'bg-[#00609C] text-white' : 'text-slate-600'}`}
          >
            ចំណាយ
          </button>
          <button 
            onClick={() => handleNavClick('reconcile')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${currentTab === 'reconcile' ? 'bg-[#00609C] text-white' : 'text-slate-600'}`}
          >
            ផ្ទៀងផ្ទាត់
          </button>
          <button 
            onClick={() => handleNavClick('settings')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${currentTab === 'settings' ? 'bg-[#00609C] text-white' : 'text-slate-600'}`}
          >
            ការកំណត់
          </button>
        </div>
      </div>
    </header>
  );
};
