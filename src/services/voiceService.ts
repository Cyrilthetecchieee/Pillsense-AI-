/**
 * Web Speech Recognition & Speech Synthesis Utility
 * Supports English (en-US, en-IN) and Tamil (ta-IN).
 */

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

// Check browser support for SpeechRecognition
export function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null;
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null;
  return SpeechRecognition;
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getSpeechRecognition());
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Prepares text specifically for Tamil Text-to-Speech synthesis.
 * Strips English acronyms and parenthetical Latin text that cause
 * TTS engines to awkwardly flip into English or mispronounce words.
 */
export function sanitizeForVoice(text: string, language: 'en' | 'ta'): string {
  // 1. Remove markdown symbols (*, #, _, `, >, -, ~)
  let cleaned = text
    .replace(/[*#_`>~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-•]\s*/gm, '');

  if (language === 'ta') {
    // 2. Remove English letters inside parentheses (e.g. "(Paracetamol 500 mg)")
    cleaned = cleaned.replace(/\([A-Za-z0-9\s.,\/-]+\)/g, '');
    // 3. Remove standalone Latin words so the Tamil TTS voice speaks purely in Tamil
    cleaned = cleaned.replace(/\b[A-Za-z]+\b/g, '');
    // 4. Clean extra spaces or multiple commas left behind
    cleaned = cleaned.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
  } else {
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
  }

  return cleaned;
}

/**
 * Text-to-Speech (TTS) synthesizer with clean Tamil & English voice selection
 */
export function speakText(text: string, language: 'en' | 'ta' = 'en'): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve();
      return;
    }

    // Cancel ongoing speech
    window.speechSynthesis.cancel();

    const cleanText = sanitizeForVoice(text, language);

    if (!cleanText) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
    // Slightly slower rate (0.88) for clear Tamil enunciation
    utterance.rate = language === 'ta' ? 0.88 : 0.95;
    utterance.pitch = 1.0;

    // Pick best available voice matching language
    const voices = window.speechSynthesis.getVoices();
    let matchingVoice = null;

    if (language === 'ta') {
      // Prioritize explicit Tamil language tags and names (Google தமிழ், Microsoft Valluvar, etc.)
      matchingVoice = voices.find(v =>
        v.lang === 'ta-IN' ||
        v.lang === 'ta_IN' ||
        v.lang.toLowerCase().startsWith('ta') ||
        v.name.toLowerCase().includes('tamil') ||
        v.name.includes('தமிழ்')
      );
    } else {
      matchingVoice = voices.find(v => v.lang.startsWith('en'));
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
