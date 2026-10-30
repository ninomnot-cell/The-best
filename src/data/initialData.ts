import { Member, MonthlySavingRecord, Loan, LoanApplication, RepaymentScheduleItem, InterestMethod } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'a1000000-0000-4000-8000-000000000001',
    memberCode: 'TBF-001',
    nameKhmer: 'សុខ ចិន្តា',
    nameEnglish: 'Sok Chenda',
    phone: '012 889 901',
    idCardNumber: '010293847',
    joinDate: '2024-01-15',
    role: 'ប្រធានក្លឹប',
    monthlyCommitment: 100,
    totalSavings: 2800,
    totalDividendsEarned: 340,
    activeLoanAmount: 0,
    address: 'សង្កាត់បឹងកក់១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    occupation: 'ពាណិជ្ជករ / ម្ចាស់អាជីវកម្ម',
    email: 'chenda.sok@thebestclub.kh',
    pin: '1234',
    status: 'ACTIVE'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000002',
    memberCode: 'TBF-002',
    nameKhmer: 'ចាន់ វិសាល',
    nameEnglish: 'Chan Visal',
    phone: '098 776 543',
    idCardNumber: '020384756',
    joinDate: '2024-01-15',
    role: 'អនុប្រធាន',
    monthlyCommitment: 100,
    totalSavings: 2800,
    totalDividendsEarned: 340,
    activeLoanAmount: 0,
    address: 'សង្កាត់ទួលទំពូង១ ខណ្ឌចំការមន រាជធានីភ្នំពេញ',
    occupation: 'វិស្វករសំណង់',
    email: 'visal.chan@thebestclub.kh',
    pin: '1234',
    status: 'ACTIVE'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000003',
    memberCode: 'TBF-003',
    nameKhmer: 'គឹម ស្រីនិច',
    nameEnglish: 'Kim Sreynich',
    phone: '087 665 432',
    idCardNumber: '030495867',
    joinDate: '2024-01-15',
    role: 'បេឡាធិការ',
    monthlyCommitment: 100,
    totalSavings: 2800,
    totalDividendsEarned: 340,
    activeLoanAmount: 1200,
    address: 'សង្កាត់ទឹកល្អក់២ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    occupation: 'អាជីវករលក់គ្រឿងទេស',
    email: 'sreynich.kim@thebestclub.kh',
    pin: '1234',
    status: 'ACTIVE'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000004',
    memberCode: 'TBF-004',
    nameKhmer: 'ហេង សុភ័ក្ត្រ',
    nameEnglish: 'Heng Sopheak',
    phone: '092 334 556',
    idCardNumber: '040586978',
    joinDate: '2024-02-01',
    role: 'គណនេយ្យករ',
    monthlyCommitment: 100,
    totalSavings: 2700,
    totalDividendsEarned: 325,
    activeLoanAmount: 0,
    address: 'សង្កាត់ផ្សារដេប៉ូ៣ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    occupation: 'អ្នកឯកទេសគណនេយ្យ',
    email: 'sopheak.heng@thebestclub.kh',
    pin: '1234',
    status: 'ACTIVE'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000005',
    memberCode: 'TBF-005',
    nameKhmer: 'លឹម គឹមហុង',
    nameEnglish: 'Lim Kimhong',
    phone: '070 445 667',
    idCardNumber: '050697889',
    joinDate: '2024-02-01',
    role: 'សមាជិក',
    monthlyCommitment: 100,
    totalSavings: 2700,
    totalDividendsEarned: 325,
    activeLoanAmount: 0,
    address: 'សង្កាត់បឹងត្របែក ខណ្ឌចំការមន រាជធានីភ្នំពេញ',
    occupation: 'បុគ្គលិកក្រុមហ៊ុនឯកជន',
    email: 'kimhong.lim@thebestclub.kh',
    pin: '1234',
    status: 'ACTIVE'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000006',
    memberCode: 'TBF-006',
    nameKhmer: 'ស៊ន សុវណ្ណារ៉ា',
    nameEnglish: 'Sorn Sovannara',
    phone: '016 556 778',
    idCardNumber: '060798990',
    joinDate: '2024-03-01',
    role: 'សមាជិក',
    monthlyCommitment: 100,
    totalSavings: 2600,
    totalDividendsEarned: 310,
    activeLoanAmount: 0,
    address: 'សង្កាត់ព្រែកប្រា ខណ្ឌច្បារអំពៅ រាជធានីភ្នំពេញ',
    occupation: 'អ្នកបើកបរអាជីព',
    email: 'sovannara.sorn@thebestclub.kh',
    pin: '1234',
    status: 'ACTIVE'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000007',
    memberCode: 'TBF-007',
    nameKhmer: 'កែវ សុភា',
    nameEnglish: 'Keo Sophea',
    phone: '077 889 001',
    idCardNumber: '070809112',
    joinDate: '2024-03-01',
    role: 'សមាជិក',
    monthlyCommitment: 100,
    totalSavings: 2600,
    totalDividendsEarned: 310,
    activeLoanAmount: 0,
    address: 'សង្កាត់ចោមចៅ១ ខណ្ឌពោធិ៍សែនជ័យ រាជធានីភ្នំពេញ',
    occupation: 'គ្រូបង្រៀន',
    email: 'sophea.keo@thebestclub.kh',
    pin: '1234',
    status: 'ACTIVE'
  },
  {
    id: 'a1000000-0000-4000-8000-000000000008',
    memberCode: 'TBF-008',
    nameKhmer: 'រស់ វណ្ណា',
    nameEnglish: 'Ros Vanna',
    phone: '089 990 112',
    idCardNumber: '080910223',
    joinDate: '2024-04-01',
    role: 'សមាជិក',
    monthlyCommitment: 100,
    totalSavings: 2500,
    totalDividendsEarned: 295,
    activeLoanAmount: 0,
    address: 'សង្កាត់ស្ទឹងមានជ័យ ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ',
    occupation: 'អ្នករចនាក្រាហ្វិក',
    email: 'vanna.ros@thebestclub.kh',
    pin: '1234',
    status: 'ACTIVE'
  }
];

