import { createClient } from '@supabase/supabase-js';
import { 
  Member, 
  MonthlySavingRecord, 
  Loan, 
  RepaymentScheduleItem, 
  LoanApplication,
  LoanPayment,
  OfficerTerm
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

/**
 * Ensures ID is a valid UUID, otherwise generates a new random UUID
 */
export function ensureUUID(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  return crypto.randomUUID();
}

/**
 * Format string as YYYY-MM-DD
 */
export function formatDateStr(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

// ==========================================
// 1. MEMBERS MAPPERS
// ==========================================
export function mapMemberFromRow(row: any): Member {
  return {
    id: row.id,
    memberCode: row.member_code || '',
    nameKhmer: row.name_khmer || '',
    nameEnglish: row.name_english || '',
    phone: row.phone || '',
    idCardNumber: row.id_card_number || '',
    joinDate: formatDateStr(row.join_date),
    role: row.role || 'សមាជិក',
    monthlyCommitment: Number(row.monthly_commitment ?? 100),
    totalSavings: Number(row.total_savings ?? 0),
    totalDividendsEarned: Math.round(Number(row.total_savings ?? 0) * 0.12),
    activeLoanAmount: 0,
    address: row.address || '',
    occupation: row.occupation || '',
    email: row.email ? row.email.toLowerCase() : '',
    status: row.status || 'ACTIVE',
    pin: row.pin || '1234'
  };
}

export function mapMemberToRow(m: Partial<Member>): Record<string, any> {
  const row: Record<string, any> = {};
  if (m.id) row.id = ensureUUID(m.id);
  if (m.memberCode !== undefined) row.member_code = m.memberCode;
  if (m.nameKhmer !== undefined) row.name_khmer = typeof m.nameKhmer === 'string' ? m.nameKhmer.trim() : m.nameKhmer;
  if (m.nameEnglish !== undefined) row.name_english = typeof m.nameEnglish === 'string' && m.nameEnglish.trim() ? m.nameEnglish.trim() : null;
  if (m.phone !== undefined) row.phone = typeof m.phone === 'string' ? m.phone.trim() : m.phone;
  if (m.idCardNumber !== undefined) row.id_card_number = typeof m.idCardNumber === 'string' ? m.idCardNumber.trim() : m.idCardNumber;
  if (m.joinDate !== undefined) row.join_date = formatDateStr(m.joinDate);
  if (m.role !== undefined) row.role = m.role;
  if (m.monthlyCommitment !== undefined) row.monthly_commitment = Number(m.monthlyCommitment);
  if (m.totalSavings !== undefined) row.total_savings = Number(m.totalSavings);
  if (m.address !== undefined) row.address = typeof m.address === 'string' && m.address.trim() ? m.address.trim() : null;
  if (m.occupation !== undefined) row.occupation = typeof m.occupation === 'string' && m.occupation.trim() ? m.occupation.trim() : null;
  if (m.email !== undefined) row.email = typeof m.email === 'string' && m.email.trim() ? m.email.trim().toLowerCase() : null;
  if (m.pin !== undefined) row.pin = typeof m.pin === 'string' && m.pin.trim() ? m.pin.trim() : '1234';
  if (m.status !== undefined) row.status = m.status;
  return row;
}

// ==========================================
// 2. MONTHLY SAVINGS MAPPERS
// ==========================================
export function mapSavingFromRow(row: any, memberMap: Record<string, Member> = {}): MonthlySavingRecord {
  const member = memberMap[row.member_id];
  return {
    id: row.id,
    memberId: row.member_id,
    memberName: member ? member.nameKhmer : (row.member_name || 'សមាជិក'),
    year: Number(row.year),
    month: Number(row.month),
    amount: Number(row.amount),
    paymentDate: formatDateStr(row.payment_date),
    paymentMethod: row.payment_method || 'ABA_PAY',
    referenceNumber: row.reference_number || '',
    recordedBy: row.recorded_by || '',
    notes: row.notes || undefined
  };
}

export function mapSavingToRow(r: Partial<MonthlySavingRecord>): Record<string, any> {
  const row: Record<string, any> = {};
  if (r.id) row.id = ensureUUID(r.id);
  if (r.memberId) row.member_id = ensureUUID(r.memberId);
  if (r.year !== undefined) row.year = Number(r.year);
  if (r.month !== undefined) row.month = Number(r.month);
  if (r.amount !== undefined) row.amount = Number(r.amount);
  if (r.paymentDate !== undefined) row.payment_date = formatDateStr(r.paymentDate);
  if (r.paymentMethod !== undefined) row.payment_method = r.paymentMethod;
  if (r.referenceNumber !== undefined) row.reference_number = r.referenceNumber;
  if (r.recordedBy !== undefined) row.recorded_by = r.recordedBy;
  if (r.notes !== undefined) row.notes = r.notes || null;
  return row;
}

// ==========================================
// 3. LOANS MAPPERS
// ==========================================
export function mapLoanFromRow(row: any, scheduleRows: any[] = []): Loan {
  const schedule = scheduleRows.map(mapScheduleFromRow).sort((a, b) => a.installmentNumber - b.installmentNumber);
  
  const principalAmount = Number(row.principal_amount ?? 0);
  const totalInterest = schedule.reduce((sum, s) => sum + s.interest, 0);
  const totalPayable = principalAmount + totalInterest;

  const totalPaidPrincipal = schedule.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.principal, 0);
  const totalPaidInterest = schedule.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.interest, 0);
  const remainingBalance = Math.max(0, principalAmount - totalPaidPrincipal);

  return {
    id: row.id,
    loanCode: row.loan_code || '',
    borrowerType: row.borrower_type || 'MEMBER',
    borrowerId: row.borrower_id || undefined,
    borrowerName: row.borrower_name || '',
    borrowerPhone: row.borrower_phone || '',
    borrowerIdCard: row.borrower_id_card || '',
    borrowerAddress: row.borrower_address || '',
    principalAmount,
    monthlyInterestRate: Number(row.monthly_interest_rate ?? 1.2),
    interestMethod: row.interest_method || 'DECLINING',
    termMonths: Number(row.term_months ?? 12),
    startDate: formatDateStr(row.start_date),
    endDate: formatDateStr(row.end_date),
    purpose: row.purpose || '',
    guarantorName: row.guarantor_name || undefined,
    guarantorPhone: row.guarantor_phone || undefined,
    collateralDescription: row.collateral_description || undefined,
    status: row.status || 'ACTIVE',
    totalInterest,
    totalPayable,
    totalPaidPrincipal,
    totalPaidInterest,
    remainingBalance,
    schedule,
    contractNumber: row.contract_number || '',
    approvedBy: 'គណៈកម្មការសមាគម The Best Club',
    createdAt: row.created_at || '2026-10-27'
  };
}

