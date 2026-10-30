import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext';
import { BorrowerType, InterestMethod } from '../types';
import { generateAmortizationSchedule } from '../data/initialData';
import { 
  FileText, 
  Calculator, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  UserMinus, 
  Send,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Equal,
  CalendarCheck,
  Percent
} from 'lucide-react';

export const LoanApplicationForm: React.FC = () => {
  const { 
    members, 
    applications, 
    submitLoanApplication, 
    approveLoanApplication, 
    rejectLoanApplication,
    setCurrentTab 
  } = useClub();

  // Form State
  const [applicantType, setApplicantType] = useState<BorrowerType>('MEMBER');
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [applicantName, setApplicantName] = useState(members[0]?.nameKhmer || '');
  const [applicantPhone, setApplicantPhone] = useState(members[0]?.phone || '');
  const [applicantIdCard, setApplicantIdCard] = useState(members[0]?.idCardNumber || '');
  const [applicantAddress, setApplicantAddress] = useState(members[0]?.address || '');
  const [occupation, setOccupation] = useState('');
  const [requestedAmount, setRequestedAmount] = useState<number>(1500);
  const [termMonths, setTermMonths] = useState<number>(6);
  const [interestRate, setInterestRate] = useState<number>(1.2);
  const [interestMethod, setInterestMethod] = useState<InterestMethod>('DECLINING');
  const [purpose, setPurpose] = useState('');
  const [collateral, setCollateral] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorRelation, setGuarantorRelation] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'apply' | 'queue'>('apply');

  // Admin approval customization modal / state
  const [reviewingAppId, setReviewingAppId] = useState<string | null>(null);
  const [adminCustomRate, setAdminCustomRate] = useState<number>(1.2);
  const [adminCustomMethod, setAdminCustomMethod] = useState<InterestMethod>('DECLINING');

  // Handle member selection change
  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId);
    const m = members.find(item => item.id === memberId);
    if (m) {
      setApplicantName(m.nameKhmer);
      setApplicantPhone(m.phone);
      setApplicantIdCard(m.idCardNumber);
      setApplicantAddress(m.address);
      setCollateral(`ធានាដោយទឹកប្រាក់សន្សំក្នុងក្លឹប ($${m.totalSavings})`);
    }
  };

  // Switch applicant type and adjust default rate
  const handleTypeChange = (type: BorrowerType) => {
    setApplicantType(type);
    if (type === 'MEMBER') {
      setInterestRate(1.2);
      handleMemberSelect(members[0]?.id);
    } else {
      setInterestRate(2.5);
      setApplicantName('');
      setApplicantPhone('');
      setApplicantIdCard('');
      setApplicantAddress('');
      setCollateral('');
    }
  };

  // Live Loan Calculation Schedule Preview
  const previewSchedule = useMemo(() => {
    const amt = Math.max(10, requestedAmount || 0);
    const rate = Math.max(0, interestRate || 0);
    const term = Math.max(1, termMonths || 1);
    return generateAmortizationSchedule(amt, rate, term, '2026-10-27', interestMethod);
  }, [requestedAmount, interestRate, termMonths, interestMethod]);

  const totalCalculatedInterest = useMemo(() => {
    return previewSchedule.reduce((sum, item) => sum + item.interest, 0);
  }, [previewSchedule]);

  const totalCalculatedPayable = useMemo(() => {
    return (requestedAmount || 0) + totalCalculatedInterest;
  }, [requestedAmount, totalCalculatedInterest]);

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone || requestedAmount <= 0) return;

    submitLoanApplication({
      applicantType,
      memberId: applicantType === 'MEMBER' ? selectedMemberId : undefined,
      applicantName,
      applicantPhone,
      applicantIdCard,
      applicantAddress,
      occupation: occupation || (applicantType === 'MEMBER' ? 'សមាជិកក្លឹប' : 'អាជីវករ'),
      requestedAmount: Number(requestedAmount),
      proposedInterestRate: Number(interestRate),
      interestMethod: interestMethod,
      proposedTermMonths: Number(termMonths),
      purpose: purpose || 'ពង្រីកអាជីវកម្ម',
      collateralDescription: collateral || (applicantType === 'MEMBER' ? 'ទឹកប្រាក់សន្សំសមាជិក' : 'កាតគ្រីយានយន្ត'),
      guarantorName: guarantorName || (applicantType === 'MEMBER' ? 'សមាជិកក្លឹប' : 'អ្នកធានាផ្ទាល់'),
      guarantorPhone: guarantorPhone || '012 000 000',
      guarantorRelationship: guarantorRelation || 'សមាជិកក្លឹប'
    });

    setActiveSubTab('queue');
    setPurpose('');
  };

  const pendingApps = applications.filter(a => a.status === 'PENDING');

  const startReviewApp = (app: typeof applications[0]) => {
    setReviewingAppId(app.id);
    setAdminCustomRate(app.proposedInterestRate !== undefined ? app.proposedInterestRate : (app.applicantType === 'MEMBER' ? 1.2 : 2.5));
    setAdminCustomMethod(app.interestMethod || 'DECLINING');
  };

  const confirmApprove = (appId: string) => {
    approveLoanApplication(appId, adminCustomRate, adminCustomMethod);
    setReviewingAppId(null);
  };

  const getMethodLabel = (method: InterestMethod) => {
    switch (method) {
      case 'FLAT':
        return 'ការប្រាក់ថេរ';
      case 'DECLINING':
        return 'ការប្រាក់ថយចុះ';
      case 'INTEREST_ONLY':
        return 'បង់តែការប្រាក់ & ដើមចុងគ្រា';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00609C]" />
            <span>ពាក្យស្នើសុំកម្ចី & គណនាការប្រាក់ (Loan Applications)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            អាចវាយបញ្ចូលអត្រាការប្រាក់ដោយសេរី និងជ្រើសរើសវិធីសាស្ត្រគណនា (ការប្រាក់ថេរ, ការប្រាក់ថយចុះ, ឬបង់តែការប្រាក់ប្រចាំខែ & ដើមចុងគ្រា)
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubTab('apply')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'apply' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            ទម្រង់ពាក្យស្នើសុំ (Apply)
          </button>
          <button
            onClick={() => setActiveSubTab('queue')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'queue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <span>បញ្ជីរង់ចាំការអនុម័ត</span>
            {pendingApps.length > 0 && (
              <span className="bg-[#F15A24] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {pendingApps.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeSubTab === 'apply' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <form onSubmit={handleSubmitApplication} className="space-y-5 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="block font-semibold text-slate-800 mb-2">
                  ជ្រើសរើសប្រភេទអ្នកស្នើសុំកម្ចី *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('MEMBER')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      applicantType === 'MEMBER'
                        ? 'border-[#00609C] bg-blue-50/40 ring-1 ring-[#00609C]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className={`w-5 h-5 shrink-0 ${applicantType === 'MEMBER' ? 'text-[#00609C]' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">សមាជិកក្នុងសមាគម (Internal)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        អត្រាការប្រាក់ទាប (១% - ១.៥%) · ធានាដោយប្រាក់សន្សំក្នុងក្លឹប
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeChange('EXTERNAL')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      applicantType === 'EXTERNAL'
                        ? 'border-[#F15A24] bg-orange-50/40 ring-1 ring-[#F15A24]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <UserMinus className={`w-5 h-5 shrink-0 ${applicantType === 'EXTERNAL' ? 'text-[#F15A24]' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-bold text-slate-900">អ្នកក្រៅសមាគម (External)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        អត្រាស្តង់ដារ (២% - ៣%) · តម្រូវឱ្យមានទ្រព្យបញ្ចាំ ឬអ្នកធានា
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Member Selection if internal */}
              {applicantType === 'MEMBER' && (
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ជ្រើសរើសឈ្មោះសមាជិក *
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleMemberSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-[#00609C] bg-white text-slate-800"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nameKhmer} ({m.memberCode}) - សន្សំសរុប: ${m.totalSavings.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ឈ្មោះពេញអ្នកខ្ចី *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឈ្មោះខ្មែរ..."
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    លេខទូរស័ព្ទទំនាក់ទំនង *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="012 345 678"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    លេខអត្តសញ្ញាណប័ណ្ណ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="010293847"
                    value={applicantIdCard}
                    onChange={(e) => setApplicantIdCard(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    មុខរបរ / អាជីវកម្ម
                  </label>
                  <input
                    type="text"
                    placeholder="ឧ. ម្ចាស់ហាង, បុគ្គលិក..."
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  អាសយដ្ឋានបច្ចុប្បន្ន *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ផ្ទះលេខ, ផ្លូវ, សង្កាត់, ខណ្ឌ..."
                  value={applicantAddress}
                  onChange={(e) => setApplicantAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                />
              </div>

              {/* Loan Amount & Term */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ចំនួនទឹកប្រាក់ស្នើសុំ ($ USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm focus:outline-none focus:border-[#00609C]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    រយៈពេលសង (ខែ) *
                  </label>
                  <select
                    value={termMonths}
                    onChange={(e) => setTermMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-[#00609C]"
                  >
                    <option value={2}>២ ខែ (2 Months)</option>
                    <option value={3}>៣ ខែ (3 Months)</option>
                    <option value={4}>៤ ខែ (4 Months)</option>
                    <option value={5}>៥ ខែ (5 Months)</option>
                    <option value={6}>៦ ខែ (6 Months)</option>
                    <option value={10}>១០ ខែ (10 Months)</option>
                    <option value={12}>១២ ខែ (12 Months / 1 Year)</option>
                  </select>
                </div>
              </div>

              {/* EDITABLE INTEREST RATE & 3 REPAYMENT METHODS */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-[#00609C]" />
                    <span>អត្រាការប្រាក់ & វិធីសាស្ត្រគណនា (Interest Settings)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">អាចកំណត់ និងកែប្រែដោយសេរី</span>
                </div>

                {/* 1. Editable Interest Rate Input */}
                <div className="space-y-2">
                  <label className="block font-medium text-slate-700">
                    វាយបញ្ចូលអត្រាការប្រាក់ប្រចាំខែ (% / ខែ) *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm text-[#00609C] bg-white focus:outline-none focus:border-[#00609C]"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-semibold">% /ខែ</span>
                    </div>

                    {/* Quick rate preset chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[1.0, 1.2, 1.5, 2.0, 2.5, 3.0].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setInterestRate(rate)}
                          className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                            interestRate === rate
                              ? 'bg-[#00609C] text-white border-[#00609C] font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. 3 Calculation Method Choices */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="block font-medium text-slate-700">
                    ជ្រើសរើសវិធីសាស្ត្រគណនាការប្រាក់ (Repayment Method) *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Method 1: Flat Interest */}
                    <button
                      type="button"
                      onClick={() => setInterestMethod('FLAT')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        interestMethod === 'FLAT'
                          ? 'border-[#00609C] bg-white ring-2 ring-[#00609C]/30 shadow-xs'
                          : 'border-slate-200 bg-white/60 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <Equal className="w-3.5 h-3.5 text-[#00609C]" />
                          <span>ការប្រាក់ថេរ</span>
                        </span>
                        {interestMethod === 'FLAT' && (
                          <span className="w-2 h-2 rounded-full bg-[#00609C]"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-1">
                        ការប្រាក់ស្មើគ្នារាល់ខែ គណនាលើប្រាក់ដើមដំបូង ($ {(requestedAmount * interestRate / 100).toFixed(2)}/ខែ)
                      </p>
                    </button>

                    {/* Method 2: Declining Balance */}
                    <button
                      type="button"
                      onClick={() => setInterestMethod('DECLINING')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        interestMethod === 'DECLINING'
                          ? 'border-emerald-600 bg-white ring-2 ring-emerald-600/30 shadow-xs'
                          : 'border-slate-200 bg-white/60 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ការប្រាក់ថយចុះ</span>
                        </span>
                        {interestMethod === 'DECLINING' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-1">
                        ការប្រាក់ថយចុះរាល់ខែ តាមសមតុល្យប្រាក់ដើមដែលនៅសល់ជាក់ស្តែង
                      </p>
                    </button>

                    {/* Method 3: Interest-Only & Balloon Principal */}
                    <button
                      type="button"
                      onClick={() => setInterestMethod('INTEREST_ONLY')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        interestMethod === 'INTEREST_ONLY'
                          ? 'border-[#F15A24] bg-white ring-2 ring-[#F15A24]/30 shadow-xs'
                          : 'border-slate-200 bg-white/60 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <CalendarCheck className="w-3.5 h-3.5 text-[#F15A24]" />
                          <span>បង់តែការប្រាក់</span>
                        </span>
                        {interestMethod === 'INTEREST_ONLY' && (
                          <span className="w-2 h-2 rounded-full bg-[#F15A24]"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-1">
                        រាល់ខែបង់តែការប្រាក់ ហើយសងប្រាក់ដើមទាំងអស់នៅខែចុងក្រោយ
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  គោលបំណងនៃការខ្ចីប្រាក់ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ពង្រីកដើមទុនហាងលក់គ្រឿងទេស, ទិញសម្ភារ..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                />
              </div>

              {/* Collateral & Guarantor */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="font-semibold text-slate-800">
                  ព័ត៌មានទ្រព្យធានា & អ្នកធានា (Guarantor & Collateral)
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ពិពណ៌នាទ្រព្យបញ្ចាំ / ការធានា *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={applicantType === 'MEMBER' ? 'ធានាដោយប្រាក់សន្សំក្នុងក្លឹប' : 'ឧ. កាតគ្រីម៉ូតូ Honda Dream 2024, ប្លង់ដីទន់...'}
                    value={collateral}
                    onChange={(e) => setCollateral(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      ឈ្មោះអ្នកធានា
                    </label>
                    <input
                      type="text"
                      placeholder="ឈ្មោះអ្នកធានា..."
                      value={guarantorName}
                      onChange={(e) => setGuarantorName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      លេខទូរស័ព្ទអ្នកធានា
                    </label>
                    <input
                      type="text"
                      placeholder="012 xxx xxx"
                      value={guarantorPhone}
                      onChange={(e) => setGuarantorPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      ទំនាក់ទំនង
                    </label>
                    <input
                      type="text"
                      placeholder="ឧ. បងប្អូន, មិត្តភក្តិ, សមាជិក"
                      value={guarantorRelation}
                      onChange={(e) => setGuarantorRelation(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ដាក់ពាក្យស្នើសុំកម្ចី</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel: Live Calculation & Schedule Preview (1 col) */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Calculator className="w-4 h-4 text-[#F15A24]" />
                  <span>ការគណនាកាលវិភាគជាក់ស្តែង</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                  {getMethodLabel(interestMethod)}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ប្រាក់ដើមខ្ចី:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                    ${(requestedAmount || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">អត្រាការប្រាក់កំណត់:</span>
                  <span className="font-mono font-bold text-[#00609C]">
                    {interestRate}% /ខែ
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">រយៈពេលសង:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {termMonths} ខែ
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      {interestMethod === 'INTEREST_ONLY' ? 'បង់ការប្រាក់ខែទី ១:' : 'សរុបត្រូវបង់ខែទី ១:'}
                    </span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      ${previewSchedule[0]?.totalDue.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      {interestMethod === 'INTEREST_ONLY' ? 'សរុបបង់ខែចុងក្រោយ (ដើម+ការ):' : `សរុបត្រូវបង់ខែទី ${termMonths}:`}
                    </span>
                    <span className="font-mono font-bold text-[#F15A24] tabular-nums">
                      ${previewSchedule[previewSchedule.length - 1]?.totalDue.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-600">ការប្រាក់សរុបទាំងអស់:</span>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">
                      +${totalCalculatedInterest.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-900 font-bold">សរុបប្រាក់ត្រូវសងបង្ហើយ:</span>
                    <span className="font-mono font-bold text-[#00609C] text-sm tabular-nums">
                      ${totalCalculatedPayable.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Mini Schedule Preview Table */}
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-700 mb-1.5">
                    មើលជាមុនកាលវិភាគបង់រៀងរាល់ខែ ៖
                  </div>
                  <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-100 text-slate-600 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2">ខែ</th>
                          <th className="py-1.5 px-2 text-right">ដើម</th>
                          <th className="py-1.5 px-2 text-right">ការប្រាក់</th>
                          <th className="py-1.5 px-2 text-right font-bold text-slate-900">សរុប</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {previewSchedule.map((item) => (
                          <tr key={item.installmentNumber} className="hover:bg-slate-50">
                            <td className="py-1.5 px-2 text-slate-700">#{item.installmentNumber}</td>
                            <td className="py-1.5 px-2 text-right text-slate-600">${item.principal.toFixed(2)}</td>
                            <td className="py-1.5 px-2 text-right text-emerald-700">${item.interest.toFixed(2)}</td>
                            <td className="py-1.5 px-2 text-right font-bold text-slate-900">${item.totalDue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl text-xs space-y-2">
              <div className="font-bold text-[#00609C] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>ចំណាំលើវិធីសាស្ត្រគណនា</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                • <strong>ការប្រាក់ថេរ៖</strong> សមស្របសម្រាប់កម្ចីខ្នាតតូចដែលងាយស្រួលចាំចំនួនទឹកប្រាក់បង់ប្រចាំខែ។<br />
                • <strong>ការប្រាក់ថយចុះ៖</strong> យុត្តិធម៌បំផុតសម្រាប់អ្នកខ្ចី ព្រោះការប្រាក់ថយទៅតាមប្រាក់ដើមដែលបានសង។<br />
                • <strong>បង់តែការប្រាក់ & ដើមចុងគ្រា៖</strong> សម្រួលបន្ទុកប្រចាំខែរបស់អ្នកខ្ចី ដោយសងដើមដុលនៅពេលចប់កិច្ចសន្យា។
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Applications Review Queue */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              បញ្ជីពាក្យស្នើសុំកម្ចីរង់ចាំការត្រួតពិនិត្យ និងអនុម័ត
            </h2>
            <span className="text-xs text-slate-500">
              សរុប {applications.length} ពាក្យស្នើសុំ
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                មិនមានពាក្យស្នើសុំកម្ចីណាមួយឡើយ
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {app.applicantName}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        app.applicantType === 'MEMBER'
                          ? 'bg-blue-100 text-[#00609C]'
                          : 'bg-orange-100 text-[#F15A24]'
                      }`}>
                        {app.applicantType === 'MEMBER' ? 'សមាជិកក្នុង' : 'អ្នកក្រៅ'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {getMethodLabel(app.interestMethod || 'DECLINING')}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        app.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : app.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {app.status === 'PENDING' ? 'រង់ចាំអនុម័ត' : app.status === 'APPROVED' ? 'បានអនុម័ត' : 'បានបដិសេធ'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      គោលបំណង: <span className="font-medium text-slate-900">«{app.purpose}»</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>ទូរស័ព្ទ: <span className="font-mono text-slate-700">{app.applicantPhone}</span></span>
                      <span>·</span>
                      <span>ទ្រព្យធានា: <span className="text-slate-700">{app.collateralDescription}</span></span>
                      <span>·</span>
                      <span>អ្នកធានា: <span className="text-slate-700">{app.guarantorName} ({app.guarantorPhone})</span></span>
                      <span>·</span>
                      <span>ថ្ងៃដាក់ពាក្យ: <span className="font-mono">{app.appliedDate}</span></span>
                    </div>

                    {app.notes && (
                      <div className="text-[11px] text-slate-500 italic">
                        កំណត់សម្គាល់: {app.notes}
                      </div>
                    )}
                  </div>

                  {/* Financial Request & Actions */}
                  <div className="flex items-center gap-4 self-end lg:self-center">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">ទឹកប្រាក់ស្នើសុំ</div>
                      <div className="text-base font-bold text-[#00609C] font-mono tabular-nums">
                        ${app.requestedAmount.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {app.proposedTermMonths} ខែ · {app.proposedInterestRate !== undefined ? app.proposedInterestRate : (app.applicantType === 'MEMBER' ? 1.2 : 2.5)}%/ខែ
                      </div>
                    </div>

                    {app.status === 'PENDING' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startReviewApp(app)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ពិនិត្យ & អនុម័ត</span>
                        </button>
                        <button
                          onClick={() => rejectLoanApplication(app.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>បដិសេធ</span>
                        </button>
                      </div>
                    ) : app.status === 'APPROVED' ? (
                      <button
                        onClick={() => setCurrentTab('loans')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#00609C] hover:underline cursor-pointer"
                      >
                        <span>មើលក្នុងបញ្ជីកម្ចី</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Admin Approval Customization Modal */}
      {reviewingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                បញ្ជាក់ការអនុម័តកម្ចី & កំណត់អត្រាការប្រាក់
              </h3>
              <button
                onClick={() => setReviewingAppId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  អត្រាការប្រាក់អនុម័ត (% / ខែ) *
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={adminCustomRate}
                  onChange={(e) => setAdminCustomRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm text-[#00609C] focus:outline-none focus:border-[#00609C]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  វិធីសាស្ត្រគណនាការប្រាក់ *
                </label>
                <select
                  value={adminCustomMethod}
                  onChange={(e) => setAdminCustomMethod(e.target.value as InterestMethod)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#00609C] bg-white font-medium"
                >
                  <option value="DECLINING">ការប្រាក់ថយចុះ (Declining Balance)</option>
                  <option value="FLAT">ការប្រាក់ថេរ (Flat Fixed Interest)</option>
                  <option value="INTEREST_ONLY">បង់តែការប្រាក់ប្រចាំខែ & បង់ដើមចុងគ្រា (Interest-Only Balloon)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100 text-slate-600 text-[11px] leading-relaxed">
                នៅពេលចុចយល់ព្រមអនុម័ត ប្រព័ន្ធនឹងបង្កើតតារាងកាលវិភាគបង់ប្រាក់ កូដកិច្ចសន្យាផ្លូវការ និងដាក់កម្ចីនេះទៅក្នុងបញ្ជីកម្ចីសកម្មដោយស្វ័យប្រវត្តិ។
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewingAppId(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="button"
                  onClick={() => confirmApprove(reviewingAppId)}
                  className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold cursor-pointer"
                >
                  អនុម័តកម្ចីភ្លាមៗ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
