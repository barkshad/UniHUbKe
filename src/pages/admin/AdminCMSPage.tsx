import React, { useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSettings } from '../../services/firestore';
import { SiteSettings, ThemeConfig } from '../../types';
import toast from 'react-hot-toast';
import { Loader2, Monitor, Palette, Type, Layout, MousePointerClick, Save, Undo, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export const AdminCMSPage = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'general' | 'features'>('theme');

  const defaultTheme: ThemeConfig = {
    primaryColor: '#ffffff',
    backgroundColor: '#0a0a0a',
    surfaceColor: '#121212',
    borderRadius: '1.5rem',
    fontFamily: 'Inter',
    animationSpeed: '0.8s'
  };

  useEffect(() => {
    const init = async () => {
      try {
        const sets = await getSiteSettings();
        if (sets) {
           if (!sets.theme) sets.theme = defaultTheme;
           setSettings(sets);
        } else {
           setSettings({ heroTitle: '', heroSubtitle: '', ctaText: '', featuredProperties: [], theme: defaultTheme });
        }
      } catch (e: any) {
        toast.error(e.message);
      }
    };
    init();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateSiteSettings(settings);
      
      // Instantly apply globally for Admin preview
      if (settings.theme) {
        const root = document.documentElement;
        if (settings.theme.primaryColor) root.style.setProperty('--color-brand-500', settings.theme.primaryColor);
        if (settings.theme.backgroundColor) root.style.setProperty('--color-surface-900', settings.theme.backgroundColor);
        if (settings.theme.surfaceColor) root.style.setProperty('--color-surface-800', settings.theme.surfaceColor);
        if (settings.theme.fontFamily) root.style.setProperty('--CMS-font-family', `"${settings.theme.fontFamily}", sans-serif`);
        if (settings.theme.borderRadius) root.style.setProperty('--CMS-border-radius', settings.theme.borderRadius);
      }

      toast.success("Site configuration published!");
    } catch (e: any) {
      toast.error("Failed to publish: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateTheme = (key: keyof ThemeConfig, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      theme: {
        ...(settings.theme || defaultTheme),
        [key]: value
      }
    });

    // Live preview updates local CSS variables
    const root = document.documentElement;
    if (key === 'primaryColor') root.style.setProperty('--color-brand-500', value);
    if (key === 'backgroundColor') root.style.setProperty('--color-surface-900', value);
    if (key === 'surfaceColor') root.style.setProperty('--color-surface-800', value);
    if (key === 'fontFamily') root.style.setProperty('--CMS-font-family', `"${value}", sans-serif`);
    if (key === 'borderRadius') root.style.setProperty('--CMS-border-radius', value);
  };

  if (!settings) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-medium text-white flex items-center gap-3">
            <Monitor className="w-8 h-8 text-brand-400" />
            Visual Site Builder
          </h1>
          <p className="text-zinc-400 mt-2">Manage the complete frontend experience globally.</p>
        </div>
        <div className="flex gap-4">
          <button 
             onClick={() => window.open('/', '_blank')} 
             className="px-4 py-2 flex items-center gap-2 rounded-xl border border-zinc-800 text-sm font-medium hover:bg-zinc-800 transition-all font-display"
          >
            <Eye className="w-4 h-4" /> Live Preview
          </button>
          <button 
             onClick={() => handleSave()}
             disabled={isSaving}
             className="px-6 py-2 flex items-center gap-2 rounded-xl bg-brand-500 text-black text-sm font-medium hover:bg-white hover:scale-105 transition-all font-display shadow-[0_0_20px_var(--color-brand-500)]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Publish Site
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Tools */}
        <div className="lg:w-64 shrink-0 flex flex-col gap-2">
           {[
             { id: 'theme', icon: <Palette className="w-4 h-4" />, label: 'Theme & Design' },
             { id: 'general', icon: <Layout className="w-4 h-4" />, label: 'Dynamic Content' },
             { id: 'features', icon: <MousePointerClick className="w-4 h-4" />, label: 'Feature Toggles' }
           ].map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'theme'|'general')}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm w-full text-left",
                  activeTab === tab.id 
                    ? "bg-zinc-800 text-white shadow-inner border border-zinc-700" 
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent"
                )}
             >
                {tab.icon} {tab.label}
             </button>
           ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 lg:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
           <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"></div>

           <form onSubmit={handleSave} className="space-y-8 relative z-10">
              
              {activeTab === 'theme' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                   <div className="border-b border-zinc-800 pb-4">
                     <h2 className="text-xl font-medium font-display mb-1 text-white">Global Color System</h2>
                     <p className="text-sm text-zinc-400">These changes are applied dynamically across all components.</p>
                   </div>
                   
                   <div className="grid sm:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-zinc-300">Primary Brand Color</label>
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 aspect-square rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: settings.theme?.primaryColor }} />
                         <input type="color" value={settings.theme?.primaryColor} onChange={e => updateTheme('primaryColor', e.target.value)} className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer" />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-zinc-300">Site Background Color</label>
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 aspect-square rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: settings.theme?.backgroundColor }} />
                         <input type="color" value={settings.theme?.backgroundColor} onChange={e => updateTheme('backgroundColor', e.target.value)} className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer" />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-zinc-300">Card Surface Color</label>
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 aspect-square rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: settings.theme?.surfaceColor }} />
                         <input type="color" value={settings.theme?.surfaceColor} onChange={e => updateTheme('surfaceColor', e.target.value)} className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer" />
                       </div>
                     </div>
                   </div>

                   <div className="border-t border-zinc-800 pt-8 border-b pb-4 mt-8">
                     <h2 className="text-xl font-medium font-display mb-1 text-white flex items-center gap-2"><Type className="w-5 h-5"/> Global Typography</h2>
                   </div>
                   <div className="grid sm:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-zinc-300">Global Font Family</label>
                       <select value={settings.theme?.fontFamily} onChange={e => updateTheme('fontFamily', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500">
                          <option value="Inter">Inter (Clean)</option>
                          <option value="Space Grotesk">Space Grotesk (Modern)</option>
                          <option value="JetBrains Mono">JetBrains Mono (Technical)</option>
                       </select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-zinc-300">Border Radius Settings</label>
                       <select value={settings.theme?.borderRadius} onChange={e => updateTheme('borderRadius', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500">
                          <option value="0.5rem">Subtle (0.5rem)</option>
                          <option value="1rem">Modern (1rem)</option>
                          <option value="1.5rem">Pill-shaped (1.5rem)</option>
                          <option value="2rem">Extreme (2rem)</option>
                       </select>
                     </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'general' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                   <div className="border-b border-zinc-800 pb-4">
                     <h2 className="text-xl font-medium font-display mb-1 text-white">Homepage Editing</h2>
                     <p className="text-sm text-zinc-400">Edit the primary headline and visual hero section dynamically.</p>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Hero Title</label>
                        <textarea required rows={2} value={settings.heroTitle} onChange={e => setSettings({...settings, heroTitle: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xl font-display font-medium rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Call To Action Button</label>
                        <input required value={settings.ctaText} onChange={e => setSettings({...settings, ctaText: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white" />
                      </div>
                   </div>
                </motion.div>
              )}
              
              {activeTab === 'features' && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                   <div className="border-b border-zinc-800 pb-4">
                     <h2 className="text-xl font-medium font-display mb-1 text-white">Feature Toggles</h2>
                     <p className="text-sm text-zinc-400">Turn entire blocks of functionality on or off instantly.</p>
                   </div>
                   
                   <label className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950 cursor-pointer hover:border-zinc-700 transition-colors">
                      <input type="checkbox" checked={settings.features?.enableBlog || false} onChange={e => setSettings({...settings, features: {...(settings.features || {}), enableBlog: e.target.checked}})} className="w-5 h-5 accent-brand-500 rounded" />
                      <div>
                         <span className="block font-medium text-white">Enable Blog Section</span>
                         <span className="block text-sm text-zinc-500">Shows the blog and articles tab across the platform.</span>
                      </div>
                   </label>
                </motion.div>
              )}

           </form>
        </div>
      </div>
    </div>
  );
};
