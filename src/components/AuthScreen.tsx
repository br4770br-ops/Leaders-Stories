import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail, RefreshCw, ShieldCheck, User as UserIcon } from 'lucide-react';
import { auth } from '../lib/firebase';

type AuthMode = 'login' | 'register' | 'forgot';

interface AuthScreenProps {
  currentUser: User | null;
  onClose?: () => void;
  onVerifiedSuccess?: () => void;
  subtitle?: string;
}

function mapFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please check and try again.';
    case 'auth/user-not-found':
      return 'No account found with this email. Create a new account first.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a minute before trying again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in must be enabled in Firebase Console → Authentication → Sign-in method.';
    default:
      return err instanceof Error ? err.message : 'Authentication failed. Please try again.';
  }
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  currentUser,
  onClose,
  onVerifiedSuccess,
  subtitle,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // If user is signed in with Email+Password but not yet verified
  if (currentUser && !currentUser.emailVerified) {
    const handleCheckVerified = async () => {
      setLoading(true);
      setError(null);
      setInfoMessage(null);
      try {
        await currentUser.reload();
        if (auth.currentUser?.emailVerified) {
          await auth.currentUser.getIdToken(true);
          onVerifiedSuccess?.();
        } else {
          setInfoMessage('Your email is still unverified. Please click the verification link in your inbox (check spam folder too) and try again.');
        }
      } catch (err) {
        setError(mapFirebaseAuthError(err));
      } finally {
        setLoading(false);
      }
    };

    const handleResend = async () => {
      setLoading(true);
      setError(null);
      setInfoMessage(null);
      try {
        await sendEmailVerification(currentUser);
        setInfoMessage(`Verification link sent to ${currentUser.email}.`);
      } catch (err) {
        setError(mapFirebaseAuthError(err));
      } finally {
        setLoading(false);
      }
    };

    const handleSignOut = async () => {
      setLoading(true);
      try {
        await signOut(auth);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-dvh bg-[#0A0A0D] text-white flex flex-col justify-center items-center p-5">
        <div className="w-full max-w-md rounded-3xl bg-[#141419] border border-white/10 p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#E5233D]/15 text-[#E5233D] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">Verify Your Email</h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We sent a verification email to <span className="text-white font-medium">{currentUser.email}</span>. Verify your address to unlock cloud story saving and restore chats across devices.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-300">
              {error}
            </div>
          )}
          {infoMessage && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-xs text-emerald-300">
              {infoMessage}
            </div>
          )}

          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleCheckVerified}
              disabled={loading}
              className="w-full min-h-[48px] rounded-xl bg-[#E5233D] hover:bg-[#cc1e35] disabled:opacity-60 font-semibold text-sm text-white flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Checking...' : "I've Verified My Email"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-medium text-sm text-zinc-200 flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Resend Verification Email
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="w-full min-h-[44px] rounded-xl text-xs text-zinc-400 hover:text-white transition"
            >
              Use a Different Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, trimmedEmail);
        setInfoMessage(`Password reset email sent to ${trimmedEmail}. Check your inbox.`);
      } catch (err) {
        setError(mapFirebaseAuthError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'register') {
      if (!username.trim()) {
        setError('Please choose a display username.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        if (cred.user.emailVerified) {
          onVerifiedSuccess?.();
        }
      } else {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await updateProfile(cred.user, { displayName: username.trim().slice(0, 64) });
        await sendEmailVerification(cred.user);
        setInfoMessage('Account created! Please verify your email using the link sent to your inbox.');
      }
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#0A0A0D] text-white flex flex-col justify-center items-center p-5 relative">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="fixed top-4 left-4 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-white transition"
          aria-label="Back to stories"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <div className="w-full max-w-md rounded-3xl bg-[#141419] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="space-y-1.5">
          <div className="font-editorial text-2xl font-bold tracking-tight">
            LEADERS <span className="text-[#E5233D]">STORIES</span>
          </div>
          <h1 className="font-display text-xl font-bold text-white pt-1">
            {mode === 'login' && 'Sign in to continue your stories'}
            {mode === 'register' && 'Create your story account'}
            {mode === 'forgot' && 'Reset your password'}
          </h1>
          <p className="text-xs text-zinc-400">
            {subtitle ||
              'All stories, chats, relationships, and memories sync permanently to your account.'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}
        {infoMessage && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-xs text-emerald-300">
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your character name"
                  maxLength={64}
                  required
                  className="w-full min-h-[46px] rounded-xl bg-[#0C0C10] border border-white/10 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#E5233D]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full min-h-[46px] rounded-xl bg-[#0C0C10] border border-white/10 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#E5233D]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  className="w-full min-h-[46px] rounded-xl bg-[#0C0C10] border border-white/10 pl-10 pr-11 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#E5233D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                  className="w-full min-h-[46px] rounded-xl bg-[#0C0C10] border border-white/10 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#E5233D]"
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-xs text-zinc-400 hover:text-[#E5233D] transition"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] rounded-xl bg-[#E5233D] hover:bg-[#cc1e35] disabled:opacity-60 font-semibold text-sm text-white transition shadow-lg shadow-[#E5233D]/20"
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Login'
              : mode === 'register'
              ? 'Create Account'
              : 'Send Reset Email'}
          </button>
        </form>

        <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-zinc-400">
          {mode === 'login' ? (
            <>
              <span>New to LEADERS STORIES?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="font-semibold text-white hover:text-[#E5233D] transition"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="font-semibold text-white hover:text-[#E5233D] transition"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
