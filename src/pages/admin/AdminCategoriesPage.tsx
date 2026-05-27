import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/firestore';
import { Category } from '../../types';
import { Plus, Edit2, Trash2, GripVertical, X, Tag, Hash, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [order, setOrder] = useState(0);

  const fetchCats = async () => {
    setLoading(true);
    try { 
      setCategories(await getCategories()); 
    } catch (e: any) { 
      toast.error(e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchCats(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setOrder(categories.length);
  };

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
    if (!name) return toast.error("Name is required");
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = { name, slug, order, isActive: true };
    
    try {
      if (editingId === 'new') {
        const ref = await createCategory(payload);
        setCategories([...categories, { id: ref.id, ...payload }].sort((a,b)=>a.order-b.order));
        toast.success("Category created");
      } else if (editingId) {
        await updateCategory(editingId, payload);
        setCategories(categories.map(c => c.id === editingId ? { ...c, ...payload } : c).sort((a,b)=>a.order-b.order));
        toast.success("Category updated");
      }
      resetForm();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}" category?`)) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Category deleted");
    } catch (e: any) { 
      toast.error(e.message); 
    }
  };

  return (
    <div className="admin-page max-w-3xl">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categories</h1>
          <p className="text-white/40 mt-1">{categories.length} categories for organizing properties</p>
        </div>
        <button 
          onClick={() => handleEdit({} as Category)} 
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Category
        </button>
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
                <h2 className="text-lg font-medium">{editingId === 'new' ? 'New Category' : 'Edit Category'}</h2>
                <button onClick={resetForm} className="action-icon">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white/60 mb-2">Category Name</label>
                  <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g., Bedsitter, Studio, 1 Bedroom"
                    className="input-premium" 
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-sm font-medium text-white/60 mb-2">Order</label>
                  <input 
                    type="number" 
                    value={order} 
                    onChange={e => setOrder(Number(e.target.value))} 
                    className="input-premium text-center" 
                  />
                </div>
              </div>
              
              {name && (
                <div className="mt-4 p-3 rounded-lg bg-surface-800/30 border border-white/[0.04]">
                  <span className="text-xs text-white/40 uppercase tracking-wider">Preview slug:</span>
                  <span className="text-sm font-mono text-white/70 ml-2">/{name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/[0.04]">
                <button onClick={resetForm} className="btn-ghost">Cancel</button>
                <button onClick={handleSave} className="btn-primary">
                  {editingId === 'new' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories List */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-surface-800/30 rounded-xl shimmer" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-medium mb-1">No categories yet</h3>
            <p className="text-white/40 text-sm mb-6">Create categories to organize your properties</p>
            <button onClick={() => handleEdit({} as Category)} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create First Category
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            <AnimatePresence mode="popLayout">
              {categories.map((c, index) => (
                <motion.div 
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="p-2 rounded-lg text-white/20 hover:text-white/40 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center shrink-0">
                    <Tag className="w-5 h-5 text-white/30" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white">{c.name}</div>
                    <div className="flex items-center gap-2 text-sm text-white/40 mt-0.5">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono">{c.slug}</span>
                      <span className="text-white/20">•</span>
                      <span>Order: {c.order}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(c)} 
                      className="action-icon"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id!, c.name)} 
                      className="action-icon-danger"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
