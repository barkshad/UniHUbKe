import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getSiteSettings, updateSiteSettings, getProperties } from '../../services/firestore';
import { Property, SiteSettings } from '../../types';
import toast from 'react-hot-toast';
import { Loader2, Upload, X, Check, Image, Video, Star, Sparkles, Save } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'featured'>('hero');

  useEffect(() => {
    const init = async () => {
      try {
        const [sets, props] = await Promise.all([getSiteSettings(), getProperties()]);
        setSettings(sets || { heroTitle: '', heroSubtitle: '', ctaText: '', featuredProperties: [] });
        setProperties(props);
      } catch (e: any) {
        toast.error(e.message);
      }
    };
    init();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSiteSettings(settings);
      toast.success("Settings saved successfully");
    } catch (e: any) {
      toast.error("Failed to save: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFeatured = (id: string) => {
    if (!settings) return;
    const current = settings.featuredProperties || [];
    if (current.includes(id)) {
      setSettings({ ...settings, featuredProperties: current.filter(x => x !== id) });
    } else {
      if (current.length >= 6) {
        toast.error("Maximum 6 featured properties allowed");
        return;
      }
      setSettings({ ...settings, featuredProperties: [...current, id] });
    }
  };

  if (!settings) {
    return (
      <div className="admin-page">
        <div className="h-12 w-48 bg-surface-800/50 rounded-xl shimmer mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-surface-800/50 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page max-w-4xl">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Site Settings</h1>
          <p className="text-white/40 mt-1">Configure your homepage and featured content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-surface-800/30 rounded-xl border border-white/[0.04] w-fit">
        <button
          onClick={() => setActiveTab('hero')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'hero' 
              ? "bg-white text-surface-900" 
              : "text-white/50 hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Hero Section
          </span>
        </button>
        <button
          onClick={() => setActiveTab('featured')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === 'featured' 
              ? "bg-white text-surface-900" 
              : "text-white/50 hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4" /> Featured ({(settings.featuredProperties || []).length}/6)
          </span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'hero' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-6 space-y-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-white/[0.04]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="font-medium">Hero Section</h2>
                  <p className="text-sm text-white/40">Configure the main landing section</p>
                </div>
              </div>

              <div className="grid gap-5">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Hero Title</label>
                  <input 
                    required 
                    value={settings.heroTitle} 
                    onChange={e => setSettings({...settings, heroTitle: e.target.value})} 
                    placeholder="Find your perfect home."
                    className="input-premium" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Hero Subtitle</label>
                  <input 
                    required 
                    value={settings.heroSubtitle} 
                    onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} 
                    placeholder="Discover verified student housing"
                    className="input-premium" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">CTA Button Text</label>
                  <input 
                    required 
                    value={settings.ctaText} 
                    onChange={e => setSettings({...settings, ctaText: e.target.value})} 
                    placeholder="Browse Listings"
                    className="input-premium" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Hero Background Media</label>
                  {settings.heroImage ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/[0.08] group">
                      {settings.heroImage.match(/\.(mp4|webm)$/i) ? (
                        <video src={settings.heroImage} autoPlay loop muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={settings.heroImage} className="w-full h-full object-cover" alt="Hero" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        {settings.heroImage.match(/\.(mp4|webm)$/i) ? (
                          <span className="badge badge-neutral"><Video className="w-3 h-3" /> Video</span>
                        ) : (
                          <span className="badge badge-neutral"><Image className="w-3 h-3" /> Image</span>
                        )}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setSettings({...settings, heroImage: ''})} 
                        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-3 w-full aspect-video rounded-xl border-2 border-dashed border-white/[0.08] hover:border-white/[0.16] bg-surface-800/30 cursor-pointer transition-all hover:bg-surface-800/50">
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        className="hidden" 
                        disabled={isUploadingHero} 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploadingHero(true);
                          try {
                            const { uploadToStorage } = await import('../../lib/storage');
                            const res = await uploadToStorage(file, 'unihub/settings');
                            setSettings({...settings, heroImage: res.secure_url});
                          } catch (err) {
                            toast.error("Failed to upload hero media");
                          } finally {
                            setIsUploadingHero(false);
                          }
                        }} 
                      />
                      {isUploadingHero ? (
                        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white/30" />
                          </div>
                          <div className="text-center">
                            <span className="font-medium text-white/70">Upload Hero Media</span>
                            <span className="block text-sm text-white/40 mt-1">Supports images and videos</span>
                          </div>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'featured' && (
            <motion.div
              key="featured"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-white/[0.04] mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-medium">Featured Properties</h2>
                  <p className="text-sm text-white/40">Select up to 6 properties to showcase on the homepage</p>
                </div>
              </div>

              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No properties available</h3>
                  <p className="text-white/40 text-sm">Add properties first to feature them on the homepage</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {properties.map(p => {
                    const isFeatured = (settings.featuredProperties || []).includes(p.id!);
                    return (
                      <motion.label 
                        key={p.id} 
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                          isFeatured 
                            ? "bg-amber-500/5 border-amber-500/20 shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)]" 
                            : "bg-surface-800/30 border-white/[0.04] hover:border-white/[0.08] hover:bg-surface-800/50"
                        )}
                      >
                        <div className="relative mt-0.5">
                          <input 
                            type="checkbox" 
                            checked={isFeatured} 
                            onChange={() => toggleFeatured(p.id!)} 
                            className="sr-only"
                          />
                          <div className={cn(
                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                            isFeatured 
                              ? "bg-amber-500 border-amber-500" 
                              : "border-white/20 bg-transparent"
                          )}>
                            {isFeatured && <Check className="w-3 h-3 text-black" />}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm leading-tight text-white line-clamp-1">{p.title}</div>
                          <div className="text-xs text-white/40 truncate mt-1">{p.location}</div>
                          {isFeatured && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 mt-2 font-medium uppercase tracking-wider">
                              <Star className="w-3 h-3 fill-current" /> Featured
                            </span>
                          )}
                        </div>
                      </motion.label>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};
