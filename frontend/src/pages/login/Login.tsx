import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Shield, Mail, Lock, User, Loader2, RefreshCw, Check } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { authService, peopleService, userService } from '../../services/api';
import './Login.css';

interface Student {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  parentId?: number;
}

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [selectedChildren, setSelectedChildren] = useState<number[]>([]);
  const [availableChildren, setAvailableChildren] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const [resetToken, setResetToken] = useState('');
  
  const { login } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchChildById = async (id: number) => {
    try {
      const res = await peopleService.getStudentById(id);
      if (res.data && !res.data.parentId) {
        if (!selectedChildren.includes(res.data.id)) {
          setSelectedChildren(prev => [...prev, res.data.id]);
          if (!availableChildren.find(c => c.id === res.data.id)) {
            setAvailableChildren(prev => [...prev, res.data]);
          }
          toast('success', 'Child Linked', `${res.data.userName} has been linked`);
        }
      } else {
        toast('error', 'Cannot Link', 'Student not found or already has a parent');
      }
    } catch (err) {
      toast('error', 'Not Found', 'Student ID not found');
    }
  };

  const fetchChildByEmail = async (email: string) => {
    try {
      const res = await peopleService.getStudentByEmail(email);
      if (res.data && !res.data.parentId) {
        if (!selectedChildren.includes(res.data.id)) {
          setSelectedChildren(prev => [...prev, res.data.id]);
          if (!availableChildren.find(c => c.id === res.data.id)) {
            setAvailableChildren(prev => [...prev, res.data]);
          }
          toast('success', 'Child Linked', `${res.data.userName} has been linked`);
        }
      } else {
        toast('error', 'Cannot Link', 'Student not found or already has a parent');
      }
    } catch (err) {
      toast('error', 'Not Found', 'Student email not found');
    }
  };

  const handleAddChild = (value: string) => {
    const val = value.trim();
    if (!val) return;
    
    if (/^\d+$/.test(val)) {
      fetchChildById(parseInt(val));
    } else if (/\S+@\S+\.\S+/.test(val)) {
      fetchChildByEmail(val);
    } else {
      toast('error', 'Invalid Input', 'Enter a Student ID or Email');
    }
  };

  const handleChildToggle = (id: number) => {
    setSelectedChildren(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (needsPasswordReset) {
        if (password !== confirmPassword) {
          toast('error', 'Password Mismatch', 'Passwords do not match');
          setIsLoading(false);
          return;
        }
        await userService.resetPassword(resetToken, password);
        toast('success', 'Password Set', 'You can now login with your new password');
        setIsLogin(true);
        setNeedsPasswordReset(false);
        setResetToken('');
        setPassword('');
        setConfirmPassword('');
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        const response = await authService.login({ email, password });
        const { token, user, needsPasswordReset: needsReset, passwordResetToken: prt } = response.data;
        
        if (needsReset) {
          setNeedsPasswordReset(true);
          setResetToken(prt || '');
          toast('info', 'Password Required', 'Please set your password');
          setIsLoading(false);
          return;
        }
        
        if (user && token) {
          login({
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          }, token);
          toast('success', 'Access Granted', `Welcome back, ${user.name}`);
          navigate('/');
        }
      } else {
        if (password !== confirmPassword) {
          toast('error', 'Password Mismatch', 'Passwords do not match');
          setIsLoading(false);
          return;
        }
        const response = await authService.register({ 
          name, 
          email, 
          password, 
          role, 
          studentIds: role === 'PARENT' ? selectedChildren : []
        });
        const { token, user } = response.data;
        
        if (user && token) {
          login({
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
          }, token);
          toast('success', 'Registration Pending', 'Your account is waiting for admin approval.');
          navigate('/');
        }
      }
      } catch (err: any) {
        console.error('Auth Error:', err);
        const errorMsg = err.response?.data?.message || 'Authentication failed';
        if (err.response?.status === 403) {
          toast('error', 'Account Not Approved', 'Your account is pending admin approval');
        } else {
          toast('error', 'Auth Failure', errorMsg);
        }
      } finally {
        setIsLoading(false);
      }
    };

  const handleRequestPasswordReset = async () => {
    if (!email) {
      toast('error', 'Email Required', 'Please enter your email');
      return;
    }
    try {
      await authService.requestPasswordReset(email);
      toast('success', 'Request Sent', 'Admin will approve your password reset');
    } catch (err: any) {
      toast('error', 'Request Failed', err.response?.data?.message || 'Could not submit request');
    }
  };

  const showPasswordForm = !isLogin || needsPasswordReset;

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
          <h1>Smart Campus <span>Hub</span></h1>
          <p>Campus Operations & Incident Management</p>
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
            <UserPlus size={18} /> Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <AnimatePresence mode="wait">
            {showPasswordForm && !needsPasswordReset && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="input-wrapper"
              >
                <div className="input-group role-button-group">
                  <button 
                    type="button"
                    className={`role-btn ${role === 'STUDENT' ? 'active' : ''}`}
                    onClick={() => setRole('STUDENT')}
                  >
                    <User size={16} /> Student
                  </button>
                  <button 
                    type="button"
                    className={`role-btn ${role === 'PARENT' ? 'active' : ''}`}
                    onClick={() => setRole('PARENT')}
                  >
                    <Shield size={16} /> Parent
                  </button>
                  <button 
                    type="button"
                    className={`role-btn ${role === 'TECHNICIAN' ? 'active' : ''}`}
                    onClick={() => setRole('TECHNICIAN')}
                  >
                    <Shield size={16} /> Technician
                  </button>
                </div>
                {role === 'PARENT' && (
                  <div className="children-select">
                    <label>Link Children</label>
                    <div className="manual-link-input">
                      <input 
                        type="text" 
                        placeholder="Enter Student ID or Email to link"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddChild(e.currentTarget.value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <span className="hint">Press Enter to search and link child</span>
                    </div>
                    {selectedChildren.length > 0 && (
                      <div className="selected-children">
                        <p className="selected-label">Linked Children ({selectedChildren.length}):</p>
                        <div className="selected-chips">
                          {selectedChildren.map(id => {
                            const child = availableChildren.find(c => c.id === id);
                            return (
                              <div 
                                key={id} 
                                className="child-chip selected"
                                onClick={() => handleChildToggle(id)}
                              >
                                <Check size={14} />
                                <span>{child?.userName || `#${id}`}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

          {!needsPasswordReset && (
            <>
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
                  placeholder={isLogin ? "Password" : "Create Password"} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>

              {!isLogin && (
                <div className="input-group">
                  <Lock className="input-icon" size={20} />
                  <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                </div>
              )}
            </>
          )}

          {needsPasswordReset && (
            <>
              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              <div className="input-group">
                <Lock className="input-icon" size={20} />
                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
              </div>
            </>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : needsPasswordReset ? 'Set Password' : isLogin ? 'Enter Workspace' : 'Create Account'}
          </motion.button>

          {isLogin && !needsPasswordReset && (
            <button 
              type="button"
              className="forgot-btn"
              onClick={handleRequestPasswordReset}
            >
              <RefreshCw size={14} /> Request Password Reset
            </button>
          )}
        </form>

        <div className="login-footer">
          <p>© 2026 Smart Campus Hub • V2.0</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
