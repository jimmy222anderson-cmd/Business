import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, Star, Clock, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  name: string;
  lat: number;
  lng: number;
  bbox?: [number, number, number, number];
  provider?: string;
}

interface FavoriteLocation {
  _id: string;
  name: string;
  place_name: string;
  lat: number;
  lng: number;
  bbox?: [number, number, number, number];
  provider?: string;
}

interface SearchBarProps {
  onLocationSelect?: (location: SearchResult) => void;
  className?: string;
  placeholder?: string;
}

const RECENT_SEARCHES_KEY = 'satellite_explorer_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export const SearchBar = ({
  onLocationSelect,
  className,
  placeholder = 'Search for a location...',
}: SearchBarProps) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Load favorite locations if user is authenticated
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${apiBaseUrl.replace(/\/api$/, '')}/api/user/favorite-locations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Save to recent searches
  const saveToRecentSearches = (location: SearchResult) => {
    try {
      const updated = [
        location,
        ...recentSearches.filter(s => 
          !(s.lat === location.lat && s.lng === location.lng)
        )
      ].slice(0, MAX_RECENT_SEARCHES);
      
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if query is empty or too short
    if (!query || query.trim().length < 2) {
      setResults([]);
      if (query.trim().length === 0) {
        setIsOpen(false);
      }
      return;
    }

    // Set loading state
    setIsLoading(true);

    // Debounce search by 300ms
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiBaseUrl.replace(/\/api$/, '')}/api/public/autocomplete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: query.trim() }),
        });

        if (!response.ok) {
          throw new Error('Autocomplete failed');
        }

        const data = await response.json();
        setResults(data.suggestions || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSelectResult = (result: SearchResult) => {
    // Save to recent searches
    saveToRecentSearches(result);
    
    // Clear search on selection as per task requirements
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (onLocationSelect) {
      onLocationSelect(result);
    }
  };

  const handleSelectFavorite = async (favorite: FavoriteLocation) => {
    // Update last_used_at
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      await fetch(`${apiBaseUrl.replace(/\/api$/, '')}/api/user/favorite-locations/${favorite._id}/use`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error updating favorite usage:', error);
    }

    const location: SearchResult = {
      name: favorite.place_name,
      lat: favorite.lat,
      lng: favorite.lng,
      bbox: favorite.bbox,
      provider: favorite.provider
    };

    handleSelectResult(location);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = results.length + (query.length === 0 ? recentSearches.length + favorites.length : 0);
    
    if (!isOpen || totalItems === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectResult(results[selectedIndex]);
        } else if (query.length === 0) {
          const favIndex = selectedIndex - 0;
          const recentIndex = selectedIndex - favorites.length;
          if (favIndex >= 0 && favIndex < favorites.length) {
            handleSelectFavorite(favorites[favIndex]);
          } else if (recentIndex >= 0 && recentIndex < recentSearches.length) {
            handleSelectResult(recentSearches[recentIndex]);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (query.length === 0 && (recentSearches.length > 0 || favorites.length > 0)) {
      setIsOpen(true);
    } else if (results.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-9 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-yellow-500 focus:ring-yellow-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
        )}
        {!isLoading && query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-slate-700 text-slate-400"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {/* Dropdown for results, recent searches, and favorites */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-80 overflow-y-auto z-50">
          {/* Search results */}
          {results.length > 0 && (
            <div>
              <ul className="py-1">
                {results.map((result, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSelectResult(result)}
                      className={cn(
                        'w-full text-left px-4 py-2.5 hover:bg-slate-700 transition-colors text-white',
                        selectedIndex === index && 'bg-slate-700'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.name}</p>
                          <p className="text-xs text-slate-400">
                            {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Favorites and recent searches (shown when no query) */}
          {query.length === 0 && (favorites.length > 0 || recentSearches.length > 0) && (
            <div>
              {/* Favorites */}
              {favorites.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-t border-slate-700">
                    Favorites
                  </div>
                  <ul className="py-1">
                    {favorites.map((favorite, index) => (
                      <li key={favorite._id}>
                        <button
                          onClick={() => handleSelectFavorite(favorite)}
                          className={cn(
                            'w-full text-left px-4 py-2.5 hover:bg-slate-700 transition-colors text-white',
                            selectedIndex === index && 'bg-slate-700'
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0 fill-yellow-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{favorite.name}</p>
                              <p className="text-xs text-slate-400 truncate">{favorite.place_name}</p>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-t border-slate-700">
                    Recent Searches
                  </div>
                  <ul className="py-1">
                    {recentSearches.map((recent, index) => {
                      const adjustedIndex = favorites.length + index;
                      return (
                        <li key={index}>
                          <button
                            onClick={() => handleSelectResult(recent)}
                            className={cn(
                              'w-full text-left px-4 py-2.5 hover:bg-slate-700 transition-colors text-white',
                              selectedIndex === adjustedIndex && 'bg-slate-700'
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{recent.name}</p>
                                <p className="text-xs text-slate-400">
                                  {recent.lat.toFixed(4)}, {recent.lng.toFixed(4)}
                                </p>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* No results message */}
          {query.length > 0 && !isLoading && results.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-300">No locations found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try a different search term
              </p>
            </div>
          )}

          {/* Empty state when no favorites or recent searches */}
          {query.length === 0 && favorites.length === 0 && recentSearches.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-slate-300">No recent searches</p>
              <p className="text-xs text-slate-400 mt-1">
                Start searching to see your history
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
