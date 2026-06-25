import React, { useState, useRef, useEffect } from 'react';
import { Printer, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PrintDropdown = ({ onPrint }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { year: '1st Year', section: 'A' },
    { year: '1st Year', section: 'B' },
    { year: '2nd Year', section: 'A' },
    { year: '2nd Year', section: 'B' },
    { year: '3rd Year', section: 'A' },
    { year: '3rd Year', section: 'B' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (year, section) => {
    setIsOpen(false);
    onPrint(year, section);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center text-primary-blue hover:text-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors focus:outline-none"
        title="Print Section Report"
      >
        <Printer className="w-4 h-4 mr-1" />
        <span className="text-sm font-medium">Print</span>
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden"
          >
            <div className="py-1">
              <button
                onClick={() => handleSelect('All', 'All')}
                className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 hover:text-primary-blue transition-colors flex items-center group font-semibold border-b border-gray-100 pb-2 mb-1"
              >
                <Printer className="w-3 h-3 mr-2 text-primary-blue" />
                Entire Department
              </button>
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt.year, opt.section)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-primary-blue transition-colors flex items-center group"
                >
                  <Printer className="w-3 h-3 mr-2 text-gray-400 group-hover:text-primary-blue transition-colors" />
                  {opt.year} - {opt.section} Section
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
