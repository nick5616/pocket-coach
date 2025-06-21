import { HTMLAttributes } from "react";
import styles from "../styles/components.module.css";

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

export function Progress({ className = "", value = 0, max = 100, ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`${styles.progress} ${className}`} {...props}>
      <div
        className={styles.progressIndicator}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
}