import { useState } from 'react';
import styles from './ApiKeyInput.module.css';

export default function ApiKeyInput({ apiKey, setApiKey }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputGroup}>
        <input
          type={visible ? 'text' : 'password'}
          className={styles.input}
          placeholder="Enter Groq API key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <button
          className={styles.toggleBtn}
          onClick={() => setVisible((v) => !v)}
          type="button"
          aria-label={visible ? 'Hide API key' : 'Show API key'}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
        <span className={styles.indicator}>
          {apiKey ? '\u2713' : '\u2717'}
        </span>
      </div>
      <a
        href="https://console.groq.com"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        Get free API key
      </a>
    </div>
  );
}
