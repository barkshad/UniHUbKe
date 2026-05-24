import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const MasterLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  
  if (localStorage.getItem('unihub_master_auth') === 'true') {
    return <Navigate to="/system-core/dashboard" replace />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '123456') {
      localStorage.setItem('unihub_master_auth', 'true');
      navigate('/system-core/dashboard');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="glass-panel p-10 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="mb-8 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center"><Lock className="w-5 h-5"/></div>
             <div>
               <h1 className="text-xl font-display font-medium text-white tracking-tight">System Core</h1>
               <p className="text-white/50 text-xs">Master Control Panel</p>
             </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Core Access Token"
                className={`w-full bg-surface-800/80 backdrop-blur border ${error ? 'border-rose-500/50' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors text-sm`}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white text-black py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              Authenticate <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