export function mapLoanToRow(l: Partial<Loan>): Record<string, any> {
  const row: Record<string, any> = {};
  if (l.id) row.id = ensureUUID(l.id);
  if (l.loanCode !== undefined) row.loan_code = l.loanCode;
  if (l.borrowerType !== undefined) row.borrower_type = l.borrowerType;
  if (l.borrowerId !== undefined) {
    row.borrower_id = l.borrowerId ? ensureUUID(l.borrowerId) : null;
  }
  if (l.borrowerName !== undefined) row.borrower_name = l.borrowerName;
  if (l.borrowerPhone !== undefined) row.borrower_phone = l.borrowerPhone;
  if (l.borrowerIdCard !== undefined) row.borrower_id_card = l.borrowerIdCard;
  if (l.borrowerAddress !== undefined) row.borrower_address = l.borrowerAddress;
  if (l.principalAmount !== undefined) row.principal_amount = Number(l.principalAmount);
  if (l.monthlyInterestRate !== undefined) row.monthly_interest_rate = Number(l.monthlyInterestRate);
  if (l.interestMethod !== undefined) row.interest_method = l.interestMethod;
  if (l.termMonths !== undefined) row.term_months = Number(l.termMonths);
  if (l.startDate !== undefined) row.start_date = formatDateStr(l.startDate);
  if (l.endDate !== undefined) row.end_date = formatDateStr(l.endDate);
  if (l.purpose !== undefined) row.purpose = l.purpose;
  if (l.guarantorName !== undefined) row.guarantor_name = l.guarantorName || null;
  if (l.guarantorPhone !== undefined) row.guarantor_phone = l.guarantorPhone || null;
  if (l.collateralDescription !== undefined) row.collateral_description = l.collateralDescription || null;
  if (l.status !== undefined) row.status = l.status;
  if (l.contractNumber !== undefined) row.contract_number = l.contractNumber;
  return row;
}

