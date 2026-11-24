import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import {
  Bookmark,
  Compass,
  Home,
  LogIn,
  LogOut,
  MessageCircle,
  Search,
  ShieldAlert,
  WifiOff,
  Wrench,
} from 'lucide-react';
import { registerSW } from 'virtual:pwa-register';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthScreen } from './components/AuthScreen';
import { BlockedAccountScreen } from './components/BlockedAccountScreen';
import { ChatsView } from './components/ChatsView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeView } from './components/HomeView';
import { LibraryProfileView } from './components/LibraryProfileView';
import { SearchView } from './components/SearchView';
import { StoryChatScreen } from './components/StoryChatScreen';
import { StoryDetailModal } from './components/StoryDetailModal';
import { ToastProvider } from './components/ToastProvider';
import { STORIES_CATALOG } from './data/stories';
import { useOnlineStatus, usePWAInstall } from './hooks/usePWAInstall';
import { auth } from './lib/firebase';
import {
  fetchAppConfig,
  fetchPublishedAdminStories,
  isUserAdmin,
  restoreAllUserCloudData,
  toggleFavoriteStory,
  updateUserLanguageAndProfile,
} from './lib/firestoreService';
import {
  DEFAULT_APP_CONTENT,
  DEFAULT_APP_SETTINGS,
  type AppContentConfig,
  type AppSettingsConfig,
} from './types/appConfig';
import type {
  ConversationSummary,
  FavoriteRecord,
  LanguageCode,
  RelationshipMeterValue,
  StoryDefinition,
  StoryMemoryRecord,
  StoryProgressRecord,
  UserProfileRecord,
} from './types/story';

type MainTab = 'home' | 'search' | 'chats' | 'library';

