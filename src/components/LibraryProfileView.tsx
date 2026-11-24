import React, { useEffect, useMemo, useState } from 'react';
import { signOut, updateProfile, type User } from 'firebase/auth';
import {
  Check,
  CheckCircle2,
  Download,
  Globe,
  Heart,
  LogIn,
  LogOut,
  Shield,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import { auth } from '../lib/firebase';
import {
  deleteAccountAndCloudData,
  updateUserLanguageAndProfile,
} from '../lib/firestoreService';
import type {
  ConversationSummary,
  FavoriteRecord,
  LanguageCode,
  StoryDefinition,
  StoryProgressRecord,
  UserProfileRecord,
} from '../types/story';
import { AdminStudioModal } from './AdminStudioModal';
import { StoryCard } from './StoryCard';
import { StoryImage } from './StoryImage';

interface LibraryProfileViewProps {
  user: User | null;
  profile: UserProfileRecord | null;
  preferredLanguage: LanguageCode;
  stories: StoryDefinition[];
  customStories: StoryDefinition[];
  favorites: FavoriteRecord[];
  conversations: ConversationSummary[];
  progressMap: Record<string, StoryProgressRecord>;
  isAdmin: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstallApp: () => void;
  onOpenAuth: () => void;
  onSelectStory: (story: StoryDefinition) => void;
  onResumeStory: (story: StoryDefinition) => void;
  onToggleFavorite: (story: StoryDefinition) => void;
  onChangeLanguage: (lang: LanguageCode) => Promise<void>;
  onProfileUpdated: () => Promise<void>;
}

type LibraryTab = 'favorites' | 'active' | 'completed' | 'characters';

export const LibraryProfileView: React.FC<LibraryProfileViewProps> = ({
  user,
  profile,
  preferredLanguage,
  stories,
  customStories,
  favorites,
  conversations,
  progressMap,
  isAdmin,
  isInstallable,
  isInstalled,
  isIOS,
  onInstallApp,
  onOpenAuth,
  onSelectStory,
  onResumeStory,
  onToggleFavorite,
  onChangeLanguage,
  onProfileUpdated,
}) => {
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('favorites');
  const [editingName, setEditingName] = useState(false);
  const [usernameInput, setUsernameInput] = useState(profile?.username || user?.displayName || '');
  const [savingName, setSavingName] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [adminOpen, setAdminOpen] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (!editingName) {
      setUsernameInput(profile?.username || user?.displayName || '');
    }
  }, [profile?.username, user?.displayName, editingName]);

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

  const handleSaveUsername = async () => {
    if (!user || !usernameInput.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(user, { displayName: usernameInput.trim().slice(0, 64) });
      await updateUserLanguageAndProfile(user.uid, { username: usernameInput.trim() });
      setEditingName(false);
      await onProfileUpdated();
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccountAndCloudData(user, deletePassword);
      setDeleteModalOpen(false);
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

  return (
    <div className="min-h-dvh bg-[#0A0A0D] text-white pb-24">
      <header className="sticky top-0 z-30 bg-[#0A0A0D]/95 backdrop-blur-xl border-b border-white/[0.06] pt-safe px-4 h-14 flex items-center">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Library & Profile</h1>
          {!isInstalled && (isInstallable || isIOS) && (
            <button
              type="button"
              onClick={isInstallable ? onInstallApp : () => setShowIOSGuide(true)}
              className="min-h-[36px] px-3.5 rounded-full bg-[#E5233D] text-xs font-semibold text-white inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Install Fullscreen App
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Account Card */}
        {!user ? (
          <section className="rounded-3xl bg-[#141419] border border-white/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">Guest Reader</h2>
                <p className="text-xs text-zinc-400">
                  All stories are 100% free. Sign in to save favourites and sync progress across devices.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="min-h-[44px] px-5 rounded-full bg-[#E5233D] hover:bg-[#cc1e35] text-sm font-semibold text-white inline-flex items-center gap-2 shrink-0"
            >
              <LogIn className="w-4 h-4" />
              Login / Register
            </button>
          </section>
        ) : (
          <section className="rounded-3xl bg-[#141419] border border-white/10 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E5233D] to-[#7F1D1D] flex items-center justify-center font-display text-xl font-bold text-white shrink-0">
                  {(profile?.username || user.displayName || user.email || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="space-y-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        maxLength={64}
                        className="rounded-xl bg-[#0C0C10] border border-white/15 px-3 py-1.5 text-sm text-white"
                      />
                      <button
                        type="button"
                        onClick={handleSaveUsername}
                        disabled={savingName}
                        className="min-w-[36px] min-h-[36px] rounded-xl bg-[#E5233D] flex items-center justify-center text-white"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-lg font-bold text-white truncate">
                        {profile?.username || user.displayName || 'Storyteller'}
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setUsernameInput(profile?.username || user.displayName || '');
                          setEditingName(true);
                        }}
                        className="text-xs text-[#F43F5E] hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  <div className="text-xs text-zinc-400 truncate">{user.email}</div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cloud sync active — safe across reinstall
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setAdminOpen(true)}
                    className="min-h-[40px] px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white inline-flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#F43F5E]" />
                    Admin Studio
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="min-h-[40px] px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 inline-flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="min-h-[40px] px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-300 inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Account
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="pt-4 border-t border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                <Globe className="w-4 h-4 text-[#E5233D]" />
                <span>Preferred Story Language</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0C0C10] border border-white/10">
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
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      preferredLanguage === item.id
                        ? 'bg-[#E5233D] text-white'
                        : 'text-zinc-400 hover:text-white'
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
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-white/[0.08] pb-2">
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
                    ? 'bg-white text-[#0A0A0D]'
                    : 'bg-[#15151B] text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {libraryTab === 'favorites' && (
            favoriteStories.length === 0 ? (
              <div className="rounded-2xl bg-[#141419] border border-white/[0.06] p-8 text-center text-xs text-zinc-400">
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
            )
          )}

          {libraryTab === 'active' && (
            activeStories.length === 0 ? (
              <div className="rounded-2xl bg-[#141419] border border-white/[0.06] p-8 text-center text-xs text-zinc-400">
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
            )
          )}

          {libraryTab === 'completed' && (
            completedStories.length === 0 ? (
              <div className="rounded-2xl bg-[#141419] border border-white/[0.06] p-8 text-center text-xs text-zinc-400">
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
            )
          )}

          {libraryTab === 'characters' && (
            savedCharacters.length === 0 ? (
              <div className="rounded-2xl bg-[#141419] border border-white/[0.06] p-8 text-center text-xs text-zinc-400">
                Characters from stories you start will appear here with their roles.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedCharacters.map(({ character, story }) => (
                  <button
                    key={`${story.id}-${character.id}`}
                    type="button"
                    onClick={() => onResumeStory(story)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#141419] hover:bg-[#1C1C23] border border-white/[0.06] text-left transition"
                  >
                    <StoryImage
                      src={character.portrait}
                      alt={character.name}
                      className="w-14 h-16 rounded-xl object-cover object-top shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold text-white truncate">
                        {character.name}
                      </div>
                      <div className="text-xs text-[#F43F5E] truncate">{character.role}</div>
                      <div className="text-[11px] text-zinc-400 truncate">{story.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}
        </section>
      </main>

      {/* Delete Account Re-Auth Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleDeleteAccount}
            className="w-full max-w-sm rounded-3xl bg-[#16161C] border border-white/10 p-6 space-y-4"
          >
            <h3 className="font-display text-lg font-bold text-white">Delete Account Permanently</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This removes your profile, chats, memories, relationships, and favourites permanently. Enter your password to confirm.
            </p>
            {deleteError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
                {deleteError}
              </div>
            )}
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Current password"
              required
              className="w-full min-h-[44px] rounded-xl bg-[#0C0C10] border border-white/10 px-3.5 text-sm text-white"
            />
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeletePassword('');
                  setDeleteError(null);
                }}
                className="flex-1 min-h-[44px] rounded-xl bg-white/10 text-xs font-semibold text-white"
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
          <div className="w-full max-w-sm rounded-3xl bg-[#16161C] border border-white/10 p-6 space-y-3">
            <h3 className="font-display text-lg font-bold">Install LEADERS STORIES</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              1. Tap the browser <strong>Share</strong> or <strong>3-dot menu</strong>.<br />
              2. Tap <strong>Add to Home Screen</strong> or <strong>Install App</strong> to launch full-screen like a native Android/iOS app.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full min-h-[44px] rounded-xl bg-[#E5233D] text-xs font-semibold text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {adminOpen && user && (
        <AdminStudioModal
          user={user}
          customStories={customStories}
          onClose={() => setAdminOpen(false)}
          onSaved={onProfileUpdated}
        />
      )}
    </div>
  );
};
