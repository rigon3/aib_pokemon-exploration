import TypeBadge from '../TypeBadge/TypeBadge';
import StatBar from '../StatBar/StatBar';
import { formatPokemonName, formatHeight, formatWeight } from '../../utils/formatters';
import styles from './PokemonCard.module.css';

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

export default function PokemonCard({ pokemon, variant = 'full' }) {
  const isCompact = variant === 'compact';

  if (!pokemon) {
    return (
      <div
        className={`${styles.card} ${styles.empty} ${isCompact ? styles.compact : ''}`}
      >
        <div className={styles.silhouette}>?</div>
        <p className={styles.emptyText}>Select a Pokemon</p>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${isCompact ? styles.compact : ''}`}>
      <img
        src={pokemon.sprites.artwork}
        alt={pokemon.name}
        className={styles.artwork}
      />
      <h3 className={styles.name}>
        {formatPokemonName(pokemon.name)}
        <span className={styles.id}>#{String(pokemon.id).padStart(3, '0')}</span>
      </h3>
      <div className={styles.types}>
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
      {!isCompact && (
        <>
          <div className={styles.stats}>
            {STAT_ORDER.map((stat) => (
              <StatBar key={stat} statName={stat} value={pokemon.stats[stat]} />
            ))}
          </div>
          <div className={styles.info}>
            <span>BST: {pokemon.totalStats}</span>
            <span>{formatHeight(pokemon.height)}</span>
            <span>{formatWeight(pokemon.weight)}</span>
          </div>
          <div className={styles.abilities}>
            {pokemon.abilities.map((a) => (
              <span key={a.name} className={styles.ability}>
                {a.name.replace('-', ' ')}
                {a.isHidden && <span className={styles.hidden}> (H)</span>}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
