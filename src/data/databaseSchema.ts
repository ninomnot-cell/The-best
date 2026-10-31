export interface SchemaColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary?: boolean;
  isForeign?: boolean;
  references?: string;
  descriptionKhmer: string;
  descriptionEnglish: string;
}

export interface SchemaTable {
  tableName: string;
  tableNameKhmer: string;
  descriptionKhmer: string;
  columns: SchemaColumn[];
  indexes: string[];
}

export const DATABASE_SCHEMA_TABLES: SchemaTable[] = [
  {
    tableName: 'members',
    tableNameKhmer: 'តារាងសមាជិកក្លឹប (Members)',
    descriptionKhmer: 'ផ្ទុកព័ត៌មានលម្អិតរបស់សមាជិកទាំង ៨ នាក់ រួមទាំងប្រាក់សន្សំសរុប និងប្រាក់កម្ចីសកម្ម',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, descriptionKhmer: 'អត្តសញ្ញាណកូដសម្គាល់សមាជិក (Primary Key)', descriptionEnglish: 'Unique member ID' },
      { name: 'member_code', type: 'VARCHAR(20)', nullable: false, descriptionKhmer: 'លេខកូដសមាជិក (ឧ. TB-001) Unique', descriptionEnglish: 'Unique member code' },
      { name: 'name_khmer', type: 'VARCHAR(100)', nullable: false, descriptionKhmer: 'ឈ្មោះសមាជិកជាភាសាខ្មែរ', descriptionEnglish: 'Khmer full name' },
      { name: 'name_english', type: 'VARCHAR(100)', nullable: true, descriptionKhmer: 'ឈ្មោះសមាជិកជាអក្សរឡាតាំង', descriptionEnglish: 'English full name' },
      { name: 'phone', type: 'VARCHAR(25)', nullable: false, descriptionKhmer: 'លេខទូរស័ព្ទទំនាក់ទំនង (012 xxx xxx)', descriptionEnglish: 'Phone number for contact/SMS' },
      { name: 'id_card_number', type: 'VARCHAR(30)', nullable: false, descriptionKhmer: 'លេខអត្តសញ្ញាណប័ណ្ណសញ្ជាតិខ្មែរ', descriptionEnglish: 'National ID card number' },
      { name: 'join_date', type: 'DATE', nullable: false, descriptionKhmer: 'កាលបរិច្ឆេទចូលរួមជាសមាជិក', descriptionEnglish: 'Date joined the club' },
      { name: 'role', type: 'VARCHAR(50)', nullable: false, descriptionKhmer: 'តួនាទី (ប្រធានក្លឹប, អនុប្រធាន, បេឡា, គណនេយ្យករ, សមាជិក)', descriptionEnglish: 'Role in club' },
      { name: 'monthly_commitment', type: 'DECIMAL(12,2)', nullable: false, descriptionKhmer: 'កាតព្វកិច្ចសន្សំប្រចាំខែ ($)', descriptionEnglish: 'Monthly savings target ($)' },
      { name: 'total_savings', type: 'DECIMAL(14,2)', nullable: false, descriptionKhmer: 'ទឹកប្រាក់សន្សំសរុបដែលបានបង់ចូល', descriptionEnglish: 'Accumulated total savings' },
      { name: 'address', type: 'TEXT', nullable: true, descriptionKhmer: 'អាសយដ្ឋានបច្ចុប្បន្ន', descriptionEnglish: 'Current residential address' },
      { name: 'occupation', type: 'VARCHAR(100)', nullable: true, descriptionKhmer: 'មុខរបរ/អាជីវកម្ម', descriptionEnglish: 'Occupation/Business' },
      { name: 'email', type: 'VARCHAR(100)', nullable: true, descriptionKhmer: 'អ៊ីមែលទំនាក់ទំនង (Unique)', descriptionEnglish: 'Email address' },
      { name: 'pin', type: 'VARCHAR(20)', nullable: true, descriptionKhmer: 'លេខកូដសម្ងាត់ (PIN)', descriptionEnglish: 'Login PIN code' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, descriptionKhmer: 'ស្ថានភាពសមាជិក (ACTIVE/INACTIVE)', descriptionEnglish: 'Active or inactive status' },
      { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, descriptionKhmer: 'កាលបរិច្ឆេទបង្កើតទិន្នន័យ', descriptionEnglish: 'Record creation timestamp' },
    ],
    indexes: ['CREATE UNIQUE INDEX idx_members_code ON members(member_code);', 'CREATE INDEX idx_members_phone ON members(phone);', 'CREATE UNIQUE INDEX idx_members_email ON members(email);']
  },
  {
    tableName: 'monthly_savings',
    tableNameKhmer: 'តារាងកំណត់ត្រាប្រាក់សន្សំប្រចាំខែ (Monthly Savings)',
    descriptionKhmer: 'កត់ត្រារាល់ការបង់ប្រាក់សន្សំប្រចាំខែនីមួយៗរបស់សមាជិកម្នាក់ៗ',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, descriptionKhmer: 'លេខសម្គាល់ប្រតិបត្តិការសន្សំ', descriptionEnglish: 'Primary key' },
      { name: 'member_id', type: 'UUID', nullable: false, isForeign: true, references: 'members(id)', descriptionKhmer: 'ភ្ជាប់ទៅកាន់សមាជិកណា (Foreign Key)', descriptionEnglish: 'Reference to member' },
      { name: 'year', type: 'INTEGER', nullable: false, descriptionKhmer: 'ឆ្នាំដែលបានសន្សំ (ឧ. 2026)', descriptionEnglish: 'Savings year' },
      { name: 'month', type: 'INTEGER', nullable: false, descriptionKhmer: 'ខែដែលបានសន្សំ (1 ដល់ 12)', descriptionEnglish: 'Savings month (1-12)' },
      { name: 'amount', type: 'DECIMAL(12,2)', nullable: false, descriptionKhmer: 'ចំនួនទឹកប្រាក់សន្សំជាក់ស្តែង ($)', descriptionEnglish: 'Saved amount ($)' },
      { name: 'payment_date', type: 'DATE', nullable: false, descriptionKhmer: 'កាលបរិច្ឆេទផ្ទេរប្រាក់ជាក់ស្តែង', descriptionEnglish: 'Actual deposit date' },
      { name: 'payment_method', type: 'VARCHAR(30)', nullable: false, descriptionKhmer: 'វិធីសាស្ត្របង់ (ABA, Wing, Cash, Acleda)', descriptionEnglish: 'Payment method' },
      { name: 'reference_number', type: 'VARCHAR(100)', nullable: false, descriptionKhmer: 'លេខវិក្កយបត្រ ឬលេខប្រតិបត្តិការធនាគារ', descriptionEnglish: 'Bank transaction reference ID' },
      { name: 'recorded_by', type: 'VARCHAR(100)', nullable: false, descriptionKhmer: 'ឈ្មោះអ្នកទទួល/អ្នកកត់ត្រា', descriptionEnglish: 'Officer who confirmed' },
      { name: 'notes', type: 'TEXT', nullable: true, descriptionKhmer: 'កំណត់សម្គាល់បន្ថែម', descriptionEnglish: 'Remarks' },
    ],
    indexes: ['CREATE UNIQUE INDEX idx_member_month_year ON monthly_savings(member_id, year, month);', 'CREATE INDEX idx_savings_date ON monthly_savings(payment_date);']
  },
  {
    tableName: 'loans',
    tableNameKhmer: 'តារាងកម្ចីប្រាក់ (Loans)',
    descriptionKhmer: 'គ្រប់គ្រងកម្ចីទាំងអស់ ដោយបែងចែករវាងកម្ចីសមាជិកក្នុង និងកម្ចីអ្នកក្រៅសមាគម',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, descriptionKhmer: 'លេខសម្គាល់កម្ចី (Primary Key)', descriptionEnglish: 'Loan ID' },
      { name: 'loan_code', type: 'VARCHAR(30)', nullable: false, descriptionKhmer: 'លេខកូដកម្ចី (ឧ. LN-2026-001)', descriptionEnglish: 'Unique loan contract code' },
      { name: 'borrower_type', type: 'VARCHAR(20)', nullable: false, descriptionKhmer: 'ប្រភេទអ្នកខ្ចី: MEMBER (សមាជិក) ឬ EXTERNAL (អ្នកក្រៅ)', descriptionEnglish: 'Borrower category' },
      { name: 'borrower_id', type: 'UUID', nullable: true, isForeign: true, references: 'members(id)', descriptionKhmer: 'ភ្ជាប់ទៅ ID សមាជិក (បើជាសមាជិកក្នុង)', descriptionEnglish: 'Member ID if internal borrower' },
      { name: 'borrower_name', type: 'VARCHAR(100)', nullable: false, descriptionKhmer: 'ឈ្មោះអ្នកខ្ចីប្រាក់', descriptionEnglish: 'Borrower full name' },
      { name: 'borrower_phone', type: 'VARCHAR(25)', nullable: false, descriptionKhmer: 'លេខទូរស័ព្ទអ្នកខ្ចី (សម្រាប់ SMS រំលឹក)', descriptionEnglish: 'Borrower phone number' },
      { name: 'borrower_id_card', type: 'VARCHAR(30)', nullable: false, descriptionKhmer: 'លេខអត្តសញ្ញាណប័ណ្ណអ្នកខ្ចី', descriptionEnglish: 'Borrower national ID' },
      { name: 'borrower_address', type: 'TEXT', nullable: false, descriptionKhmer: 'អាសយដ្ឋានអ្នកខ្ចី', descriptionEnglish: 'Borrower address' },
      { name: 'principal_amount', type: 'DECIMAL(14,2)', nullable: false, descriptionKhmer: 'ចំនួនប្រាក់ដើមដែលបានខ្ចី ($)', descriptionEnglish: 'Loan principal amount' },
      { name: 'monthly_interest_rate', type: 'DECIMAL(5,2)', nullable: false, descriptionKhmer: 'អត្រាការប្រាក់ប្រចាំខែ (អាចវាយបញ្ចូលដោយសេរី %)', descriptionEnglish: 'Customizable monthly interest rate percentage' },
      { name: 'interest_method', type: 'VARCHAR(30)', nullable: false, descriptionKhmer: 'វិធីសាស្ត្រគណនា: FLAT (ការប្រាក់ថេរ), DECLINING (ការប្រាក់ថយចុះ), INTEREST_ONLY (បង់តែការប្រាក់ប្រចាំខែ និងដើមចុងគ្រា)', descriptionEnglish: 'Method: FLAT, DECLINING, or INTEREST_ONLY' },
      { name: 'term_months', type: 'INTEGER', nullable: false, descriptionKhmer: 'រយៈពេលខ្ចីគិតជាខែ', descriptionEnglish: 'Repayment period in months' },
      { name: 'start_date', type: 'DATE', nullable: false, descriptionKhmer: 'កាលបរិច្ឆេទបញ្ចេញប្រាក់កម្ចី', descriptionEnglish: 'Loan disbursement date' },
      { name: 'end_date', type: 'DATE', nullable: false, descriptionKhmer: 'កាលបរិច្ឆេទផុតកំណត់សងបង្ហើយ', descriptionEnglish: 'Maturity / payoff date' },
      { name: 'purpose', type: 'TEXT', nullable: false, descriptionKhmer: 'គោលបំណងនៃការខ្ចីប្រាក់', descriptionEnglish: 'Loan purpose' },
      { name: 'guarantor_name', type: 'VARCHAR(100)', nullable: true, descriptionKhmer: 'ឈ្មោះអ្នកធានា (បើមាន)', descriptionEnglish: 'Guarantor name' },
      { name: 'guarantor_phone', type: 'VARCHAR(25)', nullable: true, descriptionKhmer: 'លេខទូរស័ព្ទអ្នកធានា', descriptionEnglish: 'Guarantor phone' },
      { name: 'collateral_description', type: 'TEXT', nullable: true, descriptionKhmer: 'ព័ត៌មានទ្រព្យធានាបញ្ចាំ (ប្លង់ដី, កាតគ្រីម៉ូតូ...)', descriptionEnglish: 'Collateral pledged' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, descriptionKhmer: 'ស្ថានភាព: ACTIVE, COMPLETED, OVERDUE', descriptionEnglish: 'Loan operational status' },
      { name: 'contract_number', type: 'VARCHAR(50)', nullable: false, descriptionKhmer: 'លេខកិច្ចសន្យាផ្លូវការ', descriptionEnglish: 'Formal contract serial' },
    ],
    indexes: ['CREATE INDEX idx_loans_borrower_type ON loans(borrower_type);', 'CREATE INDEX idx_loans_status ON loans(status);']
  },
  {
    tableName: 'loan_repayment_schedules',
    tableNameKhmer: 'តារាងកាលវិភាគសងប្រាក់កម្ចី (Amortization Schedule)',
    descriptionKhmer: 'បំបែកកាលវិភាគសងតាមខែនីមួយៗ រួមមានប្រាក់ដើម ការប្រាក់ និងកាលបរិច្ឆេទផុតកំណត់',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, descriptionKhmer: 'លេខសម្គាល់ជួរតារាងសង', descriptionEnglish: 'Schedule row ID' },
      { name: 'loan_id', type: 'UUID', nullable: false, isForeign: true, references: 'loans(id)', descriptionKhmer: 'ភ្ជាប់ទៅកម្ចីណា (Foreign Key)', descriptionEnglish: 'Reference to loan' },
      { name: 'installment_number', type: 'INTEGER', nullable: false, descriptionKhmer: 'លើកទីនៃការបង់ (១, ២, ៣...)', descriptionEnglish: 'Installment index' },
      { name: 'due_date', type: 'DATE', nullable: false, descriptionKhmer: 'កាលបរិច្ឆេទត្រូវបង់សងប្រចាំខែ', descriptionEnglish: 'Scheduled due date' },
      { name: 'beginning_balance', type: 'DECIMAL(14,2)', nullable: false, descriptionKhmer: 'សមតុល្យប្រាក់ដើមដើមគ្រា', descriptionEnglish: 'Opening balance' },
      { name: 'principal_amount', type: 'DECIMAL(14,2)', nullable: false, descriptionKhmer: 'ប្រាក់ដើមត្រូវបង់ក្នុងខែនេះ', descriptionEnglish: 'Principal due' },
      { name: 'interest_amount', type: 'DECIMAL(14,2)', nullable: false, descriptionKhmer: 'ការប្រាក់ត្រូវបង់ក្នុងខែនេះ', descriptionEnglish: 'Interest due' },
      { name: 'total_due', type: 'DECIMAL(14,2)', nullable: false, descriptionKhmer: 'សរុបប្រាក់ត្រូវបង់ (ដើម + ការប្រាក់)', descriptionEnglish: 'Total installment due' },
      { name: 'ending_balance', type: 'DECIMAL(14,2)', nullable: false, descriptionKhmer: 'សមតុល្យប្រាក់ដើមចុងគ្រា', descriptionEnglish: 'Closing balance' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, descriptionKhmer: 'ស្ថានភាព (PENDING, PAID, OVERDUE)', descriptionEnglish: 'Payment status' },
      { name: 'paid_date', type: 'DATE', nullable: true, descriptionKhmer: 'កាលបរិច្ឆេទជាក់ស្តែងដែលបានបង់', descriptionEnglish: 'Actual date paid' },
      { name: 'receipt_number', type: 'VARCHAR(100)', nullable: true, descriptionKhmer: 'លេខវិក្កយបត្រទទួលប្រាក់', descriptionEnglish: 'Payment receipt reference' },
    ],
    indexes: ['CREATE INDEX idx_schedule_loan_id ON loan_repayment_schedules(loan_id);', 'CREATE INDEX idx_schedule_due_date ON loan_repayment_schedules(due_date, status);']
  },
  {
    tableName: 'loan_payments',
    tableNameKhmer: 'តារាងប្រវត្តិការបង់ប្រាក់កម្ចី (Loan Payment Records)',
    descriptionKhmer: 'កត់ត្រារាល់ប្រតិបត្តិការសងប្រាក់ដើម ការប្រាក់ ថ្លៃពិន័យយឺតយ៉ាវ និងលេខវិក្កយបត្រ',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, descriptionKhmer: 'លេខសម្គាល់ប្រតិបត្តិការបង់ប្រាក់', descriptionEnglish: 'Payment ID' },
      { name: 'loan_id', type: 'UUID', nullable: false, isForeign: true, references: 'loans(id)', descriptionKhmer: 'ភ្ជាប់ទៅកម្ចីណា', descriptionEnglish: 'Reference to loan' },
      { name: 'schedule_id', type: 'UUID', nullable: true, isForeign: true, references: 'loan_repayment_schedules(id)', descriptionKhmer: 'ភ្ជាប់ទៅកាលវិភាគបង់', descriptionEnglish: 'Reference to schedule row' },
      { name: 'installment_number', type: 'INTEGER', nullable: true, descriptionKhmer: 'លើកទីនៃការបង់', descriptionEnglish: 'Installment index' },
      { name: 'payment_date', type: 'DATE', nullable: false, descriptionKhmer: 'កាលបរិច្ឆេទបង់ប្រាក់', descriptionEnglish: 'Payment date' },
      { name: 'amount_paid', type: 'DECIMAL(14,2)', nullable: false, descriptionKhmer: 'ចំនួនប្រាក់បង់សរុប ($)', descriptionEnglish: 'Total amount paid' },
      { name: 'principal_paid', type: 'DECIMAL(14,2)', nullable: false, descriptionKhmer: 'ប្រាក់ដើមដែលបានបង់ ($)', descriptionEnglish: 'Principal portion paid' },
      { name: 'interest_paid', type: 'DECIMAL(14,2)', nullable: false, descriptionKhmer: 'ការប្រាក់ដែលបានបង់ ($)', descriptionEnglish: 'Interest portion paid' },
      { name: 'late_fee', type: 'DECIMAL(12,2)', nullable: false, descriptionKhmer: 'ថ្លៃពិន័យបង់យឺត ($)', descriptionEnglish: 'Late penalty fee' },
      { name: 'payment_method', type: 'VARCHAR(30)', nullable: false, descriptionKhmer: 'វិធីសាស្ត្របង់ (CASH, ABA_PAY, WING, OTHER)', descriptionEnglish: 'Method of payment' },
      { name: 'receipt_number', type: 'VARCHAR(100)', nullable: false, descriptionKhmer: 'លេខវិក្កយបត្រ (Unique RC-YYYYMMDD-001)', descriptionEnglish: 'Unique receipt serial' },
      { name: 'recorded_by', type: 'VARCHAR(150)', nullable: false, descriptionKhmer: 'ឈ្មោះ/អ៊ីមែលអ្នកកត់ត្រា', descriptionEnglish: 'Logged-in user email' },
      { name: 'notes', type: 'TEXT', nullable: true, descriptionKhmer: 'កំណត់សម្គាល់បន្ថែម', descriptionEnglish: 'Remarks' },
    ],
    indexes: ['CREATE UNIQUE INDEX idx_payments_receipt ON loan_payments(receipt_number);', 'CREATE INDEX idx_payments_loan ON loan_payments(loan_id);']
  },
  {
    tableName: 'loan_applications',
    tableNameKhmer: 'តារាងពាក្យស្នើសុំកម្ចី (Loan Applications)',
    descriptionKhmer: 'ផ្ទុកពាក្យស្នើសុំកម្ចីថ្មីពីសមាជិក ឬអ្នកក្រៅ មុនពេលគណៈកម្មការក្លឹបអនុម័ត',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, descriptionKhmer: 'លេខសម្គាល់ពាក្យស្នើសុំ', descriptionEnglish: 'Application ID' },
      { name: 'applicant_type', type: 'VARCHAR(20)', nullable: false, descriptionKhmer: 'MEMBER ឬ EXTERNAL', descriptionEnglish: 'Applicant type' },
      { name: 'applicant_name', type: 'VARCHAR(100)', nullable: false, descriptionKhmer: 'ឈ្មោះអ្នកស្នើសុំ', descriptionEnglish: 'Applicant name' },
      { name: 'applicant_phone', type: 'VARCHAR(25)', nullable: false, descriptionKhmer: 'លេខទូរស័ព្ទ', descriptionEnglish: 'Applicant phone' },
      { name: 'requested_amount', type: 'DECIMAL(14,2)', nullable: false, descriptionKhmer: 'ចំនួនទឹកប្រាក់ស្នើសុំ ($)', descriptionEnglish: 'Requested amount ($)' },
      { name: 'proposed_term_months', type: 'INTEGER', nullable: false, descriptionKhmer: 'រយៈពេលស្នើសុំ (ខែ)', descriptionEnglish: 'Proposed term in months' },
      { name: 'purpose', type: 'TEXT', nullable: false, descriptionKhmer: 'គោលបំណងនៃការប្រើប្រាស់ប្រាក់', descriptionEnglish: 'Reason for loan' },
      { name: 'collateral_description', type: 'TEXT', nullable: true, descriptionKhmer: 'ឯកសារទ្រព្យធានា', descriptionEnglish: 'Collateral info' },
      { name: 'guarantor_name', type: 'VARCHAR(100)', nullable: true, descriptionKhmer: 'ឈ្មោះអ្នកធានា', descriptionEnglish: 'Guarantor name' },
      { name: 'guarantor_phone', type: 'VARCHAR(25)', nullable: true, descriptionKhmer: 'លេខទូរស័ព្ទអ្នកធានា', descriptionEnglish: 'Guarantor phone' },
      { name: 'status', type: 'VARCHAR(20)', nullable: false, descriptionKhmer: 'ស្ថានភាព: PENDING, APPROVED, REJECTED', descriptionEnglish: 'Application review status' },
      { name: 'applied_date', type: 'DATE', nullable: false, descriptionKhmer: 'កាលបរិច្ឆេទដាក់ពាក្យ', descriptionEnglish: 'Application submission date' },
    ],
    indexes: ['CREATE INDEX idx_applications_status ON loan_applications(status);']
  },
  {
    tableName: 'audit_log',
    tableNameKhmer: 'តារាងប្រវត្តិសកម្មភាពកែប្រែនិងលុប (Audit Log)',
    descriptionKhmer: 'កត់ត្រារាល់ប្រតិបត្តិការ Edit/Delete/Void លើទិន្នន័យទាំងអស់សម្រាប់សុវត្ថិភាព',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimary: true, descriptionKhmer: 'លេខសម្គាល់ audit log', descriptionEnglish: 'Log ID' },
      { name: 'table_name', type: 'VARCHAR(50)', nullable: false, descriptionKhmer: 'ឈ្មោះតារាងដែលត្រូវបានផ្លាស់ប្តូរ', descriptionEnglish: 'Target table name' },
      { name: 'record_id', type: 'UUID', nullable: false, descriptionKhmer: 'ID នៃទិន្នន័យដែលបានផ្លាស់ប្តូរ', descriptionEnglish: 'Target record UUID' },
      { name: 'action', type: 'VARCHAR(20)', nullable: false, descriptionKhmer: 'សកម្មភាព: INSERT, UPDATE, DELETE, VOID', descriptionEnglish: 'Action performed' },
      { name: 'old_data', type: 'JSONB', nullable: true, descriptionKhmer: 'ទិន្នន័យចាស់មុនពេលផ្លាស់ប្តូរ', descriptionEnglish: 'Previous record snapshot' },
      { name: 'new_data', type: 'JSONB', nullable: true, descriptionKhmer: 'ទិន្នន័យថ្មីក្រោយពេលផ្លាស់ប្តូរ', descriptionEnglish: 'New record snapshot' },
      { name: 'changed_by', type: 'VARCHAR(150)', nullable: false, descriptionKhmer: 'ឈ្មោះ/អ៊ីមែលអ្នកធ្វើប្រតិបត្តិការ', descriptionEnglish: 'User email/name who made change' },
      { name: 'changed_at', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, descriptionKhmer: 'កាលបរិច្ឆេទនិងម៉ោងប្រតិបត្តិការ', descriptionEnglish: 'Change timestamp' },
    ],
    indexes: ['CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);']
  }
];

