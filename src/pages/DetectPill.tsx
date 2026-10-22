import React, { useRef, useState, useEffect } from 'react';
import { useScanStore } from '../store/scanStore';
import {
  Upload,
  Camera,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  QrCode,
  Layers
} from 'lucide-react';
import { barcodeService } from '../services/barcodeService';

export const DetectPill: React.FC = () => {
  const {
    stage,
    currentProgress,
    previewUrl,
    processedUrl,
    selectedFile,
    qualityMetrics,
    preprocessingLog,
    selectImage,
    startAnalysis,
    cancelAnalysis,
    resetScan
  } = useScanStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'barcode'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [barcodeText, setBarcodeText] = useState<string | null>(null);

  // Stop camera when unmounting or switching tabs
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      selectImage(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectImage(e.dataTransfer.files[0]);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      setCameraError('Camera access denied or device unavailable. Please upload a photo instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        selectImage(file);
        setActiveTab('upload');
      }
    }, 'image/jpeg', 0.95);
  };

  const isAnalyzing = [
    'VALIDATING',
    'PREPROCESSING',
    'CNN_ANALYSIS',
    'OCR_ANALYSIS',
    'DATABASE_LOOKUP',
    'AI_PROCESSING'
  ].includes(stage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Detect Medicine</h1>
          <p className="text-sm text-slate-500">
            Upload a high-resolution photo or capture live imprints for preliminary visual & OCR analysis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {previewUrl && (
            <button
              type="button"
              onClick={resetScan}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Capture & Preview Section (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-card border border-brand-border p-5 shadow-subtle space-y-5">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('upload'); stopCamera(); }}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('camera'); startCamera(); }}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'camera'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              Live Camera
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('barcode'); stopCamera(); }}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'barcode'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              Package Barcode
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal">
                Experimental
              </span>
            </button>
          </div>

          {/* Active Tab View */}
          {activeTab === 'upload' && !previewUrl && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-brand-blue rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-14 h-14 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-brand-blue mb-4 transition-colors">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-brand-navy mb-1">
                Click to browse or drag and drop a pill image
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Supported formats: PNG, JPG, JPEG, WEBP (Max 8 MB, min 224x224 px)
              </p>
              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 shadow-sm">
                Browse Files
              </div>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="space-y-4">
              {cameraError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{cameraError}</span>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {/* Framing Crosshair Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 border-2 border-brand-teal/80 rounded-2xl border-dashed"></div>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-5 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-medium text-xs rounded-xl shadow-lg flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Frame
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-2.5 bg-white/90 hover:bg-white text-slate-800 font-medium text-xs rounded-xl shadow-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'barcode' && (
            <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 space-y-3 text-center">
              <QrCode className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">Barcode / QR Package Scanner</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Scan UPC, NDC, or EAN barcode from the physical medicine box or bottle. Only verified real decoded values are recorded.
              </p>
              {barcodeText && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-emerald-800">
                  Decoded Barcode: {barcodeText}
                </div>
              )}
            </div>
          )}

          {/* Image Preview & Quality Card */}
          {previewUrl && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center max-h-80">
                <img
                  src={previewUrl}
                  alt="Medicine to identify"
                  className="max-h-80 w-auto object-contain"
                />
              </div>

              {/* Quality & Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Resolution</div>
                  <div className="font-semibold text-slate-700 mt-0.5">
                    {qualityMetrics ? `${qualityMetrics.resolution.width} x ${qualityMetrics.resolution.height}` : 'Reading...'}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Sharpness</div>
                  <div className="font-semibold text-slate-700 mt-0.5">
                    {qualityMetrics ? `${qualityMetrics.sharpness} var` : '...'}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Brightness</div>
                  <div className="font-semibold text-slate-700 mt-0.5">
                    {qualityMetrics ? `${qualityMetrics.brightness} / 255` : '...'}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Quality Grade</div>
                  <div className={`font-semibold mt-0.5 ${
                    qualityMetrics?.label === 'EXCELLENT' ? 'text-emerald-600' :
                    qualityMetrics?.label === 'GOOD' ? 'text-blue-600' :
                    qualityMetrics?.label === 'FAIR' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {qualityMetrics ? qualityMetrics.label : 'Evaluating'}
                  </div>
                </div>
              </div>

              {/* Quality Warnings */}
              {qualityMetrics && qualityMetrics.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Quality Advisory:
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-amber-800">
                    {qualityMetrics.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Pipeline Progress & Action Controller (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-card border border-brand-border p-5 shadow-subtle space-y-5">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Analysis Pipeline</h2>
            <p className="text-xs text-slate-500">
              Deterministic multi-stage verification from raw pixels to fusion match.
            </p>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-slate-600">
              <span>Execution Progress</span>
              <span className="font-mono">{currentProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-blue h-full transition-all duration-300 ease-out"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>

          {/* Live Stages Checklist */}
          <div className="space-y-2.5">
            {[
              { id: 'VALIDATING', label: '1. Image Integrity & Quality Check' },
              { id: 'PREPROCESSING', label: '2. Center Alignment & CLAHE Filter' },
              { id: 'CNN_ANALYSIS', label: '3. Deep Visual Recognition (CNN)' },
              { id: 'OCR_ANALYSIS', label: '4. Surface Imprint Extraction (OCR)' },
              { id: 'DATABASE_LOOKUP', label: '5. Multi-Evidence Catalog Fusion' },
              { id: 'AI_PROCESSING', label: '6. Grounded Safety Explanation' }
            ].map((s) => {
              const stagesOrder = [
                'VALIDATING',
                'PREPROCESSING',
                'CNN_ANALYSIS',
                'OCR_ANALYSIS',
                'DATABASE_LOOKUP',
                'AI_PROCESSING'
              ];
              const currentIndex = stagesOrder.indexOf(stage);
              const thisIndex = stagesOrder.indexOf(s.id);

              const isCompleted = stage === 'COMPLETED' || stage === 'LOW_CONFIDENCE' || (currentIndex > thisIndex);
              const isCurrent = stage === s.id;

              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                    isCurrent
                      ? 'bg-blue-50/80 border-brand-blue text-brand-blue font-semibold'
                      : isCompleted
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'border-transparent text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                    {s.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold tracking-wider uppercase text-brand-blue animate-pulse">
                      Processing
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-2 space-y-2">
            {!isAnalyzing ? (
              <button
                type="button"
                onClick={() => startAnalysis('guest', false)}
                disabled={!previewUrl}
                className="w-full py-3 px-4 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Analyze Medicine
              </button>
            ) : (
              <button
                type="button"
                onClick={cancelAnalysis}
                className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-sm flex items-center justify-center gap-2 border border-rose-200 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancel Analysis
              </button>
            )}
          </div>

          {/* Collapsible Technical Details */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowTechDetails(!showTechDetails)}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-semibold text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-teal" />
                Technical Pipeline Details
              </span>
              {showTechDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showTechDetails && (
              <div className="p-3 bg-white space-y-2 border-t border-slate-200 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-700">Preprocessed Buffer: </span>
                  {preprocessingLog
                    ? `${preprocessingLog.outputDims.width}x${preprocessingLog.outputDims.height} px (${preprocessingLog.durationMs} ms)`
                    : 'Awaiting execution'}
                </div>
                {preprocessingLog && (
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                    {preprocessingLog.operations.map((op, i) => (
                      <li key={i}>{op}</li>
                    ))}
                  </ul>
                )}
                {processedUrl && (
                  <div className="pt-2">
                    <span className="font-semibold text-slate-700 block mb-1">Cropped Model Tensor:</span>
                    <img
                      src={processedUrl}
                      alt="Model preprocessed tensor"
                      className="w-24 h-24 rounded-lg border border-slate-300 object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
