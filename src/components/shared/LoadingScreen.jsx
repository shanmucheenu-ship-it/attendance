import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen = ({ onComplete }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Show loader for 2.0 seconds, then start exit transition
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, 2000);

    // Call onComplete after exit transition ends (2.6 seconds total)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2600);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Cubic Bezier preset
  const smoothEase = [0.22, 1, 0.36, 1];

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: exiting ? 0 : 1,
      }}
      transition={{ duration: 0.6, ease: smoothEase }}
      className="fixed inset-0 z-[9999] bg-slate-50 flex items-center justify-center p-6 select-none font-sans overflow-hidden"
    >
      
      {/* 1. Ambient Background Bloom Halo */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: exiting ? 0 : 1, 
          scale: exiting ? 1.1 : 1 
        }}
        transition={{ duration: 0.7, ease: smoothEase }}
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.08) 0%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'ambientBloom 5s infinite alternate ease-in-out'
        }}
      />

      <style>{`
        @keyframes ambientBloom {
          0% { transform: scale(0.95); opacity: 0.7; }
          100% { transform: scale(1.05); opacity: 1.0; }
        }
        @keyframes logoBloom {
          0% { transform: scale(0.9); opacity: 0.5; }
          100% { transform: scale(1.1); opacity: 0.85; }
        }
      `}</style>

      {/* 2. Centered Popup Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ 
          scale: exiting ? 0.96 : 1, 
          opacity: exiting ? 0 : 1, 
          y: exiting ? 20 : 0 
        }}
        transition={{ duration: 0.55, ease: smoothEase }}
        className="bg-white border border-slate-100/80 shadow-[0_12px_45px_rgba(99,102,241,0.03)] rounded-2xl p-10 max-w-[420px] w-full flex flex-col items-center text-center relative z-10"
      >
        
        {/* Logo Container with Backlight Bloom */}
        <div className="relative w-24 h-24 flex items-center justify-center mb-8">
          
          {/* Logo Bloom Circle */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: exiting ? 0 : 0.8, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="absolute w-18 h-18 bg-indigo-500/20 rounded-full blur-xl pointer-events-none"
            style={{ animation: 'logoBloom 3s infinite alternate ease-in-out' }}
          />

          {/* Logo image itself */}
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.05 }}
            src="https://srptc.ac.in/wp-content/uploads/2021/04/Polytechnic-1.png" 
            alt="College Shield" 
            className="w-full h-full object-contain relative z-10"
          />
        </div>

        {/* Branding Headers with Staggered Entrance */}
        <div className="overflow-hidden py-0.5">
          <motion.h1 
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: smoothEase, delay: 0.15 }}
            className="text-slate-800 text-[12px] font-extrabold tracking-[0.3em] uppercase leading-relaxed"
          >
            SRPTC × OAKSTONE
          </motion.h1>
        </div>

        <div className="overflow-hidden py-0.5">
          <motion.h2 
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: smoothEase, delay: 0.25 }}
            className="text-slate-800 text-[10.5px] font-extrabold tracking-[0.3em] uppercase mt-1"
          >
            INNOVATIONS
          </motion.h2>
        </div>

        {/* Horizontal line expanding from center */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: smoothEase, delay: 0.35 }}
          className="w-10 h-[1px] bg-slate-150 my-6 origin-center"
        />

        {/* Pulsing Loading Label */}
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: smoothEase, delay: 0.45 }}
          className="text-[9.5px] font-bold tracking-[0.35em] text-slate-400 uppercase animate-pulse"
        >
          Connecting...
        </motion.span>

      </motion.div>

    </motion.div>
  );
};
