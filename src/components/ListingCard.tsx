import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin, Building, PlayCircle } from 'lucide-react';
import { Property } from '../types';
import { cn, formatCurrency } from '../lib/utils';

interface ListingCardProps {
  property: Property;
  index?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ property, index = 0, onMouseEnter, onMouseLeave }) => {
  const mediaItem = (property.media && property.media.length > 0) ? property.media[0] : null;

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
      <Link to={`/properties/${property.id}`} className="block h-full outline-none">
        <div className="glass-panel p-2 pb-5 rounded-[2rem] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.15)] transition-all duration-500 overflow-hidden h-full flex flex-col will-change-transform bg-surface-800/40 backdrop-blur-xl border-white/10 hover:border-white/20 relative group-hover:rotate-x-2 group-hover:-rotate-y-2 transform perspective-[1500px]">
          
          <div className="relative h-64 rounded-[1.5rem] overflow-hidden mb-5 bg-surface-900 border border-white/5">
            {mediaItem ? (
              <>
                {mediaItem.resource_type === 'video' ? (
                  <video 
                    src={mediaItem.secure_url} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                    muted 
                    loop 
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img 
                    src={mediaItem.secure_url} 
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                    loading="lazy"
                  />
                )}
                {mediaItem.resource_type === 'video' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <PlayCircle className="w-8 h-8 text-white/90" />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-900 gradient-noise">
                <Building className="w-10 h-10 text-white/20" />
              </div>
            )}

            {property.status === 'occupied' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-bold tracking-widest text-white border border-white/20 uppercase">
                  Occupied
                </span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="absolute bottom-4 left-4 z-20">
              <span className="px-3 py-1 bg-white text-black rounded-full text-xs font-bold tracking-wide shadow-md">
                {formatCurrency(property.price)}
              </span>
            </div>
          </div>
          
          <div className="px-4 flex flex-col flex-1">
            <h3 className="text-xl font-medium font-display leading-tight flex-1 line-clamp-2 text-white/95 mb-2">{property.title}</h3>
            
            <div className="flex flex-col gap-1.5 text-white/50 text-sm mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-white group-hover:scale-110 transition-transform duration-300 group-hover:-rotate-12" />
                <span className="line-clamp-1">{property.location}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
