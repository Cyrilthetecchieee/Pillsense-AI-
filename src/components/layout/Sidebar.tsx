import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Scan,
  BotMessageSquare,
  Database,
  History,
  BarChart3,
  Info,
  Settings,
  Pill,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/detect', label: 'Detect Pill', icon: Scan, highlight: true },
  { to: '/assistant', label: 'AI Assistant', icon: BotMessageSquare },
  { to: '/database', label: 'Medicine Database', icon: Database },
  { to: '/history', label: 'Scan History', icon: History },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/about', label: 'About System', icon: Info },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-brand-card border-r border-brand-border flex flex-col justify-between hidden md:flex shrink-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-brand-border gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-sm">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-brand-navy tracking-tight text-base flex items-center gap-1.5">
              PillSense AI
              <span className="text-[10px] font-semibold bg-blue-100 text-brand-blue px-1.5 py-0.5 rounded-full">
                BETA
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Vision & OCR Recognition</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <NavLink
            to="/detect"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Scan className="w-4 h-4" />
            <span>New Scan</span>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-brand-blue font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-brand-navy'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Model & Version Status */}
      <div className="p-4 border-t border-brand-border">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
            <span>Active Engine</span>
          </div>
          <div className="text-slate-500 text-[11px] flex justify-between items-center">
            <span>Model:</span>
            <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
              v1.0-demo-calibrated
            </span>
          </div>
          <div className="text-slate-500 text-[11px] flex justify-between items-center mt-1">
            <span>Status:</span>
            <span className="text-emerald-700 font-medium">Demo Ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
