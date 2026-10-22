import { create } from 'zustand';
import {
  ScanRecord,
  ImageQualityMetrics,
  PreprocessingLog,
  CNNPredictionResult,
  OCRResult,
  FusionEvidence,
  MedicineRecord,
  ScanOverallStatus
} from '../types';
import { analyzeImageQuality } from '../services/qualityService';
import { preprocessImage, createThumbnail } from '../services/imageService';
import { cnnService } from '../services/cnnService';
import { ocrService } from '../services/ocrService';
import { fuseEvidence } from '../services/fusionService';
import { medicineService } from '../services/medicineService';
import { assistantService } from '../services/assistantService';
import { historyService } from '../services/historyService';

export type ScanStage =
  | 'IDLE'
  | 'IMAGE_SELECTED'
  | 'VALIDATING'
  | 'PREPROCESSING'
  | 'CNN_ANALYSIS'
  | 'OCR_ANALYSIS'
  | 'DATABASE_LOOKUP'
  | 'AI_PROCESSING'
  | 'COMPLETED'
  | 'LOW_CONFIDENCE'
  | 'FAILED';

export interface StageDuration {
  validating?: number;
  preprocessing?: number;
  cnn?: number;
  ocr?: number;
  lookup?: number;
  ai?: number;
}

interface ScanStoreState {
  stage: ScanStage;
  currentProgress: number; // 0 - 100
  selectedFile: File | null;
  previewUrl: string | null;
  processedUrl: string | null;
  qualityMetrics: ImageQualityMetrics | null;
  preprocessingLog: PreprocessingLog | null;
  cnnResult: CNNPredictionResult | null;
  ocrResult: OCRResult | null;
  fusionEvidence: FusionEvidence | null;
  matchedMedicine: MedicineRecord | null;
  aiExplanation: string | null;
  errorMessage: string | null;
  currentScanRecord: ScanRecord | null;
  stageDurations: StageDuration;
  abortController: AbortController | null;

  // Actions
  selectImage: (file: File) => Promise<void>;
  startAnalysis: (userId?: string, isDemo?: boolean) => Promise<void>;
  cancelAnalysis: () => void;
  resetScan: () => void;
  loadSavedScan: (scan: ScanRecord) => void;
}

