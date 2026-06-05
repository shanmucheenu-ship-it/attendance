import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

export const Toast = () => {
  const { toast } = useContext(AppContext);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return { border: 'border-l-success-green', icon: <CheckCircle className="text-success-green h-5 w-5" /> };
      case 'error':
        return { border: 'border-l-danger-red', icon: <XCircle className="text-danger-red h-5 w-5" /> };
      default:
        return { border: 'border-l-primary-blue', icon: <Info className="text-primary-blue h-5 w-5" /> };
    }
  };

  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-4 right-4 z-50 pointer-events-none"
        >
          <div className={`bg-white shadow-lg rounded-lg border-l-4 p-4 flex items-center space-x-3 min-w-[300px] ${getToastStyles(toast.type).border}`}>
            {getToastStyles(toast.type).icon}
            <span className="text-sm font-medium text-text-primary">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
