import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { School, MapPin, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUniversities, getHostels } from '../../services/firestore';
import { University, Hostel } from '../../types';
import { optimizeCloudinaryUrl } from '../../lib/optimizeMedia';
import { Skeleton } from '../../components/Skeleton';

export const HostelsPage = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uniRes, hostelRes] = await Promise.all([
          getUniversities(),
          getHostels()
        ]);
        setUniversities(uniRes);
        setHostels(hostelRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex-1">
      {/* Hero Section */}
       <section className="pt-32 pb-20 px-6 bg-surface-900 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 max-w-3xl opacity-30 pointer-events-none blur-[100px]">
          <div className="aspect-square bg-brand-500/20 rounded-full mix-blend-screen" />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="max-w-3xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium mb-6">
                <School className="w-4 h-4" /> Official University Accommodation
             </div>
             <h1 className="text-5xl md:text-7xl font-display font-medium text-white mb-6 leading-tight tracking-tight">
               Campus Living,<br/><span className="text-white/50">Simplified.</span>
             </h1>
             <p className="text-xl text-white/50 leading-relaxed mb-10 max-w-2xl">
               Browse verified hostels directly from partner universities. Book your spot instantly with no agent fees.
             </p>
             
             <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input 
                     type="text"
                     placeholder="Search by university..."
                     className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <button className="px-8 py-4 bg-brand-500 text-black font-medium rounded-2xl hover:bg-white transition-colors whitespace-nowrap">
                  Search
                </button>
             </div>
          </div>
        </div>
       </section>

       <section className="py-20 px-6 bg-surface-950 min-h-[500px]">
         <div className="container mx-auto max-w-7xl">
           <div className="flex items-end justify-between mb-12">
             <div>
               <h2 className="text-3xl font-display font-medium text-white mb-2">Partner Universities</h2>
               <p className="text-white/50">Institutions with official accommodation partners.</p>
             </div>
           </div>

           {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
              </div>
           ) : universities.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {universities.map(uni => {
                    const uniHostels = hostels.filter(h => h.universityId === uni.id);
                    return (
                      <Link key={uni.id} to={`/hostels/${uni.slug}`} className="group relative bg-surface-900 border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all p-6 flex flex-col justify-between min-h-[240px]">
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                         
                         <div className="relative z-20 flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-2 shrink-0">
                               {uni.logo_url ? <img src={uni.logo_url} className="w-full h-full object-contain" alt={uni.name}/> : <School className="w-8 h-8 text-black" />}
                            </div>
                            <div>
                               <h3 className="text-xl font-medium text-white font-display leading-tight mb-1">{uni.name}</h3>
                               <p className="text-white/50 text-sm flex items-center gap-1"><MapPin className="w-3 h-3"/> {uni.location}</p>
                            </div>
                         </div>
                         
                         <div className="relative z-20 mt-8 flex items-center justify-between border-t border-white/5 pt-4">
                            <div>
                               <p className="text-white/40 text-sm">Available Hostels</p>
                               <p className="text-white font-medium text-lg">{uniHostels.length}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-brand-500 group-hover:border-brand-500 group-hover:text-black transition-all">
                               <ArrowRight className="w-4 h-4" />
                            </div>
                         </div>
                      </Link>
                    );
                 })}
              </div>
           ) : (
              <div className="text-center py-24 bg-surface-900 rounded-3xl border border-white/5">
                <School className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No partners yet</h3>
                <p className="text-white/50 max-w-md mx-auto">We are currently onboarding universities to the official hostel platform.</p>
              </div>
           )}
         </div>
       </section>
    </div>
  );
};
