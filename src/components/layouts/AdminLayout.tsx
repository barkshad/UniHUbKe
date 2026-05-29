import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Home, Users, Tag, Settings, LogOut, Menu, X, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { useState } from 'react';

export const AdminLayout = () => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', end: true },
    { to: '/admin/properties', icon: <Home className="w-5 h-5" />, label: 'Properties' },
    { to: '/admin/cms', icon: <Monitor className="w-5 h-5" />, label: 'Site Builder' },
    { to: '/admin/agents', icon: <Users className="w-5 h-5" />, label: 'Agents' },
    { to: '/admin/categories', icon: <Tag className="w-5 h-5" />, label: 'Categories' },
    { to: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row text-white">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
        <div className="text-xl font-display font-medium tracking-tight">UniHub Admin</div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-400 hover:text-white">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 bg-zinc-900 border-r border-zinc-800 flex-col transition-transform duration-300 fixed md:relative z-40 inset-y-0 left-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          mobileMenuOpen ? "flex" : "hidden md:flex"
        )}
      >
        <div className="p-6 border-b border-zinc-800 hidden md:block">
          <div className="text-2xl font-display font-medium tracking-tight">UniHub Admin</div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
