import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pill,
  Scan,
  ShieldCheck,
  BotMessageSquare,
  Database,
  ArrowRight,
  AlertCircle,
  Eye,
  Type,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { authService } from '../services/authService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isLoginView) {
        await authService.login(email, password);
      } else {
        await authService.register(email, password, displayName);
      }
      setAuthModalOpen(false);
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestDemo = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-brand-surface text-brand-navy flex flex-col selection:bg-brand-blue selection:text-white">
      {/* Top Persistent Safety Strip */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-center gap-2 select-none">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Preliminary AI Identification Aid</strong> – Built for preliminary recognition. Never a substitute for consultation with a licensed doctor or pharmacist.
        </span>
      </div>

      {/* Navigation Header */}
      <header className="h-16 border-b border-brand-border bg-white sticky top-0 z-30 px-6 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-sm">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-brand-navy text-lg tracking-tight">
              PillSense AI
            </span>
            <span className="ml-2 text-[10px] font-bold bg-blue-100 text-brand-blue px-2 py-0.5 rounded-full uppercase">
              Clinical Vision
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGuestDemo}
            className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold text-slate-700 hover:text-brand-blue hover:bg-slate-50 rounded-xl transition-colors"
          >
            Explore Demo Mode
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginView(true);
              setAuthModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-brand-blue bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginView(false);
              setAuthModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold bg-brand-blue hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-brand-blue text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dual-Engine Recognition: CNN Visual Embeddings + Surface OCR</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-brand-navy tracking-tight leading-tight md:leading-[1.15]">
            Preliminary Medicine Identification. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-teal">
              Deterministic, Grounded & Honest.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
            PillSense AI combines deep neural classification with surface imprint character extraction and openFDA verified catalogs. When evidence conflicts or image quality is poor, our engine safe-fails rather than hallucinating dangerous drug names.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGuestDemo}
              className="w-full sm:w-auto px-7 py-3.5 bg-brand-blue hover:bg-blue-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-elevated transition-all transform hover:-translate-y-0.5"
            >
              <Scan className="w-4 h-4" />
              <span>Launch Medicine Scanner</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginView(false);
                setAuthModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              31-Class Calibrated Model (T=1.28)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              In-Browser Tesseract.js Worker
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Zero Hallucinated Facts (openFDA)
            </span>
          </div>
        </div>
      </section>

      {/* Architectural Pillars / Features */}
      <section className="bg-white border-y border-brand-border py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="text-xs font-bold text-brand-teal uppercase tracking-wider">
              Engineering Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
              Four Pillars of Honest Preliminary Identification
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-card border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-brand-navy text-sm">Visual CNN Recognition</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dual-head EfficientNetV2-B0 trained with temperature scaling and calibrated softmax to recognize geometric contour and color attributes.
              </p>
            </div>

            <div className="p-6 rounded-card border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Type className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-brand-navy text-sm">Surface Imprint OCR</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-pass Tesseract worker with CLAHE contrast enhancement extracts alphanumeric debossings to disambiguate identical dosage strengths.
              </p>
            </div>

            <div className="p-6 rounded-card border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-brand-navy text-sm">Deterministic Fusion</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Balances visual confidence, imprint match, and sensor quality. Applies heavy penalties if visual shape and imprint text point to different drugs.
              </p>
            </div>

            <div className="p-6 rounded-card border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-brand-navy text-sm">Safe-Fail Protocol</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If confidence falls below threshold or evidence conflicts, the system states "Unable to identify reliably" rather than guessing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Honesty Protocol Callout */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 to-brand-navy rounded-3xl p-8 sm:p-12 text-white shadow-elevated space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Strict Regulatory & Safety Guardrails</h3>
              <p className="text-xs text-slate-300">Non-negotiable ethical commitments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="font-semibold text-white block">No Personalized Dosage</span>
              <p className="text-[11px] text-slate-400">PillSense AI will never generate dosage instructions or therapeutic prescriptions.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="font-semibold text-white block">No Clinical Diagnoses</span>
              <p className="text-[11px] text-slate-400">The assistant explains visual features and FDA labels only; it never diagnoses ailments.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="font-semibold text-white block">Verified Data Grounding</span>
              <p className="text-[11px] text-slate-400">All drug information is strictly drawn from openFDA and DailyMed clinical records.</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <span className="font-semibold text-white block">Zero Forced Predictions</span>
              <p className="text-[11px] text-slate-400">Out-of-distribution or unrecognizable items trigger the safe-fail screen automatically.</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleGuestDemo}
              className="px-5 py-2.5 bg-brand-blue hover:bg-blue-600 text-white font-medium text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
            >
              <span>Test Interactive Demo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-brand-border bg-white py-8 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-brand-blue" />
            <span className="font-bold text-brand-navy">PillSense AI</span>
            <span>– Preliminary Medicine Identification System</span>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/about')} className="hover:text-brand-blue">
              About Architecture
            </button>
            <button type="button" onClick={() => navigate('/database')} className="hover:text-brand-blue">
              Drug Reference
            </button>
            <button type="button" onClick={() => navigate('/analytics')} className="hover:text-brand-blue">
              Model Metrics
            </button>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-brand-navy font-bold text-base">
                <Pill className="w-5 h-5 text-brand-blue" />
                {isLoginView ? 'Sign in to PillSense AI' : 'Create PillSense Account'}
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {authError}
              </div>
            )}

            {/* Google Authentication Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={async () => {
                  setAuthError(null);
                  setAuthLoading(true);
                  try {
                    await authService.loginWithGoogle();
                    setAuthModalOpen(false);
                    navigate('/dashboard');
                  } catch (err: any) {
                    setAuthError(err?.message || 'Google sign-in failed.');
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                disabled={authLoading}
                className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2.5 shadow-2xs transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                Or with Email
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {!isLoginView && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Dr. Alex Mercer"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-blue"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-blue"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-blue"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-brand-blue hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors mt-2"
              >
                {authLoading ? 'Verifying...' : isLoginView ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setAuthError(null);
                }}
                className="text-xs text-brand-blue hover:underline font-semibold"
              >
                {isLoginView ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
