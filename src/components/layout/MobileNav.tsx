import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Scan,
  BotMessageSquare,
  Database,
  History
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/detect', label: 'Detect', icon: Scan },
    { to: '/assistant', label: 'Assistant', icon: BotMessageSquare },
    { to: '/database', label: 'Medicines', icon: Database },
    { to: '/history', label: 'History', icon: History }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex justify-around py-2 shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-brand-blue font-semibold' : 'text-slate-500'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
