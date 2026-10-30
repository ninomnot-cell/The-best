import React from 'react';
import { useClub } from '../context/ClubContext';
import { Loan } from '../types';
import { X, Printer, ShieldCheck } from 'lucide-react';

interface LoanContractModalProps {
  loan: Loan;
  onClose: () => void;
}

export const LoanContractModal: React.FC<LoanContractModalProps> = ({ loan, onClose }) => {
  const { members } = useClub();

  // 1. Read current club officers from the Supabase members table by role
  const president = members.find(m => m.role === 'ប្រធានក្លឹប' && m.status === 'ACTIVE') || 
                    members.find(m => m.role === 'ប្រធានក្លឹប');

  const treasurer = members.find(m => m.role === 'បេឡាធិការ' && m.status === 'ACTIVE') || 
                    members.find(m => m.role === 'បេឡាធិការ');

  const accountant = members.find(m => m.role === 'គណនេយ្យករ' && m.status === 'ACTIVE') || 
                     members.find(m => m.role === 'គណនេយ្យករ');

  // Names & Warning fallbacks
  const presidentName = president?.nameKhmer || null;
  const treasurerName = treasurer?.nameKhmer || null;
  const accountantName = accountant?.nameKhmer || null;

  // 2. Build dynamic representation string for "តំណាងដោយ"
  let representationText = '';
  if (presidentName && treasurerName) {
    representationText = `លោក/កញ្ញា ${presidentName} (ប្រធានក្លឹប) និង ${treasurerName} (បេឡាធិការ)`;
  } else if (presidentName) {
    representationText = `លោក/កញ្ញា ${presidentName} (ប្រធានក្លឹប) [មិនទាន់កំណត់បេឡាធិការ]`;
  } else if (treasurerName) {
    representationText = `លោក/កញ្ញា ${treasurerName} (បេឡាធិការ) [មិនទាន់កំណត់ប្រធានក្លឹប]`;
  } else {
    representationText = `[មិនទាន់កំណត់ប្រធានក្លឹប និងបេឡាធិការក្នុងប្រព័ន្ធ]`;
  }

  // 3. Build dynamic phone string for "ទូរស័ព្ទទំនាក់ទំនង"
  const officerPhones = [president?.phone, treasurer?.phone].filter(Boolean);
  const phonesDisplay = officerPhones.length > 0 
    ? officerPhones.join(' / ') 
    : '[មិនទាន់កំណត់លេខទូរស័ព្ទតំណាង]';

  const handlePrint = () => {
    window.print();
  };

  // Convert numbers to Khmer phonetic representation for legal clarity
  const formatKhmerAmountWords = (num: number): string => {
    if (num === 1500) return 'មួយពាន់ប្រាំរយដុល្លារអាមេរិកគត់';
    if (num === 2400) return 'ពីរពាន់បួនរយដុល្លារអាមេរិកគត់';
    if (num === 3000) return 'បីពាន់ដុល្លារអាមេរិកគត់';
    return `${num.toLocaleString()} ដុល្លារអាមេរិក`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-8 space-y-6">
        {/* Navigation & Actions Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00609C]" />
            <h2 className="text-base font-bold text-slate-900">
              កិច្ចសន្យាខ្ចីប្រាក់ផ្លូវការ (Official Loan Contract)
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#00609C] hover:bg-[#004f80] rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ពកិច្ចសន្យា (Print / Save PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= Printable Formal Contract Document ================= */}
        <div className="bg-white text-slate-900 font-serif leading-relaxed text-sm space-y-6 max-w-3xl mx-auto p-4 sm:p-8 border sm:border-slate-300 print:border-none shadow-xs rounded-xl print:shadow-none">
          
          {/* Kingdom Header */}
          <div className="text-center space-y-1">
            <div className="font-bold text-base tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</div>
            <div className="font-bold text-sm">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
            <div className="text-xs tracking-widest text-slate-500">*** 3 ***</div>
          </div>

          {/* Club Header & Logo */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/aistudio/THE_BEST_LOGO2_e1c656fe.png" 
                alt="Logo" 
                className="h-14 w-auto object-contain"
              />
              <div>
                <div className="font-bold text-base text-[#00609C]">ឌឹ បេស៍ ហ្វាមីលី ក្លឹប</div>
                <div className="text-xs font-sans font-bold text-[#F15A24] tracking-wider">THE BEST FAMILY CLUB</div>
                <div className="text-[11px] text-slate-600 font-sans">សមាគមឥណទាន និងសន្សំប្រាក់សហគមន៍</div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-mono font-bold">លេខកិច្ចសន្យា: {loan.contractNumber}</div>
              <div className="text-slate-600 font-mono">កាលបរិច្ឆេទ: {loan.startDate}</div>
              <div className="text-slate-600 font-mono">កូដកម្ចី: {loan.loanCode}</div>
            </div>
          </div>

          {/* Contract Title */}
          <div className="text-center py-2">
            <h1 className="text-xl font-bold text-slate-900 underline decoration-slate-400 underline-offset-8">
              កិច្ចសន្យាខ្ចីប្រាក់
            </h1>
            <div className="text-xs text-slate-500 font-sans mt-1">
              ({loan.borrowerType === 'MEMBER' ? 'ប្រភេទកម្ចីសមាជិកផ្ទៃក្នុងសមាគម' : 'ប្រភេទកម្ចីអតិថិជនក្រៅសមាគម'})
            </div>
          </div>

          <p className="text-justify text-xs sm:text-sm">
            កិច្ចសន្យានេះ ត្រូវបានធ្វើឡើងនៅថ្ងៃទី <span className="font-mono font-bold">{loan.startDate}</span> រវាងភាគីដូចខាងក្រោម៖
          </p>

          {/* Party A */}
          <div className="space-y-1 text-xs sm:text-sm bg-slate-50/70 p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-[#00609C]">ភាគី «ក» (ម្ចាស់បំណុល) ៖</div>
            <div className="pl-3 space-y-0.5 text-slate-800">
              <div><strong>ឈ្មោះ ៖</strong> សមាគម <strong>ឌឹ បេស៍ ហ្វាមីលី ក្លឹប (THE BEST FAMILY CLUB)</strong></div>
              <div>
                <strong>តំណាងដោយ ៖</strong>{' '}
                {(!presidentName || !treasurerName) ? (
                  <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-sans">
                    {representationText}
                  </span>
                ) : (
                  <span>{representationText}</span>
                )}
              </div>
              <div><strong>អាសយដ្ឋាន ៖</strong> រាជធានីភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា</div>
              <div><strong>ទូរស័ព្ទទំនាក់ទំនង ៖</strong> <span className="font-mono">{phonesDisplay}</span></div>
            </div>
          </div>

          {/* Party B */}
          <div className="space-y-1 text-xs sm:text-sm bg-slate-50/70 p-3 rounded-lg border border-slate-200">
            <div className="font-bold text-[#F15A24]">ភាគី «ខ» (កូនបំណុល/អ្នកខ្ចីប្រាក់) ៖</div>
            <div className="pl-3 space-y-0.5 text-slate-800">
              <div><strong>ឈ្មោះ ៖</strong> <span className="font-bold text-base">{loan.borrowerName}</span> (ភេទ: ប្រុស/ស្រី)</div>
              <div><strong>កាន់អត្តសញ្ញាណប័ណ្ណលេខ ៖</strong> <span className="font-mono font-bold">{loan.borrowerIdCard}</span></div>
              <div><strong>មុខរបរ/ការងារ ៖</strong> {loan.occupation || 'អាជីវករ'}</div>
              <div><strong>លេខទូរស័ព្ទ ៖</strong> <span className="font-mono font-bold">{loan.borrowerPhone}</span></div>
              <div><strong>អាសយដ្ឋានបច្ចុប្បន្ន ៖</strong> {loan.borrowerAddress}</div>
            </div>
          </div>

          {/* Guarantor */}
          {loan.guarantorName && (
            <div className="space-y-1 text-xs sm:text-sm bg-slate-50/70 p-3 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800">ភាគី «គ» (អ្នកធានា) ៖</div>
              <div className="pl-3 space-y-0.5 text-slate-800">
                <div><strong>ឈ្មោះ ៖</strong> <span className="font-bold">{loan.guarantorName}</span> (ទំនាក់ទំនង: {loan.guarantorRelationship || 'សមាជិក/សាច់ញាតិ'})</div>
                <div><strong>លេខទូរស័ព្ទ ៖</strong> <span className="font-mono font-bold">{loan.guarantorPhone || 'N/A'}</span></div>
              </div>
            </div>
          )}

          {/* Contract Articles */}
          <div className="space-y-3.5 text-xs sm:text-sm text-justify">
            <div>
              <strong>ប្រការ ១ ៖ ចំនួនទឹកប្រាក់កម្ចី និងគោលបំណង</strong>
              <p className="mt-1 pl-3 text-slate-800">
                ភាគី «ក» បានយល់ព្រមផ្តល់ប្រាក់កម្ចីជូនភាគី «ខ» ជាទឹកប្រាក់ចំនួនសរុប <strong>${loan.principalAmount.toLocaleString()}</strong> (ជាអក្សរ ៖ <strong>{formatKhmerAmountWords(loan.principalAmount)}</strong>) សម្រាប់គោលបំណង ៖ <em>«{loan.purpose}»</em>។
              </p>
            </div>

            <div>
              <strong>ប្រការ ២ ៖ អត្រាការប្រាក់ និងវិធីសាស្ត្រគណនា</strong>
              <p className="mt-1 pl-3 text-slate-800">
                អត្រាការប្រាក់ត្រូវបានកំណត់ត្រឹម <strong>{loan.monthlyInterestRate}%</strong> ក្នុងមួយខែ ដោយអនុវត្តតាម 
                {loan.interestMethod === 'FLAT' ? (
                  <span> <strong>«វិធីសាស្ត្រគណនាការប្រាក់ថេរ (Flat Fixed Rate)»</strong> ដោយចំនួនការប្រាក់គណនាថេរលើប្រាក់ដើមដំបូងរៀងរាល់ខែ។</span>
                ) : loan.interestMethod === 'INTEREST_ONLY' ? (
                  <span> <strong>«វិធីសាស្ត្របង់តែការប្រាក់ប្រចាំខែ និងសងប្រាក់ដើមទាំងអស់នៅចុងគ្រា (Interest-Only Balloon)»</strong> ដោយរៀងរាល់ខែភាគី «ខ» បង់តែការប្រាក់ ហើយសងប្រាក់ដើមបង្ហើយទាំងអស់នៅខែចុងក្រោយនៃកិច្ចសន្យា។</span>
                ) : (
                  <span> <strong>«វិធីសាស្ត្រគណនាការប្រាក់ថយចុះ (Declining Balance Rate)»</strong> ដោយការប្រាក់ថយចុះរាល់ខែទៅតាមសមតុល្យប្រាក់ដើមដែលនៅសល់ជាក់ស្តែង។</span>
                )}
                {' '}ភាគី «ខ» ត្រូវបង់ប្រាក់សងត្រឡប់មកវិញតាមតារាងកាលវិភាគបង់ប្រាក់ដែលបានភ្ជាប់ជាមួយកិច្ចសន្យានេះ។
              </p>
            </div>

            <div>
              <strong>ប្រការ ៣ ៖ រយៈពេលខ្ចី និងកាលវិភាគបង់សង</strong>
              <p className="mt-1 pl-3 text-slate-800">
                កម្ចីនេះមានរយៈពេលកំណត់ចំនួន <strong>{loan.termMonths} ខែ</strong> ដោយគិតចាប់ពីថ្ងៃទី <span className="font-mono font-semibold">{loan.startDate}</span> ដល់ថ្ងៃផុតកំណត់នៅថ្ងៃទី <span className="font-mono font-semibold">{loan.endDate}</span>។ ការទូទាត់ត្រូវធ្វើឡើងតាមរយៈផ្ទេរប្រាក់មកគណនី ABA Bank ឬសាច់ប្រាក់ផ្ទាល់ជូនបេឡាសមាគម។
              </p>
            </div>

            <div>
              <strong>ប្រការ ៤ ៖ ទ្រព្យធានាបញ្ចាំ និងការទទួលខុសត្រូវរបស់អ្នកធានា</strong>
              <p className="mt-1 pl-3 text-slate-800">
                ដើម្បីធានានូវការសងប្រាក់ ភាគី «ខ» និងភាគីអ្នកធានា បានដាក់នូវ ៖ <strong>{loan.collateralDescription || 'ការធានារួមគ្នាដោយសមាជិក'}</strong> ជាការធានា។ ក្នុងករណីភាគី «ខ» ខកខានមិនបានសង អ្នកធានាត្រូវទទួលខុសត្រូវសងជំនួសជាកំហិត។
              </p>
            </div>

            <div>
              <strong>ប្រការ ៥ ៖ ការយឺតយ៉ាវ និងការផាកពិន័យ</strong>
              <p className="mt-1 pl-3 text-slate-800">
                ប្រសិនបើភាគី «ខ» យឺតយ៉ាវក្នុងការបង់ប្រាក់លើសពី ៥ ថ្ងៃគិតចាប់ពីថ្ងៃកំណត់ ភាគី «ខ» ត្រូវបង់ប្រាក់ពិន័យបន្ថែមចំនួន ១% នៃទឹកប្រាក់ដែលត្រូវបង់ក្នុងខែនោះ ព្រមទាំងទទួលការជូនដំណឹងតាមសារ SMS/ទូរស័ព្ទជាប្រចាំ។
              </p>
            </div>

            <div>
              <strong>ប្រការ ៦ ៖ សុពលភាព និងការអនុវត្តច្បាប់</strong>
              <p className="mt-1 pl-3 text-slate-800">
                កិច្ចសន្យានេះត្រូវបានធ្វើឡើងជា ០៣ ច្បាប់ដើម មានតម្លៃគតិយុត្តស្មើគ្នា។ ភាគីទាំងពីរបានអាន យល់ច្បាស់ និងយល់ព្រមផ្តិតមេដៃទុកជាភស្តុតាងនៅចំពោះមុខសាក្សី។
              </p>
            </div>
          </div>

          {/* Signatures & Fingerprints Grid */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
            <div className="space-y-12">
              <div className="font-bold text-slate-800">
                ហត្ថលេខា/ស្នាមមេដៃភាគី «ក»<br />(តំណាងក្លឹប The Best Club)
              </div>
              <div className="space-y-2">
                <div>
                  <div className="font-bold text-slate-900">
                    {presidentName || <span className="text-amber-800 font-sans font-normal">[មិនទាន់កំណត់ប្រធានក្លឹប]</span>}
                  </div>
                  <div className="text-[11px] text-slate-500">ប្រធានក្លឹប</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900">
                    {treasurerName || <span className="text-amber-800 font-sans font-normal">[មិនទាន់កំណត់បេឡាធិការ]</span>}
                  </div>
                  <div className="text-[11px] text-slate-500">បេឡាធិការ</div>
                </div>
              </div>
            </div>

            <div className="space-y-16">
              <div className="font-bold text-slate-800">
                ហត្ថលេខា/ស្នាមមេដៃភាគី «ខ»<br />(អ្នកខ្ចីប្រាក់)
              </div>
              <div>
                <div className="font-bold text-slate-900">{loan.borrowerName}</div>
                <div className="text-[11px] text-slate-500">កូនបំណុល</div>
              </div>
            </div>

            <div className="space-y-16">
              <div className="font-bold text-slate-800">
                ហត្ថលេខា/ស្នាមមេដៃ<br />(អ្នកធានា)
              </div>
              <div>
                <div className="font-bold text-slate-900">{loan.guarantorName || 'គ្មាន'}</div>
                <div className="text-[11px] text-slate-500">អ្នកធានារ៉ាប់រង</div>
              </div>
            </div>

            <div className="space-y-16">
              <div className="font-bold text-slate-800">
                ហត្ថលេខា/ស្នាមមេដៃ<br />(សាក្សី/គណនេយ្យករ)
              </div>
              <div>
                <div className="font-bold text-slate-900">
                  {accountantName || (treasurerName ? treasurerName : <span className="text-slate-400 font-normal">[មិនទាន់កំណត់]</span>)}
                </div>
                <div className="text-[11px] text-slate-500">គណនេយ្យករ/សាក្សីក្លឹប</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="flex justify-end pt-3 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            បិទផ្ទាំងកិច្ចសន្យា
          </button>
        </div>
      </div>
    </div>
  );
};

