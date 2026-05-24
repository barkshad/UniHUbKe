import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      localStorage.setItem('unihub_admin_auth', 'true');
      navigate('/admin');
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-10 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 mb-8 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-display font-medium text-white mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-white/50 text-sm mb-8">Enter your operations password to access the CMS.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`w-full bg-surface-800/50 border ${error ? 'border-rose-500/50' : 'border-white/10'} rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-500 transition-colors placeholder:text-white/30`}
                autoFocus
              />
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 text-xs mt-2 flex items-center gap-1 font-medium">
                  <ShieldAlert className="w-3 h-3" /> Invalid credentials
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition-all hover:scale-[1.02]"
            >
              Access System
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
