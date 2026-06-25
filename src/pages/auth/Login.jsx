import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AppContext } from '../../context/AppContext';
import { StarsBackground } from '../../components/ui/StarsBackground';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { users, login, showToast } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const selectedRole = location.state?.role || 'faculty'; // fallback

  const roleTitles = {
    faculty: 'Faculty Portal',
    hod: 'HOD Portal',
    admin: 'Principal (Admin) Portal',
    superadmin: 'Super Admin Portal'
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    // Enforce role matching as well to prevent faculty from logging into HOD portal
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    const user = users.find(u => u.username === trimmedUsername && u.password === trimmedPassword && u.role === selectedRole);
    
    if (user) {
      login(user.role, user);
      showToast(`Welcome back, ${user.name}!`, 'success');
      
      // Redirect based on role
      if (user.role === 'superadmin') navigate('/superadmin/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'hod') navigate('/hod/dashboard');
      else if (user.role === 'faculty') navigate('/faculty/submit');
    } else {
      setError(`Invalid credentials for ${roleTitles[selectedRole]}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 20 }} 
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_#f5f5f5_0%,_#fff_100%)] flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      <StarsBackground starColor="#000" className="absolute inset-0 flex items-center justify-center" />
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(219,234,254,1) 0%, rgba(219,234,254,0) 70%)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(243,232,255,1) 0%, rgba(243,232,255,0) 70%)' }} />

      <button 
        onClick={() => navigate('/')} 
        className="absolute top-8 left-8 flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium z-10 bg-white/80 px-4 py-2 rounded-full shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Portals
      </button>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <img src="https://srptc.ac.in/wp-content/uploads/2021/04/Polytechnic-1.png" alt="Logo" className="h-16 object-contain" />
          </div>
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 mb-1">Sri Ramakrishna Polytechnic College</h1>
        <p className="text-slate-500 font-medium">{roleTitles[selectedRole]} Login</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -6, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15), 0 0 0 1px rgb(99 102 241 / 0.1)" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-md border border-slate-200/60 relative z-10"
      >
        <h2 className="text-xl font-bold text-text-primary mb-6 text-center">Sign In</h2>
        
        {error && (
          <div className="bg-red-50 text-danger-red text-sm p-3 rounded-lg mb-4 border border-red-100 text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Enter username"
                className="pl-10 h-11"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="pl-10 pr-10 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 mt-4 shadow-md hover:shadow-lg transition-shadow">
            Login
          </Button>
        </form>



      </motion.div>
    </motion.div>
  );
};

export default Login;
