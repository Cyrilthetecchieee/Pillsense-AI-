import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scan,
  Database,
  ShieldAlert,
  Sparkles,
  BotMessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  UploadCloud,
  Layers,
  History
} from 'lucide-react';
import { useScanStore } from '../store/scanStore';
import { SEED_MEDICINES } from '../data/seedMedicines';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectImage, startAnalysis } = useScanStore();

  const handleLaunchDemo = async (medicineKey: string) => {
    // Generate deterministic demo canvas
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;

    if (medicineKey === 'tylenol') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#CC0000';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('TYLENOL 500', 70, 155);
    } else if (medicineKey === 'advil') {
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 0, 300, 300);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('ADVIL', 105, 155);
    } else {
      // Blurry / dark poor quality
      ctx.fillStyle = '#222222';
      ctx.fillRect(0, 0, 300, 300);
    }

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `demo-${medicineKey}.jpg`, { type: 'image/jpeg' });
        await selectImage(file);
        navigate('/detect');
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-900 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-elevated">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Preliminary AI Medicine Recognition
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
            PillSense AI – Preliminary Medicine Identification
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            AI-assisted medicine identification using CNN visual recognition, surface imprint OCR, and intelligent reference retrieval backed by Google Firebase.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/detect')}
              className="px-5 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-medium text-xs md:text-sm rounded-xl flex items-center gap-2 shadow-md transition-colors"
            >
              <Scan className="w-4 h-4" />
              Scan a Medicine Now
            </button>
            <button
              type="button"
              onClick={() => navigate('/database')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs md:text-sm rounded-xl flex items-center gap-2 border border-white/20 transition-colors"
            >
              <Database className="w-4 h-4" />
              Browse Reference Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Live System Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-card border border-brand-border p-4 shadow-subtle space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Reference Database</span>
            <Database className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="text-2xl font-extrabold text-brand-navy">{SEED_MEDICINES.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Verified clinical formulations</div>
        </div>

        <div className="bg-white rounded-card border border-brand-border p-4 shadow-subtle space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Active Vision Engine</span>
            <Layers className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="text-2xl font-extrabold text-brand-navy">v1.0</div>
          <div className="text-[11px] text-slate-400">Calibrated Softmax (T=1.2)</div>
        </div>

        <div className="bg-white rounded-card border border-brand-border p-4 shadow-subtle space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Imprint OCR Engine</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-brand-navy">Worker</div>
          <div className="text-[11px] text-slate-400">Tesseract.js Engine</div>
        </div>

        <div className="bg-white rounded-card border border-brand-border p-4 shadow-subtle space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Safety Rule Posture</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">Strict</div>
          <div className="text-[11px] text-slate-400">Zero Clinical Fabrication</div>
        </div>
      </div>

      {/* Quick Test Demo Cases */}
      <div className="bg-white rounded-card border border-brand-border p-6 shadow-subtle space-y-4">
        <div>
          <h2 className="text-base font-bold text-brand-navy">Quick Demonstration Cases</h2>
          <p className="text-xs text-slate-500">
            Select a deterministic scenario to preview end-to-end pipeline execution:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => handleLaunchDemo('tylenol')}
            className="p-4 rounded-xl border border-slate-200 hover:border-brand-blue bg-slate-50 hover:bg-blue-50/30 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Acetaminophen 500 mg</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                HIGH MATCH
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Clear white tablet with red debossed imprint "TYLENOL 500". Strong visual and text agreement.
            </p>
            <div className="text-xs font-semibold text-brand-blue group-hover:underline flex items-center gap-1 pt-1">
              Load Case <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => handleLaunchDemo('advil')}
            className="p-4 rounded-xl border border-slate-200 hover:border-brand-blue bg-slate-50 hover:bg-blue-50/30 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Ibuprofen 200 mg</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                HIGH MATCH
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Brown round coated tablet with imprinted "ADVIL" imprint.
            </p>
            <div className="text-xs font-semibold text-brand-blue group-hover:underline flex items-center gap-1 pt-1">
              Load Case <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div
            onClick={() => handleLaunchDemo('dark')}
            className="p-4 rounded-xl border border-slate-200 hover:border-brand-blue bg-slate-50 hover:bg-blue-50/30 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span>Low-Light / OOD Specimen</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                SAFE FAIL
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Dark underexposed image triggering the safe-fail screen and next-step pharmacist guidance.
            </p>
            <div className="text-xs font-semibold text-brand-blue group-hover:underline flex items-center gap-1 pt-1">
              Load Case <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
