/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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

export default function App() {
  return (
    <ClubProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
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
              ប្រព័ន្ធគ្រប់គ្រងសមាជិក ការសន្សំប្រាក់ កម្ចី និងមូលដ្ឋានទិន្នន័យ © {new Date().getFullYear()}
            </div>
          </div>
        </footer>
      </div>
    </ClubProvider>
  );
}
