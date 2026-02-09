const STAT_NAME_MAP = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SPA',
  'special-defense': 'SPD',
  speed: 'SPE',
};

export function formatStatName(stat) {
  return STAT_NAME_MAP[stat] || stat.toUpperCase();
}

export function formatPokemonName(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatHeight(decimeters) {
  return `${(decimeters / 10).toFixed(1)} m`;
}

export function formatWeight(hectograms) {
  return `${(hectograms / 10).toFixed(1)} kg`;
}
