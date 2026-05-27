import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, CheckCircle, XCircle, Users, TrendingUp, ArrowUpRight, Activity, Zap, Tag, Settings } from 'lucide-react';
import { getProperties, getAgents, seedData } from '../../services/firestore';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

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
      toast.success("Sample data created successfully");
      fetchStats();
    } catch (err: any) {
      toast.error("Seeding failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 w-64 bg-surface-800/50 rounded-xl shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 bg-surface-800/50 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="text-white/40 mt-1">Welcome back. Here&apos;s what&apos;s happening with your properties.</p>
        </div>
        <button 
          onClick={handleSeed}
          className="btn-secondary flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Seed Demo Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Home} 
          label="Total Properties" 
          value={stats.total}
          trend="+12%"
          trendUp={true}
          color="blue"
          delay={0}
        />
        <StatCard 
          icon={CheckCircle} 
          label="Available" 
          value={stats.available}
          trend={`${Math.round((stats.available / Math.max(stats.total, 1)) * 100)}%`}
          trendUp={true}
          color="emerald"
          delay={0.1}
        />
        <StatCard 
          icon={XCircle} 
          label="Occupied" 
          value={stats.occupied}
          trend={`${Math.round((stats.occupied / Math.max(stats.total, 1)) * 100)}%`}
          trendUp={false}
          color="rose"
          delay={0.2}
        />
        <StatCard 
          icon={Users} 
          label="Active Agents" 
          value={stats.agents}
          trend="+2"
          trendUp={true}
          color="purple"
          delay={0.3}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">Quick Actions</h2>
            <Activity className="w-5 h-5 text-white/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/properties/new" className="group flex flex-col gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Home className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">Add Property</span>
              <span className="text-xs text-white/40">Create new listing</span>
            </Link>
            <Link to="/admin/agents" className="group flex flex-col gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">Manage Agents</span>
              <span className="text-xs text-white/40">View all agents</span>
            </Link>
            <Link to="/admin/categories" className="group flex flex-col gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Tag className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">Categories</span>
              <span className="text-xs text-white/40">Organize listings</span>
            </Link>
            <Link to="/admin/settings" className="group flex flex-col gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Settings className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">Settings</span>
              <span className="text-xs text-white/40">Configure site</span>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">Platform Health</h2>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-4">
            <HealthIndicator label="Database" status="operational" />
            <HealthIndicator label="Media Storage" status="operational" />
            <HealthIndicator label="Authentication" status="operational" />
            <HealthIndicator label="API Services" status="operational" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  trend?: string;
  trendUp?: boolean;
  color: 'blue' | 'emerald' | 'rose' | 'purple';
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, trend, trendUp, color, delay = 0 }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'stat-card-blue' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'stat-card-emerald' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', glow: 'stat-card-rose' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'stat-card-purple' },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("stat-card group", colors.glow)}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110", colors.bg)}>
            <Icon className={cn("w-5 h-5", colors.text)} />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trendUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            )}>
              <ArrowUpRight className={cn("w-3 h-3", !trendUp && "rotate-180")} />
              {trend}
            </div>
          )}
        </div>
        <div className="text-white/50 text-sm font-medium mb-1">{label}</div>
        <div className="text-3xl font-display font-semibold tracking-tight">
          <AnimatedNumber value={typeof value === 'number' ? value : 0} />
        </div>
      </div>
    </motion.div>
  );
};

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

const HealthIndicator: React.FC<{ label: string; status: 'operational' | 'degraded' | 'down' }> = ({ label, status }) => {
  const statusStyles = {
    operational: { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Operational' },
    degraded: { dot: 'bg-amber-400', text: 'text-amber-400', label: 'Degraded' },
    down: { dot: 'bg-rose-400', text: 'text-rose-400', label: 'Down' },
  };

  const styles = statusStyles[status];

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", styles.dot)} />
        <span className={cn("text-xs font-medium", styles.text)}>{styles.label}</span>
      </div>
    </div>
  );
};
