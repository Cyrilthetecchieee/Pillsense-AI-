import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SafetyBanner } from './SafetyBanner';
import { MobileNav } from './MobileNav';
import { Bell, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MainLayout: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-navy">
      <SafetyBanner />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-y-auto pb-16 md:pb-0">
          {/* Top Bar */}
          <header className="h-14 border-b border-brand-border bg-white flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
            <div className="text-sm font-semibold text-slate-700">
              PillSense AI – Preliminary Medicine Identification
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-medium text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-full">
                Active Firestore Sync
              </span>
              <button
                type="button"
                className="p-1.5 text-slate-500 hover:text-brand-navy rounded-lg hover:bg-slate-100 transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="User"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-6 h-6 text-slate-400" />
                )}
                <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
                  {currentUser?.displayName || userProfile?.displayName || 'Guest User'}
                </span>
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-1"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Page Outlet */}
          <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
