import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Search, MapPin, ShieldCheck, Home as HomeIcon, MessageSquare, GraduationCap, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getProperties, getSiteSettings } from '../../services/firestore';
import { Property, SiteSettings } from '../../types';
import { ListingCard } from '../../components/ListingCard';
import { Link, useNavigate } from 'react-router-dom';

export const Home = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [featuredListings, setFeaturedListings] = useState<Property[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
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
             <div className="absolute inset-0 w-full h-full opacity-40">
                {settings.heroImage.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={settings.heroImage} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img src={settings.heroImage} className="w-full h-full object-cover" alt="" />
                )}
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-b from-surface-900/80 via-surface-900/90 to-surface-900"></div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div 
            style={{ y, opacity }}
            className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] mix-blend-screen -translate-x-1/2 -translate-y-1/2"
          />
          <motion.div 
            style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "80%"]), opacity }}
            className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] mix-blend-screen translate-x-1/2 translate-y-1/2"
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.10] mix-blend-overlay"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-medium tracking-tight text-balance leading-[1.1] mb-6 md:mb-8"
            >
              {settings?.heroTitle || "Find your perfect home."}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center px-4"
            >
              <button 
                onClick={() => navigate('/listings')}
                className="w-full sm:w-auto btn-playful bg-white text-black px-8 py-4 rounded-full font-medium text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center"
              >
                {settings?.ctaText || "Browse Listings"}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 bg-surface-900 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-display font-medium mb-6">Designed for Students.</h2>
            <p className="text-white/50 text-lg">We stripped away the noise to give you exactly what you need to find your next home.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-white" />}
              title="Verified Listings"
              description="Every listing and landlord is vetted to eliminate scams and ensure you have a safe renting experience."
              delay={0.1}
            />
            <FeatureCard 
              icon={<GraduationCap className="w-6 h-6 text-white" />}
              title="Student Focused"
              description="Focusing strictly on housing options within walking distance or a short commute to major university campuses."
              delay={0.2}
            />
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6 text-white" />}
              title="Direct Contact"
              description="Browse, filter, and contact landlords directly via WhatsApp or email. No account required to find a home."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Featured Grid Section */}
      <section className="py-24 bg-surface-900">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-display font-medium">Featured Properties</h2>
            <Link to="/listings" className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map(property => (
              <ListingCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay = 0 }: { icon: React.ReactNode, title: string, description: string, delay?: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-playful p-8 rounded-3xl flex flex-col gap-4 group bg-white/5 border border-white/10"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/30 group-hover:bg-white/10 flex items-center justify-center mb-4 transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-medium font-display group-hover:text-white transition-colors">{title}</h3>
      <p className="text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">{description}</p>
    </motion.div>
  );
};
