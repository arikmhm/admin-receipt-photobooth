/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";
import { cn } from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "w-full bg-gray-50 border-2 border-black px-3 py-2 font-mono text-sm outline-none transition-all focus:bg-white focus:shadow-neo placeholder:text-gray-400",
        className
      )}
      {...props}
    />
  );
};