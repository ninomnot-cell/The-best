export type MemberRole = 'ប្រធានក្លឹប' | 'អនុប្រធាន' | 'បេឡាធិការ' | 'គណនេយ្យករ' | 'សមាជិក';

export type BorrowerType = 'MEMBER' | 'EXTERNAL';

export type LoanStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'REJECTED';

export type RepaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';

export type InterestMethod = 'FLAT' | 'DECLINING' | 'INTEREST_ONLY';

export type PaymentMethod = 'CASH' | 'ABA_PAY' | 'WING' | 'OTHER' | 'AC_LEDA';

export interface Member {
  id: string;
  memberCode: string; // e.g. "TB-001"
  nameKhmer: string;
  nameEnglish: string;
  phone: string;
  idCardNumber: string;
  joinDate: string; // YYYY-MM-DD
  role: MemberRole;
  monthlyCommitment: number; // monthly saving commitment (USD)
  totalSavings: number; // accumulated total savings
  totalDividendsEarned: number; // total interest/dividends earned
  activeLoanAmount: number;
  avatarUrl?: string;
  address: string;
  occupation?: string;
  email?: string;
  pin?: string; // 4-digit login PIN
  status: 'ACTIVE' | 'INACTIVE';
}

export interface MonthlySavingRecord {
  id: string;
  memberId: string;
  memberName: string;
  year: number;
  month: number; // 1 - 12
  amount: number;
  paymentDate: string;
  paymentMethod: 'ABA_PAY' | 'WING' | 'CASH' | 'AC_LEDA';
  referenceNumber: string;
  receiptUrl?: string;
  recordedBy: string;
  notes?: string;
}

export interface RepaymentScheduleItem {
  id?: string;
  installmentNumber: number;
  dueDate: string;
  beginningBalance: number;
  principal: number;
  interest: number;
  totalDue: number;
  endingBalance: number;
  status: RepaymentStatus;
  paidDate?: string;
  paidAmount?: number;
  receiptNumber?: string;
}

export interface Loan {
  id: string;
  loanCode: string; // e.g. "LN-2026-001"
  borrowerType: BorrowerType;
  borrowerId?: string; // memberId if MEMBER
  borrowerName: string;
  borrowerPhone: string;
  borrowerIdCard: string;
  borrowerAddress: string;
  occupation?: string;
  principalAmount: number;
  monthlyInterestRate: number; // in percent
  interestMethod: InterestMethod;
  termMonths: number;
  startDate: string;
  endDate: string;
  purpose: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorRelationship?: string;
  collateralDescription?: string;
  status: LoanStatus;
  totalInterest: number;
  totalPayable: number;
  totalPaidPrincipal: number;
  totalPaidInterest: number;
  remainingBalance: number;
  schedule: RepaymentScheduleItem[];
  approvedBy?: string;
  contractNumber: string;
  notes?: string;
  createdAt: string;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  scheduleId?: string;
  installmentNumber?: number;
  paymentDate: string; // YYYY-MM-DD
  amountPaid: number;
  principalPaid: number;
  interestPaid: number;
  lateFee: number;
  paymentMethod: PaymentMethod;
  receiptNumber: string;
  recordedBy: string;
  notes?: string;
  createdAt?: string;
}

export interface LoanApplication {
  id: string;
  applicantType: BorrowerType;
  memberId?: string;
  applicantName: string;
  applicantPhone: string;
  applicantIdCard: string;
  applicantAddress: string;
  occupation: string;
  requestedAmount: number;
  proposedInterestRate: number;
  interestMethod: InterestMethod;
  proposedTermMonths: number;
  purpose: string;
  collateralDescription: string;
  guarantorName: string;
  guarantorPhone: string;
  guarantorRelationship: string;
  appliedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
}

export interface NotificationReminder {
  id: string;
  loanId: string;
  borrowerName: string;
  borrowerPhone: string;
  installmentNumber: number;
  dueDate: string;
  totalDue: number;
  daysRemaining: number;
  status: 'UPCOMING' | 'DUE_TODAY' | 'OVERDUE';
  smsMessageKhmer: string;
  lastSentDate?: string;
}

export interface ClubStats {
  totalClubSavings: number;
  totalActiveLoans: number;
  totalInterestEarned: number;
  cashOnHand: number;
  memberCount: number;
  activeLoanCount: number;
  overdueLoansCount: number;
  upcomingDueCount: number;
}
