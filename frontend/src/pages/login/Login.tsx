import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Shield, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/api';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const response = await authService.login({ email, password });
        const { token, user } = response.data;
        
        if (user && token) {
          login({
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
          }, token);
          toast('success', 'Access Granted', `Welcome back, Operative ${user.name}`);
          navigate('/');
        }
      } else {
        // Public registration restricted to STUDENT role per security protocol
        const response = await authService.register({ name, email, password, role: 'STUDENT' });
        const { token, user } = response.data;
        
        if (user && token) {
          login({
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
          }, token);
          toast('success', 'Registry Created', 'Student clearance initialized successfully.');
          navigate('/');
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Authentication or Connection failure.';
      toast('error', 'Auth Failure', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="mesh-bg"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="login-glass-card"
      >
        <div className="login-header">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="logo-icon"
          >
            <Shield size={40} className="text-primary" />
          </motion.div>
          <h1>Nexus <span>Ops</span></h1>
          <p>Enterprise Campus Intelligence Hub</p>
        </div>

        <div className="auth-toggle">
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(true)}
            disabled={isLoading}
          >
            <LogIn size={18} /> Login
          </button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(false)}
            disabled={isLoading}
          >
            <UserPlus size={18} /> Student Signup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="input-wrapper"
              >
                <div className="input-group">
                  <User className="input-icon" size={20} />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              isLogin ? 'Enter Workspace' : 'Initialize Account'
            )}
          </motion.button>
        </form>

        <div className="login-footer">
          <p>© 2026 Nexus Ops Command Center • V2.0 Enterprise</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
