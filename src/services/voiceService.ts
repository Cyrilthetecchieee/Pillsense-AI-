/**
 * Resilient Web Speech Recognition & Speech Synthesis Utility
 * Handles browser voice loading latency, cross-platform voice fallbacks,
 * and chunked utterance playback so long responses don't stall or time out.
 */

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getSpeechRecognition());
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Preload voices
let cachedVoices: SpeechSynthesisVoice[] = [];
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }
    const current = window.speechSynthesis.getVoices();
    if (current.length > 0) {
      cachedVoices = current;
      resolve(current);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    };
    // Safety timeout in case onvoiceschanged does not fire
    setTimeout(() => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    }, 400);
  });
}

// Immediately attempt voice caching on client load
if (typeof window !== 'undefined') {
  loadVoices();
}

/**
 * Cleans text for speech synthesis so that punctuation, markdown,
 * and formatting don't cause the audio engine to pause or fail.
 */
export function sanitizeForVoice(text: string, language: 'en' | 'ta'): string {
  let cleaned = text
    .replace(/[*#_`>~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-•]\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (language === 'ta') {
    // Remove parenthetical English notations if present so TTS doesn't stumble
    cleaned = cleaned.replace(/\([A-Za-z0-9\s.,\/-]+\)/g, '');
    cleaned = cleaned.replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();
  }

  return cleaned;
}

/**
 * Synthesizes and speaks text out loud with reliable cross-browser fallbacks.
 * Splits into bite-sized sentences to prevent Android/iOS/Chrome 15-second speech cuts.
 */
export async function speakText(text: string, language: 'en' | 'ta' = 'en'): Promise<void> {
  if (!isSpeechSynthesisSupported()) {
    return;
  }

  const voices = await loadVoices();
  const cleanText = sanitizeForVoice(text, language);
  if (!cleanText) return;

  // Cancel any existing speech
  window.speechSynthesis.cancel();

  // Find optimal voice
  let selectedVoice: SpeechSynthesisVoice | null = null;
  if (language === 'ta') {
    selectedVoice =
      voices.find(v => v.lang === 'ta-IN' || v.lang === 'ta_IN') ||
      voices.find(v => v.lang.toLowerCase().startsWith('ta')) ||
      voices.find(v => v.name.toLowerCase().includes('tamil') || v.name.includes('தமிழ்')) ||
      null;
  } else {
    selectedVoice =
      voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en')) ||
      null;
  }

  // Split text into readable sentences so long explanations play completely
  // Supports Tamil full stop/period delimiters
  const sentences = cleanText
    .split(/([.!?।\n]+)/)
    .filter(s => s.trim().length > 0);

  // Group sentences into short chunks (~120 chars)
  const chunks: string[] = [];
  let currentChunk = '';
  for (const part of sentences) {
    if ((currentChunk + part).length < 140) {
      currentChunk += part;
    } else {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = part;
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());

  // Play chunks sequentially
  for (const chunk of chunks) {
    await new Promise<void>((resolve) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
      utterance.rate = language === 'ta' ? 0.90 : 1.0;
      utterance.pitch = 1.0;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.warn('Speech synthesis chunk error:', e);
        resolve(); // Continue to next chunk or finish gracefully
      };

      window.speechSynthesis.speak(utterance);
    });
  }
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
