import { formatPokemonName } from '../../utils/formatters';
import styles from './BattleResults.module.css';

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function AdvantageList({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={styles.advantageList}>
      <span className={styles.advantageLabel}>{label}:</span>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function BattleResults({
  result,
  pokemon1,
  pokemon2,
  team1,
  team2,
  battleMode,
}) {
  if (!result) return null;

  const isTeamBattle = battleMode === '3v3';
  const normalizedWinner = result.winner.toLowerCase();
  const isTeam1Winner = isTeamBattle
    ? normalizedWinner.includes('team 1') || normalizedWinner === 'team1'
    : pokemon1?.name.toLowerCase() === normalizedWinner;
  const isTeam2Winner = isTeamBattle
    ? normalizedWinner.includes('team 2') || normalizedWinner === 'team2'
    : pokemon2?.name.toLowerCase() === normalizedWinner;

  const winnerName = isTeamBattle
    ? isTeam1Winner
      ? 'Team 1'
      : isTeam2Winner
        ? 'Team 2'
        : formatPokemonName(result.winner)
    : formatPokemonName(result.winner);

  const winnerPokemon =
    !isTeamBattle && pokemon1?.name.toLowerCase() === normalizedWinner
      ? pokemon1
      : !isTeamBattle && pokemon2?.name.toLowerCase() === normalizedWinner
        ? pokemon2
        : null;
  const winnerTeam = isTeamBattle
    ? isTeam1Winner
      ? team1
      : isTeam2Winner
        ? team2
        : []
    : [];

  const side1Label = isTeamBattle
    ? 'Team 1'
    : formatPokemonName(pokemon1?.name || '');
  const side2Label = isTeamBattle
    ? 'Team 2'
    : formatPokemonName(pokemon2?.name || '');

  return (
    <div className={styles.results}>
      <div className={styles.winnerBanner}>
        {!isTeamBattle && winnerPokemon && (
          <img
            src={winnerPokemon.sprites.animated || winnerPokemon.sprites.artwork}
            alt={winnerName}
            className={styles.winnerSprite}
          />
        )}
        {isTeamBattle && winnerTeam.length > 0 && (
          <div className={styles.winnerTeam}>
            {winnerTeam.map((pokemon) => (
              <img
                key={pokemon.id}
                src={pokemon.sprites.animated || pokemon.sprites.artwork}
                alt={pokemon.name}
                className={styles.winnerTeamSprite}
              />
            ))}
          </div>
        )}
        <div className={styles.winnerInfo}>
          <span className={styles.winnerLabel}>WINNER</span>
          <h2 className={styles.winnerName}>{winnerName}</h2>
          <span
            className={`${styles.confidence} ${styles[`confidence_${result.confidence}`]}`}
          >
            {result.confidence} confidence
          </span>
        </div>
      </div>

      <Section title="Summary">
        <p className={styles.text}>{result.summary}</p>
      </Section>

      {result.typeAnalysis && (
        <Section title="Type Analysis">
          <div className={styles.columns}>
            <AdvantageList
              label={side1Label}
              items={result.typeAnalysis.pokemon1Advantages}
            />
            <AdvantageList
              label={side2Label}
              items={result.typeAnalysis.pokemon2Advantages}
            />
          </div>
          <p className={styles.text}>{result.typeAnalysis.explanation}</p>
        </Section>
      )}

      {result.statsComparison && (
        <Section title="Stats Comparison">
          <div className={styles.columns}>
            <AdvantageList
              label={side1Label}
              items={result.statsComparison.pokemon1Strengths}
            />
            <AdvantageList
              label={side2Label}
              items={result.statsComparison.pokemon2Strengths}
            />
          </div>
          <p className={styles.text}>{result.statsComparison.explanation}</p>
        </Section>
      )}

      {result.abilitiesAnalysis && (
        <Section title="Abilities Analysis">
          <div className={styles.columns}>
            <AdvantageList
              label={side1Label}
              items={result.abilitiesAnalysis.pokemon1KeyAbilities}
            />
            <AdvantageList
              label={side2Label}
              items={result.abilitiesAnalysis.pokemon2KeyAbilities}
            />
          </div>
          <p className={styles.text}>{result.abilitiesAnalysis.explanation}</p>
        </Section>
      )}

      {result.movePoolAnalysis && (
        <Section title="Move Pool Analysis">
          <div className={styles.columns}>
            <AdvantageList
              label={side1Label}
              items={result.movePoolAnalysis.pokemon1KeyMoves}
            />
            <AdvantageList
              label={side2Label}
              items={result.movePoolAnalysis.pokemon2KeyMoves}
            />
          </div>
          <p className={styles.text}>{result.movePoolAnalysis.explanation}</p>
        </Section>
      )}

      {result.battleNarrative && (
        <Section title="Battle Narrative">
          <blockquote className={styles.narrative}>
            {result.battleNarrative}
          </blockquote>
        </Section>
      )}
    </div>
  );
}
