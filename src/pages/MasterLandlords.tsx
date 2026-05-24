import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from '../types';
import { Trash2, Users } from 'lucide-react';
import { motion } from 'motion/react';

export const MasterLandlords = () => {
  const [landlords, setLandlords] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandlords = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const users = snap.docs.map(d => ({ ...d.data(), id: d.id } as User));
        setLandlords(users.filter(u => u.role === 'landlord'));
      } catch (err) {
         console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandlords();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete landlord: ${name}?`)) {
      try {
        await deleteDoc(doc(db, 'users', id));
        setLandlords(landlords.filter(l => l.id !== id));
      } catch(err) {
        alert("Failed to delete.");
      }
    }
  };

  if (loading) {
     return <div className="p-8 text-white/50 animate-pulse">Loading engine metrics...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-medium text-white mb-2">Landlords Directory</h1>
        <p className="text-white/50 text-sm">Review, suspend, or remove property owners across the system.</p>
      </div>

      <div className="glass-panel border-white/5 overflow-hidden rounded-2xl">
        <div className="p-4 border-b border-white/5 flex gap-4 items-center bg-white/5">
           <Users className="w-4 h-4 text-white/60" />
           <span className="text-sm font-medium">Registered Accounts</span>
        </div>
        <div className="divide-y divide-white/5">
          {landlords.map(ll => (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={ll.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-surface-800 border border-white/10 rounded-full flex items-center justify-center text-sm font-bold uppercase">{ll.name[0]}</div>
                 <div>
                   <h4 className="font-medium text-sm text-white">{ll.name}</h4>
                   <p className="text-xs text-white/50">{ll.email}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <span className="px-2.5 py-1 rounded bg-green-500/10 text-green-400 text-[10px] uppercase font-bold tracking-wider">Active</span>
                 <button onClick={() => handleDelete(ll.id, ll.name)} className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-400 transition-colors" title="Remove Landlord"><Trash2 className="w-4 h-4"/></button>
              </div>
            </motion.div>
          ))}
          {landlords.length === 0 && <div className="p-8 text-center text-white/50 text-sm">No landlords registered yet.</div>}
        </div>
      </div>
    </div>
  );
};
