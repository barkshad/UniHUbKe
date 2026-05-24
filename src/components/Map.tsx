import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Listing } from '../types';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for premium feel
const createCustomIcon = (price: number, isHovered: boolean) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div class="bg-surface-900 border ${isHovered ? 'border-white bg-white text-black' : 'border-white/20 text-white'} font-semibold rounded-full px-3 py-1 text-sm shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-all whitespace-nowrap">$${price}</div>`,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
    popupAnchor: [0, -12],
  });
};

const MapController = ({ center }: { center: {lat: number, lng: number} | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

export const ListingsMap = ({ listings, hoveredId }: { listings: Listing[], hoveredId: string | null }) => {
  const navigate = useNavigate();
  // Default center somewhere in Africa or dynamically computed (let's use Nairobi for fallback or just the first listing's coord)
  const defaultCenter = { lat: -1.2921, lng: 36.8219 };
  const validListings = listings.filter(l => l.coordinates && l.coordinates.lat);
  
  const [center, setCenter] = useState<{lat: number, lng: number} | null>(
    validListings.length > 0 ? validListings[0].coordinates! : defaultCenter
  );

  useEffect(() => {
    if (hoveredId) {
      const target = validListings.find(l => l.id === hoveredId);
      if (target?.coordinates) {
        setCenter(target.coordinates);
      }
    }
  }, [hoveredId]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden glass-panel border border-white/5 relative z-0">
      <MapContainer 
        center={center ? [center.lat, center.lng] : [defaultCenter.lat, defaultCenter.lng]} 
        zoom={13} 
        style={{ width: '100%', height: '100%', background: '#0a0a0a' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapController center={center} />
        {validListings.map(listing => (
          <Marker 
            key={listing.id} 
            position={[listing.coordinates!.lat, listing.coordinates!.lng]}
            icon={createCustomIcon(listing.price, hoveredId === listing.id)}
            eventHandlers={{
              mouseover: () => setCenter(listing.coordinates!),
            }}
          >
            <Popup 
              className="custom-popup" 
              closeButton={false}
            >
              <div 
                className="p-1 cursor-pointer w-48 text-white relative bg-surface-900 border border-white/10 rounded-xl overflow-hidden" 
                onClick={() => navigate(`/listings/${listing.id}`)}
              >
                <div className="h-32 bg-surface-800 -m-1 mb-2 relative">
                  {listing.images?.[0] && <img src={listing.images[0]} className="w-full h-full object-cover" alt="" />}
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1 border border-white/10">
                     <Star className="w-3 h-3 text-white" /> 4.9
                  </div>
                </div>
                <div className="p-2">
                  <div className="font-semibold text-sm truncate mb-1">{listing.title}</div>
                  <div className="text-white/60 text-xs truncate mb-2">{listing.location}</div>
                  <div className="font-semibold">${listing.price}<span className="text-[10px] text-white/40 uppercase ml-1">/ mo</span></div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Custom styles for Leaflet elements */}
      <style>{`
        .leaflet-container { font-family: inherit; }
        .leaflet-popup-content-wrapper { 
          background: transparent !important;
          box-shadow: none !important;
          padding: 0;
          margin: 0;
        }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .custom-map-marker { background: none; border: none; }
      `}</style>
    </div>
  );
};
