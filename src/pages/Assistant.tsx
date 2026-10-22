import React, { useState } from 'react';
import { useScanStore } from '../store/scanStore';
import { assistantService } from '../services/assistantService';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isGrounded?: boolean;
}

const SUGGESTED_CHIPS = [
  "What is the difference between Ibuprofen and Paracetamol?",
  "What are common drug interactions with blood thinners like Aspirin?",
  "Can you explain what an NDC code on a medicine package means?",
  "What side effects does Metformin cause and how should it be taken?",
  "How does pill visual recognition identify imprints and shapes?"
];

export const Assistant: React.FC = () => {
  const { currentScanRecord } = useScanStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hello! I am PillSense AI Assistant powered by Google Gemini. I explain preliminary visual CNN findings, OCR surface imprints, and verified FDA drug monograph details. How can I assist you with your medications today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isGrounded: true
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

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
        medicineRecord: currentScanRecord?.matchedMedicine || null
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGrounded: response.isGrounded
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "That information is not available in the current verified data.",
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
      {/* Header */}
      <div className="bg-white rounded-card border border-brand-border p-4 shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
            <BotMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-brand-navy flex items-center gap-2">
              PillSense AI Assistant
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Strict Grounding Active
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {currentScanRecord
                ? `Context bound to Scan #${currentScanRecord.id.substring(0, 10)}`
                : 'No active scan context bound; answers general catalog questions.'}
            </p>
          </div>
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
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-blue" />
            <span>Consulting verified catalog reference...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {SUGGESTED_CHIPS.map((chip, idx) => (
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

      {/* Input Bar */}
      <div className="bg-white rounded-card border border-brand-border p-2 shadow-subtle flex items-center gap-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about the detected medicine, imprints, or warnings..."
          className="flex-1 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || isLoading}
          className="p-2.5 bg-brand-blue hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Persistent Assistant Safety Disclaimer */}
      <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
        <AlertCircle className="w-3 h-3 text-slate-400" />
        <span>
          AI-generated explanations are informational and strictly grounded in the database. Never substitute for professional medical advice.
        </span>
      </div>
    </div>
  );
};
