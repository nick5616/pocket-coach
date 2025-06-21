import { HTMLAttributes } from "react";
import styles from "../styles/components.module.css";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: styles.badgeDefault,
    secondary: styles.badgeSecondary,
    destructive: styles.badgeDestructive,
    outline: styles.badgeOutline
  };

  const classes = [
    styles.badge,
    variantClasses[variant],
    className
  ].filter(Boolean).join(" ");

  return <div className={classes} {...props} />;
}