import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { University } from '../../types';
import { getUniversity, createUniversity, updateUniversity } from '../../services/firestore';
import toast from 'react-hot-toast';

export const AdminUniversityForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState<Partial<University>>({
    name: '',
    slug: '',
    location: '',
    description: '',
    verified: false,
    status: 'active',
    logo_url: '',
    contact_email: '',
    contact_phone: '',
    metadata: {
      founded_year: 0,
      student_count: 0
    }
  });

  useEffect(() => {
    if (id) {
      getUniversity(id).then(data => {
        if (data) setFormData({ ...data, metadata: data.metadata || { founded_year: 0, student_count: 0 } });
        setLoading(false);
      }).catch(err => {
        toast.error('Failed to load university details');
        navigate('/admin/universities');
      });
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (id) {
        await updateUniversity(id, formData);
        toast.success('University updated successfully');
      } else {
        await createUniversity(formData as any);
        toast.success('University registered successfully');
      }
      navigate('/admin/universities');
    } catch (err) {
      toast.error('Failed to save university');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/admin/universities" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Universities
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-medium text-white mb-2">{id ? 'Edit University' : 'Register University'}</h1>
          <p className="text-zinc-400">Complete the partner profile below.</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={saving}
          className="flex items-center gap-2 bg-brand-500 text-black px-6 py-2 rounded-lg font-medium hover:bg-white transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save University'}
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  placeholder="e.g., Jomo Kenyatta University"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">URL Slug *</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-400 focus:outline-none focus:border-brand-500 font-mono text-sm"
                  placeholder="e.g., jkuat"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Main Location *</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                  placeholder="e.g., Juja, Kenya"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">University Logo</label>
              <div className="w-full h-40 bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center overflow-hidden relative">
                {formData.logo_url ? (
                  <img src={formData.logo_url} className="w-full h-full object-contain p-4" alt="Logo" />
                ) : (
                  <div className="text-center text-zinc-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm">Upload Logo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={async (e) => {
                     const file = e.target.files?.[0];
                     if (!file) return;
                     setUploadingLogo(true);
                     try {
                        const { uploadToCloudinary } = await import('../../lib/cloudinary');
                        const url = await uploadToCloudinary(file);
                        setFormData({ ...formData, logo_url: url });
                     } catch (err) {
                        toast.error("Upload failed");
                     } finally {
                        setUploadingLogo(false);
                     }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploadingLogo && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm">Uploading...</div>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 h-32 resize-y"
              placeholder="About the university..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Contact Email</label>
                <input 
                  type="email" 
                  value={formData.contact_email} 
                  onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Contact Phone</label>
                <input 
                  type="text" 
                  value={formData.contact_phone} 
                  onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Founded Year</label>
              <input 
                type="number" 
                value={formData.metadata?.founded_year || ''} 
                onChange={e => setFormData({ ...formData, metadata: { ...formData.metadata, founded_year: parseInt(e.target.value) || 0 } })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Student Count</label>
              <input 
                type="number" 
                value={formData.metadata?.student_count || ''} 
                onChange={e => setFormData({ ...formData, metadata: { ...formData.metadata, student_count: parseInt(e.target.value) || 0 } })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
          
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950 flex justify-between items-center">
             <div>
                <h4 className="text-white font-medium">Verification Status</h4>
                <p className="text-sm text-zinc-500">Toggle whether this university is an officially verified partner.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" className="sr-only peer" checked={formData.verified} onChange={e => setFormData({ ...formData, verified: e.target.checked })} />
               <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
             </label>
          </div>

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
