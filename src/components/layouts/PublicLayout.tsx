import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home as HomeIcon, UserCircle2, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const PublicLayout = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className={cn("min-h-screen flex flex-col bg-surface-900 selection:bg-white/30 selection:text-white")}>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
          scrolled ? "bg-surface-900/80 backdrop-blur-xl border-white/5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)]" : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-surface-900 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center justify-center text-white font-display font-medium overflow-hidden relative group-hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              UH
            </div>
            <span className="text-xl font-display font-medium tracking-tight text-white group-hover:text-white/80 transition-colors">UniHub</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/listings" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Find Housing
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/admin" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Admin Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link to="/admin/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2">
                  <UserCircle2 className="w-4 h-4" />
                  Admin Login
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-surface-900/95 backdrop-blur-3xl pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-lg font-medium">
              <Link to="/listings" className="flex items-center gap-3 text-white/80 hover:text-white">
                <HomeIcon className="w-5 h-5" />
                Find Housing
              </Link>
              {user ? (
                <Link to="/admin" className="bg-white text-black px-6 py-3 rounded-xl justify-center hover:bg-white/90 transition-colors flex items-center gap-2 mt-4">
                  Admin Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link to="/admin/login" className="flex items-center gap-3 text-white/80 hover:text-white text-left">
                  <UserCircle2 className="w-5 h-5" />
                  Admin Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col pt-[72px]">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-md bg-surface-900 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] flex items-center justify-center text-white font-display font-medium text-xs overflow-hidden relative">
              UH
            </div>
            <span className="text-sm font-display font-medium text-white/80 group-hover:text-white transition-colors">UniHub</span>
          </div>
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} UniHub. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Terms</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