// ==========================================
// 4. LOAN REPAYMENT SCHEDULES MAPPERS
// ==========================================
export function mapScheduleFromRow(row: any): RepaymentScheduleItem {
  return {
    id: row.id,
    installmentNumber: Number(row.installment_number ?? 1),
    dueDate: formatDateStr(row.due_date),
    beginningBalance: Number(row.beginning_balance ?? 0),
    principal: Number(row.principal_amount ?? 0),
    interest: Number(row.interest_amount ?? 0),
    totalDue: Number(row.total_due ?? 0),
    endingBalance: Number(row.ending_balance ?? 0),
    status: row.status || 'PENDING',
    paidDate: row.paid_date ? formatDateStr(row.paid_date) : undefined,
    paidAmount: row.paid_amount ? Number(row.paid_amount) : (row.status === 'PAID' ? Number(row.total_due ?? 0) : undefined),
    receiptNumber: row.receipt_number || undefined
  };
}

export function mapScheduleToRow(s: RepaymentScheduleItem, loanId: string): Record<string, any> {
  return {
    id: ensureUUID(s.id),
    loan_id: ensureUUID(loanId),
    installment_number: Number(s.installmentNumber),
    due_date: formatDateStr(s.dueDate),
    beginning_balance: Number(s.beginningBalance),
    principal_amount: Number(s.principal),
    interest_amount: Number(s.interest),
    total_due: Number(s.totalDue),
    ending_balance: Number(s.endingBalance),
    status: s.status,
    paid_date: s.paidDate ? formatDateStr(s.paidDate) : null,
    receipt_number: s.receiptNumber || null
  };
}

// ==========================================
// 5. LOAN PAYMENTS MAPPERS
// ==========================================
export function mapLoanPaymentFromRow(row: any): LoanPayment {
  return {
    id: row.id,
    loanId: row.loan_id,
    scheduleId: row.schedule_id || undefined,
    installmentNumber: row.installment_number ? Number(row.installment_number) : undefined,
    paymentDate: formatDateStr(row.payment_date),
    amountPaid: Number(row.amount_paid ?? 0),
    principalPaid: Number(row.principal_paid ?? 0),
    interestPaid: Number(row.interest_paid ?? 0),
    lateFee: Number(row.late_fee ?? 0),
    paymentMethod: row.payment_method || 'CASH',
    receiptNumber: row.receipt_number || '',
    recordedBy: row.recorded_by || '',
    notes: row.notes || undefined,
    createdAt: row.created_at || undefined
  };
}

export function mapLoanPaymentToRow(p: Partial<LoanPayment>): Record<string, any> {
  const row: Record<string, any> = {};
  if (p.id) row.id = ensureUUID(p.id);
  if (p.loanId) row.loan_id = ensureUUID(p.loanId);
  if (p.scheduleId) row.schedule_id = ensureUUID(p.scheduleId);
  if (p.installmentNumber !== undefined) row.installment_number = Number(p.installmentNumber);
  if (p.paymentDate !== undefined) row.payment_date = formatDateStr(p.paymentDate);
  if (p.amountPaid !== undefined) row.amount_paid = Number(p.amountPaid);
  if (p.principalPaid !== undefined) row.principal_paid = Number(p.principalPaid);
  if (p.interestPaid !== undefined) row.interest_paid = Number(p.interestPaid);
  if (p.lateFee !== undefined) row.late_fee = Number(p.lateFee);
  if (p.paymentMethod !== undefined) row.payment_method = p.paymentMethod;
  if (p.receiptNumber !== undefined) row.receipt_number = p.receiptNumber;
  if (p.recordedBy !== undefined) row.recorded_by = p.recordedBy;
  if (p.notes !== undefined) row.notes = p.notes || null;
  return row;
}

