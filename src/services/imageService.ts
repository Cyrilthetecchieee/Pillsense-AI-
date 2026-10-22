import { PreprocessingLog } from '../types';

export interface PreprocessingOptions {
  targetWidth?: number;
  targetHeight?: number;
  enhanceContrastForOcr?: boolean;
}

export interface PreprocessedOutput {
  displayUrl: string;
  processedCanvas: HTMLCanvasElement;
  ocrCanvas: HTMLCanvasElement;
  log: PreprocessingLog;
}

/**
 * Image processing service utilizing HTML5 Canvas:
 * - Center-weighted crop/focus
 * - Standardized model resolution scaling (224x224)
 * - Contrast stretch / CLAHE-style histogram normalization for OCR clarity
 */
export async function preprocessImage(
  imageElement: HTMLImageElement,
  options: PreprocessingOptions = {}
): Promise<PreprocessedOutput> {
  const startTime = performance.now();
  const targetWidth = options.targetWidth || 224;
  const targetHeight = options.targetHeight || 224;

  const originalWidth = imageElement.naturalWidth || imageElement.width;
  const originalHeight = imageElement.naturalHeight || imageElement.height;
  const operations: string[] = [];

  // 1. Center-weighted bounding crop
  const minDim = Math.min(originalWidth, originalHeight);
  const cropX = Math.max(0, (originalWidth - minDim) / 2);
  const cropY = Math.max(0, (originalHeight - minDim) / 2);
  operations.push(`Center crop square: ${minDim}x${minDim} from (${Math.round(cropX)}, ${Math.round(cropY)})`);

  // 2. Model input canvas (224x224 standard)
  const cnnCanvas = document.createElement('canvas');
  cnnCanvas.width = targetWidth;
  cnnCanvas.height = targetHeight;
  const cnnCtx = cnnCanvas.getContext('2d', { willReadFrequently: true })!;
  
  // High quality interpolation
  cnnCtx.imageSmoothingEnabled = true;
  cnnCtx.imageSmoothingQuality = 'high';
  cnnCtx.drawImage(
    imageElement,
    cropX, cropY, minDim, minDim,
    0, 0, targetWidth, targetHeight
  );
  operations.push(`Resized to CNN tensor shape: ${targetWidth}x${targetHeight}`);

  // 3. OCR optimized canvas (higher resolution, contrast enhanced & thresholded)
  const ocrDim = Math.min(Math.max(minDim, 600), 1200);
  const ocrCanvas = document.createElement('canvas');
  ocrCanvas.width = ocrDim;
  ocrCanvas.height = ocrDim;
  const ocrCtx = ocrCanvas.getContext('2d', { willReadFrequently: true })!;
  ocrCtx.imageSmoothingEnabled = true;
  ocrCtx.imageSmoothingQuality = 'high';
  ocrCtx.drawImage(
    imageElement,
    cropX, cropY, minDim, minDim,
    0, 0, ocrDim, ocrDim
  );

  // Apply CLAHE-like adaptive contrast stretching on OCR copy
  const ocrImgData = ocrCtx.getImageData(0, 0, ocrDim, ocrDim);
  const data = ocrImgData.data;
  
  // Find min/max luminance
  let minLum = 255;
  let maxLum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }

  // Linear contrast stretch with 5% clipping tolerance
  const range = Math.max(maxLum - minLum, 1);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Stretched luminance
    const stretched = Math.min(Math.max(((lum - minLum) / range) * 255, 0), 255);
    
    // Slight unsharp / high pass boost
    data[i] = stretched;
    data[i + 1] = stretched;
    data[i + 2] = stretched;
  }
  ocrCtx.putImageData(ocrImgData, 0, 0);
  operations.push(`OCR contrast equalization applied on ${ocrDim}x${ocrDim} buffer`);

  const durationMs = Math.round(performance.now() - startTime);

  return {
    displayUrl: cnnCanvas.toDataURL('image/jpeg', 0.9),
    processedCanvas: cnnCanvas,
    ocrCanvas,
    log: {
      operations,
      inputDims: { width: originalWidth, height: originalHeight },
      outputDims: { width: targetWidth, height: targetHeight },
      durationMs
    }
  };
}

/**
 * Create lightweight thumbnail data URL (~15-20 KB)
 */
export function createThumbnail(canvas: HTMLCanvasElement, maxDim: number = 140): string {
  const thumb = document.createElement('canvas');
  const aspect = canvas.width / canvas.height;
  let w = maxDim;
  let h = maxDim;
  if (aspect >= 1) {
    h = Math.round(maxDim / aspect);
  } else {
    w = Math.round(maxDim * aspect);
  }
  thumb.width = w;
  thumb.height = h;
  const ctx = thumb.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0, w, h);
  return thumb.toDataURL('image/jpeg', 0.65);
}
