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
  status: 'ACTIVE' | 'INACTIVE' | 'LEFT';
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
  totalLateFeesEarned: number;
  totalExpenses: number;
  cashOnHand: number;
  memberCount: number;
  activeLoanCount: number;
  overdueLoansCount: number;
  upcomingDueCount: number;
}

export interface OfficerTerm {
  id: string;
  memberId: string;
  memberName?: string;
  role: 'ប្រធានក្លឹប' | 'បេឡាធិការ';
  termStart: string;
  termEnd?: string | null;
}

export type LateFeeType = 'NONE' | 'FLAT' | 'PERCENT_PER_DAY' | 'PERCENT_PER_MONTH';

export interface ClubSettings {
  id: number;
  clubNameKhmer: string;
  currentFiscalYear: number;
  memberLoanRate: number;
  externalLoanRate: number;
  defaultMonthlyCommitment: number;
  lateFeeType: LateFeeType;
  lateFeeValue: number;
  graceDays: number;
  updatedAt?: string;
}

export type ExpenseCategory = 'MEETING' | 'BANK_FEE' | 'PRINTING' | 'TRANSPORT' | 'OTHER';

export interface ExpenseRecord {
  id: string;
  expenseDate: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  recordedBy: string;
  isVoided: boolean;
  voidedBy?: string;
  voidReason?: string;
  voidedAt?: string;
  createdAt?: string;
}

export interface CashReconciliation {
  id: string;
  periodYear: number;
  periodMonth: number;
  systemBalance: number;
  actualCash: number;
  actualBank: number;
  difference: number;
  notes?: string;
  recordedBy: string;
  createdAt?: string;
}

export interface FiscalYearClosing {
  id: string;
  fiscalYear: number;
  totalSavings: number;
  interestIncome: number;
  lateFees: number;
  totalExpenses: number;
  netProfit: number;
  totalDividends: number;
  closedBy: string;
  closedAt: string;
  notes?: string;
}

export interface LoanApproval {
  id: string;
  applicationId: string;
  officerId?: string;
  officerName: string;
  officerRole: 'ប្រធានក្លឹប' | 'បេឡាធិការ';
  decision: 'APPROVED' | 'REJECTED';
  comment?: string;
  createdAt: string;
}

export interface MemberExit {
  id: string;
  memberId: string;
  memberName?: string;
  exitDate: string;
  savingsAtExit: number;
  dividendsAtExit: number;
  loanDeduction: number;
  payoutAmount: number;
  payoutMethod: PaymentMethod;
  receiptNumber: string;
  paidBy: string;
  notes?: string;
  hasWrittenDebtNote: boolean;
  createdAt?: string;
}

export interface AuditLogRecord {
  id: string;
  tableName: string;
  recordId: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'VOID';
  oldData?: any;
  newData?: any;
  changedBy: string;
  changedAt: string;
}

export interface OverdueInstallmentView {
  schedule_id: string;
  loan_id: string;
  loan_code: string;
  borrower_name: string;
  borrower_phone: string;
  installment_number: number;
  due_date: string;
  total_due: number;
  days_late: number;
  late_fee: number;
}

export interface NotificationLogRecord {
  id?: string;
  loanId: string;
  recipientName: string;
  recipientPhone: string;
  messageKhmer: string;
  channel: 'TELEGRAM_MANUAL' | 'SMS_MANUAL' | 'SMS';
  createdAt?: string;
}
