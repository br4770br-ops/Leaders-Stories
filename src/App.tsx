import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Bookmark, Compass, Home, MessageCircle, Search, WifiOff } from 'lucide-react';
import { registerSW } from 'virtual:pwa-register';
import { AuthScreen } from './components/AuthScreen';
import { ChatsView } from './components/ChatsView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeView } from './components/HomeView';
import { LibraryProfileView } from './components/LibraryProfileView';
import { SearchView } from './components/SearchView';
import { StoryChatScreen } from './components/StoryChatScreen';
import { StoryDetailModal } from './components/StoryDetailModal';
import { STORIES_CATALOG } from './data/stories';
import { useOnlineStatus, usePWAInstall } from './hooks/usePWAInstall';
import { auth } from './lib/firebase';
import {
  fetchPublishedAdminStories,
  isUserAdmin,
  restoreAllUserCloudData,
  toggleFavoriteStory,
  updateUserLanguageAndProfile,
} from './lib/firestoreService';
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
    hasChat: false,
    hasDetail: false,
    hasAuth: false,
    pushedHistoryDepth: 0,
  });

  useEffect(() => {
    overlayStateRef.current.hasChat = Boolean(activeChatStory);
    overlayStateRef.current.hasDetail = Boolean(selectedStory);
    overlayStateRef.current.hasAuth = authModalOpen;
  }, [activeChatStory, selectedStory, authModalOpen]);

  useEffect(() => {
    registerSW({ immediate: true });
  }, []);

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
        setIsAdmin(adminFlag);
      } catch (err) {
        if (!silent) {
          setRestoreError(
            err instanceof Error ? err.message : 'Unable to restore your cloud story data.'
          );
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
    });
    return () => unsub();
  }, [loadCloudCatalogAndUserData]);

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

  // Loading state while auth boots or user's cloud data is restoring after login/reinstall
  if (!authReady || restoringCloud) {
    return (
      <div className="min-h-dvh bg-[#0A0A0D] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="font-editorial text-2xl font-bold tracking-tight">
          LEADERS <span className="text-[#E5233D]">STORIES</span>
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-[#E5233D] border-t-transparent animate-spin" />
        <p className="text-xs text-zinc-400">
          {restoringCloud
            ? 'Restoring your chats, story progress, and relationships...'
            : 'Loading your story world...'}
        </p>
      </div>
    );
  }

  // Enforce verification screen immediately if logged in with unverified email
  if (user && !user.emailVerified) {
    return (
      <AuthScreen
        currentUser={user}
        onVerifiedSuccess={() => {
          void loadCloudCatalogAndUserData(auth.currentUser);
        }}
      />
    );
  }

  // Auth modal if triggered from Chat now / Favourite / Login
  if (authModalOpen) {
    return (
      <AuthScreen
        currentUser={user}
        subtitle="Sign in with Email & Password so your conversations and choices sync permanently."
        onClose={() =>
          closeTopOverlay(() => {
            setAuthModalOpen(false);
            setPendingActionStory(null);
          })
        }
        onVerifiedSuccess={() => {
          setAuthModalOpen(false);
          if (pendingActionStory) {
            const st = pendingActionStory;
            setPendingActionStory(null);
            setSelectedStory(null);
            pushOverlayHistory('chat');
            setActiveChatStory(st);
          }
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
        onBack={() => closeTopOverlay(() => setActiveChatStory(null))}
        onOpenStoryInfo={(st) => {
          setActiveChatStory(null);
          setSelectedStory(st);
        }}
        onChangeLanguage={(lang) => {
          void handleChangeLanguage(lang);
        }}
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
    <div className="min-h-dvh bg-[#0A0A0D] text-white">
      {!isOnline && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-amber-500/95 text-black text-xs font-semibold flex items-center gap-1.5 shadow-lg">
          <WifiOff className="w-3.5 h-3.5" />
          Offline — Cached stories available
        </div>
      )}

      {restoreError && (
        <div className="bg-red-500/15 border-b border-red-500/30 px-4 py-2 text-xs text-red-200 text-center">
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
          isInstallable={isInstallable}
          onInstallApp={() => void install()}
          onOpenSearch={() => setActiveTab('search')}
          onOpenProfile={() => setActiveTab('library')}
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
          onOpenAuth={() => setAuthModalOpen(true)}
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
          customStories={customStories}
          favorites={favorites}
          conversations={conversations}
          progressMap={progressMap}
          isAdmin={isAdmin}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          isIOS={isIOS}
          onInstallApp={() => void install()}
          onOpenAuth={() => setAuthModalOpen(true)}
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
        className="fixed bottom-0 inset-x-0 z-40 bg-[#0D0D11]/95 backdrop-blur-xl border-t border-white/[0.08] pb-safe"
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
                  active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <IconComp
                  className={`w-5 h-5 transition-transform ${
                    active ? 'text-[#E5233D] scale-105' : ''
                  }`}
                />
                <span className={`text-[11px] font-medium ${active ? 'text-white' : 'text-zinc-500'}`}>
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
      <LeadersStoriesShell />
    </ErrorBoundary>
  );
}
