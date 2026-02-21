import React from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "destructive" | "accent" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "primary",
  size = "md",
  ...props
}) => {
  const baseStyles =
    "font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 shrink-0";

  const variants = {
    primary: "bg-accent text-white hover:bg-[#1557B0] active:bg-[#174EA6]",
    destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    accent:
      "bg-accent/10 text-accent border border-accent/25 hover:bg-accent/20",
    outline: "bg-surface text-hi border border-dim hover:bg-surface-hover",
  };

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-1.5 text-sm",
    lg: "px-6 py-2.5 text-base",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
};
