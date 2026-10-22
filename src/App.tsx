import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { DetectPill } from './pages/DetectPill';
import { Result } from './pages/Result';
import { Assistant } from './pages/Assistant';
import { MedicineDatabase } from './pages/MedicineDatabase';
import { ScanHistory } from './pages/ScanHistory';
import { Analytics } from './pages/Analytics';
import { AboutSystem } from './pages/AboutSystem';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated / App Workspace Layout */}
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="detect" element={<DetectPill />} />
            <Route path="result" element={<Result />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="database" element={<MedicineDatabase />} />
            <Route path="history" element={<ScanHistory />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="about" element={<AboutSystem />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
