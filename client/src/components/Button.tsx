import { ButtonHTMLAttributes } from "react";
import styles from "../styles/components.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline";
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
    ghost: styles.buttonGhost,
    outline: styles.buttonOutline
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