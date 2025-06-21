import { HTMLAttributes, forwardRef } from "react";
import styles from "../styles/components.module.css";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const getVariantClass = () => {
      switch (variant) {
        case "default":
          return styles.badgeDefault;
        case "secondary":
          return styles.badgeSecondary;
        case "destructive":
          return styles.badgeDestructive;
        case "outline":
          return styles.badgeOutline;
        default:
          return styles.badgeDefault;
      }
    };

    return (
      <div
        className={`${styles.badge} ${getVariantClass()} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };