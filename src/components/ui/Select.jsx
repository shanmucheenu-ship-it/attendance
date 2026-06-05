import React from 'react';
import { cn } from './Button';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full appearance-none rounded-lg border border-border-gray bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <ChevronDown className="h-4 w-4 text-text-muted" />
      </div>
    </div>
  );
});
Select.displayName = "Select";
