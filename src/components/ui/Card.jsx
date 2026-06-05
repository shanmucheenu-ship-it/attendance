import React from 'react';
import { cn } from './Button';
import { motion } from 'framer-motion';

export const Card = React.forwardRef(({ className, disableHover = false, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={!disableHover ? { y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.01)" } : {}}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className={cn(
      "rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-md text-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";
