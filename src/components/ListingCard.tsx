import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, animate } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin, Building, PlayCircle, Star } from 'lucide-react';
import { Property } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { optimizeCloudinaryUrl, getCloudinaryPosterNode } from '../lib/optimizeMedia';

interface ListingCardProps {
  property: Property;
  index?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ property, index = 0, onMouseEnter, onMouseLeave }) => {
  const mediaItem = (property.media && property.media.length > 0) ? property.media[0] : null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  
  // Mouse position for dynamic lighting
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Intersection observer for smart autoplay
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Attempt preload for video if not hovered yet
    videoRef.current.load();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Autoplay when visible and mostly centered.
            // Using a timeout prevents play() / pause() race condition errors if users scroll fast
            const playPromise = videoRef.current?.play();
            if (playPromise !== undefined) {
              playPromise.then(() => {
                setIsPlaying(true);
              }).catch(() => {
                // Autoplay may be blocked by browser policies
                setIsPlaying(false);
              });
            }
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 } // Needs to be 60% visible to autoplay
    );

    observer.observe(videoRef.current);
    
    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, [mediaItem]);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;
    
    // Smooth transition to coordinates
    animate(mouseX, x, { duration: 0.15 });
    animate(mouseY, y, { duration: 0.15 });
  }

  const optimizedUrl = mediaItem ? optimizeCloudinaryUrl(mediaItem.secure_url, mediaItem.resource_type) : '';
  const posterUrl = mediaItem ? getCloudinaryPosterNode(mediaItem.secure_url) : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
      onMouseEnter={() => {
        setIsHovered(true);
        if (onMouseEnter) onMouseEnter();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (onMouseLeave) onMouseLeave();
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Background ambient glow matching glass shine */}
      <div className="absolute -inset-0.5 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700 pointer-events-none" />

      <Link to={`/properties/${property.id}`} className="block h-full outline-none relative z-10">
        <div className="glass-panel p-2 pb-5 rounded-[2rem] hover:-translate-y-2 hover:shadow-[0_30px_60px_-20px_rgba(255,255,255,0.15)] transition-all duration-700 overflow-hidden h-full flex flex-col bg-surface-800/40 backdrop-blur-2xl border-white/10 hover:border-white/20 relative cursor-pointer">
          
          {/* Dynamic interactive glare/shine element */}
          <motion.div
            className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[2rem]"
            style={{
              background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent 40%)`,
            }}
          />

          <div className="relative h-64 sm:h-72 rounded-[1.5rem] overflow-hidden mb-5 bg-surface-900 border border-white/5 group-hover:shadow-inner">
            {!isMediaLoaded && mediaItem && !mediaError && (
               <div className="absolute inset-0 flex items-center justify-center bg-surface-800 animate-pulse">
                 <Building className="w-8 h-8 text-white/5" />
               </div>
            )}
            
            {mediaItem && !mediaError ? (
              <>
                {mediaItem.resource_type === 'video' ? (
                  <video 
                    ref={(el) => {
                      // Attach to both the local ref and check readyState
                      // Assign inner ref for IntersectionObserver
                      if (el) {
                        (videoRef as any).current = el;
                        if (el.readyState >= 2) {
                          setIsMediaLoaded(true);
                        }
                      }
                    }}
                    src={optimizedUrl} 
                    poster={posterUrl}
                    onLoadedData={() => setIsMediaLoaded(true)}
                    onError={() => setMediaError(true)}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-1000 transform origin-center",
                      isHovered ? "scale-110" : "scale-100",
                      isPlaying ? "opacity-100" : "opacity-80 object-center",
                      isMediaLoaded ? "opacity-100" : "opacity-0"
                    )}
                    muted 
                    loop 
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img 
                    src={optimizedUrl} 
                    alt={property.title}
                    onLoad={() => setIsMediaLoaded(true)}
                    onError={() => setMediaError(true)}
                    ref={(img) => {
                      if (img && img.complete) {
                        setIsMediaLoaded(true);
                      }
                    }}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-1000 transform origin-center group-hover:scale-110 will-change-transform",
                      isMediaLoaded ? "opacity-100" : "opacity-0"
                    )}
                    loading="lazy"
                  />
                )}
                
                {mediaItem.resource_type === 'video' && (
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all duration-500 pointer-events-none z-10",
                    isHovered || isPlaying ? "opacity-0" : "opacity-100"
                  )}>
                    <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-900/50 gradient-noise">
                <Building className="w-12 h-12 text-white/10" />
              </div>
            )}

            {/* Premium Inner Shadow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none z-10" />
            
            {/* Soft Shine Sweep Overlay across the image container */}
            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-[150%] skew-x-[-30deg] group-hover:translate-x-[150%] transition-transform duration-[1.5s] ease-in-out pointer-events-none z-20" />

            {property.status === 'occupied' && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-md z-30 flex items-center justify-center">
                <span className="px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-full text-xs font-bold tracking-[0.2em] text-white border border-white/20 uppercase shadow-2xl">
                  Occupied
                </span>
              </div>
            )}
            
            <div className="absolute top-4 right-4 z-20 flex gap-2">
               <span className="px-3 py-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-bold tracking-wider text-white uppercase flex items-center gap-1.5 shadow-xl">
                 <Star className="w-3 h-3 text-brand-400" /> Premium
               </span>
            </div>

            <div className="absolute bottom-4 left-4 z-20 group-hover:bottom-5 transition-all duration-500">
              <div className="flex flex-col gap-1">
                 <span className="px-4 py-2 bg-white/95 text-black rounded-full text-sm font-bold tracking-wide shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform origin-bottom-left group-hover:scale-105 transition-transform duration-500">
                   {formatCurrency(property.price)} <span className="text-black/50 font-medium text-xs">/ mo</span>
                 </span>
              </div>
            </div>
          </div>
          
          <div className="px-4 flex flex-col flex-1 transform transition-transform duration-500 group-hover:translate-x-1">
            <h3 className="text-xl md:text-2xl font-medium font-display leading-tight flex-1 line-clamp-2 text-white/95 mb-3">{property.title}</h3>
            
            <div className="flex items-center gap-3 text-white/50 text-sm mt-auto pt-4 border-t border-white/5">
              <MapPin className="w-4 h-4 shrink-0 text-white/40 group-hover:text-brand-400 transition-colors duration-300" />
              <span className="line-clamp-1 flex-1">{property.location}</span>
              
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                 <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Replace arrowright import natively below since I forgot it inside lucide-react imports
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

