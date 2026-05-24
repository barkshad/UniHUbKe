import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, MapPin, ShieldCheck, Home as HomeIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, query, orderBy, getDocs, limit, doc, onSnapshot } from 'firebase/firestore';
import { HeroSearch } from '../components/HeroSearch';
import { db } from '../lib/firebase';
import { Listing } from '../types';
import { ListingCard } from '../components/ListingCard';

export const Home = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [heroMedia, setHeroMedia] = useState<string[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(3));
        const snap = await getDocs(q);
        setFeaturedListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Listing)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchListings();

    const unsub = onSnapshot(doc(db, 'cms', 'hero'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().media?.length > 0) {
        setHeroMedia(docSnap.data().media);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (heroMedia.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentMediaIndex(prev => (prev + 1) % heroMedia.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroMedia]);

  return (
    <div className="flex flex-col w-full overflow-hidden" ref={containerRef}>
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-40 lg:pb-56">
        
        {/* Dynamic CMS Background Media */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
           <AnimatePresence>
             {heroMedia.length > 0 && heroMedia[currentMediaIndex] && (
               <motion.div
                 key={currentMediaIndex}
                 initial={{ opacity: 0, scale: 1.05 }}
                 animate={{ opacity: 0.15, scale: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 2 }}
                 className="absolute inset-0 w-full h-full"
               >
                 {heroMedia[currentMediaIndex].match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={heroMedia[currentMediaIndex]} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                 ) : (
                    <img src={heroMedia[currentMediaIndex]} className="w-full h-full object-cover grayscale" alt="" />
                 )}
               </motion.div>
             )}
           </AnimatePresence>
           
           <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-900/80 to-surface-900"></div>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span className="text-sm font-medium text-white/80">Premium Student Housing</span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.1 }
                }
              }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-medium tracking-tight text-balance leading-[1.1] mb-8"
            >
              {['Find', 'trusted', 'student', 'housing', 'near'].map((word, i) => (
                <React.Fragment key={i}>
                  <motion.span 
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                    }}
                    className={`inline-block ${i === 4 ? 'mr-[0.2em]' : 'mr-[0.25em]'}`}
                  >
                    {word}
                  </motion.span>
                  {word === 'student' && <br className="hidden md:block"/>}
                </React.Fragment>
              ))}
              <motion.span 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }}
                className="inline-block gradient-text from-white to-white/50"
              >
                campus.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 text-balance leading-relaxed"
            >
              Verified rentals, direct landlord contacts, and student-friendly housing — all in one beautifully designed place. No account required to browse.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl mt-4"
            >
              <HeroSearch />
            </motion.div>
          </div>
        </div>

        {/* Floating UI Elements Demo */}
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }} 
           className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 w-full max-w-7xl px-6 pointer-events-none hidden lg:block z-10"
        >
          <div className="w-full h-80 bg-gradient-to-t from-surface-900 via-surface-900/80 to-transparent absolute bottom-0 left-0 z-20 pointer-events-none"></div>
          
          {featuredListings.length > 0 ? (
            <div className="relative z-10 flex gap-6 w-full justify-center overflow-visible transform perspective-1000 rotate-x-6 scale-[0.85] transform-origin-bottom">
              {featuredListings.slice(0, 3).map((listing, i) => (
                <div key={listing.id} className={cn("w-[350px] shrink-0 pointer-events-auto transition-transform duration-700 hover:-translate-y-8 hover:rotate-x-0 hover:scale-110", i === 1 && "-translate-y-12")}>
                  <ListingCard listing={listing} index={i} />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative z-10 glass-panel rounded-2xl p-4 flex gap-4 w-full overflow-hidden transform perspective-1000 rotate-x-12 scale-95 items-end justify-center opacity-40 hover:opacity-80 transition-opacity duration-700">
               <div className="w-1/3 bg-surface-800 rounded-xl overflow-hidden shadow-2xl border border-white/5 hover:border-white/20 transition-colors duration-500">
                  <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?fit=crop&w=800&q=80&grayscale=1" alt="Apartment" className="w-full h-48 object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" />
               </div>
               <div className="w-1/3 bg-surface-800 rounded-xl overflow-hidden shadow-2xl border border-white/10 transform -translate-y-8 hover:border-white/30 transition-colors duration-500">
                  <img src="https://images.unsplash.com/photo-1502672260266-1c1e52416451?fit=crop&w=800&q=80&grayscale=1" alt="Room" className="w-full h-56 object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" />
               </div>
               <div className="w-1/3 bg-surface-800 rounded-xl overflow-hidden shadow-2xl border border-white/5 hover:border-white/20 transition-colors duration-500">
                  <img src="https://images.unsplash.com/photo-1554995207-c18c203602cb?fit=crop&w=800&q=80&grayscale=1" alt="Kitchen" className="w-full h-48 object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" />
               </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Features Section */}
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
              title="Verified Landlords"
              description="Every listing and landlord is vetted to eliminate scams and ensure you have a safe renting experience."
              delay={0.1}
            />
            <FeatureCard 
              icon={<MapPin className="w-6 h-6 text-white" />}
              title="Near Campus"
              description="Focusing strictly on housing options within walking distance or a short commute to major university campuses."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Search className="w-6 h-6 text-white" />}
              title="Zero Friction"
              description="Browse, filter, and contact landlords directly via WhatsApp or email. No account required to find a home."
              delay={0.3}
            />
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
      className="glass-panel p-8 rounded-3xl flex flex-col gap-4 group hover:-translate-y-2 hover:shadow-[0_20px_40px_-20px_rgba(255,255,255,0.1)] hover:border-white/20 transition-all duration-500 will-change-transform"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/30 group-hover:bg-white/10 flex items-center justify-center mb-4 transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-medium font-display group-hover:text-white transition-colors">{title}</h3>
      <p className="text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">{description}</p>
    </motion.div>
  );
};
