import TypeBadge from '../TypeBadge/TypeBadge';
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

export default function BattleResults({ result, pokemon1, pokemon2 }) {
  if (!result) return null;

  const winnerName = formatPokemonName(result.winner);
  const winnerPokemon =
    pokemon1.name.toLowerCase() === result.winner.toLowerCase()
      ? pokemon1
      : pokemon2.name.toLowerCase() === result.winner.toLowerCase()
        ? pokemon2
        : null;

  return (
    <div className={styles.results}>
      <div className={styles.winnerBanner}>
        {winnerPokemon && (
          <img
            src={winnerPokemon.sprites.animated || winnerPokemon.sprites.artwork}
            alt={winnerName}
            className={styles.winnerSprite}
          />
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
              label={formatPokemonName(pokemon1.name)}
              items={result.typeAnalysis.pokemon1Advantages}
            />
            <AdvantageList
              label={formatPokemonName(pokemon2.name)}
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
              label={formatPokemonName(pokemon1.name)}
              items={result.statsComparison.pokemon1Strengths}
            />
            <AdvantageList
              label={formatPokemonName(pokemon2.name)}
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
              label={formatPokemonName(pokemon1.name)}
              items={result.abilitiesAnalysis.pokemon1KeyAbilities}
            />
            <AdvantageList
              label={formatPokemonName(pokemon2.name)}
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
              label={formatPokemonName(pokemon1.name)}
              items={result.movePoolAnalysis.pokemon1KeyMoves}
            />
            <AdvantageList
              label={formatPokemonName(pokemon2.name)}
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
