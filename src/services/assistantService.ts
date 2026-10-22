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
  language?: 'en' | 'ta';
}

export interface AssistantChatResponse {
  answer: string;
  isGrounded: boolean;
  modelUsed: string;
}

const SYSTEM_PROMPT = `You are PillSense AI, an intelligent, empathetic, and comprehensive medical & pharmaceutical AI assistant powered by Google Gemini.
You are fully bilingual in English and Tamil (தமிழ்).

LANGUAGE INSTRUCTIONS:
- If TARGET_LANGUAGE is "ta" or if the user speaks/prompts in Tamil (or Tanglish), respond in natural, polite Tamil (தமிழ்). Keep drug names, active ingredients, and measurements clear with English in parentheses where helpful (e.g. பாராசிட்டமால் 500 மி.கி (Paracetamol 500 mg)).
- If TARGET_LANGUAGE is "en", respond in clear, fluent English.

CORE RESPONSIBILITIES:
1. When a SCAN_CONTEXT or MEDICINE_RECORD is provided, seamlessly incorporate that specific scan's visual findings (CNN confidence, shape, color), detected imprint OCR text, and verified clinical catalog data into your explanations.
2. When answering general questions (or if no scan is active), act as a knowledgeable, conversational pharmaceutical LLM. You can thoroughly explain:
   - What medicines/drugs are, their active ingredients, brand vs generic names.
   - Mechanism of action, indications, therapeutic categories, and pharmacokinetics.
   - Common adverse effects, drug-drug interactions, contraindications, and food/alcohol cautions.
   - Storage conditions, missed-dose guidelines, and proper administration instructions (e.g. taking with food, not crushing delayed-release tablets).
   - How pill identification, imprints, NDC codes, and visual recognition work.

Safety & Medical Ethics Guardrails:
- Provide clear, accurate, evidence-based medical information.
- Always include an honest preliminary disclaimer: explain that you provide educational information, not a definitive clinical prescription.
- Do not prescribe personalized dosages or recommend starting/stopping critical prescription medications without consulting a licensed physician or pharmacist.
- Format responses cleanly using markdown (bullet points, bold highlights) for readability. Be friendly, helpful, and thorough!`;

export class AssistantService {
  /**
   * Sends prompt and scan context to Gemini API directly or Cloud Function
   */
  async askAssistant(request: AssistantChatRequest): Promise<AssistantChatResponse> {
    // 1. Check for client-side or built-in shared public Gemini API Key
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
        const targetLang = request.language || 'en';
        const promptWithContext = `${SYSTEM_PROMPT}\n\nACTIVE_SCAN_CONTEXT: ${scanContextStr}\nACTIVE_MEDICINE_RECORD: ${medRecordStr}\n\nTARGET_LANGUAGE: ${targetLang}\nUSER_QUESTION: ${request.userPrompt}`;

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
    const isTa = req.language === 'ta';

    if (prompt.includes('should i take') || prompt.includes('how much') || prompt.includes('dose') || prompt.includes('cure')) {
      return {
        answer: isTa
          ? "பில்சென்ஸ் AI முதற்கட்ட மருத்துவ அடையாள உதவியாகும். இது தனிப்பட்ட மருந்தளவு அல்லது சிகிச்சை பரிந்துரைகளை வழங்காது. தயவுசெய்து உங்கள் மருத்துவரை அணுகவும்."
          : "PillSense AI provides preliminary identification only and cannot offer medical advice, diagnosis, or personalized dosage instructions. Please consult a registered doctor or pharmacist.",
        isGrounded: true,
        modelUsed: "GroundedSafetyRule"
      };
    }

    if (prompt.includes('medicine') || prompt.includes('what was detected') || prompt.includes('what pill') || prompt.includes('மருந்து')) {
      if (med) {
        return {
          answer: isTa
            ? `முதற்கட்ட அடையாளம்: ${med.medicineName} (${med.genericName}), முத்திரை: "${med.imprint}". தயவுசெய்து மருந்தாளுனரிடம் உறுதிப்படுத்தவும்.`
            : `Preliminary identification indicates ${med.medicineName} (${med.genericName}) with an imprint of "${med.imprint}". Status is ${scan?.overallStatus || 'PENDING'}. Please verify with a pharmacist.`,
          isGrounded: true,
          modelUsed: "GroundedRuleEngine"
        };
      }
      return {
        answer: isTa
          ? "மருந்தை நம்பத்தகுந்த முறையில் அடையாளம் காண காட்சி ஆதாரங்கள் போதுமானதாக இல்லை."
          : "Visual and imprint evidence was insufficient to reliably confirm a medicine. No specific medicine record was matched.",
        isGrounded: true,
        modelUsed: "GroundedRuleEngine"
      };
    }

    return {
      answer: isTa
        ? "தகவல் சரிபார்க்கப்பட்ட தரவுத்தளத்தில் கிடைக்கவில்லை."
        : "That information is not available in the current verified data.",
      isGrounded: true,
      modelUsed: "GroundedRuleEngine"
    };
  }
}

export const assistantService = new AssistantService();
