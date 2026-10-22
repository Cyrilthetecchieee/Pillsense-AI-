import { BrowserMultiFormatReader } from '@zxing/browser';

export interface BarcodeResult {
  text: string;
  format: string;
  success: boolean;
}

export class BarcodeService {
  private reader = new BrowserMultiFormatReader();

  async decodeFromImage(imgElement: HTMLImageElement): Promise<BarcodeResult | null> {
    try {
      const result = await this.reader.decodeFromImageElement(imgElement);
      if (result) {
        return {
          text: result.getText(),
          format: result.getBarcodeFormat().toString(),
          success: true
        };
      }
    } catch {
      // No barcode found is typical, not an error
    }
    return null;
  }
}

export const barcodeService = new BarcodeService();
