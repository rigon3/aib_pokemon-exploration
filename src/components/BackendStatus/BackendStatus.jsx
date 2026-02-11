import { useState, useEffect } from 'react';
import { checkBackendHealth, getPokemonFromBackend, predictBattle } from '../../services/backendApi';
import styles from './BackendStatus.module.css';

export default function BackendStatus() {
  const [isHealthy, setIsHealthy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);
  const [testPokemonId, setTestPokemonId] = useState('1');
  const [predictP1Id, setPredictP1Id] = useState('1');
  const [predictP1Name, setPredictP1Name] = useState('');
  const [predictP2Id, setPredictP2Id] = useState('2');
  const [predictP2Name, setPredictP2Name] = useState('');
  const [predictResult, setPredictResult] = useState(null);
  const [predictError, setPredictError] = useState(null);

  // Check backend health on mount and periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await checkBackendHealth();
        setIsHealthy(true);
      } catch (err) {
        setIsHealthy(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleTestPokemon = async () => {
    setLoading(true);
    setTestError(null);
    setTestResult(null);

    try {
      const id = parseInt(testPokemonId) || testPokemonId;
      const data = await getPokemonFromBackend(id);
      setTestResult(data);
    } catch (err) {
      setTestError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPredict = async () => {
    setLoading(true);
    setPredictError(null);
    setPredictResult(null);

    try {
      const data = await predictBattle(
        predictP1Name || parseInt(predictP1Id),
        predictP2Name || parseInt(predictP2Id)
      );
      setPredictResult(data);
    } catch (err) {
      setPredictError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backendStatus}>
      <h2>Backend Status</h2>
      
      {/* Health Status */}
      <div className={styles.healthSection}>
        <div className={styles.statusIndicator}>
          <span className={`${styles.statusDot} ${isHealthy ? styles.healthy : styles.unhealthy}`}></span>
          <span className={styles.statusText}>
            {isHealthy === null 
              ? 'Checking...' 
              : isHealthy 
              ? 'Connected' 
              : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Pokemon Endpoint Tester */}
      {isHealthy && (
        <div className={styles.testSection}>
          <h3>Test Pokemon Endpoint</h3>
          <p className={styles.description}>/pokemon/{'{pokemon_id}'} - Fetch Pokemon data by ID</p>
          
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={testPokemonId}
              onChange={(e) => setTestPokemonId(e.target.value)}
              placeholder="Enter Pokemon ID or name"
              className={styles.input}
              disabled={loading}
            />
            <button 
              onClick={handleTestPokemon} 
              disabled={loading}
              className={styles.button}
            >
              {loading ? 'Testing...' : 'Test'}
            </button>
          </div>

          {testError && (
            <div className={styles.error}>
              <strong>Error:</strong> {testError}
            </div>
          )}

          {testResult && (
            <div className={styles.result}>
              <h4>Result:</h4>
              <div className={styles.resultContent}>
                <p><strong>Name:</strong> {testResult.Name || testResult['Name#']}</p>
                <p><strong>Type 1:</strong> {testResult['Type 1']}</p>
                {testResult['Type 2'] && <p><strong>Type 2:</strong> {testResult['Type 2']}</p>}
                <p><strong>Total:</strong> {testResult.Total}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Predict Endpoint Tester */}
      {isHealthy && (
        <div className={styles.testSection}>
          <h3>Test Predict Endpoint</h3>
          <p className={styles.description}>/predict - Predict battle outcome</p>
          
          <div className={styles.inputGroup}>
            <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
              <div style={{flex: 1, minWidth: '150px'}}>
                <p style={{margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666'}}>Pokemon 1:</p>
                <input
                  type="text"
                  value={predictP1Name}
                  onChange={(e) => setPredictP1Name(e.target.value)}
                  placeholder="Name (e.g., Charizard)"
                  className={styles.input}
                  disabled={loading}
                  style={{marginBottom: '0.5rem'}}
                />
                <input
                  type="text"
                  value={predictP1Id}
                  onChange={(e) => setPredictP1Id(e.target.value)}
                  placeholder="or ID (e.g., 6)"
                  className={styles.input}
                  disabled={loading}
                />
              </div>
              <div style={{flex: 1, minWidth: '150px'}}>
                <p style={{margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666'}}>Pokemon 2:</p>
                <input
                  type="text"
                  value={predictP2Name}
                  onChange={(e) => setPredictP2Name(e.target.value)}
                  placeholder="Name (e.g., Blastoise)"
                  className={styles.input}
                  disabled={loading}
                  style={{marginBottom: '0.5rem'}}
                />
                <input
                  type="text"
                  value={predictP2Id}
                  onChange={(e) => setPredictP2Id(e.target.value)}
                  placeholder="or ID (e.g., 9)"
                  className={styles.input}
                  disabled={loading}
                />
              </div>
            </div>
            <button 
              onClick={handleTestPredict} 
              disabled={loading}
              className={styles.button}
              style={{marginTop: '1rem'}}
            >
              {loading ? 'Testing...' : 'Predict'}
            </button>
          </div>

          {predictError && (
            <div className={styles.error}>
              <strong>Status:</strong> {predictError}
            </div>
          )}

          {predictResult && (
            <div className={styles.result}>
              <h4>Result:</h4>
              <pre>{JSON.stringify(predictResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {!isHealthy && (
        <div className={styles.offlineMessage}>
          <p>Backend is offline. Make sure the FastAPI server is running on localhost:8000</p>
          <p className={styles.hint}>Try running: <code>python backend/main.py</code> or <code>uvicorn backend.main:app --reload</code></p>
        </div>
      )}
    </div>
  );
}
