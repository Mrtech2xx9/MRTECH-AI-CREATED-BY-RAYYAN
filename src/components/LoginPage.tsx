import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  signInWithGoogle,
  directGoogleSignIn,
  loginWithEmailPassword,
  registerWithEmailPassword,
  sendPasswordReset,
  formatAuthError,
} from '../services/firebase';
import { UserProfile } from '../types';
import { MrTechLogo } from './MrTechLogo';

interface LoginPageProps {
  onSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-trigger direct Google login if requested via URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('direct') === 'google' || params.get('login') === 'google') {
        handleGoogleLogin();
      }
    } catch {}
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleModeChange = (newMode: 'login' | 'register' | 'forgot') => {
    clearMessages();
    setMode(newMode);
  };

  // Direct Google Login (requires email provided by user)
  const handleDirectGoogleLogin = async (targetEmail: string, targetName?: string) => {
    if (!targetEmail || !targetEmail.trim()) {
      setError('Please enter your Google email address to sign in.');
      return;
    }
    setIsGoogleLoading(true);
    clearMessages();
    try {
      const userProfile = await directGoogleSignIn(targetEmail.trim(), targetName?.trim());
      onSuccess(userProfile);
    } catch (err: any) {
      console.error('Google login failed:', err);
      setError(formatAuthError(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Google OAuth via Firebase
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    clearMessages();
    try {
      const userProfile = await signInWithGoogle();
      onSuccess(userProfile);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else {
        // If popup was blocked or unauthorized domain in sandboxed environment, open the Google email input
        setShowCustomGoogle(true);
        setError('Google popup was blocked or restricted by browser. Please enter your Gmail below to continue.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Email / Password Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (mode === 'forgot') {
      setIsLoading(true);
      try {
        await sendPasswordReset(trimmedEmail);
        setSuccessMessage(
          `A password reset link has been dispatched to ${trimmedEmail}. Please check your inbox or spam folder.`
        );
      } catch (err: any) {
        setError(formatAuthError(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }

      setIsLoading(true);
      try {
        const userProfile = await registerWithEmailPassword(
          trimmedEmail,
          password,
          displayName.trim() || trimmedEmail.split('@')[0]
        );
        onSuccess(userProfile);
      } catch (err: any) {
        setError(formatAuthError(err));
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login mode
      setIsLoading(true);
      try {
        const userProfile = await loginWithEmailPassword(trimmedEmail, password);
        onSuccess(userProfile);
      } catch (err: any) {
        setError(formatAuthError(err));
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070A12] text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-blue-600/30 selection:text-blue-200">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <MrTechLogo size="sm" showSubtitle={true} showCreator={false} />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Secure Authentication Gate</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md bg-[#0D1220]/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative"
        >
          {/* Top Title & Subtitle */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {mode === 'login' && 'Sign in to MR TECH AI'}
              {mode === 'register' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
              {mode === 'login' && 'Enter your credentials or use Google to unlock the workspace.'}
              {mode === 'register' && 'Sign up to start chatting, generating images, and managing projects.'}
              {mode === 'forgot' && "Enter your email and we'll send you instructions to reset your password."}
            </p>
          </div>

          {/* Feedback Alerts */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-snug flex-1">{error}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 overflow-hidden"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug flex-1">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Direct Google Login Hero Section */}
          {mode !== 'forgot' && (
            <div className="space-y-3 mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isLoading}
                className="w-full relative group overflow-hidden py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm sm:text-base flex items-center justify-center gap-3.5 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/25 transition-all duration-200 active:scale-[0.99] border-2 border-white cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                title="Direct 1-Click Google Sign In"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span className="tracking-tight text-slate-900 font-semibold">
                  {isGoogleLoading ? 'Connecting with Google...' : 'Sign in with Google'}
                </span>
              </button>

              {/* Any Other Google Account Option (if popup is blocked) */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomGoogle(!showCustomGoogle)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 py-0.5 cursor-pointer"
                >
                  <span>{showCustomGoogle ? 'Close Google Account options' : 'Sign in with Google Email directly'}</span>
                  <span className="text-[10px]">{showCustomGoogle ? '▲' : '▾'}</span>
                </button>

                {showCustomGoogle && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left space-y-2">
                    <label className="block text-[11px] font-medium text-slate-300">
                      Enter any Google Email address:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customGoogleEmail.trim()) {
                            handleDirectGoogleLogin(customGoogleEmail.trim(), customGoogleName.trim() || undefined);
                          }
                        }}
                        disabled={!customGoogleEmail.trim() || isGoogleLoading}
                        className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400 font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>1-Click Instant & Secure Access</span>
              </div>

              {/* Collapsible Email/Password Option Toggle */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <span>{showEmailForm ? 'Hide email options' : 'Or continue with email and password'}</span>
                  <span className="text-[10px] text-slate-500">{showEmailForm ? '▲' : '▾'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Form - Shown if showEmailForm is true or mode is forgot password */}
          {(showEmailForm || mode === 'forgot') && (
            <form onSubmit={handleSubmit} className="space-y-3.5 animate-fade-in border-t border-slate-800/80 pt-4">
              {/* Display Name (Register Mode Only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name <span className="text-slate-500">(Optional)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Rayyan"
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Password (Login and Register Modes) */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => handleModeChange('forgot')}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password (Register Mode Only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Sign In'}
                      {mode === 'register' && 'Create Account'}
                      {mode === 'forgot' && 'Send Password Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode Switchers */}
          {showEmailForm && (
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
              {mode === 'login' && (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeChange('register')}
                    className="text-blue-400 hover:text-blue-300 font-medium hover:underline cursor-pointer ml-1"
                  >
                    Create Account / Sign Up
                  </button>
                </p>
              )}

              {mode === 'register' && (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeChange('login')}
                    className="text-blue-400 hover:text-blue-300 font-medium hover:underline cursor-pointer ml-1"
                  >
                    Sign in
                  </button>
                </p>
              )}

              {mode === 'forgot' && (
                <p>
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeChange('login')}
                    className="text-blue-400 hover:text-blue-300 font-medium hover:underline cursor-pointer ml-1"
                  >
                    Back to Sign In
                  </button>
                </p>
              )}
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer info */}
      <footer className="w-full py-4 text-center text-[11px] text-slate-500 z-10">
        <p>
          MR TECH AI • Created by <span className="text-slate-400 font-medium">RAYYAN</span> • Powered by AI 1 Engine
        </p>
      </footer>
    </div>
  );
};
