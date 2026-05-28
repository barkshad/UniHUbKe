import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';

export const AdminLoginPage = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 flex-none text-white animate-spin" /></div>;
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      // toast is already handled in login context mostly, but just in case
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-700">
             <span className="font-display font-medium text-white">UH</span>
          </div>
          <h1 className="text-2xl font-display font-medium text-white">Admin Login</h1>
          <p className="text-zinc-500 mt-2 text-sm text-balance">Sign in to manage UniHub properties, agents, and settings.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email address</label>
             <input 
               type="email" 
               required
               value={email}
               onChange={e => setEmail(e.target.value)}
               className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
               placeholder="admin@unihub.com"
             />
          </div>
          <div>
             <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
             <input 
               type="password" 
               required
               value={password}
               onChange={e => setPassword(e.target.value)}
               className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
               placeholder="••••••••"
             />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-white text-black font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-6"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};
