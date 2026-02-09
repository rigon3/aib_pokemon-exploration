import PokemonSearch from '../PokemonSearch/PokemonSearch';
import PokemonCard from '../PokemonCard/PokemonCard';
import styles from './BattleArena.module.css';

export default function BattleArena({
  pokemonList,
  pokemon1,
  pokemon2,
  onSelect1,
  onSelect2,
  onBattle,
  battleStatus,
  apiKey,
  loadingPokemon,
}) {
  const canBattle =
    pokemon1 && pokemon2 && apiKey && battleStatus !== 'loading';

  return (
    <div className={styles.arena}>
      <div className={styles.sides}>
        <div className={styles.side}>
          <PokemonSearch
            pokemonList={pokemonList}
            onSelect={onSelect1}
            label="Search Pokemon 1..."
            disabled={loadingPokemon === 1}
          />
          {loadingPokemon === 1 ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <PokemonCard pokemon={pokemon1} />
          )}
        </div>

        <div className={styles.vs}>VS</div>

        <div className={styles.side}>
          <PokemonSearch
            pokemonList={pokemonList}
            onSelect={onSelect2}
            label="Search Pokemon 2..."
            disabled={loadingPokemon === 2}
          />
          {loadingPokemon === 2 ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <PokemonCard pokemon={pokemon2} />
          )}
        </div>
      </div>

      <button
        className={`${styles.battleBtn} ${battleStatus === 'loading' ? styles.battleBtnLoading : ''}`}
        onClick={onBattle}
        disabled={!canBattle}
      >
        {battleStatus === 'loading' ? (
          <span className={styles.spinner}>Analyzing...</span>
        ) : (
          'BATTLE!'
        )}
      </button>

      {!apiKey && (
        <p className={styles.hint}>Enter your Groq API key above to battle</p>
      )}
    </div>
  );
}
