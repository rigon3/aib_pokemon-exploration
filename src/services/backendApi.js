import { BACKEND_API_URL } from '../constants';

export async function checkBackendHealth() {
  const response = await fetch(`${BACKEND_API_URL}/health`);
  if (!response.ok) {
    throw new Error('Backend health check failed');
  }
  return response.json();
}

export async function getPokemonFromBackend(pokemonId) {
  const response = await fetch(`${BACKEND_API_URL}/pokemon/${pokemonId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Pokemon ${pokemonId}`);
  }
  return response.json();
}

export async function predictBattle(p1Id, p2Id) {
  const response = await fetch(`${BACKEND_API_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      p1_id: p1Id,
      p2_id: p2Id,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Prediction failed');
  }
  return response.json();
}
