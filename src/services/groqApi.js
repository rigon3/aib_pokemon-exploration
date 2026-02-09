import { GROQ_API_URL, GROQ_MODEL } from '../constants';
import { formatPokemonName } from '../utils/formatters';

const SYSTEM_PROMPT = `You are a Pokemon Battle Analyst AI. You have deep expertise in competitive Pokemon battling, type matchups, base stats, abilities, and move pools.

When analyzing a battle between two Pokemon, you MUST respond in the following JSON format (no markdown, no code fences, pure JSON):

{
  "winner": "pokemon_name",
  "confidence": "high|medium|low",
  "summary": "One paragraph summary of the battle outcome",
  "typeAnalysis": {
    "pokemon1Advantages": ["list of type advantages Pokemon 1 has"],
    "pokemon2Advantages": ["list of type advantages Pokemon 2 has"],
    "explanation": "Explanation of how type matchups affect this battle"
  },
  "statsComparison": {
    "pokemon1Strengths": ["stats where Pokemon 1 excels"],
    "pokemon2Strengths": ["stats where Pokemon 2 excels"],
    "explanation": "How the stat differences impact the battle"
  },
  "abilitiesAnalysis": {
    "pokemon1KeyAbilities": ["relevant abilities and their battle impact"],
    "pokemon2KeyAbilities": ["relevant abilities and their battle impact"],
    "explanation": "How abilities influence the outcome"
  },
  "movePoolAnalysis": {
    "pokemon1KeyMoves": ["strongest/most relevant moves"],
    "pokemon2KeyMoves": ["strongest/most relevant moves"],
    "explanation": "How move pools factor into the battle"
  },
  "battleNarrative": "A fun 2-3 sentence narrative of how the battle would play out"
}`;

function buildBattlePrompt(pokemon1, pokemon2) {
  const formatPokemon = (p, label) => {
    const stats = p.stats;
    const total = p.totalStats;
    const tm = p.typeMatchups;
    return `=== ${label}: ${formatPokemonName(p.name).toUpperCase()} ===
Types: ${p.types.join(' / ')}
Base Stats: HP ${stats.hp} | Attack ${stats.attack} | Defense ${stats.defense} | Sp.Atk ${stats['special-attack']} | Sp.Def ${stats['special-defense']} | Speed ${stats.speed}
Total Base Stats: ${total}
Abilities: ${p.abilities.map((a) => a.name + (a.isHidden ? ' (hidden)' : '')).join(', ')}
Notable Moves: ${p.moves.join(', ')}
Type Matchups:
  - Super effective against: ${tm.doubleDamageTo.join(', ') || 'none'}
  - Weak to: ${tm.doubleDamageFrom.join(', ') || 'none'}
  - Resists: ${tm.halfDamageFrom.join(', ') || 'none'}
  - Not very effective against: ${tm.halfDamageTo.join(', ') || 'none'}
  - Immune to: ${tm.noDamageFrom.join(', ') || 'none'}
  - No effect on: ${tm.noDamageTo.join(', ') || 'none'}`;
  };

  return `Analyze a Pokemon battle between these two Pokemon:

${formatPokemon(pokemon1, 'POKEMON 1')}

${formatPokemon(pokemon2, 'POKEMON 2')}

Determine who would win in a 1v1 battle. Consider type matchups, base stats, abilities, and available moves. Provide educational analysis about why certain types are strong/weak against others.`;
}

function parseBattleResponse(content) {
  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        // fall through
      }
    }
    return {
      winner: 'Unknown',
      confidence: 'low',
      summary: content,
      typeAnalysis: {
        pokemon1Advantages: [],
        pokemon2Advantages: [],
        explanation: content,
      },
      statsComparison: {
        pokemon1Strengths: [],
        pokemon2Strengths: [],
        explanation: '',
      },
      abilitiesAnalysis: {
        pokemon1KeyAbilities: [],
        pokemon2KeyAbilities: [],
        explanation: '',
      },
      movePoolAnalysis: {
        pokemon1KeyMoves: [],
        pokemon2KeyMoves: [],
        explanation: '',
      },
      battleNarrative: '',
    };
  }
}

export async function analyzeBattle(pokemon1, pokemon2, apiKey) {
  const prompt = buildBattlePrompt(pokemon1, pokemon2);

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your Groq API key.');
    }
    if (response.status === 429) {
      throw new Error(
        'Rate limit exceeded. Groq free tier has limited requests. Wait a moment and try again.'
      );
    }
    throw new Error(
      errorData.error?.message || `Groq API error: ${response.status}`
    );
  }

  const data = await response.json();
  return parseBattleResponse(data.choices[0].message.content);
}
