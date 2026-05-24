import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Listing } from '../types';
import { Plus, Edit2, Trash2, Building, AlertCircle, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const LandlordDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quick form state for demo
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', type: 'apartment', location: '', contactEmail: '', contactPhone: '', contactWhatsapp: '', status: 'available', images: [] as string[]
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    
    try {
      const { uploadToCloudinary } = await import('../lib/cloudinary');
      const uploadedUrls = await Promise.all(
        files.map(file => uploadToCloudinary(file))
      );
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    } catch (err: any) {
      setError("Failed to upload images. Check console.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    if (!authLoading && !user) navigate('/');
    if (!authLoading && user && user.role !== 'landlord') {
      // In a real app we might show an upgrade prompt. 
      // For this prototype, we'll allow an easy switch or strictly redirect.
      // We will assume they are or will be a landlord for now.
    }
  }, [user, authLoading, navigate]);

  const fetchListings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'listings'), where('landlordId', '==', user.id));
      const snap = await getDocs(q);
      setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Listing)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    
    try {
      const newListing = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        type: formData.type,
        location: formData.location,
        landlordId: user.id,
        contactEmail: formData.contactEmail || null,
        contactPhone: formData.contactPhone || null,
        contactWhatsapp: formData.contactWhatsapp || null,
        status: formData.status,
        images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'], // Fallback if no images
        createdAt: Date.now(),
        isVerified: false,
      };

      // Strip nulls to not violate firestore blueprint
      const cleanedListing = Object.fromEntries(Object.entries(newListing).filter(([_, v]) => v != null));
      
      await addDoc(collection(db, 'listings'), cleanedListing);
      setShowForm(false);
      setFormData({ title: '', description: '', price: '', type: 'apartment', location: '', contactEmail: '', contactPhone: '', contactWhatsapp: '', status: 'available', images: [] });
      fetchListings();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteDoc(doc(db, 'listings', listingId));
        fetchListings();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (authLoading || loading) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-6 max-w-6xl py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-display font-medium mb-2">Landlord Dashboard</h1>
          <p className="text-white/50">Manage your real estate portfolio.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Add Property
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-[2rem] mb-12 border border-brand-500/20">
          <h2 className="text-2xl font-display mb-6 text-brand-400">Add New Property</h2>
          {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl mb-6 flex items-center gap-3"><AlertCircle className="w-5 h-5"/> {error}</div>}
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-white/50">Title</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500" placeholder="Cozy Studio Near Campus" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/50">Price/month ($)</label>
              <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500" placeholder="800" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/50">Property Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500">
                <option value="apartment">Apartment</option>
                <option value="hostel">Hostel</option>
                <option value="bedsitter">Bedsitter</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/50">Location</label>
              <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500" placeholder="123 University Ave" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-white/50">Property Images</label>
              <div className="p-6 border-2 border-dashed border-white/10 rounded-xl bg-surface-800 text-center relative hover:border-brand-500/50 transition-colors">
                 <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed text-[0px]" title="" />
                 <div className="flex flex-col items-center justify-center pointer-events-none">
                    {uploading ? (
                      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    ) : (
                      <Plus className="w-8 h-8 text-white/30 mb-2" />
                    )}
                    <p className="text-white/70 font-medium">{uploading ? 'Uploading...' : 'Click or drag images to upload'}</p>
                    <p className="text-xs text-white/40 mt-1">Supports JPG, PNG (Max 5MB)</p>
                 </div>
              </div>
              
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {formData.images.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10 group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-white/50">Description</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500" placeholder="Describe the property..."></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/50">Contact WhatsApp</label>
              <input value={formData.contactWhatsapp} onChange={e => setFormData({...formData, contactWhatsapp: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500" placeholder="+1234567890" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/50">Contact Email</label>
              <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500" placeholder="contact@example.com" />
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-full text-white/70 hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-colors">Publish Listing</button>
            </div>
          </form>
        </motion.div>
      )}

      {listings.length === 0 ? (
        <div className="text-center py-20 bg-surface-800/50 rounded-[2rem] border border-white/5 border-dashed">
          <Building className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No properties yet</h3>
          <p className="text-white/50 mb-6">You haven't listed any properties. Add your first one to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <div key={listing.id} className="bg-surface-800 border border-white/5 rounded-2xl overflow-hidden group hover:border-white/20 transition-colors">
              <div className="h-40 bg-surface-900 relative">
                {listing.images?.[0] && <img src={listing.images[0]} alt="" className="w-full h-full object-cover opacity-80" />}
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity backdrop-blur-[2px]">
                   <button onClick={() => navigate(`/listings/${listing.id}`)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur"><Edit2 className="w-5 h-5"/></button>
                   <button onClick={() => handleDelete(listing.id)} className="p-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-full text-rose-400 backdrop-blur"><Trash2 className="w-5 h-5"/></button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium font-display truncate pr-4 text-lg">{listing.title}</h3>
                  <span className={cn("text-xs px-2 py-1 rounded-full border shrink-0", listing.status === 'available' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/10 border-white/20 text-white/50')}>{listing.status}</span>
                </div>
                <p className="text-brand-400 font-medium mb-3">${listing.price}<span className="text-white/40 text-sm font-normal">/mo</span></p>
                <div className="text-xs text-white/40 flex items-center justify-between border-t border-white/5 pt-3">
                   <span>{listing.type}</span>
                   <span>{listing.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
