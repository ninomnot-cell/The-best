import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Member, 
  MonthlySavingRecord, 
  Loan, 
  LoanApplication, 
  NotificationReminder, 
  ClubStats 
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
  mapApplicationToRow
} from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface ClubContextType {
  members: Member[];
  savingsRecords: MonthlySavingRecord[];
  loans: Loan[];
  applications: LoanApplication[];
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
  
  // Auth & Session
  currentUser: Member | null;
  supabaseSession: Session | null;
  supabaseUser: User | null;
  isSupabaseConfigured: boolean;
  isLoadingData: boolean;
  supabaseError: string | null;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  
  // Actions
  login: (phoneOrCode: string, pin?: string) => boolean;
  quickLoginAsMember: (memberId: string) => void;
  logout: () => void;
  supabaseSignOut: () => Promise<void>;
  updateMemberProfile: (memberId: string, updatedData: Partial<Member>) => Promise<void>;
  
  addMember: (member: Omit<Member, 'id' | 'memberCode' | 'totalSavings' | 'totalDividendsEarned' | 'activeLoanAmount'>) => Promise<void>;
  updateMember: (member: Member) => Promise<void>;
  addSavingsRecord: (record: Omit<MonthlySavingRecord, 'id'>) => Promise<void>;
  submitLoanApplication: (app: Omit<LoanApplication, 'id' | 'status' | 'appliedDate'>) => Promise<void>;
  approveLoanApplication: (applicationId: string, customInterestRate?: number, customMethod?: import('../types').InterestMethod) => Promise<void>;
  rejectLoanApplication: (applicationId: string) => Promise<void>;
  recordLoanRepayment: (loanId: string, installmentNumber: number, receiptNumber: string, paidAmount?: number) => Promise<void>;
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

      // 4. Loan Applications
      const { data: appRows, error: appErr } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!appErr && appRows) {
        setApplications(appRows.map(mapApplicationFromRow));
      }

      // 5. Notifications log
      const { data: notifRows, error: notifErr } = await supabase
        .from('notifications_log')
        .select('*');

      if (!notifErr && notifRows) {
        setSentReminderIds(notifRows.map(n => String(n.id || n.loan_id)));
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

  // Derived Notifications
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

  // MUTATION ACTIONS (NO UI DISPLAY UNLESS SUPABASE CONFIRMS)

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

  // 7. Record Loan Repayment
  const recordLoanRepayment = async (
    loanId: string, 
    installmentNumber: number, 
    receiptNumber: string,
    paidAmount?: number
  ) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    let paidPrincipalDelta = 0;
    const updatedSchedule = targetLoan.schedule.map(item => {
      if (item.installmentNumber === installmentNumber) {
        paidPrincipalDelta = item.principal;
        return {
          ...item,
          status: 'PAID' as const,
          paidDate: '2026-10-27',
          paidAmount: paidAmount || item.totalDue,
          receiptNumber: receiptNumber
        };
      }
      return item;
    });

    const newRemaining = Math.max(0, targetLoan.remainingBalance - paidPrincipalDelta);
    const allPaid = updatedSchedule.every(item => item.status === 'PAID');
    const hasOverdue = updatedSchedule.some(item => item.status === 'OVERDUE');
    const newStatus = allPaid ? 'COMPLETED' : (hasOverdue ? 'OVERDUE' : 'ACTIVE');

    if (isSupabaseConfigured) {
      const { error: schedErr } = await supabase
        .from('loan_repayment_schedules')
        .update({
          status: 'PAID',
          paid_date: '2026-10-27',
          receipt_number: receiptNumber
        })
        .eq('loan_id', loanId)
        .eq('installment_number', installmentNumber);

      if (schedErr) {
        handleSupabaseError(schedErr, 'Record Repayment Schedule');
        return;
      }

      const { error: loanErr } = await supabase
        .from('loans')
        .update({
          status: newStatus
        })
        .eq('id', loanId);

      if (loanErr) {
        handleSupabaseError(loanErr, 'Update Loan Status');
      }

      await fetchDataFromSupabase();
    } else {
      setLoans(prevLoans => prevLoans.map(loan => {
        if (loan.id !== loanId) return loan;
        return {
          ...loan,
          remainingBalance: newRemaining,
          status: newStatus,
          schedule: updatedSchedule
        };
      }));
    }
  };

  // 8. Mark Reminder Sent
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

  // 9. Update Member Profile
  const updateMemberProfile = async (memberId: string, updatedData: Partial<Member>) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('members')
        .update(mapMemberToRow(updatedData))
        .eq('id', memberId);

      if (error) {
        handleSupabaseError(error, 'Update Member Profile');
        return;
      }
      await fetchDataFromSupabase();
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
      currentUser,
      supabaseSession,
      supabaseUser,
      isSupabaseConfigured,
      isLoadingData,
      supabaseError,
      isLoginModalOpen,
      setIsLoginModalOpen,
      login,
      quickLoginAsMember,
      logout,
      supabaseSignOut,
      updateMemberProfile,
      addMember,
      updateMember,
      addSavingsRecord,
      submitLoanApplication,
      approveLoanApplication,
      rejectLoanApplication,
      recordLoanRepayment,
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
