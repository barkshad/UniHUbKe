import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { Property, Category } from '../../types';
import { getProperties, getCategories } from '../../services/firestore';
import { ListingCard } from '../../components/ListingCard';
import { Skeleton } from '../../components/Skeleton';
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
  
  const [filterOpen, setFilterOpen] = useState(false);

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

  const filteredProperties = properties.filter(p => {
    if (p.status === 'hidden') return false;
    if (locationQs && !p.location.toLowerCase().includes(locationQs.toLowerCase())) return false;
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (p.price > maxPrice) return false;
    return true;
  });

  return (
    <div className="flex-1 w-full min-h-screen pt-24 bg-surface-950">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 mb-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-medium leading-tight mb-2">Explore Properties</h1>
            <p className="text-white/50 text-lg">Showing {filteredProperties.length} results</p>
          </div>
          <button 
             onClick={() => setFilterOpen(true)} 
             className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-white/90 transition-colors rounded-full font-medium"
          >
            <Filter className="w-5 h-5" /> Filters
          </button>
        </div>

        {/* Filters Drawer */}
        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setFilterOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              />
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-surface-900 border-l border-white/5 z-50 p-6 flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-medium text-white">Filters</h2>
                  <button onClick={() => setFilterOpen(false)} className="p-3 bg-surface-800 hover:bg-surface-800/80 transition-colors border border-white/10 rounded-full text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/70 uppercase tracking-widest">Location</label>
                    <div className="relative">
                      <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                      <input 
                        type="text" 
                        placeholder="e.g. Gate C, Juja"
                        className="w-full bg-surface-800 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-brand-500 focus:outline-none transition-colors"
                        value={locationQs}
                        onChange={e => setLocationQs(e.target.value)}
                        onBlur={updateParams}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/70 uppercase tracking-widest">Category</label>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => { setSelectedCategory(''); updateParams() }}
                        className={cn("px-4 py-4 rounded-xl border text-left transition-colors", !selectedCategory ? "bg-white text-black border-white font-medium" : "bg-surface-800 border-white/10 text-white hover:bg-surface-700")}
                      >
                        All Categories
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => { setSelectedCategory(cat.id!); updateParams() }}
                          className={cn("px-4 py-4 rounded-xl border text-left transition-colors", selectedCategory === cat.id ? "bg-white text-black border-white font-medium" : "bg-surface-800 border-white/10 text-white hover:bg-surface-700")}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/70 uppercase tracking-widest flex justify-between">
                      <span>Max Price (Monthly)</span>
                      <span className="text-white">KSh {maxPrice.toLocaleString()}</span>
                    </label>
                    <input 
                      type="range"
                      min={0}
                      max={50000}
                      step={1000}
                      value={maxPrice}
                      onChange={e => setMaxPrice(Number(e.target.value))}
                      onMouseUp={updateParams}
                      onTouchEnd={updateParams}
                      className="w-full accent-brand-500 my-4"
                    />
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                  <button onClick={() => setFilterOpen(false)} className="w-full py-4 bg-brand-500 text-black font-semibold rounded-xl hover:bg-white transition-colors shadow-lg shadow-brand-500/20">
                     Show {filteredProperties.length} Properties
                  </button>
                  <button onClick={clearFilters} className="w-full py-4 text-white/50 hover:text-white transition-colors font-medium">
                     Clear Filters
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Skeleton key={i} className="w-full h-80 rounded-[2rem]" />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="w-full py-32 flex flex-col items-center justify-center text-center gap-4 bg-surface-900 border border-white/5 rounded-3xl">
              <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-white/30" />
              </div>
              <h3 className="text-2xl font-medium text-white">No properties found</h3>
              <p className="text-white/50 max-w-md text-lg">Try adjusting your filters or search location to find what you're looking for.</p>
              <button 
                onClick={clearFilters} 
                className="mt-4 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredProperties.map((property, i) => (
                  <ListingCard key={property.id} property={property} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

