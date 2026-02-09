import { POKEAPI_BASE, POKEMON_LIST_LIMIT } from '../constants';

const cache = new Map();

async function cachedFetch(url) {
  if (cache.has(url)) return cache.get(url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`PokeAPI error: ${response.status}`);
  const data = await response.json();
  cache.set(url, data);
  return data;
}

export async function fetchPokemonList() {
  const data = await cachedFetch(
    `${POKEAPI_BASE}/pokemon?limit=${POKEMON_LIST_LIMIT}&offset=0`
  );
  return data.results.map((p) => {
    const id = p.url.split('/').filter(Boolean).pop();
    return { name: p.name, id: Number(id) };
  });
}

export async function fetchPokemonDetails(nameOrId) {
  const data = await cachedFetch(`${POKEAPI_BASE}/pokemon/${nameOrId}`);

  const stats = {};
  let totalStats = 0;
  for (const s of data.stats) {
    stats[s.stat.name] = s.base_stat;
    totalStats += s.base_stat;
  }

  const types = data.types.map((t) => t.type.name);

  const abilities = data.abilities.map((a) => ({
    name: a.ability.name,
    isHidden: a.is_hidden,
  }));

  // Get level-up moves, take top 20
  const moves = data.moves
    .filter((m) =>
      m.version_group_details.some(
        (v) => v.move_learn_method.name === 'level-up'
      )
    )
    .map((m) => m.move.name)
    .slice(0, 20);

  const sprites = {
    artwork:
      data.sprites.other?.['official-artwork']?.front_default ||
      data.sprites.front_default,
    animated:
      data.sprites.other?.showdown?.front_default || data.sprites.front_default,
    default: data.sprites.front_default,
  };

  return {
    id: data.id,
    name: data.name,
    stats,
    totalStats,
    types,
    abilities,
    moves,
    sprites,
    height: data.height,
    weight: data.weight,
  };
}

export async function fetchTypeMatchups(typeName) {
  const data = await cachedFetch(`${POKEAPI_BASE}/type/${typeName}`);
  const dr = data.damage_relations;
  return {
    doubleDamageFrom: dr.double_damage_from.map((t) => t.name),
    doubleDamageTo: dr.double_damage_to.map((t) => t.name),
    halfDamageFrom: dr.half_damage_from.map((t) => t.name),
    halfDamageTo: dr.half_damage_to.map((t) => t.name),
    noDamageFrom: dr.no_damage_from.map((t) => t.name),
    noDamageTo: dr.no_damage_to.map((t) => t.name),
  };
}

export async function fetchFullPokemonData(nameOrId) {
  const details = await fetchPokemonDetails(nameOrId);
  const typeMatchups = await Promise.all(
    details.types.map((t) => fetchTypeMatchups(t))
  );

  // Merge type matchups from all types
  const merged = {
    doubleDamageFrom: [],
    doubleDamageTo: [],
    halfDamageFrom: [],
    halfDamageTo: [],
    noDamageFrom: [],
    noDamageTo: [],
  };

  for (const tm of typeMatchups) {
    for (const key of Object.keys(merged)) {
      for (const t of tm[key]) {
        if (!merged[key].includes(t)) merged[key].push(t);
      }
    }
  }

  return { ...details, typeMatchups: merged };
}
