import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Member, 
  MonthlySavingRecord, 
  Loan, 
  LoanApplication, 
  NotificationReminder, 
  ClubStats,
  LoanPayment,
  OfficerTerm
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
  insertAuditLog
} from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

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
  
  officerTerms: import('../types').OfficerTerm[];
  
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
  markReminderSent: (notificationId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  resetToDefaultData: () => Promise<void>;
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

  // Repayment Modal & Print Receipts State
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState<boolean>(false);
  const [preselectedLoanForRepayment, setPreselectedLoanForRepayment] = useState<{ loanId: string; installmentNumber?: number } | null>(null);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<{ payment: LoanPayment; loan: Loan } | null>(null);

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

      // Auto-seed if database is brand new and empty
      if (!memberRows || memberRows.length === 0) {
        console.log('Database empty! Auto-seeding initial data in strict order...');
        await seedInitialDataToSupabase();
        return;
      }

      const mappedMembers = memberRows.map(mapMemberFromRow);
      setMembers(mappedMembers);

      const memberMap: Record<string, Member> = {};
      mappedMembers.forEach(m => { memberMap[m.id] = m; });

      // Match current logged in user
      if (supabaseUser?.email) {
        const matched = mappedMembers.find(m => m.email?.toLowerCase() === supabaseUser.email?.toLowerCase());
        setCurrentUser(prev => prev ? (mappedMembers.find(m => m.id === prev.id) || matched || mappedMembers[0]) : (matched || mappedMembers[0]));
      } else {
        setCurrentUser(prev => prev ? (mappedMembers.find(m => m.id === prev.id) || mappedMembers[0]) : mappedMembers[0]);
      }

      // 2. Monthly Savings
      const { data: savingRows, error: savingErr } = await supabase
        .from('monthly_savings')
        .select('*')
        .order('payment_date', { ascending: false });

      if (savingErr) throw savingErr;
      setSavingsRecords((savingRows || []).map(r => mapSavingFromRow(r, memberMap)));

      // 3. Loans & Repayment Schedules
      const { data: loanRows, error: loanErr } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (loanErr) throw loanErr;

      const { data: scheduleRows, error: scheduleErr } = await supabase
        .from('loan_repayment_schedules')
        .select('*');

      if (scheduleErr) throw scheduleErr;

      const scheduleMap: Record<string, any[]> = {};
      (scheduleRows || []).forEach(s => {
        const lid = String(s.loan_id);
        if (!scheduleMap[lid]) scheduleMap[lid] = [];
        scheduleMap[lid].push(s);
      });

      const mappedLoans = (loanRows || []).map(l => mapLoanFromRow(l, scheduleMap[String(l.id)] || []));
      setLoans(mappedLoans);

      // 4. Loan Payments (Repayment History)
      const { data: paymentRows, error: payErr } = await supabase
        .from('loan_payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (!payErr && paymentRows) {
        setPayments(paymentRows.map(mapLoanPaymentFromRow));
      }

      // 5. Loan Applications
      const { data: appRows, error: appErr } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!appErr && appRows) {
        setApplications(appRows.map(mapApplicationFromRow));
      }

      // 6. Notifications log
      const { data: notifRows, error: notifErr } = await supabase
        .from('notifications_log')
        .select('*');

      if (!notifErr && notifRows) {
        setSentReminderIds(notifRows.map(n => String(n.id || n.loan_id)));
      }

      // 7. Officer terms
      const { data: termRows, error: termErr } = await supabase
        .from('officer_terms')
        .select('*')
        .order('term_start', { ascending: false });

      if (!termErr && termRows && termRows.length > 0) {
        setOfficerTerms(termRows.map(r => mapOfficerTermFromRow(r, memberMap)));
      } else {
        const pres = mappedMembers.find(m => m.role === 'ប្រធានក្លឹប');
        const treas = mappedMembers.find(m => m.role === 'បេឡាធិការ');
        const defaultTerms: OfficerTerm[] = [];
        if (pres) {
          defaultTerms.push({
            id: crypto.randomUUID(),
            memberId: pres.id,
            memberName: pres.nameKhmer,
            role: 'ប្រធានក្លឹប',
            termStart: '2024-01-01',
            termEnd: null
          });
        }
        if (treas) {
          defaultTerms.push({
            id: crypto.randomUUID(),
            memberId: treas.id,
            memberName: treas.nameKhmer,
            role: 'បេឡាធិការ',
            termStart: '2024-01-01',
            termEnd: null
          });
        }
        setOfficerTerms(defaultTerms);
      }

    } catch (err: any) {
      console.error('Error fetching Supabase data:', err);
      setSupabaseError(err.message || 'Failed to load data from Supabase');
    } finally {
      setIsLoadingData(false);
    }
  }, [supabaseUser]);

  // Seed initial dataset into fresh Supabase tables in strict foreign key order
  const seedInitialDataToSupabase = async () => {
    try {
      // Step 1: Members
      const memberRows = INITIAL_MEMBERS.map(mapMemberToRow);
      const { error: memErr } = await supabase.from('members').insert(memberRows);
      if (memErr) {
        handleSupabaseError(memErr, 'Seed Members');
        return;
      }

      // Step 2: Monthly Savings
      const savingRows = INITIAL_SAVINGS_RECORDS.map(mapSavingToRow);
      const { error: savErr } = await supabase.from('monthly_savings').insert(savingRows);
      if (savErr) {
        handleSupabaseError(savErr, 'Seed Monthly Savings');
        return;
      }

      // Step 3: Loans
      const loanRows = INITIAL_LOANS.map(mapLoanToRow);
      const { error: loanErr } = await supabase.from('loans').insert(loanRows);
      if (loanErr) {
        handleSupabaseError(loanErr, 'Seed Loans');
        return;
      }

      // Step 4: Loan Repayment Schedules
      const allSchedules: Record<string, any>[] = [];
      INITIAL_LOANS.forEach(l => {
        l.schedule.forEach(s => {
          allSchedules.push(mapScheduleToRow(s, l.id));
        });
      });
      const { error: schedErr } = await supabase.from('loan_repayment_schedules').insert(allSchedules);
      if (schedErr) {
        handleSupabaseError(schedErr, 'Seed Schedules');
        return;
      }

      // Step 5: Loan Applications
      const appRows = INITIAL_APPLICATIONS.map(mapApplicationToRow);
      const { error: appErr } = await supabase.from('loan_applications').insert(appRows);
      if (appErr) {
        handleSupabaseError(appErr, 'Seed Loan Applications');
        return;
      }

      console.log('Auto-seed completed successfully in strict table order!');
      await fetchDataFromSupabase();

    } catch (e: any) {
      console.error('Error seeding Supabase:', e);
      setSupabaseError('Seeding initial data failed: ' + e.message);
    } finally {
      setIsLoadingData(false);
    }
  };

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
    const today = new Date('2026-10-27');

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

          const smsKhmer = `[ឌឹ បេស៍ ហ្វាមីលី ក្លឹប / THE BEST CLUB]\nជម្រាបសួរលោក/លោកស្រី ${loan.borrowerName},\nសូមជម្រាបរំលឹកពីកាលវិភាគបង់ប្រាក់កម្ចី (លើកទី ${inst.installmentNumber}) ទឹកប្រាក់សរុប $${inst.totalDue} ផុតកំណត់នៅថ្ងៃទី ${inst.dueDate}។\nសូមធ្វើការផ្ទេរប្រាក់មកគណនី ABA: 001 234 567 (The Best Club) ឬទាក់ទង 012 889 901។ សូមអរគុណ!`;

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
  }, [loans, sentReminderIds]);

  // Derived Financial Stats
  const stats: ClubStats = useMemo(() => {
    const totalClubSavings = members.reduce((sum, m) => sum + m.totalSavings, 0);
    const totalActiveLoans = loans
      .filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE')
      .reduce((sum, l) => sum + l.remainingBalance, 0);

    const totalInterestEarned = loans.reduce((sum, l) => sum + l.totalPaidInterest, 0);
    const cashOnHand = totalClubSavings - totalActiveLoans + totalInterestEarned;

    const activeLoanCount = loans.filter(l => l.status === 'ACTIVE').length;
    const overdueLoansCount = loans.filter(l => l.status === 'OVERDUE').length;
    const upcomingDueCount = notifications.length;

    return {
      totalClubSavings,
      totalActiveLoans,
      totalInterestEarned,
      cashOnHand,
      memberCount: members.length,
      activeLoanCount,
      overdueLoansCount,
      upcomingDueCount
    };
  }, [members, loans, notifications]);

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
      await fetchDataFromSupabase();
    } else {
      setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    }
  };

  // 3. Add Savings Record
  const addSavingsRecord = async (recordData: Omit<MonthlySavingRecord, 'id'>) => {
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

  // Helper to recalculate member total savings from monthly_savings table in Supabase
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
      
      // Recalculate total_savings for member(s)
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

      // If financial params changed & allowed, regenerate repayment schedule
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
      appliedDate: formatDateStr('2026-10-27')
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('loan_applications').insert([mapApplicationToRow(newApp)]);
      if (error) {
        handleSupabaseError(error, 'Submit Loan Application');
        return;
      }
      await fetchDataFromSupabase();
    } else {
      setApplications(prev => [newApp, ...prev]);
    }
  };

  // 5. Approve Loan Application
  const approveLoanApplication = async (appId: string, customRate?: number, customMethod?: import('../types').InterestMethod) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const rate = customRate !== undefined 
      ? customRate 
      : (app.proposedInterestRate !== undefined ? app.proposedInterestRate : (app.applicantType === 'MEMBER' ? 1.2 : 2.5));

    const method = customMethod || app.interestMethod || 'DECLINING';
    const newLoanId = crypto.randomUUID();

    const schedule = generateAmortizationSchedule(
      app.requestedAmount,
      rate,
      app.proposedTermMonths,
      '2026-10-27',
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
      startDate: '2026-10-27',
      endDate: schedule[schedule.length - 1]?.dueDate || '2027-04-27',
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
      createdAt: '2026-10-27'
    };

    if (isSupabaseConfigured) {
      // Step 1: Insert Loan
      const { error: loanErr } = await supabase.from('loans').insert([mapLoanToRow(newLoan)]);
      if (loanErr) {
        handleSupabaseError(loanErr, 'Approve Loan');
        return;
      }

      // Step 2: Insert Schedules
      const schedRows = schedule.map(s => mapScheduleToRow(s, newLoan.id));
      const { error: schedErr } = await supabase.from('loan_repayment_schedules').insert(schedRows);
      if (schedErr) {
        handleSupabaseError(schedErr, 'Create Amortization Schedule');
      }

      // Step 3: Update Application
      const { error: appErr } = await supabase.from('loan_applications').update({ status: 'APPROVED' }).eq('id', appId);
      if (appErr) {
        handleSupabaseError(appErr, 'Update Application Status');
      }

      await fetchDataFromSupabase();
    } else {
      setLoans(prev => [newLoan, ...prev]);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'APPROVED' } : a));
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
      await fetchDataFromSupabase();
    } else {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'REJECTED' } : a));
    }
  };

  // 7. RECORD LOAN PAYMENT TRANSACTION (FULL REPAYMENT & PARTIAL SUPPORT)
  const recordLoanPaymentTransaction = async (paymentData: Omit<LoanPayment, 'id'>): Promise<boolean> => {
    const targetLoan = loans.find(l => l.id === paymentData.loanId);
    if (!targetLoan) return false;

    const newPaymentId = crypto.randomUUID();
    const paymentRecord: LoanPayment = {
      ...paymentData,
      id: newPaymentId
    };

    if (isSupabaseConfigured) {
      // 1. Insert into loan_payments table
      const { error: payErr } = await supabase
        .from('loan_payments')
        .insert([mapLoanPaymentToRow(paymentRecord)]);

      if (payErr) {
        handleSupabaseError(payErr, 'Insert Loan Payment');
        return false;
      }

      // 2. Update loan_repayment_schedules
      const instNum = paymentData.installmentNumber || 1;
      const targetInst = targetLoan.schedule.find(s => s.installmentNumber === instNum);
      const fullDue = targetInst ? targetInst.totalDue : paymentData.amountPaid;

      // Status: PAID if amountPaid >= totalDue, else PARTIAL
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

      // 3. Re-calculate loan status & remaining balance
      // Fetch all updated schedules for this loan
      const { data: latestSchedules } = await supabase
        .from('loan_repayment_schedules')
        .select('*')
        .eq('loan_id', targetLoan.id);

      let newLoanStatus: 'ACTIVE' | 'COMPLETED' | 'OVERDUE' = 'ACTIVE';
      let totalPaidPrincipal = 0;

      if (latestSchedules && latestSchedules.length > 0) {
        const allPaid = latestSchedules.every(s => s.status === 'PAID');
        const todayStr = '2026-10-29';
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

      // Re-fetch all data from Supabase
      await fetchDataFromSupabase();

      // Show Printable Receipt
      setSelectedReceiptForPrint({
        payment: paymentRecord,
        loan: targetLoan
      });

      return true;

    } else {
      // Local fallback
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

    if (isSupabaseConfigured) {
      // 1. Delete from loan_payments
      const { error: delErr } = await supabase
        .from('loan_payments')
        .delete()
        .eq('id', paymentId);

      if (delErr) {
        handleSupabaseError(delErr, 'Void Payment Record');
        return false;
      }

      // 2. Reset schedule item status back to PENDING (or OVERDUE)
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

      // 3. Update loan status back to ACTIVE
      const { error: loanErr } = await supabase
        .from('loans')
        .update({ status: 'ACTIVE' })
        .eq('id', payment.loanId);

      if (loanErr) {
        handleSupabaseError(loanErr, 'Reset Loan Status');
      }

      await fetchDataFromSupabase();
      return true;
    } else {
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      return true;
    }
  };

  // 9. Mark Reminder Sent
  const markReminderSent = async (notificationId: string) => {
    if (!sentReminderIds.includes(notificationId)) {
      if (isSupabaseConfigured) {
        const notif = notifications.find(n => n.id === notificationId);
        if (notif) {
          const { error } = await supabase.from('notifications_log').insert([{
            id: crypto.randomUUID(),
            loan_id: ensureUUID(notif.loanId),
            recipient_name: notif.borrowerName,
            recipient_phone: notif.borrowerPhone,
            message_khmer: notif.smsMessageKhmer,
            channel: 'SMS',
            status: 'DELIVERED'
          }]);

          if (error) {
            handleSupabaseError(error, 'Log Notification Reminder');
            return;
          }
        }
        await fetchDataFromSupabase();
      } else {
        setSentReminderIds(prev => [...prev, notificationId]);
      }
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
      
      const { data, error } = await supabase.rpc('transfer_office', {
        p_role: role,
        p_new_member_id: p_new_member_id,
        p_effective: p_effective
      });

      if (error) {
        console.error('[Supabase RPC transfer_office Error]:', error);
        const errText = error.message || error.details || error.hint || JSON.stringify(error);

        // Fallback: Direct database updates to members and officer_terms so data is saved in Supabase
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

      await fetchDataFromSupabase();
      return { success: true };
    } else {
      // Local fallback
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
    if (isSupabaseConfigured) {
      await seedInitialDataToSupabase();
    } else {
      setMembers(INITIAL_MEMBERS);
      setSavingsRecords(INITIAL_SAVINGS_RECORDS);
      setLoans(INITIAL_LOANS);
      setApplications(INITIAL_APPLICATIONS);
      setSentReminderIds([]);
      setCurrentUser(INITIAL_MEMBERS[0]);
    }
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
      resetToDefaultData
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
