import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getProperties, deleteProperty, pushMockListingsLive } from '../../services/firestore';
import { Property } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Home, RefreshCw, Search, Filter, MoreHorizontal, Eye, MapPin, Building } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushingLive, setPushingLive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
      toast.success("Property deleted successfully");
      setProperties(properties.filter(p => p.id !== id));
    } catch (e: any) {
      toast.error("Deletion failed: " + e.message);
    }
  };

  const handlePushLive = async () => {
    if (!window.confirm("This will instantly add 22 mock listings to the site. Proceed?")) return;
    setPushingLive(true);
    try {
      await pushMockListingsLive();
      toast.success("Successfully pushed 22 mock listings live!");
      fetchProps();
    } catch (err: any) {
      toast.error("Failed to push listings: " + err.message);
    } finally {
      setPushingLive(false);
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Properties</h1>
          <p className="text-white/40 mt-1">{properties.length} total properties in your portfolio</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePushLive}
            disabled={pushingLive}
            className="btn-secondary flex items-center gap-2"
          >
            {pushingLive ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Push Demo Data"}
          </button>
          <Link 
            to="/admin/properties/new" 
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Property
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input-premium pl-11 w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-premium w-auto min-w-[140px] appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th className="w-[45%]">Property</th>
                <th>Price/Mo</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4}>
                      <div className="h-16 bg-surface-800/30 rounded-lg shimmer" />
                    </td>
                  </tr>
                ))
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-16 text-center"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto mb-4">
                        <Building className="w-8 h-8 text-white/20" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No properties found</h3>
                      <p className="text-white/40 text-sm mb-6">
                        {searchQuery || statusFilter !== 'all' 
                          ? 'Try adjusting your search or filters' 
                          : 'Get started by adding your first property'}
                      </p>
                      {!searchQuery && statusFilter === 'all' && (
                        <Link to="/admin/properties/new" className="btn-primary inline-flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Add Property
                        </Link>
                      )}
                    </motion.div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredProperties.map((p, index) => (
                    <motion.tr 
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-surface-800 overflow-hidden shrink-0 border border-white/[0.04]">
                            {p.media?.[0] ? (
                              <img 
                                src={p.media[0].secure_url} 
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Home className="w-5 h-5 text-white/20" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate max-w-[280px]">{p.title}</div>
                            <div className="flex items-center gap-1.5 text-white/40 text-xs mt-0.5">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[240px]">{p.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium text-white">{formatCurrency(p.price)}</span>
                      </td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <Link 
                            to={`/properties/${p.id}`} 
                            className="action-icon"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link 
                            to={`/admin/properties/${p.id}`} 
                            className="action-icon"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(p.id!, p.title)} 
                            className="action-icon-danger"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    available: 'badge-success',
    occupied: 'badge-danger',
    hidden: 'badge-neutral',
  };

  return (
    <span className={cn("badge capitalize", styles[status] || 'badge-neutral')}>
      {status}
    </span>
  );
};
