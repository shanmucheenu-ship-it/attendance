/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const variants = {
  primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30",
  outline: "border-2 border-indigo-100 bg-white text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 shadow-sm",
  ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
  danger: "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30",
  success: "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30"
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-8",
  icon: "h-10 w-10",
};

export const Button = React.forwardRef(({ className, variant = "primary", size = "default", ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
