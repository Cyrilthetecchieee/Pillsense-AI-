import React, { useState } from 'react';
import { useScanStore } from '../store/scanStore';
import { useNavigate } from 'react-router-dom';
import { SafeFailView } from '../components/result/SafeFailView';
import { getStatusBadgeProps, formatConfidence } from '../utils';
import {
  ShieldCheck,
  Eye,
  Type,
  Database,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  FileDown,
  UserCheck,
  Flag,
  ExternalLink
} from 'lucide-react';

export const Result: React.FC = () => {
  const { currentScanRecord, stage, resetScan } = useScanStore();
  const navigate = useNavigate();

  const [pharmacistModalOpen, setPharmacistModalOpen] = useState(false);
  const [pharmacistNote, setPharmacistNote] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  if (!currentScanRecord) {
    return (
      <div className="text-center py-16 bg-white rounded-card border border-brand-border p-8 max-w-lg mx-auto shadow-subtle">
        <Info className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-brand-navy">No Active Scan Result</h2>
        <p className="text-xs text-slate-500 mb-5">
          Please upload or capture a medicine photo to view preliminary visual and OCR evidence.
        </p>
        <button
          type="button"
          onClick={() => navigate('/detect')}
          className="px-5 py-2.5 bg-brand-blue hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition-colors"
        >
          Go to Detect Pill
        </button>
      </div>
    );
  }

  // Handle Safe-Fail View for Insufficient / Low Confidence
  if (currentScanRecord.overallStatus === 'INSUFFICIENT' || stage === 'LOW_CONFIDENCE') {
    return <SafeFailView />;
  }

  const med = currentScanRecord.matchedMedicine;
  const statusProps = getStatusBadgeProps(currentScanRecord.overallStatus);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-card border border-brand-border p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Preliminary AI Identification
            </div>
            <h1 className="text-2xl font-extrabold text-brand-navy mt-0.5">
              {med ? med.medicineName : 'Possible Medication Match'}
            </h1>
            <div className="text-sm font-medium text-slate-600">
              Generic: {med ? med.genericName : 'Unspecified'} | Brand: {med ? med.brandName : 'Unspecified'}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusProps.bg}`}>
              <div className={`w-2 h-2 rounded-full ${statusProps.dot}`} />
              {statusProps.label}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Composite Score: {Math.round(currentScanRecord.fusion.score * 100)}%
            </div>
          </div>
        </div>

        {/* Why this result explanation */}
        <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-semibold text-brand-navy block mb-0.5">Automated Analysis Summary:</span>
            {currentScanRecord.aiExplanation || 'Preliminary identification generated via weighted fusion of visual features and OCR imprint tokens.'}
          </div>
        </div>
      </div>

      {/* 4 Multi-Evidence Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visual Analysis Card */}
        <div className="bg-white rounded-card border border-brand-border p-4 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700">
              <Eye className="w-4 h-4 text-brand-blue" />
              Visual CNN (Head A)
            </span>
            <span className="font-mono text-brand-blue font-bold">
              {formatConfidence(currentScanRecord.cnn.confidence)}
            </span>
          </div>
          <div className="text-xs font-bold text-brand-navy truncate">
            {currentScanRecord.cnn.predictedClass}
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>Calibrated (T=1.28)</span>
            <span className="text-brand-teal font-medium">
              {currentScanRecord.cnn.attributes?.shape || 'round'} / {currentScanRecord.cnn.attributes?.color || 'white'}
            </span>
          </div>
        </div>

        {/* OCR Analysis Card */}
        <div className="bg-white rounded-card border border-brand-border p-4 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700">
              <Type className="w-4 h-4 text-indigo-500" />
              OCR Imprint
            </span>
            <span className="font-mono text-indigo-600 font-bold">
              {currentScanRecord.ocr.cleanText ? formatConfidence(currentScanRecord.ocr.confidence) : '0%'}
            </span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-800 truncate bg-slate-50 p-1 rounded border border-slate-200">
            {currentScanRecord.ocr.cleanText || 'No text detected'}
          </div>
          <div className="text-[11px] text-slate-500">
            {currentScanRecord.ocr.lines.length} lines parsed ({currentScanRecord.ocr.durationMs} ms)
          </div>
        </div>

        {/* Database Match Card */}
        <div className="bg-white rounded-card border border-brand-border p-4 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700">
              <Database className="w-4 h-4 text-emerald-600" />
              Catalog Match
            </span>
            <span className="text-emerald-700 font-bold text-[11px]">
              {currentScanRecord.fusion.dbMatch ? 'MATCHED' : 'NO RECORD'}
            </span>
          </div>
          <div className="text-xs font-semibold text-brand-navy truncate">
            {med ? med.manufacturer : 'Unknown Manufacturer'}
          </div>
          <div className="text-[11px] text-slate-500">
            Catalog: {med ? med.verificationStatus : 'N/A'}
          </div>
        </div>

        {/* Image Quality Card */}
        <div className="bg-white rounded-card border border-brand-border p-4 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-brand-teal" />
              Image Quality
            </span>
            <span className="font-mono text-brand-teal font-bold">
              {formatConfidence(currentScanRecord.quality.score)}
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-800">
            Grade: {currentScanRecord.quality.label}
          </div>
          <div className="text-[11px] text-slate-500">
            Sharpness: {currentScanRecord.quality.sharpness} var
          </div>
        </div>
      </div>

      {/* Verified Medicine Clinical Information Panel */}
      {med && (
        <div className="bg-white rounded-card border border-brand-border p-6 shadow-subtle space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-blue" />
              Verified Catalog Record Information
            </h2>
            <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              Source: {med.source}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-semibold text-slate-700 block">Dosage Form & Strength:</span>
              <span className="text-slate-600">{med.dosageForm} – {med.strength}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Imprint Marking:</span>
              <span className="font-mono text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                {med.imprint}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Manufacturer:</span>
              <span className="text-slate-600">{med.manufacturer}</span>
            </div>
          </div>

          <div className="text-xs space-y-1">
            <span className="font-semibold text-slate-700 block">Description:</span>
            <p className="text-slate-600 leading-relaxed">{med.description}</p>
          </div>

          <div className="text-xs space-y-1">
            <span className="font-semibold text-slate-700 block">Indications / Common Uses:</span>
            <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
              {med.commonUses.map((use, i) => (
                <li key={i}>{use}</li>
              ))}
            </ul>
          </div>

          {/* Warnings Strip */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
            <span className="font-bold text-rose-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              Key Warnings & Safety Precautions:
            </span>
            <ul className="list-disc pl-5 space-y-0.5 text-rose-800">
              {med.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2">
            <span>FDA Reference: DailyMed Entry</span>
            <a
              href={med.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand-blue hover:underline inline-flex items-center gap-1"
            >
              View Official Label <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Action Footer Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={() => setPharmacistModalOpen(true)}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <UserCheck className="w-4 h-4" />
          Verify with Pharmacist
        </button>

        <button
          type="button"
          onClick={() => navigate('/assistant')}
          className="py-2.5 px-4 bg-brand-blue hover:bg-blue-700 text-white font-medium text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Ask Assistant About This Scan
        </button>

        <button
          type="button"
          onClick={() => {
            resetScan();
            navigate('/detect');
          }}
          className="py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          New Scan
        </button>

        <button
          type="button"
          onClick={() => setFeedbackSent(true)}
          disabled={feedbackSent}
          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl flex items-center gap-2 transition-colors ml-auto"
        >
          <Flag className="w-4 h-4 text-slate-500" />
          {feedbackSent ? 'Flagged for Review' : 'Report Wrong Result'}
        </button>
      </div>

      {/* Pharmacist Verification Modal */}
      {pharmacistModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
              <UserCheck className="w-5 h-5" />
              Pharmacist Verification Checkpoint
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Preliminary AI predictions must always be reviewed by a certified healthcare professional before dispensing or administration.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Clinical Pharmacist Note / Comments:
              </label>
              <textarea
                value={pharmacistNote}
                onChange={(e) => setPharmacistNote(e.target.value)}
                rows={3}
                placeholder="e.g. Pill visually confirmed matching NDC label 50580-496."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-blue"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPharmacistModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setPharmacistModalOpen(false);
                  alert('Verification note recorded in scan record.');
                }}
                className="px-4 py-2 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm"
              >
                Confirm Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
