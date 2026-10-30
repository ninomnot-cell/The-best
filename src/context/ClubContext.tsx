import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Member, 
  MonthlySavingRecord, 
  Loan, 
  LoanApplication, 
  NotificationReminder, 
  ClubStats, 
  BorrowerType 
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
      // Fallback local defaults
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

  // 2. Function to load/sync data from Supabase
  const fetchDataFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    setIsLoadingData(true);
    setSupabaseError(null);

    try {
      // Fetch members
      const { data: memberRows, error: memberErr } = await supabase
        .from('members')
        .select('*')
        .order('member_code', { ascending: true });

      if (memberErr) throw memberErr;

      // Auto-seed if Supabase database is empty
      if (!memberRows || memberRows.length === 0) {
        console.log('Database empty! Auto-seeding initial data into Supabase...');
        await seedInitialDataToSupabase();
        return;
      }

      const mappedMembers = memberRows.map(mapMemberFromRow);
      setMembers(mappedMembers);

      // Match current user
      if (!currentUser) {
        if (supabaseUser?.email) {
          const matched = mappedMembers.find(m => m.email?.toLowerCase() === supabaseUser.email?.toLowerCase());
          setCurrentUser(matched || mappedMembers[0]);
        } else {
          setCurrentUser(mappedMembers[0]);
        }
      }

      // Fetch savings
      const { data: savingRows, error: savingErr } = await supabase
        .from('monthly_savings')
        .select('*')
        .order('payment_date', { ascending: false });

      if (savingErr) throw savingErr;
      setSavingsRecords((savingRows || []).map(mapSavingFromRow));

      // Fetch loans & schedules
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

      // Fetch applications
      const { data: appRows, error: appErr } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!appErr && appRows) {
        setApplications(appRows.map(mapApplicationFromRow));
      }

      // Fetch notifications log for sent reminders
      const { data: notifRows } = await supabase
        .from('notifications_log')
        .select('*');

      if (notifRows) {
        const sentIds = notifRows.map(n => String(n.id || n.loan_id));
        setSentReminderIds(sentIds);
      }

    } catch (err: any) {
      console.error('Error fetching Supabase data:', err);
      setSupabaseError(err.message || 'Failed to load data from Supabase');
    } finally {
      setIsLoadingData(false);
    }
  }, [supabaseUser]);

  // Seed initial dataset into fresh Supabase tables
  const seedInitialDataToSupabase = async () => {
    try {
      // Insert members
      const memberRows = INITIAL_MEMBERS.map(mapMemberToRow);
      await supabase.from('members').upsert(memberRows);

      // Insert savings
      const savingRows = INITIAL_SAVINGS_RECORDS.map(mapSavingToRow);
      await supabase.from('monthly_savings').upsert(savingRows);

      // Insert loans & schedules
      for (const loan of INITIAL_LOANS) {
        const loanRow = mapLoanToRow(loan);
        await supabase.from('loans').upsert([loanRow]);

        const schedRows = loan.schedule.map(s => mapScheduleToRow(s, loan.id));
        await supabase.from('loan_repayment_schedules').upsert(schedRows);
      }

      // Insert applications
      const appRows = INITIAL_APPLICATIONS.map(mapApplicationToRow);
      await supabase.from('loan_applications').upsert(appRows);

      console.log('Auto-seed completed successfully!');
      // Re-fetch mapped data
      const { data: mRows } = await supabase.from('members').select('*');
      if (mRows) setMembers(mRows.map(mapMemberFromRow));

      const { data: sRows } = await supabase.from('monthly_savings').select('*');
      if (sRows) setSavingsRecords(sRows.map(mapSavingFromRow));

      setLoans(INITIAL_LOANS);
      setApplications(INITIAL_APPLICATIONS);
      setCurrentUser(INITIAL_MEMBERS[0]);
    } catch (e: any) {
      console.error('Error seeding Supabase:', e);
      setSupabaseError('Seeding initial data failed: ' + e.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  // 3. Load data on mount & set up Realtime subscription
  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchDataFromSupabase();

      // Realtime subscription across all tables
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

  // Derived notifications from active loan repayment schedules
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
  const addMember = async (data: Omit<Member, 'id' | 'memberCode' | 'totalSavings' | 'totalDividendsEarned' | 'activeLoanAmount'>) => {
    const nextCode = `TBF-00${members.length + 1}`;
    const newMember: Member = {
      ...data,
      id: `mem-${Date.now()}`,
      memberCode: nextCode,
      totalSavings: 0,
      totalDividendsEarned: 0,
      activeLoanAmount: 0
    };

    setMembers(prev => [...prev, newMember]);

    if (isSupabaseConfigured) {
      await supabase.from('members').insert([mapMemberToRow(newMember)]);
    }
  };

  const updateMember = async (updated: Member) => {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));

    if (isSupabaseConfigured) {
      await supabase
        .from('members')
        .update(mapMemberToRow(updated))
        .eq('id', updated.id);
    }
  };

  const addSavingsRecord = async (recordData: Omit<MonthlySavingRecord, 'id'>) => {
    const newRecord: MonthlySavingRecord = {
      ...recordData,
      id: `sav-${Date.now()}`
    };

    setSavingsRecords(prev => [newRecord, ...prev]);

    // Update member total savings
    const targetMember = members.find(m => m.id === recordData.memberId);
    if (targetMember) {
      const updatedSavings = targetMember.totalSavings + recordData.amount;
      setMembers(prev => prev.map(m => m.id === targetMember.id ? { ...m, totalSavings: updatedSavings } : m));

      if (isSupabaseConfigured) {
        await supabase
          .from('members')
          .update({ total_savings: updatedSavings })
          .eq('id', targetMember.id);
      }
    }

    if (isSupabaseConfigured) {
      await supabase.from('monthly_savings').insert([mapSavingToRow(newRecord)]);
    }
  };

  const submitLoanApplication = async (appData: Omit<LoanApplication, 'id' | 'status' | 'appliedDate'>) => {
    const newApp: LoanApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'PENDING',
      appliedDate: '2026-10-27'
    };

    setApplications(prev => [newApp, ...prev]);

    if (isSupabaseConfigured) {
      await supabase.from('loan_applications').insert([mapApplicationToRow(newApp)]);
    }
  };

  const approveLoanApplication = async (appId: string, customRate?: number, customMethod?: import('../types').InterestMethod) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const rate = customRate !== undefined 
      ? customRate 
      : (app.proposedInterestRate !== undefined ? app.proposedInterestRate : (app.applicantType === 'MEMBER' ? 1.2 : 2.5));

    const method = customMethod || app.interestMethod || 'DECLINING';

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
      id: `loan-${Date.now()}`,
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

    setLoans(prev => [newLoan, ...prev]);
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'APPROVED' } : a));

    if (app.applicantType === 'MEMBER' && app.memberId) {
      setMembers(prev => prev.map(m => m.id === app.memberId ? { ...m, activeLoanAmount: m.activeLoanAmount + app.requestedAmount } : m));
    }

    if (isSupabaseConfigured) {
      await supabase.from('loans').insert([mapLoanToRow(newLoan)]);
      const schedRows = schedule.map(s => mapScheduleToRow(s, newLoan.id));
      await supabase.from('loan_repayment_schedules').insert(schedRows);
      await supabase.from('loan_applications').update({ status: 'APPROVED' }).eq('id', appId);

      if (app.applicantType === 'MEMBER' && app.memberId) {
        const mem = members.find(m => m.id === app.memberId);
        if (mem) {
          await supabase.from('members').update({ active_loan_amount: mem.activeLoanAmount + app.requestedAmount }).eq('id', app.memberId);
        }
      }
    }
  };

  const rejectLoanApplication = async (appId: string) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'REJECTED' } : a));
    if (isSupabaseConfigured) {
      await supabase.from('loan_applications').update({ status: 'REJECTED' }).eq('id', appId);
    }
  };

  const recordLoanRepayment = async (
    loanId: string, 
    installmentNumber: number, 
    receiptNumber: string,
    paidAmount?: number
  ) => {
    const targetLoan = loans.find(l => l.id === loanId);
    if (!targetLoan) return;

    let paidPrincipalDelta = 0;
    let paidInterestDelta = 0;

    const updatedSchedule = targetLoan.schedule.map(item => {
      if (item.installmentNumber === installmentNumber) {
        paidPrincipalDelta = item.principal;
        paidInterestDelta = item.interest;
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

    setLoans(prevLoans => prevLoans.map(loan => {
      if (loan.id !== loanId) return loan;
      return {
        ...loan,
        remainingBalance: newRemaining,
        totalPaidPrincipal: loan.totalPaidPrincipal + paidPrincipalDelta,
        totalPaidInterest: loan.totalPaidInterest + paidInterestDelta,
        status: newStatus,
        schedule: updatedSchedule
      };
    }));

    if (targetLoan.borrowerType === 'MEMBER' && targetLoan.borrowerId) {
      setMembers(prevMembers => prevMembers.map(m => {
        if (m.id === targetLoan.borrowerId) {
          return {
            ...m,
            activeLoanAmount: Math.max(0, m.activeLoanAmount - paidPrincipalDelta)
          };
        }
        return m;
      }));
    }

    if (isSupabaseConfigured) {
      // Update schedule item in Supabase
      await supabase
        .from('loan_repayment_schedules')
        .update({
          status: 'PAID',
          paid_date: '2026-10-27',
          paid_amount: paidAmount || (targetLoan.schedule.find(s => s.installmentNumber === installmentNumber)?.totalDue ?? 0),
          receipt_number: receiptNumber
        })
        .eq('loan_id', loanId)
        .eq('installment_number', installmentNumber);

      // Update loan status & remaining balance
      await supabase
        .from('loans')
        .update({
          remaining_balance: newRemaining,
          status: newStatus
        })
        .eq('id', loanId);

      if (targetLoan.borrowerType === 'MEMBER' && targetLoan.borrowerId) {
        const mem = members.find(m => m.id === targetLoan.borrowerId);
        if (mem) {
          await supabase
            .from('members')
            .update({ active_loan_amount: Math.max(0, mem.activeLoanAmount - paidPrincipalDelta) })
            .eq('id', targetLoan.borrowerId);
        }
      }
    }
  };

  const markReminderSent = async (notificationId: string) => {
    if (!sentReminderIds.includes(notificationId)) {
      setSentReminderIds(prev => [...prev, notificationId]);

      if (isSupabaseConfigured) {
        const notif = notifications.find(n => n.id === notificationId);
        if (notif) {
          await supabase.from('notifications_log').insert([{
            loan_id: notif.loanId,
            recipient_name: notif.borrowerName,
            recipient_phone: notif.borrowerPhone,
            message_khmer: notif.smsMessageKhmer,
            channel: 'SMS',
            status: 'DELIVERED'
          }]);
        }
      }
    }
  };

  const updateMemberProfile = async (memberId: string, updatedData: Partial<Member>) => {
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

    if (isSupabaseConfigured) {
      await supabase
        .from('members')
        .update(mapMemberToRow(updatedData))
        .eq('id', memberId);
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
    setMembers(INITIAL_MEMBERS);
    setSavingsRecords(INITIAL_SAVINGS_RECORDS);
    setLoans(INITIAL_LOANS);
    setApplications(INITIAL_APPLICATIONS);
    setSentReminderIds([]);
    setCurrentUser(INITIAL_MEMBERS[0]);

    if (isSupabaseConfigured) {
      await seedInitialDataToSupabase();
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