// ==========================================
// 6. LOAN APPLICATIONS MAPPERS
// ==========================================
export function mapApplicationFromRow(row: any): LoanApplication {
  return {
    id: row.id,
    applicantType: row.applicant_type || 'MEMBER',
    applicantName: row.applicant_name || '',
    applicantPhone: row.applicant_phone || '',
    applicantIdCard: '010293847',
    applicantAddress: 'ភ្នំពេញ',
    occupation: 'ពាណិជ្ជករ',
    requestedAmount: Number(row.requested_amount ?? 0),
    proposedInterestRate: 1.2,
    interestMethod: 'DECLINING',
    proposedTermMonths: Number(row.proposed_term_months ?? 12),
    purpose: row.purpose || '',
    collateralDescription: row.collateral_description || '',
    guarantorName: row.guarantor_name || '',
    guarantorPhone: row.guarantor_phone || '',
    guarantorRelationship: 'សមាជិក',
    appliedDate: formatDateStr(row.applied_date),
    status: row.status || 'PENDING'
  };
}

export function mapApplicationToRow(a: Partial<LoanApplication>): Record<string, any> {
  const row: Record<string, any> = {};
  if (a.id) row.id = ensureUUID(a.id);
  if (a.applicantType !== undefined) row.applicant_type = a.applicantType;
  if (a.applicantName !== undefined) row.applicant_name = a.applicantName;
  if (a.applicantPhone !== undefined) row.applicant_phone = a.applicantPhone;
  if (a.requestedAmount !== undefined) row.requested_amount = Number(a.requestedAmount);
  if (a.proposedTermMonths !== undefined) row.proposed_term_months = Number(a.proposedTermMonths);
  if (a.purpose !== undefined) row.purpose = a.purpose;
  if (a.collateralDescription !== undefined) row.collateral_description = a.collateralDescription || null;
  if (a.guarantorName !== undefined) row.guarantor_name = a.guarantorName || null;
  if (a.guarantorPhone !== undefined) row.guarantor_phone = a.guarantorPhone || null;
  if (a.status !== undefined) row.status = a.status;
  if (a.appliedDate !== undefined) row.applied_date = formatDateStr(a.appliedDate);
  return row;
}

// ==========================================
// 7. OFFICER TERMS MAPPERS
// ==========================================
export function mapOfficerTermFromRow(row: any, memberMap: Record<string, Member> = {}): OfficerTerm {
  const member = memberMap[row.member_id];
  return {
    id: row.id,
    memberId: row.member_id,
    memberName: member ? member.nameKhmer : (row.member_name || 'សមាជិក'),
    role: row.role || 'ប្រធានក្លឹប',
    termStart: formatDateStr(row.term_start),
    termEnd: row.term_end ? formatDateStr(row.term_end) : null
  };
}

export function mapOfficerTermToRow(t: Partial<OfficerTerm>): Record<string, any> {
  const row: Record<string, any> = {};
  if (t.id) row.id = ensureUUID(t.id);
  if (t.memberId) row.member_id = ensureUUID(t.memberId);
  if (t.role !== undefined) row.role = t.role;
  if (t.termStart !== undefined) row.term_start = formatDateStr(t.termStart);
  if (t.termEnd !== undefined) row.term_end = t.termEnd ? formatDateStr(t.termEnd) : null;
  return row;
}

// ==========================================
// 8. AUDIT LOG HELPER
// ==========================================
export async function insertAuditLog(
  tableName: string,
  recordId: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'VOID',
  oldData: any,
  newData: any,
  changedBy: string
): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('audit_log').insert({
      id: ensureUUID(),
      table_name: tableName,
      record_id: ensureUUID(recordId),
      action,
      old_data: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
      new_data: newData ? JSON.parse(JSON.stringify(newData)) : null,
      changed_by: changedBy,
      changed_at: new Date().toISOString()
    });
    if (error) {
      console.error('[Audit Log Error]:', error);
    }
  } catch (e) {
    console.error('[Audit Log Exception]:', e);
  }
}
