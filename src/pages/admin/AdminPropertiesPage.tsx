import React, { useEffect, useState } from 'react';
import { getProperties, deleteProperty } from '../../services/firestore';
import { Property } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Home } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

export const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProps = async () => {
    setLoading(true);
    try {
      setProperties(await getProperties());
    } catch (err: any) {
      toast.error("Failed to load properties: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProps();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteProperty(id);
      toast.success("Property deleted");
      setProperties(properties.filter(p => p.id !== id));
    } catch (e: any) {
      toast.error("Deletion failed: " + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-display font-medium">Properties</h1>
        <Link 
          to="/admin/properties/new" 
          className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Property
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-800/50 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Property</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Price/Mo</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Loading properties...</td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center flex flex-col items-center">
                    <Home className="w-8 h-8 text-zinc-700 mb-2" />
                    <span className="text-zinc-500">No properties found</span>
                  </td>
                </tr>
              ) : (
                properties.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{p.title}</div>
                      <div className="text-zinc-500 text-xs mt-1">{p.location}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(p.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider border ${
                        p.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        p.status === 'occupied' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                       <Link to={`/admin/properties/${p.id}`} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                         <Edit2 className="w-4 h-4" />
                       </Link>
                       <button onClick={() => handleDelete(p.id!, p.title)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
