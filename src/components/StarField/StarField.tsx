import clsx from 'clsx';
import styles from './StarField.module.scss';

const StarField = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {Array.from({ length: 80 }).map((_, i) => (
      <div key={i} className={clsx(styles.starDot, "absolute rounded-full bg-white animate-pulse" )}/>
    ))}
  </div>
);

export default StarField;