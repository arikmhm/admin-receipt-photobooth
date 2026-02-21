/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";
import { cn } from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "w-full bg-void text-hi font-mono text-sm px-3 py-2 rounded-md outline-none transition-colors",
        "border border-transparent focus:border-accent",
        "placeholder:text-lo",
        className,
      )}
      {...props}
    />
  );
};
