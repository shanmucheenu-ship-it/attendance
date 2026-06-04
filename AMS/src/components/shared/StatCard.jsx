import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { motion } from 'framer-motion';

export const StatCard = ({ title, value, icon: Icon, colorClass, delay = 0 }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { delay } }
      }}
      initial="hidden"
      animate="show"
    >
      <Card className="overflow-hidden relative group">
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-40 ${colorClass.split(' ')[0]}`} />
        <CardContent className="p-6 flex items-center space-x-5 relative z-10">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.1 }}
            className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${colorClass}`}
          >
            <Icon className="h-7 w-7" strokeWidth={2.5} />
          </motion.div>
          <div>
            <p className="text-sm text-slate-500 font-semibold tracking-wide uppercase">{title}</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{value}</h3>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
