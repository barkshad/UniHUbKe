import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Listing } from '../types';
import { ArrowLeft, MapPin, CheckCircle2, Phone, Mail, MessageCircle, ChevronLeft, ChevronRight, Share, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setListing({ id: docSnap.id, ...docSnap.data() } as Listing);
        } else {
          navigate('/listings');
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 max-w-5xl py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!listing) return null;

  const nextImg = () => setCurrentImageIndex(i => (i + 1) % (listing.images?.length || 1));
  const prevImg = () => setCurrentImageIndex(i => (i - 1 + (listing.images?.length || 1)) % (listing.images?.length || 1));

  return (
    <div className="container mx-auto px-6 max-w-6xl py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </button>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12">
        {/* Left Column: Media & Details */}
        <div className="space-y-12">
          
          {/* Main Gallery */}
          <div className="relative h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden bg-surface-800 glass-panel p-2">
            {listing.images && listing.images.length > 0 ? (
              <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden group">
                <AnimatePresence initial={false} custom={currentImageIndex}>
                  <motion.img
                    key={currentImageIndex}
                    src={listing.images[currentImageIndex]}
                    alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>

                {listing.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={prevImg} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition-colors border border-white/10">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={nextImg} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition-colors border border-white/10">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                )}
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur border border-white/10">
                  {listing.images.map((_, idx) => (
                    <div key={idx} className={cn("w-2 h-2 rounded-full transition-colors", idx === currentImageIndex ? "bg-white" : "bg-white/30")} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">No images available</div>
            )}
          </div>

          <div>
             <div className="flex flex-wrap items-center gap-3 mb-6">
               <span className="px-4 py-1.5 rounded-full bg-surface-800 border border-white/10 text-sm font-medium capitalize text-white/80">{listing.type}</span>
               {listing.isVerified && (
                 <span className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                   <BadgeCheck className="w-4 h-4" />
                   Verified Listing
                 </span>
               )}
               <span className={cn("px-4 py-1.5 rounded-full border text-sm font-medium capitalize", listing.status === 'available' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400")}>
                 {listing.status}
               </span>
             </div>

             <h1 className="text-4xl md:text-5xl font-display font-medium leading-tight mb-4">{listing.title}</h1>
             
             <div className="flex items-start gap-2 text-white/60 mb-6 max-w-2xl">
               <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
               <span className="text-lg leading-relaxed">{listing.location}</span>
             </div>

             <div className="flex flex-wrap gap-2 mb-8">
               {listing.university && (
                 <span className="px-3 py-1 bg-white/5 text-white/70 border border-white/10 rounded text-sm">
                   Ideal for {listing.university}
                 </span>
               )}
               {listing.distanceFromCampus && (
                 <span className="px-3 py-1 bg-white/5 text-white/70 border border-white/10 rounded text-sm">
                   {listing.distanceFromCampus}
                 </span>
               )}
             </div>

             <div className="prose prose-invert max-w-none">
               <h3 className="text-2xl font-display font-medium mb-4">About this property</h3>
               <p className="text-white/70 whitespace-pre-line leading-relaxed text-lg">{listing.description}</p>
             </div>
          </div>

          <div className="border-t border-white/10 pt-10">
            <h3 className="text-2xl font-display font-medium mb-6">Details & Amenities</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 mb-6">
               {(listing.hasWifi || listing.hasWater || listing.genderRestriction !== 'none') && (
                 <>
                   {listing.hasWifi && (
                     <div className="flex items-center gap-3 text-white/80">
                       <CheckCircle2 className="w-5 h-5 text-brand-500" />
                       <span>Free WiFi</span>
                     </div>
                   )}
                   {listing.hasWater && (
                     <div className="flex items-center gap-3 text-white/80">
                       <CheckCircle2 className="w-5 h-5 text-brand-500" />
                       <span>Water Supply</span>
                     </div>
                   )}
                   {listing.genderRestriction !== 'none' && (
                     <div className="flex items-center gap-3 text-white/80">
                       <CheckCircle2 className="w-5 h-5 text-brand-500" />
                       <span className="capitalize">{listing.genderRestriction.replace('_', ' ')}</span>
                     </div>
                   )}
                 </>
               )}
            </div>

            {listing.amenities && listing.amenities.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4">
                {listing.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-white/80">
                    <CheckCircle2 className="w-5 h-5 text-white/30" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Contact & Price */}
        <div className="relative">
          <div className="glass-panel p-8 rounded-[2rem] sticky top-28 flex flex-col gap-8">
            
            <div className="pb-6 border-b border-white/5 leading-tight">
               <p className="text-sm text-white/50 font-medium uppercase tracking-wider mb-2">Rent</p>
               <div className="flex items-end gap-2 mb-2">
                 <span className="text-5xl font-display font-medium text-white">${listing.price}</span>
                 <span className="text-white/50 pb-1">/ month</span>
               </div>
               {listing.deposit && (
                 <p className="text-sm text-white/50">+ ${listing.deposit} deposit required</p>
               )}
            </div>

            <div className="flex flex-col gap-4">
               <h3 className="text-lg font-medium">Contact Landlord</h3>
               <p className="text-sm text-white/50 mb-2">Reach out directly to schedule a viewing or ask questions. No account required.</p>
               
               {listing.contactWhatsapp && (
                 <a 
                   href={`https://wa.me/${listing.contactWhatsapp.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your property '${listing.title}'${listing.university ? ` near ${listing.university}` : ''}. Is it still available?`)}`}
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl font-medium transition-colors"
                 >
                   <MessageCircle className="w-5 h-5" />
                   WhatsApp
                 </a>
               )}
               {listing.contactPhone && (
                 <a href={`tel:${listing.contactPhone}`} className="flex items-center justify-center gap-3 w-full py-4 bg-white text-black rounded-xl font-medium shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-white/90 transition-colors">
                   <Phone className="w-5 h-5" />
                   Call {listing.contactPhone}
                 </a>
               )}
               {listing.contactEmail && (
                 <a href={`mailto:${listing.contactEmail}`} className="flex items-center justify-center gap-3 w-full py-4 bg-surface-800 hover:bg-surface-700 border border-white/10 text-white rounded-xl font-medium transition-colors">
                   <Mail className="w-5 h-5" />
                   Email Landlord
                 </a>
               )}

               {(!listing.contactWhatsapp && !listing.contactPhone && !listing.contactEmail) && (
                 <div className="p-4 rounded-xl bg-surface-800 border border-white/5 text-center text-white/50 text-sm">
                   No contact details provided.
                 </div>
               )}
            </div>
            
            <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-4">
              <button className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors">
                 <Share className="w-4 h-4" />
                 Share
              </button>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
};
