import { HTMLAttributes } from "react";
import styles from "../styles/components.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return <div className={`${styles.card} ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }: CardProps) {
  return <div className={`${styles.cardHeader} ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`${styles.cardTitle} ${className}`} {...props} />;
}

export function CardDescription({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`${styles.cardDescription} ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }: CardProps) {
  return <div className={`${styles.cardContent} ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: CardProps) {
  return <div className={`${styles.cardFooter} ${className}`} {...props} />;
}