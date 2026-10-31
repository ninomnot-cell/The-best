import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { MonthlySavingRecord } from '../types';
import { 
  PiggyBank, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  X, 
  CreditCard, 
  ArrowDownToLine,
  Receipt,
  Download,
  Edit2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { exportSavingsToCSV } from '../utils/exportCsv';

export const SavingsManager: React.FC = () => {
  const { 
    members, 
    savingsRecords, 
    addSavingsRecord,
    updateSavingsRecord,
    deleteSavingsRecord,
    clubSettings,
    isOfficer,
    isYearClosed
  } = useClub();

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');

  // Edit / Delete states for monthly savings
  const [editingRecord, setEditingRecord] = useState<MonthlySavingRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MonthlySavingRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find treasurer for default recordedBy
  const treasurer = members.find(m => m.role === 'បេឡាធិការ' && m.status === 'ACTIVE') || members.find(m => m.role === 'បេឡាធិការ');
  const defaultRecordedBy = treasurer ? `${treasurer.nameKhmer} (បេឡាធិការ)` : 'បេឡាធិការក្លឹប';

  // Form states
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [depositMonth, setDepositMonth] = useState<number>(10);
  const [depositYear, setDepositYear] = useState<number>(2026);
  const [depositAmount, setDepositAmount] = useState<string>(String(clubSettings?.defaultMonthlyCommitment || 100));
  const [depositDate, setDepositDate] = useState('2026-10-27');
  const [paymentMethod, setPaymentMethod] = useState<'ABA_PAY' | 'WING' | 'CASH' | 'AC_LEDA'>('ABA_PAY');
  const [refNumber, setRefNumber] = useState(`ABA-${Math.floor(100000 + Math.random() * 900000)}`);
  const [recordedBy, setRecordedBy] = useState(defaultRecordedBy);
  const [notes, setNotes] = useState('');

  const isCurrentYearClosed = isYearClosed(selectedYear);

  const months = [
    { num: 1, name: 'មករា (Jan)' },
    { num: 2, name: 'កុម្ភៈ (Feb)' },
    { num: 3, name: 'មីនា (Mar)' },
    { num: 4, name: 'មេសា (Apr)' },
    { num: 5, name: 'ឧសភា (May)' },
    { num: 6, name: 'មិថុនា (Jun)' },
    { num: 7, name: 'កក្កដា (Jul)' },
    { num: 8, name: 'សីហា (Aug)' },
    { num: 9, name: 'កញ្ញា (Sep)' },
    { num: 10, name: 'តុលា (Oct)' },
    { num: 11, name: 'វិច្ឆិកា (Nov)' },
    { num: 12, name: 'ធ្នូ (Dec)' }
  ];

  const handleRecordDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('ចំនួនទឹកប្រាក់សន្សំត្រូវតែធំជាង 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await addSavingsRecord({
        memberId: member.id,
        memberName: member.nameKhmer,
        year: Number(depositYear),
        month: Number(depositMonth),
        amount: amt,
        paymentDate: depositDate,
        paymentMethod: paymentMethod,
        referenceNumber: refNumber,
        recordedBy: recordedBy,
        notes: notes
      });

      setIsDepositModalOpen(false);
      setNotes('');
      setRefNumber(`ABA-${Math.floor(100000 + Math.random() * 900000)}`);
    } catch (err: any) {
      alert(`បរាជ័យក្នុងការកត់ត្រាប្រាក់សន្សំ៖ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmEditSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    if (editingRecord.amount <= 0) {
      alert('ចំនួនទឹកប្រាក់សន្សំត្រូវតែធំជាង 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await updateSavingsRecord(editingRecord);
      if (ok) {
        setEditingRecord(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteSavings = async () => {
    if (!deletingRecord) return;

    setIsSubmitting(true);
    try {
      const ok = await deleteSavingsRecord(deletingRecord.id);
      if (ok) {
        setDeletingRecord(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = savingsRecords.filter(r => {
    const matchesSearch = r.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = r.year === selectedYear;
    return matchesSearch && matchesYear;
  });

  const totalYearSavings = savingsRecords
    .filter(r => r.year === selectedYear)
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-[#00609C]" />
            <span>ការគ្រប់គ្រងប្រាក់សន្សំប្រចាំខែ (Monthly Savings)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            តាមដានការបង់ប្រាក់សន្សំរបស់សមាជិកទាំង ៨ រូប ត្រួតពិនិត្យប្រវត្តិ និងចេញបង្កាន់ដៃទទួល
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              តារាងម៉ាទ្រីស (Matrix)
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              កំណត់ត្រាលម្អិត (Ledger)
            </button>
          </div>

          <button
            onClick={() => exportSavingsToCSV(savingsRecords, members)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            title="ទាញយកកំណត់ត្រាប្រាក់សន្សំជា CSV (Excel)"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>ទាញយក CSV</span>
          </button>

          {isOfficer && !isCurrentYearClosed && (
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>កត់ត្រាការបង់ប្រាក់</span>
            </button>
          )}
        </div>
      </div>

      {/* Year Closed Warning Banner */}
      {isCurrentYearClosed && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>ឆ្នាំប្រតិបត្តិការ {selectedYear} ត្រូវ បានបិទបញ្ជីរួចរាល់ (Closed Fiscal Year) - មិនអនុញ្ញាតឱ្យបន្ថែម កែប្រែ ឬលុបទិន្នន័យឡើយ។</span>
          </div>
        </div>
      )}

      {/* Top Filter Bar & Summary */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-600">ជ្រើសរើសឆ្នាំ៖</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-slate-50 text-slate-800"
          >
            <option value={2026}>ឆ្នាំ ២០២៦</option>
            <option value={2025}>ឆ្នាំ ២០២៥</option>
            <option value={2024}>ឆ្នាំ ២០២៤</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">សរុបប្រាក់សន្សំក្នុងឆ្នាំ {selectedYear}:</span>
            <span className="font-bold text-[#00609C] font-mono tabular-nums text-sm">
              ${totalYearSavings.toLocaleString()}
            </span>
          </div>
          <div className="hidden sm:block text-slate-300">|</div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>កាតព្វកិច្ចសន្សំ:</span>
            <span className="font-semibold text-slate-800 font-mono">${clubSettings?.defaultMonthlyCommitment || 100} / សមាជិក / ខែ</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: Matrix View (Members x Months) */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              តារាងតាមដានការបង់ប្រាក់សន្សំប្រចាំខែ (ឆ្នាំ {selectedYear})
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>បានបង់រួច</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                <span>មិនទាន់ដល់ខែ</span>
              </span>
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-3.5 font-semibold sticky left-0 bg-slate-50 z-10 w-44">
                  សមាជិក (៨ រូប)
                </th>
                {months.map(m => (
                  <th key={m.num} className="py-3 px-2 font-semibold text-center min-w-16">
                    ខែ {m.num}
                  </th>
                ))}
                <th className="py-3 px-3 font-semibold text-right bg-slate-50">
                  សរុបក្នុងឆ្នាំ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map(member => {
                let memberYearTotal = 0;

                return (
                  <tr key={member.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3.5 font-medium text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-[#00609C] font-bold text-[10px] flex items-center justify-center">
                          {member.nameKhmer.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{member.nameKhmer}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{member.memberCode}</div>
                        </div>
                      </div>
                    </td>

                    {months.map(m => {
                      const record = savingsRecords.find(
                        r => r.memberId === member.id && r.year === selectedYear && r.month === m.num
                      );

                      if (record) {
                        memberYearTotal += record.amount;
                        return (
                          <td key={m.num} className="py-3 px-2 text-center">
                            <span 
                              title={`បានបង់ $${record.amount} នៅថ្ងៃទី ${record.paymentDate} (${record.paymentMethod})`}
                              className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-medium text-[11px] cursor-help"
                            >
                              ${record.amount}
                            </span>
                          </td>
                        );
                      }

                      // Check if month is future (e.g., month > 10 for year 2026)
                      const isFuture = selectedYear === 2026 && m.num > 10;

                      return (
                        <td key={m.num} className="py-3 px-2 text-center">
                          {isFuture ? (
                            <span className="text-slate-300 font-mono">-</span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedMemberId(member.id);
                                setDepositMonth(m.num);
                                setDepositYear(selectedYear);
                                setIsDepositModalOpen(true);
                              }}
                              title="ចុចដើម្បីកត់ត្រាការបង់"
                              className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded font-medium cursor-pointer"
                            >
                              មិនទាន់បង់
                            </button>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-right font-bold text-[#00609C] font-mono tabular-nums bg-slate-50/50">
                      ${memberYearTotal.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: Table Ledger View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះសមាជិក ឬលេខវិក្កយបត្រ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
              />
            </div>
            <div className="text-xs text-slate-500">
              បង្ហាញកំណត់ត្រាចំនួន <span className="font-bold text-slate-800 font-mono">{filteredRecords.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 px-3.5 font-semibold">សមាជិក</th>
                  <th className="py-3 px-3 font-semibold">ខែ/ឆ្នាំ</th>
                  <th className="py-3 px-3 font-semibold">កាលបរិច្ឆេទបង់</th>
                  <th className="py-3 px-3 font-semibold text-right">ទឹកប្រាក់សន្សំ</th>
                  <th className="py-3 px-3 font-semibold">មធ្យោបាយបង់</th>
                  <th className="py-3 px-3 font-semibold">លេខកូដយោង (Ref ID)</th>
                  <th className="py-3 px-3 font-semibold">អ្នកកត់ត្រា</th>
                  <th className="py-3 px-3 font-semibold">កំណត់សម្គាល់</th>
                  <th className="py-3 px-3 font-semibold text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3.5 font-medium text-slate-900">
                      {r.memberName}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-mono">
                      ខែ {r.month}/{r.year}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono">
                      {r.paymentDate}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono tabular-nums">
                      ${r.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 font-medium">
                        {r.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {r.referenceNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {r.recordedBy}
                    </td>
                    <td className="py-3 px-3 text-slate-500 italic text-[11px]">
                      {r.notes || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingRecord(r)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          title="កែប្រែទិន្នន័យបង់សន្សំ"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>កែប្រែ</span>
                        </button>
                        <button
                          onClick={() => setDeletingRecord(r)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          title="លុបកំណត់ត្រាបង់សន្សំ"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          <span>លុប</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#00609C]" />
                <span>កត់ត្រាការបង់ប្រាក់សន្សំប្រចាំខែ</span>
              </h2>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordDeposit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ជ្រើសរើសសមាជិក *
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] bg-white text-slate-800"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nameKhmer} ({m.memberCode}) - សន្សំសរុបបច្ចុប្បន្ន: ${m.totalSavings}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    សម្រាប់ខែ *
                  </label>
                  <select
                    value={depositMonth}
                    onChange={(e) => setDepositMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  >
                    {months.map(m => (
                      <option key={m.num} value={m.num}>
                        ខែ {m.num}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ឆ្នាំ *
                  </label>
                  <select
                    value={depositYear}
                    onChange={(e) => setDepositYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  >
                    <option value={2026}>២០២៦</option>
                    <option value={2025}>២០២៥</option>
                    <option value={2024}>២០២៤</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ចំនួនទឹកប្រាក់ ($) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    កាលបរិច្ឆេទបង់ *
                  </label>
                  <input
                    type="date"
                    required
                    value={depositDate}
                    onChange={(e) => setDepositDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    មធ្យោបាយបង់ប្រាក់
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  >
                    <option value="ABA_PAY">ABA Pay / KHQR</option>
                    <option value="WING">Wing Bank</option>
                    <option value="AC_LEDA">ACLEDA Bank</option>
                    <option value="CASH">សាច់ប្រាក់សុទ្ធ (Cash)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    លេខកូដប្រតិបត្តិការ (Ref / TxID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  អ្នកកត់ត្រា / អ្នកទទួល
                </label>
                <input
                  type="text"
                  value={recordedBy}
                  onChange={(e) => setRecordedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  កំណត់សម្គាល់បន្ថែម
                </label>
                <input
                  type="text"
                  placeholder="ឧ. បង់ទាន់ពេលវេលា..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'កំពុង រក្សាទុក...' : 'កត់ត្រាការបង់ប្រាក់'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SAVINGS RECORD MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#00609C]" />
                <span>កែប្រែកំណត់ត្រាប្រាក់សន្សំប្រចាំខែ</span>
              </h2>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmEditSavings} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div><span className="text-slate-500">សមាជិក៖</span> <strong>{editingRecord.memberName}</strong></div>
                <div><span className="text-slate-500">សម្រាប់៖</span> <strong className="font-mono">ខែ {editingRecord.month}/{editingRecord.year}</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ចំនួនទឹកប្រាក់សន្សំ ($) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={editingRecord.amount}
                    onChange={(e) => setEditingRecord({ ...editingRecord, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] font-mono text-sm font-bold text-[#00609C]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    កាលបរិច្ឆេទបង់ *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingRecord.paymentDate}
                    onChange={(e) => setEditingRecord({ ...editingRecord, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    មធ្យោបាយបង់ប្រាក់
                  </label>
                  <select
                    value={editingRecord.paymentMethod}
                    onChange={(e) => setEditingRecord({ ...editingRecord, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  >
                    <option value="ABA_PAY">ABA Pay / KHQR</option>
                    <option value="WING">Wing Bank</option>
                    <option value="AC_LEDA">ACLEDA Bank</option>
                    <option value="CASH">សាច់ប្រាក់សុទ្ធ (Cash)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    លេខកូដប្រតិបត្តិការ (Ref ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRecord.referenceNumber}
                    onChange={(e) => setEditingRecord({ ...editingRecord, referenceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  កំណត់សម្គាល់
                </label>
                <input
                  type="text"
                  value={editingRecord.notes || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'កំពុងកែប្រែ...' : 'រក្សាទុកការកែប្រែ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SAVINGS RECORD CONFIRMATION DIALOG */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-slate-200">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                បញ្ជាក់ការលុបកំណត់ត្រាប្រាក់សន្សំ
              </h2>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p>តើអ្នកប្រាកដជាចង់លុបកំណត់ត្រាប្រាក់សន្សំខាងក្រោមនេះមែនទេ? ទិន្នន័យសរុបរបស់សមាជិកនឹងត្រូវគណនាឡើងវិញ។</p>
              
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1 font-mono text-xs">
                <div><span className="text-slate-500 font-sans">ឈ្មោះសមាជិក៖</span> <strong>{deletingRecord.memberName}</strong></div>
                <div><span className="text-slate-500 font-sans">សម្រាប់៖</span> <strong>ខែ {deletingRecord.month}/{deletingRecord.year}</strong></div>
                <div><span className="text-slate-500 font-sans">ចំនួនទឹកប្រាក់៖</span> <strong className="text-rose-600">${deletingRecord.amount.toFixed(2)}</strong></div>
                <div><span className="text-slate-500 font-sans">លេខវិក្កយបត្រ៖</span> {deletingRecord.referenceNumber}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSavings}
                disabled={isSubmitting}
                className="px-4 py-2 text-white bg-rose-600 hover:bg-rose-700 rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'កំពុងលុប...' : 'បញ្ជាក់ការលុប'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
