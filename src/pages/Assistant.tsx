import React, { useState, useEffect, useRef } from 'react';
import { useScanStore } from '../store/scanStore';
import { assistantService } from '../services/assistantService';
import {
  speakText,
  stopSpeaking,
  getSpeechRecognition,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported
} from '../services/voiceService';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isGrounded?: boolean;
}

const CHIPS_EN = [
  "What is the difference between Ibuprofen and Paracetamol?",
  "What are common drug interactions with blood thinners like Aspirin?",
  "Can you explain what an NDC code on a medicine package means?",
  "What side effects does Metformin cause and how should it be taken?",
  "How does pill visual recognition identify imprints and shapes?"
];

const CHIPS_TA = [
  "பாராசிட்டமால் (Paracetamol) எதற்காகப் பயன்படுகிறது?",
  "இப்யூபுரூஃபன் (Ibuprofen) பக்கவிளைவுகள் என்ன?",
  "மருந்துகளை உணவுடன் உட்கொள்வது ஏன் முக்கியம்?",
  "ஆஸ்பிரின் (Aspirin) மாத்திரை ரத்த உறைதலை எவ்வாறு தடுக்கிறது?",
  "மாத்திரையின் அடையாள முத்திரை (Imprint) என்றால் என்ன?"
];

export const Assistant: React.FC = () => {
  const { currentScanRecord } = useScanStore();
  const [selectedLang, setSelectedLang] = useState<'en' | 'ta'>('en');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoVoiceReply, setAutoVoiceReply] = useState(true);

  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I am PillSense AI Assistant powered by Google Gemini. I can speak and reply in English and Tamil (தமிழ்). Ask me anything about your medicines, dosage forms, side effects, or scan findings!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGrounded: true
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLang === 'ta' ? 'ta-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputPrompt(transcript);
          // Automatically send after speech detection
          handleSend(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [selectedLang]);

  const toggleListening = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech Recognition is not supported on this browser. Chrome or Edge is recommended.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      setIsSpeaking(false);
      if (recognitionRef.current) {
        recognitionRef.current.lang = selectedLang === 'ta' ? 'ta-IN' : 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleSpeakMessage = async (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await speakText(text, selectedLang);
      setIsSpeaking(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    stopSpeaking();
    setIsSpeaking(false);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await assistantService.askAssistant({
        userPrompt: query,
        scanContext: currentScanRecord || undefined,
        medicineRecord: currentScanRecord?.matchedMedicine || null,
        language: selectedLang
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGrounded: response.isGrounded
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Voice read-back if autoVoiceReply enabled
      if (autoVoiceReply && response.answer) {
        setIsSpeaking(true);
        try {
          await speakText(response.answer, selectedLang);
        } finally {
          setIsSpeaking(false);
        }
      }
    } catch {
      const fallbackText = selectedLang === 'ta'
        ? "தகவல் சரிபார்க்கப்பட்ட மருத்துவ தரவுத்தளத்தில் கிடைக்கவில்லை."
        : "That information is not available in the current verified data.";

      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGrounded: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 flex flex-col h-[calc(100vh-8rem)]">
      {/* Header with Language Selector & Voice Mode */}
      <div className="bg-white rounded-card border border-brand-border p-4 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
            <BotMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-brand-navy flex items-center gap-2">
              PillSense AI Voice & Text Assistant
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                Bilingual (EN / தமிழ்)
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {currentScanRecord
                ? `Context bound to Scan #${currentScanRecord.id.substring(0, 8)}`
                : 'General Clinical & Pharmaceutical Mode'}
            </p>
          </div>
        </div>

        {/* Controls: Language Toggle & Voice Reply */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700">
            <button
              type="button"
              onClick={() => setSelectedLang('en')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                selectedLang === 'en' ? 'bg-white text-brand-blue shadow-2xs' : 'hover:text-brand-navy'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              English
            </button>
            <button
              type="button"
              onClick={() => setSelectedLang('ta')}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                selectedLang === 'ta' ? 'bg-white text-brand-blue shadow-2xs' : 'hover:text-brand-navy'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Auto Voice Readout Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setAutoVoiceReply(!autoVoiceReply);
            }}
            title={autoVoiceReply ? 'Voice Readout Enabled' : 'Voice Readout Disabled'}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors ${
              autoVoiceReply
                ? 'bg-blue-50 border-blue-200 text-brand-blue font-medium'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {autoVoiceReply ? <Volume2 className="w-4 h-4 text-brand-blue" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[11px] hidden md:inline">Voice TTS</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white rounded-card border border-brand-border p-4 shadow-subtle overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-brand-blue text-white rounded-br-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
              }`}
            >
              {m.text}

              {/* Speaker icon on AI messages */}
              {m.sender === 'assistant' && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSpeakMessage(m.text)}
                    className="p-1 text-slate-400 hover:text-brand-blue rounded transition-colors"
                    title="Speak aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-blue" />
            <span>
              {selectedLang === 'ta'
                ? 'மருத்துவத் தகவலைத் தயாரிக்கிறது...'
                : 'Consulting pharmaceutical reference...'}
            </span>
          </div>
        )}
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(selectedLang === 'ta' ? CHIPS_TA : CHIPS_EN).map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(chip)}
            className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 hover:border-brand-blue text-slate-600 hover:text-brand-blue rounded-xl text-xs font-medium transition-colors shadow-2xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Voice & Text Input Bar */}
      <div className="bg-white rounded-card border border-brand-border p-2 shadow-subtle flex items-center gap-2">
        {/* Microphone Voice Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-md ring-4 ring-rose-200'
              : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-brand-blue'
          }`}
          title={isListening ? 'Listening (Click to stop)' : `Speak in ${selectedLang === 'ta' ? 'Tamil' : 'English'}`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            isListening
              ? selectedLang === 'ta' ? 'கேட்கிறது... தமிழில் பேசுங்கள்...' : 'Listening... Speak now...'
              : selectedLang === 'ta'
              ? 'மருந்துகள் பற்றி தமிழில் கேளுங்கள் அல்லது மைக் அழுத்தவும்...'
              : 'Ask anything about medicines, dosages, or click the mic to speak...'
          }
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || isLoading}
          className="p-2.5 bg-brand-blue hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-sm shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Persistent Disclaimer */}
      <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
        <AlertCircle className="w-3 h-3 text-slate-400" />
        <span>
          {selectedLang === 'ta'
            ? 'AI பதில்கள் தகவல் நோக்கத்திற்காக மட்டுமே. மருத்துவ ஆலோசனைக்கு உங்கள் மருத்துவரை அணுகவும்.'
            : 'AI-generated explanations are informational only. Always verify medications with a licensed doctor or pharmacist.'}
        </span>
      </div>
    </div>
  );
};
