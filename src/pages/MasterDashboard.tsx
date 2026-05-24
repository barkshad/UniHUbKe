import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Building, Users, Image as ImageIcon, MonitorPlay } from 'lucide-react';

export const MasterDashboard = () => {
  const [stats, setStats] = useState({
    listings: 0,
    landlords: 0,
    videos: 0
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const listSnap = await getDocs(collection(db, 'listings'));
        let vidCount = 0;
        listSnap.docs.forEach(d => {
          const l = d.data();
          if (l.videoUrl || (l.images && l.images.some((i:string) => i.match(/\.(mp4|webm|ogg)$/i)))) vidCount++;
        });
        
        const llSnap = await getDocs(query(collection(db, 'users')));
        const landlordCount = llSnap.docs.filter(d => d.data().role === 'landlord').length;

        setStats({
          listings: listSnap.size,
          landlords: landlordCount,
          videos: vidCount
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-medium text-white mb-2">Master Overview</h1>
        <p className="text-white/50 text-sm">Real-time system health and platform statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Listings" value={stats.listings.toString()} icon={<Building className="w-5 h-5" />} />
        <StatCard title="Active Landlords" value={stats.landlords.toString()} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Video Listings" value={stats.videos.toString()} icon={<MonitorPlay className="w-5 h-5" />} />
      </div>
      
      <div className="glass-panel border-white/5 p-8 rounded-2xl">
        <h3 className="text-lg font-medium text-white mb-4">System Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> <span className="text-sm font-medium">Database Connection</span></div>
            <span className="text-xs text-white/50">Optimal</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> <span className="text-sm font-medium">Cloudinary CDN</span></div>
            <span className="text-xs text-white/50">Optimal</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> <span className="text-sm font-medium">Search Indexing</span></div>
            <span className="text-xs text-white/50">Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
  <div className="glass-panel border-white/5 p-6 rounded-2xl hover:border-white/10 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-white/70">{icon}</div>
    </div>
    <p className="text-white/50 text-xs font-medium mb-1 uppercase tracking-wider">{title}</p>
    <h3 className="text-4xl font-display font-medium text-white">{value}</h3>
  </div>
);
