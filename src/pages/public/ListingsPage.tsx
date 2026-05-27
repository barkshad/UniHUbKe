import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Filter, X, SlidersHorizontal, Building } from 'lucide-react';
import { Property, Category } from '../../types';
import { getProperties, getCategories } from '../../services/firestore';
import { ListingCard } from '../../components/ListingCard';
import { cn } from '../../lib/utils';
import { useSearchParams } from 'react-router-dom';

export const ListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [locationQs, setLocationQs] = useState(searchParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 50000);
  
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [props, cats] = await Promise.all([
          getProperties(),
          getCategories()
        ]);
        setProperties(props);
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const updateParams = () => {
    const params = new URLSearchParams();
    if (locationQs) params.set('location', locationQs);
    if (selectedCategory) params.set('category', selectedCategory);
    if (maxPrice < 50000) params.set('maxPrice', maxPrice.toString());
    setSearchParams(params);
  };

  const clearFilters = () => {
    setLocationQs('');
    setSelectedCategory('');
    setMaxPrice(50000);
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = locationQs || selectedCategory || maxPrice < 50000;

  const filteredProperties = properties.filter(p => {
    if (p.status === 'hidden') return false;
    if (locationQs && !p.location.toLowerCase().includes(locationQs.toLowerCase())) return false;
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (p.price > maxPrice) return false;
    return true;
  });

  return (
    <div className="flex-1 w-full flex flex-col md:flex-row relative min-h-screen">
      {/* Mobile Filter Button */}
      <div className="md:hidden sticky top-[72px] z-30 bg-surface-950/80 backdrop-blur-xl border-b border-white/[0.04] py-4 px-6 flex items-center justify-between">
        <span className="font-medium text-white/70">
          {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'}
        </span>
        <button 
          onClick={() => setMobileFilterOpen(true)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all",
            hasActiveFilters 
              ? "bg-white text-surface-900" 
              : "bg-white/[0.06] text-white/70 border border-white/[0.06]"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" /> 
          Filters
          {hasActiveFilters && <span className="w-2 h-2 bg-surface-900 rounded-full" />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(mobileFilterOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-80 bg-surface-900/95 backdrop-blur-2xl border-r border-white/[0.04] p-6 flex flex-col gap-8 h-screen",
              "md:sticky md:top-[72px] md:h-[calc(100vh-72px)] md:bg-surface-900/50 overflow-y-auto custom-scrollbar",
              !mobileFilterOpen && "hidden md:flex"
            )}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between md:hidden">
              <h2 className="text-xl font-display font-medium">Filters</h2>
              <button 
                onClick={() => setMobileFilterOpen(false)} 
                className="p-2 hover:bg-white/[0.06] rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Location Filter */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-white/40 uppercase tracking-widest">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="text" 
                  placeholder="e.g. Gate C, Juja"
                  className="input-premium pl-11"
                  value={locationQs}
                  onChange={e => setLocationQs(e.target.value)}
                  onBlur={updateParams}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-white/40 uppercase tracking-widest">Category</label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setSelectedCategory(''); updateParams() }}
                  className={cn(
                    "px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all",
                    !selectedCategory 
                      ? "bg-white text-surface-900 border-white" 
                      : "bg-surface-800/50 border-white/[0.06] text-white/60 hover:bg-surface-800 hover:text-white"
                  )}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id!); updateParams() }}
                    className={cn(
                      "px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all",
                      selectedCategory === cat.id 
                        ? "bg-white text-surface-900 border-white" 
                        : "bg-surface-800/50 border-white/[0.06] text-white/60 hover:bg-surface-800 hover:text-white"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/40 uppercase tracking-widest">Max Price</label>
                <span className="text-sm font-medium text-white">KSh {maxPrice.toLocaleString()}</span>
              </div>
              <input 
                type="range"
                min={0}
                max={50000}
                step={1000}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                onMouseUp={updateParams}
                onTouchEnd={updateParams}
                className="w-full h-2 bg-surface-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/30">
                <span>KSh 0</span>
                <span>KSh 50,000</span>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="btn-ghost text-white/50 hover:text-white mt-auto"
              >
                Clear all filters
              </button>
            )}

            {/* Mobile Apply Button */}
            <button 
              onClick={() => setMobileFilterOpen(false)}
              className="btn-primary md:hidden"
            >
              Show {filteredProperties.length} Results
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 bg-surface-950">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-medium">{filteredProperties.length} Properties</h1>
            <p className="text-white/40 mt-1">Available for rent in your area</p>
          </div>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters} 
              className="text-white/40 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[4/5] bg-surface-800/30 rounded-2xl shimmer" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full py-24 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-surface-800/30 flex items-center justify-center mb-6">
              <Building className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-xl font-medium mb-2">No properties found</h3>
            <p className="text-white/40 max-w-md mb-6">
              Try adjusting your filters or search location to find what you&apos;re looking for.
            </p>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters} 
                className="btn-secondary"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProperties.map((property, i) => (
                <ListingCard key={property.id} property={property} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
