import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Member, 
  MonthlySavingRecord, 
  Loan, 
  LoanApplication, 
  NotificationReminder, 
  ClubStats,
  LoanPayment,
  OfficerTerm,
  ClubSettings,
  ExpenseRecord,
  CashReconciliation,
  FiscalYearClosing,
  LoanApproval,
  MemberExit,
  AuditLogRecord
} from '../types';
import { 
  INITIAL_MEMBERS, 
  INITIAL_SAVINGS_RECORDS, 
  INITIAL_LOANS, 
  INITIAL_APPLICATIONS,
  generateAmortizationSchedule
} from '../data/initialData';
import { 
  supabase, 
  isSupabaseConfigured,
  ensureUUID,
  formatDateStr,
  mapMemberFromRow,
  mapMemberToRow,
  mapSavingFromRow,
  mapSavingToRow,
  mapLoanFromRow,
  mapLoanToRow,
  mapScheduleToRow,
  mapApplicationFromRow,
  mapApplicationToRow,
  mapLoanPaymentFromRow,
  mapLoanPaymentToRow,
  mapOfficerTermFromRow,
  mapOfficerTermToRow,
  mapClubSettingsFromRow,
  mapClubSettingsToRow,
  mapExpenseFromRow,
  mapExpenseToRow,
  mapReconciliationFromRow,
  mapReconciliationToRow,
  mapFiscalClosingFromRow,
  mapFiscalClosingToRow,
  mapLoanApprovalFromRow,
  mapLoanApprovalToRow,
  mapMemberExitFromRow,
  mapMemberExitToRow,
  mapAuditLogFromRow,
  insertAuditLog
} from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

const DEFAULT_CLUB_SETTINGS: ClubSettings = {
  id: 1,
  clubNameKhmer: 'សមាគម ឌឹ បេស៍ ហ្វាមីលី ក្លឹប',
  currentFiscalYear: 2026,
  memberLoanRate: 1.20,
  externalLoanRate: 2.50,
  defaultMonthlyCommitment: 100.00,
  lateFeeType: 'PERCENT_PER_MONTH',
  lateFeeValue: 1.00,
  graceDays: 3
};

interface ClubContextType {
  members: Member[];
  savingsRecords: MonthlySavingRecord[];
  loans: Loan[];
  applications: LoanApplication[];
  payments: LoanPayment[];
  notifications: NotificationReminder[];
  stats: ClubStats;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedLoanForSchedule: Loan | null;
  setSelectedLoanForSchedule: (loan: Loan | null) => void;
  selectedLoanForContract: Loan | null;
  setSelectedLoanForContract: (loan: Loan | null) => void;
  selectedMemberForDetail: Member | null;
  setSelectedMemberForDetail: (member: Member | null) => void;
  
  // Repayment Modal & Print State
  isRepaymentModalOpen: boolean;
  setIsRepaymentModalOpen: (open: boolean) => void;
  preselectedLoanForRepayment: { loanId: string; installmentNumber?: number } | null;
  setPreselectedLoanForRepayment: (data: { loanId: string; installmentNumber?: number } | null) => void;
  selectedReceiptForPrint: { payment: LoanPayment; loan: Loan } | null;
  setSelectedReceiptForPrint: (data: { payment: LoanPayment; loan: Loan } | null) => void;

  // Auth & Session
  currentUser: Member | null;
  supabaseSession: Session | null;
  supabaseUser: User | null;
  isSupabaseConfigured: boolean;
  isLoadingData: boolean;
  supabaseError: string | null;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  
  officerTerms: OfficerTerm[];

  // Feature 1-7 States
  clubSettings: ClubSettings;
  expenses: ExpenseRecord[];
  reconciliations: CashReconciliation[];
  fiscalClosings: FiscalYearClosing[];
  loanApprovals: LoanApproval[];
  memberExits: MemberExit[];
  auditLogs: AuditLogRecord[];
  overdueInstallmentViews: OverdueInstallmentView[];

  // Permission Helpers
  isOfficer: boolean;
  isPresident: boolean;
  isTreasurer: boolean;
  isYearClosed: (year: number) => boolean;

  // Actions
  transferOfficeRole: (role: 'ប្រធានក្លឹប' | 'បេឡាធិការ', newMemberId: string, effectiveDate: string) => Promise<{ success: boolean; error?: string }>;
  login: (phoneOrCode: string, pin?: string) => boolean;
  quickLoginAsMember: (memberId: string) => void;
  logout: () => void;
  supabaseSignOut: () => Promise<void>;
  updateMemberProfile: (memberId: string, updatedData: Partial<Member>) => Promise<{ success: boolean; error?: string }>;
  
  addMember: (member: Omit<Member, 'id' | 'memberCode' | 'totalSavings' | 'totalDividendsEarned' | 'activeLoanAmount'>) => Promise<void>;
  updateMember: (member: Member) => Promise<void>;
  addSavingsRecord: (record: Omit<MonthlySavingRecord, 'id'>) => Promise<void>;
  updateSavingsRecord: (record: MonthlySavingRecord) => Promise<boolean>;
  deleteSavingsRecord: (recordId: string) => Promise<boolean>;
  updateLoan: (loan: Loan, regenerateSchedule?: boolean) => Promise<boolean>;
  deleteLoan: (loanId: string, hardDelete?: boolean) => Promise<boolean>;
  updateLoanPayment: (payment: LoanPayment) => Promise<boolean>;
  submitLoanApplication: (app: Omit<LoanApplication, 'id' | 'status' | 'appliedDate'>) => Promise<void>;
  approveLoanApplication: (applicationId: string, customInterestRate?: number, customMethod?: import('../types').InterestMethod) => Promise<void>;
  rejectLoanApplication: (applicationId: string) => Promise<void>;
  recordLoanPaymentTransaction: (paymentData: Omit<LoanPayment, 'id'>) => Promise<boolean>;
  voidLoanPayment: (paymentId: string) => Promise<boolean>;
  markReminderSent: (loanId: string, recipientName: string, recipientPhone: string, messageKhmer: string, channel?: 'TELEGRAM_MANUAL' | 'SMS_MANUAL' | 'SMS') => Promise<void>;
  refreshData: () => Promise<void>;
  resetToDefaultData: () => Promise<void>;

