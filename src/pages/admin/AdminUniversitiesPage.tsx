import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { University } from '../../types';
import { getUniversities, deleteUniversity } from '../../services/firestore';
import toast from 'react-hot-toast';

export const AdminUniversitiesPage = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUniversities = async () => {
    try {
      const data = await getUniversities();
      setUniversities(data);
    } catch (err) {
      toast.error('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteUniversity(id);
      toast.success('University deleted successfully');
      setUniversities(universities.filter(u => u.id !== id));
    } catch (err) {
      toast.error('Failed to delete university');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-medium text-white mb-2">Universities</h1>
          <p className="text-zinc-400">Manage university partners and their profile pages.</p>
        </div>
        <Link 
          to="/admin/universities/new" 
          className="flex items-center gap-2 bg-brand-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors"
        >
          <Plus className="w-5 h-5" /> Add University
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-zinc-900">
            <thead className="bg-zinc-950/50">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400">University</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400">Location</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {universities.map(uni => (
                <tr key={uni.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                        {uni.logo_url ? <img src={uni.logo_url} className="w-full h-full object-contain p-1" /> : <Building className="w-5 h-5 text-zinc-500" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{uni.name}</p>
                        <p className="text-sm text-zinc-500">{uni.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{uni.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${uni.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {uni.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/universities/${uni.id}`} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(uni.id!, uni.name)} className="p-2 text-zinc-400 hover:text-red-500 bg-zinc-800 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {universities.length === 0 && (
                 <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No universities found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
