import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Listing } from '../types';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, SquareSquare, Filter, Building, Phone, Mail, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ListingCard } from '../components/ListingCard';

export const Listings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        if (filterType !== 'all') {
          q = query(collection(db, 'listings'), where('type', '==', filterType), orderBy('createdAt', 'desc'));
        }
        
        const snapshot = await getDocs(q);
        const fetchedListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
        setListings(fetchedListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filterType]);

  return (
    <div className="container mx-auto px-6 max-w-7xl py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-medium mb-4">Discover Housing</h1>
          <p className="text-white/50 text-lg max-w-xl">Browse curated, verified student accommodations. Contact landlords directly with zero friction.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
          {['all', 'apartment', 'hostel', 'bedsitter'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium capitalize transition-all",
                filterType === type 
                  ? "bg-white text-black shadow-lg" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {listings.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
