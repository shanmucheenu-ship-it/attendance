import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Toast } from '../ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';

export const PageWrapper = ({ children, title }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-slate-50 flex font-sans text-slate-800"
    >
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      <div className="md:ml-64 flex-1 flex flex-col min-w-0 w-full">
        <Topbar title={title} onMenuClick={() => setIsMobileMenuOpen(true)} />
        <motion.main 
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex-1 p-4 md:p-8 overflow-y-auto w-full flex flex-col justify-between"
        >
          <div>
            {children}
          </div>
          <footer className="mt-8 pt-4 border-t border-slate-200/60 text-center text-xs font-semibold text-slate-400 tracking-wider uppercase pb-2">
            Designed and Developed by Oakstone Innovations
          </footer>
        </motion.main>
      </div>
      <Toast />
    </motion.div>
  );
};