export const SQL_DDL_SCRIPT = `
-- ========================================================
-- DATABASE SCHEMA: THE BEST FAMILY CLUB MANAGEMENT SYSTEM
-- រចនាសម្ព័ន្ធមូលដ្ឋានទិន្នន័យសម្រាប់សមាគម ឌឹ បេស៍ ហ្វាមីលី ក្លឹប
-- Designed for: PostgreSQL / Supabase / Cloud SQL / MySQL
-- ========================================================

-- 1. Create Members Table (តារាងសមាជិក ៨ នាក់)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_code VARCHAR(20) UNIQUE NOT NULL,
    name_khmer VARCHAR(100) NOT NULL,
    name_english VARCHAR(100),
    phone VARCHAR(25) NOT NULL,
    id_card_number VARCHAR(30) NOT NULL,
    join_date DATE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'សមាជិក',
    monthly_commitment DECIMAL(12,2) NOT NULL DEFAULT 100.00,
    total_savings DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    address TEXT,
    occupation VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    pin VARCHAR(20) DEFAULT '1234',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Monthly Savings Table (តារាងប្រាក់សន្សំប្រចាំខែ)
CREATE TABLE IF NOT EXISTS monthly_savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    year INT NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'ABA_PAY',
    reference_number VARCHAR(100) NOT NULL,
    recorded_by VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_member_month_year UNIQUE (member_id, year, month)
);

-- 3. Create Loans Table (តារាងកម្ចី - សមាជិកក្នុង និងក្រៅសមាគម)
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_code VARCHAR(30) UNIQUE NOT NULL,
    borrower_type VARCHAR(20) NOT NULL CHECK (borrower_type IN ('MEMBER', 'EXTERNAL')),
    borrower_id UUID REFERENCES members(id) ON DELETE SET NULL,
    borrower_name VARCHAR(100) NOT NULL,
    borrower_phone VARCHAR(25) NOT NULL,
    borrower_id_card VARCHAR(30) NOT NULL,
    borrower_address TEXT NOT NULL,
    principal_amount DECIMAL(14,2) NOT NULL CHECK (principal_amount > 0),
    monthly_interest_rate DECIMAL(5,2) NOT NULL CHECK (monthly_interest_rate >= 0),
    interest_method VARCHAR(30) NOT NULL DEFAULT 'DECLINING' CHECK (interest_method IN ('FLAT', 'DECLINING', 'INTEREST_ONLY')),
    term_months INT NOT NULL CHECK (term_months > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    purpose TEXT NOT NULL,
    guarantor_name VARCHAR(100),
    guarantor_phone VARCHAR(25),
    collateral_description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'OVERDUE', 'REJECTED')),
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Repayment Schedules Table (តារាងបង់ប្រាក់កម្ចីប្រចាំខែ)
CREATE TABLE IF NOT EXISTS loan_repayment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    beginning_balance DECIMAL(14,2) NOT NULL,
    principal_amount DECIMAL(14,2) NOT NULL,
    interest_amount DECIMAL(14,2) NOT NULL,
    total_due DECIMAL(14,2) NOT NULL,
    ending_balance DECIMAL(14,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'PARTIAL')),
    paid_date DATE,
    receipt_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_loan_installment UNIQUE (loan_id, installment_number)
);

-- 5. Create Loan Payments Table (តារាងកំណត់ត្រាប្រតិបត្តិការបង់ប្រាក់កម្ចី)
CREATE TABLE IF NOT EXISTS loan_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES loan_repayment_schedules(id) ON DELETE SET NULL,
    installment_number INT,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_paid DECIMAL(14,2) NOT NULL CHECK (amount_paid > 0),
    principal_paid DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    interest_paid DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    late_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH',
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    recorded_by VARCHAR(150) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Loan Applications Table (តារាងពាក្យស្នើសុំកម្ចី)
CREATE TABLE IF NOT EXISTS loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_type VARCHAR(20) NOT NULL CHECK (applicant_type IN ('MEMBER', 'EXTERNAL')),
    applicant_name VARCHAR(100) NOT NULL,
    applicant_phone VARCHAR(25) NOT NULL,
    requested_amount DECIMAL(14,2) NOT NULL,
    proposed_term_months INT NOT NULL,
    purpose TEXT NOT NULL,
    collateral_description TEXT,
    guarantor_name VARCHAR(100),
    guarantor_phone VARCHAR(25),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create Audit Log Table (តារាងកំណត់ត្រាសកម្មភាពកែប្រែនិងលុប)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'VOID')),
    old_data JSONB,
    new_data JSONB,
    changed_by VARCHAR(150) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create Notifications & SMS Log Table (តារាងប្រវត្តិសាររំលឹក)
CREATE TABLE IF NOT EXISTS notifications_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(25) NOT NULL,
    message_khmer TEXT NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'SMS',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'DELIVERED'
);

-- 9. Create Officer Terms Table (តារាងប្រវត្តិអាណត្តិប្រធាន និងបេឡាធិការ)
CREATE TABLE IF NOT EXISTS officer_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ប្រធានក្លឹប', 'បេឡាធិការ')),
    term_start DATE NOT NULL,
    term_end DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Create Club Settings Table (តារាងកំណត់រចនាសម្ព័ន្ធសមាគម)
CREATE TABLE IF NOT EXISTS club_settings (
    id INT PRIMARY KEY DEFAULT 1,
    club_name_khmer VARCHAR(150) NOT NULL DEFAULT 'សមាគម ឌឹ បេស៍ ហ្វាមីលី ក្លឹប',
    current_fiscal_year INT NOT NULL DEFAULT 2026,
    member_loan_rate DECIMAL(5,2) NOT NULL DEFAULT 1.20,
    external_loan_rate DECIMAL(5,2) NOT NULL DEFAULT 2.50,
    default_monthly_commitment DECIMAL(12,2) NOT NULL DEFAULT 100.00,
    late_fee_type VARCHAR(30) NOT NULL DEFAULT 'PERCENT_PER_MONTH',
    late_fee_value DECIMAL(8,2) NOT NULL DEFAULT 1.00,
    grace_days INT NOT NULL DEFAULT 3,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Create Expenses Table (តារាងចំណាយសមាគម)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(30) NOT NULL CHECK (category IN ('MEETING', 'BANK_FEE', 'PRINTING', 'TRANSPORT', 'OTHER')),
    description TEXT NOT NULL,
    amount DECIMAL(14,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'ABA_PAY',
    reference_number VARCHAR(100),
    recorded_by VARCHAR(150) NOT NULL,
    is_voided BOOLEAN NOT NULL DEFAULT false,
    voided_by VARCHAR(150),
    void_reason TEXT,
    voided_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Create Cash Reconciliations Table (តារាងផ្ទៀងផ្ទាត់សាច់ប្រាក់ប្រចាំខែ)
CREATE TABLE IF NOT EXISTS cash_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_year INT NOT NULL,
    period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    system_balance DECIMAL(14,2) NOT NULL,
    actual_cash DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    actual_bank DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    recorded_by VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_reconcil_period UNIQUE (period_year, period_month)
);

-- 13. Create Fiscal Year Closings Table (តារាងបិទបញ្ជីប្រចាំឆ្នាំ)
CREATE TABLE IF NOT EXISTS fiscal_year_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fiscal_year INT UNIQUE NOT NULL,
    total_savings DECIMAL(14,2) NOT NULL,
    interest_income DECIMAL(14,2) NOT NULL,
    late_fees DECIMAL(14,2) NOT NULL,
    total_expenses DECIMAL(14,2) NOT NULL,
    net_profit DECIMAL(14,2) NOT NULL,
    total_dividends DECIMAL(14,2) NOT NULL,
    closed_by VARCHAR(150) NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 14. Create Loan Approvals Table (តារាងការអនុម័តកម្ចីពីគណៈកម្មការ)
CREATE TABLE IF NOT EXISTS loan_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    officer_id UUID REFERENCES members(id) ON DELETE SET NULL,
    officer_name VARCHAR(100) NOT NULL,
    officer_role VARCHAR(50) NOT NULL,
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED')),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_app_officer UNIQUE (application_id, officer_role)
);

-- 15. Create Member Exits Table (តារាងសមាជិកចាកចេញ)
CREATE TABLE IF NOT EXISTS member_exits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    exit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    savings_at_exit DECIMAL(14,2) NOT NULL,
    dividends_at_exit DECIMAL(14,2) NOT NULL,
    loan_deduction DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    payout_amount DECIMAL(14,2) NOT NULL,
    payout_method VARCHAR(30) NOT NULL DEFAULT 'ABA_PAY',
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    paid_by VARCHAR(150) NOT NULL,
    notes TEXT,
    has_written_debt_note BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimized Performance Indexes
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
CREATE INDEX IF NOT EXISTS idx_savings_member_date ON monthly_savings(member_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_loans_borrower_type ON loans(borrower_type);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_schedules_due_date ON loan_repayment_schedules(due_date, status);
CREATE INDEX IF NOT EXISTS idx_payments_loan ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_officer_terms_role ON officer_terms(role, term_start);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_reconcil_period ON cash_reconciliations(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_loan_approvals_app ON loan_approvals(application_id);
CREATE INDEX IF NOT EXISTS idx_member_exits_member ON member_exits(member_id);
`;
