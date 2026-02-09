import { useRef, useEffect } from 'react';
import { usePokemonSearch } from '../../hooks/usePokemonSearch';
import { formatPokemonName } from '../../utils/formatters';
import styles from './PokemonSearch.module.css';

export default function PokemonSearch({
  pokemonList,
  onSelect,
  label,
  disabled,
}) {
  const { query, setQuery, results, isOpen, setIsOpen } =
    usePokemonSearch(pokemonList);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  function handleSelect(pokemon) {
    setQuery('');
    setIsOpen(false);
    onSelect(pokemon);
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <input
        type="text"
        className={styles.input}
        placeholder={label || 'Search Pokemon...'}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => query && setIsOpen(true)}
        disabled={disabled}
      />
      {isOpen && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map((p) => (
            <li
              key={p.name}
              className={styles.item}
              onClick={() => handleSelect(p)}
            >
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                alt={p.name}
                className={styles.sprite}
                loading="lazy"
              />
              <span className={styles.name}>
                {formatPokemonName(p.name)}
              </span>
              <span className={styles.id}>#{String(p.id).padStart(3, '0')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
