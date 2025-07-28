import * as React from "react"
import { cn } from "../../lib/utils"

// Simple Card component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-4 lg:p-6", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: CardProps) {
  return (
    <h3 className={cn("text-lg lg:text-2xl font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: CardProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: CardProps) {
  return (
    <div className={cn("p-4 lg:p-6 pt-0", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: CardProps) {
  return (
    <div className={cn("flex items-center p-4 lg:p-6 pt-0", className)}>
      {children}
    </div>
  );
}
