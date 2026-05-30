import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, TrendingUp, Search, Headphones, MapPin, Building, MoveRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSiteSettings } from '../../services/firestore';
import { TeamMember } from '../../types';

export const AboutPage = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: 'Sarah Wanjiku', role: 'Founder & CEO', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=transparent' },
    { name: 'David Ochieng', role: 'Head of Product', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=transparent' },
    { name: 'Mercy Kiprono', role: 'Community Manager', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mercy&backgroundColor=transparent' },
    { name: 'James Mutua', role: 'Lead Developer', photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=transparent' }
  ]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const settings = await getSiteSettings();
        if (settings?.teamMembers && settings.teamMembers.length > 0) {
          setTeamMembers(settings.teamMembers);
        }
      } catch (err) {
        if (err?.message?.includes('offline')) {
          console.warn('App is running in offline mode. Team data may be limited.');
        } else {
          console.error("Failed to load team members:", err);
        }
      }
    };
    fetchTeam();
  }, []);
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-surface-900 z-0"></div>
        <div className="absolute top-0 right-0 w-3/4 h-3/4 opacity-10 bg-brand-500 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-10 bg-white blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-display font-medium text-white tracking-tight mb-6 leading-[1.1]">
              Connecting People to Their Perfect Home.
            </h1>
            <p className="text-xl md:text-2xl text-white/60 mb-10 leading-relaxed font-light">
              We're on a mission to make housing search simple, safe, and entirely transparent across Kenya.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-white/70 text-lg leading-relaxed"
            >
              <h2 className="text-3xl font-display font-medium text-white mb-8">Our Story</h2>
              <p>
                UniHub was founded to solve a problem every Kenyan university attendee faces: the exhausting, often risky process of finding safe, affordable, and verified housing near campus.
              </p>
              <p>
                Too many people fall victim to housing scams, inaccurate listings, or end up far away from their university because information is scattered and unreliable. We knew there had to be a better way.
              </p>
              <p>
                Today, we vet every listing and prioritize tenant safety above all else. We bridge the gap between reputable landlords and people looking for their next home away from home.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="space-y-6 mt-12">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-surface-800">
                  <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80" alt="Apartment" className="w-full h-full object-cover grayscale opacity-80" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-surface-800">
                  <img src="https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80" alt="Person studying" className="w-full h-full object-cover grayscale opacity-80" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-surface-800/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-10 md:p-12 rounded-[2.5rem] border border-white/5 relative overflow-hidden group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-display font-medium text-white mb-4">Our Mission</h3>
              <p className="text-lg text-white/60 leading-relaxed">
                To make the housing search simple, safe, and transparent. We believe finding a place to live during your university years should be an exciting journey, not a stressful chore.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-panel p-10 md:p-12 rounded-[2.5rem] border border-white/5 relative overflow-hidden group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-display font-medium text-white mb-4">Our Vision</h3>
              <p className="text-lg text-white/60 leading-relaxed">
                To be the #1 trusted housing platform in East Africa. We envision a future where everyone provides a safe, vetted, and comfortable environment conducive to their success.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose UniHub */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-medium text-white mb-6">Why Choose UniHub</h2>
            <p className="text-lg text-white/60">We built our platform specifically around the needs of people and responsible landlords.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Verified Listings',
                desc: 'Every property on our platform undergoes a rigorous manual verification process to prevent scams.'
              },
              {
                icon: Search,
                title: 'Easy Search',
                desc: 'Filter properties by proximity to your specific campus, budget, and desired amenities.'
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                desc: 'Our dedicated support team is always available to help you resolve any issues or answer questions.'
              },
              {
                icon: Building,
                title: 'Tenant-First',
                desc: 'We only partner with landlords who understand and cater to tenant needs and budgets.'
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface-800/50 p-8 rounded-[2rem] border border-white/5 hover:bg-surface-800 transition-colors"
              >
                <feature.icon className="w-10 h-10 text-brand-400 mb-6" />
                <h4 className="text-xl font-medium text-white mb-3">{feature.title}</h4>
                <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-y border-white/5 bg-surface-900/50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { number: '500+', label: 'Verified Listings' },
              { number: '20+', label: 'Universities Covered' },
              { number: '10k+', label: 'Tenants Housed' },
              { number: '50+', label: 'Cities & Towns' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-display font-medium text-white mb-2">{stat.number}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-medium text-white mb-6">Our Team</h2>
            <p className="text-lg text-white/60">The passionate people working behind the scenes to make housing better.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="aspect-square rounded-[2rem] overflow-hidden bg-surface-800 mb-6 border border-white/5 relative">
                  {member.photoUrl ? (
                     <img 
                       src={member.photoUrl} 
                       alt={member.name} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                     />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center bg-zinc-900 group-hover:scale-105 transition-transform duration-500">
                        <Users className="w-12 h-12 text-zinc-700" />
                     </div>
                  )}
                </div>
                <h4 className="text-xl font-medium text-white">{member.name}</h4>
                <p className="text-white/50">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-600 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-display font-medium text-white mb-6">Ready to find your place?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of people who have already found their perfect home through UniHub.
          </p>
          <Link 
            to="/listings" 
            className="inline-flex items-center gap-3 bg-white text-black font-medium text-lg px-8 py-4 rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            Find Your Perfect Room Today
            <MoveRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
