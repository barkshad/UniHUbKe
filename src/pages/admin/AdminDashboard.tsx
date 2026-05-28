import React, { useEffect, useState } from 'react';
import { Home, CheckCircle, XCircle, Users } from 'lucide-react';
import { getProperties, getAgents, seedData } from '../../services/firestore';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0, agents: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [props, agents] = await Promise.all([getProperties(), getAgents()]);
      setStats({
        total: props.length,
        available: props.filter(p => p.status === 'available').length,
        occupied: props.filter(p => p.status === 'occupied').length,
        agents: agents.length
      });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeed = async () => {
    if (!window.confirm("Warning: This will add sample data to Firestore. Proceed?")) return;
    try {
      await seedData();
      toast.success("Sample data created (Settings only in this demo implementation)");
    } catch (err: any) {
      toast.error("Seeding failed: " + err.message);
    }
  };

  if (loading) return <div className="animate-pulse flex gap-4"><div className="h-32 bg-zinc-900 rounded-2xl w-full"></div></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-medium">Dashboard Overview</h1>
        <button 
          onClick={handleSeed}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors border border-zinc-700"
        >
          Seed Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Home className="w-5 h-5" />} label="Total Properties" value={stats.total} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Available" value={stats.available} color="bg-emerald-500/10 text-emerald-400" />
        <StatCard icon={<XCircle className="w-5 h-5" />} label="Occupied" value={stats.occupied} color="bg-red-500/10 text-red-400" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Agents" value={stats.agents} color="bg-purple-500/10 text-purple-400" />
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      {icon}
    </div>
    <div className="text-zinc-400 text-sm font-medium mb-1">{label}</div>
    <div className="text-3xl font-display font-medium text-white">{value}</div>
  </div>
);