  // Feature Actions
  updateClubSettings: (updated: Partial<ClubSettings>) => Promise<boolean>;
  addExpense: (data: Omit<ExpenseRecord, 'id' | 'isVoided' | 'recordedBy'>) => Promise<boolean>;
  voidExpense: (expenseId: string, voidReason: string) => Promise<boolean>;
  addReconciliation: (data: Omit<CashReconciliation, 'id' | 'difference' | 'recordedBy'>) => Promise<boolean>;
  closeFiscalYear: (fiscalYear: number, notes?: string) => Promise<{ success: boolean; error?: string }>;
  decideLoanApplication: (applicationId: string, decision: 'APPROVED' | 'REJECTED', comment?: string) => Promise<{ success: boolean; error?: string }>;
  exitMember: (memberId: string, payoutData: { exitDate: string; payoutMethod: import('../types').PaymentMethod; notes?: string; hasWrittenDebtNote: boolean }) => Promise<{ success: boolean; error?: string; exitRecord?: MemberExit }>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

// Helper for displaying & logging Supabase errors
const handleSupabaseError = (error: any, contextMsg: string): void => {
  console.error(`[Supabase Error - ${contextMsg}]:`, error);
  const details = error?.message || error?.details || error?.hint || JSON.stringify(error);
  alert(`បរាជ័យក្នុងការរក្សាទុកទិន្នន័យទៅ Supabase DB (${contextMsg}) ៖\n${details}`);
};

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [savingsRecords, setSavingsRecords] = useState<MonthlySavingRecord[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [officerTerms, setOfficerTerms] = useState<OfficerTerm[]>([]);
  const [sentReminderIds, setSentReminderIds] = useState<string[]>([]);

  // Feature States
  const [clubSettings, setClubSettings] = useState<ClubSettings>(DEFAULT_CLUB_SETTINGS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [reconciliations, setReconciliations] = useState<CashReconciliation[]>([]);
  const [fiscalClosings, setFiscalClosings] = useState<FiscalYearClosing[]>([]);
  const [loanApprovals, setLoanApprovals] = useState<LoanApproval[]>([]);
  const [memberExits, setMemberExits] = useState<MemberExit[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<Loan | null>(null);
  const [selectedLoanForContract, setSelectedLoanForContract] = useState<Loan | null>(null);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<Member | null>(null);

  const [overdueInstallmentViews, setOverdueInstallmentViews] = useState<OverdueInstallmentView[]>([]);

  // Repayment Modal & Print Receipts State
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState<boolean>(false);
  const [preselectedLoanForRepayment, setPreselectedLoanForRepayment] = useState<{ loanId: string; installmentNumber?: number } | null>(null);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<{ payment: LoanPayment; loan: Loan } | null>(null);

  // Permissions Helpers
  const isOfficer = useMemo(() => {
    if (currentUser && (currentUser.role === 'ប្រធានក្លឹប' || currentUser.role === 'បេឡាធិការ')) return true;
    if (supabaseUser?.email) {
      const email = supabaseUser.email.toLowerCase();
      const matched = members.find(m => m.email?.toLowerCase() === email);
      if (matched && (matched.role === 'ប្រធានក្លឹប' || matched.role === 'បេឡាធិការ')) return true;
    }
    return false;
  }, [currentUser, supabaseUser, members]);

  const isPresident = useMemo(() => {
    if (currentUser && currentUser.role === 'ប្រធានក្លឹប') return true;
    if (supabaseUser?.email) {
      const email = supabaseUser.email.toLowerCase();
      const matched = members.find(m => m.email?.toLowerCase() === email);
      if (matched && matched.role === 'ប្រធានក្លឹប') return true;
    }
    return false;
  }, [currentUser, supabaseUser, members]);

  const isTreasurer = useMemo(() => {
    if (currentUser && currentUser.role === 'បេឡាធិការ') return true;
    if (supabaseUser?.email) {
      const email = supabaseUser.email.toLowerCase();
      const matched = members.find(m => m.email?.toLowerCase() === email);
      if (matched && matched.role === 'បេឡាធិការ') return true;
    }
    return false;
  }, [currentUser, supabaseUser, members]);

  const isYearClosed = useCallback((year: number) => {
    return fiscalClosings.some(c => Number(c.fiscalYear) === Number(year));
  }, [fiscalClosings]);

  // 1. Listen for Supabase Auth changes
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoadingData(false);
      setMembers(INITIAL_MEMBERS);
      setSavingsRecords(INITIAL_SAVINGS_RECORDS);
      setLoans(INITIAL_LOANS);
      setApplications(INITIAL_APPLICATIONS);
      setCurrentUser(INITIAL_MEMBERS[0]);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch data directly from Supabase
  const fetchDataFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    setIsLoadingData(true);
    setSupabaseError(null);

    try {
      // 1. Members
      const { data: memberRows, error: memberErr } = await supabase
        .from('members')
        .select('*')
        .order('member_code', { ascending: true });

      if (memberErr) throw memberErr;

      const mappedMembers = (memberRows || []).map(mapMemberFromRow);
      setMembers(mappedMembers);

      const memberMap: Record<string, Member> = {};
      mappedMembers.forEach(m => { memberMap[m.id] = m; });

      // Match current logged in user
      if (supabaseUser?.email) {
        const matched = mappedMembers.find(m => m.email?.toLowerCase() === supabaseUser.email?.toLowerCase());
        setCurrentUser(prev => prev ? (mappedMembers.find(m => m.id === prev.id) || matched || mappedMembers[0]) : (matched || mappedMembers[0]));
      } else if (mappedMembers.length > 0) {
        setCurrentUser(prev => prev ? (mappedMembers.find(m => m.id === prev.id) || mappedMembers[0]) : mappedMembers[0]);
      }

      // 2. Club Settings
      try {
        const { data: setRows } = await supabase.from('club_settings').select('*').limit(1);
        if (setRows && setRows.length > 0) {
          setClubSettings(mapClubSettingsFromRow(setRows[0]));
        }
      } catch (e) {
        console.warn('club_settings fetch warning:', e);
      }

      // 3. Monthly Savings
      const { data: savingRows } = await supabase
        .from('monthly_savings')
        .select('*')
        .order('payment_date', { ascending: false });

      if (savingRows) setSavingsRecords(savingRows.map(r => mapSavingFromRow(r, memberMap)));

      // 4. Loans & Repayment Schedules
      const { data: loanRows } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: scheduleRows } = await supabase
        .from('loan_repayment_schedules')
        .select('*');

      const scheduleMap: Record<string, any[]> = {};
      (scheduleRows || []).forEach(s => {
        const lid = String(s.loan_id);
        if (!scheduleMap[lid]) scheduleMap[lid] = [];
        scheduleMap[lid].push(s);
      });

      if (loanRows) {
        setLoans(loanRows.map(l => mapLoanFromRow(l, scheduleMap[String(l.id)] || [])));
      }

      // 5. Loan Payments
      const { data: paymentRows } = await supabase
        .from('loan_payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (paymentRows) setPayments(paymentRows.map(mapLoanPaymentFromRow));

      // 6. Loan Applications
      const { data: appRows } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appRows) setApplications(appRows.map(mapApplicationFromRow));

      // 7. Notifications log
      const { data: notifRows } = await supabase.from('notifications_log').select('*');
      if (notifRows) setSentReminderIds(notifRows.map(n => String(n.id || n.loan_id)));

      // 8. Officer terms
      const { data: termRows } = await supabase
        .from('officer_terms')
        .select('*')
        .order('term_start', { ascending: false });

      if (termRows && termRows.length > 0) {
        setOfficerTerms(termRows.map(r => mapOfficerTermFromRow(r, memberMap)));
      }

      // 9. Expenses
      try {
        const { data: expRows } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
        if (expRows) setExpenses(expRows.map(mapExpenseFromRow));
      } catch (e) {
        console.warn('expenses fetch warning:', e);
      }

      // 10. Cash Reconciliations
      try {
        const { data: recRows } = await supabase.from('cash_reconciliations').select('*').order('period_year', { ascending: false }).order('period_month', { ascending: false });
        if (recRows) setReconciliations(recRows.map(mapReconciliationFromRow));
      } catch (e) {
        console.warn('cash_reconciliations fetch warning:', e);
      }

      // 11. Fiscal Year Closings
      try {
        const { data: closeRows } = await supabase.from('fiscal_year_closings').select('*').order('fiscal_year', { ascending: false });
        if (closeRows) setFiscalClosings(closeRows.map(mapFiscalClosingFromRow));
      } catch (e) {
        console.warn('fiscal_year_closings fetch warning:', e);
      }

      // 12. Loan Approvals
      try {
        const { data: appvRows } = await supabase.from('loan_approvals').select('*').order('created_at', { ascending: false });
        if (appvRows) setLoanApprovals(appvRows.map(mapLoanApprovalFromRow));
      } catch (e) {
        console.warn('loan_approvals fetch warning:', e);
      }

      // 13. Member Exits
      try {
        const { data: exitRows } = await supabase.from('member_exits').select('*').order('exit_date', { ascending: false });
        if (exitRows) setMemberExits(exitRows.map(r => mapMemberExitFromRow(r, memberMap)));
      } catch (e) {
        console.warn('member_exits fetch warning:', e);
      }

      // 14. Audit Log
      try {
        const { data: logRows } = await supabase.from('audit_log').select('*').order('changed_at', { ascending: false }).limit(200);
        if (logRows) setAuditLogs(logRows.map(mapAuditLogFromRow));
      } catch (e) {
        console.warn('audit_log fetch warning:', e);
      }

      // 15. v_overdue_installments View
      try {
        const { data: viewRows } = await supabase.from('v_overdue_installments').select('*');
        if (viewRows) setOverdueInstallmentViews(viewRows);
      } catch (e) {
        console.warn('v_overdue_installments fetch warning:', e);
      }

    } catch (err: any) {
      console.error('Error fetching Supabase data:', err);
      setSupabaseError(err.message || 'Failed to load data from Supabase');
    } finally {
      setIsLoadingData(false);
    }
  }, [supabaseUser]);

