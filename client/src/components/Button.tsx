import { ButtonHTMLAttributes, forwardRef } from "react";
import styles from "../styles/components.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "default" | "lg" | "icon";
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "default", ...props }, ref) => {
    const getVariantClass = () => {
      switch (variant) {
        case "primary":
          return styles.buttonPrimary;
        case "secondary":
          return styles.buttonSecondary;
        case "destructive":
          return styles.buttonDestructive;
        case "ghost":
          return styles.buttonGhost;
        default:
          return styles.buttonPrimary;
      }
    };

    const getSizeClass = () => {
      switch (size) {
        case "sm":
          return styles.buttonSm;
        case "lg":
          return styles.buttonLg;
        case "icon":
          return styles.buttonSm;
        default:
          return "";
      }
    };

    return (
      <button
        className={`${styles.button} ${getVariantClass()} ${getSizeClass()} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };