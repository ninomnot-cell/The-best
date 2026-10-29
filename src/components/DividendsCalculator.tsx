import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  TrendingUp, 
  PiggyBank, 
  HandCoins, 
  PieChart, 
  Sparkles, 
  Coins, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const DividendsCalculator: React.FC = () => {
  const { members, loans, stats, resetToDefaultData } = useClub();
  const [simulationPoolBonus, setSimulationPoolBonus] = useState<number>(0);

  const totalClubSavings = members.reduce((sum, m) => sum + m.totalSavings, 0);
  const totalInterestCollected = loans.reduce((sum, l) => sum + l.totalPaidInterest, 0);
  const activeUnpaidInterest = loans.reduce((sum, l) => sum + (l.totalInterest - l.totalPaidInterest), 0);
  
  const currentPool = totalInterestCollected + simulationPoolBonus;
  const annualYield = totalClubSavings > 0 
    ? ((totalInterestCollected / totalClubSavings) * 100).toFixed(2) 
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>ការប្រាក់ & ភាគលាភវិនិយោគ (Dividends & Investment Share)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ការប្រាក់ដែលប្រមូលបានពីកម្ចីសមាជិកក្នុង និងអ្នកក្រៅ ត្រូវបានបែងចែកជូនសមាជិកទាំង ៨ រូប ផ្អែកលើទំហំប្រាក់សន្សំ
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យគំរូឡើងវិញ (Reset to Demo Data)?')) {
              resetToDefaultData();
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>កំណត់ទិន្នន័យឡើងវិញ (Reset)</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">មូលនិធិសន្សំសរុបរបស់សមាជិក</div>
          <div className="text-2xl font-bold text-[#00609C] font-mono tabular-nums mt-1">
            ${totalClubSavings.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ទុនវិនិយោគរួមគ្នារបស់ ៨ រូប
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">ការប្រាក់ប្រមូលបានជាក់ស្តែង</div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            +${totalInterestCollected.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            អត្រាផលចំណេញបច្ចុប្បន្ន: <span className="font-semibold text-emerald-600 font-mono">{annualYield}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">ការប្រាក់រង់ចាំប្រមូលបន្ថែម</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            ${activeUnpaidInterest.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ពីកាលវិភាគកម្ចីដែលនៅសល់
          </div>
        </div>
      </div>

      {/* Mechanism Explanation Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-5 text-xs text-slate-800 space-y-3">
        <div className="font-bold text-[#00609C] flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-[#F15A24]" />
          <span>រូបមន្តគណនាភាគលាភ និងការបែងចែកប្រាក់ចំណេញ (Dividend Formula)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-white/80 rounded-xl border border-blue-100">
            <div className="font-semibold text-slate-900">១. ភាគរយចំណែកក្នុងមូលនិធិ (Share %) ៖</div>
            <div className="mt-1 font-mono text-[11px] text-blue-900 bg-blue-50 p-2 rounded">
              ចំណែក (%) = (ទឹកប្រាក់សន្សំសមាជិក ÷ មូលនិធិសន្សំសរុប) × 100%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              សមាជិកដែលសន្សំច្រើន និងយូរជាងគេ នឹងទទួលបានភាគរយខ្ពស់ជាង។
            </div>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-blue-100">
            <div className="font-semibold text-slate-900">២. ទឹកប្រាក់ភាគលាភទទួលបាន ($) ៖</div>
            <div className="mt-1 font-mono text-[11px] text-emerald-900 bg-emerald-50 p-2 rounded">
              ភាគលាភ ($) = ចំណែក (%) × ការប្រាក់ប្រមូលបានសរុប
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              រួមបញ្ចូលការប្រាក់ពីកម្ចីផ្ទៃក្នុង (១.២%) និងកម្ចីអ្នកក្រៅ (២.៥%)។
            </div>
          </div>
        </div>
      </div>

      {/* Members Dividend Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">
            តារាងបែងចែកភាគលាភជូនសមាជិកទាំង ៨ រូប (Dividend Distribution)
          </h2>
          <div className="text-xs text-slate-500">
            គណនាស្វ័យប្រវត្តិតាមសមាមាត្រជាក់ស្តែង
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-3 px-3.5 font-semibold">សមាជិក</th>
                <th className="py-3 px-3 font-semibold">តួនាទី</th>
                <th className="py-3 px-3 font-semibold text-right">ទឹកប្រាក់សន្សំ ($)</th>
                <th className="py-3 px-3 font-semibold text-center">ចំណែកភាគហ៊ុន (%)</th>
                <th className="py-3 px-3 font-semibold text-right">ភាគលាភបានទទួលរួច</th>
                <th className="py-3 px-3 font-semibold text-right">ចំណែកពីការប្រាក់បច្ចុប្បន្ន</th>
                <th className="py-3 px-3 font-semibold text-right font-bold text-slate-900">ទ្រព្យសរុបក្នុងក្លឹប</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => {
                const sharePercent = totalClubSavings > 0 
                  ? (m.totalSavings / totalClubSavings) * 100 
                  : 0;

                const currentEarnedShare = (sharePercent / 100) * totalInterestCollected;
                const totalWealth = m.totalSavings + m.totalDividendsEarned;

                return (
                  <tr key={m.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-[#00609C] font-bold text-[10px] flex items-center justify-center">
                          {m.nameKhmer.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{m.nameKhmer}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{m.phone}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100">
                        {m.role}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-[#00609C] font-mono tabular-nums">
                      ${m.totalSavings.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                      {sharePercent.toFixed(2)}%
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-emerald-700 tabular-nums">
                      +${m.totalDividendsEarned.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-700 tabular-nums">
                      ${currentEarnedShare.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums bg-slate-50/50">
                      ${totalWealth.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-slate-800">
              <tr>
                <td className="py-3 px-3.5" colSpan={2}>
                  សរុបរួមទាំងអស់ (Total)
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-[#00609C]">
                  ${totalClubSavings.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center font-mono">
                  100.00%
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-700 tabular-nums">
                  +${members.reduce((s, m) => s + m.totalDividendsEarned, 0).toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">
                  ${totalInterestCollected.toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900">
                  ${(totalClubSavings + members.reduce((s, m) => s + m.totalDividendsEarned, 0)).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
