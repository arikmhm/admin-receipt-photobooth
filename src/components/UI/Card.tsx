import React from "react";
import { cn } from "../../utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noShadow?: boolean; // kept for API compatibility
}

export const Card: React.FC<CardProps> = ({
  className,
  noShadow: _noShadow,
  children,
  ...props
}) => {
  return (
    <div
      className={cn("bg-surface border border-dim rounded-lg p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};
