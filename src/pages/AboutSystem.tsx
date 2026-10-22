import React, { useState } from 'react';
import {
  Info,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Eye,
  Type,
  Database,
  Sparkles,
  ArrowRight,
  GitBranch,
  Languages,
  Mic,
  Smartphone
} from 'lucide-react';

export const AboutSystem: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string>('cnn');

  const MODULE_DETAILS: Record<string, { title: string; desc: string; status: string; tech: string }> = {
    capture: {
      title: 'Image Capture & Sensor Normalization',
      desc: 'Handles getUserMedia live camera streams, orientation normalization, and EXIF orientation correction before processing.',
      status: 'Implemented',
      tech: 'HTML5 MediaDevices + Canvas 2D'
    },
    quality: {
      title: 'Real-time Quality Estimation',
      desc: 'Computes Laplacian kernel variance for motion blur, mean luminance for under/overexposure, and aspect checks.',
      status: 'Implemented',
      tech: 'Discrete 3x3 Laplacian + Luminance Stdev'
    },
    cnn: {
      title: 'Deep Visual Recognition (CNN)',
      desc: 'EfficientNetV2-B0 transfer learning backbone fine-tuned on kaggle pill collections with temperature calibrated softmax.',
      status: 'Implemented (Demo Calibration Mode active)',
      tech: 'TensorFlow.js / SavedModel'
    },
    ocr: {
      title: 'Surface Imprint Extraction (OCR)',
      desc: 'Extracts alphanumeric debossings, scored lines, and NDC codes from tablet surfaces with CLAHE contrast enhancement.',
      status: 'Implemented',
      tech: 'Tesseract.js in Web Worker'
    },
    fusion: {
      title: 'Deterministic Evidence Fusion',
      desc: 'Balances visual evidence, text tokens, catalog presence, and sensor quality. Strongly penalizes conflicting signals.',
      status: 'Implemented & Unit-Tested',
      tech: 'TypeScript Multi-Evidence Engine'
    },
    assistant: {
      title: 'Grounded Safety Assistant',
      desc: 'Explains match evidence and precautions strictly grounded in verified database facts. Refuses diagnostic recommendations.',
      status: 'Implemented & Grounded',
      tech: 'Gemini Flash (Google AI Studio) via Cloud Functions'
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy flex items-center gap-2">
          <Info className="w-6 h-6 text-brand-blue" />
          About PillSense AI System Architecture
        </h1>
        <p className="text-sm text-slate-500">
          Transparent pipeline design, architectural modularity, and clinical non-diagnostic boundaries.
        </p>
      </div>

      {/* Honesty Statement Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          Mandatory Honesty & Regulatory Boundary Statement
        </div>
        <p className="text-xs leading-relaxed text-amber-900">
          PillSense AI is an academic and engineering project intended as an informational, preliminary identification aid. It is <strong>NOT a certified medical device</strong>, has not undergone clinical validation trials, and must <strong>NEVER</strong> replace the consultation, diagnosis, or prescription instructions of a licensed physician or pharmacist. Accuracy metrics describe performance exclusively on specified test benchmarks.
        </p>
      </div>

      {/* Interactive Architecture Flow Diagram */}
      <div className="bg-white rounded-card border border-brand-border p-6 shadow-subtle space-y-4">
        <h2 className="text-base font-bold text-brand-navy">Interactive Architecture Pipeline</h2>
        <p className="text-xs text-slate-500">
          Click any stage of the pipeline to inspect its computational role and implementation status.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 pb-2 border-b border-slate-100">
          {[
            { id: 'capture', label: '1. Capture', icon: Eye },
            { id: 'quality', label: '2. Quality Filter', icon: ShieldCheck },
            { id: 'cnn', label: '3. Visual CNN', icon: Cpu },
            { id: 'ocr', label: '4. OCR Imprints', icon: Type },
            { id: 'fusion', label: '5. Fusion Engine', icon: GitBranch },
            { id: 'assistant', label: '6. AI Assistant', icon: Sparkles }
          ].map((step) => {
            const Icon = step.icon;
            const isSelected = selectedModule === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setSelectedModule(step.id)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Module Detail Card */}
        {selectedModule && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-brand-navy text-sm">
                {MODULE_DETAILS[selectedModule].title}
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {MODULE_DETAILS[selectedModule].status}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {MODULE_DETAILS[selectedModule].desc}
            </p>
            <div className="text-[11px] text-slate-500 font-mono pt-1">
              Technology Stack: {MODULE_DETAILS[selectedModule].tech}
            </div>
          </div>
        )}
      </div>

      {/* Future Enhancements Roadmap */}
      <div className="bg-white rounded-card border border-brand-border p-6 shadow-subtle space-y-4">
        <h2 className="text-base font-bold text-brand-navy">Future Enhancements Roadmap</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <Languages className="w-5 h-5 text-brand-blue" />
            <div className="font-bold text-slate-800">Tamil & Regional Translations</div>
            <p className="text-slate-500 text-[11px]">
              Schema ready with `translations.ta` structure for regional language accessibility.
            </p>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
              Future Enhancement
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <Mic className="w-5 h-5 text-indigo-500" />
            <div className="font-bold text-slate-800">Voice Assistant Interface</div>
            <p className="text-slate-500 text-[11px]">
              Speech-to-text querying for hands-free and elderly patient accessibility.
            </p>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
              Future Enhancement
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <div className="font-bold text-slate-800">Native Mobile App (React Native)</div>
            <p className="text-slate-500 text-[11px]">
              Direct sensor flash control, gyro-assisted macro photography guides.
            </p>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
              Future Enhancement
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <Database className="w-5 h-5 text-brand-teal" />
            <div className="font-bold text-slate-800">Expanded National Drug Formulary</div>
            <p className="text-slate-500 text-[11px]">
              Expanding verified entries from 30 seed medicines to 5,000+ FDA/EMA drug products.
            </p>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
              Future Enhancement
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
