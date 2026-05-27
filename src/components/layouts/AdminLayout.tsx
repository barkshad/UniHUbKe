import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Tag, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Command,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export const AdminLayout = () => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/properties', icon: Home, label: 'Properties' },
    { to: '/admin/agents', icon: Users, label: 'Agents' },
    { to: '/admin/categories', icon: Tag, label: 'Categories' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col lg:flex-row text-white">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <span className="font-display font-medium text-sm">UH</span>
            </div>
            <span className="font-display font-medium tracking-tight">UniHub Admin</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 bg-surface-900/50 backdrop-blur-xl border-r border-white/[0.04] flex-col",
          "fixed lg:sticky inset-y-0 left-0 z-40 h-screen lg:h-auto lg:min-h-screen",
          "transition-transform duration-300 ease-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          mobileMenuOpen ? "flex" : "hidden lg:flex"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.04] hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-display font-semibold relative z-10">UH</span>
            </div>
            <div>
              <div className="font-display font-medium tracking-tight">UniHub</div>
              <div className="text-[10px] text-white/40 uppercase tracking-widest">Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="px-4 py-4 border-b border-white/[0.04]">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-800/50 border border-white/[0.04] text-white/40 hover:text-white/60 hover:border-white/[0.08] transition-all group"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">Quick search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] font-medium text-white/30">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative",
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-white/[0.08] rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className="w-[18px] h-[18px] relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                    <ChevronRight className={cn(
                      "w-4 h-4 ml-auto opacity-0 -translate-x-2 transition-all relative z-10",
                      "group-hover:opacity-50 group-hover:translate-x-0"
                    )} />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-white/[0.04]">
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all group"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setCommandPaletteOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4"
            >
              <div className="glass-card overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                  <Search className="w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search for pages, actions..."
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-white/30"
                    autoFocus
                  />
                  <kbd className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-xs text-white/30">
                    ESC
                  </kbd>
                </div>
                <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                  <div className="text-[10px] uppercase tracking-widest text-white/30 px-3 py-2">Pages</div>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setCommandPaletteOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
