import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UploadCloud, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminMediaManager = () => {
  const [heroMedia, setHeroMedia] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Listen to CMS settings document
    const unsub = onSnapshot(doc(db, 'cms', 'hero'), (docSnap) => {
      if (docSnap.exists()) {
        setHeroMedia(docSnap.data().media || []);
      }
    });
    return () => unsub();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      const { uploadToCloudinary } = await import('../lib/cloudinary');
      const uploadedUrls = await Promise.all(files.map(f => uploadToCloudinary(f)));
      
      const newMedia = [...heroMedia, ...uploadedUrls];
      await setDoc(doc(db, 'cms', 'hero'), { media: newMedia }, { merge: true });
    } catch (err) {
      console.error(err);
      alert("Failed to upload media.");
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = async (urlToRemove: string) => {
    const newMedia = heroMedia.filter(u => u !== urlToRemove);
    await setDoc(doc(db, 'cms', 'hero'), { media: newMedia }, { merge: true });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-medium mb-2">Media Manager</h1>
        <p className="text-white/50">Manage global assets, Cloudinary uploads, and Hero Section media.</p>
      </div>

      <div className="glass-panel border-white/10 p-8 rounded-[2rem]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-medium">Hero Section Gallery</h2>
            <p className="text-sm text-white/50">Images uploaded here will appear in the realtime background gallery of the homepage.</p>
          </div>
          <label className="bg-white hover:bg-white/90 text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] px-5 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Media'}
            <input type="file" multiple className="hidden" accept="image/*,video/*" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {heroMedia.length === 0 ? (
           <div className="text-center py-20 bg-surface-900 rounded-xl border border-white/5 border-dashed">
             <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
             <p className="text-white/50">No hero media available. Upload some premium assets.</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {heroMedia.map((url, i) => (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} key={i} className="group relative rounded-xl overflow-hidden aspect-video bg-surface-900 border border-white/10">
                {url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={url} className="w-full h-full object-cover" autoPlay muted loop />
                ) : (
                  <img src={url} className="w-full h-full object-cover" alt="" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm gap-2">
                  <button onClick={() => window.open(url, '_blank')} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"><ImageIcon className="w-4 h-4" /></button>
                  <button onClick={() => removeMedia(url)} className="p-2 bg-rose-500/20 rounded-full text-rose-400 hover:bg-rose-500/40"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
};
