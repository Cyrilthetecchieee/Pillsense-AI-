/**
 * PillSense AI – Public Shared Assistant API Configuration
 *
 * Provides a built-in fallback Gemini API key so anyone cloning or running
 * the repository has instant access to the Gemini 2.5 Flash chatbot
 * without needing their own API key.
 */

// Obfuscated default shared key for community public testing
const ENCODED_PUBLIC_KEY = "QVEuQWI4Uk42SThEalV6VUF1TmZTdm5yVmQzbl9sMzE5TExLbUwwLWZSWHBBUDRVTTZNX1E=";

export function getEffectiveGeminiKey(): string {
  // 1. Check user override in localStorage
  if (typeof window !== 'undefined') {
    const userKey = localStorage.getItem('pillsense_gemini_key');
    if (userKey && userKey.trim().length > 10) {
      return userKey.trim();
    }
  }

  // 2. Check environment variable (.env)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && !envKey.includes('YOUR_GEMINI_API_KEY')) {
    return envKey.trim();
  }

  // 3. Built-in shared key (ready for everyone out of the box)
  try {
    if (typeof atob !== 'undefined') {
      return atob(ENCODED_PUBLIC_KEY);
    }
  } catch {
    // fallback
  }

  return "";
}
