import React, { useState } from 'react';
import { useClub } from '../context/ClubContext';
import { 
  Bell, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  AlertCircle, 
  Clock, 
  PhoneCall, 
  Smartphone,
  ExternalLink,
  DollarSign
} from 'lucide-react';

export const NotificationsManager: React.FC = () => {
  const { 
    notifications, 
    markReminderSent, 
    loans, 
    setSelectedLoanForSchedule, 
    setCurrentTab,
    setIsRepaymentModalOpen,
    setPreselectedLoanForRepayment
  } = useClub();

  const [filter, setFilter] = useState<'ALL' | 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'ALL') return true;
    return n.status === filter;
  });

  const handleCopySMS = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    markReminderSent(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenSms = (phone: string, text: string, id: string) => {
    markReminderSent(id);
    const cleanPhone = phone.replace(/\s+/g, '');
    window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-600" />
            <span>ប្រព័ន្ធជូនដំណឹង & សារ SMS រំលឹកកាលបរិច្ឆេទសង (Reminders)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ស្វែងរកកម្ចីដែលដល់ថ្ងៃត្រូវសង ឬហួសកាលកំណត់ និងបង្កើតសារ SMS/Telegram រំលឹកដោយស្វ័យប្រវត្តិ
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            ទាំងអស់ ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('OVERDUE')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer text-rose-700 ${
              filter === 'OVERDUE' ? 'bg-white font-semibold shadow-xs' : ''
            }`}
          >
            ហួសកំណត់ ({notifications.filter(n => n.status === 'OVERDUE').length})
          </button>
          <button
            onClick={() => setFilter('DUE_TODAY')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer text-amber-700 ${
              filter === 'DUE_TODAY' ? 'bg-white font-semibold shadow-xs' : ''
            }`}
          >
            ត្រូវបង់ថ្ងៃនេះ ({notifications.filter(n => n.status === 'DUE_TODAY').length})
          </button>
          <button
            onClick={() => setFilter('UPCOMING')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer text-blue-700 ${
              filter === 'UPCOMING' ? 'bg-white font-semibold shadow-xs' : ''
            }`}
          >
            ជិតដល់ថ្ងៃ ({notifications.filter(n => n.status === 'UPCOMING').length})
          </button>
        </div>
      </div>

      {/* Notice info banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>របៀបប្រើប្រាស់៖</strong> ប្រព័ន្ធនឹងពិនិត្យកាលវិភាគសងកម្ចីរៀងរាល់ថ្ងៃ។ អ្នកគ្រប់គ្រងអាចចុច <strong>«ចម្លងសារ»</strong> ដើម្បីផ្ញើតាម Telegram/Messenger ឬចុច <strong>«កត់ត្រាការបង់ប្រាក់»</strong> នៅពេលទទួលបានការផ្ទេរប្រាក់។
        </div>
      </div>

      {/* List of Reminders */}
      <div className="space-y-4">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            មិនមានកម្ចីណាមួយស្ថិតក្នុងស្ថានភាពត្រូវរំលឹកទេ
          </div>
        ) : (
          filteredNotifs.map((notif) => {
            const relatedLoan = loans.find(l => l.id === notif.loanId);

            return (
              <div 
                key={notif.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {notif.borrowerName}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      ({notif.borrowerPhone})
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      notif.status === 'OVERDUE'
                        ? 'bg-rose-100 text-rose-800'
                        : notif.status === 'DUE_TODAY'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {notif.status === 'OVERDUE' ? 'ហួសកំណត់សង' : notif.status === 'DUE_TODAY' ? 'ផុតកំណត់ថ្ងៃនេះ' : `នៅសល់ ${notif.daysRemaining} ថ្ងៃទៀត`}
                    </span>
                    {notif.lastSentDate && (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        ✓ {notif.lastSentDate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">កាលបរិច្ឆេទ & ទឹកប្រាក់:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                        ${notif.totalDue.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono ml-1.5">
                        (ផុតកំណត់ {notif.dueDate})
                      </span>
                    </div>
                  </div>
                </div>

                {/* SMS Template Content Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                      <span>ខ្លឹមសារសាររំលឹកជាភាសាខ្មែរ (SMS Message Preview):</span>
                    </span>
                    <span className="text-[11px] text-slate-400">លើកទី #{notif.installmentNumber}</span>
                  </div>
                  <pre className="font-sans whitespace-pre-wrap text-slate-800 leading-relaxed text-[12px] bg-white p-3 rounded border border-slate-200">
                    {notif.smsMessageKhmer}
                  </pre>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    {relatedLoan && (
                      <button
                        onClick={() => {
                          setSelectedLoanForSchedule(relatedLoan);
                          setCurrentTab('loans');
                        }}
                        className="text-xs text-[#00609C] hover:underline font-medium cursor-pointer"
                      >
                        ពិនិត្យតារាងបង់ប្រាក់កម្ចី →
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Record Repayment Button */}
                    <button
                      onClick={() => {
                        setPreselectedLoanForRepayment({
                          loanId: notif.loanId,
                          installmentNumber: notif.installmentNumber
                        });
                        setIsRepaymentModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>កត់ត្រាការបង់ប្រាក់</span>
                    </button>

                    <button
                      onClick={() => handleCopySMS(notif.id, notif.smsMessageKhmer)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedId === notif.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">បានចម្លងរួច</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>ចម្លងអត្ថបទសារ</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenSms(notif.borrowerPhone, notif.smsMessageKhmer, notif.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ផ្ញើតាម SMS</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
