import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useAuth } from './AuthProvider';

export const AdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  if (loading) return null;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  const toggleMobile = () => setMobileOpen(prev => !prev);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex h-screen bg-surface-900 text-white font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-surface-900/50 backdrop-blur-xl shrink-0 hidden lg:flex flex-col relative z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeMobile} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }} className="fixed inset-y-0 left-0 w-64 bg-surface-900 border-r border-white/5 z-40 flex flex-col lg:hidden">
              <SidebarContent onClick={closeMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-surface-900/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={toggleMobile} className="p-2 lg:hidden text-white/70 hover:text-white bg-white/5 rounded-md hover:bg-white/10 transition-colors">
               <Menu className="w-5 h-5" />
             </button>
             <div className="text-sm font-medium text-white/50">Admin Command Center</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const SidebarContent = ({ onClick }: { onClick?: () => void }) => (
  <>
    <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0 justify-between">
      <div className="flex items-center gap-2 group">
        <div className="w-6 h-6 rounded-md bg-surface-900 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] flex items-center justify-center text-white font-display font-medium text-xs overflow-hidden relative">UH</div>
        <span className="font-display font-medium text-sm tracking-wide group-hover:text-white transition-colors">UniHub Admin</span>
      </div>
      {onClick && <button onClick={onClick} className="p-1 lg:hidden text-white/50 hover:text-white"><X className="w-5 h-5" /></button>}
    </div>
    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
      <AdminNavLink to="/admin" label="Dashboard" onClick={onClick} />
      <AdminNavLink to="/admin/listings" label="Listings CMS" onClick={onClick} />
      <AdminNavLink to="/admin/media" label="Media Manager" onClick={onClick} />
      <AdminNavLink to="/admin/users" label="Users" onClick={onClick} />
      <AdminNavLink to="/admin/content" label="Site Content" onClick={onClick} />
      <AdminNavLink to="/admin/settings" label="Settings" onClick={onClick} />
    </div>
    <div className="p-4 border-t border-white/5 shrink-0">
      <button 
        onClick={() => {
          if (onClick) onClick();
          // Rely on useAuth logout from context? Wait, SidebarContent isn't accessing it.
          // Let's just sign out globally.
          import('../lib/firebase').then(({ auth }) => {
            import('firebase/auth').then(({ signOut }) => {
              signOut(auth);
            });
          });
        }}
        className="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm font-medium text-left flex items-center gap-2"
      >
        Sign Out
      </button>
    </div>
  </>
);

const AdminNavLink = ({ to, label, onClick }: { to: string; label: string, onClick?: () => void }) => {
  const isActive = window.location.pathname === to;
  return (
    <a 
      href={to} 
      onClick={(e) => {
        if(onClick) onClick();
      }}
      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
    >
      {label}
    </a>
  );
};
