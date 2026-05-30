import React, { useRef, useEffect, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Property } from '../types';
import { useNavigate } from 'react-router-dom';
import Supercluster from 'supercluster';

interface MapProps {
  properties: Property[];
  focusedPropertyId?: string | null;
}

export default function MapLibre({ properties, focusedPropertyId }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lng] = useState(36.8219); 
  const [lat] = useState(-1.2921);
  const [zoom] = useState(11);
  
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const clusterMarkersRef = useRef<Record<string, maplibregl.Marker>>({});
  
  const navigate = useNavigate();

  // Create supercluster instance
  const supercluster = useMemo(() => {
    const customPoints = properties.map(property => {
      const pLat = property.coordinates?.lat || lat + (Math.random() - 0.5) * 0.1;
      const pLng = property.coordinates?.lng || lng + (Math.random() - 0.5) * 0.1;
      return {
        type: 'Feature' as const,
        properties: { cluster: false, propertyId: property.id, ...property },
        geometry: { type: 'Point' as const, coordinates: [pLng, pLat] }
      };
    });

    const index = new Supercluster({
      radius: 60,
      maxZoom: 16
    });
    index.load(customPoints);
    return index;
  }, [properties, lat, lng]);

  const updateMarkers = () => {
    if (!map.current) return;
    
    const bounds = map.current.getBounds();
    const currentZoom = Math.floor(map.current.getZoom());
    const bbox = [
      bounds.getWest(), bounds.getSouth(),
      bounds.getEast(), bounds.getNorth()
    ] as [number, number, number, number];

    const clusters = supercluster.getClusters(bbox, currentZoom);

    // Track active marker IDs to cleanup ones out of view
    const activeMarkerIds = new Set<string>();
    const activeClusterIds = new Set<string>();

    clusters.forEach((cluster) => {
      const [clusterLng, clusterLat] = cluster.geometry.coordinates;
      const isCluster = cluster.properties.cluster;

      if (isCluster) {
        const clusterId = cluster.properties.cluster_id;
        activeClusterIds.add(String(clusterId));

        if (!clusterMarkersRef.current[clusterId]) {
          const el = document.createElement('div');
          el.className = 'w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-white border-[3px] border-surface-900 shadow-xl cursor-pointer transform transition-transform hover:scale-110';
          el.innerHTML = `${cluster.properties.point_count}`;
          
          el.onclick = () => {
             const expansionZoom = supercluster.getClusterExpansionZoom(clusterId);
             map.current?.flyTo({
                center: [clusterLng, clusterLat],
                zoom: expansionZoom
             });
          };

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([clusterLng, clusterLat])
            .addTo(map.current!);
          
          clusterMarkersRef.current[clusterId] = marker;
        } else {
          // Update position just in case
          clusterMarkersRef.current[clusterId].setLngLat([clusterLng, clusterLat]);
        }
      } else {
        const property = cluster.properties;
        const propId = property.propertyId as string;
        activeMarkerIds.add(propId);

        if (!markersRef.current[propId]) {
          // Create new singular marker
          const el = document.createElement('div');
          el.className = 'px-3 py-1.5 bg-brand-500 rounded-full flex items-center justify-center font-bold text-black border-[3px] border-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] cursor-pointer transform transition-all text-xs hover:scale-110 hover:z-50';
          el.innerHTML = `KSh ${Math.round(property.price / 1000)}k`;

          const popupDiv = document.createElement('div');
          popupDiv.className = 'w-64 bg-surface-900 rounded-xl overflow-hidden font-sans';
          popupDiv.innerHTML = `
            <div class="h-40 w-full overflow-hidden relative">
              <img src="${property.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}" class="w-full h-full object-cover" />
            </div>
            <div class="p-4">
              <h3 class="font-medium text-white text-base truncate mb-1">${property.title}</h3>
              <p class="text-white/60 text-xs truncate mb-2">${property.location} • 1.2km from campus</p>
              <div class="flex items-end justify-between mt-3">
                 <div>
                    <p class="text-brand-500 font-medium text-sm">KSh ${property.price.toLocaleString()}</p>
                 </div>
                 <button id="btn-${propId}" class="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/80 transition-colors">View</button>
              </div>
            </div>
          `;

          const popup = new maplibregl.Popup({ 
            offset: 15, 
            closeButton: false,
            className: 'custom-map-popup mt-2' 
          }).setDOMContent(popupDiv);
            
          popup.on('open', () => {
             const btn = document.getElementById(`btn-${propId}`);
             if (btn) btn.onclick = () => navigate(`/properties/${propId}`);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([clusterLng, clusterLat])
            .setPopup(popup)
            .addTo(map.current!);
          
          markersRef.current[propId] = marker;
        } else {
          // just update coords
          markersRef.current[propId].setLngLat([clusterLng, clusterLat]);
        }
      }
    });

    // Cleanup stale markers
    Object.keys(markersRef.current).forEach(id => {
       if (!activeMarkerIds.has(id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
       }
    });
    Object.keys(clusterMarkersRef.current).forEach(id => {
       if (!activeClusterIds.has(id)) {
          clusterMarkersRef.current[id].remove();
          delete clusterMarkersRef.current[id];
       }
    });
  };

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [lng, lat],
      zoom: zoom,
      attributionControl: false
    });
    
    map.current.addControl(new maplibregl.NavigationControl({
        showCompass: false
    }), 'bottom-right');

    const triggerUpdate = () => requestAnimationFrame(updateMarkers);
    map.current.on('move', triggerUpdate);
    map.current.on('moveend', triggerUpdate);
    map.current.on('zoom', triggerUpdate);
    map.current.on('load', triggerUpdate);

  }, [lng, lat, zoom]);

  // Handle properties change manually triggering update if map loaded
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      updateMarkers();
    }
  }, [supercluster]);

  // Fly to focused property
  useEffect(() => {
    if (map.current && focusedPropertyId && markersRef.current[focusedPropertyId]) {
      const marker = markersRef.current[focusedPropertyId];
      const lngLat = marker.getLngLat();
      
      // Close other popups, open this one
      Object.keys(markersRef.current).forEach(k => {
        if (k !== focusedPropertyId && markersRef.current[k].getPopup().isOpen()) {
           markersRef.current[k].togglePopup();
        }
      });

      map.current.flyTo({ center: lngLat, zoom: 15, duration: 1200 });
      if (!marker.getPopup().isOpen()) marker.togglePopup();
    }
  }, [focusedPropertyId]);

  return <div ref={mapContainer} className="w-full h-full bg-surface-900 overflow-hidden" />;
}
