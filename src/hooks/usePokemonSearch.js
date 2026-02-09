import { useState, useMemo, useRef, useEffect } from 'react';
import { SEARCH_DEBOUNCE_MS, SEARCH_RESULTS_LIMIT } from '../constants';

export function usePokemonSearch(pokemonList) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery || !pokemonList.length) return [];
    const lower = debouncedQuery.toLowerCase();
    return pokemonList
      .filter((p) => p.name.includes(lower))
      .slice(0, SEARCH_RESULTS_LIMIT);
  }, [debouncedQuery, pokemonList]);

  return { query, setQuery, results, isOpen, setIsOpen };
}