  // Realtime Channel
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchDataFromSupabase();

      const channel = supabase
        .channel('public:all_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (_payload) => {
            console.log('Realtime DB change received! Syncing across devices...');
            fetchDataFromSupabase();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchDataFromSupabase]);

  // Derived Notifications (SMS Reminders)
  const notifications = useMemo(() => {
    const list: NotificationReminder[] = [];
    const today = new Date('2026-10-30');

    loans.forEach(loan => {
      if (loan.status === 'COMPLETED' || loan.status === 'REJECTED') return;

      loan.schedule.forEach(inst => {
        if (inst.status === 'PAID') return;

        const due = new Date(inst.dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status: 'UPCOMING' | 'DUE_TODAY' | 'OVERDUE' | null = null;
        if (diffDays < 0 || inst.status === 'OVERDUE') {
          status = 'OVERDUE';
        } else if (diffDays === 0) {
          status = 'DUE_TODAY';
        } else if (diffDays > 0 && diffDays <= 5) {
          status = 'UPCOMING';
        }

        if (status) {
          const notifId = `notif-${loan.id}-${inst.installmentNumber}`;
          const isSent = sentReminderIds.includes(notifId);

          const smsKhmer = `[${clubSettings.clubNameKhmer}]\nជម្រាបសួរលោក/លោកស្រី ${loan.borrowerName},\nសូមជម្រាបរំលឹកពីកាលវិភាគបង់ប្រាក់កម្ចី (លើកទី ${inst.installmentNumber}) ទឹកប្រាក់សរុប $${inst.totalDue} ផុតកំណត់នៅថ្ងៃទី ${inst.dueDate}។\nសូមធ្វើការផ្ទេរប្រាក់មកគណនី ABA: 001 234 567 (${clubSettings.clubNameKhmer}) ឬទាក់ទង 012 889 901។ សូមអរគុណ!`;

          list.push({
            id: notifId,
            loanId: loan.id,
            borrowerName: loan.borrowerName,
            borrowerPhone: loan.borrowerPhone,
            installmentNumber: inst.installmentNumber,
            dueDate: inst.dueDate,
            totalDue: inst.totalDue,
            daysRemaining: diffDays,
            status: status,
            smsMessageKhmer: smsKhmer,
            lastSentDate: isSent ? 'បានផ្ញើរួច' : undefined
          });
        }
      });
    });

    return list.sort((a, b) => {
      const order = { OVERDUE: 0, DUE_TODAY: 1, UPCOMING: 2 };
      return order[a.status] - order[b.status];
    });
  }, [loans, sentReminderIds, clubSettings.clubNameKhmer]);

  // Derived Financial Stats
  const stats: ClubStats = useMemo(() => {
    const activeMembers = members.filter(m => m.status === 'ACTIVE');
    const totalClubSavings = activeMembers.reduce((sum, m) => sum + m.totalSavings, 0);
    const totalActiveLoans = loans
      .filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE')
      .reduce((sum, l) => sum + l.remainingBalance, 0);

    const totalInterestEarned = loans.reduce((sum, l) => sum + l.totalPaidInterest, 0);
    const totalLateFeesEarned = payments.reduce((sum, p) => sum + (p.lateFee || 0), 0);
    const totalExpenses = expenses.filter(e => !e.isVoided).reduce((sum, e) => sum + e.amount, 0);

    // Dashboard cash on hand formula:
    // total savings + interest and late fees collected - outstanding loan principal - non-voided expenses
    const cashOnHand = totalClubSavings + totalInterestEarned + totalLateFeesEarned - totalActiveLoans - totalExpenses;

    const activeLoanCount = loans.filter(l => l.status === 'ACTIVE').length;
    const overdueLoansCount = loans.filter(l => l.status === 'OVERDUE').length;
    const upcomingDueCount = notifications.length;

    return {
      totalClubSavings,
      totalActiveLoans,
      totalInterestEarned,
      totalLateFeesEarned,
      totalExpenses,
      cashOnHand,
      memberCount: activeMembers.length,
      activeLoanCount,
      overdueLoansCount,
      upcomingDueCount
    };
  }, [members, loans, payments, expenses, notifications]);

  // MUTATION ACTIONS

  // 1. Add Member
  const addMember = async (data: Omit<Member, 'id' | 'memberCode' | 'totalSavings' | 'totalDividendsEarned' | 'activeLoanAmount'>) => {
    const nextCode = `TBF-00${members.length + 1}`;
    const newMember: Member = {
      ...data,
      id: crypto.randomUUID(),
      memberCode: nextCode,
      totalSavings: 0,
      totalDividendsEarned: 0,
      activeLoanAmount: 0
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('members').insert([mapMemberToRow(newMember)]);
      if (error) {
        handleSupabaseError(error, 'Add Member');
        return;
      }
      await insertAuditLog('members', newMember.id, 'INSERT', null, newMember, supabaseUser?.email || 'Officer');
      await fetchDataFromSupabase();
    } else {
      setMembers(prev => [...prev, newMember]);
    }
  };

  // 2. Update Member
  const updateMember = async (updated: Member) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('members')
        .update(mapMemberToRow(updated))
        .eq('id', updated.id);

      if (error) {
        handleSupabaseError(error, 'Update Member');
        return;
      }
      await insertAuditLog('members', updated.id, 'UPDATE', null, updated, supabaseUser?.email || 'Officer');
      await fetchDataFromSupabase();
    } else {
      setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    }
  };

  // 3. Add Savings Record
  const addSavingsRecord = async (recordData: Omit<MonthlySavingRecord, 'id'>) => {
    if (isYearClosed(recordData.year)) {
      alert(`ឆ្នាំ ${recordData.year} ត្រូវបានបិទបញ្ជីរួចរាល់ហើយ! មិនអាចបន្ថែមប្រាក់សន្សំបានទេ។`);
      return;
    }

    const newRecord: MonthlySavingRecord = {
      ...recordData,
      id: crypto.randomUUID()
    };

    if (isSupabaseConfigured) {
      const { error: savErr } = await supabase.from('monthly_savings').insert([mapSavingToRow(newRecord)]);
      if (savErr) {
        handleSupabaseError(savErr, 'Add Monthly Saving');
        return;
      }

      // Update target member total savings
      const targetMember = members.find(m => m.id === recordData.memberId);
      if (targetMember) {
        const updatedSavings = targetMember.totalSavings + recordData.amount;
        const { error: memErr } = await supabase
          .from('members')
          .update({ total_savings: updatedSavings })
          .eq('id', targetMember.id);

        if (memErr) {
          handleSupabaseError(memErr, 'Update Member Total Savings');
        }
      }

      await insertAuditLog('monthly_savings', newRecord.id, 'INSERT', null, newRecord, supabaseUser?.email || 'Officer');
      await fetchDataFromSupabase();
    } else {
      setSavingsRecords(prev => [newRecord, ...prev]);
      const targetMember = members.find(m => m.id === recordData.memberId);
      if (targetMember) {
        const updatedSavings = targetMember.totalSavings + recordData.amount;
        setMembers(prev => prev.map(m => m.id === targetMember.id ? { ...m, totalSavings: updatedSavings } : m));
      }
    }
  };

  // Helper to recalculate member total savings
  const recalculateMemberSavings = async (memberId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('monthly_savings')
        .select('amount')
        .eq('member_id', memberId);

      if (!error && data) {
        const sum = data.reduce((acc: number, item: any) => acc + Number(item.amount || 0), 0);
        await supabase
          .from('members')
          .update({ total_savings: sum })
          .eq('id', memberId);
      }
    } catch (e) {
      console.error('[Recalculate Member Savings Error]:', e);
    }
  };

  // Update Savings Record
  const updateSavingsRecord = async (updatedRecord: MonthlySavingRecord): Promise<boolean> => {
    if (isYearClosed(updatedRecord.year)) {
      alert(`ឆ្នាំ ${updatedRecord.year} ត្រូវបានបិទបញ្ជីរួចរាល់ហើយ! មិនអាចកែប្រែប្រាក់សន្សំបានទេ។`);
      return false;
    }

    const oldRecord = savingsRecords.find(r => r.id === updatedRecord.id);
    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'Admin (គណៈកម្មការ)';

    // Check duplicate (member_id, year, month)
    const duplicate = savingsRecords.find(
      r => r.id !== updatedRecord.id && 
           r.memberId === updatedRecord.memberId && 
           r.year === updatedRecord.year && 
           r.month === updatedRecord.month
    );
    if (duplicate) {
      alert(`សមាជិកនេះបានសន្សំប្រាក់សម្រាប់ ខែ ${updatedRecord.month}/${updatedRecord.year} រួចហើយ! មិនអាចកែប្រែស្ទួនបានទេ។`);
      return false;
    }

    if (isSupabaseConfigured) {
      const row = mapSavingToRow(updatedRecord);
      const { error } = await supabase
        .from('monthly_savings')
        .update(row)
        .eq('id', updatedRecord.id);

      if (error) {
        handleSupabaseError(error, 'Update Savings Record');
        return false;
      }

      await insertAuditLog('monthly_savings', updatedRecord.id, 'UPDATE', oldRecord, updatedRecord, userEmail);
      
      await recalculateMemberSavings(updatedRecord.memberId);
      if (oldRecord && oldRecord.memberId !== updatedRecord.memberId) {
        await recalculateMemberSavings(oldRecord.memberId);
      }

      await fetchDataFromSupabase();
      return true;
    } else {
      setSavingsRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
      return true;
    }
  };

  // Delete Savings Record
  const deleteSavingsRecord = async (recordId: string): Promise<boolean> => {
    const target = savingsRecords.find(r => r.id === recordId);
    if (!target) return false;

    if (isYearClosed(target.year)) {
      alert(`ឆ្នាំ ${target.year} ត្រូវបានបិទបញ្ជីរួចរាល់ហើយ! មិនអាចលុបប្រាក់សន្សំបានទេ។`);
      return false;
    }

    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'Admin (គណៈកម្មការ)';

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('monthly_savings')
        .delete()
        .eq('id', recordId);

      if (error) {
        handleSupabaseError(error, 'Delete Savings Record');
        return false;
      }

      await insertAuditLog('monthly_savings', recordId, 'DELETE', target, null, userEmail);
      await recalculateMemberSavings(target.memberId);
      await fetchDataFromSupabase();
      return true;
    } else {
      setSavingsRecords(prev => prev.filter(r => r.id !== recordId));
      return true;
    }
  };

  // Update Loan
  const updateLoan = async (updatedLoan: Loan, regenerateSchedule: boolean = false): Promise<boolean> => {
    const oldLoan = loans.find(l => l.id === updatedLoan.id);
    if (!oldLoan) return false;

    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'Admin (គណៈកម្មការ)';

    if (isSupabaseConfigured) {
      const loanRow = mapLoanToRow(updatedLoan);
      const { error: loanErr } = await supabase
        .from('loans')
        .update(loanRow)
        .eq('id', updatedLoan.id);

      if (loanErr) {
        handleSupabaseError(loanErr, 'Update Loan');
        return false;
      }

      if (regenerateSchedule) {
        await supabase.from('loan_repayment_schedules').delete().eq('loan_id', updatedLoan.id);
        
        const newSched = generateAmortizationSchedule(
          updatedLoan.principalAmount,
          updatedLoan.monthlyInterestRate,
          updatedLoan.termMonths,
          updatedLoan.startDate,
          updatedLoan.interestMethod
        );
        const schedRows = newSched.map(s => mapScheduleToRow(s, updatedLoan.id));
        const { error: schedErr } = await supabase.from('loan_repayment_schedules').insert(schedRows);
        if (schedErr) {
          handleSupabaseError(schedErr, 'Regenerate Amortization Schedule');
        }
      }

      await insertAuditLog('loans', updatedLoan.id, 'UPDATE', oldLoan, updatedLoan, userEmail);
      await fetchDataFromSupabase();
      return true;
    } else {
      setLoans(prev => prev.map(l => l.id === updatedLoan.id ? updatedLoan : l));
      return true;
    }
  };

  // Delete / Cancel Loan
  const deleteLoan = async (loanId: string, hardDelete: boolean = false): Promise<boolean> => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return false;

    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'Admin (គណៈកម្មការ)';

    if (isSupabaseConfigured) {
      if (hardDelete) {
        await supabase.from('loan_payments').delete().eq('loan_id', loanId);
        await supabase.from('loan_repayment_schedules').delete().eq('loan_id', loanId);
        const { error } = await supabase.from('loans').delete().eq('id', loanId);
        if (error) {
          handleSupabaseError(error, 'Delete Loan Permanently');
          return false;
        }
        await insertAuditLog('loans', loanId, 'DELETE', targetLoan, null, userEmail);
      } else {
        const { error } = await supabase.from('loans').update({ status: 'REJECTED' }).eq('id', loanId);
        if (error) {
          handleSupabaseError(error, 'Cancel Loan (Set Status REJECTED)');
          return false;
        }
        await insertAuditLog('loans', loanId, 'UPDATE', targetLoan, { ...targetLoan, status: 'REJECTED' }, userEmail);
      }

      await fetchDataFromSupabase();
      return true;
    } else {
      setLoans(prev => prev.filter(l => l.id !== loanId));
      return true;
    }
  };

  // Update Loan Payment
  const updateLoanPayment = async (updatedPayment: LoanPayment): Promise<boolean> => {
    const year = new Date(updatedPayment.paymentDate).getFullYear();
    if (isYearClosed(year)) {
      alert(`ឆ្នាំ ${year} ត្រូវបានបិទបញ្ជីរួចរាល់ហើយ! មិនអាចកែប្រែការបង់ប្រាក់បានទេ។`);
      return false;
    }

    const oldPayment = payments.find(p => p.id === updatedPayment.id);
    if (!oldPayment) return false;

    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'Admin (គណៈកម្មការ)';

    if (isSupabaseConfigured) {
      const row = mapLoanPaymentToRow(updatedPayment);
      const { error } = await supabase
        .from('loan_payments')
        .update(row)
        .eq('id', updatedPayment.id);

      if (error) {
        handleSupabaseError(error, 'Update Loan Payment');
        return false;
      }

      await insertAuditLog('loan_payments', updatedPayment.id, 'UPDATE', oldPayment, updatedPayment, userEmail);
      await fetchDataFromSupabase();
      return true;
    } else {
      setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
      return true;
    }
  };

  // 4. Submit Loan Application
  const submitLoanApplication = async (appData: Omit<LoanApplication, 'id' | 'status' | 'appliedDate'>) => {
    const newApp: LoanApplication = {
      ...appData,
      id: crypto.randomUUID(),
      status: 'PENDING',
      appliedDate: formatDateStr('2026-10-30')
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('loan_applications').insert([mapApplicationToRow(newApp)]);
      if (error) {
        handleSupabaseError(error, 'Submit Loan Application');
        return;
      }
      await insertAuditLog('loan_applications', newApp.id, 'INSERT', null, newApp, supabaseUser?.email || 'Applicant');
      await fetchDataFromSupabase();
    } else {
      setApplications(prev => [newApp, ...prev]);
    }
  };

  // 5. Approve Loan Application
  const approveLoanApplication = async (appId: string, customRate?: number, customMethod?: import('../types').InterestMethod) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    if (app.status !== 'APPROVED') {
      alert('ពាក្យស្នើសុំនេះត្រូវតែមានការអនុម័តពីគណៈកម្មការ ២ រូបជាមុនសិន!');
      return;
    }

    const rate = customRate !== undefined 
      ? customRate 
      : (app.proposedInterestRate !== undefined ? app.proposedInterestRate : (app.applicantType === 'MEMBER' ? clubSettings.memberLoanRate : clubSettings.externalLoanRate));

    const method = customMethod || app.interestMethod || 'DECLINING';
    const newLoanId = crypto.randomUUID();

    const schedule = generateAmortizationSchedule(
      app.requestedAmount,
      rate,
      app.proposedTermMonths,
      '2026-10-30',
      method
    );

    const totalInterest = schedule.reduce((sum, item) => sum + item.interest, 0);
    const totalPayable = app.requestedAmount + totalInterest;

    const newLoan: Loan = {
      id: newLoanId,
      loanCode: `LN-${app.applicantType === 'MEMBER' ? 'MEM' : 'EXT'}-2026-${String(loans.length + 1).padStart(3, '0')}`,
      borrowerType: app.applicantType,
      borrowerId: app.memberId,
      borrowerName: app.applicantName,
      borrowerPhone: app.applicantPhone,
      borrowerIdCard: app.applicantIdCard,
      borrowerAddress: app.applicantAddress,
      occupation: app.occupation,
      principalAmount: app.requestedAmount,
      monthlyInterestRate: rate,
      interestMethod: method,
      termMonths: app.proposedTermMonths,
      startDate: '2026-10-30',
      endDate: schedule[schedule.length - 1]?.dueDate || '2027-04-30',
      purpose: app.purpose,
      guarantorName: app.guarantorName,
      guarantorPhone: app.guarantorPhone,
      collateralDescription: app.collateralDescription,
      status: 'ACTIVE',
      totalInterest,
      totalPayable,
      totalPaidPrincipal: 0,
      totalPaidInterest: 0,
      remainingBalance: app.requestedAmount,
      schedule,
      approvedBy: 'គណៈកម្មការសមាគម The Best Club',
      contractNumber: `CTR-${app.applicantType === 'MEMBER' ? 'MEM' : 'EXT'}-2026-${Date.now().toString().slice(-4)}`,
      createdAt: '2026-10-30'
    };

    if (isSupabaseConfigured) {
      const { error: loanErr } = await supabase.from('loans').insert([mapLoanToRow(newLoan)]);
      if (loanErr) {
        handleSupabaseError(loanErr, 'Disburse Loan Contract');
        return;
      }

      const schedRows = schedule.map(s => mapScheduleToRow(s, newLoan.id));
      const { error: schedErr } = await supabase.from('loan_repayment_schedules').insert(schedRows);
      if (schedErr) {
        handleSupabaseError(schedErr, 'Create Amortization Schedule');
      }

      await insertAuditLog('loans', newLoan.id, 'INSERT', null, newLoan, supabaseUser?.email || 'Officer');
      await fetchDataFromSupabase();
    } else {
      setLoans(prev => [newLoan, ...prev]);
    }
  };

  // 6. Reject Loan Application
  const rejectLoanApplication = async (appId: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('loan_applications').update({ status: 'REJECTED' }).eq('id', appId);
      if (error) {
        handleSupabaseError(error, 'Reject Application');
        return;
      }
      await insertAuditLog('loan_applications', appId, 'UPDATE', null, { status: 'REJECTED' }, supabaseUser?.email || 'Officer');
      await fetchDataFromSupabase();
    } else {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'REJECTED' } : a));
    }
  };

  // 7. RECORD LOAN PAYMENT TRANSACTION
  const recordLoanPaymentTransaction = async (paymentData: Omit<LoanPayment, 'id'>): Promise<boolean> => {
    const year = new Date(paymentData.paymentDate).getFullYear();
    if (isYearClosed(year)) {
      alert(`ឆ្នាំ ${year} ត្រូវបានបិទបញ្ជីរួចរាល់ហើយ! មិនអាចកត់ត្រាការបង់ប្រាក់កម្ចីបានទេ។`);
      return false;
    }

    const targetLoan = loans.find(l => l.id === paymentData.loanId);
    if (!targetLoan) return false;

    const newPaymentId = crypto.randomUUID();
    const paymentRecord: LoanPayment = {
      ...paymentData,
      id: newPaymentId
    };

    if (isSupabaseConfigured) {
      const { error: payErr } = await supabase
        .from('loan_payments')
        .insert([mapLoanPaymentToRow(paymentRecord)]);

      if (payErr) {
        handleSupabaseError(payErr, 'Insert Loan Payment');
        return false;
      }

      const instNum = paymentData.installmentNumber || 1;
      const targetInst = targetLoan.schedule.find(s => s.installmentNumber === instNum);
      const fullDue = targetInst ? targetInst.totalDue : paymentData.amountPaid;

      const isFull = paymentData.amountPaid >= fullDue;
      const newInstStatus = isFull ? 'PAID' : 'PARTIAL';

      const { error: schedErr } = await supabase
        .from('loan_repayment_schedules')
        .update({
          status: newInstStatus,
          paid_date: formatDateStr(paymentData.paymentDate),
          receipt_number: paymentData.receiptNumber
        })
        .eq('loan_id', targetLoan.id)
        .eq('installment_number', instNum);

      if (schedErr) {
        handleSupabaseError(schedErr, 'Update Repayment Schedule');
      }

      const { data: latestSchedules } = await supabase
        .from('loan_repayment_schedules')
        .select('*')
        .eq('loan_id', targetLoan.id);

      let newLoanStatus: 'ACTIVE' | 'COMPLETED' | 'OVERDUE' = 'ACTIVE';
      let totalPaidPrincipal = 0;

      if (latestSchedules && latestSchedules.length > 0) {
        const allPaid = latestSchedules.every(s => s.status === 'PAID');
        const todayStr = '2026-10-30';
        const hasOverdue = latestSchedules.some(s => s.status !== 'PAID' && s.due_date < todayStr);

        if (allPaid) {
          newLoanStatus = 'COMPLETED';
        } else if (hasOverdue) {
          newLoanStatus = 'OVERDUE';
        }

        totalPaidPrincipal = latestSchedules
          .filter(s => s.status === 'PAID')
          .reduce((sum, s) => sum + Number(s.principal_amount || 0), 0);
      }

      const newRemainingBalance = Math.max(0, targetLoan.principalAmount - totalPaidPrincipal);

      const { error: loanErr } = await supabase
        .from('loans')
        .update({
          status: newLoanStatus,
          remaining_balance: newRemainingBalance
        })
        .eq('id', targetLoan.id);

      if (loanErr) {
        handleSupabaseError(loanErr, 'Update Loan Overall Status');
      }

      await insertAuditLog('loan_payments', newPaymentId, 'INSERT', null, paymentRecord, supabaseUser?.email || 'Officer');
      await fetchDataFromSupabase();

      setSelectedReceiptForPrint({
        payment: paymentRecord,
        loan: targetLoan
      });

      return true;

    } else {
      setPayments(prev => [paymentRecord, ...prev]);
      setSelectedReceiptForPrint({
        payment: paymentRecord,
        loan: targetLoan
      });
      return true;
    }
  };

  // 8. VOID LOAN PAYMENT
  const voidLoanPayment = async (paymentId: string): Promise<boolean> => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return false;

    const year = new Date(payment.paymentDate).getFullYear();
    if (isYearClosed(year)) {
      alert(`ឆ្នាំ ${year} ត្រូវបានបិទបញ្ជីរួចរាល់ហើយ! មិនអាចលុបការបង់ប្រាក់បានទេ។`);
      return false;
    }

    if (isSupabaseConfigured) {
      const { error: delErr } = await supabase
        .from('loan_payments')
        .delete()
        .eq('id', paymentId);

      if (delErr) {
        handleSupabaseError(delErr, 'Void Payment Record');
        return false;
      }

      if (payment.installmentNumber) {
        const { error: schedErr } = await supabase
          .from('loan_repayment_schedules')
          .update({
            status: 'PENDING',
            paid_date: null,
            receipt_number: null
          })
          .eq('loan_id', payment.loanId)
          .eq('installment_number', payment.installmentNumber);

        if (schedErr) {
          handleSupabaseError(schedErr, 'Reset Schedule Item');
        }
      }

      const { error: loanErr } = await supabase
        .from('loans')
        .update({ status: 'ACTIVE' })
        .eq('id', payment.loanId);

      if (loanErr) {
        handleSupabaseError(loanErr, 'Reset Loan Status');
      }

      await insertAuditLog('loan_payments', paymentId, 'DELETE', payment, null, supabaseUser?.email || 'Officer');
      await fetchDataFromSupabase();
      return true;
    } else {
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      return true;
    }
  };

  // 9. Mark Reminder Sent
  const markReminderSent = async (
    loanId: string,
    recipientName: string,
    recipientPhone: string,
    messageKhmer: string,
    channel: 'TELEGRAM_MANUAL' | 'SMS_MANUAL' | 'SMS' = 'TELEGRAM_MANUAL'
  ) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('notifications_log').insert([{
        id: crypto.randomUUID(),
        loan_id: ensureUUID(loanId),
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        message_khmer: messageKhmer,
        channel: channel,
        status: 'SENT_MANUAL'
      }]);

      if (error) {
        handleSupabaseError(error, 'Log Notification Reminder');
        return;
      }
      await insertAuditLog('notifications_log', loanId, 'INSERT', null, { recipientName, recipientPhone, channel }, supabaseUser?.email || 'Officer');
      await fetchDataFromSupabase();
    } else {
      setSentReminderIds(prev => [...prev, loanId]);
    }
  };

  // 10. Update Member Profile
  const updateMemberProfile = async (
    memberId: string, 
    updatedData: Partial<Member>
  ): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      const row = mapMemberToRow(updatedData);
      const { data, error } = await supabase
        .from('members')
        .update(row)
        .eq('id', memberId)
        .select();

      if (error) {
        handleSupabaseError(error, 'Update Member Profile');
        return { success: false, error: error.message || error.details || 'មិនអាចកែប្រែព័ត៌មានបានទេ' };
      }

      if (!data || data.length === 0) {
        const noRowErr = 'មិនមានទិន្នន័យត្រូវបានធ្វើបច្ចុប្បន្នភាពទេ (0 rows updated)';
        console.error('[Supabase Error - Update Member Profile]:', noRowErr);
        alert(`បរាជ័យក្នុងការរក្សាទុកទិន្នន័យទៅ Supabase DB ៖\n${noRowErr}`);
        return { success: false, error: noRowErr };
      }

      await insertAuditLog('members', memberId, 'UPDATE', null, updatedData, supabaseUser?.email || 'Officer');
      await fetchDataFromSupabase();
      return { success: true };
    } else {
      setMembers(prev => prev.map(m => {
        if (m.id === memberId) {
          const updated = { ...m, ...updatedData };
          if (currentUser?.id === memberId) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return m;
      }));
      return { success: true };
    }
  };

  // 11. Transfer Office Role (ប្តូរមុខតំណែង)
  const transferOfficeRole = async (
    role: 'ប្រធានក្លឹប' | 'បេឡាធិការ', 
    newMemberId: string, 
    effectiveDate: string
  ): Promise<{ success: boolean; error?: string }> => {
    const p_effective = formatDateStr(effectiveDate);
    const p_new_member_id = ensureUUID(newMemberId);

    if (isSupabaseConfigured) {
      console.log(`Calling RPC transfer_office with p_role="${role}", p_new_member_id="${p_new_member_id}", p_effective="${p_effective}"`);
      
      const { error } = await supabase.rpc('transfer_office', {
        p_role: role,
        p_new_member_id: p_new_member_id,
        p_effective: p_effective
      });

      if (error) {
        console.error('[Supabase RPC transfer_office Error]:', error);
        const errText = error.message || error.details || error.hint || JSON.stringify(error);

        try {
          await supabase
            .from('officer_terms')
            .update({ term_end: p_effective })
            .eq('role', role)
            .is('term_end', null);

          await supabase
            .from('officer_terms')
            .insert([{
              id: crypto.randomUUID(),
              member_id: p_new_member_id,
              role: role,
              term_start: p_effective,
              term_end: null
            }]);

          const currentOfficer = members.find(m => m.role === role);
          if (currentOfficer) {
            await supabase.from('members').update({ role: 'សមាជិក' }).eq('id', currentOfficer.id);
          }

          const { error: updateMemErr } = await supabase.from('members').update({ role: role }).eq('id', p_new_member_id);
          if (updateMemErr) {
            return { success: false, error: `${errText} (Fallback failed: ${updateMemErr.message})` };
          }

          await insertAuditLog('members', p_new_member_id, 'UPDATE', { role: currentOfficer?.role }, { role }, currentUser?.email || 'President');
          await fetchDataFromSupabase();
          
          return { success: true };
        } catch (fbErr: any) {
          return { success: false, error: errText };
        }
      }

      await insertAuditLog('officer_terms', p_new_member_id, 'INSERT', null, { role, p_effective }, currentUser?.email || 'President');
      await fetchDataFromSupabase();
      return { success: true };
    } else {
      const oldOfficer = members.find(m => m.role === role);
      const newMember = members.find(m => m.id === newMemberId);
      if (oldOfficer && newMember) {
        setMembers(prev => prev.map(m => {
          if (m.id === oldOfficer.id) return { ...m, role: 'សមាជិក' };
          if (m.id === newMemberId) return { ...m, role: role };
          return m;
        }));
        setOfficerTerms(prev => [
          {
            id: crypto.randomUUID(),
            memberId: newMemberId,
            memberName: newMember.nameKhmer,
            role: role,
            termStart: p_effective,
            termEnd: null
          },
          ...prev.map(t => (t.role === role && !t.termEnd) ? { ...t, termEnd: p_effective } : t)
        ]);
        if (currentUser?.id === oldOfficer.id) {
          setCurrentUser(prev => prev ? { ...prev, role: 'សមាជិក' } : null);
        }
      }
      return { success: true };
    }
  };

  // FEATURE ACTIONS (SETTINGS, EXPENSES, RECONCILIATION, CLOSING, APPROVALS, EXIT)

  // 1. UPDATE CLUB SETTINGS
  const updateClubSettings = async (updated: Partial<ClubSettings>): Promise<boolean> => {
    if (!isOfficer) {
      alert('មានតែប្រធានក្លឹប ឬបេឡាធិការប៉ុណ្ណោះដែលមានសិទ្ធិកែប្រែការកំណត់!');
      return false;
    }

    const merged = { ...clubSettings, ...updated };
    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'Officer';

    if (isSupabaseConfigured) {
      const row = mapClubSettingsToRow(merged);
      const { error } = await supabase.from('club_settings').upsert(row);
      if (error) {
        handleSupabaseError(error, 'Update Club Settings');
        return false;
      }
      await insertAuditLog('club_settings', '1', 'UPDATE', clubSettings, merged, userEmail);
      await fetchDataFromSupabase();
      return true;
    } else {
      setClubSettings(merged);
      return true;
    }
  };

  // 2. ADD EXPENSE
  const addExpense = async (data: Omit<ExpenseRecord, 'id' | 'isVoided' | 'recordedBy'>): Promise<boolean> => {
    if (!isOfficer) {
      alert('មានតែប្រធានក្លឹប ឬបេឡាធិការប៉ុណ្ណោះដែលមានសិទ្ធិកត់ត្រាចំណាយ!');
      return false;
    }

    const year = new Date(data.expenseDate).getFullYear();
    if (isYearClosed(year)) {
      alert(`ឆ្នាំ ${year} ត្រូវបានបិទបញ្ជីរួចរាល់ហើយ! មិនអាចបន្ថែមចំណាយបានទេ។`);
      return false;
    }

    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'Officer';
    const newId = crypto.randomUUID();
    const record: ExpenseRecord = {
      ...data,
      id: newId,
      isVoided: false,
      recordedBy: userEmail,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('expenses').insert([mapExpenseToRow(record)]);
      if (error) {
        handleSupabaseError(error, 'Add Expense');
        return false;
      }
      await insertAuditLog('expenses', newId, 'INSERT', null, record, userEmail);
      await fetchDataFromSupabase();
      return true;
    } else {
      setExpenses(prev => [record, ...prev]);
      return true;
    }
  };

  // 3. VOID EXPENSE
  const voidExpense = async (expenseId: string, voidReason: string): Promise<boolean> => {
    if (!isOfficer) {
      alert('មានតែប្រធានក្លឹប ឬបេឡាធិការប៉ុណ្ណោះដែលមានសិទ្ធិបោះបង់ចំណាយ!');
      return false;
    }

    if (!voidReason.trim()) {
      alert('សូមបញ្ចូលមូលហេតុនៃការបោះបង់ (Void Reason)!');
      return false;
    }

    const target = expenses.find(e => e.id === expenseId);
    if (!target) return false;

    const year = new Date(target.expenseDate).getFullYear();
    if (isYearClosed(year)) {
      alert(`ឆ្នាំ ${year} ត្រូវបានបិទបញ្ជីរួចរាល់ហើយ! មិនអាចបោះបង់ចំណាយបានទេ។`);
      return false;
    }

    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'Officer';
    const voidedAt = new Date().toISOString();

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('expenses').update({
        is_voided: true,
        voided_by: userEmail,
        void_reason: voidReason.trim(),
        voided_at: voidedAt
      }).eq('id', expenseId);

      if (error) {
        handleSupabaseError(error, 'Void Expense');
        return false;
      }
      await insertAuditLog('expenses', expenseId, 'VOID', target, { ...target, isVoided: true, voidReason, voidedBy: userEmail, voidedAt }, userEmail);
      await fetchDataFromSupabase();
      return true;
    } else {
      setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, isVoided: true, voidReason: voidReason.trim(), voidedBy: userEmail, voidedAt } : e));
      return true;
    }
  };

  // 4. ADD CASH RECONCILIATION
  const addReconciliation = async (data: Omit<CashReconciliation, 'id' | 'difference' | 'recordedBy'>): Promise<boolean> => {
    if (!isOfficer) {
      alert('មានតែប្រធានក្លឹប ឬបេឡាធិការប៉ុណ្ណោះដែលមានសិទ្ធិផ្ទៀងផ្ទាត់សាច់ប្រាក់!');
      return false;
    }

    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'Officer';
    const newId = crypto.randomUUID();
    const record: CashReconciliation = {
      ...data,
      id: newId,
      difference: (data.actualCash + data.actualBank) - data.systemBalance,
      recordedBy: userEmail,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const row = mapReconciliationToRow(record);
      const { error } = await supabase.from('cash_reconciliations').upsert(row, { onConflict: 'period_year,period_month' });
      if (error) {
        handleSupabaseError(error, 'Add Cash Reconciliation');
        return false;
      }
      await insertAuditLog('cash_reconciliations', newId, 'INSERT', null, record, userEmail);
      await fetchDataFromSupabase();
      return true;
    } else {
      setReconciliations(prev => [record, ...prev.filter(r => !(r.periodYear === data.periodYear && r.periodMonth === data.periodMonth))]);
      return true;
    }
  };

  // 5. CLOSE FISCAL YEAR
  const closeFiscalYear = async (fiscalYear: number, notes?: string): Promise<{ success: boolean; error?: string }> => {
    if (!isPresident) {
      return { success: false, error: 'មានតែប្រធានក្លឹបប៉ុណ្ណោះដែលមានសិទ្ធិបិទបញ្ជីប្រចាំឆ្នាំ!' };
    }

    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'President';

    const yearSavings = savingsRecords.filter(s => s.year === fiscalYear).reduce((sum, s) => sum + s.amount, 0);
    const yearPayments = payments.filter(p => new Date(p.paymentDate).getFullYear() === fiscalYear);
    const interestIncome = yearPayments.reduce((sum, p) => sum + p.interestPaid, 0);
    const lateFees = yearPayments.reduce((sum, p) => sum + p.lateFee, 0);
    const yearExpenses = expenses.filter(e => !e.isVoided && new Date(e.expenseDate).getFullYear() === fiscalYear).reduce((sum, e) => sum + e.amount, 0);
    const netProfit = interestIncome + lateFees - yearExpenses;
    const totalDividends = Math.max(0, netProfit);

    if (isSupabaseConfigured) {
      const { error: rpcErr } = await supabase.rpc('close_fiscal_year', {
        p_year: fiscalYear,
        p_total_dividends: totalDividends,
        p_notes: notes || null
      });

      if (rpcErr) {
        console.warn('RPC close_fiscal_year failed, doing direct fallback:', rpcErr);
        const newId = crypto.randomUUID();
        const closingRow = mapFiscalClosingToRow({
          id: newId,
          fiscalYear,
          totalSavings: yearSavings,
          interestIncome,
          lateFees,
          totalExpenses: yearExpenses,
          netProfit,
          totalDividends,
          closedBy: userEmail,
          notes
        });

        const { error: insertErr } = await supabase.from('fiscal_year_closings').insert([closingRow]);
        if (insertErr) {
          handleSupabaseError(insertErr, 'Close Fiscal Year');
          return { success: false, error: insertErr.message };
        }
        await insertAuditLog('fiscal_year_closings', newId, 'INSERT', null, closingRow, userEmail);
      } else {
        await insertAuditLog('fiscal_year_closings', String(fiscalYear), 'INSERT', null, { fiscalYear, totalDividends }, userEmail);
      }

      await fetchDataFromSupabase();
      return { success: true };
    } else {
      setFiscalClosings(prev => [...prev.filter(f => f.fiscalYear !== fiscalYear), {
        id: crypto.randomUUID(),
        fiscalYear,
        totalSavings: yearSavings,
        interestIncome,
        lateFees,
        totalExpenses: yearExpenses,
        netProfit,
        totalDividends,
        closedBy: userEmail,
        closedAt: new Date().toISOString(),
        notes
      }]);
      return { success: true };
    }
  };

  // 6. DECIDE LOAN APPLICATION (TWO-OFFICER APPROVAL)
  const decideLoanApplication = async (
    applicationId: string, 
    decision: 'APPROVED' | 'REJECTED', 
    comment?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isOfficer) {
      return { success: false, error: 'មានតែប្រធានក្លឹប ឬបេឡាធិការប៉ុណ្ណោះដែលមានសិទ្ធិអនុម័តកម្ចី!' };
    }

    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'Officer';
    const officerRole = (currentUser?.role === 'ប្រធានក្លឹប' || currentUser?.role === 'បេឡាធិការ') 
      ? currentUser.role 
      : 'ប្រធានក្លឹប';

    const app = applications.find(a => a.id === applicationId);
    if (!app) return { success: false, error: 'រកមិនឃើញពាក្យស្នើសុំកម្ចីទេ' };

    // Prevent approving own loan application
    if (app.memberId && currentUser?.id === app.memberId) {
      const errText = 'អ្នកមិនអាចអនុម័ត ឬបដិសេធពាក្យស្នើសុំកម្ចីរបស់ខ្លួនឯងបានទេ!';
      alert(errText);
      return { success: false, error: errText };
    }

    if (isSupabaseConfigured) {
      const { error: rpcErr } = await supabase.rpc('decide_loan_application', {
        p_application_id: applicationId,
        p_decision: decision,
        p_comment: comment || null
      });

      if (rpcErr) {
        console.warn('RPC decide_loan_application failed/missing, doing direct fallback:', rpcErr);
        
        // Direct Fallback
        const approvalId = crypto.randomUUID();
        const approvalRow = mapLoanApprovalToRow({
          id: approvalId,
          applicationId,
          officerId: currentUser?.id,
          officerName: currentUser?.nameKhmer || 'Officer',
          officerRole: officerRole as any,
          decision,
          comment
        });

        const { error: appvErr } = await supabase.from('loan_approvals').upsert(approvalRow, { onConflict: 'application_id,officer_role' });
        if (appvErr) {
          handleSupabaseError(appvErr, 'Save Loan Approval');
          return { success: false, error: appvErr.message };
        }

        // Query approvals for this application
        const { data: appvs } = await supabase.from('loan_approvals').select('*').eq('application_id', applicationId);
        let newAppStatus: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';

        if (appvs && appvs.length > 0) {
          const hasRejection = appvs.some(a => a.decision === 'REJECTED');
          const presApproved = appvs.some(a => a.officer_role === 'ប្រធានក្លឹប' && a.decision === 'APPROVED');
          const treasApproved = appvs.some(a => a.officer_role === 'បេឡាធិការ' && a.decision === 'APPROVED');

          if (hasRejection || decision === 'REJECTED') {
            newAppStatus = 'REJECTED';
          } else if (presApproved && treasApproved) {
            newAppStatus = 'APPROVED';
          }
        }

        if (newAppStatus !== 'PENDING') {
          await supabase.from('loan_applications').update({ status: newAppStatus }).eq('id', applicationId);
        }

        await insertAuditLog('loan_applications', applicationId, 'UPDATE', { status: app.status }, { status: newAppStatus, decision, comment }, userEmail);
      }

      await fetchDataFromSupabase();
      return { success: true };
    } else {
      setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status: decision === 'REJECTED' ? 'REJECTED' : 'APPROVED' } : a));
      return { success: true };
    }
  };

  // 7. MEMBER EXIT (សមាជិកចាកចេញ)
  const exitMember = async (
    memberId: string, 
    payoutData: { exitDate: string; payoutMethod: import('../types').PaymentMethod; notes?: string; hasWrittenDebtNote: boolean }
  ): Promise<{ success: boolean; error?: string; exitRecord?: MemberExit }> => {
    if (!isOfficer) {
      return { success: false, error: 'មានតែប្រធានក្លឹប ឬបេឡាធិការប៉ុណ្ណោះដែលមានសិទ្ធិធ្វើការទូទាត់សមាជិកចាកចេញ!' };
    }

    const member = members.find(m => m.id === memberId);
    if (!member) return { success: false, error: 'រកមិនឃើញសមាជិកទេ' };

    if (member.role === 'ប្រធានក្លឹប' || member.role === 'បេឡាធិការ') {
      return { success: false, error: 'ប្រធានក្លឹប ឬ បេឡាធិការ មិនអាចចាកចេញបានទេ! ត្រូវធ្វើការប្តូរមុខតំណែងជាមុនសិន។' };
    }

    const userEmail = supabaseUser?.email || currentUser?.email || currentUser?.nameKhmer || 'Officer';

    const savingsAtExit = member.totalSavings;
    const dividendsAtExit = member.totalDividendsEarned;

    // Active loan deduction
    const memberLoans = loans.filter(l => l.borrowerId === memberId && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));
    const loanDeduction = memberLoans.reduce((sum, l) => sum + l.remainingBalance, 0);

    const payoutAmount = savingsAtExit + dividendsAtExit - loanDeduction;

    if (payoutAmount < 0 && !payoutData.hasWrittenDebtNote) {
      return { success: false, error: 'ទឹកប្រាក់ទូទាត់អវិជ្ជមាន! ត្រូវមានលិខិតទទួលស្គាល់បំណុលជាលាយលក្ខណ៍អក្សរ។' };
    }

    const newExitId = crypto.randomUUID();
    const receiptNum = `EX-${payoutData.exitDate.replace(/-/g, '')}-${Date.now().toString().slice(-3)}`;

    const exitRecord: MemberExit = {
      id: newExitId,
      memberId,
      memberName: member.nameKhmer,
      exitDate: payoutData.exitDate,
      savingsAtExit,
      dividendsAtExit,
      loanDeduction,
      payoutAmount,
      payoutMethod: payoutData.payoutMethod,
      receiptNumber: receiptNum,
      paidBy: userEmail,
      notes: payoutData.notes,
      hasWrittenDebtNote: payoutData.hasWrittenDebtNote,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { error: exitErr } = await supabase.from('member_exits').insert([mapMemberExitToRow(exitRecord)]);
      if (exitErr) {
        handleSupabaseError(exitErr, 'Record Member Exit');
        return { success: false, error: exitErr.message };
      }

      const { error: memErr } = await supabase.from('members').update({ status: 'LEFT' }).eq('id', memberId);
      if (memErr) {
        handleSupabaseError(memErr, 'Update Member Status to LEFT');
        return { success: false, error: memErr.message };
      }

      await insertAuditLog('members', memberId, 'UPDATE', { status: member.status }, { status: 'LEFT' }, userEmail);
      await insertAuditLog('member_exits', newExitId, 'INSERT', null, exitRecord, userEmail);

      await fetchDataFromSupabase();
      return { success: true, exitRecord };
    } else {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: 'LEFT' } : m));
      setMemberExits(prev => [exitRecord, ...prev]);
      return { success: true, exitRecord };
    }
  };

  const login = (phoneOrCode: string, pin?: string): boolean => {
    const cleanSearch = phoneOrCode.replace(/\s+/g, '').toLowerCase();
    const found = members.find(m => {
      const p = m.phone.replace(/\s+/g, '').toLowerCase();
      const c = m.memberCode.toLowerCase();
      return p === cleanSearch || c === cleanSearch || m.nameKhmer.includes(phoneOrCode);
    });

    if (found) {
      if (pin && found.pin && found.pin !== pin) {
        return false;
      }
      setCurrentUser(found);
      setIsLoginModalOpen(false);
      return true;
    }
    return false;
  };

  const quickLoginAsMember = (memberId: string) => {
    const found = members.find(m => m.id === memberId);
    if (found) {
      setCurrentUser(found);
      setIsLoginModalOpen(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const supabaseSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSupabaseUser(null);
    setSupabaseSession(null);
  };

  const resetToDefaultData = async () => {
    await fetchDataFromSupabase();
  };

  return (
    <ClubContext.Provider value={{
      members,
      savingsRecords,
      loans,
      applications,
      payments,
      notifications,
      stats,
      currentTab,
      setCurrentTab,
      selectedLoanForSchedule,
      setSelectedLoanForSchedule,
      selectedLoanForContract,
      setSelectedLoanForContract,
      selectedMemberForDetail,
      setSelectedMemberForDetail,
      isRepaymentModalOpen,
      setIsRepaymentModalOpen,
      preselectedLoanForRepayment,
      setPreselectedLoanForRepayment,
      selectedReceiptForPrint,
      setSelectedReceiptForPrint,
      currentUser,
      supabaseSession,
      supabaseUser,
      isSupabaseConfigured,
      isLoadingData,
      supabaseError,
      isLoginModalOpen,
      setIsLoginModalOpen,
      officerTerms,
      clubSettings,
      expenses,
      reconciliations,
      fiscalClosings,
      loanApprovals,
      memberExits,
      auditLogs,
      overdueInstallmentViews,
      isOfficer,
      isPresident,
      isTreasurer,
      isYearClosed,
      transferOfficeRole,
      login,
      quickLoginAsMember,
      logout,
      supabaseSignOut,
      updateMemberProfile,
      addMember,
      updateMember,
      addSavingsRecord,
      updateSavingsRecord,
      deleteSavingsRecord,
      updateLoan,
      deleteLoan,
      updateLoanPayment,
      submitLoanApplication,
      approveLoanApplication,
      rejectLoanApplication,
      recordLoanPaymentTransaction,
      voidLoanPayment,
      markReminderSent,
      refreshData: fetchDataFromSupabase,
      resetToDefaultData,
      updateClubSettings,
      addExpense,
      voidExpense,
      addReconciliation,
      closeFiscalYear,
      decideLoanApplication,
      exitMember
    }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};
