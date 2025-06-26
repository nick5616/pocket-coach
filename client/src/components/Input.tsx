import React, { InputHTMLAttributes, forwardRef } from "react";
import styles from "../styles/components.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        className={`${styles.input} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";