import { FusionEvidence, ScanOverallStatus, ImageQualityMetrics } from '../types';

export interface FusionConfig {
  weightVisual: number;
  weightText: number;
  weightDb: number;
  weightQuality: number;
  thresholdHigh: number;
  thresholdModerate: number;
  thresholdLow: number;
  conflictPenalty: number;
}

export const DEFAULT_FUSION_CONFIG: FusionConfig = {
  weightVisual: 0.55,
  weightText: 0.25,
  weightDb: 0.10,
  weightQuality: 0.10,
  thresholdHigh: 0.78,
  thresholdModerate: 0.55,
  thresholdLow: 0.35,
  conflictPenalty: 0.35
};

export interface FusionInputs {
  cnnConfidence: number;        // Calibrated confidence (0.0 to 1.0)
  predictedClass: string;
  ocrConfidence: number;        // (0.0 to 1.0)
  hasOcrText: boolean;
  ocrMatchesCnnClass: boolean;  // Did OCR text match the predicted CNN medicine?
  ocrMatchesAnyOtherDb: boolean;// Did OCR text strongly indicate a DIFFERENT medicine?
  dbMatchFound: boolean;        // Is there a verified or reviewed record in the database?
  qualityMetrics: ImageQualityMetrics;
}

/**
 * Deterministic evidence fusion engine:
 * score = 0.5 * visual + 0.3 * text + 0.1 * dbAgreement + 0.1 * quality
 * Applies hard conflict penalty if visual evidence points to Medicine A while OCR clearly confirms Medicine B.
 * Caps at LOW / INSUFFICIENT when evidence conflicts or is inadequate.
 */
export function fuseEvidence(
  inputs: FusionInputs,
  config: FusionConfig = DEFAULT_FUSION_CONFIG
): FusionEvidence {
  const {
    cnnConfidence,
    predictedClass,
    ocrConfidence,
    hasOcrText,
    ocrMatchesCnnClass,
    ocrMatchesAnyOtherDb,
    dbMatchFound,
    qualityMetrics
  } = inputs;

  // Unknown class automatically caps visual evidence
  const isUnknownClass = predictedClass === 'unknown';
  const effectiveVisualScore = isUnknownClass ? Math.min(cnnConfidence * 0.2, 0.2) : cnnConfidence;

  // Text evidence scoring
  let textScore = 0;
  if (hasOcrText) {
    if (ocrMatchesCnnClass) {
      textScore = Math.max(ocrConfidence, 0.7);
    } else if (ocrMatchesAnyOtherDb) {
      textScore = ocrConfidence;
    } else {
      // Some text detected, but not conclusively matched to catalog
      textScore = ocrConfidence * 0.4;
    }
  }

  // Database match score
  const dbScore = dbMatchFound && !isUnknownClass ? 1.0 : 0.0;

  // Quality score
  const qualityScore = qualityMetrics.score;

  // Conflict detection:
  // If OCR strongly suggests Medicine B, but CNN predicts Medicine A
  const conflict = hasOcrText && ocrMatchesAnyOtherDb && !ocrMatchesCnnClass;
  const conflictReason = conflict
    ? 'Conflicting evidence: Detected imprint/text points to a different medicine than visual appearance.'
    : undefined;

  // Weighted base score
  let totalScore =
    config.weightVisual * effectiveVisualScore +
    config.weightText * textScore +
    config.weightDb * dbScore +
    config.weightQuality * qualityScore;

  // Apply penalty for conflict
  if (conflict) {
    totalScore = Math.max(0, totalScore - config.conflictPenalty);
  }

  // Severe quality penalty: if image is critically blurry or dark
  if (qualityMetrics.label === 'POOR') {
    totalScore = Math.min(totalScore, 0.45);
  }

  const roundedScore = Number(Math.min(Math.max(totalScore, 0.0), 1.0).toFixed(2));

  // Determine Overall Status based on calibrated thresholds
  let status: ScanOverallStatus;
  if (conflict) {
    // When evidence conflicts, never exceed LOW
    status = roundedScore >= config.thresholdLow ? 'LOW' : 'INSUFFICIENT';
  } else if (roundedScore >= config.thresholdHigh && effectiveVisualScore >= 0.75) {
    status = 'HIGH';
  } else if (roundedScore >= config.thresholdModerate && effectiveVisualScore >= 0.50) {
    status = 'MODERATE';
  } else if (roundedScore >= config.thresholdLow) {
    status = 'LOW';
  } else {
    status = 'INSUFFICIENT';
  }

  return {
    visualEvidence: Number(effectiveVisualScore.toFixed(2)),
    textEvidence: Number(textScore.toFixed(2)),
    dbMatch: dbMatchFound,
    conflict,
    conflictReason,
    score: roundedScore,
    status
  };
}
