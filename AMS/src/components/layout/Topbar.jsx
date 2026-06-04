import React, { useContext, useState, useRef, useEffect } from 'react';
import { Bell, Menu } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Topbar = ({ title, onMenuClick }) => {
  const { auth, setShowViewDataModal, alerts, markAlertAsRead } = useContext(AppContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const myAlerts = (alerts || []).filter(a => a.department === auth.user?.department && !a.read);
  
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  let initials = 'U';
  if (auth.user?.name) {
    initials = auth.user.name.substring(0, 2).toUpperCase();
  } else if (auth.user?.username) {
    initials = auth.user.username.substring(0, 2).toUpperCase();
  }

  let displayName = 'User';
  if (auth.role === 'superadmin') displayName = 'System Admin';
  else if (auth.role === 'admin') displayName = 'Admin';
  else if (auth.role === 'hod') displayName = `HOD - ${auth.user?.department}`;
  else if (auth.role === 'faculty') displayName = `Faculty - ${auth.user?.department}`;

  return (
    <header className="h-20 bg-white/75 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 w-full shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
      <div className="flex items-center gap-3 md:gap-0">
        <button 
          onClick={onMenuClick} 
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight leading-tight">{title}</h1>
          <p className="hidden md:block text-sm font-medium text-slate-500 mt-0.5">{today}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        {auth.role === 'admin' && (
          <button
            onClick={() => setShowViewDataModal(true)}
            className="text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5"
          >
            View Data
          </button>
        )}
        <div className="relative" ref={dropdownRef}>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 hover:text-indigo-600 transition-colors shadow-sm border border-slate-200/50"
          >
            <Bell className="h-5 w-5" />
            {myAlerts.length > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </motion.button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                  {myAlerts.length > 0 && (
                    <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">{myAlerts.length} new</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {myAlerts.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                      <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">All caught up!</p>
                      <p className="text-xs text-slate-400 mt-1">No new notifications</p>
                    </div>
                  ) : (
                    myAlerts.map(alert => (
                      <div 
                        key={alert.id} 
                        onClick={() => { markAlertAsRead(alert.id); setShowNotifications(false); }}
                        className="p-4 border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <div className="flex gap-3">
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                          <div>
                            <p className="text-sm text-slate-700 font-semibold group-hover:text-indigo-600 transition-colors leading-snug">{alert.message}</p>
                            <p className="text-xs text-slate-400 mt-1.5 font-medium">{alert.date}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center space-x-4 pl-6 border-l border-slate-200/60 cursor-pointer group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold shadow-inner border border-indigo-200/50"
          >
            {initials}
          </motion.div>
          <div className="hidden md:block transition-all group-hover:translate-x-1">
            <p className="text-sm font-bold text-slate-700">
              {displayName}
            </p>
            <p className="text-xs font-semibold text-slate-400 capitalize tracking-wide">{auth.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
