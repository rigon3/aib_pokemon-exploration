import { useState, useEffect, useCallback } from 'react';
import ApiKeyInput from './components/ApiKeyInput/ApiKeyInput';
import BattleArena from './components/BattleArena/BattleArena';
import BattleResults from './components/BattleResults/BattleResults';
import { fetchPokemonList, fetchFullPokemonData } from './services/pokeApi';
import { useBattle } from './hooks/useBattle';
import styles from './App.module.css';

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [team1, setTeam1] = useState([null, null, null]);
  const [team2, setTeam2] = useState([null, null, null]);
  const [battleMode, setBattleMode] = useState(null);
  const [loadingPokemon, setLoadingPokemon] = useState(null);
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('groq_api_key') || ''
  );
  const [listError, setListError] = useState(null);

  const { status, result, error, startBattle, resetBattle } = useBattle();

  useEffect(() => {
    fetchPokemonList()
      .then(setPokemonList)
      .catch((err) => setListError(err.message));
  }, []);

  useEffect(() => {
    localStorage.setItem('groq_api_key', apiKey);
  }, [apiKey]);

  const handleSelect = useCallback(async (slot, pokemon) => {
    setLoadingPokemon(slot);
    try {
      const data = await fetchFullPokemonData(pokemon.name);
      if (slot === 1) setPokemon1(data);
      else setPokemon2(data);
    } catch (err) {
      console.error('Failed to fetch pokemon:', err);
    } finally {
      setLoadingPokemon(null);
    }
  }, []);

  const handleSelectTeam = useCallback(async (team, index, pokemon) => {
    const loadingKey = `t${team}-${index}`;
    setLoadingPokemon(loadingKey);
    try {
      const data = await fetchFullPokemonData(pokemon.name);
      if (team === 1) {
        setTeam1((prev) => prev.map((p, i) => (i === index ? data : p)));
      } else {
        setTeam2((prev) => prev.map((p, i) => (i === index ? data : p)));
      }
    } catch (err) {
      console.error('Failed to fetch pokemon:', err);
    } finally {
      setLoadingPokemon(null);
    }
  }, []);

  function handleBattle() {
    if (!battleMode || !apiKey) return;
    if (battleMode === '1v1' && pokemon1 && pokemon2) {
      startBattle({ mode: battleMode, pokemon1, pokemon2, apiKey });
    }
    if (battleMode === '3v3' && team1.every(Boolean) && team2.every(Boolean)) {
      startBattle({ mode: battleMode, pokemon1: team1, pokemon2: team2, apiKey });
    }
  }

  function handleNewBattle() {
    resetBattle();
    setPokemon1(null);
    setPokemon2(null);
    setTeam1([null, null, null]);
    setTeam2([null, null, null]);
    setLoadingPokemon(null);
  }

  function handleModeChange(mode) {
    setBattleMode(mode);
    resetBattle();
    setPokemon1(null);
    setPokemon2(null);
    setTeam1([null, null, null]);
    setTeam2([null, null, null]);
    setLoadingPokemon(null);
  }

  if (listError) {
    return (
      <div className={styles.app}>
        <div className={styles.errorScreen}>
          <h2>Failed to load Pokemon data</h2>
          <p>{listError}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!pokemonList.length) {
    return (
      <div className={styles.app}>
        <div className={styles.loadingScreen}>
          <div className={styles.pokeball} />
          <p>Loading Pokemon database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pokemon Battle AI</h1>
        <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
      </header>

      <main className={styles.main}>
        <BattleArena
          pokemonList={pokemonList}
          pokemon1={pokemon1}
          pokemon2={pokemon2}
          team1={team1}
          team2={team2}
          onSelect1={(p) => handleSelect(1, p)}
          onSelect2={(p) => handleSelect(2, p)}
          onSelectTeam={handleSelectTeam}
          onBattle={handleBattle}
          battleStatus={status}
          apiKey={apiKey}
          loadingPokemon={loadingPokemon}
          battleMode={battleMode}
          onModeChange={handleModeChange}
        />

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={resetBattle} className={styles.retryBtn}>
              Try Again
            </button>
          </div>
        )}

        {status === 'done' && result && (
          <>
            <BattleResults
              result={result}
              pokemon1={pokemon1}
              pokemon2={pokemon2}
              team1={team1}
              team2={team2}
              battleMode={battleMode}
            />
            <button onClick={handleNewBattle} className={styles.newBattleBtn}>
              New Battle
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
