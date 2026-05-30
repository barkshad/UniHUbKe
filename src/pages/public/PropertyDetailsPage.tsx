import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, CheckCircle, ArrowLeft, Loader2, MessageSquare, Phone, ShieldAlert, Building } from 'lucide-react';
import { Property, Agent } from '../../types';
import { getProperty, getAgent } from '../../services/firestore';
import { formatCurrency, generateWhatsAppLink, cn } from '../../lib/utils';
import { optimizeCloudinaryUrl, getCloudinaryPosterNode, optimizeThumbnailUrl } from '../../lib/optimizeMedia';
import { motion } from 'motion/react';

import { Skeleton } from '../../components/Skeleton';

export const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(0);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    const fetchIt = async () => {
      if (!id) return;
      try {
        const prop = await getProperty(id);
        if (prop) {
          setProperty(prop);
          const ag = await getAgent(prop.agentId);
          setAgent(ag);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIt();
  }, [id]);

  useEffect(() => {
    setIsMediaLoaded(false);
    setMediaError(false);
  }, [activeMedia]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-pulse">
        <Skeleton className="w-32 h-6" />
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-2/3 space-y-8">
            <Skeleton className="aspect-video w-full rounded-3xl" />
            <div className="flex gap-4">
              <Skeleton className="w-24 h-24 rounded-2xl" />
              <Skeleton className="w-24 h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-40 w-full rounded-3xl" />
          </div>
          <div className="w-full lg:w-1/3 space-y-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-display">Property not found</h1>
        <Link to="/listings" className="text-white underline underline-offset-4">Return to listings</Link>
      </div>
    );
  }

  const handleWhatsApp = () => {
    if (!agent) return;
    const msg = `Hello, I'm interested in the ${property.title} listed for ${formatCurrency(property.price)} in ${property.location}. Is it still available?`;
    window.open(generateWhatsAppLink(agent.whatsappNumber, msg), '_blank');
  };

  const currentMedia = property.media && property.media.length > 0 ? property.media[activeMedia] : null;
  const optimizedUrl = currentMedia ? optimizeCloudinaryUrl(currentMedia.secure_url, currentMedia.resource_type) : '';
  const currentPoster = currentMedia ? getCloudinaryPosterNode(currentMedia.secure_url) : '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link to="/listings" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to listings
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Column */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* Media Gallery */}
          <div className="space-y-4">
            <div className="aspect-video bg-surface-900 rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl">
              {property.status === 'occupied' && (
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-6 py-3 bg-red-500/20 backdrop-blur-md text-red-100 uppercase tracking-widest font-bold border border-red-500/30 rounded-full shadow-2xl">
                    Occupied
                  </span>
                </div>
              )}
              
              {!isMediaLoaded && currentMedia && !mediaError && (
                 <div className="absolute inset-0 flex items-center justify-center bg-surface-800 animate-pulse">
                   <Loader2 className="w-10 h-10 text-white/20 animate-spin" />
                 </div>
              )}

              {currentMedia && !mediaError ? (
                currentMedia.resource_type === 'video' ? (
                  <video 
                    key={optimizedUrl}
                    src={optimizedUrl} 
                    poster={currentPoster}
                    onLoadedData={() => setIsMediaLoaded(true)}
                    onError={() => setMediaError(true)}
                    ref={(el) => {
                      if (el && el.readyState >= 2) {
                        setIsMediaLoaded(true);
                      }
                    }}
                    className={cn(
                      "w-full h-full object-cover transition-opacity duration-700",
                      isMediaLoaded ? "opacity-100" : "opacity-0"
                    )}
                    controls 
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img 
                    key={optimizedUrl}
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
                      "w-full h-full object-cover transition-opacity duration-700",
                      isMediaLoaded ? "opacity-100" : "opacity-0"
                    )}
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/20 bg-surface-800">
                  <Building className="w-12 h-12 mb-4 opacity-50" />
                  <p>{mediaError ? "Media failed to load" : "No Media Available"}</p>
                </div>
              )}
            </div>

            {property.media && property.media.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {property.media.map((m, i) => {
                  const mThumbUrl = optimizeThumbnailUrl(m.secure_url);
                  return (
                    <button 
                      key={m.public_id}
                      onClick={() => setActiveMedia(i)}
                      className={`relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden snap-center transition-all ${activeMedia === i ? 'border-2 border-white ring-2 ring-white/20 scale-105' : 'opacity-50 hover:opacity-100 hover:scale-105'}`}
                    >
                      <img src={mThumbUrl} alt="" loading="lazy" className="w-full h-full object-cover pointer-events-none" />
                      {m.resource_type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                           <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                             <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-white ml-1"></div>
                           </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-display font-medium mb-4">{property.title}</h1>
                <div className="flex items-center gap-2 text-white/60 text-lg">
                  <MapPin className="w-5 h-5 flex-none" />
                  <span>{property.location}</span>
                </div>
              </div>
              <div className="text-left sm:text-right flex-none w-full sm:w-auto bg-white p-4 rounded-2xl text-black shadow-lg">
                <div className="text-2xl md:text-3xl font-display font-bold">{formatCurrency(property.price)}</div>
                <div className="text-sm font-semibold uppercase tracking-widest opacity-60">per month</div>
              </div>
            </div>

            <div className="w-full h-px bg-white/10" />

            <div>
              <h2 className="text-xl font-display font-medium mb-4">Description</h2>
              <p className="text-white/70 leading-relaxed whitespace-pre-line text-lg">
                {property.description}
              </p>
            </div>

            <div className="w-full h-px bg-white/10" />

            <div>
              <h2 className="text-xl font-display font-medium mb-6">Features & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                {property.features?.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white/80">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Sticky) */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="sticky top-24 space-y-6">

            {/* Agent Card */}
            <div className="glass-panel p-6 border border-white/10 rounded-3xl bg-surface-800/80">
              <h3 className="text-lg font-medium mb-6 text-white/50 uppercase tracking-widest text-center">Listed By</h3>
              <div className="flex flex-col items-center text-center gap-4 mb-8">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-900 border-4 border-white/10 shadow-xl">
                  {agent?.profilePhotoURL ? (
                    <img src={agent.profilePhotoURL} alt={agent?.name || "Agent"} className="w-full h-full object-cover" />
                  ) : (
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${agent?.name}`} alt="Agent" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <div className="text-2xl font-display font-medium mb-1">{agent?.name || "Unknown Agent"}</div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 text-sm font-semibold rounded-full border border-green-500/20">
                    <CheckCircle className="w-4 h-4" /> Verified Agent
                  </div>
                </div>
              </div>

              {property.status === 'occupied' ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
                  <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-200 font-medium">This property is currently occupied.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleWhatsApp}
                    className="flex-1 bg-[#25D366] hover:bg-[#25D366]/90 text-white p-4 rounded-2xl font-medium text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(37,211,102,0.2)]"
                  >
                    <MessageSquare className="w-5 h-5 fill-current" />
                    WhatsApp
                  </button>
                  <a 
                    href={`tel:${agent?.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex-1 bg-white hover:bg-white/90 text-black p-4 rounded-2xl font-medium text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    <Phone className="w-5 h-5 fill-current" />
                    Call {agent?.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Safety Tips Card */}
            <div className="glass-panel p-6 border border-white/5 rounded-3xl bg-surface-900/50">
              <h3 className="flex items-center gap-2 font-display font-medium text-lg mb-4 text-white/80">
                <ShieldAlert className="w-5 h-5 text-blue-400" /> Safety Tips
              </h3>
              <ul className="space-y-4 text-sm text-white/60">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-none" />
                  Never pay before inspection
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-none" />
                  Meet agents in open, public places
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-none" />
                  Verify the agent's identity
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-none" />
                  Inspect the property thoroughly
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
