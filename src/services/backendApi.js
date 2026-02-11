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

export async function predictBattle(p1, p2) {
  const body = {};
  
  // Check if p1 is a number or string (name)
  if (typeof p1 === 'number' || !isNaN(p1)) {
    body.p1_id = parseInt(p1);
  } else {
    body.p1_name = p1;
  }
  
  // Check if p2 is a number or string (name)
  if (typeof p2 === 'number' || !isNaN(p2)) {
    body.p2_id = parseInt(p2);
  } else {
    body.p2_name = p2;
  }
  
  const response = await fetch(`${BACKEND_API_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Prediction failed');
  }
  return response.json();
}
