import { describe, it, expect } from 'vitest';
import { fuseEvidence, DEFAULT_FUSION_CONFIG } from '../src/services/fusionService';
import { ImageQualityMetrics } from '../src/types';

const mockQuality: ImageQualityMetrics = {
  brightness: 140,
  contrast: 45,
  sharpness: 180,
  resolution: { width: 800, height: 800 },
  score: 0.85,
  label: 'EXCELLENT',
  warnings: []
};

const poorQuality: ImageQualityMetrics = {
  brightness: 30,
  contrast: 15,
  sharpness: 20,
  resolution: { width: 200, height: 200 },
  score: 0.2,
  label: 'POOR',
  warnings: ['Too dark', 'Blurry']
};

describe('Evidence Fusion Engine', () => {
  it('assigns HIGH status when visual and text evidence are concordant and strong', () => {
    const result = fuseEvidence({
      cnnConfidence: 0.92,
      predictedClass: 'acetaminophen_500mg',
      ocrConfidence: 0.88,
      hasOcrText: true,
      ocrMatchesCnnClass: true,
      ocrMatchesAnyOtherDb: false,
      dbMatchFound: true,
      qualityMetrics: mockQuality
    });

    expect(result.status).toBe('HIGH');
    expect(result.score).toBeGreaterThanOrEqual(DEFAULT_FUSION_CONFIG.thresholdHigh);
    expect(result.conflict).toBe(false);
  });

  it('assigns MODERATE status when strong visual evidence exists without readable OCR imprint', () => {
    const result = fuseEvidence({
      cnnConfidence: 0.82,
      predictedClass: 'ibuprofen_200mg',
      ocrConfidence: 0.0,
      hasOcrText: false,
      ocrMatchesCnnClass: false,
      ocrMatchesAnyOtherDb: false,
      dbMatchFound: true,
      qualityMetrics: mockQuality
    });

    expect(['HIGH', 'MODERATE']).toContain(result.status);
    expect(result.conflict).toBe(false);
  });

  it('detects evidence conflict and caps status at LOW with penalty applied', () => {
    const result = fuseEvidence({
      cnnConfidence: 0.85,
      predictedClass: 'acetaminophen_500mg',
      ocrConfidence: 0.90,
      hasOcrText: true,
      ocrMatchesCnnClass: false, // Text does NOT match predicted class
      ocrMatchesAnyOtherDb: true, // But matches another medicine
      dbMatchFound: true,
      qualityMetrics: mockQuality
    });

    expect(result.conflict).toBe(true);
    expect(result.status).toBe('LOW');
    expect(result.conflictReason).toBeDefined();
  });

  it('safe-fails with INSUFFICIENT status on poor quality blurry and dark inputs', () => {
    const result = fuseEvidence({
      cnnConfidence: 0.40,
      predictedClass: 'unknown',
      ocrConfidence: 0.0,
      hasOcrText: false,
      ocrMatchesCnnClass: false,
      ocrMatchesAnyOtherDb: false,
      dbMatchFound: false,
      qualityMetrics: poorQuality
    });

    expect(result.status).toBe('INSUFFICIENT');
    expect(result.score).toBeLessThan(DEFAULT_FUSION_CONFIG.thresholdLow);
  });
});
