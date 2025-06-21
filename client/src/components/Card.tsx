import { HTMLAttributes, forwardRef } from "react";
import styles from "../styles/components.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", ...props }, ref) => (
    <div className={`${styles.card} ${className}`} ref={ref} {...props} />
  )
);

const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", ...props }, ref) => (
    <div className={`${styles.cardHeader} ${className}`} ref={ref} {...props} />
  )
);

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className = "", ...props }, ref) => (
    <h3 className={`${styles.cardTitle} ${className}`} ref={ref} {...props} />
  )
);

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className = "", ...props }, ref) => (
    <p className={`${styles.cardDescription} ${className}`} ref={ref} {...props} />
  )
);

const CardContent = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", ...props }, ref) => (
    <div className={`${styles.cardContent} ${className}`} ref={ref} {...props} />
  )
);

const CardFooter = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", ...props }, ref) => (
    <div className={`${styles.cardFooter} ${className}`} ref={ref} {...props} />
  )
);

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };