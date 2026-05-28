import React, { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/firestore';
import { Category } from '../../types';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [order, setOrder] = useState(0);

  const fetchCats = async () => {
    setLoading(true);
    try { setCategories(await getCategories()); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCats(); }, []);

  const handleEdit = (c: Category) => {
    setEditingId(c.id || 'new');
    if (c.id) {
       setName(c.name);
       setOrder(c.order);
    } else {
       setName('');
       setOrder(categories.length);
    }
  };

  const handleSave = async () => {
    if (!name) return toast.error("Name required");
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = { name, slug, order, isActive: true };
    
    try {
      if (editingId === 'new') {
        const ref = await createCategory(payload);
        setCategories([...categories, { id: ref.id, ...payload }].sort((a,b)=>a.order-b.order));
      } else if (editingId) {
        await updateCategory(editingId, payload);
        setCategories(categories.map(c => c.id === editingId ? { ...c, ...payload } : c).sort((a,b)=>a.order-b.order));
      }
      toast.success("Saved");
      setEditingId(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete category?")) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Deleted");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-medium">Categories</h1>
        <button onClick={() => handleEdit({} as Category)} className="bg-white text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Category
        </button>
      </div>

      {editingId && (
         <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex gap-4 items-end">
             <div className="flex-1">
                 <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                 <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white" />
             </div>
             <div className="w-24">
                 <label className="block text-sm font-medium text-zinc-400 mb-1">Order</label>
                 <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white" />
             </div>
             <button onClick={handleSave} className="px-6 py-2 bg-white text-black font-medium rounded-xl h-[42px]">Save</button>
             <button onClick={() => setEditingId(null)} className="px-4 py-2 text-zinc-400 h-[42px]">Cancel</button>
         </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800">
         {loading ? <div className="p-6 text-center text-zinc-500">Loading...</div> :
          categories.length === 0 ? <div className="p-6 text-center text-zinc-500">No categories</div> :
          categories.map(c => (
            <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/30">
               <GripVertical className="w-5 h-5 text-zinc-600 cursor-move" />
               <div className="flex-1">
                  <div className="font-medium text-white">{c.name}</div>
                  <div className="text-sm text-zinc-500">/{c.slug} • Order: {c.order}</div>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => handleEdit(c)} className="p-2 text-zinc-400 hover:text-white rounded-lg"><Edit2 className="w-4 h-4" /></button>
                 <button onClick={() => handleDelete(c.id!)} className="p-2 text-zinc-400 hover:text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};
