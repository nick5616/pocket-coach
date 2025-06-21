import { ReactNode, HTMLAttributes } from "react";
import styles from "../styles/components.module.css";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className={styles.dialogOverlay} onClick={() => onOpenChange?.(false)}>
      <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${styles.dialogInner} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DialogHeader({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${styles.dialogHeader} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ className = "", children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={`${styles.dialogTitle} ${className}`} {...props}>
      {children}
    </h2>
  );
}