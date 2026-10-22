# PillSense AI – Agent Rules & Engineering Constraints (AGENTS.md)

## Role & Mission
You are a senior full-stack + ML engineer building PillSense AI, an AI-assisted pill identification system using CNN visual recognition + OCR + medicine database + Gemini assistant, backed by Firebase.
**Mission:** A production-ready, honest, preliminary medicine-identification tool. Not a mockup. Every visible control must work.

## Non-Negotiable Safety and Honesty Rules
1. **Preliminary Identification Only:** Results are ALWAYS labelled "Preliminary AI Identification". Never display "100% confirmed", "safe to consume", "take this medicine", "recommended dose", "you definitely have", or "this will cure".
2. **No Medical Advice:** No personalized dosage, diagnosis, or instructions to start, stop, increase or decrease medication.
3. **Safe-Fail on Ambiguity:** If confidence is below threshold (< 0.60 for moderate/high, or < 0.40 for insufficient) or evidence conflicts, DO NOT force a medicine name. Show "Unable to identify this medicine reliably." with actionable next-step guidance. This is a successful, safe outcome—not an error.
4. **Zero Fabrication:** Never fabricate OCR text, barcode results, model accuracy, or medicine facts. If something is unavailable or undetectable, state it plainly.
5. **Clear Badging:** Anything using mock/demo logic must be visibly labelled **Demo Mode** or **Demo Recognition Mode**. Anything not yet built must be labelled **Future Enhancement**. Never claim clinical validation.
6. **Strictly Grounded Facts:** Medicine facts come ONLY from the Firestore `medicines` collection (each record has `source` and `verificationStatus`). The assistant may not invent facts beyond it.
7. **Privacy By Design:** Treat user images and scan data as private. Store only what is needed, per-user, with strict security rules.

## Engineering Rules
- **TypeScript Strict Mode:** `"strict": true`, no `any`, proper union types and interfaces.
- **Service Layer Architecture:** Modular services with clear interfaces (e.g. `RecognitionService`, `OcrService`, `FusionService`) so implementations (TF.js, Cloud endpoint, demo fallback) can be swapped without touching the UI.
- **Separation of Concerns:** Zero business logic inside UI components. Logic belongs in stores, hooks, or service modules.
- **Environment & Secrets:** Env-based configuration; never bundle secrets (e.g. Gemini API keys) in client code.
- **Resilient Async States:** Every async path must provide explicit `loading`, `success`, `empty`, and `error` states. The UI must never freeze.
- **Accessibility & UX:** WCAG 2.2 AA contrast, keyboard navigation, semantic HTML, ARIA labels, responsive mobile/tablet/desktop layouts.
