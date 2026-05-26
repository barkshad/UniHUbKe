import React, { useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSettings, getProperties } from '../../services/firestore';
import { Property, SiteSettings } from '../../types';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export const AdminSettingsPage = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-3xl font-display font-medium mb-8">Site Settings</h1>

      <form onSubmit={handleSave} className="space-y-8">
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-medium mb-4">Hero Section</h2>
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Hero Title</label>
                <input required value={settings.heroTitle} onChange={e => setSettings({...settings, heroTitle: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
             </div>
             <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Hero Subtitle</label>
                <input required value={settings.heroSubtitle} onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
             </div>
             <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Hero Image/Video URL</label>
                <input placeholder="https://..." value={settings.heroImage || ''} onChange={e => setSettings({...settings, heroImage: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
             </div>
             <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">CTA Button Text</label>
                <input required value={settings.ctaText} onChange={e => setSettings({...settings, ctaText: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
             </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-medium mb-4">Featured Properties (Max 6)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {properties.map(p => {
               const isFeatured = (settings.featuredProperties || []).includes(p.id!);
               return (
                 <label key={p.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${isFeatured ? 'bg-white/5 border-white shadow-lg' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}>
                    <input type="checkbox" checked={isFeatured} onChange={() => toggleFeatured(p.id!)} className="mt-1 accent-white" />
                    <div>
                       <div className="font-medium text-sm leading-tight text-white mb-1 line-clamp-2">{p.title}</div>
                       <div className="text-xs text-zinc-500 truncate">{p.location}</div>
                    </div>
                 </label>
               );
             })}
          </div>
        </div>

        <button type="submit" disabled={isSaving} className="bg-white text-black px-8 py-3 rounded-xl font-medium flex items-center gap-2">
           {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save Settings
        </button>
      </form>
    </div>
  );
};
