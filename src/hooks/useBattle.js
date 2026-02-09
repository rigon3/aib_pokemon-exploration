import { useState, useCallback } from 'react';
import { analyzeBattle } from '../services/groqApi';

export function useBattle() {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const startBattle = useCallback(async (pokemon1, pokemon2, apiKey) => {
    setStatus('loading');
    setResult(null);
    setError(null);
    try {
      const analysis = await analyzeBattle(pokemon1, pokemon2, apiKey);
      setResult(analysis);
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  const resetBattle = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, startBattle, resetBattle };
}
