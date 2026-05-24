import React, { useState } from 'react';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { FileEdit, Users, LayoutDashboard, MonitorPlay, Settings, LogOut, Settings2, Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const MasterLayout = () => {
  const navigate = useNavigate();
  if (localStorage.getItem('unihub_master_auth') !== 'true') {
    return <Navigate to="/system-core" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('unihub_master_auth');
    navigate('/system-core');
  };

  return (
    <div className="flex h-screen bg-surface-900 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-surface-900 flex flex-col shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-xs font-bold text-black border border-white/20"><Settings2 className="w-3 h-3" /></div>
            <span className="font-display font-medium text-sm tracking-wide text-white">Master CMS</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <NavLink to="/system-core/dashboard" label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider text-white/30 font-bold">Content</div>
          <NavLink to="/system-core/hero" label="Hero Media" icon={<MonitorPlay className="w-4 h-4" />} />
          <NavLink to="/system-core/listings" label="All Listings" icon={<FileEdit className="w-4 h-4" />} />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider text-white/30 font-bold">Accounts</div>
          <NavLink to="/system-core/landlords" label="Landlords" icon={<Users className="w-4 h-4" />} />
          <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-wider text-white/30 font-bold">System</div>
          <NavLink to="/system-core/settings" label="Site Settings" icon={<Settings className="w-4 h-4" />} />
        </div>
        <div className="p-4 border-t border-white/5 shrink-0 flex items-center gap-2">
           <button onClick={() => window.open('/', '_blank')} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium flex items-center justify-center gap-2"><Eye className="w-3 h-3" /> View Site</button>
           <button onClick={handleLogout} className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors" title="Logout"><LogOut className="w-4 h-4" /></button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface-900/50">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const NavLink = ({ to, label, icon }: { to: string, label: string, icon: React.ReactNode }) => {
  const isActive = window.location.pathname.startsWith(to) && (to !== '/system-core' || window.location.pathname === '/system-core');
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        isActive ? "bg-white text-black shadow-md" : "text-white/60 hover:text-white hover:bg-white/10"
      )}
    >
      {icon}
      {label}
    </Link>
  );
};
