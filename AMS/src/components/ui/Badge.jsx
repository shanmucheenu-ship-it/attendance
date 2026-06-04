import React from 'react';
import { cn } from './Button';

export const Badge = ({ className, variant = "default", children, ...props }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-700 border border-green-200",
    danger: "bg-red-100 text-red-700 border border-red-200",
    warning: "bg-amber-100 text-amber-700 border border-amber-200",
    primary: "bg-blue-100 text-blue-700 border border-blue-200"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-4 py-1 text-sm font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
