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
            </div>
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

      <footer className="border-t border-white/5 py-16 mt-auto">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
               <div className="flex items-center gap-2 group mb-4">
                 <div className="w-8 h-8 rounded-lg bg-surface-900 border border-white/20 flex items-center justify-center text-white font-display font-medium overflow-hidden relative">
                   UH
                 </div>
                 <span className="text-xl font-display font-medium text-white transition-colors">UniHub</span>
               </div>
               <p className="text-white/50 max-w-sm leading-relaxed">
                 The premium housing platform. We connect renters with verified properties for a seamless living experience.
               </p>
            </div>

            <div>
              <h4 className="font-medium text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-sm text-white/50 hover:text-white transition-colors">Home</Link></li>
                <li><a href="mailto:hello@unihub.test" className="text-sm text-white/50 hover:text-white transition-colors">Contact</a></li>
                <li><Link to="/privacy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm text-white/50 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
             <p className="text-white/40 text-sm">
               &copy; {new Date().getFullYear()} UniHub. All rights reserved.
             </p>
             <div className="flex items-center gap-4">
                <Link to="/admin" className="text-white/40 hover:text-white transition-colors" title="Admin Portal">
                  <UserCircle2 className="w-5 h-5" />
                </Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
