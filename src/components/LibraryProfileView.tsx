import React, { useEffect, useMemo, useState } from 'react';
import { sendPasswordResetEmail, signOut, updateProfile, type User } from 'firebase/auth';
import {
  Check,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  Globe,
  Heart,
  HelpCircle,
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  Shield,
  Trash2,
  User as UserIcon,
  X,
} from 'lucide-react';
import { auth } from '../lib/firebase';
import {
  changeUserPassword,
  deleteAccountAndCloudData,
  toMillis,
  updateUserLanguageAndProfile,
} from '../lib/firestoreService';
import type { AppContentConfig, AppSettingsConfig } from '../types/appConfig';
import type {
  ConversationSummary,
  FavoriteRecord,
  LanguageCode,
  StoryDefinition,
  StoryProgressRecord,
  UserProfileRecord,
} from '../types/story';
import { StoryCard } from './StoryCard';
import { StoryImage } from './StoryImage';
import { useToast } from './ToastProvider';

interface LibraryProfileViewProps {
  user: User | null;
  profile: UserProfileRecord | null;
  preferredLanguage: LanguageCode;
  stories: StoryDefinition[];
  favorites: FavoriteRecord[];
  conversations: ConversationSummary[];
  progressMap: Record<string, StoryProgressRecord>;
  isAdmin: boolean;
  appSettings: AppSettingsConfig;
  appContent: AppContentConfig;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstallApp: () => void;
  onOpenAuth: () => void;
  onOpenAdminDashboard: () => void;
  onSelectStory: (story: StoryDefinition) => void;
  onResumeStory: (story: StoryDefinition) => void;
  onToggleFavorite: (story: StoryDefinition) => void;
  onChangeLanguage: (lang: LanguageCode) => Promise<void>;
  onProfileUpdated: () => Promise<void>;
}

type LibraryTab = 'favorites' | 'active' | 'completed' | 'characters';

