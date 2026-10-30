import { createClient } from '@supabase/supabase-js';
import { 
  Member, 
  MonthlySavingRecord, 
  Loan, 
  RepaymentScheduleItem, 
  LoanApplication, 
  NotificationReminder 
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'MY_SUPABASE_URL' && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Data mapping helper functions
export function mapMemberFromRow(row: any): Member {
  return {
    id: String(row.id),
    memberCode: row.member_code || row.memberCode || '',
    nameKhmer: row.name_khmer || row.nameKhmer || '',
    nameEnglish: row.name_english || row.nameEnglish || '',
    phone: row.phone || '',
    idCardNumber: row.id_card_number || row.idCardNumber || '',
    joinDate: row.join_date || row.joinDate || '',
    role: row.role || 'សមាជិក',
    monthlyCommitment: Number(row.monthly_commitment ?? row.monthlyCommitment ?? 100),
    totalSavings: Number(row.total_savings ?? row.totalSavings ?? 0),
    totalDividendsEarned: Number(row.total_dividends_earned ?? row.totalDividendsEarned ?? 0),
    activeLoanAmount: Number(row.active_loan_amount ?? row.activeLoanAmount ?? 0),
    avatarUrl: row.avatar_url || row.avatarUrl || undefined,
    address: row.address || '',
    occupation: row.occupation || undefined,
    email: row.email || undefined,
    pin: row.pin || undefined,
    status: row.status || 'ACTIVE'
  };
}

export function mapMemberToRow(m: Partial<Member>): any {
  const row: any = {};
  if (m.id !== undefined) row.id = m.id;
  if (m.memberCode !== undefined) row.member_code = m.memberCode;
  if (m.nameKhmer !== undefined) row.name_khmer = m.nameKhmer;
  if (m.nameEnglish !== undefined) row.name_english = m.nameEnglish;
  if (m.phone !== undefined) row.phone = m.phone;
  if (m.idCardNumber !== undefined) row.id_card_number = m.idCardNumber;
  if (m.joinDate !== undefined) row.join_date = m.joinDate;
  if (m.role !== undefined) row.role = m.role;
  if (m.monthlyCommitment !== undefined) row.monthly_commitment = m.monthlyCommitment;
  if (m.totalSavings !== undefined) row.total_savings = m.totalSavings;
  if (m.totalDividendsEarned !== undefined) row.total_dividends_earned = m.totalDividendsEarned;
  if (m.activeLoanAmount !== undefined) row.active_loan_amount = m.activeLoanAmount;
  if (m.avatarUrl !== undefined) row.avatar_url = m.avatarUrl;
  if (m.address !== undefined) row.address = m.address;
  if (m.occupation !== undefined) row.occupation = m.occupation;
  if (m.email !== undefined) row.email = m.email;
  if (m.pin !== undefined) row.pin = m.pin;
  if (m.status !== undefined) row.status = m.status;
  return row;
}

export function mapSavingFromRow(row: any): MonthlySavingRecord {
  return {
    id: String(row.id),
    memberId: String(row.member_id || row.memberId || ''),
    memberName: row.member_name || row.memberName || '',
    year: Number(row.year),
    month: Number(row.month),
    amount: Number(row.amount),
    paymentDate: row.payment_date || row.paymentDate || '',
    paymentMethod: row.payment_method || row.paymentMethod || 'ABA_PAY',
    referenceNumber: row.reference_number || row.referenceNumber || '',
    receiptUrl: row.receipt_url || row.receiptUrl || undefined,
    recordedBy: row.recorded_by || row.recordedBy || '',
    notes: row.notes || undefined
  };
}

export function mapSavingToRow(r: Partial<MonthlySavingRecord>): any {
  const row: any = {};
  if (r.id !== undefined) row.id = r.id;
  if (r.memberId !== undefined) row.member_id = r.memberId;
  if (r.memberName !== undefined) row.member_name = r.memberName;
  if (r.year !== undefined) row.year = r.year;
  if (r.month !== undefined) row.month = r.month;
  if (r.amount !== undefined) row.amount = r.amount;
  if (r.paymentDate !== undefined) row.payment_date = r.paymentDate;
  if (r.paymentMethod !== undefined) row.payment_method = r.paymentMethod;
  if (r.referenceNumber !== undefined) row.reference_number = r.referenceNumber;
  if (r.receiptUrl !== undefined) row.receipt_url = r.receiptUrl;
  if (r.recordedBy !== undefined) row.recorded_by = r.recordedBy;
  if (r.notes !== undefined) row.notes = r.notes;
  return row;
}

export function mapScheduleFromRow(row: any): RepaymentScheduleItem {
  return {
    installmentNumber: Number(row.installment_number ?? row.installmentNumber ?? 1),
    dueDate: row.due_date || row.dueDate || '',
    beginningBalance: Number(row.beginning_balance ?? row.beginningBalance ?? 0),
    principal: Number(row.principal_amount ?? row.principal ?? 0),
    interest: Number(row.interest_amount ?? row.interest ?? 0),
    totalDue: Number(row.total_due ?? row.totalDue ?? 0),
    endingBalance: Number(row.ending_balance ?? row.endingBalance ?? 0),
    status: row.status || 'PENDING',
    paidDate: row.paid_date || row.paidDate || undefined,
    paidAmount: row.paid_amount ? Number(row.paid_amount) : (row.paidAmount ? Number(row.paidAmount) : undefined),
    receiptNumber: row.receipt_number || row.receiptNumber || undefined
  };
}

export function mapScheduleToRow(s: RepaymentScheduleItem, loanId: string, id?: string): any {
  return {
    id: id || `sched-${loanId}-${s.installmentNumber}`,
    loan_id: loanId,
    installment_number: s.installmentNumber,
    due_date: s.dueDate,
    beginning_balance: s.beginningBalance,
    principal_amount: s.principal,
    interest_amount: s.interest,
    total_due: s.totalDue,
    ending_balance: s.endingBalance,
    status: s.status,
    paid_date: s.paidDate || null,
    paid_amount: s.paidAmount || null,
    receipt_number: s.receiptNumber || null
  };
}

export function mapLoanFromRow(row: any, scheduleRows: any[] = []): Loan {
  const schedule = scheduleRows.map(mapScheduleFromRow).sort((a, b) => a.installmentNumber - b.installmentNumber);
  
  // Calculate totalPaidPrincipal and totalPaidInterest if not stored directly
  const totalPaidPrincipal = row.total_paid_principal !== undefined 
    ? Number(row.total_paid_principal) 
    : schedule.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.principal, 0);

  const totalPaidInterest = row.total_paid_interest !== undefined 
    ? Number(row.total_paid_interest) 
    : schedule.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.interest, 0);

  const principalAmount = Number(row.principal_amount ?? row.principalAmount ?? 0);
  const remainingBalance = row.remaining_balance !== undefined 
    ? Number(row.remaining_balance) 
    : Math.max(0, principalAmount - totalPaidPrincipal);

  return {
    id: String(row.id),
    loanCode: row.loan_code || row.loanCode || '',
    borrowerType: row.borrower_type || row.borrowerType || 'MEMBER',
    borrowerId: row.borrower_id ? String(row.borrower_id) : undefined,
    borrowerName: row.borrower_name || row.borrowerName || '',
    borrowerPhone: row.borrower_phone || row.borrowerPhone || '',
    borrowerIdCard: row.borrower_id_card || row.borrowerIdCard || '',
    borrowerAddress: row.borrower_address || row.borrowerAddress || '',
    occupation: row.occupation || undefined,
    principalAmount,
    monthlyInterestRate: Number(row.monthly_interest_rate ?? row.monthlyInterestRate ?? 1.2),
    interestMethod: row.interest_method || row.interestMethod || 'DECLINING',
    termMonths: Number(row.term_months ?? row.termMonths ?? 12),
    startDate: row.start_date || row.startDate || '',
    endDate: row.end_date || row.endDate || '',
    purpose: row.purpose || '',
    guarantorName: row.guarantor_name || row.guarantorName || undefined,
    guarantorPhone: row.guarantor_phone || row.guarantorPhone || undefined,
    guarantorRelationship: row.guarantor_relationship || row.guarantorRelationship || undefined,
    collateralDescription: row.collateral_description || row.collateralDescription || undefined,
    status: row.status || 'ACTIVE',
    totalInterest: Number(row.total_interest ?? row.totalInterest ?? schedule.reduce((sum, s) => sum + s.interest, 0)),
    totalPayable: Number(row.total_payable ?? row.totalPayable ?? (principalAmount + schedule.reduce((sum, s) => sum + s.interest, 0))),
    totalPaidPrincipal,
    totalPaidInterest,
    remainingBalance,
    schedule,
    approvedBy: row.approved_by || row.approvedBy || undefined,
    contractNumber: row.contract_number || row.contractNumber || '',
    createdAt: row.created_at || row.createdAt || ''
  };
}

