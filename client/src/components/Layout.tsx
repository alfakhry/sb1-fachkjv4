/**
 * Main layout component — dark indigo sidebar + main content area (RTL).
 */

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconZap() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconCog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: 'لوحة التحكم', icon: <IconDashboard /> },
  { path: '/customers', label: 'قوائم الجمهور', icon: <IconUsers /> },
  { path: '/sequences', label: 'الأتمتة', icon: <IconZap /> },
  { path: '/settings', label: 'الإعدادات', icon: <IconCog /> },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-row-reverse" style={{ backgroundColor: '#F1F5F9' }}>
      <aside
        className="w-60 flex flex-col flex-shrink-0"
        style={{ backgroundColor: '#1E1B4B' }}
      >
        <div className="px-6 py-7" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 className="text-lg font-bold text-white leading-tight tracking-wide">
            سلة × مبيعات
          </h1>
          <p className="text-xs mt-1.5" style={{ color: '#A5B4FC' }}>
            لوحة التحكم الذكية
          </p>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive ? 'text-white' : 'hover:bg-white/10'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: '#4F46E5', color: '#ffffff' }
                  : { color: '#C7D2FE' }
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-xs text-center" style={{ color: '#6366F1' }}>
            الإصدار 2.1
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
