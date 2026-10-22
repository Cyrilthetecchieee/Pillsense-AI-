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
 * Text-to-Speech (TTS) synthesizer with Tamil & English voice selection
 */
export function speakText(text: string, language: 'en' | 'ta' = 'en'): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve();
      return;
    }

    // Cancel ongoing speech
    window.speechSynthesis.cancel();

    // Clean markdown characters (*, #, _, `, etc.) for smooth speech
    const cleanText = text
      .replace(/[*#_`>]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!cleanText) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick best available voice matching language
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v =>
      language === 'ta'
        ? v.lang.startsWith('ta') || v.name.toLowerCase().includes('tamil')
        : v.lang.startsWith('en')
    );

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
