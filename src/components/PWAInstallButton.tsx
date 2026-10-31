import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-sm cursor-pointer animate-pulse"
        title="ដំឡើងកម្មវិធីលើទូរស័ព្ទដៃ (PWA Install)"
      >
        <Download className="w-3.5 h-3.5" />
        <span>ដំឡើងកម្មវិធីទូរស័ព្ទ (Install App)</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#00609C]" />
          <span>ដំឡើងលើ iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#00609C]" />
                  <span>របៀបដំឡើងលើ iPhone / iPad</span>
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>១. ចុចប៊ូតុង <strong>Share (ចែករំលែក)</strong> នៅបាតអេក្រង់ Safari</p>
                <p>២. អូសចុះក្រោម រួចជ្រើសរើស <strong>Add to Home Screen (បន្ថែមទៅអេក្រង់ដើម)</strong></p>
                <p>៣. ចុច <strong>Add (បន្ថែម)</strong> នៅជ្រុងខាងស្តាំលើ</p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                យល់ព្រម
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => {
        alert('សូមប្រើប្រាស់កម្មវិធីរុករក Chrome, Safari ឬ Edge ដើម្បីដំឡើងកម្មវិធីនេះលើទូរស័ព្ទដៃរបស់អ្នក។');
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
      title="ព័ត៌មានដំឡើង PWA"
    >
      <Smartphone className="w-3.5 h-3.5 text-[#00609C]" />
      <span>ដំឡើង App</span>
    </button>
  );
};
