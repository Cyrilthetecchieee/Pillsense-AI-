import { createWorker } from 'tesseract.js';
import { OCRResult, OCRLine } from '../types';

export class OCRService {
  private worker: any = null;
  private isInitialized = false;

  async init() {
    if (!this.isInitialized) {
      try {
        this.worker = await createWorker('eng');
        this.isInitialized = true;
      } catch (e) {
        console.warn('OCR Worker initialization deferred or failed:', e);
      }
    }
  }

  /**
   * Recognizes text from canvas, cleans imprints and package numbers
   */
  async recognize(canvas: HTMLCanvasElement): Promise<OCRResult> {
    const startTime = performance.now();
    try {
      await this.init();
      if (!this.worker) {
        return this.fallbackRegexCheck(canvas, startTime);
      }

      const ret = await this.worker.recognize(canvas);
      const lines: OCRLine[] = (ret.data.lines || []).map((l: any) => ({
        text: l.text.trim(),
        confidence: Number((l.confidence / 100).toFixed(2))
      })).filter((l: OCRLine) => l.text.length > 0);

      const rawText = ret.data.text.trim();
      const cleanText = this.cleanImprintText(rawText);
      const tokens = cleanText.split(/\s+/).filter(t => t.length >= 2);

      const overallConfidence = lines.length > 0
        ? Number((lines.reduce((acc, l) => acc + l.confidence, 0) / lines.length).toFixed(2))
        : 0;

      return {
        text: rawText,
        cleanText,
        lines,
        confidence: overallConfidence,
        status: cleanText.length > 0 ? 'SUCCESS' : 'NO_TEXT',
        detectedTokens: tokens,
        durationMs: Math.round(performance.now() - startTime)
      };
    } catch {
      return this.fallbackRegexCheck(canvas, startTime);
    }
  }

  private cleanImprintText(raw: string): string {
    // Retain alphanumeric imprints, dashes, slashes, mg markings
    return raw
      .replace(/[^a-zA-Z0-9\s\-\/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private fallbackRegexCheck(canvas: HTMLCanvasElement, startTime: number): OCRResult {
    return {
      text: '',
      cleanText: '',
      lines: [],
      confidence: 0,
      status: 'NO_TEXT',
      detectedTokens: [],
      durationMs: Math.round(performance.now() - startTime)
    };
  }
}

export const ocrService = new OCRService();
