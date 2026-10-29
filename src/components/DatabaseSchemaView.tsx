import React, { useState } from 'react';
import { DATABASE_SCHEMA_TABLES, SQL_DDL_SCRIPT, SchemaTable } from '../data/databaseSchema';
import { 
  Database, 
  Table, 
  Copy, 
  Check, 
  Download, 
  Key, 
  Link, 
  FileCode, 
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

import { useClub } from '../context/ClubContext';
import { exportMembersToCSV, exportLoansToCSV, exportSavingsToCSV } from '../utils/exportCsv';

export const DatabaseSchemaView: React.FC = () => {
  const { members, loans, savingsRecords, stats } = useClub();
  const [selectedTable, setSelectedTable] = useState<SchemaTable>(DATABASE_SCHEMA_TABLES[0]);
  const [activeTab, setActiveTab] = useState<'tables' | 'erd' | 'sql'>('tables');
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_DDL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SQL_DDL_SCRIPT], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'the_best_club_database_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <span>រចនាសម្ព័ន្ធមូលដ្ឋានទិន្នន័យ (Database Architecture & Schema)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            គំរូរចនាសម្ព័ន្ធ Database ពេញលេញ សម្រាប់ PostgreSQL, Cloud SQL, Supabase និង MySQL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'tables' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              តារាងនីមួយៗ (Tables)
            </button>
            <button
              onClick={() => setActiveTab('erd')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'erd' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              ទំនាក់ទំនង (ER Diagram)
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeTab === 'sql' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              កូដ SQL DDL
            </button>
          </div>
        </div>
      </div>

      {/* Quick CSV Export & Data Backup Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              ទាញយកទិន្នន័យបម្រុងទុក (Data Backup & CSV Reports)
            </h2>
            <p className="text-xs text-slate-500">
              រក្សាទុក ឬ Export ទិន្នន័យសមាជិក កម្ចី និងប្រាក់សន្សំជាទម្រង់ CSV សម្រាប់ Excel / Google Sheets
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportMembersToCSV(members, stats.totalClubSavings)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV សមាជិក ({members.length})</span>
          </button>

          <button
            onClick={() => exportLoansToCSV(loans, members)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV កម្ចី ({loans.length})</span>
          </button>

          <button
            onClick={() => exportSavingsToCSV(savingsRecords, members)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV ប្រាក់សន្សំ ({savingsRecords.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Tables & Columns Inspector */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Tables List */}
          <div className="lg:col-span-1 space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              តារាងទាំងអស់ ({DATABASE_SCHEMA_TABLES.length})
            </div>
            {DATABASE_SCHEMA_TABLES.map((t) => (
              <button
                key={t.tableName}
                onClick={() => setSelectedTable(t)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                  selectedTable.tableName === t.tableName
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">
                    {t.tableName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {t.columns.length} cols
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                  {t.tableNameKhmer}
                </div>
              </button>
            ))}
          </div>

          {/* Right Column: Column Details */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-mono font-bold text-slate-900">
                    {selectedTable.tableName}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {selectedTable.tableNameKhmer} — {selectedTable.descriptionKhmer}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded">
                  {selectedTable.columns.length} Columns
                </span>
              </div>
            </div>

            {/* Columns Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold w-8">Key</th>
                    <th className="py-2.5 px-3 font-semibold font-mono">Column Name</th>
                    <th className="py-2.5 px-3 font-semibold font-mono">Data Type</th>
                    <th className="py-2.5 px-3 font-semibold">Null?</th>
                    <th className="py-2.5 px-3 font-semibold">ការពិពណ៌នាជាភាសាខ្មែរ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedTable.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        {col.isPrimary && (
                          <span title="Primary Key" className="text-amber-600 font-mono text-[10px] font-bold">
                            PK
                          </span>
                        )}
                        {col.isForeign && (
                          <span title={`Foreign Key references ${col.references}`} className="text-blue-600 font-mono text-[10px] font-bold">
                            FK
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                        {col.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-indigo-700 text-[11px]">
                        {col.type}
                      </td>
                      <td className="py-2.5 px-3 text-[11px]">
                        {col.nullable ? (
                          <span className="text-slate-400">NULL</span>
                        ) : (
                          <span className="text-slate-800 font-semibold">NOT NULL</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <div>{col.descriptionKhmer}</div>
                        {col.references && (
                          <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                            ↳ References: {col.references}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Indexes */}
            {selectedTable.indexes.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-xs font-semibold text-slate-700">Indexes & Constraints:</div>
                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                  {selectedTable.indexes.map((idx, i) => (
                    <div key={i} className="bg-white p-1.5 rounded border border-slate-200">{idx}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Entity Relationship Overview (ERD) */}
      {activeTab === 'erd' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              ដ្យាក្រាមទំនាក់ទំនងទិន្នន័យ (Entity Relationship Diagram)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ទំនាក់ទំនងរវាងសមាជិក ការសន្សំប្រាក់ កម្ចី តារាងកាលវិភាគសង និងការជូនដំណឹង
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Members */}
            <div className="border-2 border-blue-400 rounded-xl p-4 bg-blue-50/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <span className="font-mono font-bold text-blue-900">members</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">Core Entity</span>
              </div>
              <ul className="text-xs space-y-1 font-mono text-slate-700">
                <li className="font-bold text-amber-700">• id (PK, UUID)</li>
                <li>• member_code (Unique)</li>
                <li>• name_khmer, phone</li>
                <li>• total_savings</li>
                <li>• monthly_commitment</li>
              </ul>
              <div className="pt-2 border-t border-blue-200 text-[11px] text-blue-800 space-y-1">
                <div>↳ <strong>1 : N</strong> ទៅកាន់ <code>monthly_savings</code></div>
                <div>↳ <strong>1 : N</strong> ទៅកាន់ <code>loans (បើខ្ចីក្នុង)</code></div>
              </div>
            </div>

            {/* Box 2: Loans */}
            <div className="border-2 border-orange-400 rounded-xl p-4 bg-orange-50/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-orange-200">
                <span className="font-mono font-bold text-orange-900">loans</span>
                <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-semibold">Loan Entity</span>
              </div>
              <ul className="text-xs space-y-1 font-mono text-slate-700">
                <li className="font-bold text-amber-700">• id (PK, UUID)</li>
                <li>• borrower_type (MEMBER/EXT)</li>
                <li className="text-blue-700">• borrower_id (FK → members)</li>
                <li>• principal_amount, rate, term</li>
                <li>• remaining_balance, status</li>
              </ul>
              <div className="pt-2 border-t border-orange-200 text-[11px] text-orange-800 space-y-1">
                <div>↳ <strong>1 : N</strong> ទៅកាន់ <code>loan_repayment_schedules</code></div>
                <div>↳ <strong>1 : N</strong> ទៅកាន់ <code>notifications_log</code></div>
              </div>
            </div>

            {/* Box 3: Repayment Schedules */}
            <div className="border-2 border-emerald-400 rounded-xl p-4 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <span className="font-mono font-bold text-emerald-900">loan_repayment_schedules</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">Amortization</span>
              </div>
              <ul className="text-xs space-y-1 font-mono text-slate-700">
                <li className="font-bold text-amber-700">• id (PK, UUID)</li>
                <li className="text-blue-700">• loan_id (FK → loans)</li>
                <li>• installment_number (1..N)</li>
                <li>• due_date, principal, interest</li>
                <li>• total_due, status (PAID/DUE)</li>
              </ul>
              <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-800">
                រៀងរាល់កម្ចី នឹងបង្កើតកាលវិភាគ N ខែស្វ័យប្រវត្តិ
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 border border-slate-200">
            <div className="font-bold text-slate-800">លក្ខណៈពិសេសនៃរចនាសម្ព័ន្ធនេះ៖</div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Foreign Key Cascades:</strong> ការពារការបាត់បង់ទិន្នន័យ (Restricted Delete លើសមាជិកដែលមានកំណត់ត្រាសន្សំ)។</li>
              <li><strong>Composite Unique Constraints:</strong> <code>(member_id, year, month)</code> ការពារកុំឱ្យកត់ត្រាការបង់សន្សំស្ទួនក្នុងខែតែមួយ។</li>
              <li><strong>Performance Indexes:</strong> បង្កើត Index លើ <code>due_date</code> និង <code>status</code> ដើម្បីស្វែងរកកម្ចីដែលត្រូវបង់ និងផ្ញើសារ SMS រំលឹកបានលឿនរហ័ស។</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: SQL DDL Script */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span>កូដ SQL DDL ពេញលេញ (PostgreSQL / Supabase / Cloud SQL)</span>
              </h2>
              <p className="text-xs text-slate-500">
                អាចយកទៅ Run ផ្ទាល់ក្នុង PostgreSQL Console, Supabase, Neon, ឬ Drizzle ORM
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">បានចម្លងរួច</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>ចម្លង SQL</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadSql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ទាញយក Schema.sql</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-[500px] leading-relaxed">
            {SQL_DDL_SCRIPT}
          </pre>
        </div>
      )}
    </div>
  );
};
