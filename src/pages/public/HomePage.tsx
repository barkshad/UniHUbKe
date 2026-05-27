import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ShieldCheck, MessageSquare, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getProperties, getSiteSettings } from '../../services/firestore';
import { Property, SiteSettings } from '../../types';
import { ListingCard } from '../../components/ListingCard';
import { Link, useNavigate } from 'react-router-dom';

export const Home = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [featuredListings, setFeaturedListings] = useState<Property[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteSettings, properties] = await Promise.all([
          getSiteSettings(),
          getProperties('available')
        ]);
        setSettings(siteSettings);
        
        let displayListings: Property[] = [];
        if (siteSettings?.featuredProperties?.length) {
          displayListings = properties.filter(p => siteSettings.featuredProperties.includes(p.id!));
        }
        if (displayListings.length === 0) {
          displayListings = properties.slice(0, 6);
        }
        setFeaturedListings(displayListings);
      } catch (err) {
        console.error("Error fetching homepage data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col w-full overflow-hidden" ref={containerRef}>
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-40 lg:pb-56">
        
        {/* Dynamic CMS Background Media */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {settings?.heroImage && (
            <div className="absolute inset-0 w-full h-full opacity-30">
              {settings.heroImage.match(/\.(mp4|webm|ogg)$/i) ? (
                <video 
                  src={settings.heroImage} 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                />
              ) : (
                <img 
                  src={settings.heroImage} 
                  className="w-full h-full object-cover" 
                  alt="" 
                />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-surface-950/60 via-surface-950/80 to-surface-950" />
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div 
            style={{ y, opacity }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px]"
          />
          <motion.div 
            style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "80%"]), opacity }}
            className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[100px]"
          />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/60 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Premium Student Housing
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-medium tracking-tight text-balance leading-[1.1] mb-6"
            >
              {settings?.heroTitle || "Find your perfect home."}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-white/50 max-w-2xl mb-10 text-balance"
            >
              {settings?.heroSubtitle || "Discover verified student housing near your campus. Safe, affordable, and hassle-free."}
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <button 
                onClick={() => navigate('/listings')}
                className="group relative bg-white text-surface-900 px-8 py-4 rounded-2xl font-medium text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)] transition-all duration-500 hover:-translate-y-1 flex items-center gap-3"
              >
                {settings?.ctaText || "Browse Listings"}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-white/40 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Trust Section */}
      <section className="py-32 bg-surface-950 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-medium mb-6 tracking-tight">Designed for Students.</h2>
            <p className="text-white/40 text-lg">We stripped away the noise to give you exactly what you need to find your next home.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Verified Listings"
              description="Every listing and landlord is vetted to eliminate scams and ensure you have a safe renting experience."
              delay={0.1}
            />
            <FeatureCard 
              icon={<GraduationCap className="w-6 h-6" />}
              title="Student Focused"
              description="Focusing strictly on housing options within walking distance or a short commute to major university campuses."
              delay={0.2}
            />
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6" />}
              title="Direct Contact"
              description="Browse, filter, and contact landlords directly via WhatsApp or email. No account required to find a home."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Featured Grid Section */}
      <section className="py-24 bg-surface-950">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl font-display font-medium">Featured Properties</h2>
              <p className="text-white/40 mt-2">Handpicked listings for quality living</p>
            </div>
            <Link 
              to="/listings" 
              className="hidden sm:flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/[0.04]"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[4/5] bg-surface-800/30 rounded-3xl shimmer" />
              ))}
            </div>
          ) : featuredListings.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-surface-800/30 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white/10" />
              </div>
              <h3 className="text-xl font-medium mb-2">No properties yet</h3>
              <p className="text-white/40 max-w-md mx-auto">Check back soon for featured properties in your area.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map(property => (
                <ListingCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="sm:hidden mt-8 text-center">
            <Link 
              to="/listings" 
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium px-4 py-2 rounded-xl bg-white/[0.04]"
            >
              View All Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-interactive p-8 rounded-3xl flex flex-col gap-4 group"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-white/[0.08] group-hover:border-white/[0.12] transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-medium font-display text-white/90 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">{description}</p>
    </motion.div>
  );
};
