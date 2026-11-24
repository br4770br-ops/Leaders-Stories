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
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { DEFAULT_APP_SETTINGS, type AppSettingsConfig } from '../types/appConfig';
import { useToast } from './ToastProvider';

type AuthMode = 'login' | 'register' | 'forgot';

interface AuthScreenProps {
  currentUser: User | null;
  appSettings?: AppSettingsConfig;
  onClose?: () => void;
  onVerifiedSuccess?: () => void;
  subtitle?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function mapFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please verify your credentials and try again.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please create a new account first.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Duplicate registrations are not allowed — please log in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters with letters and numbers.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address (e.g., name@gmail.com).';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a minute before trying again.';
    case 'auth/user-disabled':
      return 'This account has been disabled by the administrator.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in must be enabled in Firebase Console -> Authentication -> Sign-in method.';
    default:
      return err instanceof Error ? err.message : 'Authentication failed. Please try again.';
  }
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  currentUser,
  appSettings = DEFAULT_APP_SETTINGS,
  onClose,
  onVerifiedSuccess,
  subtitle,
}) => {
  const { notify } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const registrationsAllowed = appSettings.allowRegistrations !== false;

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
          notify({
            title: 'Email verified',
            description: 'Welcome! Syncing your cloud story account now.',
            variant: 'success',
          });
          onVerifiedSuccess?.();
        } else {
          setInfoMessage(
            'Your email is still unverified. Open the verification link sent to your inbox (and check Spam) then tap Check Verification.'
          );
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
        setInfoMessage(`Verification link resent to ${currentUser.email}.`);
        notify({
          title: 'Verification email sent',
          description: `Check ${currentUser.email}`,
          variant: 'info',
        });
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
        notify({ title: 'Signed out', variant: 'info' });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-center items-center p-5">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#E5233D]/15 text-[#E5233D] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">Verify Your Email</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We sent a verification email to{' '}
              <span className="text-zinc-900 dark:text-white font-semibold">{currentUser.email}</span>.
              Verify your email to activate your account and unlock permanent story syncing.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-600 dark:text-red-300">
              {error}
            </div>
          )}
          {infoMessage && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300">
              {infoMessage}
            </div>
          )}

          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleCheckVerified}
              disabled={loading}
              style={{ backgroundColor: 'var(--app-accent)' }}
              className="w-full min-h-[48px] rounded-xl hover:opacity-90 disabled:opacity-60 font-semibold text-sm text-white flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Checking...' : "I've Verified My Email"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full min-h-[44px] rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 font-medium text-sm text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Resend Verification Email
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="w-full min-h-[44px] rounded-xl text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
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

    const trimmedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid Gmail or email address.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, trimmedEmail);
        const msg = `Password reset email sent to ${trimmedEmail}. Please check your inbox.`;
        setInfoMessage(msg);
        notify({ title: 'Password reset sent', description: trimmedEmail, variant: 'success' });
      } catch (err) {
        const msg = mapFirebaseAuthError(err);
        setError(msg);
        notify({ title: 'Reset failed', description: msg, variant: 'error' });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'register' && !registrationsAllowed) {
      setError(appSettings.registrationClosedMessage || 'New registrations are currently paused.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register') {
      if (username.trim().length < 2) {
        setError('Please enter a display name (at least 2 characters).');
        return;
      }
      if (password !== confirmPassword) {
        setError('Password and Confirm Password do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        if (cred.user.emailVerified) {
          notify({
            title: 'Welcome back',
            description: `Signed in as ${cred.user.email}`,
            variant: 'success',
          });
          onVerifiedSuccess?.();
        }
      } else {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await updateProfile(cred.user, { displayName: username.trim().slice(0, 64) });
        await sendEmailVerification(cred.user);
        setInfoMessage(
          'Registration successful! A verification email has been sent to your inbox. Verify it to continue.'
        );
        notify({
          title: 'Registration successful',
          description: 'Please verify your email address using the link we sent you.',
          variant: 'success',
        });
      }
    } catch (err) {
      const msg = mapFirebaseAuthError(err);
      setError(msg);
      notify({
        title: mode === 'register' ? 'Registration error' : 'Sign in error',
        description: msg,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-center items-center p-5 relative">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="fixed top-4 left-4 min-w-[44px] min-h-[44px] rounded-full bg-zinc-200/80 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/15 flex items-center justify-center text-zinc-900 dark:text-white transition"
          aria-label="Back to stories"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="space-y-1.5">
          <div className="font-editorial text-2xl font-bold tracking-tight">
            {appSettings.appName || 'LEADERS STORIES'}
          </div>
          <h1 className="font-display text-xl font-bold pt-1">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'register' && 'Create a new account'}
            {mode === 'forgot' && 'Reset your password'}
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {subtitle ||
              'All stories, chats, relationships, and memories sync securely to your free account.'}
          </p>
        </div>

        {mode === 'register' && !registrationsAllowed && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{appSettings.registrationClosedMessage}</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-600 dark:text-red-300">
            {error}
          </div>
        )}
        {infoMessage && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300">
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Full Name / Username
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your display name"
                  maxLength={64}
                  disabled={!registrationsAllowed}
                  required
                  className="w-full min-h-[46px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#E5233D] disabled:opacity-50"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                autoComplete="email"
                required
                className="w-full min-h-[46px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#E5233D]"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  disabled={mode === 'register' && !registrationsAllowed}
                  required
                  className="w-full min-h-[46px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 pl-10 pr-11 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#E5233D] disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  disabled={!registrationsAllowed}
                  required
                  className="w-full min-h-[46px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 pl-10 pr-11 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#E5233D] disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
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
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-[#E5233D] transition"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'register' && !registrationsAllowed)}
            style={{ backgroundColor: 'var(--app-accent)' }}
            className="w-full min-h-[48px] rounded-xl hover:opacity-90 disabled:opacity-50 font-semibold text-sm text-white transition shadow-lg"
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Login'
              : mode === 'register'
              ? 'Create Account'
              : 'Send Password Reset Email'}
          </button>
        </form>

        <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {mode === 'login' ? (
            <>
              <span>New to {appSettings.appName || 'LEADERS STORIES'}?</span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="font-semibold text-zinc-900 dark:text-white hover:text-[#E5233D] transition"
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
                className="font-semibold text-zinc-900 dark:text-white hover:text-[#E5233D] transition"
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
