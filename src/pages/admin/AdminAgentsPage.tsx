import React, { useEffect, useState } from 'react';
import { getAgents, createAgent, updateAgent, deleteAgent } from '../../services/firestore';
import { Agent } from '../../types';
import { Plus, Edit2, Trash2, X, Check, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadToStorage } from '../../lib/storage';

export const AdminAgentsPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  
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
        toast.success("Agent added");
      } else if (editingId) {
        await updateAgent(editingId, payload);
        toast.success("Agent updated");
        setAgents(agents.map(a => a.id === editingId ? { ...a, ...payload } : a));
      }
      resetForm();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this agent?")) return;
    try {
      await deleteAgent(id);
      setAgents(agents.filter(a => a.id !== id));
      toast.success("Agent deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-display font-medium">Agents</h1>
        <button onClick={() => handleEdit({} as Agent)} className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Agent
        </button>
      </div>

      <div className="grid gap-6">
        {editingId && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-medium mb-6">{editingId === 'new' ? 'New Agent' : 'Edit Agent'}</h2>
            <div className="grid md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
               </div>
               <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-zinc-400">Agent Photo</label>
                  {photo ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border border-zinc-700 group mt-1">
                      <img src={photo} className="w-full h-full object-cover" alt="Agent" />
                      <button type="button" onClick={() => setPhoto('')} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full bg-zinc-950 border border-zinc-800 border-dashed hover:border-zinc-600 rounded-xl px-4 py-3 text-zinc-500 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors cursor-pointer relative h-[48px]">
                      <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={async (e) => {
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
                      }} />
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4" /> Upload Photo</>}
                    </label>
                  )}
               </div>
               <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Phone *</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">WhatsApp *</label>
                  <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+254..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
               </div>
               <div className="md:col-span-2 flex items-center gap-3">
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5 accent-white rounded" />
                  <label className="text-sm font-medium">Active Agent</label>
               </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
               <button onClick={resetForm} className="px-4 py-2 text-zinc-400 hover:text-white font-medium">Cancel</button>
               <button onClick={handleSave} className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200">Save</button>
            </div>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-800/50 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium uppercase min-w-[250px]">Agent</th>
                <th className="px-6 py-4 font-medium uppercase">Contact</th>
                <th className="px-6 py-4 font-medium uppercase">Status</th>
                <th className="px-6 py-4 font-medium uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                 <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Loading...</td></tr>
              ) : agents.length === 0 ? (
                 <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No agents found</td></tr>
              ) : (
                agents.map(a => (
                  <tr key={a.id} className="hover:bg-zinc-800/20">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-white/10">
                        {a.profilePhotoURL ? (
                           <img src={a.profilePhotoURL} alt={a.name} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center font-display font-medium text-white/50 bg-zinc-800">
                             {a.name.charAt(0)}
                           </div>
                        )}
                      </div>
                      <div className="font-medium text-white">{a.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-300">{a.phone}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">WA: {a.whatsappNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                       {a.isActive ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Check className="w-3 h-3"/> Active</span>
                       ) : (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><X className="w-3 h-3"/> Inactive</span>
                       )}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(a)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(a.id!)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
