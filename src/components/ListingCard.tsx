import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin, Building, MessageCircle, Phone, BadgeCheck, Star } from 'lucide-react';
import { Listing } from '../types';
import { cn } from '../lib/utils';

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, index = 0 }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <Link to={`/listings/${listing.id}`} className="block h-full outline-none">
        <div className="glass-panel p-2 pb-5 rounded-[2rem] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] transition-all duration-500 overflow-hidden h-full flex flex-col will-change-transform bg-surface-800/40 backdrop-blur-xl border-white/10 hover:border-white/20">
          <div className="relative h-64 rounded-[1.5rem] overflow-hidden mb-5 bg-surface-900 border border-white/5">
            {listing.images && listing.images.length > 0 ? (
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
            
            <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 bg-black/40 backdrop-blur-xl rounded-full text-xs font-semibold tracking-wide text-white capitalize border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                {listing.type}
              </span>
              {listing.isVerified && (
                <span className="px-3 py-1 bg-brand-500/80 backdrop-blur-xl rounded-full text-xs font-semibold tracking-wide text-white flex items-center gap-1.5 border border-brand-400/20 shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
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
                <p className="text-2xl font-display font-medium text-brand-400">${listing.price}</p>
                <p className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mt-0.5">per month</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-white/50 text-sm mb-6">
              <MapPin className="w-4 h-4 shrink-0 text-white/40" />
              <span className="line-clamp-1">{listing.location}</span>
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
                 {listing.contactWhatsapp && <div className="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20 transition-transform hover:scale-110 shadow-[0_0_15px_rgba(37,211,102,0.1)] hover:shadow-[0_0_20px_rgba(37,211,102,0.3)]"><MessageCircle className="w-4 h-4 text-[#25D366]"/></div>}
                 {listing.contactPhone && <div className="w-9 h-9 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 transition-transform hover:scale-110 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"><Phone className="w-4 h-4 text-brand-400"/></div>}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
