import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, LayoutDashboard, UserCog, ShieldCheck } from 'lucide-react';
import { StarsBackground } from '../components/ui/StarsBackground';
import { supabase } from '../lib/supabase';
import SplitText from '../components/ui/SplitText';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase
          .from('attendance_sessions')
          .select('id')
          .limit(1);
        
        if (error && error.code !== 'PGRST205') {
          console.error("Supabase connection error:", error);
        } else {
          console.log("Supabase connected successfully from frontend client");
        }
      } catch (err) {
        console.error("Supabase direct connection exception:", err);
      }
    };

    checkConnection();
  }, []);

  const portals = [
    {
      id: 'faculty',
      title: 'Faculty Portal',
      description: 'Manage students and mark daily attendance seamlessly.',
      icon: GraduationCap,
      color: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
      borderHover: 'hover:border-indigo-500',
      shadowHover: 'hover:shadow-indigo-200'
    },
    {
      id: 'hod',
      title: 'HOD Portal',
      description: 'Oversee department analytics and finalize attendance.',
      icon: LayoutDashboard,
      color: 'text-purple-600',
      bgLight: 'bg-purple-50',
      borderHover: 'hover:border-purple-500',
      shadowHover: 'hover:shadow-purple-200'
    },
    {
      id: 'admin',
      title: 'Principal (Admin) Portal',
      description: 'View college-wide absentee reports and statistics.',
      icon: UserCog,
      color: 'text-rose-600',
      bgLight: 'bg-rose-50',
      borderHover: 'hover:border-rose-500',
      shadowHover: 'hover:shadow-rose-200'
    },
    {
      id: 'superadmin',
      title: 'Super Admin',
      description: 'System configuration and full user access management.',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      borderHover: 'hover:border-emerald-500',
      shadowHover: 'hover:shadow-emerald-200'
    }
  ];

  const handleSelectPortal = (role) => {
    navigate('/login', { state: { role } });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }} 
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_#f5f5f5_0%,_#fff_100%)]"
    >
      {/* Animated Stars Background */}
      <StarsBackground starColor="#000" className="absolute inset-0 flex items-center justify-center" />


      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(219,234,254,1) 0%, rgba(219,234,254,0) 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(243,232,255,1) 0%, rgba(243,232,255,0) 70%)' }} />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <img src="https://srptc.ac.in/wp-content/uploads/2021/04/Polytechnic-1.png" alt="Logo" className="h-20 object-contain" />
          </div>
        </div>
        <SplitText
          text="Sri Ramakrishna Polytechnic College"
          className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-3"
          delay={40}
          duration={1.5}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          tag="h1"
        />
        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
          Select your portal to securely access the Attendance Management System.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full relative z-10 px-4"
      >
        {portals.map((portal) => {
          const Icon = portal.icon;
          return (
            <motion.div
              key={portal.id}
              variants={itemVariants}
              className="group h-[320px] w-full [perspective:1000px] cursor-pointer"
              onClick={() => handleSelectPortal(portal.id)}
            >
              <div className="relative h-full w-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                
                {/* Front of Card */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-md border border-slate-100 [backface-visibility:hidden]">
                  <div className={`${portal.bgLight} p-5 rounded-2xl mb-6 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-10 w-10 ${portal.color}`} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">{portal.title}</h2>
                  <p className="text-slate-400 text-sm font-medium">Hover to view details</p>
                </div>

                {/* Back of Card */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl border-2 border-transparent ${portal.borderHover} ${portal.shadowHover} [backface-visibility:hidden] [transform:rotateY(180deg)]`}>
                  <div className={`${portal.bgLight} p-3 rounded-xl mb-4`}>
                    <Icon className={`h-6 w-6 ${portal.color}`} strokeWidth={2} />
                  </div>
                  <h2 className={`text-lg font-bold ${portal.color} mb-3`}>{portal.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 text-center">
                    {portal.description}
                  </p>
                  <span className={`inline-flex items-center justify-center w-full py-3 px-4 text-sm font-semibold rounded-xl transition-colors duration-300 bg-slate-50 text-slate-700 hover:${portal.bgLight} hover:${portal.color}`}>
                    Enter Portal &rarr;
                  </span>
                </div>

              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default Landing;