function formatMemberSince(profileCreatedAt: unknown, metadataCreationTime?: string): string {
  const ms = toMillis(profileCreatedAt);
  if (ms > 0) {
    return new Date(ms).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  if (metadataCreationTime) {
    const parsed = Date.parse(metadataCreationTime);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  return 'Active member';
}

export const LibraryProfileView: React.FC<LibraryProfileViewProps> = ({
  user,
  profile,
  preferredLanguage,
  stories,
  favorites,
  conversations,
  progressMap,
  isAdmin,
  appSettings,
  appContent,
  isInstallable,
  isInstalled,
  isIOS,
  onInstallApp,
  onOpenAuth,
  onOpenAdminDashboard,
  onSelectStory,
  onResumeStory,
  onToggleFavorite,
  onChangeLanguage,
  onProfileUpdated,
}) => {
  const { notify } = useToast();
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('favorites');

  // Edit profile state
  const [editingProfile, setEditingProfile] = useState(false);
  const [usernameInput, setUsernameInput] = useState(profile?.username || user?.displayName || '');
  const [photoUrlInput, setPhotoUrlInput] = useState(profile?.avatarUrl || user?.photoURL || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Delete account modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (!editingProfile) {
      setUsernameInput(profile?.username || user?.displayName || '');
      setPhotoUrlInput(profile?.avatarUrl || user?.photoURL || '');
    }
  }, [profile?.username, profile?.avatarUrl, user?.displayName, user?.photoURL, editingProfile]);

  const storyMap = useMemo(() => new Map(stories.map((s) => [s.id, s])), [stories]);
  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.storyId)), [favorites]);

  const favoriteStories = useMemo(
    () =>
      favorites
        .map((f) => storyMap.get(f.storyId))
        .filter((s): s is StoryDefinition => Boolean(s)),
    [favorites, storyMap]
  );

  const activeStories = useMemo(
    () =>
      conversations
        .filter((c) => progressMap[c.storyId]?.status !== 'completed')
        .map((c) => storyMap.get(c.storyId))
        .filter((s): s is StoryDefinition => Boolean(s)),
    [conversations, progressMap, storyMap]
  );

  const completedStories = useMemo(
    () =>
      Object.values(progressMap)
        .filter((p) => p.status === 'completed')
        .map((p) => storyMap.get(p.storyId))
        .filter((s): s is StoryDefinition => Boolean(s)),
    [progressMap, storyMap]
  );

  const savedCharacters = useMemo(() => {
    const list: { character: StoryDefinition['characters'][0]; story: StoryDefinition }[] = [];
    Object.keys(progressMap).forEach((storyId) => {
      const st = storyMap.get(storyId);
      if (st) {
        st.characters.forEach((ch) => list.push({ character: ch, story: st }));
      }
    });
    return list;
  }, [progressMap, storyMap]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !usernameInput.trim()) return;
    const cleanUrl = photoUrlInput.trim();
    if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
      notify({
        title: 'Invalid Photo URL',
        description: 'Profile photo URL must start with https:// or http://',
        variant: 'error',
      });
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile(user, {
        displayName: usernameInput.trim().slice(0, 64),
        photoURL: cleanUrl.slice(0, 512),
      });
      await updateUserLanguageAndProfile(user.uid, {
        username: usernameInput.trim(),
        avatarUrl: cleanUrl,
      });
      setEditingProfile(false);
      await onProfileUpdated();
      notify({
        title: 'Profile updated',
        description: 'Your display name and profile photo are saved.',
        variant: 'success',
      });
    } catch (err) {
      notify({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Unable to save profile changes.',
        variant: 'error',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await changeUserPassword(user, currentPassword, newPassword);
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      notify({
        title: 'Password changed',
        description: 'Your account password has been updated securely.',
        variant: 'success',
      });
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : 'Could not verify your current password. Please check and try again.'
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      notify({
        title: 'Password reset email sent',
        description: `Check ${user.email} for the reset link.`,
        variant: 'info',
      });
    } catch (err) {
      notify({
        title: 'Unable to send reset email',
        description: err instanceof Error ? err.message : 'Try again later.',
        variant: 'error',
      });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    notify({ title: 'Signed out', description: 'You have been logged out safely.', variant: 'info' });
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccountAndCloudData(user, deletePassword);
      setDeleteModalOpen(false);
      notify({ title: 'Account deleted', variant: 'info' });
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Could not verify password or delete account. Please check your password.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const activeAvatarUrl = profile?.avatarUrl || user?.photoURL || '';

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] pb-24">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0A0A0D]/95 backdrop-blur-xl border-b border-zinc-200 dark:border-white/[0.06] pt-safe px-4 h-14 flex items-center">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Library & Account</h1>
          {!isInstalled && (isInstallable || isIOS) && (
            <button
              type="button"
              onClick={isInstallable ? onInstallApp : () => setShowIOSGuide(true)}
              style={{ backgroundColor: 'var(--app-accent)' }}
              className="min-h-[36px] px-3.5 rounded-full text-xs font-semibold text-white inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Install App
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Account Card */}
        {!user ? (
          <section className="rounded-3xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h2 className="font-display text-lg font-bold">{appContent.guestPromptTitle}</h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md">
                  {appContent.guestPromptSubtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              style={{ backgroundColor: 'var(--app-accent)' }}
              className="min-h-[44px] px-5 rounded-full hover:opacity-90 text-sm font-semibold text-white inline-flex items-center gap-2 shrink-0"
            >
              <LogIn className="w-4 h-4" />
              Login / Register
            </button>
          </section>
        ) : (
          <section className="rounded-3xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                {activeAvatarUrl ? (
                  <img
                    src={activeAvatarUrl}
                    alt={profile?.username || 'Profile'}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border border-zinc-200 dark:border-white/15 shrink-0"
                  />
                ) : (
                  <div
                    style={{ backgroundColor: 'var(--app-accent)' }}
                    className="w-14 h-14 rounded-full flex items-center justify-center font-display text-xl font-bold text-white shrink-0"
                  >
                    {(profile?.username || user.displayName || user.email || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-bold truncate">
                      {profile?.username || user.displayName || 'Storyteller'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditingProfile((prev) => !prev)}
                      className="text-xs font-semibold text-[#E5233D] hover:underline"
                    >
                      {editingProfile ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  <div className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                    {user.email}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Account
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Role: {isAdmin ? 'Main Admin' : 'User'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      Joined {formatMemberSince(profile?.createdAt, user.metadata.creationTime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={onOpenAdminDashboard}
                    style={{ backgroundColor: 'var(--app-accent)' }}
                    className="min-h-[40px] px-4 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 shadow-sm hover:opacity-90 transition"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Dashboard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(true)}
                  className="min-h-[40px] px-3.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Password
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="min-h-[40px] px-3.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="min-h-[40px] px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-xs font-semibold text-red-600 dark:text-red-300 inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>

            {/* Inline Edit Display Name & Profile Photo URL */}
            {editingProfile && (
              <form
                onSubmit={handleSaveProfile}
                className="pt-4 border-t border-zinc-200 dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div>
                  <label className="text-[11px] font-medium text-zinc-500">Display Name</label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    maxLength={64}
                    required
                    className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/15 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-500">
                    Profile Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    placeholder="https://..."
                    maxLength={512}
                    className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/15 px-3 text-sm"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="min-h-[38px] px-4 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{ backgroundColor: 'var(--app-accent)' }}
                    className="min-h-[38px] px-4 rounded-xl text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            )}

            {/* Language Selector */}
            <div className="pt-4 border-t border-zinc-200 dark:border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Globe className="w-4 h-4 text-[#E5233D]" />
                <span>Preferred Story Language</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10">
                {(
                  [
                    { id: 'hinglish', label: 'Hinglish' },
                    { id: 'hindi', label: 'Hindi' },
                    { id: 'english', label: 'English' },
                  ] as { id: LanguageCode; label: string }[]
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void onChangeLanguage(item.id)}
                    style={
                      preferredLanguage === item.id
                        ? { backgroundColor: 'var(--app-accent)' }
                        : undefined
                    }
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      preferredLanguage === item.id
                        ? 'text-white'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Personal Library Tabs */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-zinc-200 dark:border-white/[0.08] pb-2">
            {(
              [
                { id: 'favorites', label: `Favourites (${favoriteStories.length})` },
                { id: 'active', label: `Continue Reading (${activeStories.length})` },
                { id: 'completed', label: `Completed (${completedStories.length})` },
                { id: 'characters', label: `Saved Characters (${savedCharacters.length})` },
              ] as { id: LibraryTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLibraryTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                  libraryTab === tab.id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-[#0A0A0D]'
                    : 'bg-zinc-200/70 dark:bg-[#15151B] text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {libraryTab === 'favorites' &&
            (favoriteStories.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/[0.06] p-8 text-center text-xs text-zinc-500">
                <Heart className="w-6 h-6 text-[#E5233D]/60 mx-auto mb-2" />
                Tap the heart icon on any story cover to save it here.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {favoriteStories.map((st) => (
                  <StoryCard
                    key={st.id}
                    story={st}
                    isFavorite={favoriteIds.has(st.id)}
                    onSelect={onSelectStory}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            ))}

          {libraryTab === 'active' &&
            (activeStories.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/[0.06] p-8 text-center text-xs text-zinc-500">
                No in-progress stories yet. Start chatting in any story!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {activeStories.map((st) => (
                  <StoryCard
                    key={st.id}
                    story={st}
                    isFavorite={favoriteIds.has(st.id)}
                    onSelect={onResumeStory}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            ))}

          {libraryTab === 'completed' &&
            (completedStories.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/[0.06] p-8 text-center text-xs text-zinc-500">
                Reach a dramatic ending in any story to unlock it in Completed.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {completedStories.map((st) => (
                  <StoryCard
                    key={st.id}
                    story={st}
                    isFavorite={favoriteIds.has(st.id)}
                    onSelect={onResumeStory}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            ))}

          {libraryTab === 'characters' &&
            (savedCharacters.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/[0.06] p-8 text-center text-xs text-zinc-500">
                Characters from stories you start will appear here with their roles.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedCharacters.map(({ character, story }) => (
                  <button
                    key={`${story.id}-${character.id}`}
                    type="button"
                    onClick={() => onResumeStory(story)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-[#141419] hover:bg-zinc-100 dark:hover:bg-[#1C1C23] border border-zinc-200 dark:border-white/[0.06] text-left transition"
                  >
                    <StoryImage
                      src={character.portrait}
                      alt={character.name}
                      className="w-14 h-16 rounded-xl object-cover object-top shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold truncate">
                        {character.name}
                      </div>
                      <div className="text-xs text-[#F43F5E] truncate">{character.role}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{story.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
        </section>

        {/* Help, Support & Platform Details */}
        <section className="rounded-3xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-5 space-y-3">
          <div className="flex items-center gap-2 font-display text-sm font-bold">
            <HelpCircle className="w-4 h-4 text-[#E5233D]" />
            Help & Support
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {appContent.helpGuideText}
          </p>
          {(appSettings.supportEmail || appSettings.supportNote) && (
            <div className="pt-2 border-t border-zinc-200 dark:border-white/[0.07] text-xs text-zinc-600 dark:text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>{appSettings.supportNote}</span>
              {appSettings.supportEmail && (
                <a
                  href={`mailto:${appSettings.supportEmail}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#E5233D] hover:underline shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {appSettings.supportEmail}
                </a>
              )}
            </div>
          )}
          <div className="text-[11px] text-zinc-500 pt-1">{appContent.footerNote}</div>
        </section>
      </main>

      {/* Change Password Modal */}
      {passwordModalOpen && user && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleChangePassword}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#16161C] border border-zinc-200 dark:border-white/10 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Change Password</h3>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="min-w-[34px] min-h-[34px] rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-500">
                {passwordError}
              </div>
            )}

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  required
                  className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((p) => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 characters)"
                required
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
              />
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => void handleSendPasswordReset()}
              className="text-xs text-[#E5233D] hover:underline"
            >
              Signed in with Google or forgot password? Send reset email instead
            </button>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="flex-1 min-h-[42px] rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingPassword}
                style={{ backgroundColor: 'var(--app-accent)' }}
                className="flex-1 min-h-[42px] rounded-xl text-xs font-semibold text-white"
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Account Re-Auth Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleDeleteAccount}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#16161C] border border-zinc-200 dark:border-white/10 p-6 space-y-4"
          >
            <h3 className="font-display text-lg font-bold">Delete Account Permanently</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This removes your profile, chats, memories, relationships, and favourites permanently. Enter your password to confirm.
            </p>
            {deleteError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-500">
                {deleteError}
              </div>
            )}
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Current password"
              required
              className="w-full min-h-[44px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
            />
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeletePassword('');
                  setDeleteError(null);
                }}
                className="flex-1 min-h-[44px] rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deleting}
                className="flex-1 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white"
              >
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#16161C] border border-zinc-200 dark:border-white/10 p-6 space-y-3">
            <h3 className="font-display text-lg font-bold">Install {appSettings.appName}</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              1. Tap the browser <strong>Share</strong> or <strong>3-dot menu</strong>.<br />
              2. Tap <strong>Add to Home Screen</strong> or <strong>Install App</strong> to launch full-screen like a native Android/iOS app.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              style={{ backgroundColor: 'var(--app-accent)' }}
              className="w-full min-h-[44px] rounded-xl text-xs font-semibold text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
