import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Filter, X } from 'lucide-react';
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
      {/* Mobile Filter Button */}
      <div className="md:hidden sticky top-[72px] z-30 bg-surface-900 border-b border-white/5 py-4 px-6 flex items-center justify-between">
        <span className="font-medium">{filteredProperties.length} Properties Found</span>
        <button 
          onClick={() => setMobileFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full font-medium"
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {(mobileFilterOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-80 bg-surface-900 border-r border-white/10 p-6 flex flex-col gap-8 h-screen md:sticky md:top-[72px] md:h-[calc(100vh-72px)] overflow-y-auto",
              !mobileFilterOpen && "hidden md:flex"
            )}
          >
            <div className="flex items-center justify-between md:hidden">
              <h2 className="text-xl font-display font-medium">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-white/70 uppercase tracking-widest">Location</label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input 
                  type="text" 
                  placeholder="e.g. Gate C, Juja"
                  className="input-playful w-full bg-surface-800 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white"
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
                  className={cn("px-4 py-3 rounded-xl border text-left transition-colors", !selectedCategory ? "bg-white text-black border-white" : "bg-surface-800 border-white/10 text-white/70 hover:bg-surface-700")}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id!); updateParams() }}
                    className={cn("px-4 py-3 rounded-xl border text-left transition-colors", selectedCategory === cat.id ? "bg-white text-black border-white" : "bg-surface-800 border-white/10 text-white/70 hover:bg-surface-700")}
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
                className="w-full accent-white"
              />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 bg-surface-950">
        <div className="hidden md:flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-medium">{filteredProperties.length} Properties Found</h1>
          <button onClick={clearFilters} className="text-white/50 hover:text-white transition-colors text-sm underline underline-offset-4">
            Clear all filters
          </button>
        </div>

        {loading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
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