export const INITIAL_SAVINGS_RECORDS: MonthlySavingRecord[] = [
  // 2026 Recent Records
  { id: 'd4000000-0000-4000-8000-000000000101', memberId: 'a1000000-0000-4000-8000-000000000001', memberName: 'សុខ ចិន្តា', year: 2026, month: 10, amount: 100, paymentDate: '2026-10-05', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-892109', recordedBy: 'គឹម ស្រីនិច', notes: 'បង់ទៀងទាត់' },
  { id: 'd4000000-0000-4000-8000-000000000102', memberId: 'a1000000-0000-4000-8000-000000000002', memberName: 'ចាន់ វិសាល', year: 2026, month: 10, amount: 100, paymentDate: '2026-10-04', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-892044', recordedBy: 'គឹម ស្រីនិច', notes: 'បង់តាម App' },
  { id: 'd4000000-0000-4000-8000-000000000103', memberId: 'a1000000-0000-4000-8000-000000000003', memberName: 'គឹម ស្រីនិច', year: 2026, month: 10, amount: 100, paymentDate: '2026-10-05', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-892110', recordedBy: 'ហេង សុភ័ក្ត្រ', notes: 'បង់តាមកាលកំណត់' },
  { id: 'd4000000-0000-4000-8000-000000000104', memberId: 'a1000000-0000-4000-8000-000000000004', memberName: 'ហេង សុភ័ក្ត្រ', year: 2026, month: 10, amount: 100, paymentDate: '2026-10-06', paymentMethod: 'WING', referenceNumber: 'WG-440129', recordedBy: 'គឹម ស្រីនិច', notes: 'ផ្ទេរតាមវីង' },
  { id: 'd4000000-0000-4000-8000-000000000105', memberId: 'a1000000-0000-4000-8000-000000000005', memberName: 'លឹម គឹមហុង', year: 2026, month: 10, amount: 100, paymentDate: '2026-10-05', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-892155', recordedBy: 'គឹម ស្រីនិច', notes: 'បង់ទាន់ពេល' },
  { id: 'd4000000-0000-4000-8000-000000000106', memberId: 'a1000000-0000-4000-8000-000000000006', memberName: 'ស៊ន សុវណ្ណារ៉ា', year: 2026, month: 10, amount: 100, paymentDate: '2026-10-07', paymentMethod: 'CASH', referenceNumber: 'CSH-0081', recordedBy: 'គឹម ស្រីនិច', notes: 'បង់សាច់ប្រាក់ផ្ទាល់' },
  { id: 'd4000000-0000-4000-8000-000000000107', memberId: 'a1000000-0000-4000-8000-000000000007', memberName: 'កែវ សុភា', year: 2026, month: 10, amount: 100, paymentDate: '2026-10-08', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-892330', recordedBy: 'គឹម ស្រីនិច', notes: 'បង់តាមកាលកំណត់' },
  { id: 'd4000000-0000-4000-8000-000000000108', memberId: 'a1000000-0000-4000-8000-000000000008', memberName: 'រស់ វណ្ណា', year: 2026, month: 10, amount: 100, paymentDate: '2026-10-10', paymentMethod: 'AC_LEDA', referenceNumber: 'ACL-33901', recordedBy: 'គឹម ស្រីនិច', notes: 'ផ្ទេរតាមអេស៊ីលីដា' },

  // September 2026
  { id: 'd4000000-0000-4000-8000-000000000201', memberId: 'a1000000-0000-4000-8000-000000000001', memberName: 'សុខ ចិន្តា', year: 2026, month: 9, amount: 100, paymentDate: '2026-09-05', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-771092', recordedBy: 'គឹម ស្រីនិច' },
  { id: 'd4000000-0000-4000-8000-000000000202', memberId: 'a1000000-0000-4000-8000-000000000002', memberName: 'ចាន់ វិសាល', year: 2026, month: 9, amount: 100, paymentDate: '2026-09-05', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-771093', recordedBy: 'គឹម ស្រីនិច' },
  { id: 'd4000000-0000-4000-8000-000000000203', memberId: 'a1000000-0000-4000-8000-000000000003', memberName: 'គឹម ស្រីនិច', year: 2026, month: 9, amount: 100, paymentDate: '2026-09-06', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-771120', recordedBy: 'ហេង សុភ័ក្ត្រ' },
  { id: 'd4000000-0000-4000-8000-000000000204', memberId: 'a1000000-0000-4000-8000-000000000004', memberName: 'ហេង សុភ័ក្ត្រ', year: 2026, month: 9, amount: 100, paymentDate: '2026-09-05', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-771095', recordedBy: 'គឹម ស្រីនិច' },
  { id: 'd4000000-0000-4000-8000-000000000205', memberId: 'a1000000-0000-4000-8000-000000000005', memberName: 'លឹម គឹមហុង', year: 2026, month: 9, amount: 100, paymentDate: '2026-09-07', paymentMethod: 'WING', referenceNumber: 'WG-399012', recordedBy: 'គឹម ស្រីនិច' },
  { id: 'd4000000-0000-4000-8000-000000000206', memberId: 'a1000000-0000-4000-8000-000000000006', memberName: 'ស៊ន សុវណ្ណារ៉ា', year: 2026, month: 9, amount: 100, paymentDate: '2026-09-08', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-771250', recordedBy: 'គឹម ស្រីនិច' },
  { id: 'd4000000-0000-4000-8000-000000000207', memberId: 'a1000000-0000-4000-8000-000000000007', memberName: 'កែវ សុភា', year: 2026, month: 9, amount: 100, paymentDate: '2026-09-05', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-771098', recordedBy: 'គឹម ស្រីនិច' },
  { id: 'd4000000-0000-4000-8000-000000000208', memberId: 'a1000000-0000-4000-8000-000000000008', memberName: 'រស់ វណ្ណា', year: 2026, month: 9, amount: 100, paymentDate: '2026-09-09', paymentMethod: 'CASH', referenceNumber: 'CSH-0073', recordedBy: 'គឹម ស្រីនិច' },

  // August 2026
  { id: 'd4000000-0000-4000-8000-000000000301', memberId: 'a1000000-0000-4000-8000-000000000001', memberName: 'សុខ ចិន្តា', year: 2026, month: 8, amount: 100, paymentDate: '2026-08-04', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-65001', recordedBy: 'គឹម ស្រីនិច' },
  { id: 'd4000000-0000-4000-8000-000000000302', memberId: 'a1000000-0000-4000-8000-000000000002', memberName: 'ចាន់ វិសាល', year: 2026, month: 8, amount: 100, paymentDate: '2026-08-05', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-65002', recordedBy: 'គឹម ស្រីនិច' },
  { id: 'd4000000-0000-4000-8000-000000000303', memberId: 'a1000000-0000-4000-8000-000000000003', memberName: 'គឹម ស្រីនិច', year: 2026, month: 8, amount: 100, paymentDate: '2026-08-05', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-65003', recordedBy: 'ហេង សុភ័ក្ត្រ' },
  { id: 'd4000000-0000-4000-8000-000000000304', memberId: 'a1000000-0000-4000-8000-000000000004', memberName: 'ហេង សុភ័ក្ត្រ', year: 2026, month: 8, amount: 100, paymentDate: '2026-08-06', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-65004', recordedBy: 'គឹម ស្រីនិច' },
  { id: 'd4000000-0000-4000-8000-000000000305', memberId: 'a1000000-0000-4000-8000-000000000005', memberName: 'លឹម គឹមហុង', year: 2026, month: 8, amount: 100, paymentDate: '2026-08-05', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-65005', recordedBy: 'គឹម ស្រីនិច' },
  { id: 'd4000000-0000-4000-8000-000000000306', memberId: 'a1000000-0000-4000-8000-000000000006', memberName: 'ស៊ន សុវណ្ណារ៉ា', year: 2026, month: 8, amount: 100, paymentDate: '2026-08-07', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-65006', recordedBy: 'គឹម ស្រីនិច' },
  { id: 'd4000000-0000-4000-8000-000000000307', memberId: 'a1000000-0000-4000-8000-000000000007', memberName: 'កែវ សុភា', year: 2026, month: 8, amount: 100, paymentDate: '2026-08-05', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-65007', recordedBy: 'គឹម ស្រីនិច' },
  { id: 'd4000000-0000-4000-8000-000000000308', memberId: 'a1000000-0000-4000-8000-000000000008', memberName: 'រស់ វណ្ណា', year: 2026, month: 8, amount: 100, paymentDate: '2026-08-08', paymentMethod: 'ABA_PAY', referenceNumber: 'ABA-65008', recordedBy: 'គឹម ស្រីនិច' }
];

export function generateAmortizationSchedule(
  principal: number,
  monthlyRatePercent: number,
  termMonths: number,
  startDateStr: string,
  method: InterestMethod = 'DECLINING'
): RepaymentScheduleItem[] {
  const schedule: RepaymentScheduleItem[] = [];
  const start = new Date(startDateStr);
  let currentBalance = principal;
  const flatMonthlyInterest = Math.round((principal * (monthlyRatePercent / 100)) * 100) / 100;
  const equalPrincipal = Math.round((principal / termMonths) * 100) / 100;

  for (let i = 1; i <= termMonths; i++) {
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + i);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    let p = 0;
    let interest = 0;
    let endBalance = 0;

    if (method === 'FLAT') {
      p = (i === termMonths) 
        ? Math.max(0, Math.round(currentBalance * 100) / 100) 
        : equalPrincipal;
      interest = flatMonthlyInterest;
      endBalance = Math.max(0, Math.round((currentBalance - p) * 100) / 100);
    } else if (method === 'DECLINING') {
      p = (i === termMonths) 
        ? Math.max(0, Math.round(currentBalance * 100) / 100) 
        : equalPrincipal;
      interest = Math.round((currentBalance * (monthlyRatePercent / 100)) * 100) / 100;
      endBalance = Math.max(0, Math.round((currentBalance - p) * 100) / 100);
    } else {
      if (i === termMonths) {
        p = principal;
        interest = Math.round((principal * (monthlyRatePercent / 100)) * 100) / 100;
        endBalance = 0;
      } else {
        p = 0;
        interest = Math.round((principal * (monthlyRatePercent / 100)) * 100) / 100;
        endBalance = principal;
      }
    }

    const totalDue = Math.round((p + interest) * 100) / 100;

    schedule.push({
      installmentNumber: i,
      dueDate: dueDateStr,
      beginningBalance: currentBalance,
      principal: p,
      interest: interest,
      totalDue: totalDue,
      endingBalance: endBalance,
      status: 'PENDING'
    });

    currentBalance = endBalance;
  }

  return schedule;
}

// Schedules for initial loans
const internalSchedule = generateAmortizationSchedule(1500, 1.2, 5, '2026-07-10', 'DECLINING');
internalSchedule[0].status = 'PAID';
internalSchedule[0].paidDate = '2026-08-10';
internalSchedule[0].receiptNumber = 'LN-PAY-001';
internalSchedule[1].status = 'PAID';
internalSchedule[1].paidDate = '2026-09-10';
internalSchedule[1].receiptNumber = 'LN-PAY-002';
internalSchedule[2].status = 'PAID';
internalSchedule[2].paidDate = '2026-10-10';
internalSchedule[2].receiptNumber = 'LN-PAY-003';

const externalSchedule1 = generateAmortizationSchedule(2400, 2.5, 6, '2026-06-28', 'FLAT');
externalSchedule1[0].status = 'PAID';
externalSchedule1[0].paidDate = '2026-07-28';
externalSchedule1[0].receiptNumber = 'LN-PAY-101';
externalSchedule1[1].status = 'PAID';
externalSchedule1[1].paidDate = '2026-08-28';
externalSchedule1[1].receiptNumber = 'LN-PAY-102';
externalSchedule1[2].status = 'PAID';
externalSchedule1[2].paidDate = '2026-09-28';
externalSchedule1[2].receiptNumber = 'LN-PAY-103';

const externalSchedule2 = generateAmortizationSchedule(3000, 2.5, 6, '2026-05-15', 'INTEREST_ONLY');
externalSchedule2[0].status = 'PAID';
externalSchedule2[0].paidDate = '2026-06-15';
externalSchedule2[1].status = 'PAID';
externalSchedule2[1].paidDate = '2026-07-15';
externalSchedule2[2].status = 'PAID';
externalSchedule2[2].paidDate = '2026-08-15';
externalSchedule2[3].status = 'PAID';
externalSchedule2[3].paidDate = '2026-09-15';
externalSchedule2[4].status = 'OVERDUE';

export const INITIAL_LOANS: Loan[] = [
  {
    id: 'b2000000-0000-4000-8000-000000000001',
    loanCode: 'LN-MEM-2026-001',
    borrowerType: 'MEMBER',
    borrowerId: 'a1000000-0000-4000-8000-000000000003', // Kim Sreynich
    borrowerName: 'គឹម ស្រីនិច',
    borrowerPhone: '087 665 432',
    borrowerIdCard: '030495867',
    borrowerAddress: 'សង្កាត់ទឹកល្អក់២ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    occupation: 'អាជីវករលក់គ្រឿងទេស',
    principalAmount: 1500,
    monthlyInterestRate: 1.2,
    interestMethod: 'DECLINING',
    termMonths: 5,
    startDate: '2026-07-10',
    endDate: '2026-12-10',
    purpose: 'ពង្រីកដើមទុនហាងលក់គ្រឿងទេសខ្នាតតូច',
    guarantorName: 'សុខ ចិន្តា (ប្រធានក្លឹប)',
    guarantorPhone: '012 889 901',
    collateralDescription: 'ធានាដោយទឹកប្រាក់សន្សំក្នុងក្លឹប ($2,800)',
    status: 'ACTIVE',
    totalInterest: 54,
    totalPayable: 1554,
    totalPaidPrincipal: 900,
    totalPaidInterest: 43.2,
    remainingBalance: 600,
    schedule: internalSchedule,
    approvedBy: 'គណៈកម្មការក្លឹប (សុខ ចិន្តា / ចាន់ វិសាល)',
    contractNumber: 'CTR-2026-07-001',
    createdAt: '2026-07-08'
  },
  {
    id: 'b2000000-0000-4000-8000-000000000002',
    loanCode: 'LN-EXT-2026-002',
    borrowerType: 'EXTERNAL',
    borrowerName: 'អ៊ុក សារ៉ាត់',
    borrowerPhone: '097 554 433',
    borrowerIdCard: '098123456',
    borrowerAddress: 'ភូមិព្រែកតាគង់ សង្កាត់ចាក់អង្រែលើ ខណ្ឌមានជ័យ រាជធានីភ្នំពេញ',
    occupation: 'ម្ចាស់ហាងជួសជុលម៉ូតូ',
    principalAmount: 2400,
    monthlyInterestRate: 2.5,
    interestMethod: 'FLAT',
    termMonths: 6,
    startDate: '2026-06-28',
    endDate: '2026-12-28',
    purpose: 'ទិញសម្ភារ និងគ្រឿងបន្លាស់ម៉ូតូសម្រាប់ស្តុកលក់',
    guarantorName: 'ចាន់ វិសាល',
    guarantorPhone: '098 776 543',
    collateralDescription: 'កាតគ្រីម៉ូតូ Honda Dream 2024 និងសំបុត្រកំណើតច្បាប់ដើម',
    status: 'ACTIVE',
    totalInterest: 360,
    totalPayable: 2760,
    totalPaidPrincipal: 1200,
    totalPaidInterest: 180,
    remainingBalance: 1200,
    schedule: externalSchedule1,
    approvedBy: 'សុខ ចិន្តា (ប្រធានក្លឹប)',
    contractNumber: 'CTR-EXT-2026-06-002',
    createdAt: '2026-06-25'
  },
  {
    id: 'b2000000-0000-4000-8000-000000000003',
    loanCode: 'LN-EXT-2026-003',
    borrowerType: 'EXTERNAL',
    borrowerName: 'ប៉ែន ធីតា',
    borrowerPhone: '015 889 120',
    borrowerIdCard: '019283746',
    borrowerAddress: 'សង្កាត់ទួលសង្កែ១ ខណ្ឌឫស្សីកែវ រាជធានីភ្នំពេញ',
    occupation: 'អាជីវករលក់សម្លៀកបំពាក់អនឡាញ',
    principalAmount: 3000,
    monthlyInterestRate: 2.5,
    interestMethod: 'INTEREST_ONLY',
    termMonths: 6,
    startDate: '2026-05-15',
    endDate: '2026-11-15',
    purpose: 'ទិញសម្លៀកបំពាក់នាំចូលសម្រាប់រដូវបុណ្យភ្ជុំបិណ្ឌ',
    guarantorName: 'លឹម គឹមហុង',
    guarantorPhone: '070 445 667',
    collateralDescription: 'ប្លង់ដីទន់ភូមិព្រែកឯង និងប័ណ្ណបើកបររថយន្ត',
    status: 'OVERDUE',
    totalInterest: 450,
    totalPayable: 3450,
    totalPaidPrincipal: 0,
    totalPaidInterest: 300,
    remainingBalance: 3000,
    schedule: externalSchedule2,
    approvedBy: 'សុខ ចិន្តា (ប្រធានក្លឹប)',
    contractNumber: 'CTR-EXT-2026-05-003',
    createdAt: '2026-05-12'
  }
];

export const INITIAL_APPLICATIONS: LoanApplication[] = [
  {
    id: 'c3000000-0000-4000-8000-000000000001',
    applicantType: 'MEMBER',
    memberId: 'a1000000-0000-4000-8000-000000000005', // Lim Kimhong
    applicantName: 'លឹម គឹមហុង',
    applicantPhone: '070 445 667',
    applicantIdCard: '050697889',
    applicantAddress: 'សង្កាត់បឹងត្របែក ខណ្ឌចំការមន រាជធានីភ្នំពេញ',
    occupation: 'បុគ្គលិកក្រុមហ៊ុនឯកជន',
    requestedAmount: 1200,
    proposedInterestRate: 1.2,
    interestMethod: 'DECLINING',
    proposedTermMonths: 4,
    purpose: 'ជួសជុលដំបូលផ្ទះ និងបង់ថ្លៃសិក្សាកូន',
    collateralDescription: 'ប្រើប្រាស់ប្រាក់សន្សំក្នុងក្លឹប ($2,700) ជាការធានា',
    guarantorName: 'ហេង សុភ័ក្ត្រ',
    guarantorPhone: '092 334 556',
    guarantorRelationship: 'សមាជិកក្លឹប',
    appliedDate: '2026-10-24',
    status: 'PENDING',
    notes: 'សមាជិកមានប្រវត្តិសន្សំល្អទៀងទាត់'
  },
  {
    id: 'c3000000-0000-4000-8000-000000000002',
    applicantType: 'EXTERNAL',
    applicantName: 'សេង ពិសិដ្ឋ',
    applicantPhone: '011 223 344',
    applicantIdCard: '028374950',
    applicantAddress: 'សង្កាត់បឹងសាឡាង ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    occupation: 'ម្ចាស់ហាងកាហ្វេ',
    requestedAmount: 2000,
    proposedInterestRate: 2.5,
    interestMethod: 'INTEREST_ONLY',
    proposedTermMonths: 6,
    purpose: 'ទិញម៉ាស៊ីនឆុងកាហ្វេម៉ាកថ្មីបន្ថែម',
    collateralDescription: 'កាតគ្រីម៉ូតូ Scoopy 2023 និងកិច្ចសន្យាជួលទីតាំងហាង',
    guarantorName: 'សុខ ចិន្តា',
    guarantorPhone: '012 889 901',
    guarantorRelationship: 'អ្នកស្គាល់គ្នា',
    appliedDate: '2026-10-25',
    status: 'PENDING',
    notes: 'ស្នើសុំអត្រាការប្រាក់ ២.៥% បង់តែការប្រាក់ប្រចាំខែ និងបង់ដើមចុងគ្រា'
  }
];
