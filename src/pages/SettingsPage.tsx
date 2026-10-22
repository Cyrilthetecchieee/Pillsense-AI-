import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Download, Trash2, Key } from 'lucide-react';
import { historyService } from '../services/historyService';

export const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('pillsense_gemini_key') ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
  const [fbConfig, setFbConfig] = useState({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localStorage.getItem('pillsense_fb_api_key') || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'pillsense-ai.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'pillsense-ai',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'pillsense-ai.appspot.com',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || localStorage.getItem('pillsense_fb_app_id') || ''
  });
  const [fbSaved, setFbSaved] = useState(false);

  const handleSaveFirebaseConfig = () => {
    localStorage.setItem('pillsense_fb_api_key', fbConfig.apiKey);
    localStorage.setItem('pillsense_fb_app_id', fbConfig.appId);
    setFbSaved(true);
    setTimeout(() => {
      setFbSaved(false);
      window.location.reload();
    }, 1500);
  };

  const handleSaveKey = () => {
    localStorage.setItem('pillsense_gemini_key', apiKey.trim());
    setFbSaved(true);
    setTimeout(() => setFbSaved(false), 2000);
  };

  const handleExportData = () => {
    const scans = historyService.getLocalCache();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scans, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pillsense_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearData = () => {
    if (confirm('Permanently delete all locally cached scan and session data?')) {
      historyService.clearAll('guest');
      alert('Local data successfully cleared.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-blue" />
          System Settings & Data Privacy
        </h1>
        <p className="text-sm text-slate-500">
          Configure local preferences, export user scans, and manage API environment keys.
        </p>
      </div>

      <div className="bg-white rounded-card border border-brand-border p-6 shadow-subtle space-y-6">
        <div>
          <h2 className="text-sm font-bold text-brand-navy mb-1">User Data Privacy & Storage</h2>
          <p className="text-xs text-slate-500 mb-4">
            PillSense AI adheres to strict data minimization. Scans are stored locally on your device or isolated in per-user private Firestore storage.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export My Scans (JSON)
            </button>
            <button
              type="button"
              onClick={handleClearData}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Local Storage
            </button>
          </div>
        </div>

        {/* Firebase Console Connection Card */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              Firebase Project Credentials (pillsense-ai)
            </h2>
            <a
              href="https://console.firebase.google.com/u/0/project/pillsense-ai/settings/general"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand-blue hover:underline flex items-center gap-1 font-medium"
            >
              Open Firebase Console Settings ↗
            </a>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Copy the Web App config keys from your Firebase Console (Project Overview → Project Settings → Your apps → SDK setup/configuration) to connect real Firebase Authentication & Firestore:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Web API Key (apiKey):</label>
              <input
                type="text"
                value={fbConfig.apiKey}
                onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-blue font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">App ID (appId):</label>
              <input
                type="text"
                value={fbConfig.appId}
                onChange={(e) => setFbConfig({ ...fbConfig, appId: e.target.value })}
                placeholder="1:123456789012:web:abcdef..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-blue font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveFirebaseConfig}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
            >
              {fbSaved ? 'Credentials Saved & Reloading...' : 'Save Firebase Credentials'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
