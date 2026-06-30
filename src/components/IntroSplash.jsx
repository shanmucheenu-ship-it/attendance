import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import SplitText from './ui/SplitText';

// IntroSplash renders the animated entry sequence and notifies parent when done.
const IntroSplash = ({ onComplete }) => {
  // Animation controllers for sequencing
  const logoControls = useAnimation();
  const ringControls = useAnimation();
  const titleControls = useAnimation();
  const underlineControls = useAnimation();
  const subtitleControls = useAnimation();
  const taglineControls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      // Phase 1 – Logo Entrance (0 – 1.2s)
      await Promise.all([
        logoControls.start({
          scale: [0, 1.2, 1],
          transition: { duration: 1.2, type: 'spring', damping: 20, stiffness: 100 },
        }),
        ringControls.start({
          scale: [0, 1.4, 1.6],
          opacity: [0, 0.8, 0],
          transition: { duration: 1.2, ease: 'easeOut' },
        })
      ]);

      // Phase 2 – Title Reveal (1.2 – 3s)
      // Staggered characters with blur & spacing
      titleControls.start({ opacity: 1, transition: { delay: 0.1 } });
      // Underline draw left→right
      underlineControls.start({ width: ['0%', '100%'], transition: { duration: 0.6, ease: 'linear' } });
      // Subtitle slide up + fade in (slight delay)
      await subtitleControls.start({
        opacity: 1,
        y: 0,
        transition: { delay: 0.3, duration: 0.6, ease: 'easeOut' }
      });

      // Phase 3 – Hold + Tagline (3 – 4.2s)
      await taglineControls.start({
        opacity: 1,
        transition: { duration: 0.4 }
      });

      // Phase 4 – Exit Transition (4.2 – 5s)
      await new Promise(r => setTimeout(r, 400)); // short pause before exit
      // Scale up slightly & fade out
      await logoControls.start({
        scale: 1.2,
        opacity: 0,
        transition: { duration: 0.8, ease: 'easeIn' }
      });
      await ringControls.start({ opacity: 0, transition: { duration: 0.8 } });
      // Notify parent after exit animation completes
      onComplete();
    };
    sequence();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {/* Phase 1 – Logo with gold ring */}
      <motion.div className="relative mb-8" animate={ringControls}>
        <motion.img
          src="https://srptc.ac.in/wp-content/uploads/2021/04/Polytechnic-1.png"
          alt="SRPTC Shield Logo"
          className="h-32 w-32 object-contain"
          animate={logoControls}
        />
        {/* Gold ring / glow */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-gold shadow-[0_0_20px_5px_rgba(255,215,0,0.6)]"
          style={{ pointerEvents: 'none' }}
        />
      </motion.div>

      {/* Phase 2 – Title */}
      <motion.div animate={titleControls} className="text-center">
        <SplitText
          text="SRI RAMAKRISHNA"
          splitType="chars"
          from={{ opacity: 0, y: 40, filter: 'blur(6px)', letterSpacing: '0.4em' }}
          to={{ opacity: 1, y: 0, filter: 'blur(0px)', letterSpacing: 'normal' }}
          duration={1.2}
          ease="power3.out"
          stagger={0.04}
        />
        {/* Thin gold underline */}
        <motion.div
          className="h-0.5 bg-gold mt-2 mx-auto"
          style={{ width: '0%' }}
          animate={underlineControls}
        />
        {/* Subtitle */}
        <motion.h2
          className="mt-3 text-xl text-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={subtitleControls}
        >
          POLYTECHNIC COLLEGE
        </motion.h2>
      </motion.div>

      {/* Phase 3 – Tagline */}
      <motion.p
        className="mt-6 text-sm text-gray-600"
        initial={{ opacity: 0 }}
        animate={taglineControls}
      >
        ATTENDANCE MANAGEMENT SITE
      </motion.p>

      {/* Loading indicator – Spinning Animation */}
      <motion.div
        className="flex flex-col items-center mt-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-10 h-10 border-4 border-slate-100 border-t-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        />
        <span className="mt-2 text-xs font-semibold tracking-widest text-slate-400 uppercase animate-pulse">
          Loading
        </span>
      </motion.div>
    </motion.div>
  );
};

export default IntroSplash;
