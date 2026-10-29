import { Member, Loan, MonthlySavingRecord } from '../types';

/**
 * Utility to generate and download a UTF-8 BOM CSV file so Khmer characters 
 * render properly in Excel, Google Sheets, and LibreOffice.
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map(row => row.map(escapeCell).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Member List to CSV
 */
export function exportMembersToCSV(members: Member[], totalClubSavings: number) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `The_Best_Club_Members_${dateStr}.csv`;

  const headers = [
    'លេខកូដសមាជិក (Member Code)',
    'ឈ្មោះជាភាសាខ្មែរ (Khmer Name)',
    'ឈ្មោះជាអក្សរឡាតាំង (English Name)',
    'លេខទូរស័ព្ទ (Phone)',
    'តួនាទីក្នុងក្លឹប (Role)',
    'កាលបរិច្ឆេទចូលរួម (Join Date)',
    'លេខអត្តសញ្ញាណប័ណ្ណ (ID Card)',
    'មុខរបរ/អាជីវកម្ម (Occupation)',
    'ប្រាក់សន្សំសរុប USD (Total Savings)',
    'ភាគរយចំណែក (Share %)',
    'ភាគលាភទទួលបាន USD (Dividends Earned)',
    'កម្ចីកំពុងជំពាក់ USD (Active Loan)',
    'កាតព្វកិច្ចសន្សំ USD/ខែ (Monthly Commitment)',
    'អ៊ីមែល (Email)',
    'អាសយដ្ឋាន (Address)',
    'ស្ថានភាព (Status)'
  ];

  const rows = members.map(m => {
    const share = totalClubSavings > 0 
      ? ((m.totalSavings / totalClubSavings) * 100).toFixed(1) 
      : '0';

    return [
      m.memberCode,
      m.nameKhmer,
      m.nameEnglish || '',
      m.phone,
      m.role,
      m.joinDate,
      m.idCardNumber,
      m.occupation || '',
      m.totalSavings,
      `${share}%`,
      m.totalDividendsEarned,
      m.activeLoanAmount || 0,
      m.monthlyCommitment,
      m.email || '',
      m.address || '',
      m.status === 'ACTIVE' ? 'សកម្ម' : 'អសកម្ម'
    ];
  });

  downloadCSV(filename, headers, rows);
}

/**
 * Export Loan Records to CSV
 */
export function exportLoansToCSV(loans: Loan[], members: Member[]) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `The_Best_Club_Loans_${dateStr}.csv`;

  const headers = [
    'លេខកូដកម្ចី (Loan Code)',
    'ប្រភេទអ្នកខ្ចី (Borrower Type)',
    'ឈ្មោះអ្នកខ្ចី (Borrower Name)',
    'លេខទូរស័ព្ទ (Phone)',
    'ប្រាក់ដើមខ្ចី USD (Principal Amount)',
    'អត្រាការប្រាក់/ខែ (%) (Interest Rate)',
    'វិធីគណនាការប្រាក់ (Interest Method)',
    'រយៈពេល (ខែ) (Term Months)',
    'ថ្ងៃចាប់ផ្តើម (Start Date)',
    'ថ្ងៃផុតកំណត់ (End Date)',
    'ប្រាក់ដើមសងរួច USD (Paid Principal)',
    'ការប្រាក់សងរួច USD (Paid Interest)',
    'ប្រាក់ដើមនៅខ្វះ USD (Remaining Balance)',
    'ស្ថានភាពកម្ចី (Status)',
    'គោលបំណងកម្ចី (Purpose)'
  ];

  const rows = loans.map(l => {
    let borrowerName = l.borrowerName;
    let phone = l.borrowerPhone;

    if (l.borrowerType === 'MEMBER' && l.borrowerId) {
      const member = members.find(m => m.id === l.borrowerId);
      if (member) {
        borrowerName = member.nameKhmer;
        phone = member.phone;
      }
    }

    const methodLabel = l.interestMethod === 'FLAT' 
      ? 'ការប្រាក់ថេរ (Flat Fixed Rate)' 
      : l.interestMethod === 'DECLINING' 
      ? 'ការប្រាក់ថយចុះ (Declining Balance)' 
      : 'បង់តែការប្រាក់ប្រចាំខែ (Interest-Only)';

    const statusLabel = l.status === 'ACTIVE' 
      ? 'កំពុងបង់' 
      : l.status === 'COMPLETED' 
      ? 'បានបង់ផ្តាច់' 
      : l.status === 'OVERDUE' 
      ? 'ហួសកំណត់' 
      : l.status === 'PENDING'
      ? 'រង់ចាំអនុម័ត'
      : 'បដិសេធ';

    return [
      l.loanCode,
      l.borrowerType === 'MEMBER' ? 'សមាជិកក្នុងសមាគម' : 'អ្នកក្រៅសមាគម',
      borrowerName,
      phone,
      l.principalAmount,
      `${l.monthlyInterestRate}%`,
      methodLabel,
      l.termMonths,
      l.startDate,
      l.endDate,
      l.totalPaidPrincipal,
      l.totalPaidInterest,
      l.remainingBalance,
      statusLabel,
      l.purpose
    ];
  });

  downloadCSV(filename, headers, rows);
}

/**
 * Export Savings Records to CSV
 */
export function exportSavingsToCSV(savingsRecords: MonthlySavingRecord[], members: Member[]) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `The_Best_Club_Savings_Ledger_${dateStr}.csv`;

  const headers = [
    'លេខកូដសមាជិក (Member Code)',
    'ឈ្មោះសមាជិក (Member Name)',
    'ឆ្នាំ (Year)',
    'ខែ (Month)',
    'កាលបរិច្ឆេទបង់ (Payment Date)',
    'ចំនួនទឹកប្រាក់ USD (Amount)',
    'មធ្យោបាយបង់ (Payment Method)',
    'លេខកូដប្រប្រតិបត្តិការ/វិក្កយបត្រ (Ref No)',
    'អ្នកកត់ត្រា (Recorded By)',
    'ចំណាំ (Notes)'
  ];

  const rows = savingsRecords.map(r => {
    const member = members.find(m => m.id === r.memberId);
    return [
      member ? member.memberCode : '',
      member ? member.nameKhmer : r.memberName,
      r.year,
      r.month,
      r.paymentDate,
      r.amount,
      r.paymentMethod,
      r.referenceNumber || '',
      r.recordedBy,
      r.notes || ''
    ];
  });

  downloadCSV(filename, headers, rows);
}
