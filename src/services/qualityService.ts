import { ImageQualityMetrics } from '../types';

export interface QualityAnalysisResult {
  metrics: ImageQualityMetrics;
  isAcceptable: boolean;
  issues: string[];
}

/**
 * Analyzes image quality using HTML5 Canvas:
 * 1. Mean luminance (brightness)
 * 2. Standard deviation of luminance (contrast)
 * 3. Laplacian variance (sharpness / blur detection)
 * 4. Resolution check (minimum dimension constraint)
 */
export async function analyzeImageQuality(
  imageSource: HTMLImageElement | ImageData | HTMLCanvasElement
): Promise<ImageQualityMetrics> {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let width: number;
  let height: number;

  if (imageSource instanceof HTMLCanvasElement) {
    canvas = imageSource;
    width = canvas.width;
    height = canvas.height;
    ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  } else if (imageSource instanceof ImageData) {
    canvas = document.createElement('canvas');
    canvas.width = imageSource.width;
    canvas.height = imageSource.height;
    width = canvas.width;
    height = canvas.height;
    ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.putImageData(imageSource, 0, 0);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = imageSource.naturalWidth || imageSource.width;
    canvas.height = imageSource.naturalHeight || imageSource.height;
    width = canvas.width;
    height = canvas.height;
    ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(imageSource, 0, 0);
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const numPixels = width * height;

  // 1. Grayscale luminance + Mean Luminance (Brightness)
  let sumLuminance = 0;
  const gray = new Float32Array(numPixels);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Standard perceptual luminance: 0.299R + 0.587G + 0.114B
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const pixelIdx = i / 4;
    gray[pixelIdx] = lum;
    sumLuminance += lum;
  }

  const meanLuminance = sumLuminance / numPixels;

  // 2. Contrast: standard deviation of luminance
  let sumSqDiff = 0;
  for (let i = 0; i < numPixels; i++) {
    const diff = gray[i] - meanLuminance;
    sumSqDiff += diff * diff;
  }
  const contrast = Math.sqrt(sumSqDiff / numPixels);

  // 3. Sharpness: Laplacian variance
  // Discrete 3x3 Laplacian kernel:
  // [ 0,  1,  0 ]
  // [ 1, -4,  1 ]
  // [ 0,  1,  0 ]
  let laplacianSum = 0;
  let laplacianSumSq = 0;
  let validLaplacianPixels = 0;

  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width;
    for (let x = 1; x < width - 1; x++) {
      const idx = rowOffset + x;
      const center = gray[idx];
      const top = gray[idx - width];
      const bottom = gray[idx + width];
      const left = gray[idx - 1];
      const right = gray[idx + 1];

      const lap = (top + bottom + left + right) - 4 * center;
      laplacianSum += lap;
      laplacianSumSq += lap * lap;
      validLaplacianPixels++;
    }
  }

  const laplacianMean = laplacianSum / (validLaplacianPixels || 1);
  const sharpness = (laplacianSumSq / (validLaplacianPixels || 1)) - (laplacianMean * laplacianMean);

  // 4. Quality checks & warnings
  const warnings: string[] = [];
  
  if (width < 224 || height < 224) {
    warnings.push(`Image resolution (${width}x${height}) is below minimum requirement (224x224).`);
  }
  if (meanLuminance < 40) {
    warnings.push('Image appears underexposed (too dark). Lighting should be improved.');
  } else if (meanLuminance > 220) {
    warnings.push('Image appears overexposed (washed out). Harsh glare may obscure details.');
  }
  if (contrast < 20) {
    warnings.push('Image contrast is low. Pill contours or imprints may be difficult to discern.');
  }
  if (sharpness < 50) {
    warnings.push('Significant motion blur or soft focus detected. Text and imprints may not be readable.');
  }

  // Composite score calculation (0.0 to 1.0)
  // Sharpness contribution (0-1, normalized up to 300)
  const sharpnessScore = Math.min(Math.max((sharpness - 30) / 250, 0), 1.0);
  // Brightness balance (ideal ~ 110-170)
  const brightnessScore = 1.0 - Math.min(Math.abs(meanLuminance - 140) / 140, 1.0);
  // Contrast score (ideal > 35)
  const contrastScore = Math.min(Math.max(contrast / 50, 0), 1.0);
  // Resolution score
  const minDim = Math.min(width, height);
  const resScore = Math.min(Math.max(minDim / 600, 0.2), 1.0);

  const rawScore = (sharpnessScore * 0.45) + (brightnessScore * 0.2) + (contrastScore * 0.2) + (resScore * 0.15);
  const finalScore = Number(Math.min(Math.max(rawScore, 0.05), 0.99).toFixed(2));

  let label: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  if (finalScore >= 0.75 && warnings.length === 0) {
    label = 'EXCELLENT';
  } else if (finalScore >= 0.55 && warnings.length <= 1) {
    label = 'GOOD';
  } else if (finalScore >= 0.35) {
    label = 'FAIR';
  } else {
    label = 'POOR';
  }

  return {
    brightness: Math.round(meanLuminance),
    contrast: Math.round(contrast),
    sharpness: Math.round(sharpness),
    resolution: { width, height },
    score: finalScore,
    label,
    warnings
  };
}
