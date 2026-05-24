import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Listing } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Filter, Building, Map as MapIcon, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ListingCard } from '../components/ListingCard';
import { ListingsMap } from '../components/Map';

export const Listings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        if (filterType !== 'all') {
          q = query(collection(db, 'listings'), where('type', '==', filterType), orderBy('createdAt', 'desc'));
        }
        
        const snapshot = await getDocs(q);
        let fetchedListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
        
        if (search) {
          const s = search.toLowerCase();
          fetchedListings = fetchedListings.filter(l => 
            l.title.toLowerCase().includes(s) || 
            l.location.toLowerCase().includes(s) ||
            l.university?.toLowerCase().includes(s) ||
            l.distanceFromCampus?.toLowerCase().includes(s) 
          );
        }

        setListings(fetchedListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filterType, search]);

  return (
    <div className="container mx-auto px-6 py-6 pb-24 lg:py-12 flex flex-col h-[calc(100vh-72px)] overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 shrink-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-medium mb-4">Discover Housing</h1>
          <p className="text-white/50 text-lg max-w-xl">
            {search ? `Showing results for "${search}"` : "Browse curated, verified student accommodations."}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-md w-full sm:w-auto overflow-x-auto hide-scrollbar">
            {['all', 'apartment', 'hostel', 'bedsitter'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium capitalize transition-all whitespace-nowrap",
                  filterType === type 
                    ? "bg-white text-black shadow-lg" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {type}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setShowMap(!showMap)}
            className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-surface-800 border border-white/10 rounded-full font-medium"
          >
            {showMap ? <><List className="w-4 h-4"/> List View</> : <><MapIcon className="w-4 h-4"/> Map View</>}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-8 relative overflow-hidden">
        {/* Listings column */}
        <div className={cn(
          "w-full h-full overflow-y-auto pr-2 pb-12 transition-all duration-300 custom-scrollbar",
          showMap ? "hidden lg:block lg:w-1/2 xl:w-[60%]" : "lg:w-1/2 xl:w-[60%]"
        )}>
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-surface-800 rounded-3xl h-[400px] animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-32 glass-panel rounded-3xl">
              <Building className="w-16 h-16 text-white/20 mx-auto mb-6" />
              <h3 className="text-xl font-medium mb-2">No listings found</h3>
              <p className="text-white/50">There are currently no properties matching your criteria.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {listings.map((listing, index) => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing} 
                    index={index} 
                    onMouseEnter={() => setHoveredId(listing.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Map column */}
        <div className={cn(
          "h-full transition-all duration-500 rounded-2xl overflow-hidden",
          showMap ? "w-full absolute inset-0 z-10 lg:relative lg:w-1/2 xl:w-[40%]" : "hidden lg:block lg:w-1/2 xl:w-[40%]"
        )}>
           <ListingsMap listings={listings} hoveredId={hoveredId} />
        </div>
      </div>
    </div>
  );
};
