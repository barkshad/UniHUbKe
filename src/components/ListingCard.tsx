import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin, Building, MessageCircle, Phone, BadgeCheck, Star, PlayCircle } from 'lucide-react';
import { Listing } from '../types';
import { cn } from '../lib/utils';

interface ListingCardProps {
  listing: Listing;
  index?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, index = 0, onMouseEnter, onMouseLeave }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const hasVideo = listing.videoUrl || (listing.images && listing.images[0] && listing.images[0].match(/\.(mp4|webm|ogg)$/i));
  const mediaUrl = listing.videoUrl || (listing.images && listing.images[0]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link to={`/listings/${listing.id}`} className="block h-full outline-none">
        <div className="glass-panel p-2 pb-5 rounded-[2rem] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] transition-all duration-500 overflow-hidden h-full flex flex-col will-change-transform bg-surface-800/40 backdrop-blur-xl border-white/10 hover:border-white/20 relative">
          
          <div className="relative h-64 rounded-[1.5rem] overflow-hidden mb-5 bg-surface-900 border border-white/5">
            {hasVideo ? (
              <>
                <video 
                  ref={videoRef}
                  src={mediaUrl} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                  muted 
                  loop 
                  playsInline
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <PlayCircle className="w-8 h-8 text-white/90" />
                </div>
              </>
            ) : listing.images && listing.images.length > 0 ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-900 gradient-noise">
                <Building className="w-10 h-10 text-white/20" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 bg-black/40 backdrop-blur-xl rounded-full text-xs font-semibold tracking-wide text-white capitalize border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                {listing.type}
              </span>
              {listing.isVerified && (
                <span className="px-3 py-1 bg-white backdrop-blur-xl rounded-full text-xs font-bold tracking-wide text-black flex items-center gap-1.5 border border-white/20 shadow-[0_4px_12px_rgba(255,255,255,0.3)]">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
               <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
               <span className="text-xs font-semibold text-white">4.9</span>
            </div>
          </div>
          
          <div className="px-4 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-3 gap-4">
              <h3 className="text-xl font-medium font-display leading-tight flex-1 line-clamp-2 text-white/95">{listing.title}</h3>
              <div className="text-right shrink-0">
                <p className="text-2xl font-display font-medium text-white">${listing.price}</p>
                <p className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mt-0.5">per month</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 text-white/50 text-sm mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-white/40" />
                <span className="line-clamp-1">{listing.location}</span>
              </div>
              {listing.distanceFromCampus && (
                <div className="flex items-center gap-2 text-xs pl-6">
                  <span className="truncate">{listing.distanceFromCampus}</span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
              <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-surface-700 border-2 border-surface-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${listing.landlordId}`} alt="Landlord" className="w-full h-full object-cover" />
                 </div>
                 <div className="h-8 pl-5 pr-3 rounded-full bg-surface-800 border-2 border-surface-800 flex items-center shadow-sm">
                    <span className="text-xs font-medium text-white/70">Verified Host</span>
                 </div>
              </div>
              <div className="flex gap-2">
                 {listing.contactWhatsapp && (
                   <button 
                     onClick={(e) => {
                       e.preventDefault();
                       const loc = listing.university ? ` near ${listing.university}` : '';
                       const text = encodeURIComponent(`Hi, I'm interested in your property '${listing.title}'${loc}. Is it still available?`);
                       window.open(`https://wa.me/${listing.contactWhatsapp?.replace(/[^0-9+]/g, '')}?text=${text}`, '_blank');
                     }}
                     className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20 transition-transform hover:scale-110 shadow-[0_0_15px_rgba(37,211,102,0.1)] hover:shadow-[0_0_20px_rgba(37,211,102,0.3)] z-10"
                   >
                     <MessageCircle className="w-4 h-4 text-[#25D366]"/>
                   </button>
                 )}
                 {listing.contactPhone && (
                   <button 
                     onClick={(e) => {
                       e.preventDefault();
                       window.open(`tel:${listing.contactPhone?.replace(/[^0-9+]/g, '')}`, '_self');
                     }}
                     className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20 transition-transform hover:scale-110 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] z-10"
                   >
                     <Phone className="w-4 h-4 text-white"/>
                   </button>
                 )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
