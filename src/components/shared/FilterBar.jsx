import React from 'react';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Search } from 'lucide-react';

export const FilterBar = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-[0_4px_30px_rgb(0,0,0,0.02)] sticky top-20 z-10 py-3 px-4 md:px-8 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {Object.entries(filters).filter((entry) => entry[1].type !== 'search').map(([key, config]) => {
          if (config.type === 'select') {
            return (
              <Select 
                key={key} 
                value={config.value} 
                onChange={(e) => onFilterChange(key, e.target.value)}
                className="w-[calc(50%-6px)] md:w-40"
              >
                {config.options.map(opt => (
                  <option key={opt.value || opt} value={opt.value || opt}>
                    {opt.label || opt}
                  </option>
                ))}
              </Select>
            );
          }
          
          if (config.type === 'date') {
            return (
              <Input 
                key={key} 
                type="date" 
                value={config.value}
                onChange={(e) => onFilterChange(key, e.target.value)}
                className="w-full md:w-48"
              />
            );
          }
          return null;
        })}
      </div>

      {Object.entries(filters).filter((entry) => entry[1].type === 'search').map(([key, config]) => (
        <div key={key} className="w-full md:flex-1 md:max-w-sm md:ml-auto">
          <Input
            icon={Search}
            placeholder={config.placeholder || "Search..."}
            value={config.value}
            onChange={(e) => onFilterChange(key, e.target.value)}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
};