export function mapLoanToRow(l: Partial<Loan>): any {
  const row: any = {};
  if (l.id !== undefined) row.id = l.id;
  if (l.loanCode !== undefined) row.loan_code = l.loanCode;
  if (l.borrowerType !== undefined) row.borrower_type = l.borrowerType;
  if (l.borrowerId !== undefined) row.borrower_id = l.borrowerId || null;
  if (l.borrowerName !== undefined) row.borrower_name = l.borrowerName;
  if (l.borrowerPhone !== undefined) row.borrower_phone = l.borrowerPhone;
  if (l.borrowerIdCard !== undefined) row.borrower_id_card = l.borrowerIdCard;
  if (l.borrowerAddress !== undefined) row.borrower_address = l.borrowerAddress;
  if (l.occupation !== undefined) row.occupation = l.occupation;
  if (l.principalAmount !== undefined) row.principal_amount = l.principalAmount;
  if (l.monthlyInterestRate !== undefined) row.monthly_interest_rate = l.monthlyInterestRate;
  if (l.interestMethod !== undefined) row.interest_method = l.interestMethod;
  if (l.termMonths !== undefined) row.term_months = l.termMonths;
  if (l.startDate !== undefined) row.start_date = l.startDate;
  if (l.endDate !== undefined) row.end_date = l.endDate;
  if (l.purpose !== undefined) row.purpose = l.purpose;
  if (l.guarantorName !== undefined) row.guarantor_name = l.guarantorName;
  if (l.guarantorPhone !== undefined) row.guarantor_phone = l.guarantorPhone;
  if (l.guarantorRelationship !== undefined) row.guarantor_relationship = l.guarantorRelationship;
  if (l.collateralDescription !== undefined) row.collateral_description = l.collateralDescription;
  if (l.status !== undefined) row.status = l.status;
  if (l.contractNumber !== undefined) row.contract_number = l.contractNumber;
  return row;
}

