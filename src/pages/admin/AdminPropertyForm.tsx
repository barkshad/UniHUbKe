import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Loader2, Upload, X, Image, Video, Sparkles, Save, Plus, Building } from 'lucide-react';
import { getProperty, createProperty, updateProperty, getCategories, getAgents } from '../../services/firestore';
import { uploadToStorage } from '../../lib/storage';
import { Property, Category, Agent, MediaItem } from '../../types';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

export const AdminPropertyForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Property>({
    defaultValues: { status: 'available' }
  });

  useEffect(() => {
    const init = async () => {
      try {
        const [cats, ags] = await Promise.all([getCategories(), getAgents()]);
        setCategories(cats);
        setAgents(ags);

        if (id) {
          const prop = await getProperty(id);
          if (prop) {
            reset(prop);
            setMedia(prop.media || []);
            setFeatures(prop.features || []);
          }
        }
      } catch (err: any) {
        toast.error("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, reset]);

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    
    setUploading(true);
    setUploadProgress(0);
    const folder = `unihub/properties/${id || 'draft'}`;
    let completedFiles = 0;
    
    try {
      const uploadPromises = Array.from(files).map(async (f) => {
        const res = await uploadToStorage(f, folder, (progress) => {
          setUploadProgress(Math.floor(((completedFiles * 100) + progress) / files.length));
        });
        completedFiles++;
        setUploadProgress(Math.floor((completedFiles / files.length) * 100));
        return res;
      });
      const results = await Promise.all(uploadPromises);
      
      const newMedia: MediaItem[] = results.map((res, idx) => ({
        ...res,
        order: media.length + idx
      }));
      
      setMedia([...media, ...newMedia]);
      toast.success("Media uploaded successfully");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (f: string) => {
    setFeatures(features.filter(feat => feat !== f));
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        deposit: data.deposit ? Number(data.deposit) : 0,
        media,
        features
      };

      if (id) {
        await updateProperty(id, payload);
        toast.success("Property updated successfully");
      } else {
        await createProperty(payload);
        toast.success("Property created successfully");
      }
      navigate('/admin/properties');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-page max-w-4xl">
        <div className="h-6 w-24 bg-surface-800/50 rounded-lg shimmer mb-8" />
        <div className="h-10 w-64 bg-surface-800/50 rounded-xl shimmer mb-8" />
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-surface-800/50 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page max-w-4xl">
      <Link 
        to="/admin/properties" 
        className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Properties
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-surface-800 flex items-center justify-center">
          <Building className="w-6 h-6 text-white/40" />
        </div>
        <div>
          <h1 className="admin-page-title">{id ? 'Edit Property' : 'New Property'}</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {id ? 'Update property details and media' : 'Create a new property listing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Basic Information */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.04]">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-medium">Basic Information</h2>
              <p className="text-sm text-white/40">Property title, pricing and location</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/60 mb-2">Title *</label>
              <input 
                {...register('title', { required: true })} 
                placeholder="e.g., Spacious 1 Bedroom in Gate C"
                className="input-premium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Monthly Rent (KSh) *</label>
              <input 
                type="number" 
                {...register('price', { required: true })} 
                placeholder="12000"
                className="input-premium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Deposit (KSh)</label>
              <input 
                type="number" 
                {...register('deposit')} 
                placeholder="Optional"
                className="input-premium" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/60 mb-2">Location *</label>
              <input 
                {...register('location', { required: true })} 
                placeholder="e.g., Gate C, Juja Town"
                className="input-premium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Category *</label>
              <select 
                {...register('categoryId', { required: true })} 
                className="input-premium appearance-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Assigned Agent *</label>
              <select 
                {...register('agentId', { required: true })} 
                className="input-premium appearance-none cursor-pointer"
              >
                <option value="">Select Agent</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/60 mb-2">Description *</label>
              <textarea 
                {...register('description', { required: true })} 
                rows={4} 
                placeholder="Describe the property, nearby amenities, transportation options..."
                className="input-premium resize-none" 
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.04]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-medium">Features & Amenities</h2>
              <p className="text-sm text-white/40">Add features that make this property stand out</p>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input 
              value={featureInput}
              onChange={e => setFeatureInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              placeholder="e.g., Wi-Fi, Water 24/7, Parking"
              className="input-premium flex-1"
            />
            <button 
              type="button" 
              onClick={addFeature} 
              className="btn-secondary px-6"
            >
              Add
            </button>
          </div>
          
          <AnimatePresence mode="popLayout">
            {features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {features.map((f, i) => (
                  <motion.div 
                    key={f}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 bg-surface-800/50 border border-white/[0.06] px-3 py-2 rounded-lg text-sm"
                  >
                    {f}
                    <button 
                      type="button" 
                      onClick={() => removeFeature(f)} 
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-white/30 text-sm">
                No features added yet. Add features to help tenants find this property.
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Media Gallery */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.04]">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Image className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-medium">Media Gallery</h2>
              <p className="text-sm text-white/40">Upload photos and videos of the property</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {media.map((item, idx) => (
                <motion.div 
                  key={item.public_id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square bg-surface-800 rounded-xl overflow-hidden border border-white/[0.06] group"
                >
                  {item.resource_type === 'video' ? (
                    <video src={item.secure_url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.secure_url} alt="" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 left-2">
                    {item.resource_type === 'video' ? (
                      <span className="badge badge-neutral text-[10px]"><Video className="w-3 h-3" /></span>
                    ) : (
                      <span className="badge badge-neutral text-[10px]"><Image className="w-3 h-3" /></span>
                    )}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeMedia(idx)} 
                    className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <label className={cn(
              "aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all",
              uploading 
                ? "border-white/20 bg-surface-800/50" 
                : "border-white/[0.08] hover:border-white/[0.16] hover:bg-surface-800/30"
            )}>
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*" 
                className="hidden" 
                onChange={onFileUpload} 
                disabled={uploading} 
              />
              {uploading ? (
                <div className="flex flex-col items-center w-full px-4 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-white/40 mb-3" />
                  <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      className="h-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40">{uploadProgress}%</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-white/20 mb-2" />
                  <span className="text-sm text-white/40 font-medium">Upload</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Publishing */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.04]">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Save className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-medium">Publishing</h2>
              <p className="text-sm text-white/40">Control the visibility of this listing</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Status</label>
            <select {...register('status')} className="input-premium appearance-none cursor-pointer max-w-xs">
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Link to="/admin/properties" className="btn-ghost">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {id ? 'Update Property' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
};
