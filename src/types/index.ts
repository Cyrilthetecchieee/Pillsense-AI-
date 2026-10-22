export type VerificationStatus = 'sample' | 'reviewed' | 'verified';

export interface MedicineRecord {
  id: string;
  medicineName: string;
  genericName: string;
  brandName: string;
  imprint: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  description: string;
  commonUses: string[];
  warnings: string[];
  packageKeywords: string[];
  classLabel: string; // Links to CNN model class
  source: string;
  sourceUrl: string;
  verificationStatus: VerificationStatus;
  updatedAt: string;
}

export type ScanSource = 'upload' | 'camera' | 'demo';
export type ScanOverallStatus = 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT';

export interface ImageQualityMetrics {
  brightness: number; // Mean luminance 0-255
  contrast: number;   // Luminance std dev
  sharpness: number;  // Laplacian variance
  resolution: {
    width: number;
    height: number;
  };
  score: number;      // 0.0 - 1.0 composite
  label: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  warnings: string[];
}

export interface PreprocessingLog {
  operations: string[];
  inputDims: { width: number; height: number };
  outputDims: { width: number; height: number };
  durationMs: number;
}

export interface CNNAlternative {
  className: string;
  confidence: number;
  label: string;
}

export type PillShape = 'round' | 'oval' | 'oblong' | 'capsule-shaped' | 'other';
export type PillColor = 'white' | 'yellow' | 'pink' | 'orange' | 'red' | 'blue' | 'green' | 'brown' | 'other';
export type PillForm = 'tablet' | 'capsule' | 'chewable';

export interface ContourAnalysisResult {
  boundingBox: { x: number; y: number; width: number; height: number };
  aspectRatio: number;
  area: number;
  perimeter: number;
}

export interface PillVisualAttributes {
  shape: PillShape;
  color: PillColor;
  form: PillForm;
  shapeConfidence: number;
  colorConfidence: number;
  contourAnalysis: ContourAnalysisResult;
}

export interface CNNPredictionResult {
  predictedClass: string;
  confidence: number; // Calibrated probability
  rawConfidence: number;
  entropy?: number;
  alternatives: CNNAlternative[];
  modelVersion: string;
  modelMode: 'trained' | 'demo';
  durationMs: number;
  attributes?: PillVisualAttributes; // Multi-Task Head B output
}

export interface OCRLine {
  text: string;
  confidence: number;
  bbox?: { x0: number; y0: number; x1: number; y1: number };
}

export interface OCRResult {
  text: string;
  cleanText: string;
  lines: OCRLine[];
  confidence: number;
  status: 'SUCCESS' | 'NO_TEXT' | 'FAILED';
  detectedTokens: string[];
  durationMs: number;
}

export interface FusionEvidence {
  visualEvidence: number;    // 0-1
  textEvidence: number;      // 0-1
  dbMatch: boolean;
  conflict: boolean;
  conflictReason?: string;
  score: number;             // 0-1
  status: ScanOverallStatus;
}

export interface ScanVerification {
  status: 'unverified' | 'pharmacist_confirmed' | 'rejected';
  note?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface ScanRecord {
  id: string;
  userId: string;
  createdAt: string;
  source: ScanSource;
  imagePath?: string;
  thumbnailDataUrl?: string;
  quality: ImageQualityMetrics;
  preprocessing: PreprocessingLog;
  cnn: CNNPredictionResult;
  ocr: OCRResult;
  fusion: FusionEvidence;
  matchedMedicineId: string | null;
  matchedMedicine?: MedicineRecord | null;
  overallStatus: ScanOverallStatus;
  aiExplanation?: string;
  verification: ScanVerification;
  totalDurationMs: number;
  isDemo?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: string;
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'system';
  };
}

export interface ModelRegistryEntry {
  version: string;
  classes: string[];
  metrics: {
    top1: number;
    top3: number;
    macroF1: number;
    ece: number; // Expected Calibration Error
  };
  trainedAt: string;
  datasetSummary: {
    totalImages: number;
    sourceDatasets: number;
    classesCount: number;
  };
  active: boolean;
}
