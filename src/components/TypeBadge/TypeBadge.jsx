import { TYPE_COLORS } from '../../utils/typeColors';
import styles from './TypeBadge.module.css';

export default function TypeBadge({ type }) {
  const color = TYPE_COLORS[type] || '#888';
  return (
    <span className={styles.badge} style={{ backgroundColor: color }}>
      {type}
    </span>
  );
}
