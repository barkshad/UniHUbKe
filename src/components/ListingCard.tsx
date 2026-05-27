import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin, Building, PlayCircle, ArrowUpRight } from 'lucide-react';
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
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link to={`/properties/${property.id}`} className="block h-full outline-none">
        <div className="glass-card overflow-hidden h-full flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-20px_rgba(255,255,255,0.1)] hover:border-white/[0.12]">
          
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-800">
            {mediaItem ? (
              <>
                {mediaItem.resource_type === 'video' ? (
                  <video 
                    src={mediaItem.secure_url} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    muted 
                    loop 
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img 
                    src={mediaItem.secure_url} 
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                {mediaItem.resource_type === 'video' && (
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <PlayCircle className="w-4 h-4 text-white/90" />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-800">
                <Building className="w-12 h-12 text-white/10" />
              </div>
            )}

            {/* Status Overlay */}
            {property.status === 'occupied' && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex items-center justify-center">
                <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium tracking-wide text-white border border-white/20">
                  Occupied
                </span>
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/20 to-transparent opacity-60" />

            {/* Price Tag */}
            <div className="absolute bottom-4 left-4 z-20">
              <span className="px-3 py-1.5 bg-white text-surface-900 rounded-lg text-sm font-semibold shadow-lg">
                {formatCurrency(property.price)}<span className="text-surface-900/60 font-normal">/mo</span>
              </span>
            </div>

            {/* View Arrow */}
            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="text-lg font-medium font-display leading-snug line-clamp-2 text-white/95 mb-3 group-hover:text-white transition-colors">
              {property.title}
            </h3>
            
            <div className="flex items-center gap-2 text-white/40 text-sm mt-auto">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
