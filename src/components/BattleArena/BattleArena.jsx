import PokemonSearch from '../PokemonSearch/PokemonSearch';
import PokemonCard from '../PokemonCard/PokemonCard';
import styles from './BattleArena.module.css';

export default function BattleArena({
  pokemonList,
  pokemon1,
  pokemon2,
  team1,
  team2,
  onSelect1,
  onSelect2,
  onSelectTeam,
  onBattle,
  battleStatus,
  apiKey,
  loadingPokemon,
  battleMode,
  onModeChange,
}) {
  const canBattle =
    battleMode === '1v1'
      ? pokemon1 && pokemon2 && apiKey && battleStatus !== 'loading'
      : battleMode === '3v3'
        ? team1.every(Boolean) && team2.every(Boolean) && apiKey && battleStatus !== 'loading'
        : false;

  const showArena = battleMode === '1v1' || battleMode === '3v3';

  return (
    <div className={styles.arena}>
      <div className={styles.modePicker}>
        <span className={styles.modeLabel}>Choose battle type</span>
        <div className={styles.modeButtons}>
          <button
            type="button"
            className={`${styles.modeBtn} ${battleMode === '1v1' ? styles.modeBtnActive : ''}`}
            onClick={() => onModeChange('1v1')}
          >
            1v1 Duel
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${battleMode === '3v3' ? styles.modeBtnActive : ''}`}
            onClick={() => onModeChange('3v3')}
          >
            3v3 Team Battle
          </button>
        </div>
      </div>

      {showArena && (
        <div className={styles.sides}>
          {battleMode === '1v1' ? (
            <>
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
            </>
          ) : (
            <>
              <div className={styles.side}>
                <h3 className={styles.teamTitle}>Team 1</h3>
                <div className={styles.teamSlots}>
                  {team1.map((pokemon, index) => {
                    const loadingKey = `t1-${index}`;
                    return (
                      <div key={loadingKey} className={styles.teamSlot}>
                        <PokemonSearch
                          pokemonList={pokemonList}
                          onSelect={(p) => onSelectTeam(1, index, p)}
                          label={`Team 1 - Slot ${index + 1}`}
                          disabled={loadingPokemon === loadingKey}
                        />
                        {loadingPokemon === loadingKey ? (
                          <div className={styles.loadingSmall}>Loading...</div>
                        ) : (
                          <PokemonCard pokemon={pokemon} variant="compact" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.vs}>VS</div>

              <div className={styles.side}>
                <h3 className={styles.teamTitle}>Team 2</h3>
                <div className={styles.teamSlots}>
                  {team2.map((pokemon, index) => {
                    const loadingKey = `t2-${index}`;
                    return (
                      <div key={loadingKey} className={styles.teamSlot}>
                        <PokemonSearch
                          pokemonList={pokemonList}
                          onSelect={(p) => onSelectTeam(2, index, p)}
                          label={`Team 2 - Slot ${index + 1}`}
                          disabled={loadingPokemon === loadingKey}
                        />
                        {loadingPokemon === loadingKey ? (
                          <div className={styles.loadingSmall}>Loading...</div>
                        ) : (
                          <PokemonCard pokemon={pokemon} variant="compact" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

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
