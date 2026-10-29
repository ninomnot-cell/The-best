import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  
  // Auth & Profile
  currentUser: Member | null;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  login: (phoneOrCode: string, pin?: string) => boolean;
  quickLoginAsMember: (memberId: string) => void;
  logout: () => void;
  updateMemberProfile: (memberId: string, updatedData: Partial<Member>) => void;
  
  // Actions
  addMember: (member: Omit<Member, 'id' | 'memberCode' | 'totalSavings' | 'totalDividendsEarned' | 'activeLoanAmount'>) => void;
  updateMember: (member: Member) => void;
  addSavingsRecord: (record: Omit<MonthlySavingRecord, 'id'>) => void;
  submitLoanApplication: (app: Omit<LoanApplication, 'id' | 'status' | 'appliedDate'>) => void;
  approveLoanApplication: (applicationId: string, customInterestRate?: number, customMethod?: import('../types').InterestMethod) => void;
  rejectLoanApplication: (applicationId: string) => void;
  recordLoanRepayment: (loanId: string, installmentNumber: number, receiptNumber: string, paidAmount?: number) => void;
  markReminderSent: (notificationId: string) => void;
  resetToDefaultData: () => void;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

const STORAGE_KEY = 'the_best_family_club_data_v2';

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_members`);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [savingsRecords, setSavingsRecords] = useState<MonthlySavingRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_savings`);
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_RECORDS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_loans`);
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [applications, setApplications] = useState<LoanApplication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_applications`);
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [currentUser, setCurrentUser] = useState<Member | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return INITIAL_MEMBERS[0]; // default logged in as Sok Chenda (Club President)
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<Loan | null>(null);
  const [selectedLoanForContract, setSelectedLoanForContract] = useState<Loan | null>(null);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<Member | null>(null);
  const [sentReminderIds, setSentReminderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sent_reminders`);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_members`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_savings`, JSON.stringify(savingsRecords));
  }, [savingsRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_loans`, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_applications`, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sent_reminders`, JSON.stringify(sentReminderIds));
  }, [sentReminderIds]);

  // Derive notifications from active loan repayment schedules
  const notifications = useMemo(() => {
    const list: NotificationReminder[] = [];
    const today = new Date('2026-10-27'); // anchor date based on metadata context

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

    // Sort overdue first, then due today, then upcoming
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

  // Add Member
  const addMember = (data: Omit<Member, 'id' | 'memberCode' | 'totalSavings' | 'totalDividendsEarned' | 'activeLoanAmount'>) => {
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
  };

  // Update Member
  const updateMember = (updated: Member) => {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  // Add Monthly Savings
  const addSavingsRecord = (recordData: Omit<MonthlySavingRecord, 'id'>) => {
    const newRecord: MonthlySavingRecord = {
      ...recordData,
      id: `sav-${Date.now()}`
    };

    setSavingsRecords(prev => [newRecord, ...prev]);

    // Update member's accumulated total savings
    setMembers(prev => prev.map(m => {
      if (m.id === recordData.memberId) {
        return {
          ...m,
          totalSavings: m.totalSavings + recordData.amount
        };
      }
      return m;
    }));
  };

  // Apply for Loan
  const submitLoanApplication = (appData: Omit<LoanApplication, 'id' | 'status' | 'appliedDate'>) => {
    const newApp: LoanApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'PENDING',
      appliedDate: '2026-10-27'
    };
    setApplications(prev => [newApp, ...prev]);
  };

  // Approve Loan Application
  const approveLoanApplication = (appId: string, customRate?: number, customMethod?: import('../types').InterestMethod) => {
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

    // Update application status
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'APPROVED' } : a));

    // If member, update their active loan amount
    if (app.applicantType === 'MEMBER' && app.memberId) {
      setMembers(prev => prev.map(m => m.id === app.memberId ? { ...m, activeLoanAmount: m.activeLoanAmount + app.requestedAmount } : m));
    }
  };

  // Reject Loan Application
  const rejectLoanApplication = (appId: string) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'REJECTED' } : a));
  };

  // Record Repayment
  const recordLoanRepayment = (
    loanId: string, 
    installmentNumber: number, 
    receiptNumber: string,
    paidAmount?: number
  ) => {
    setLoans(prevLoans => prevLoans.map(loan => {
      if (loan.id !== loanId) return loan;

      let paidPrincipalDelta = 0;
      let paidInterestDelta = 0;

      const updatedSchedule = loan.schedule.map(item => {
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

      const newRemaining = Math.max(0, loan.remainingBalance - paidPrincipalDelta);
      const allPaid = updatedSchedule.every(item => item.status === 'PAID');
      const hasOverdue = updatedSchedule.some(item => item.status === 'OVERDUE');

      const newStatus = allPaid ? 'COMPLETED' : (hasOverdue ? 'OVERDUE' : 'ACTIVE');

      // Also if borrower was a member, update member's active loan amount
      if (loan.borrowerType === 'MEMBER' && loan.borrowerId) {
        setMembers(prevMembers => prevMembers.map(m => {
          if (m.id === loan.borrowerId) {
            return {
              ...m,
              activeLoanAmount: Math.max(0, m.activeLoanAmount - paidPrincipalDelta)
            };
          }
          return m;
        }));
      }

      return {
        ...loan,
        remainingBalance: newRemaining,
        totalPaidPrincipal: loan.totalPaidPrincipal + paidPrincipalDelta,
        totalPaidInterest: loan.totalPaidInterest + paidInterestDelta,
        status: newStatus,
        schedule: updatedSchedule
      };
    }));
  };

  // Mark Reminder as Sent
  const markReminderSent = (notificationId: string) => {
    if (!sentReminderIds.includes(notificationId)) {
      setSentReminderIds(prev => [...prev, notificationId]);
    }
  };

  // Auth & Profile methods
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

  const updateMemberProfile = (memberId: string, updatedData: Partial<Member>) => {
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
  };

  // Reset demo data
  const resetToDefaultData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_members`);
    localStorage.removeItem(`${STORAGE_KEY}_savings`);
    localStorage.removeItem(`${STORAGE_KEY}_loans`);
    localStorage.removeItem(`${STORAGE_KEY}_applications`);
    localStorage.removeItem(`${STORAGE_KEY}_sent_reminders`);
    localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    setMembers(INITIAL_MEMBERS);
    setSavingsRecords(INITIAL_SAVINGS_RECORDS);
    setLoans(INITIAL_LOANS);
    setApplications(INITIAL_APPLICATIONS);
    setSentReminderIds([]);
    setCurrentUser(INITIAL_MEMBERS[0]);
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
      isLoginModalOpen,
      setIsLoginModalOpen,
      login,
      quickLoginAsMember,
      logout,
      updateMemberProfile,
      addMember,
      updateMember,
      addSavingsRecord,
      submitLoanApplication,
      approveLoanApplication,
      rejectLoanApplication,
      recordLoanRepayment,
      markReminderSent,
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
