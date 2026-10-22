import { CNNPredictionResult } from '../types';
import { modelLoaderService } from '../ml/modelLoaderService';

export interface RecognitionService {
  predict(canvas: HTMLCanvasElement): Promise<CNNPredictionResult>;
  getModelMode(): 'trained' | 'demo';
  getModelVersion(): string;
}

export class CNNService implements RecognitionService {
  private modelVersion = 'v1.0.0-dualhead-calibrated';
  private modelMode: 'trained' | 'demo' = 'trained';

  getModelMode(): 'trained' | 'demo' {
    return this.modelMode;
  }

  getModelVersion(): string {
    return this.modelVersion;
  }

  async predict(canvas: HTMLCanvasElement): Promise<CNNPredictionResult> {
    return modelLoaderService.runInference(canvas);
  }
}

export const cnnService = new CNNService();
