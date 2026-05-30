import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Home, Search, School } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Hostel, University } from '../../types';
import { getHostels, deleteHostel, getUniversities } from '../../services/firestore';
import toast from 'react-hot-toast';

export const AdminHostelsPage = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [universities, setUniversities] = useState<Record<string, University>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [hostelsData, uniData] = await Promise.all([
         getHostels(),
         getUniversities()
      ]);
      setHostels(hostelsData);
      
      const uniMap: Record<string, University> = {};
      uniData.forEach(u => uniMap[u.id!] = u);
      setUniversities(uniMap);
    } catch (err) {
      toast.error('Failed to load hostels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteHostel(id);
      toast.success('Hostel deleted successfully');
      setHostels(hostels.filter(h => h.id !== id));
    } catch (err) {
      toast.error('Failed to delete hostel');
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-medium text-white mb-2">Hostels</h1>
          <p className="text-zinc-400">Manage official university hostels.</p>
        </div>
        <Link 
          to="/admin/hostels/new" 
          className="flex items-center gap-2 bg-brand-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Hostel
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-zinc-900">
            <thead className="bg-zinc-950/50">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400">Hostel</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400">University</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400">Type</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {hostels.map(hostel => (
                <tr key={hostel.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                        <Home className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{hostel.name}</p>
                        <p className="text-sm text-zinc-500">{hostel.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2 text-zinc-300">
                        <School className="w-4 h-4 text-zinc-500" />
                        {universities[hostel.universityId]?.name || 'Unknown'}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 capitalize">{hostel.hostel_type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${hostel.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {hostel.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Link to={`/admin/hostels/${hostel.id}/rooms`} className="px-3 py-1.5 text-xs font-medium bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors">
                        Rooms
                      </Link>
                      <Link to={`/admin/hostels/${hostel.id}`} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(hostel.id!, hostel.name)} className="p-2 text-zinc-400 hover:text-red-500 bg-zinc-800 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {hostels.length === 0 && (
                 <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No hostels found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
