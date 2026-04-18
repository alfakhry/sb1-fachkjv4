/**
 * Main layout component — sidebar navigation + main content area.
 * Sidebar is positioned on the right side for RTL layout.
 */

import { NavLink, Outlet } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'لوحة التحكم', icon: '📊' },
  { path: '/customers', label: 'قوائم الجمهور', icon: '🎯' },
  { path: '/sequences', label: 'الأتمتة', icon: '⚡' },
  { path: '/settings', label: 'الإعدادات', icon: '⚙️' },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50 flex-row-reverse">
      <aside className="w-64 bg-white border-l border-slate-200 shadow-sm flex flex-col">
        <div className="px-6 py-6 border-b border-slate-100">
          <h1 className="text-lg font-bold text-slate-800 leading-tight">سلة × مبيعات</h1>
          <p className="text-xs text-slate-500 mt-1">لوحة التحكم الذكية</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">الإصدار 2.0</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
