import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { getProperty, createProperty, updateProperty, getCategories, getAgents } from '../../services/firestore';
import { uploadToStorage } from '../../lib/storage';
import { optimizeCloudinaryUrl, optimizeThumbnailUrl } from '../../lib/optimizeMedia';
import { Property, Category, Agent, MediaItem } from '../../types';
import toast from 'react-hot-toast';

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

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<Property>({
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
        const uploadPromises = Array.from(files).map(async (f: any) => {
           const res = await uploadToStorage(f as File, folder, (progress) => {
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
        toast.success("Property updated");
      } else {
        await createProperty(payload);
        toast.success("Property created");
      }
      navigate('/admin/properties');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <Link to="/admin/properties" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="text-3xl font-display font-medium mb-8">
        {id ? 'Edit Property' : 'New Property'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-medium">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Title *</label>
              <input {...register('title', { required: true })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Price (Monthly) KSh *</label>
              <input type="number" {...register('price', { required: true })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Deposit (KSh)</label>
              <input type="number" {...register('deposit')} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Location *</label>
              <input {...register('location', { required: true })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Category *</label>
              <select {...register('categoryId', { required: true })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Agent *</label>
              <select {...register('agentId', { required: true })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white">
                <option value="">Select Agent</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Description *</label>
              <textarea {...register('description', { required: true })} rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
            </div>
          </div>
        </div>

        {/* Features list */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-medium">Features</h2>
          <div className="flex gap-2">
            <input 
              value={featureInput}
              onChange={e => setFeatureInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              placeholder="e.g. Wi-Fi, Water 24/7"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white"
            />
            <button type="button" onClick={addFeature} className="bg-zinc-800 px-6 rounded-xl font-medium">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
             {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full text-sm">
                   {f}
                   <button type="button" onClick={() => removeFeature(f)} className="text-zinc-400 hover:text-white"><X className="w-3 h-3"/></button>
                </div>
             ))}
          </div>
        </div>

        {/* Media */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-medium">Media Gallery</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {media.map((item, idx) => (
              <div key={idx} className="relative aspect-square bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 group">
                {item.resource_type === 'video' ? (
                  <video src={optimizeCloudinaryUrl(item.secure_url, 'video')} className="w-full h-full object-cover" />
                ) : (
                  <img src={optimizeThumbnailUrl(item.secure_url)} alt="" className="w-full h-full object-cover" />
                )}
                <button type="button" onClick={() => removeMedia(idx)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                   <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <label className="aspect-square bg-zinc-950 border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors text-zinc-500 hover:text-white relative p-2">
              <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={onFileUpload} disabled={uploading} />
              {uploading ? (
                 <div className="flex flex-col items-center w-full px-4 text-center">
                   <Loader2 className="w-8 h-8 animate-spin mb-2" />
                   <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                   </div>
                   <span className="text-xs font-medium">{uploadProgress}%</span>
                 </div>
              ) : (
                 <>
                   <Upload className="w-8 h-8 mb-2" />
                   <span className="text-sm font-medium">Upload files</span>
                 </>
              )}
            </label>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-medium">Publishing</h2>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Status</label>
            <select {...register('status')} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white">
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link to="/admin/properties" className="px-6 py-3 rounded-xl border border-zinc-800 font-medium hover:bg-zinc-800 transition-colors">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="bg-white text-black px-8 py-3 rounded-xl font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Property'}
          </button>
        </div>
      </form>
    </div>
  );
};
