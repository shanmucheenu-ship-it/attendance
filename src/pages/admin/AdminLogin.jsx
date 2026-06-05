import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { AppContext } from '../../context/AppContext';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (password === 'admin@123') {
        login('admin', { username: 'Admin' });
        navigate('/admin/dashboard');
      } else {
        setError('Invalid password');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        <Card className="shadow-lg border-none">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mx-auto mb-4">
                <img src="https://srptc.ac.in/wp-content/uploads/2021/04/Polytechnic-1.png" alt="Logo" className="h-16 object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">Admin Access</h1>
              <p className="text-sm text-text-secondary mt-1">Enter master password to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <Input 
                  icon={ShieldCheck} 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {error && <p className="text-danger-red text-sm font-medium">{error}</p>}

              <Button type="submit" variant="outline" className="w-full h-11 text-base !bg-slate-800 !text-white hover:!bg-slate-700 !border-transparent" disabled={loading}>
                {loading ? 'Authenticating...' : 'Access Dashboard'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-text-secondary hover:text-slate-800 transition-colors">
                &larr; Back to Portal Selection
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
