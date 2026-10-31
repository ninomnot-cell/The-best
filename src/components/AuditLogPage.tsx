import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import { AuditLogRecord } from '../types';
import { 
  FileCode2, 
  Search, 
  Filter, 
  Eye, 
  X, 
  ShieldAlert, 
  Clock, 
  User, 
  Table
} from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { auditLogs, isOfficer } = useClub();

  const [filterTable, setFilterTable] = useState<string>('ALL');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterUser, setFilterUser] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (filterTable !== 'ALL' && log.tableName !== filterTable) return false;
      if (filterAction !== 'ALL' && log.action !== filterAction) return false;
      if (filterUser.trim() && !log.changedBy.toLowerCase().includes(filterUser.toLowerCase())) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const idMatch = log.recordId.toLowerCase().includes(term);
        const userMatch = log.changedBy.toLowerCase().includes(term);
        const tableMatch = log.tableName.toLowerCase().includes(term);
        if (!idMatch && !userMatch && !tableMatch) return false;
      }
      return true;
    });
  }, [auditLogs, filterTable, filterAction, filterUser, searchTerm]);

  const uniqueTables = useMemo(() => {
    const set = new Set(auditLogs.map(l => l.tableName));
    return Array.from(set);
  }, [auditLogs]);

  if (!isOfficer) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-amber-200 shadow-sm text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">ទំព័របិទសិទ្ធិចូលមើល (Restricted Page)</h2>
        <p className="text-xs text-slate-500">
          មានតែប្រធានក្លឹប ឬបេឡាធិការប៉ុណ្ណោះដែលមានសិទ្ធិចូលមើលប្រវត្តិសកម្មភាពកែប្រែទិន្នន័យ (Audit Logs)!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              ប្រវត្តិសកម្មភាពកែប្រែ & លុបទិន្នន័យ (Audit Log History)
            </h1>
            <p className="text-xs text-slate-500">
              កត់ត្រារាល់ប្រតិបត្តិការ Edit, Delete, Void, Approval, Year Closing & Role Handover សម្រាប់សុវត្ថិភាព
            </p>
          </div>
        </div>

        <div className="text-xs font-mono font-bold px-3 py-1.5 bg-slate-100 rounded-xl text-slate-700">
          សរុប: {filteredLogs.length} Records
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ស្វែងរកតាម Record ID, អ៊ីមែល..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C]"
            />
          </div>

          <div>
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C]"
            >
              <option value="ALL">គ្រប់តារាងទិន្នន័យ (All Tables)</option>
              {uniqueTables.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C]"
            >
              <option value="ALL">គ្រប់សកម្មភាព (All Actions)</option>
              <option value="INSERT">INSERT (បន្ថែមថ្មី)</option>
              <option value="UPDATE">UPDATE (កែប្រែ)</option>
              <option value="DELETE">DELETE (លុប)</option>
              <option value="VOID">VOID (បោះបង់)</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="តម្រងតាមអ៊ីមែលអ្នកធ្វើ..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-[#00609C] font-mono"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">កាលបរិច្ឆេទ & ម៉ោង</th>
                <th className="py-2.5 px-3">តារាង (Table)</th>
                <th className="py-2.5 px-3">សកម្មភាព</th>
                <th className="py-2.5 px-3">Record UUID</th>
                <th className="py-2.5 px-3">អ្នកប្រតិបត្តិ</th>
                <th className="py-2.5 px-3 text-center">ពិនិត្យទិន្នន័យ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    មិនមានទិន្នន័យ Audit Log ឡើយ
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {log.changedAt ? new Date(log.changedAt).toLocaleString('kh-KH') : log.changedAt}
                    </td>

                    <td className="py-2.5 px-3 font-bold text-[#00609C] whitespace-nowrap">
                      {log.tableName}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                        log.action === 'INSERT' ? 'bg-emerald-100 text-emerald-800' :
                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'DELETE' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-28 truncate whitespace-nowrap">
                      {log.recordId}
                    </td>

                    <td className="py-2.5 px-3 text-slate-700 font-sans font-medium text-[11px] max-w-36 truncate whitespace-nowrap">
                      {log.changedBy}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>មើល Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <FileCode2 className="w-5 h-5 text-indigo-700" />
                <span>ពិនិត្យប្រៀបធៀបទិន្នន័យ (Audit Log Detail)</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 font-mono">
              <div><strong>Table:</strong> {selectedLog.tableName} · <strong>Action:</strong> {selectedLog.action}</div>
              <div><strong>Record ID:</strong> {selectedLog.recordId}</div>
              <div><strong>Changed By:</strong> {selectedLog.changedBy} · <strong>Time:</strong> {selectedLog.changedAt}</div>
            </div>

            {/* Side-by-Side Json Diff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="font-bold text-rose-700 font-sans flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  <span>ទិន្នន័យចាស់ (Old Data)</span>
                </div>
                <pre className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl text-slate-800 text-[11px] overflow-x-auto max-h-72">
                  {selectedLog.oldData ? JSON.stringify(selectedLog.oldData, null, 2) : 'null (គ្មានទិន្នន័យចាស់)'}
                </pre>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-emerald-700 font-sans flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>ទិន្នន័យថ្មី (New Data)</span>
                </div>
                <pre className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-slate-800 text-[11px] overflow-x-auto max-h-72">
                  {selectedLog.newData ? JSON.stringify(selectedLog.newData, null, 2) : 'null (ទិន្នន័យត្រូវបានលុប)'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium cursor-pointer text-xs"
              >
                បិទ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
