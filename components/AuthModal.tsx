import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { storageService } from '../services/storageService';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false
  });

  // Reset state when modal opens or mode changes
  useEffect(() => {
    setGlobalError(null);
    setTouched({ name: false, email: false, password: false });
  }, [isOpen, mode]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getErrors = () => {
    return {
      name: mode === 'signup' && touched.name && formData.name.length < 2 
        ? "Name must be at least 2 characters" 
        : null,
      email: touched.email && !validateEmail(formData.email) 
        ? "Please enter a valid email address" 
        : null,
      password: touched.password && formData.password.length < 6 
        ? "Password must be at least 6 characters" 
        : null
    };
  };

  const errors = getErrors();
  const isFormValid = !errors.name && !errors.email && !errors.password && 
                      formData.email && formData.password && 
                      (mode === 'login' || formData.name);

  const getFieldStatus = (field: 'name' | 'email' | 'password', error: string | null) => {
    if (!touched[field]) return 'neutral';
    if (error) return 'error';
    if (formData[field]) return 'success';
    return 'neutral';
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setGlobalError(null);
    setLoading(true);

    try {
      let user: User;

      if (mode === 'signup') {
        user = await storageService.register({
          id: '', // Generated in service
          name: formData.name,
          email: formData.email,
          plan: 'Free'
        }, formData.password);
        
        storageService.notifyAdmin(user, 'signup');
      } else {
        user = await storageService.login(formData.email, formData.password);
        storageService.notifyAdmin(user, 'login');
      }

      onLogin(user);
      onClose();
    } catch (err: any) {
      setGlobalError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGlobalError(null);
    setLoading(true);
    try {
      const mockGoogleUser = {
        name: 'Google User',
        email: 'user@gmail.com',
        avatar: 'https://ui-avatars.com/api/?name=Google+User&background=random' 
      };
      
      const user = await storageService.loginWithProvider('google', mockGoogleUser);
      onLogin(user);
      onClose();
    } catch (err: any) {
      setGlobalError(err.message || "Google sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => { setMode('login'); setGlobalError(null); }}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              mode === 'login' ? 'bg-surface/50 text-text border-b-2 border-primary' : 'text-muted hover:text-text hover:bg-surface/30'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('signup'); setGlobalError(null); }}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-surface/50 text-text border-b-2 border-primary' : 'text-muted hover:text-text hover:bg-surface/30'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
              <Icon name={mode === 'login' ? 'right-to-bracket' : 'user-plus'} className="text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-text">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted text-sm mt-1">
              {mode === 'login' ? 'Enter your details to access your workspace.' : 'Start your AI learning journey today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5 uppercase">Full Name</label>
                <div className="relative group">
                  <Icon name="user" className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors 
                    ${getFieldStatus('name', errors.name) === 'error' ? 'text-red-400' : 
                      getFieldStatus('name', errors.name) === 'success' ? 'text-emerald-400' : 'text-muted group-focus-within:text-primary'}`} 
                  />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    onBlur={() => handleBlur('name')}
                    placeholder="John Doe"
                    className={`w-full bg-background border rounded-lg py-2.5 pl-10 pr-10 text-text focus:ring-1 outline-none transition-all placeholder:text-muted/50
                      ${getFieldStatus('name', errors.name) === 'error' 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                        : getFieldStatus('name', errors.name) === 'success'
                        ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20'
                        : 'border-border focus:border-primary focus:ring-primary'
                      }`}
                  />
                  {getFieldStatus('name', errors.name) === 'success' && (
                    <Icon name="check" className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  )}
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1 animate-fade-in">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase">Email Address</label>
              <div className="relative group">
                <Icon name="envelope" className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors 
                    ${getFieldStatus('email', errors.email) === 'error' ? 'text-red-400' : 
                      getFieldStatus('email', errors.email) === 'success' ? 'text-emerald-400' : 'text-muted group-focus-within:text-primary'}`} 
                />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  className={`w-full bg-background border rounded-lg py-2.5 pl-10 pr-10 text-text focus:ring-1 outline-none transition-all placeholder:text-muted/50
                    ${getFieldStatus('email', errors.email) === 'error' 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                      : getFieldStatus('email', errors.email) === 'success'
                      ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20'
                      : 'border-border focus:border-primary focus:ring-primary'
                    }`}
                />
                {getFieldStatus('email', errors.email) === 'success' && (
                  <Icon name="check" className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                )}
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1 animate-fade-in">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5 uppercase">Password</label>
              <div className="relative group">
                <Icon name="lock" className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors 
                    ${getFieldStatus('password', errors.password) === 'error' ? 'text-red-400' : 
                      getFieldStatus('password', errors.password) === 'success' ? 'text-emerald-400' : 'text-muted group-focus-within:text-primary'}`} 
                />
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full bg-background border rounded-lg py-2.5 pl-10 pr-10 text-text focus:ring-1 outline-none transition-all placeholder:text-muted/50
                    ${getFieldStatus('password', errors.password) === 'error' 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                      : getFieldStatus('password', errors.password) === 'success'
                      ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20'
                      : 'border-border focus:border-primary focus:ring-primary'
                    }`}
                />
                 {getFieldStatus('password', errors.password) === 'success' && (
                    <Icon name="check" className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                  )}
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1 animate-fade-in">{errors.password}</p>}
            </div>

            {globalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2 animate-fade-in">
                <Icon name="circle-exclamation" />
                {globalError}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full font-bold py-3 rounded-lg shadow-lg transition-all flex justify-center items-center gap-2 mt-2
                ${loading || !isFormValid 
                  ? 'bg-surface text-muted cursor-not-allowed' 
                  : 'bg-primary hover:bg-primaryHover text-white shadow-primary/20'
                }`}
            >
              {loading && <Icon name="spinner" className="fa-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-6">
             <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-border"></div>
             </div>
             <div className="relative flex justify-center text-sm">
               <span className="px-2 bg-surface text-muted">Or continue with</span>
             </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-text text-background font-bold py-3 rounded-lg hover:opacity-90 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
          >
             {loading ? <Icon name="spinner" className="fa-spin text-background" /> : <Icon name="google" type="brands" className="text-lg" />}
             Google
          </button>
          
          <div className="mt-6 text-center">
             <button 
               onClick={onClose}
               className="text-muted hover:text-text text-sm"
             >
               Cancel
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};