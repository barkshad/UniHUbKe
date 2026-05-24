import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../components/AuthProvider';

export const AdminLogin = () => {
  const { signIn, user, loading } = useAuth();
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        setError(true);
      }
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn();
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-10 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-surface-900 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-8 flex items-center justify-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Lock className="w-8 h-8 text-white relative z-10" />
          </div>
          
          <h1 className="text-3xl font-display font-medium text-white mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-white/50 text-sm mb-8">Secure access to the UniHub Management System.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 text-sm mb-4 flex items-center gap-1 font-medium bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                  <ShieldAlert className="w-4 h-4 shrink-0" /> Unauthorized. Your account lacks administrative privileges.
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition-all hover:scale-[1.02]"
              disabled={loading}
            >
              Sign in with Google
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
