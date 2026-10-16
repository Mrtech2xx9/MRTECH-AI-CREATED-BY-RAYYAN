import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Calendar,
  Key,
  Star,
  Check,
  Copy,
} from 'lucide-react';
import { logoutUser, auth, onAuthStateChanged, syncUserProfile, signInWithGoogle } from '../services/firebase';
import { AuthModal } from './AuthModal';

interface GoogleAuthProps {
  user: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  compact?: boolean;
  onOpenReview?: () => void;
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({
  user,
  onLogin,
  onLogout,
  compact = false,
  onOpenReview,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  // Sync Firebase Auth state on mount & state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          onLogin(profile);
        } catch (err) {
          console.error('Failed to sync user profile from auth state change:', err);
        }
      } else {
        // If Firebase says logged out and we have a user in state, trigger logout
        if (user) {
          onLogout();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Error logging out:', err);
    }
    onLogout();
    setShowProfileMenu(false);
  };

  const copyUid = () => {
    if (user?.uid || user?.id) {
      navigator.clipboard.writeText(user.uid || user.id);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  if (user) {
    const isGoogle = user.providerId === 'google.com';
    return (
      <div className="relative">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all cursor-pointer group"
          >
            <img
              src={user.avatar || user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
              alt={user.name}
              className="w-6 h-6 rounded-full border border-blue-500/50 object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            {!compact && (
              <div className="flex flex-col text-left leading-none max-w-[130px] truncate">
                <span className="text-xs font-semibold text-white truncate">{user.name}</span>
                <span className="text-[10px] text-slate-400 font-mono truncate">{user.email}</span>
              </div>
            )}
            {user.role === 'admin' && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Admin
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform" />
          </button>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Dropdown Details */}
        {showProfileMenu && (
          <div className="absolute right-0 mt-2 w-72 bg-[#0B0F1A] border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 text-slate-200 flex flex-col gap-3">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
              <img
                src={user.avatar || user.photoURL}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-blue-500/40 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{user.name}</div>
                <div className="text-xs text-slate-400 font-mono truncate">{user.email}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {isGoogle ? 'Google Account' : 'Email & Password'}
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                      Verified Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="flex flex-col gap-1.5 text-xs text-slate-400 font-sans">
              <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-900/60 border border-slate-800/50">
                <span className="text-[11px] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  UID:
                </span>
                <button
                  onClick={copyUid}
                  className="font-mono text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  title="Copy UID"
                >
                  <span>{(user.uid || user.id).slice(0, 10)}...</span>
                  {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {user.createdAt && (
                <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    Member since:
                  </span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
              {onOpenReview && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenReview();
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-blue-400" />
                  <span>Write a Review</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-red-950/30 hover:bg-red-950/50 text-red-300 border border-red-900/30 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const [isDirectGoogleSigningIn, setIsDirectGoogleSigningIn] = useState(false);

  const handleDirectGoogleSignIn = async () => {
    setIsDirectGoogleSigningIn(true);
    try {
      const userProfile = await signInWithGoogle();
      onLogin(userProfile);
    } catch (err: any) {
      console.warn('Direct Google Sign In notice:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setShowAuthModal(true);
      }
    } finally {
      setIsDirectGoogleSigningIn(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDirectGoogleSignIn}
        disabled={isDirectGoogleSigningIn}
        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-900 transition-all flex items-center gap-2 shadow-sm border border-slate-200 active:scale-95 cursor-pointer disabled:opacity-70"
        title="Direct 1-Click Google Sign In"
      >
        {isDirectGoogleSigningIn ? (
          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
        <span>{isDirectGoogleSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
      </button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(loggedUser) => {
          onLogin(loggedUser);
          setShowAuthModal(false);
        }}
      />
    </>
  );
};
