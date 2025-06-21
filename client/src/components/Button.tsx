import { ButtonHTMLAttributes } from "react";
import styles from "../styles/components.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "default" | "lg" | "icon";
}

export function Button({ 
  className = "", 
  variant = "primary", 
  size = "default", 
  ...props 
}: ButtonProps) {
  const variantClasses = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary,
    destructive: styles.buttonDestructive,
    ghost: styles.buttonGhost
  };

  const sizeClasses = {
    sm: styles.buttonSm,
    default: "",
    lg: styles.buttonLg,
    icon: styles.buttonSm
  };

  const classes = [
    styles.button,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(" ");

  return <button className={classes} {...props} />;
}