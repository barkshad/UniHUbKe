import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, CheckCircle, ArrowLeft, MessageSquare, Phone, ShieldCheck, ChevronLeft, ChevronRight, Play, Building } from 'lucide-react';
import { Property, Agent } from '../../types';
import { getProperty, getAgent } from '../../services/firestore';
import { formatCurrency, generateWhatsAppLink, cn } from '../../lib/utils';

export const PropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(0);

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="w-32 h-6 bg-surface-800/30 rounded-lg shimmer mb-8" />
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="aspect-video w-full bg-surface-800/30 rounded-3xl shimmer" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-20 h-20 bg-surface-800/30 rounded-xl shimmer" />
              ))}
            </div>
            <div className="h-64 w-full bg-surface-800/30 rounded-3xl shimmer" />
          </div>
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="h-72 w-full bg-surface-800/30 rounded-3xl shimmer" />
            <div className="h-48 w-full bg-surface-800/30 rounded-3xl shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-3xl bg-surface-800/30 flex items-center justify-center">
          <Building className="w-10 h-10 text-white/10" />
        </div>
        <h1 className="text-2xl font-display font-medium">Property not found</h1>
        <p className="text-white/40 text-center max-w-md">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link to="/listings" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>
      </div>
    );
  }

  const handleWhatsApp = () => {
    if (!agent) return;
    const msg = `Hello, I'm interested in the ${property.title} listed for ${formatCurrency(property.price)} in ${property.location}. Is it still available?`;
    window.open(generateWhatsAppLink(agent.whatsappNumber, msg), '_blank');
  };

  const nextMedia = () => {
    if (property.media && property.media.length > 1) {
      setActiveMedia((prev) => (prev + 1) % property.media!.length);
    }
  };

  const prevMedia = () => {
    if (property.media && property.media.length > 1) {
      setActiveMedia((prev) => (prev - 1 + property.media!.length) % property.media!.length);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link 
        to="/listings" 
        className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </Link>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Column - Media & Details */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* Media Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-surface-900 rounded-3xl overflow-hidden border border-white/[0.06] group">
              {/* Status Overlay */}
              {property.status === 'occupied' && (
                <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="px-6 py-3 bg-rose-500/20 text-rose-200 uppercase tracking-widest text-sm font-bold border border-rose-500/30 rounded-xl">
                    Currently Occupied
                  </span>
                </div>
              )}
              
              {property.media && property.media.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMedia}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                  >
                    {property.media[activeMedia].resource_type === 'video' ? (
                      <video 
                        src={property.media[activeMedia].secure_url} 
                        className="w-full h-full object-cover" 
                        controls 
                        autoPlay
                      />
                    ) : (
                      <img 
                        src={property.media[activeMedia].secure_url} 
                        alt={property.title} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building className="w-16 h-16 text-white/10" />
                </div>
              )}

              {/* Navigation Arrows */}
              {property.media && property.media.length > 1 && (
                <>
                  <button 
                    onClick={prevMedia}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextMedia}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                    {property.media.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveMedia(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          i === activeMedia ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {property.media && property.media.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {property.media.map((m, i) => (
                  <button 
                    key={m.public_id}
                    onClick={() => setActiveMedia(i)}
                    className={cn(
                      "shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all relative",
                      i === activeMedia 
                        ? "ring-2 ring-white ring-offset-2 ring-offset-surface-950" 
                        : "opacity-50 hover:opacity-100"
                    )}
                  >
                    {m.resource_type === 'video' ? (
                      <>
                        <video src={m.secure_url} className="w-full h-full object-cover pointer-events-none" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="w-4 h-4 fill-white" />
                        </div>
                      </>
                    ) : (
                      <img src={m.secure_url} alt="" className="w-full h-full object-cover pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Info Card */}
          <div className="glass-card p-6 sm:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium mb-3 text-balance">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-white/50">
                  <MapPin className="w-4 h-4" />
                  <span>{property.location}</span>
                </div>
              </div>
              <div className="bg-white text-surface-900 px-5 py-4 rounded-2xl shrink-0">
                <div className="text-2xl sm:text-3xl font-display font-bold">{formatCurrency(property.price)}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-surface-900/60">per month</div>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Description */}
            <div>
              <h2 className="text-lg font-medium mb-4">About this property</h2>
              <p className="text-white/60 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <>
                <div className="h-px bg-white/[0.06]" />
                <div>
                  <h2 className="text-lg font-medium mb-6">Features & Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {property.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-white/70 text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Agent & Actions */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="lg:sticky lg:top-24 space-y-6">

            {/* Agent Card */}
            <div className="glass-card p-6">
              <h3 className="text-xs font-medium text-white/40 uppercase tracking-widest text-center mb-6">Listed By</h3>
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-800 border-2 border-white/[0.08]">
                  {agent?.profilePhotoURL ? (
                    <img src={agent.profilePhotoURL} alt={agent?.name || "Agent"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display font-semibold text-2xl text-white/20">
                      {agent?.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xl font-display font-medium mb-2">{agent?.name || "Unknown Agent"}</div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Agent
                  </div>
                </div>
              </div>

              {property.status === 'occupied' ? (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
                  <p className="text-rose-300 text-sm font-medium">This property is currently occupied.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleWhatsApp}
                    className="bg-[#25D366] hover:bg-[#25D366]/90 text-white p-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_-4px_rgba(37,211,102,0.4)]"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Message on WhatsApp
                  </button>
                  <a 
                    href={`tel:${agent?.phone.replace(/[^0-9+]/g, '')}`}
                    className="bg-white hover:bg-white/90 text-surface-900 p-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                  >
                    <Phone className="w-5 h-5" />
                    Call {agent?.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Safety Tips */}
            <div className="glass-card p-6">
              <h3 className="flex items-center gap-2 font-medium text-sm mb-4 text-white/70">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Safety Tips
              </h3>
              <ul className="space-y-3 text-sm text-white/50">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  Never pay before physical inspection
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  Meet agents in public places
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                  Verify agent identity before payment
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
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
