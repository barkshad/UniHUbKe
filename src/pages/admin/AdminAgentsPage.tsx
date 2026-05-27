import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAgents, createAgent, updateAgent, deleteAgent } from '../../services/firestore';
import { Agent } from '../../types';
import { Plus, Edit2, Trash2, X, Check, Upload, Loader2, Phone, MessageCircle, User, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToStorage } from '../../lib/storage';
import { cn } from '../../lib/utils';

export const AdminAgentsPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [photo, setPhoto] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      setAgents(await getAgents());
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setName(''); setPhone(''); setWhatsapp(''); setPhoto(''); setIsActive(true);
  };

  const handleEdit = (a: Agent) => {
    setEditingId(a.id || 'new');
    if (a.id) {
      setName(a.name);
      setPhone(a.phone);
      setWhatsapp(a.whatsappNumber);
      setPhoto(a.profilePhotoURL || '');
      setIsActive(a.isActive);
    } else {
      resetForm();
      setEditingId('new');
    }
  };

  const handleSave = async () => {
    if (!name || !phone || !whatsapp) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const payload = { name, phone, whatsappNumber: whatsapp, profilePhotoURL: photo, isActive };
      if (editingId === 'new') {
        const docRef = await createAgent(payload);
        setAgents([...agents, { id: docRef.id, ...payload }]);
        toast.success("Agent added successfully");
      } else if (editingId) {
        await updateAgent(editingId, payload);
        toast.success("Agent updated successfully");
        setAgents(agents.map(a => a.id === editingId ? { ...a, ...payload } : a));
      }
      resetForm();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from agents?`)) return;
    try {
      await deleteAgent(id);
      setAgents(agents.filter(a => a.id !== id));
      toast.success("Agent removed successfully");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.phone.includes(searchQuery)
  );

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Agents</h1>
          <p className="text-white/40 mt-1">{agents.length} agents in your team</p>
        </div>
        <button 
          onClick={() => handleEdit({} as Agent)} 
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Agent
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="input-premium pl-11 w-full"
        />
      </div>

      {/* Edit Form */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="glass-card overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">{editingId === 'new' ? 'Add New Agent' : 'Edit Agent'}</h2>
                <button onClick={resetForm} className="action-icon">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Full Name *</label>
                    <input 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Enter agent name"
                      className="input-premium" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Phone Number *</label>
                    <input 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      placeholder="+254..." 
                      className="input-premium" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">WhatsApp Number *</label>
                    <input 
                      value={whatsapp} 
                      onChange={e => setWhatsapp(e.target.value)} 
                      placeholder="+254..." 
                      className="input-premium" 
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Profile Photo</label>
                    {photo ? (
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/[0.08] group">
                        <img src={photo} className="w-full h-full object-cover" alt="Agent" />
                        <button 
                          type="button" 
                          onClick={() => setPhoto('')} 
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-white/[0.16] bg-surface-800/30 cursor-pointer transition-colors">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          disabled={uploading} 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploading(true);
                            try {
                              const res = await uploadToStorage(file, 'unihub/agents');
                              setPhoto(res.secure_url);
                            } catch (err) {
                              toast.error("Upload failed");
                            } finally {
                              setUploading(false);
                            }
                          }} 
                        />
                        {uploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-white/30" />
                            <span className="text-sm text-white/40">Upload photo</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-800/30 border border-white/[0.04]">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={isActive} 
                      onChange={e => setIsActive(e.target.checked)} 
                      className="w-5 h-5 rounded bg-surface-800 border-white/10 checked:bg-white checked:border-white"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                      Active Agent
                      <span className="block text-xs text-white/40 mt-0.5">Agent will be visible on listings</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/[0.04]">
                <button onClick={resetForm} className="btn-ghost">Cancel</button>
                <button onClick={handleSave} className="btn-primary">
                  {editingId === 'new' ? 'Add Agent' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agents Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 h-48 shimmer" />
          ))
        ) : filteredAgents.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-medium mb-1">No agents found</h3>
            <p className="text-white/40 text-sm mb-6">
              {searchQuery ? 'Try a different search term' : 'Add your first agent to get started'}
            </p>
            {!searchQuery && (
              <button onClick={() => handleEdit({} as Agent)} className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Agent
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredAgents.map((a, index) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card-interactive p-6 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-800 overflow-hidden shrink-0 border border-white/[0.06]">
                    {a.profilePhotoURL ? (
                      <img src={a.profilePhotoURL} alt={a.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display font-medium text-xl text-white/30">
                        {a.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-white truncate">{a.name}</h3>
                        <span className={cn(
                          "badge mt-1",
                          a.isActive ? "badge-success" : "badge-danger"
                        )}>
                          {a.isActive ? <><Check className="w-3 h-3" /> Active</> : <><X className="w-3 h-3" /> Inactive</>}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <Phone className="w-4 h-4" />
                    <span>{a.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/50">
                    <MessageCircle className="w-4 h-4" />
                    <span>{a.whatsappNumber}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(a)} 
                    className="btn-secondary flex-1 py-2 text-sm flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(a.id!, a.name)} 
                    className="btn-danger py-2 px-4 text-sm flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
