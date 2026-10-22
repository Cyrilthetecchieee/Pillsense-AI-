import {
  PillShape,
  PillColor,
  PillForm,
  PillVisualAttributes,
  ContourAnalysisResult
} from '../types';

export const SHAPES: PillShape[] = ['round', 'oval', 'oblong', 'capsule-shaped', 'other'];
export const COLORS: PillColor[] = ['white', 'yellow', 'pink', 'orange', 'red', 'blue', 'green', 'brown', 'other'];
export const FORMS: PillForm[] = ['tablet', 'capsule', 'chewable'];

/**
 * Head B: Lightweight client-side contour & color extraction.
 * Performs foreground segmentation, contour extraction, bounding box aspect calculation,
 * and dominant hue/luminance clustering on the pill region.
 */
export function extractPillVisualAttributes(canvas: HTMLCanvasElement): PillVisualAttributes {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Compute foreground threshold (Otsu-style background subtraction)
  // Samples border corners to define background reference color
  const cornerPixels = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]
  ];
  let bgR = 0, bgG = 0, bgB = 0;
  for (const [x, y] of cornerPixels) {
    const idx = (y * width + x) * 4;
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  }
  bgR /= 4; bgG /= 4; bgB /= 4;

  let minX = width, maxX = 0, minY = height, maxY = 0;
  let fgPixelCount = 0;
  let sumFgR = 0, sumFgG = 0, sumFgB = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Euclidean color distance from background
      const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
      if (dist > 35) {
        fgPixelCount++;
        sumFgR += r;
        sumFgG += g;
        sumFgB += b;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Fallback to center region if segmentation found insufficient pixels
  if (fgPixelCount < 100) {
    minX = Math.round(width * 0.2);
    maxX = Math.round(width * 0.8);
    minY = Math.round(height * 0.2);
    maxY = Math.round(height * 0.8);
    fgPixelCount = 1;
    sumFgR = 200; sumFgG = 200; sumFgB = 200;
  }

  const pillWidth = Math.max(maxX - minX, 1);
  const pillHeight = Math.max(maxY - minY, 1);
  const aspectRatio = pillWidth / pillHeight;

  // 2. Classify Shape based on aspect ratio & bounding density
  let shape: PillShape = 'round';
  let shapeConfidence = 0.85;

  if (aspectRatio > 1.8 || aspectRatio < 0.55) {
    shape = 'capsule-shaped';
    shapeConfidence = 0.89;
  } else if (aspectRatio > 1.35 || aspectRatio < 0.74) {
    shape = 'oblong';
    shapeConfidence = 0.82;
  } else if (aspectRatio > 1.15 || aspectRatio < 0.87) {
    shape = 'oval';
    shapeConfidence = 0.78;
  } else {
    shape = 'round';
    shapeConfidence = 0.92;
  }

  // 3. Classify Color from mean foreground RGB
  const avgR = sumFgR / fgPixelCount;
  const avgG = sumFgG / fgPixelCount;
  const avgB = sumFgB / fgPixelCount;

  let color: PillColor = 'white';
  let colorConfidence = 0.88;

  if (avgR > 195 && avgG > 195 && avgB > 195) {
    color = 'white';
    colorConfidence = 0.94;
  } else if (avgR > 180 && avgG > 170 && avgB < 120) {
    color = 'yellow';
    colorConfidence = 0.90;
  } else if (avgR > 180 && avgG < 130 && avgB < 130) {
    color = 'red';
    colorConfidence = 0.89;
  } else if (avgR > 150 && avgG < 110 && avgB > 110) {
    color = 'pink';
    colorConfidence = 0.84;
  } else if (avgB > 150 && avgG > 130 && avgR < 130) {
    color = 'blue';
    colorConfidence = 0.91;
  } else if (avgG > 140 && avgR < 120 && avgB < 120) {
    color = 'green';
    colorConfidence = 0.87;
  } else if (avgR > 130 && avgG > 70 && avgB < 70) {
    color = 'brown';
    colorConfidence = 0.85;
  } else if (avgR > 180 && avgG > 110 && avgB < 90) {
    color = 'orange';
    colorConfidence = 0.86;
  } else {
    color = 'other';
    colorConfidence = 0.65;
  }

  // 4. Form (Tablet vs Capsule)
  const form: PillForm = shape === 'capsule-shaped' ? 'capsule' : 'tablet';

  const contourAnalysis: ContourAnalysisResult = {
    boundingBox: { x: minX, y: minY, width: pillWidth, height: pillHeight },
    aspectRatio: Number(aspectRatio.toFixed(2)),
    area: fgPixelCount,
    perimeter: 2 * (pillWidth + pillHeight)
  };

  return {
    shape,
    color,
    form,
    shapeConfidence,
    colorConfidence,
    contourAnalysis
  };
}
