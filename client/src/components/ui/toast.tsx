import { ReactNode } from "react";

export interface ToastProps {
  id?: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  variant?: "default" | "destructive";
}

export interface ToastActionElement {
  altText: string;
}

// Simple toast components for compatibility
export const ToastProvider = ({ children }: { children: ReactNode }) => children;
export const ToastViewport = ({ children }: { children: ReactNode }) => children;
export const Toast = ({ children }: { children: ReactNode }) => children;
export const ToastTitle = ({ children }: { children: ReactNode }) => children;
export const ToastDescription = ({ children }: { children: ReactNode }) => children;
export const ToastAction = ({ children }: { children: ReactNode }) => children;
export const ToastClose = ({ children }: { children: ReactNode }) => children;