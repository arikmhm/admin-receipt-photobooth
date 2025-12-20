import React from "react";
import { cn } from "../../utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noShadow?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, noShadow, children, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white border-2 border-black p-4",
        !noShadow && "shadow-neo",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};