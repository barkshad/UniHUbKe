import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Image as ImageIcon, X, Trash2 } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Hostel, University } from '../../types';
import { getHostel, createHostel, updateHostel, getUniversities } from '../../services/firestore';
import toast from 'react-hot-toast';

export const AdminHostelForm = () => {
  const { id, universityId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState<Partial<Hostel>>({
    name: '',
    universityId: universityId || '',
    location: '',
    description: '',
    hostel_type: 'mixed',
    images: [],
    amenities: [],
    warden_name: '',
    warden_phone: '',
    warden_email: '',
    status: 'active'
  });

  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const unis = await getUniversities();
        setUniversities(unis);
        
        if (id && id !== 'new') {
          const data = await getHostel(id);
          if (data) setFormData(data);
        } else if (universityId) {
          setFormData(prev => ({ ...prev, universityId: universityId }));
        } else if (unis.length > 0 && !formData.universityId) {
           setFormData(prev => ({ ...prev, universityId: unis[0].id }));
        }
      } catch (err: any) {
        console.error('Failed to load data:', err);
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, universityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.universityId || !formData.location) {
      toast.error('Please fill in Name, University, and Location');
      return;
    }

    setSaving(true);
    try {
      if (id && id !== 'new') {
        await updateHostel(id, formData);
        toast.success('Hostel updated successfully');
      } else {
        await createHostel(formData as any);
        toast.success('Hostel registered successfully');
      }
      navigate(universityId ? `/admin/universities/${universityId}` : '/admin/hostels');
    } catch (err) {
      toast.error('Failed to save hostel');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAmenity = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newAmenity.trim()) {
      e.preventDefault();
      setFormData({
        ...formData,
        amenities: [...(formData.amenities || []), newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: (formData.amenities || []).filter((_, i) => i !== index)
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    const loadingId = toast.loading('Uploading images...');
    
    try {
      const { uploadToCloudinary } = await import('../../lib/cloudinary');
      const uploadPromises = Array.from(files).map((f: any) => uploadToCloudinary(f as File));
      const urls = await Promise.all(uploadPromises);
      
      const newMediaItems = urls.map((url, i) => {
        const file = Array.from(files)[i] as File;
        const isVideo = file.type.startsWith('video');
        return {
          public_id: `hostel_${Date.now()}_${i}`,
          secure_url: url,
          resource_type: isVideo ? 'video' : 'image',
          format: isVideo ? 'mp4' : 'jpg',
          order: (formData.images?.length || 0) + i
        };
      });
      
      setFormData(prev => ({
         ...prev,
         images: [...(prev.images || []), ...newMediaItems]
      }));
      toast.success('Images uploaded', { id: loadingId });
    } catch (err) {
      toast.error('Upload failed', { id: loadingId });
    } finally {
      setUploadingImages(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to={universityId ? `/admin/universities/${universityId}` : "/admin/hostels"} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {universityId ? 'Back to University' : 'Back to Hostels'}
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-medium text-white mb-2">{(id && id !== 'new') ? 'Edit Hostel' : 'Add Official Hostel'}</h1>
          <p className="text-zinc-400">Manage university hostel details, photos, and features.</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={saving}
          className="flex items-center gap-2 bg-brand-500 text-black px-6 py-2 rounded-lg font-medium hover:bg-white transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Hostel'}
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <form className="space-y-8">
          {/* General Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">University *</label>
                <select 
                  value={formData.universityId}
                  onChange={e => setFormData({ ...formData, universityId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="" disabled>Select a university...</option>
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Hostel Type</label>
                <select 
                  value={formData.hostel_type}
                  onChange={e => setFormData({ ...formData, hostel_type: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Hostel Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  placeholder="e.g., Block A Residence"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Location *</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  placeholder="e.g., Inside Main Campus"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 h-32 resize-y"
                placeholder="Describe the hostel facilities and environment..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Amenities / Features</label>
              <div className="flex flex-wrap gap-2 mb-3">
                 {(formData.amenities || []).map((amenity, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-800 text-white rounded-full text-sm">
                       {amenity}
                       <button type="button" onClick={() => removeAmenity(i)} className="hover:text-red-400 focus:outline-none"><X className="w-3 h-3"/></button>
                    </span>
                 ))}
                 <input 
                    type="text"
                    value={newAmenity}
                    onChange={e => setNewAmenity(e.target.value)}
                    onKeyDown={handleAddAmenity}
                    placeholder="Type and press Enter..."
                    className="bg-transparent border-b border-zinc-700 text-sm text-white px-2 py-1 focus:outline-none focus:border-brand-500 w-48"
                 />
              </div>
            </div>
          </div>

          {/* Warden Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">Warden Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Warden Name</label>
                  <input 
                    type="text" 
                    value={formData.warden_name} 
                    onChange={e => setFormData({ ...formData, warden_name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Warden Email</label>
                  <input 
                    type="email" 
                    value={formData.warden_email} 
                    onChange={e => setFormData({ ...formData, warden_email: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Warden Phone</label>
                  <input 
                    type="text" 
                    value={formData.warden_phone} 
                    onChange={e => setFormData({ ...formData, warden_phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  />
               </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">Hostel Media</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {(formData.images || []).map((img, i) => (
                  <div key={i} className="aspect-square bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden relative group">
                     {img.resource_type === 'video' ? (
                       <video src={img.secure_url} className="w-full h-full object-cover" controls />
                     ) : (
                       <img src={img.secure_url} className="w-full h-full object-cover" alt="Media" />
                     )}
                     <button
                        type="button"
                        onClick={() => {
                           const newImgs = [...formData.images!];
                           newImgs.splice(i, 1);
                           setFormData({ ...formData, "images": newImgs });
                        }}
                        className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               ))}
               <div className="aspect-square bg-zinc-950 rounded-lg border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center relative hover:bg-zinc-800/20 transition-colors cursor-pointer">
                  <input 
                     type="file" 
                     multiple 
                     accept="image/*,video/*"
                     onChange={handleImageUpload}
                     className="absolute inset-0 opacity-0 cursor-pointer z-10"
                     disabled={uploadingImages}
                  />
                  <ImageIcon className="w-8 h-8 text-zinc-500 mb-2" />
                  <span className="text-sm text-zinc-400 font-medium">{uploadingImages ? 'Uploading...' : 'Add Media'}</span>
               </div>
            </div>
          </div>

          {/* Status */}
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950">
             <h4 className="text-white font-medium mb-3">Status</h4>
             <div className="flex gap-4">
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                   <input type="radio" name="status" value="active" checked={formData.status === 'active'} onChange={() => setFormData({ ...formData, status: 'active' })} className="accent-brand-500"/> Active
                </label>
                <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                   <input type="radio" name="status" value="inactive" checked={formData.status === 'inactive'} onChange={() => setFormData({ ...formData, status: 'inactive' })} className="accent-brand-500"/> Inactive
                </label>
             </div>
          </div>

        </form>
      </div>
    </div>
  );
};
