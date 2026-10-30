/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClubProvider, useClub } from './context/ClubContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { MembersList } from './components/MembersList';
import { SavingsManager } from './components/SavingsManager';
import { LoansManager } from './components/LoansManager';
import { LoanApplicationForm } from './components/LoanApplicationForm';
import { NotificationsManager } from './components/NotificationsManager';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { DividendsCalculator } from './components/DividendsCalculator';
import { LoginModal } from './components/LoginModal';
import { SupabaseAuthPage } from './components/SupabaseAuthPage';
import { RefreshCw, Radio, CheckCircle2, Cloud } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentTab } = useClub();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      {currentTab === 'dashboard' && <Dashboard />}
      {currentTab === 'members' && <MembersList />}
      {currentTab === 'savings' && <SavingsManager />}
      {currentTab === 'loans' && <LoansManager />}
      {currentTab === 'applications' && <LoanApplicationForm />}
      {currentTab === 'reminders' && <NotificationsManager />}
      {currentTab === 'database' && <DatabaseSchemaView />}
      {currentTab === 'dividends' && <DividendsCalculator />}
    </main>
  );
};

const AppContainer: React.FC = () => {
  const { 
    supabaseSession, 
    isSupabaseConfigured, 
    isLoadingData, 
    refreshData 
  } = useClub();

  const [bypassAuth, setBypassAuth] = useState(false);

  // Require Supabase Auth if Supabase is configured and not logged in yet
  if (isSupabaseConfigured && !supabaseSession && !bypassAuth) {
    return (
      <SupabaseAuthPage 
        onContinueOffline={() => setBypassAuth(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Banner: Supabase Cloud & Realtime Connection Status */}
      <div className="bg-slate-900 text-white text-xs px-4 py-2 flex items-center justify-between shadow-xs no-print">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            {isSupabaseConfigured ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-400 font-bold">Supabase DB Realtime Connected</span>
                <span className="hidden md:inline text-slate-400">· Syncs across all devices</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                <span className="text-amber-400 font-bold">Offline / Local Demo Mode</span>
                <span className="hidden md:inline text-slate-400">· Add VITE_SUPABASE_URL to connect Supabase DB</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isSupabaseConfigured && (
              <button
                onClick={refreshData}
                disabled={isLoadingData}
                className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer font-mono text-[11px]"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span>{isLoadingData ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            )}
            <span className="text-slate-500 font-mono text-[11px]">
              {supabaseSession ? `Auth: ${supabaseSession.user.email}` : 'Guest Session'}
            </span>
          </div>
        </div>
      </div>

      <Navbar />
      <MainContent />
      <LoginModal />

      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/aistudio/THE_BEST_LOGO2_e1c656fe.png" 
              alt="Logo" 
              className="h-6 w-auto object-contain"
            />
            <span className="font-semibold text-slate-700">ឌឹ បេស៍ ហ្វាមីលី ក្លឹប</span>
            <span>(The Best Family Club)</span>
          </div>
          <div>
            ប្រព័ន្ធគ្រប់គ្រងសមាជិក ការសន្សំប្រាក់ កម្ចី និង Supabase Cloud DB © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ClubProvider>
      <AppContainer />
    </ClubProvider>
  );
}
