import { useToast } from "@/hooks/use-toast";
import styles from "../../styles/components.module.css";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className={styles.toaster}>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <div key={id} className={styles.toast} {...props}>
          {title && <div className={styles.toastTitle}>{title}</div>}
          {description && <div className={styles.toastDescription}>{description}</div>}
          {action}
        </div>
      ))}
    </div>
  );
}