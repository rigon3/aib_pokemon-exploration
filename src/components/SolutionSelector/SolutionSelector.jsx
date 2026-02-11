import styles from './SolutionSelector.module.css';

export default function SolutionSelector({ selectedSolution, onSelect }) {
  return (
    <div className={styles.selector}>
      <h3>Battle Solution</h3>
      <div className={styles.options}>
        <button
          className={`${styles.option} ${selectedSolution === 'genai' ? styles.active : ''}`}
          onClick={() => onSelect('genai')}
        >
          <span className={styles.icon}>🤖</span>
          <div className={styles.content}>
            <span className={styles.title}>Gen AI (Groq)</span>
            <span className={styles.desc}>Advanced analysis with LLM</span>
          </div>
        </button>

        <button
          className={`${styles.option} ${selectedSolution === 'ml' ? styles.active : ''}`}
          onClick={() => onSelect('ml')}
        >
          <span className={styles.icon}>🧠</span>
          <div className={styles.content}>
            <span className={styles.title}>Machine Learning</span>
            <span className={styles.desc}>Backend ML model prediction</span>
          </div>
        </button>
      </div>
    </div>
  );
}
