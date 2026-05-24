import React from 'react';
import { Users, Building, AlertTriangle, Activity } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-medium mb-2">Platform Overview</h1>
        <p className="text-white/50">High-level metrics and system health for UniHub.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Listings" value="1,248" trend="+12% this month" icon={<Building className="w-5 h-5 text-brand-400" />} />
        <StatCard title="Active Users" value="8,409" trend="+5% this week" icon={<Users className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Pending Approvals" value="34" trend="Action required" icon={<Activity className="w-5 h-5 text-amber-400" />} />
        <StatCard title="Scam Reports" value="2" trend="Review immediately" icon={<AlertTriangle className="w-5 h-5 text-rose-400" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-[2rem] border-white/10 min-h-[400px]">
           <h3 className="text-lg font-medium mb-6">Traffic & Engagement</h3>
           {/* Placeholder for real charts */}
           <div className="w-full h-[300px] border border-white/5 border-dashed rounded-xl flex items-center justify-center text-white/20">
             Chart Component Placeholder
           </div>
        </div>
        <div className="glass-panel p-6 rounded-[2rem] border-white/10">
           <h3 className="text-lg font-medium mb-6">Recent Activity</h3>
           <div className="space-y-4">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="flex gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                 <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0"></div>
                 <div>
                   <p className="text-sm font-medium text-white/80">New listing submitted</p>
                   <p className="text-xs text-white/40">2 mins ago by user_8k2a</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) => (
  <div className="glass-panel p-6 rounded-2xl border-white/10 hover:border-white/20 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-surface-800 rounded-xl border border-white/5">{icon}</div>
    </div>
    <p className="text-white/50 text-sm font-medium mb-1">{title}</p>
    <h3 className="text-3xl font-display font-medium text-white mb-2">{value}</h3>
    <p className="text-xs text-white/40">{trend}</p>
  </div>
);
