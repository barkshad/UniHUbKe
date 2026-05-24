import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, History, X, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { University } from '../types';

export const HeroSearch = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [suggestions, setSuggestions] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('unihub_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUniversities = async () => {
    if (universities.length > 0) return;
    try {
      const snap = await getDocs(collection(db, 'universities'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as University));
      setUniversities(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isFocused && universities.length === 0) {
      fetchUniversities();
    }
  }, [isFocused]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    
    const searchTerm = query.toLowerCase();
    const results = universities.filter(u => {
      if (u.name.toLowerCase().includes(searchTerm)) return true;
      if (u.town?.toLowerCase().includes(searchTerm)) return true;
      if (u.nearbyAreas?.some(a => a.toLowerCase().includes(searchTerm))) return true;
      if (u.popularKeywords?.some(k => k.toLowerCase().includes(searchTerm))) return true;
      return false;
    });
    
    setSuggestions(results.slice(0, 5));
    setIsLoading(false);
  }, [query, universities]);

  const saveRecentSearch = (term: string) => {
    if(!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('unihub_recent_searches', JSON.stringify(updated));
  };

  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    localStorage.setItem('unihub_recent_searches', JSON.stringify(updated));
  };

  const handleSearch = (term: string) => {
    saveRecentSearch(term);
    setIsFocused(false);
    navigate(`/listings?search=${encodeURIComponent(term)}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query.trim());
    }
  };

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? <span key={i} className="text-white font-medium">{part}</span> : <span key={i} className="text-white/60">{part}</span>
        )}
      </span>
    );
  };

  return (
    <div ref={searchRef} className="w-full relative z-50">
      <form onSubmit={onSubmit} className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
        </div>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for your campus, town, or estate..."
          className="w-full bg-surface-800/80 backdrop-blur-xl border border-white/20 text-white rounded-full py-5 pl-14 pr-32 focus:outline-none focus:border-white/50 focus:bg-surface-800 shadow-[0_0_30px_rgba(255,255,255,0.05)] focus:shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all text-lg"
        />
        <div className="absolute inset-y-2 right-2 flex items-center">
          <button 
            type="submit"
            className="px-6 py-3 bg-white text-black rounded-full font-medium hover:scale-105 transition-transform flex items-center gap-2"
          >
            Search
          </button>
        </div>
      </form>
      <div className="text-left text-xs text-white/30 mt-3 px-4">Try "Kabarak University", "Nakuru", or "London Estate"</div>

      <AnimatePresence>
        {isFocused && (query.trim() || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 w-full bg-surface-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden mt-2 z-50"
          >
            {query.trim() ? (
              <div className="p-4">
                <div className="px-4 pb-2 text-xs font-medium text-white/40 uppercase tracking-wider">Suggestions</div>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8 text-white/40">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul className="space-y-1 mt-2">
                    {suggestions.map((u) => (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => handleSearch(u.name)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-left group/item"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-white/70" />
                            </div>
                            <div>
                              <div className="text-base">{highlightMatch(u.name, query)}</div>
                              {u.town && <div className="text-sm text-white/40 mt-0.5">{u.town}</div>}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover/item:text-white/60 transition-colors opacity-0 group-hover/item:opacity-100" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-white/50">
                    No matching universities or areas found. Try a different search term.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <div className="px-4 pb-2 text-xs font-medium text-white/40 uppercase tracking-wider">Recent Searches</div>
                <ul className="space-y-1 mt-2">
                  {recentSearches.map((term, idx) => (
                    <li key={idx} className="relative group/recent">
                      <button
                        type="button"
                        onClick={() => handleSearch(term)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 text-white/70">
                          <History className="w-4 h-4" />
                          <span className="text-base">{term}</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(e, term)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white opacity-0 group-hover/recent:opacity-100 transition-all"
                        aria-label="Remove recent search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
