import React from 'react';
import { signOut } from 'firebase/auth';
import { Ban, LogOut, Mail } from 'lucide-react';
import { auth } from '../lib/firebase';
import type { AppSettingsConfig } from '../types/appConfig';
import { useToast } from './ToastProvider';

interface BlockedAccountScreenProps {
  email?: string | null;
  reason?: string;
  appSettings: AppSettingsConfig;
}

export const BlockedAccountScreen: React.FC<BlockedAccountScreenProps> = ({
  email,
  reason,
  appSettings,
}) => {
  const { notify } = useToast();

  const handleLogout = async () => {
    await signOut(auth);
    notify({ title: 'Signed out', variant: 'info' });
  };

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#141419] border border-red-500/30 p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center">
          <Ban className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight">Account Blocked</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Access for <span className="font-semibold text-zinc-900 dark:text-white">{email || 'this account'}</span> has been temporarily restricted by the Main Admin.
          </p>
        </div>

        {reason && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3.5 space-y-1">
            <div className="text-[11px] font-semibold text-red-500">Reason</div>
            <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed">{reason}</p>
          </div>
        )}

        {appSettings.supportEmail && (
          <div className="rounded-xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 p-3.5 text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2.5">
            <Mail className="w-4 h-4 shrink-0 mt-0.5 text-zinc-400" />
            <div>
              <div className="font-semibold text-zinc-900 dark:text-white">Need assistance?</div>
              <p className="mt-0.5">Contact support at {appSettings.supportEmail}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="w-full min-h-[46px] rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};
