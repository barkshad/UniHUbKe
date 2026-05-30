import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Filter, X, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { Property, Category } from '../../types';
import { getProperties, getCategories } from '../../services/firestore';
import { ListingCard } from '../../components/ListingCard';
import { Skeleton } from '../../components/Skeleton';
import { cn } from '../../lib/utils';
import { useSearchParams } from 'react-router-dom';

const MapLibre = React.lazy(() => import('../../components/MapLibre'));

export const ListingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [locationQs, setLocationQs] = useState(searchParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 50000);
  
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'map'>('list');
  const [focusedPropertyId, setFocusedPropertyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [props, cats] = await Promise.all([
          getProperties(), // fetch all
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

  // derived state for filtered properties
  const filteredProperties = properties.filter(p => {
    if (p.status === 'hidden') return false;
    if (locationQs && !p.location.toLowerCase().includes(locationQs.toLowerCase())) return false;
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (p.price > maxPrice) return false;
    return true;
  });

  return (
    <div className="flex-1 w-full flex flex-col md:flex-row relative">
      {/* Mobile Filter & Toggle Bar */}
      <div className="md:hidden sticky top-[72px] z-30 bg-surface-900 border-b border-white/5 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-surface-800 p-1 rounded-full border border-white/10">
           <button 
             onClick={() => setMobileViewMode('list')}
             className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2", mobileViewMode === 'list' ? "bg-white text-black shadow" : "text-white/70")}
           >
              <ListIcon className="w-4 h-4" /> List
           </button>
           <button 
             onClick={() => setMobileViewMode('map')}
             className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2", mobileViewMode === 'map' ? "bg-white text-black shadow" : "text-white/70")}
           >
              <MapIcon className="w-4 h-4" /> Map
           </button>
        </div>
        <button 
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full font-medium text-sm"
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Sidebar Overlay (Mobile Desktop Filters via Menu) */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-surface-900 flex flex-col pt-[72px] pb-6 px-6 h-screen overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8 mt-4">
              <h2 className="text-2xl font-display font-medium">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="p-3 bg-surface-800 border border-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8 flex-1">
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/70 uppercase tracking-widest">Location</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                  <input 
                    type="text" 
                    placeholder="e.g. Gate C, Juja"
                    className="input-playful w-full bg-surface-800 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white"
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
                    className={cn("px-4 py-4 rounded-xl border text-left transition-colors", !selectedCategory ? "bg-white text-black border-white font-medium" : "bg-surface-800 border-white/10 text-white/70 hover:bg-surface-700")}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id!); updateParams() }}
                      className={cn("px-4 py-4 rounded-xl border text-left transition-colors", selectedCategory === cat.id ? "bg-white text-black border-white font-medium" : "bg-surface-800 border-white/10 text-white/70 hover:bg-surface-700")}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-white/70 uppercase tracking-widest flex justify-between tracking">
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
            
            <button onClick={() => setMobileFilterOpen(false)} className="w-full mt-auto py-4 bg-white text-black font-medium rounded-xl">
               Show {filteredProperties.length} Properties
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Main Content (Listings + Map Split) */}
      <div className={cn("flex-1 p-6 md:p-8 bg-surface-950 flex gap-8", mobileViewMode === 'map' && "hidden md:flex")}>
        {/* Listings Column */}
        <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col h-[calc(100vh-140px)]">
           <div className="hidden md:flex justify-between items-center mb-6 shrink-0">
             <h1 className="text-3xl font-display font-medium leading-tight">Explore<br/><span className="text-white/50">{filteredProperties.length} Properties</span></h1>
             <button onClick={() => setMobileFilterOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-surface-800 border border-white/10 hover:bg-white/10 transition-colors rounded-full font-medium text-sm">
               <Filter className="w-4 h-4" /> Filters
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="w-full h-[360px] rounded-[2rem]" />
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="w-full h-64 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center">
                  <Search className="w-8 h-8 text-white/30" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">No properties found</h3>
                  <p className="text-white/50 max-w-md">Try adjusting your filters or search location to find what you're looking for.</p>
                </div>
                <button onClick={clearFilters} className="text-white underline underline-offset-4 mt-2">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 pb-20 md:pb-0">
                <AnimatePresence>
                  {filteredProperties.map((property, i) => (
                    <div key={property.id} onMouseEnter={() => setFocusedPropertyId(property.id || null)} onMouseLeave={() => setFocusedPropertyId(null)}>
                       <ListingCard property={property} index={i} />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )}
           </div>
        </div>

        {/* Map Column (Hidden on mobile unless in map view) */}
        <div className="hidden lg:block lg:w-1/2 xl:w-[55%] h-[calc(100vh-140px)] sticky top-[100px] shrink-0">
           <Suspense fallback={<div className="w-full h-full bg-surface-900 rounded-2xl animate-pulse" />}>
              <MapLibre properties={filteredProperties} focusedPropertyId={focusedPropertyId} />
           </Suspense>
        </div>
      </div>
      
      {/* Mobile Map View */}
      {mobileViewMode === 'map' && (
         <div className="md:hidden flex-1 relative h-[calc(100vh-140px)]">
            <Suspense fallback={<div className="w-full h-full bg-surface-900 animate-pulse" />}>
               <MapLibre properties={filteredProperties} focusedPropertyId={focusedPropertyId} />
            </Suspense>
         </div>
      )}

    </div>
  );
};