export const useScanStore = create<ScanStoreState>((set, get) => ({
  stage: 'IDLE',
  currentProgress: 0,
  selectedFile: null,
  previewUrl: null,
  processedUrl: null,
  qualityMetrics: null,
  preprocessingLog: null,
  cnnResult: null,
  ocrResult: null,
  fusionEvidence: null,
  matchedMedicine: null,
  aiExplanation: null,
  errorMessage: null,
  currentScanRecord: null,
  stageDurations: {},
  abortController: null,

  selectImage: async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      set({
        errorMessage: 'Unsupported file format. Please upload a JPG, PNG, or WEBP image.',
        stage: 'FAILED'
      });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      set({
        errorMessage: 'File size exceeds 8 MB limit. Please select a smaller photo.',
        stage: 'FAILED'
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    set({
      selectedFile: file,
      previewUrl,
      stage: 'IMAGE_SELECTED',
      currentProgress: 10,
      errorMessage: null
    });

    // Run quick pre-check on quality
    const img = new Image();
    img.src = previewUrl;
    img.onload = async () => {
      try {
        const quality = await analyzeImageQuality(img);
        set({ qualityMetrics: quality, currentProgress: 15 });
      } catch (err) {
        console.warn('Pre-quality check error:', err);
      }
    };
  },

  startAnalysis: async (userId: string = 'guest', isDemo: boolean = false) => {
    const { previewUrl, qualityMetrics } = get();
    if (!previewUrl) return;

    const controller = new AbortController();
    set({
      stage: 'VALIDATING',
      currentProgress: 20,
      errorMessage: null,
      abortController: controller
    });

    const totalStartTime = performance.now();
    const durations: StageDuration = {};

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image buffer.'));
      });

      if (controller.signal.aborted) return;

      // 1. Stage: Validation & Quality
      const valStart = performance.now();
      const currentQuality = qualityMetrics || (await analyzeImageQuality(img));
      durations.validating = Math.round(performance.now() - valStart);
      set({ qualityMetrics: currentQuality, currentProgress: 30 });

      // 2. Stage: Preprocessing
      set({ stage: 'PREPROCESSING' });
      const preStart = performance.now();
      const preprocessed = await preprocessImage(img);
      durations.preprocessing = Math.round(performance.now() - preStart);
      set({
        processedUrl: preprocessed.displayUrl,
        preprocessingLog: preprocessed.log,
        currentProgress: 45
      });

      if (controller.signal.aborted) return;

      // 3. Stage: CNN Analysis
      set({ stage: 'CNN_ANALYSIS' });
      const cnnStart = performance.now();
      const cnnRes = await cnnService.predict(preprocessed.processedCanvas);
      durations.cnn = Math.round(performance.now() - cnnStart);
      set({ cnnResult: cnnRes, currentProgress: 60 });

      if (controller.signal.aborted) return;

      // 4. Stage: OCR Analysis
      set({ stage: 'OCR_ANALYSIS' });
      const ocrStart = performance.now();
      const ocrRes = await ocrService.recognize(preprocessed.ocrCanvas);
      durations.ocr = Math.round(performance.now() - ocrStart);
      set({ ocrResult: ocrRes, currentProgress: 75 });

      if (controller.signal.aborted) return;

      // 5. Stage: Database Lookup & Matching
      set({ stage: 'DATABASE_LOOKUP' });
      const lookupStart = performance.now();
      const allMeds = await medicineService.getAllMedicines();
      
      // Match candidate by CNN class
      const cnnMatchedMed = allMeds.find(m => m.classLabel === cnnRes.predictedClass) || null;
      
      // Match candidate by OCR text tokens
      let ocrMatchedMed: MedicineRecord | null = null;
      if (ocrRes.cleanText.length >= 2) {
        const ocrSearch = await medicineService.searchMedicines(ocrRes.cleanText, 1);
        if (ocrSearch.length > 0) {
          ocrMatchedMed = ocrSearch[0];
        }
      }

      const ocrMatchesCnn = Boolean(
        cnnMatchedMed &&
        ocrMatchedMed &&
        cnnMatchedMed.id === ocrMatchedMed.id
      );

      const ocrMatchesOther = Boolean(
        ocrMatchedMed &&
        (!cnnMatchedMed || cnnMatchedMed.id !== ocrMatchedMed.id)
      );

      // Deterministic Fusion
      const fusion = fuseEvidence({
        cnnConfidence: cnnRes.confidence,
        predictedClass: cnnRes.predictedClass,
        ocrConfidence: ocrRes.confidence,
        hasOcrText: ocrRes.status === 'SUCCESS' && ocrRes.cleanText.length > 0,
        ocrMatchesCnnClass: ocrMatchesCnn,
        ocrMatchesAnyOtherDb: ocrMatchesOther,
        dbMatchFound: Boolean(cnnMatchedMed || ocrMatchedMed),
        qualityMetrics: currentQuality
      });

      durations.lookup = Math.round(performance.now() - lookupStart);
      set({ fusionEvidence: fusion, currentProgress: 88 });

      // Determine final matched medicine
      let finalMed: MedicineRecord | null = null;
      if (fusion.status === 'HIGH' || fusion.status === 'MODERATE') {
        finalMed = cnnMatchedMed || ocrMatchedMed;
      } else if (fusion.status === 'LOW') {
        finalMed = cnnMatchedMed || ocrMatchedMed;
      }

      if (controller.signal.aborted) return;

      // 6. Stage: AI Processing / Explanation
      set({ stage: 'AI_PROCESSING' });
      const aiStart = performance.now();
      const explanationRes = await assistantService.askAssistant({
        userPrompt: "Explain in two concise sentences why this medicine was matched or inconclusive based strictly on visual and text evidence.",
        scanContext: {
          cnn: cnnRes,
          ocr: ocrRes,
          fusion,
          quality: currentQuality,
          overallStatus: fusion.status
        },
        medicineRecord: finalMed
      });
      durations.ai = Math.round(performance.now() - aiStart);

      const totalDuration = Math.round(performance.now() - totalStartTime);

      // Create thumbnail for fast persistence
      const thumb = createThumbnail(preprocessed.processedCanvas);

      const scanRecord: ScanRecord = {
        id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId,
        createdAt: new Date().toISOString(),
        source: isDemo ? 'demo' : 'upload',
        thumbnailDataUrl: thumb,
        quality: currentQuality,
        preprocessing: preprocessed.log,
        cnn: cnnRes,
        ocr: ocrRes,
        fusion,
        matchedMedicineId: finalMed ? finalMed.id : null,
        matchedMedicine: finalMed,
        overallStatus: fusion.status,
        aiExplanation: explanationRes.answer,
        verification: { status: 'unverified' },
        totalDurationMs: totalDuration,
        isDemo
      };

      // Save scan to history
      await historyService.saveScan(userId, scanRecord);

      const nextStage: ScanStage =
        fusion.status === 'INSUFFICIENT' ? 'LOW_CONFIDENCE' : 'COMPLETED';

      set({
        stage: nextStage,
        currentProgress: 100,
        matchedMedicine: finalMed,
        aiExplanation: explanationRes.answer,
        currentScanRecord: scanRecord,
        stageDurations: durations
      });
    } catch (err: any) {
      if (controller.signal.aborted) {
        set({ stage: 'IMAGE_SELECTED', currentProgress: 15 });
        return;
      }
      set({
        stage: 'FAILED',
        errorMessage: err?.message || 'An unexpected error occurred during scan processing.'
      });
    }
  },

  cancelAnalysis: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({
      stage: 'IMAGE_SELECTED',
      currentProgress: 15,
      abortController: null
    });
  },

  resetScan: () => {
    const { previewUrl } = get();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    set({
      stage: 'IDLE',
      currentProgress: 0,
      selectedFile: null,
      previewUrl: null,
      processedUrl: null,
      qualityMetrics: null,
      preprocessingLog: null,
      cnnResult: null,
      ocrResult: null,
      fusionEvidence: null,
      matchedMedicine: null,
      aiExplanation: null,
      errorMessage: null,
      currentScanRecord: null,
      stageDurations: {},
      abortController: null
    });
  },

  loadSavedScan: (scan: ScanRecord) => {
    set({
      stage: scan.overallStatus === 'INSUFFICIENT' ? 'LOW_CONFIDENCE' : 'COMPLETED',
      currentProgress: 100,
      previewUrl: scan.thumbnailDataUrl || null,
      processedUrl: scan.thumbnailDataUrl || null,
      qualityMetrics: scan.quality,
      preprocessingLog: scan.preprocessing,
      cnnResult: scan.cnn,
      ocrResult: scan.ocr,
      fusionEvidence: scan.fusion,
      matchedMedicine: scan.matchedMedicine || null,
      aiExplanation: scan.aiExplanation || null,
      errorMessage: null,
      currentScanRecord: scan
    });
  }
}));