export function mapApplicationFromRow(row: any): LoanApplication {
  return {
    id: String(row.id),
    applicantType: row.applicant_type || row.applicantType || 'MEMBER',
    memberId: row.member_id ? String(row.member_id) : undefined,
    applicantName: row.applicant_name || row.applicantName || '',
    applicantPhone: row.applicant_phone || row.applicantPhone || '',
    applicantIdCard: row.applicant_id_card || row.applicantIdCard || '',
    applicantAddress: row.applicant_address || row.applicantAddress || '',
    occupation: row.occupation || '',
    requestedAmount: Number(row.requested_amount ?? row.requestedAmount ?? 0),
    proposedInterestRate: Number(row.proposed_interest_rate ?? row.proposedInterestRate ?? 1.2),
    interestMethod: row.interest_method || row.interestMethod || 'DECLINING',
    proposedTermMonths: Number(row.proposed_term_months ?? row.proposedTermMonths ?? 12),
    purpose: row.purpose || '',
    collateralDescription: row.collateral_description || row.collateralDescription || '',
    guarantorName: row.guarantor_name || row.guarantorName || '',
    guarantorPhone: row.guarantor_phone || row.guarantorPhone || '',
    guarantorRelationship: row.guarantor_relationship || row.guarantorRelationship || '',
    appliedDate: row.applied_date || row.appliedDate || '',
    status: row.status || 'PENDING',
    notes: row.notes || undefined
  };
}

export function mapApplicationToRow(a: Partial<LoanApplication>): any {
  const row: any = {};
  if (a.id !== undefined) row.id = a.id;
  if (a.applicantType !== undefined) row.applicant_type = a.applicantType;
  if (a.memberId !== undefined) row.member_id = a.memberId || null;
  if (a.applicantName !== undefined) row.applicant_name = a.applicantName;
  if (a.applicantPhone !== undefined) row.applicant_phone = a.applicantPhone;
  if (a.applicantIdCard !== undefined) row.applicant_id_card = a.applicantIdCard;
  if (a.applicantAddress !== undefined) row.applicant_address = a.applicantAddress;
  if (a.occupation !== undefined) row.occupation = a.occupation;
  if (a.requestedAmount !== undefined) row.requested_amount = a.requestedAmount;
  if (a.proposedInterestRate !== undefined) row.proposed_interest_rate = a.proposedInterestRate;
  if (a.interestMethod !== undefined) row.interest_method = a.interestMethod;
  if (a.proposedTermMonths !== undefined) row.proposed_term_months = a.proposedTermMonths;
  if (a.purpose !== undefined) row.purpose = a.purpose;
  if (a.collateralDescription !== undefined) row.collateral_description = a.collateralDescription;
  if (a.guarantorName !== undefined) row.guarantor_name = a.guarantorName;
  if (a.guarantorPhone !== undefined) row.guarantor_phone = a.guarantorPhone;
  if (a.guarantorRelationship !== undefined) row.guarantor_relationship = a.guarantorRelationship;
  if (a.appliedDate !== undefined) row.applied_date = a.appliedDate;
  if (a.status !== undefined) row.status = a.status;
  if (a.notes !== undefined) row.notes = a.notes;
  return row;
}
