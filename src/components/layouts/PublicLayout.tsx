import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, UserCircle2, ArrowRight, Sparkles } from 'lucide-react';
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
    <div className={cn("min-h-screen flex flex-col bg-surface-950 selection:bg-white/20 selection:text-white")}>
      {/* Grain overlay */}
      <div className="grain" />
      
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled 
            ? "bg-surface-950/80 backdrop-blur-2xl border-b border-white/[0.04] py-3" 
            : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white font-display font-semibold overflow-hidden relative group-hover:border-white/[0.16] transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">UH</span>
            </div>
            <span className="text-xl font-display font-medium tracking-tight text-white">UniHub</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/listings" 
              className="text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.04]"
            >
              Find Housing
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <Link 
                  to="/admin" 
                  className="text-sm font-medium bg-white text-surface-900 px-5 py-2.5 rounded-xl hover:bg-white/90 transition-all flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                >
                  Admin Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link 
                  to="/admin/login" 
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors flex items-center gap-2 px-3 py-2"
                >
                  <UserCircle2 className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-surface-950/95 backdrop-blur-3xl pt-24 px-6 md:hidden"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col gap-4"
            >
              <Link 
                to="/listings" 
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-white/80 hover:text-white"
              >
                <Sparkles className="w-5 h-5" />
                Find Housing
              </Link>
              {user ? (
                <Link 
                  to="/admin" 
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white text-surface-900 font-medium"
                >
                  Admin Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link 
                  to="/admin/login" 
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-white/80 hover:text-white"
                >
                  <UserCircle2 className="w-5 h-5" />
                  Admin Login
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col pt-[72px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/[0.04] py-16 mt-auto bg-surface-900/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white font-display font-semibold">
                  UH
                </div>
                <span className="text-xl font-display font-medium text-white">UniHub</span>
              </div>
              <p className="text-white/40 max-w-sm leading-relaxed">
                The premium student housing platform. We connect students with verified properties for a seamless off-campus living experience.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-white/40 hover:text-white transition-colors">Contact</a></li>
                <li><Link to="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-white/40 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-white mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link to="/listings" className="text-sm text-white/40 hover:text-white transition-colors">Browse Listings</Link></li>
                <li><Link to="/admin" className="text-sm text-white/40 hover:text-white transition-colors">Admin Portal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
              &copy; {new Date().getFullYear()} UniHub. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-white/30 hover:text-white transition-colors" title="Admin Portal">
                <UserCircle2 className="w-5 h-5" />
              </Link>
              <a href="#" className="text-white/30 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" className="text-white/30 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
