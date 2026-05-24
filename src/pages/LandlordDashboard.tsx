import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Listing } from '../types';
import { Plus, Edit2, Trash2, Building, AlertCircle, X, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const LandlordDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', type: 'apartment', location: '', 
    contactEmail: '', contactPhone: '', contactWhatsapp: '', status: 'available', images: [] as string[],
    deposit: '', university: '', distanceFromCampus: '', hasWifi: false, hasWater: false, genderRestriction: 'none', videoUrl: '', amenities: ''
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
        deposit: formData.deposit ? Number(formData.deposit) : null,
        university: formData.university || null,
        distanceFromCampus: formData.distanceFromCampus || null,
        hasWifi: formData.hasWifi,
        hasWater: formData.hasWater,
        genderRestriction: formData.genderRestriction,
        videoUrl: formData.videoUrl || null,
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
        type: formData.type,
        location: formData.location,
        landlordId: user.id,
        contactEmail: formData.contactEmail || null,
        contactPhone: formData.contactPhone || null,
        contactWhatsapp: formData.contactWhatsapp || null,
        status: formData.status,
        images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
        createdAt: Date.now(),
        isVerified: false,
      };

      const cleanedListing = Object.fromEntries(Object.entries(newListing).filter(([_, v]) => v != null && v !== ''));
      
      await addDoc(collection(db, 'listings'), cleanedListing);
      setShowForm(false);
      setFormData({ 
        title: '', description: '', price: '', type: 'apartment', location: '', contactEmail: '', contactPhone: '', contactWhatsapp: '', status: 'available', images: [],
        deposit: '', university: '', distanceFromCampus: '', hasWifi: false, hasWater: false, genderRestriction: 'none', videoUrl: '', amenities: ''
      });
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

  if (authLoading || loading) return <div className="p-20 text-center text-white/50">Loading Dashboard...</div>;

  return (
    <div className="container mx-auto px-6 max-w-6xl py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-display font-medium mb-2">Landlord CMS</h1>
          <p className="text-white/50">Manage your real estate portfolio on UniHub.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-white hover:bg-white/90 text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-colors shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <Plus className="w-5 h-5" />
          Add Property
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-[2rem] mb-12 border border-white/20 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]">
          <h2 className="text-2xl font-display mb-6 text-brand-400">New Listing Details</h2>
          {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl mb-6 flex items-center gap-3"><AlertCircle className="w-5 h-5"/> {error}</div>}
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-x-6 gap-y-5">
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white/70">Title / Catchphrase</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. Modern Studio Near Engineering Campus" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Monthly Rent ($)</label>
              <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="800" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Deposit ($) <span className="text-white/30 font-normal">(Optional)</span></label>
              <input type="number" value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="800" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Property Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors">
                <option value="apartment">Apartment</option>
                <option value="hostel">Hostel/Dorm</option>
                <option value="bedsitter">Bedsitter</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Full Address</label>
              <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="123 University Ave" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Target University <span className="text-white/30 font-normal">(Optional)</span></label>
              <input value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. State University" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Distance from Campus <span className="text-white/30 font-normal">(Optional)</span></label>
              <input value={formData.distanceFromCampus} onChange={e => setFormData({...formData, distanceFromCampus: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. 10 mins walk" />
            </div>

            <div className="space-y-2 md:col-span-2 pt-2 border-t border-white/5">
              <label className="text-sm font-medium text-white/70 mb-2 block">Quick Features</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={formData.hasWifi} onChange={e => setFormData({...formData, hasWifi: e.target.checked})} className="rounded bg-surface-900 border-white/20 text-brand-500 focus:ring-brand-500 focus:ring-offset-surface-800" />
                  Free WiFi
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={formData.hasWater} onChange={e => setFormData({...formData, hasWater: e.target.checked})} className="rounded bg-surface-900 border-white/20 text-brand-500 focus:ring-brand-500 focus:ring-offset-surface-800" />
                  24/7 Water Supply
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Gender Restriction</label>
              <select value={formData.genderRestriction} onChange={e => setFormData({...formData, genderRestriction: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors">
                <option value="none">No Restriction</option>
                <option value="male_only">Male Only</option>
                <option value="female_only">Female Only</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2 pb-2 border-b border-white/5">
              <label className="text-sm font-medium text-white/70">Other Amenities <span className="text-white/30 font-normal">(Comma separated)</span></label>
              <input value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="e.g. Gym, Parking, Security, Study Room" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white/70">Property Images</label>
              <div className="p-8 border-2 border-dashed border-white/10 rounded-xl bg-surface-800/50 text-center relative hover:border-white/50 hover:bg-white/5 transition-all">
                 <input type="file" multiple accept="image/*,video/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed text-[0px]" title="" />
                 <div className="flex flex-col items-center justify-center pointer-events-none">
                    {uploading ? (
                      <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mb-3"></div>
                    ) : (
                      <Plus className="w-10 h-10 text-white/20 mb-3" />
                    )}
                    <p className="text-white/80 font-medium">{uploading ? 'Processing Upload...' : 'Click or drag media to upload'}</p>
                    <p className="text-sm text-white/40 mt-1">Supports images and videos (Max 50MB)</p>
                 </div>
              </div>
              
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {formData.images.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10 group shadow-lg">
                      <img src={url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 backdrop-blur rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/80">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white/70">Description</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={5} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="Provide a detailed description of the property..."></textarea>
            </div>

            <div className="space-y-2 md:col-span-2 pt-2 border-t border-white/5">
               <h3 className="text-lg font-medium text-white mb-2">Direct Contact Channels</h3>
               <p className="text-sm text-white/40 mb-4">Students will use these to contact you. At least one is recommended.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">WhatsApp Number</label>
              <input value={formData.contactWhatsapp} onChange={e => setFormData({...formData, contactWhatsapp: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#25D366] transition-colors focus:ring-1 focus:ring-[#25D366]/50" placeholder="+1234567890" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Phone Number</label>
              <input value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="+1234567890" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Contact Email</label>
              <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="leasing@example.com" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-surface-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors">
                <option value="available">Available to Rent</option>
                <option value="rented">Fully Rented (Hidden from Search)</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-full text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 text-sm font-medium">Cancel</button>
              <button type="submit" className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-all hover:scale-105 shadow-xl shadow-white/10">Publish Listing</button>
            </div>
          </form>
        </motion.div>
      )}

      {listings.length === 0 ? (
        <div className="text-center py-24 bg-surface-800/30 rounded-[2rem] border border-white/5 border-dashed">
          <Building className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Portfolio Empty</h3>
          <p className="text-white/50 mb-6 max-w-sm mx-auto">You haven't listed any properties. Add your first rental to reach thousands of students.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map(listing => (
            <div key={listing.id} className="bg-surface-800 border border-white/5 rounded-3xl overflow-hidden group hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
              <div className="h-48 bg-surface-900 relative">
                {listing.images?.[0] && <img src={listing.images[0]} alt="" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />}
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity backdrop-blur-sm">
                   <button onClick={() => navigate(`/listings/${listing.id}`)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur transition-transform hover:scale-110"><Edit2 className="w-5 h-5"/></button>
                   <button onClick={() => handleDelete(listing.id)} className="p-3 bg-rose-500/20 hover:bg-rose-500/40 rounded-full text-rose-400 backdrop-blur transition-transform hover:scale-110"><Trash2 className="w-5 h-5"/></button>
                </div>
                {listing.isVerified && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-white backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-black shadow-lg shadow-white/10">
                    Verified
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h3 className="font-medium font-display truncate text-lg flex-1">{listing.title}</h3>
                  <span className={cn("text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border shrink-0", listing.status === 'available' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-white/40')}>{listing.status}</span>
                </div>
                <p className="text-brand-400 font-display text-xl font-medium mb-4">${listing.price}<span className="text-white/40 text-sm font-normal font-sans"> / mo</span></p>
                <div className="flex items-center gap-2 text-sm text-white/50 mb-4 truncate">
                   <MapPin className="w-4 h-4 shrink-0" />
                   <span className="truncate">{listing.location}</span>
                </div>
                <div className="flex gap-2 isolate pt-4 border-t border-white/5">
                   <span className="text-xs px-2 py-1 bg-surface-900 rounded border border-white/5 capitalize text-white/70">{listing.type}</span>
                   {listing.hasWifi && <span className="text-xs px-2 py-1 bg-surface-900 rounded border border-white/5 text-white/70">WiFi</span>}
                   {listing.genderRestriction !== 'none' && <span className="text-xs px-2 py-1 bg-surface-900 rounded border border-white/5 text-white/70">{listing.genderRestriction === 'male_only' ? 'Male Only' : 'Female Only'}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
