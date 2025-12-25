import { useState, useEffect, useCallback } from 'react';
import { UserProfile, DatabaseService } from '@/lib/firebase-services';

export interface UserSearchResult extends UserProfile {
  // Additional computed fields for search results
  displayName: string;
  avatar: string;
  level: string;
  streak: number;
}

export interface UserSearchState {
  results: UserSearchResult[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
}

export interface UseUserSearchReturn extends UserSearchState {
  searchUsers: (query: string) => void;
  clearSearch: () => void;
}

/**
 * Custom hook for searching users by username
 * Includes debounced search, state management, and error handling
 */
export function useUserSearch(debounceDelay: number = 300): UseUserSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceDelay]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery.trim());
    } else {
      // Clear results if query is empty
      setResults([]);
      setHasSearched(false);
      setError(null);
    }
  }, [debouncedQuery]);

  const performSearch = useCallback(async (query: string) => {
    if (!query) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the Firebase search method
      const searchResults = await DatabaseService.searchUsersByUsername(query);

      // Transform results to include computed fields
      const transformedResults: UserSearchResult[] = searchResults.map(user => ({
        ...user,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        avatar: user.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        level: `Level ${Math.floor((user.totalPoints || 0) / 100) + 1}`,
        streak: Math.floor((user.totalPoints || 0) / 50),
      }));

      setResults(transformedResults);
      setHasSearched(true);
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to search users');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    setLoading(false);
  }, []);

  return {
    results,
    loading,
    error,
    hasSearched,
    searchUsers,
    clearSearch,
  };
}