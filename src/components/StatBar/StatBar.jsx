import { STAT_MAX } from '../../constants';
import { formatStatName } from '../../utils/formatters';
import styles from './StatBar.module.css';

function getStatColor(value) {
  if (value < 50) return '#f87171';
  if (value < 80) return '#fb923c';
  if (value < 100) return '#fbbf24';
  if (value < 130) return '#4ade80';
  return '#60a5fa';
}

export default function StatBar({ statName, value }) {
  const pct = Math.min((value / STAT_MAX) * 100, 100);
  const color = getStatColor(value);

  return (
    <div className={styles.row}>
      <span className={styles.label}>{formatStatName(statName)}</span>
      <span className={styles.value}>{value}</span>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