function LeadersStoriesShell() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [restoringCloud, setRestoringCloud] = useState(false);

  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('hinglish');
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, StoryProgressRecord>>({});
  const [relationshipsMap, setRelationshipsMap] = useState<Record<string, RelationshipMeterValue[]>>({});
  const [memoriesMap, setMemoriesMap] = useState<Record<string, StoryMemoryRecord[]>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBlockedUser, setIsBlockedUser] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  const [appSettings, setAppSettings] = useState<AppSettingsConfig>(DEFAULT_APP_SETTINGS);
  const [appContent, setAppContent] = useState<AppContentConfig>(DEFAULT_APP_CONTENT);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);

  const [customStories, setCustomStories] = useState<StoryDefinition[]>([]);
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [selectedStory, setSelectedStory] = useState<StoryDefinition | null>(null);
  const [activeChatStory, setActiveChatStory] = useState<StoryDefinition | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingActionStory, setPendingActionStory] = useState<StoryDefinition | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const overlayStateRef = useRef({
    hasAdminDashboard: false,
    hasChat: false,
    hasDetail: false,
    hasAuth: false,
    pushedHistoryDepth: 0,
  });

  useEffect(() => {
    overlayStateRef.current.hasAdminDashboard = adminDashboardOpen;
    overlayStateRef.current.hasChat = Boolean(activeChatStory);
    overlayStateRef.current.hasDetail = Boolean(selectedStory);
    overlayStateRef.current.hasAuth = authModalOpen;
  }, [adminDashboardOpen, activeChatStory, selectedStory, authModalOpen]);

  useEffect(() => {
    registerSW({ immediate: true });
  }, []);

  const refreshAppConfig = useCallback(async () => {
    const cfg = await fetchAppConfig();
    setAppSettings(cfg.settings);
    setAppContent(cfg.content);
  }, []);

  useEffect(() => {
    void refreshAppConfig();
  }, [refreshAppConfig]);

  // Apply dynamic Light/Dark theme and accent color controlled by Main Admin
  useEffect(() => {
    document.documentElement.classList.toggle('dark', appSettings.themeMode !== 'light');
    document.documentElement.style.setProperty('--app-accent', appSettings.accentColor || '#E5233D');
    if (appSettings.appName?.trim()) {
      document.title = appSettings.appName.trim();
    }
  }, [appSettings.themeMode, appSettings.accentColor, appSettings.appName]);

  const loadCloudCatalogAndUserData = useCallback(
    async (currentUser: User | null, options?: { silent?: boolean }) => {
      const silent = Boolean(options?.silent);
      if (!silent) {
        try {
          const published = await fetchPublishedAdminStories();
          setCustomStories(published);
        } catch {
          // ignore optional custom story fetch issues
        }
      }

      if (!currentUser || !currentUser.emailVerified) {
        setProfile(null);
        setFavorites([]);
        setConversations([]);
        setProgressMap({});
        setRelationshipsMap({});
        setMemoriesMap({});
        setIsAdmin(false);
        setIsBlockedUser(false);
        setBlockReason('');
        setAdminDashboardOpen(false);
        return;
      }

      if (!silent) {
        setRestoringCloud(true);
      }
      setRestoreError(null);
      try {
        const [restored, adminFlag] = await Promise.all([
          restoreAllUserCloudData(currentUser),
          isUserAdmin(currentUser),
        ]);
        setProfile(restored.profile);
        setPreferredLanguage(restored.language);
        setFavorites(restored.favorites);
        setConversations(restored.conversations);
        setProgressMap(restored.progressMap);
        setRelationshipsMap(restored.relationshipsMap);
        setMemoriesMap(restored.memoriesMap);
        setIsBlockedUser(Boolean(restored.isBlocked));
        setBlockReason(restored.blockReason || '');
        setIsAdmin(adminFlag);
        if (!adminFlag) {
          setAdminDashboardOpen(false);
        }
        if (restored.isBlocked) {
          setActiveChatStory(null);
          setSelectedStory(null);
        }
        if (restored.offlineFallback && !silent) {
          setTimeout(() => {
            if (auth.currentUser && navigator.onLine) {
              void loadCloudCatalogAndUserData(auth.currentUser, { silent: true });
            }
          }, 3000);
        }
      } catch (err) {
        if (!silent) {
          let readable = err instanceof Error ? err.message : 'Unable to restore your cloud story data.';
          try {
            const parsed = JSON.parse(readable) as { error?: string };
            if (parsed.error) readable = parsed.error;
          } catch {
            // keep original readable message
          }
          setRestoreError(readable);
        }
      } finally {
        if (!silent) {
          setRestoringCloud(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      setAuthReady(true);
      void loadCloudCatalogAndUserData(fbUser, { silent: false });
      void refreshAppConfig();
    });
    return () => unsub();
  }, [loadCloudCatalogAndUserData, refreshAppConfig]);

  // Handle Android hardware/browser back button smoothly across nested screens
  useEffect(() => {
    const handlePopState = () => {
      const st = overlayStateRef.current;
      if (st.pushedHistoryDepth > 0) {
        st.pushedHistoryDepth -= 1;
      }
      if (st.hasChat) {
        setActiveChatStory(null);
      } else if (st.hasDetail) {
        setSelectedStory(null);
      } else if (st.hasAuth) {
        setAuthModalOpen(false);
        setPendingActionStory(null);
      } else if (st.hasAdminDashboard) {
        setAdminDashboardOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const pushOverlayHistory = useCallback((view: string) => {
    window.history.pushState({ view }, '');
    overlayStateRef.current.pushedHistoryDepth += 1;
  }, []);

  const closeTopOverlay = useCallback((closeFn: () => void) => {
    if (overlayStateRef.current.pushedHistoryDepth > 0) {
      window.history.back();
    } else {
      closeFn();
    }
  }, []);

  const allStories = useMemo(() => {
    const mergedMap = new Map<string, StoryDefinition>();
    STORIES_CATALOG.forEach((s) => mergedMap.set(s.id, s));
    customStories.forEach((s) => mergedMap.set(s.id, s));
    return Array.from(mergedMap.values());
  }, [customStories]);

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.storyId)), [favorites]);

  const handleToggleFavorite = useCallback(
    async (story: StoryDefinition) => {
      if (!user || !user.emailVerified) {
        pushOverlayHistory('auth');
        setAuthModalOpen(true);
        return;
      }
      const currentlyFav = favoriteIds.has(story.id);
      if (currentlyFav) {
        setFavorites((prev) => prev.filter((f) => f.storyId !== story.id));
      } else {
        setFavorites((prev) => [
          ...prev,
          {
            uid: user.uid,
            storyId: story.id,
            title: story.title,
            coverImage: story.coverImage,
            genre: story.primaryCategory,
          },
        ]);
      }
      try {
        await toggleFavoriteStory(user.uid, story, currentlyFav);
      } catch {
        await loadCloudCatalogAndUserData(user, { silent: true });
      }
    },
    [user, favoriteIds, loadCloudCatalogAndUserData, pushOverlayHistory]
  );

  const handleStartChat = useCallback(
    (story: StoryDefinition) => {
      if (!user || !user.emailVerified) {
        setPendingActionStory(story);
        pushOverlayHistory('auth');
        setAuthModalOpen(true);
        return;
      }
      if (!selectedStory) {
        pushOverlayHistory('chat');
      }
      setSelectedStory(null);
      setActiveChatStory(story);
    },
    [user, selectedStory, pushOverlayHistory]
  );

  const handleSelectStory = useCallback(
    (story: StoryDefinition) => {
      pushOverlayHistory('detail');
      setSelectedStory(story);
    },
    [pushOverlayHistory]
  );

  const handleChangeLanguage = useCallback(
    async (lang: LanguageCode) => {
      setPreferredLanguage(lang);
      if (user && user.emailVerified) {
        await updateUserLanguageAndProfile(user.uid, { preferredLanguage: lang });
      }
    },
    [user]
  );

  const handleOpenAdminDashboard = useCallback(() => {
    if (!user || !isAdmin) return;
    pushOverlayHistory('admin');
    setAdminDashboardOpen(true);
  }, [user, isAdmin, pushOverlayHistory]);

  const handleLocalTurnSync = useCallback(
    (payload: {
      story: StoryDefinition;
      lastMessage: string;
      lastSpeaker: string;
      messageCount: number;
      currentScene: string;
      sceneIndex: number;
      meters: RelationshipMeterValue[];
      choicesMade?: string[];
      endingReached?: string;
      newMemory?: StoryMemoryRecord;
    }) => {
      const uid = user?.uid;
      if (!uid) return;
      const now = Date.now();
      setConversations((prev) => {
        const nextSummary: ConversationSummary = {
          uid,
          conversationId: payload.story.id,
          storyId: payload.story.id,
          storyTitle: payload.story.title,
          coverImage: payload.story.coverImage,
          lastMessage: payload.lastMessage,
          lastSpeaker: payload.lastSpeaker,
          messageCount: payload.messageCount,
          localUpdatedAt: now,
        };
        const rest = prev.filter((c) => c.storyId !== payload.story.id);
        return [nextSummary, ...rest];
      });
      setProgressMap((prev) => ({
        ...prev,
        [payload.story.id]: {
          uid,
          storyId: payload.story.id,
          currentScene: payload.currentScene,
          sceneIndex: payload.sceneIndex,
          status: payload.endingReached ? 'completed' : 'active',
          endingReached: payload.endingReached,
          choicesMade: payload.choicesMade ?? prev[payload.story.id]?.choicesMade ?? [],
          savedCharacterIds: payload.story.characters.map((c) => c.id),
        },
      }));
      setRelationshipsMap((prev) => ({
        ...prev,
        [payload.story.id]: payload.meters,
      }));
      if (payload.newMemory) {
        const mem = payload.newMemory;
        setMemoriesMap((prev) => ({
          ...prev,
          [payload.story.id]: [...(prev[payload.story.id] || []), mem],
        }));
      }
    },
    [user?.uid]
  );

  // Loading state while auth boots or user's cloud data is restoring after login/reinstall
  if (!authReady || restoringCloud) {
    return (
      <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="font-editorial text-2xl font-bold tracking-tight">
          {appSettings.appName}
        </div>
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--app-accent)', borderTopColor: 'transparent' }}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {restoringCloud
            ? 'Restoring your chats, story progress, and relationships...'
            : 'Loading your story world...'}
        </p>
      </div>
    );
  }

  // Enforce blocked user screen immediately across refreshes & devices
  if (user && user.emailVerified && isBlockedUser) {
    return (
      <BlockedAccountScreen
        email={user.email}
        reason={blockReason}
        appSettings={appSettings}
      />
    );
  }

  // Enforce verification screen immediately if logged in with unverified email
  if (user && !user.emailVerified) {
    return (
      <AuthScreen
        currentUser={user}
        appSettings={appSettings}
        onVerifiedSuccess={() => {
          void loadCloudCatalogAndUserData(auth.currentUser);
        }}
      />
    );
  }

  // Auth modal if triggered from Chat now / Favourite / Login / Maintenance Sign In
  if (authModalOpen) {
    return (
      <AuthScreen
        currentUser={user}
        appSettings={appSettings}
        subtitle="Sign in with Email & Password so your conversations and choices sync permanently."
        onClose={() =>
          closeTopOverlay(() => {
            setAuthModalOpen(false);
            setPendingActionStory(null);
          })
        }
        onVerifiedSuccess={() => {
          setAuthModalOpen(false);
          if (pendingActionStory && (!appSettings.maintenanceMode || isAdmin)) {
            const st = pendingActionStory;
            setPendingActionStory(null);
            setSelectedStory(null);
            pushOverlayHistory('chat');
            setActiveChatStory(st);
          } else {
            setPendingActionStory(null);
          }
        }}
      />
    );
  }

  // Maintenance Mode Gate for non-admin users (Main Admin retains full access & can always sign in)
  if (appSettings.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {appSettings.appName} — Maintenance
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {appSettings.maintenanceMessage ||
                'We are performing scheduled improvements. Stories will be right back online shortly.'}
            </p>
          </div>
          {appSettings.supportEmail && (
            <div className="rounded-xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 p-3 text-xs text-zinc-600 dark:text-zinc-300">
              Need help? Contact{' '}
              <span className="font-semibold text-zinc-900 dark:text-white">
                {appSettings.supportEmail}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-2.5">
            {!user ? (
              <button
                type="button"
                onClick={() => {
                  pushOverlayHistory('auth');
                  setAuthModalOpen(true);
                }}
                className="flex-1 min-h-[46px] rounded-xl bg-[var(--app-accent)] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
              >
                <LogIn className="w-4 h-4" />
                Sign In (Admin / User)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void signOut(auth)}
                className="flex-1 min-h-[46px] rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user.email})
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dedicated Main Admin Dashboard (verified via backend + Firebase Auth)
  if (adminDashboardOpen && user && isAdmin) {
    return (
      <AdminDashboard
        user={user}
        appSettings={appSettings}
        appContent={appContent}
        customStories={customStories}
        totalStoriesCount={allStories.length}
        onBackToApp={() => closeTopOverlay(() => setAdminDashboardOpen(false))}
        onConfigUpdated={refreshAppConfig}
        onStoriesUpdated={async () => {
          const published = await fetchPublishedAdminStories().catch(() => []);
          setCustomStories(published);
        }}
      />
    );
  }

  // Active Interactive Multi-Character Chat Screen
  if (activeChatStory && user && user.emailVerified) {
    return (
      <StoryChatScreen
        story={activeChatStory}
        user={user}
        preferredLanguage={preferredLanguage}
        existingProgress={progressMap[activeChatStory.id]}
        existingMeters={relationshipsMap[activeChatStory.id]}
        existingMemories={memoriesMap[activeChatStory.id] || []}
        enableVoiceInput={appSettings.enableVoiceInput}
        enableAiSuggestions={appSettings.enableAiSuggestions}
        onBack={() => closeTopOverlay(() => setActiveChatStory(null))}
        onOpenStoryInfo={(st) => {
          setActiveChatStory(null);
          setSelectedStory(st);
        }}
        onChangeLanguage={(lang) => {
          void handleChangeLanguage(lang);
        }}
        onLocalTurnSync={handleLocalTurnSync}
        onDataUpdated={() => loadCloudCatalogAndUserData(user, { silent: true })}
      />
    );
  }

  // Story Detail Screen
  if (selectedStory) {
    return (
      <StoryDetailModal
        story={selectedStory}
        isFavorite={favoriteIds.has(selectedStory.id)}
        hasExistingChat={conversations.some((c) => c.storyId === selectedStory.id)}
        onBack={() => closeTopOverlay(() => setSelectedStory(null))}
        onToggleFavorite={(st) => void handleToggleFavorite(st)}
        onStartChat={handleStartChat}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {!isOnline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-amber-500/95 text-black text-xs font-semibold flex items-center gap-1.5 shadow-lg">
          <WifiOff className="w-3.5 h-3.5" />
          Offline — Cached stories available
        </div>
      )}

      {appSettings.maintenanceMode && isAdmin && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-center gap-2 text-center">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            Maintenance Mode is ON (visible only to Main Admin). Normal users see the maintenance notice.
          </span>
        </div>
      )}

      {restoreError && (
        <div className="bg-red-500/15 border-b border-red-500/30 px-4 py-2 text-xs text-red-700 dark:text-red-200 text-center">
          {restoreError}
        </div>
      )}

      {activeTab === 'home' && (
        <HomeView
          stories={allStories}
          favoriteIds={favoriteIds}
          conversations={conversations}
          userDisplayName={profile?.username || user?.displayName || user?.email || undefined}
          isSignedIn={Boolean(user && user.emailVerified)}
          isAdmin={isAdmin}
          appSettings={appSettings}
          appContent={appContent}
          isInstallable={isInstallable}
          onInstallApp={() => void install()}
          onOpenSearch={() => setActiveTab('search')}
          onOpenProfile={() => setActiveTab('library')}
          onOpenAdminDashboard={handleOpenAdminDashboard}
          onSelectStory={handleSelectStory}
          onResumeConversation={handleStartChat}
          onToggleFavorite={(st) => void handleToggleFavorite(st)}
        />
      )}

      {activeTab === 'search' && (
        <SearchView
          stories={allStories}
          favoriteIds={favoriteIds}
          onSelectStory={handleSelectStory}
          onToggleFavorite={(st) => void handleToggleFavorite(st)}
        />
      )}

      {activeTab === 'chats' && (
        <ChatsView
          isSignedIn={Boolean(user && user.emailVerified)}
          stories={allStories}
          conversations={conversations}
          progressMap={progressMap}
          appContent={appContent}
          onOpenAuth={() => {
            pushOverlayHistory('auth');
            setAuthModalOpen(true);
          }}
          onResumeStory={handleStartChat}
          onExploreHome={() => setActiveTab('home')}
        />
      )}

      {activeTab === 'library' && (
        <LibraryProfileView
          user={user}
          profile={profile}
          preferredLanguage={preferredLanguage}
          stories={allStories}
          favorites={favorites}
          conversations={conversations}
          progressMap={progressMap}
          isAdmin={isAdmin}
          appSettings={appSettings}
          appContent={appContent}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          isIOS={isIOS}
          onInstallApp={() => void install()}
          onOpenAuth={() => {
            pushOverlayHistory('auth');
            setAuthModalOpen(true);
          }}
          onOpenAdminDashboard={handleOpenAdminDashboard}
          onSelectStory={handleSelectStory}
          onResumeStory={handleStartChat}
          onToggleFavorite={(st) => void handleToggleFavorite(st)}
          onChangeLanguage={handleChangeLanguage}
          onProfileUpdated={async () => {
            const published = await fetchPublishedAdminStories().catch(() => []);
            if (published.length > 0) setCustomStories(published);
            await loadCloudCatalogAndUserData(user, { silent: true });
          }}
        />
      )}

      {/* Fixed 4-Tab Bottom Navigation (Free Experience — No Store/Coins/VIP) */}
      <nav
        aria-label="Primary navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0D0D11]/95 backdrop-blur-xl border-t border-zinc-200 dark:border-white/[0.08] pb-safe"
      >
        <div className="max-w-xl mx-auto grid grid-cols-4 h-16 items-center">
          {(
            [
              { id: 'home', label: 'Home', icon: Home, activeIcon: Compass },
              { id: 'search', label: 'Search', icon: Search, activeIcon: Search },
              { id: 'chats', label: 'Chats', icon: MessageCircle, activeIcon: MessageCircle },
              { id: 'library', label: 'Library', icon: Bookmark, activeIcon: Bookmark },
            ] as const
          ).map((item) => {
            const active = activeTab === item.id;
            const IconComp = active ? item.activeIcon : item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition ${
                  active
                    ? 'text-zinc-950 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <IconComp
                  className={`w-5 h-5 transition-transform ${active ? 'scale-105' : ''}`}
                  style={active ? { color: 'var(--app-accent)' } : undefined}
                />
                <span
                  className={`text-[11px] font-medium ${
                    active ? 'text-zinc-950 dark:text-white' : 'text-zinc-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <LeadersStoriesShell />
      </ToastProvider>
    </ErrorBoundary>
  );
}
