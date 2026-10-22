import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { ScanRecord, MedicineRecord } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEffectiveGeminiKey } from './apiConfig';

export interface AssistantChatRequest {
  scanId?: string;
  userPrompt: string;
  scanContext?: Partial<ScanRecord>;
  medicineRecord?: MedicineRecord | null;
}

export interface AssistantChatResponse {
  answer: string;
  isGrounded: boolean;
  modelUsed: string;
}

const SYSTEM_PROMPT = `You are PillSense AI, an intelligent, empathetic, and comprehensive medical & pharmaceutical AI assistant powered by Google Gemini.
You have two core responsibilities:
1. When a SCAN_CONTEXT or MEDICINE_RECORD is provided, seamlessly incorporate that specific scan's visual findings (CNN confidence, shape, color), detected imprint OCR text, and verified clinical catalog data into your explanations.
2. When answering general questions (or if no scan is active), act as a knowledgeable, conversational pharmaceutical LLM. You can thoroughly explain:
   - What medicines/drugs are, their active ingredients, brand vs generic names.
   - Mechanism of action, indications, therapeutic categories, and pharmacokinetics.
   - Common adverse effects, drug-drug interactions, contraindications, and food/alcohol cautions.
   - Storage conditions, missed-dose guidelines, and proper administration instructions (e.g. taking with food, not crushing delayed-release tablets).
   - How pill identification, imprints, NDC codes, and visual recognition work.

Safety & Medical Ethics Guardrails:
- Provide clear, accurate, evidence-based medical information.
- Always include an honest preliminary disclaimer when discussing identification or treatment: explain that you provide educational information, not a definitive clinical prescription.
- Do not prescribe personalized dosages or recommend starting/stopping critical prescription medications without consulting a licensed physician or pharmacist.
- Format responses cleanly using markdown (bullet points, bold highlights) for readability. Be friendly, helpful, and thorough!`;

export class AssistantService {
  /**
   * Sends prompt and scan context to Gemini API directly or Cloud Function
   */
  async askAssistant(request: AssistantChatRequest): Promise<AssistantChatResponse> {
    // 1. Check for client-side or environment Gemini API Key
    const localApiKey = getEffectiveGeminiKey();

    if (localApiKey && !localApiKey.includes('PLACEHOLDER')) {
      try {
        const genAI = new GoogleGenerativeAI(localApiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800
          }
        });

        const hasScan = Boolean(request.scanContext?.cnn || request.medicineRecord);
        const scanContextStr = hasScan ? JSON.stringify(request.scanContext || {}) : 'None';
        const medRecordStr = hasScan ? JSON.stringify(request.medicineRecord || {}) : 'None';
        const promptWithContext = `${SYSTEM_PROMPT}\n\nACTIVE_SCAN_CONTEXT: ${scanContextStr}\nACTIVE_MEDICINE_RECORD: ${medRecordStr}\n\nUSER_QUESTION: ${request.userPrompt}`;

        const result = await model.generateContent(promptWithContext);
        const response = await result.response;
        const answer = response.text().trim();

        if (answer) {
          return {
            answer,
            isGrounded: true,
            modelUsed: 'gemini-2.5-flash'
          };
        }
      } catch (err) {
        console.warn('Direct Gemini API call failed, falling back to grounded rule engine:', err);
      }
    }

    // 2. Fallback to Cloud Function callable if configured
    try {
      const callChat = httpsCallable<AssistantChatRequest, AssistantChatResponse>(functions, 'assistantChat');
      const res = await callChat(request);
      return res.data;
    } catch {
      // 3. Fallback to deterministic serverless rule grounding
      return this.generateGroundedFallback(request);
    }
  }

  private generateGroundedFallback(req: AssistantChatRequest): AssistantChatResponse {
    const med = req.medicineRecord;
    const scan = req.scanContext;
    const prompt = req.userPrompt.toLowerCase();

    // Check for unsafe or diagnostic queries
    if (prompt.includes('should i take') || prompt.includes('how much') || prompt.includes('dose') || prompt.includes('cure')) {
      return {
        answer: "PillSense AI provides preliminary identification only and cannot offer medical advice, diagnosis, or personalized dosage instructions. Please consult a registered doctor or pharmacist.",
        isGrounded: true,
        modelUsed: "GroundedSafetyRule"
      };
    }

    if (prompt.includes('medicine') || prompt.includes('what was detected') || prompt.includes('what pill')) {
      if (med) {
        return {
          answer: `Preliminary identification indicates ${med.medicineName} (${med.genericName}) with an imprint of "${med.imprint}". Status is ${scan?.overallStatus || 'PENDING'}. Please verify with a pharmacist.`,
          isGrounded: true,
          modelUsed: "GroundedRuleEngine"
        };
      }
      return {
        answer: "Visual and imprint evidence was insufficient to reliably confirm a medicine. No specific medicine record was matched.",
        isGrounded: true,
        modelUsed: "GroundedRuleEngine"
      };
    }

    if (prompt.includes('text') || prompt.includes('imprint') || prompt.includes('ocr')) {
      const ocrText = scan?.ocr?.cleanText;
      return {
        answer: ocrText
          ? `The OCR scan detected text: "${ocrText}". This was cross-referenced against catalog imprints.`
          : "No reliable text or imprints were detected on the image surface.",
        isGrounded: true,
        modelUsed: "GroundedRuleEngine"
      };
    }

    if (prompt.includes('confidence') || prompt.includes('why')) {
      return {
        answer: `The match score reflects weighted evidence: Visual CNN (${Math.round((scan?.cnn?.confidence || 0) * 100)}%), OCR Text (${Math.round((scan?.ocr?.confidence || 0) * 100)}%), and Catalog validation.`,
        isGrounded: true,
        modelUsed: "GroundedRuleEngine"
      };
    }

    if (med && (prompt.includes('warning') || prompt.includes('side effect'))) {
      return {
        answer: `Official warnings on record: ${med.warnings.join(' ')}`,
        isGrounded: true,
        modelUsed: "GroundedRuleEngine"
      };
    }

    return {
      answer: "That information is not available in the current verified data.",
      isGrounded: true,
      modelUsed: "GroundedRuleEngine"
    };
  }
}

export const assistantService = new AssistantService();

