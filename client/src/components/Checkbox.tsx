import { InputHTMLAttributes } from "react";
import styles from "../styles/components.module.css";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export function Checkbox({ className = "", ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={`${styles.checkbox} ${className}`}
      {...props}
    />
  );
}