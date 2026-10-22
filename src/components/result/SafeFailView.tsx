import React from 'react';
import { useScanStore } from '../../store/scanStore';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  HelpCircle,
  Camera,
  RotateCcw,
  Sun,
  FileSearch,
  UserCheck,
  Package
} from 'lucide-react';

export const SafeFailView: React.FC = () => {
  const { currentScanRecord, resetScan } = useScanStore();
  const navigate = useNavigate();

  const handleRetake = () => {
    resetScan();
    navigate('/detect');
  };

  return (
    <div className="bg-white rounded-card border border-brand-border p-6 md:p-8 shadow-subtle max-w-3xl mx-auto space-y-6">
      {/* Header Badge */}
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
        <ShieldAlert className="w-8 h-8 text-amber-600 shrink-0" />
        <div>
          <h2 className="text-lg font-bold">Unable to identify this medicine reliably.</h2>
          <p className="text-xs text-amber-800">
            This is a successful safety outcome. Because evidence was inconclusive or conflicting, PillSense AI refuses to guess a medicine name.
          </p>
        </div>
      </div>

      {/* Breakdown of Inconclusive Evidence */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 text-xs text-slate-700">
        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          Why did this occur?
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>
            <strong>Visual match confidence: </strong>
            {currentScanRecord?.cnn?.confidence
              ? `${Math.round(currentScanRecord.cnn.confidence * 100)}% (below definitive threshold)`
              : 'Low / Inconclusive'}
          </li>
          <li>
            <strong>Text imprint: </strong>
            {currentScanRecord?.ocr?.cleanText
              ? `"${currentScanRecord.ocr.cleanText}" (did not cleanly match catalog entry)`
              : 'No legible text or imprint detected'}
          </li>
          {currentScanRecord?.fusion.conflict && (
            <li className="text-rose-600 font-semibold">
              Evidence Conflict: {currentScanRecord.fusion.conflictReason}
            </li>
          )}
        </ul>
      </div>

      {/* Actionable Next Steps */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-brand-navy">Recommended Next Steps</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
            <Camera className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-800">Photograph Both Sides</div>
              <div className="text-slate-500 text-[11px]">Many tablets carry distinct imprint codes on either side.</div>
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
            <Sun className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-800">Improve Direct Lighting</div>
              <div className="text-slate-500 text-[11px]">Eliminate shadows and glare to clarify engraved debossing.</div>
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
            <Package className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-800">Include Packaging / Blister Pack</div>
              <div className="text-slate-500 text-[11px]">Packaging foil and labels provide definitive NDC text.</div>
            </div>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-800">Consult a Pharmacist</div>
              <div className="text-slate-500 text-[11px]">Never take unknown medicines. Have a registered pharmacist inspect the specimen.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleRetake}
          className="flex-1 py-2.5 px-4 bg-brand-blue hover:bg-blue-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Retake or Upload Another Photo
        </button>
        <button
          type="button"
          onClick={() => navigate('/database')}
          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <FileSearch className="w-4 h-4" />
          Browse Reference Catalog
        </button>
      </div>
    </div>
  );
};
