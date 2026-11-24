import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { signOut, updateProfile, type User } from 'firebase/auth';
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  LayoutDashboard,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  User as UserIcon,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { auth, MAIN_ADMIN_EMAIL } from '../lib/firebase';
import {
  changeUserPassword,
  fetchAllUsersForAdmin,
  isMainAdminEmail,
  saveAppContent,
  saveAppSettings,
  setUserBlockStatus,
  toMillis,
  updateUserLanguageAndProfile,
} from '../lib/firestoreService';
import {
  ACCENT_COLOR_PRESETS,
  DEFAULT_APP_CONTENT,
  DEFAULT_APP_SETTINGS,
  type AnnouncementType,
  type AppContentConfig,
  type AppSettingsConfig,
} from '../types/appConfig';
import type { StoryDefinition, UserProfileRecord } from '../types/story';
import { AdminStudioModal } from './AdminStudioModal';
import { useToast } from './ToastProvider';

export type AdminSection =
  | 'overview'
  | 'users'
  | 'blocked'
  | 'search'
  | 'settings'
  | 'content'
  | 'announcements'
  | 'profile';

interface AdminDashboardProps {
  user: User;
  appSettings: AppSettingsConfig;
  appContent: AppContentConfig;
  customStories: StoryDefinition[];
  totalStoriesCount: number;
  onBackToApp: () => void;
  onConfigUpdated: () => Promise<void>;
  onStoriesUpdated: () => Promise<void>;
}

const PAGE_SIZE = 10;

function formatDateLabel(ts: unknown): string {
  const ms = toMillis(ts);
  if (!ms) return 'N/A';
  return new Date(ms).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTimeLabel(ts: unknown): string {
  const ms = toMillis(ts);
  if (!ms) return 'N/A';
  return new Date(ms).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  appSettings,
  appContent,
  customStories,
  totalStoriesCount,
  onBackToApp,
  onConfigUpdated,
  onStoriesUpdated,
}) => {
  const { notify } = useToast();

  // Backend admin verification state
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [verifiedAdmin, setVerifiedAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Navigation & mobile drawer
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [storyStudioOpen, setStoryStudioOpen] = useState(false);

  // Users state
  const [users, setUsers] = useState<UserProfileRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserProfileRecord | null>(null);

  // Block/Unblock confirmation modal
  const [blockModalTarget, setBlockModalTarget] = useState<{
    user: UserProfileRecord;
    shouldBlock: boolean;
  } | null>(null);
  const [blockReason, setBlockReason] = useState('Violation of community guidelines');
  const [processingBlock, setProcessingBlock] = useState(false);

  // Settings & Announcements draft state
  const [settingsDraft, setSettingsDraft] = useState<AppSettingsConfig>(appSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [confirmResetSettingsOpen, setConfirmResetSettingsOpen] = useState(false);

  // Content management draft state
  const [contentDraft, setContentDraft] = useState<AppContentConfig>(appContent);
  const [savingContent, setSavingContent] = useState(false);
  const [confirmResetContentOpen, setConfirmResetContentOpen] = useState(false);
  const [showContentPreview, setShowContentPreview] = useState(true);

  // Admin Profile & Password state
  const [adminDisplayName, setAdminDisplayName] = useState(user.displayName || 'Main Admin');
  const [savingAdminName, setSavingAdminName] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    setSettingsDraft(appSettings);
  }, [appSettings]);

  useEffect(() => {
    setContentDraft(appContent);
  }, [appContent]);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const list = await fetchAllUsersForAdmin();
      setUsers(list);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Unable to fetch user records.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Verify Main Admin credentials against backend /api/admin/session
  useEffect(() => {
    let active = true;
    async function verifyAdmin() {
      setVerifyingSession(true);
      setAuthError(null);
      try {
        if (!user.emailVerified || !isMainAdminEmail(user.email)) {
          throw new Error('Only the verified Main Admin account can access this dashboard.');
        }
        const token = await user.getIdToken(true);
        const resp = await fetch('/api/admin/session', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await resp.json()) as { isAdmin?: boolean; error?: string };
        if (!resp.ok || !data.isAdmin) {
          throw new Error(data.error || 'Server denied Main Admin access.');
        }
        if (active) {
          setVerifiedAdmin(true);
          void loadUsers();
        }
      } catch (err) {
        if (active) {
          setVerifiedAdmin(false);
          setAuthError(err instanceof Error ? err.message : 'Unauthorized access.');
        }
      } finally {
        if (active) setVerifyingSession(false);
      }
    }
    void verifyAdmin();
    return () => {
      active = false;
    };
  }, [user, loadUsers]);

  // Derived stats
  const stats = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const total = users.length;
    const blocked = users.filter((u) => u.status === 'blocked').length;
    const active = total - blocked;
    const recent = users.filter((u) => {
      const ms = toMillis(u.createdAt);
      return ms > 0 && now - ms <= sevenDaysMs;
    }).length;
    return { total, active, blocked, recent };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = users.filter((u) => {
      const statusMatch =
        statusFilter === 'all' ||
        (statusFilter === 'blocked' ? u.status === 'blocked' : u.status !== 'blocked');
      if (!statusMatch) return false;
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q)
      );
    });
    return [...filtered].sort((a, b) => {
      const ta = toMillis(a.createdAt);
      const tb = toMillis(b.createdAt);
      return sortOrder === 'newest' ? tb - ta : ta - tb;
    });
  }, [users, searchQuery, statusFilter, sortOrder]);

  const blockedUsersList = useMemo(
    () => users.filter((u) => u.status === 'blocked'),
    [users]
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(
    () => filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredUsers, currentPage]
  );

  const handleConfirmBlockAction = async () => {
    if (!blockModalTarget) return;
    setProcessingBlock(true);
    try {
      await setUserBlockStatus(
        user,
        blockModalTarget.user,
        blockModalTarget.shouldBlock,
        blockReason
      );
      notify({
        title: blockModalTarget.shouldBlock ? 'User blocked' : 'User unblocked',
        description: `${blockModalTarget.user.email} is now ${
          blockModalTarget.shouldBlock ? 'blocked' : 'active'
        }.`,
        variant: blockModalTarget.shouldBlock ? 'warning' : 'success',
      });
      setBlockModalTarget(null);
      await loadUsers();
    } catch (err) {
      notify({
        title: 'Action failed',
        description: err instanceof Error ? err.message : 'Unable to update user status.',
        variant: 'error',
      });
    } finally {
      setProcessingBlock(false);
    }
  };

  const handleSaveSettings = async (override?: AppSettingsConfig) => {
    setSavingSettings(true);
    try {
      const target = override || settingsDraft;
      await saveAppSettings(user, target);
      await onConfigUpdated();
      notify({
        title: 'Settings saved',
        description: 'Application settings updated across the platform.',
        variant: 'success',
      });
    } catch (err) {
      notify({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Unable to save app settings.',
        variant: 'error',
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveContent = async (override?: AppContentConfig) => {
    setSavingContent(true);
    try {
      const target = override || contentDraft;
      await saveAppContent(user, target);
      await onConfigUpdated();
      notify({
        title: 'Content published',
        description: 'Live copy and welcome text updated.',
        variant: 'success',
      });
    } catch (err) {
      notify({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Unable to save content.',
        variant: 'error',
      });
    } finally {
      setSavingContent(false);
    }
  };

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminDisplayName.trim()) return;
    setSavingAdminName(true);
    try {
      await updateProfile(user, { displayName: adminDisplayName.trim().slice(0, 64) });
      await updateUserLanguageAndProfile(user.uid, { username: adminDisplayName.trim() });
      notify({ title: 'Admin profile updated', variant: 'success' });
    } catch (err) {
      notify({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Unable to update profile.',
        variant: 'error',
      });
    } finally {
      setSavingAdminName(false);
    }
  };

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) {
      notify({ title: 'Weak password', description: 'Use at least 6 characters.', variant: 'error' });
      return;
    }
    if (newPw !== confirmPw) {
      notify({ title: 'Password mismatch', description: 'New passwords do not match.', variant: 'error' });
      return;
    }
    setChangingPw(true);
    try {
      await changeUserPassword(user, currentPw, newPw);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      notify({
        title: 'Password updated',
        description: 'Your Firebase login password has been changed securely.',
        variant: 'success',
      });
    } catch (err) {
      notify({
        title: 'Password change failed',
        description: err instanceof Error ? err.message : 'Verify your current password and try again.',
        variant: 'error',
      });
    } finally {
      setChangingPw(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    notify({ title: 'Signed out', variant: 'info' });
    onBackToApp();
  };

  if (verifyingSession) {
    return (
      <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#E5233D] border-t-transparent animate-spin" />
        <p className="text-xs text-zinc-500">Verifying Main Admin credentials...</p>
      </div>
    );
  }

  if (!verifiedAdmin) {
    return (
      <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#141419] border border-red-500/30 p-7 space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="font-display text-xl font-bold">Unauthorized Access</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {authError || `Admin Dashboard is restricted exclusively to ${MAIN_ADMIN_EMAIL}.`}
          </p>
          <button
            type="button"
            onClick={onBackToApp}
            className="w-full min-h-[44px] rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold"
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  const navItems: { id: AdminSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'blocked', label: 'Blocked Users', icon: Ban },
    { id: 'search', label: 'User Search', icon: Search },
    { id: 'settings', label: 'App Settings', icon: Settings },
    { id: 'content', label: 'Content Management', icon: FileText },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-zinc-200 dark:border-white/10">
        <div className="font-editorial text-lg font-bold tracking-tight">
          {appSettings.appName}
        </div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
          Main Admin Console
        </div>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveSection(item.id);
                setMobileNavOpen(false);
              }}
              className={`w-full min-h-[42px] px-3 rounded-xl text-sm font-medium flex items-center justify-between gap-2.5 transition whitespace-nowrap ${
                active
                  ? 'bg-[#E5233D] text-white shadow-sm'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06]'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>
              {item.id === 'blocked' && stats.blocked > 0 && (
                <span
                  className={`text-[11px] tabular-nums font-semibold ${
                    active ? 'text-white/90' : 'text-red-500'
                  }`}
                >
                  {stats.blocked}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-zinc-200 dark:border-white/10 space-y-1.5">
        <button
          type="button"
          onClick={onBackToApp}
          className="w-full min-h-[42px] px-3 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] flex items-center gap-2.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Story App
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full min-h-[42px] px-3 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] text-[var(--text-primary)] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-zinc-200 dark:border-white/10 bg-white dark:bg-[#111116] flex-col sticky top-0 h-dvh">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative w-72 max-w-[82vw] bg-white dark:bg-[#111116] h-full border-r border-zinc-200 dark:border-white/10 z-10">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close admin menu"
              className="absolute top-3 right-3 min-w-[36px] min-h-[36px] rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0A0A0D]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open admin menu"
              className="lg:hidden min-w-[40px] min-h-[40px] rounded-xl bg-zinc-100 dark:bg-white/10 flex items-center justify-center"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold truncate">
              Admin Dashboard <span className="text-zinc-400 mx-1.5">/</span>{' '}
              <span className="capitalize">
                {navItems.find((n) => n.id === activeSection)?.label || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setStoryStudioOpen(true)}
              className="min-h-[36px] px-3.5 rounded-xl bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/15 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#E5233D]" />
              Story Studio
            </button>
            <button
              type="button"
              onClick={() => void loadUsers()}
              disabled={loadingUsers}
              className="min-h-[36px] px-3 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap hover:bg-zinc-100 dark:hover:bg-white/5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
          {usersError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-600 dark:text-red-300">
              {usersError}
            </div>
          )}

          {/* 1. OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight">Platform Overview</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Live user metrics, account moderation, and application configuration for {appSettings.appName}.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: stats.total, sub: 'Registered in Firestore' },
                  { label: 'Active Users', value: stats.active, sub: 'Unrestricted access' },
                  { label: 'Blocked Users', value: stats.blocked, sub: 'Suspended accounts' },
                  { label: 'Recent (7 Days)', value: stats.recent, sub: `${totalStoriesCount} stories live` },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-4 space-y-1"
                  >
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{card.label}</div>
                    <div className="font-display text-2xl font-bold tabular-nums">{card.value}</div>
                    <div className="text-[11px] text-zinc-500">{card.sub}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-bold">Recent Registrations</h2>
                  <button
                    type="button"
                    onClick={() => setActiveSection('users')}
                    className="text-xs font-semibold text-[#E5233D] hover:underline"
                  >
                    View all users
                  </button>
                </div>

                {loadingUsers ? (
                  <div className="space-y-2">
                    <div className="h-10 rounded-xl bg-zinc-100 dark:bg-white/5 animate-pulse" />
                    <div className="h-10 rounded-xl bg-zinc-100 dark:bg-white/5 animate-pulse" />
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-xs text-zinc-500">No registered users in Firestore yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-500">
                          <th className="py-2.5 pr-4 font-semibold">User</th>
                          <th className="py-2.5 pr-4 font-semibold">Role</th>
                          <th className="py-2.5 pr-4 font-semibold">Status</th>
                          <th className="py-2.5 text-right font-semibold">Registered</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                        {users.slice(0, 6).map((u) => (
                          <tr key={u.uid}>
                            <td className="py-2.5 pr-4">
                              <div className="font-medium">{u.username}</div>
                              <div className="text-[11px] text-zinc-500">{u.email}</div>
                            </td>
                            <td className="py-2.5 pr-4">
                              {isMainAdminEmail(u.email) ? 'Main Admin' : 'User'}
                            </td>
                            <td className="py-2.5 pr-4">
                              {u.status === 'blocked' ? (
                                <span className="text-red-500 font-semibold">Blocked</span>
                              ) : (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 text-right tabular-nums text-zinc-500">
                              {formatDateLabel(u.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. USERS & 3. BLOCKED USERS & 4. USER SEARCH */}
          {(activeSection === 'users' ||
            activeSection === 'blocked' ||
            activeSection === 'search') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">
                    {activeSection === 'blocked'
                      ? 'Blocked Users'
                      : activeSection === 'search'
                      ? 'User Search & Lookup'
                      : 'User Management'}
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {activeSection === 'blocked'
                      ? 'Accounts currently suspended from story chat, Firestore writes, and API actions.'
                      : 'Search, inspect, filter, and manage user access. Passwords are never stored or visible.'}
                  </p>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by email, name, or UID..."
                    className="w-full min-h-[42px] rounded-xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 pl-10 pr-4 text-sm focus:outline-none focus:border-[#E5233D]"
                  />
                </div>

                {activeSection !== 'blocked' && (
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as 'all' | 'active' | 'blocked');
                      setPage(1);
                    }}
                    aria-label="Filter by status"
                    className="min-h-[42px] rounded-xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 px-3.5 text-xs font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="blocked">Blocked Only</option>
                  </select>
                )}

                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                  aria-label="Sort by registration date"
                  className="min-h-[42px] rounded-xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 px-3.5 text-xs font-medium"
                >
                  <option value="newest">Newest Registered</option>
                  <option value="oldest">Oldest Registered</option>
                </select>
              </div>

              {/* User Table */}
              <div className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-500 bg-zinc-50 dark:bg-white/[0.02]">
                        <th className="py-3 px-4 font-semibold">User</th>
                        <th className="py-3 px-4 font-semibold">Role</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold">Registered</th>
                        <th className="py-3 px-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                      {(activeSection === 'blocked'
                        ? blockedUsersList.filter((u) => {
                            const q = searchQuery.trim().toLowerCase();
                            return (
                              !q ||
                              u.email.toLowerCase().includes(q) ||
                              u.username.toLowerCase().includes(q)
                            );
                          })
                        : paginatedUsers
                      ).map((u) => {
                        const isSelfOrAdmin = u.uid === user.uid || isMainAdminEmail(u.email);
                        const isBlocked = u.status === 'blocked';
                        return (
                          <tr
                            key={u.uid}
                            className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="font-semibold">{u.username}</div>
                              <div className="text-[11px] text-zinc-500">{u.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              {isMainAdminEmail(u.email) ? (
                                <span className="font-semibold text-[#E5233D]">Main Admin</span>
                              ) : (
                                <span>User</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {isBlocked ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-red-500">
                                  <Ban className="w-3.5 h-3.5" /> Blocked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                  <UserCheck className="w-3.5 h-3.5" /> Active
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 tabular-nums text-zinc-500">
                              {formatDateLabel(u.createdAt)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedUserDetail(u)}
                                  className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 text-[11px] font-semibold"
                                >
                                  Details
                                </button>
                                {!isSelfOrAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBlockReason(
                                        isBlocked
                                          ? ''
                                          : u.blockedReason || 'Violation of community guidelines'
                                      );
                                      setBlockModalTarget({ user: u, shouldBlock: !isBlocked });
                                    }}
                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                                      isBlocked
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                  >
                                    {isBlocked ? 'Unblock' : 'Block'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {(activeSection === 'blocked' ? blockedUsersList : paginatedUsers).length ===
                        0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-zinc-500">
                            {loadingUsers
                              ? 'Loading users...'
                              : activeSection === 'blocked'
                              ? 'No blocked users right now.'
                              : 'No users matched your search or filter.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {activeSection !== 'blocked' && filteredUsers.length > PAGE_SIZE && (
                  <div className="px-4 py-3 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between text-xs text-zinc-500">
                    <span className="tabular-nums">
                      Page {currentPage} of {totalPages} · {filteredUsers.length} users
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 disabled:opacity-40"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 disabled:opacity-40"
                        aria-label="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. APP SETTINGS */}
          {activeSection === 'settings' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">App Settings</h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Control branding, registration rules, feature toggles, and Light/Dark theme globally.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSettingsDraft(appSettings)}
                    className="min-h-[38px] px-3.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetSettingsOpen(true)}
                    className="min-h-[38px] px-3.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSaveSettings()}
                    disabled={savingSettings}
                    className="min-h-[38px] px-4 rounded-xl bg-[#E5233D] text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" /> {savingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* General Settings */}
                <section className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-5 space-y-4">
                  <h2 className="font-display text-base font-bold">General Settings</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-500">Application Name</label>
                      <input
                        type="text"
                        value={settingsDraft.appName}
                        onChange={(e) =>
                          setSettingsDraft((s) => ({ ...s, appName: e.target.value }))
                        }
                        maxLength={80}
                        className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500">App Description</label>
                      <input
                        type="text"
                        value={settingsDraft.appSubtitle}
                        onChange={(e) =>
                          setSettingsDraft((s) => ({ ...s, appSubtitle: e.target.value }))
                        }
                        maxLength={200}
                        className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500">Logo URL (Optional)</label>
                      <input
                        type="url"
                        value={settingsDraft.logoUrl}
                        onChange={(e) =>
                          setSettingsDraft((s) => ({ ...s, logoUrl: e.target.value }))
                        }
                        placeholder="https://..."
                        maxLength={512}
                        className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500">Support Email</label>
                      <input
                        type="email"
                        value={settingsDraft.supportEmail}
                        onChange={(e) =>
                          setSettingsDraft((s) => ({ ...s, supportEmail: e.target.value }))
                        }
                        maxLength={254}
                        className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500">Support Note</label>
                      <textarea
                        rows={2}
                        value={settingsDraft.supportNote}
                        onChange={(e) =>
                          setSettingsDraft((s) => ({ ...s, supportNote: e.target.value }))
                        }
                        maxLength={500}
                        className="mt-1 w-full rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 p-3 text-sm"
                      />
                    </div>
                  </div>
                </section>

                {/* User & Appearance Settings */}
                <div className="space-y-5">
                  <section className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-5 space-y-4">
                    <h2 className="font-display text-base font-bold">User & Feature Settings</h2>
                    <label className="flex items-center justify-between gap-3 cursor-pointer">
                      <div>
                        <div className="text-sm font-medium">Allow New Registrations</div>
                        <div className="text-xs text-zinc-500">
                          Pause to stop new signups while keeping existing logins active.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsDraft.allowRegistrations}
                        onChange={(e) =>
                          setSettingsDraft((s) => ({ ...s, allowRegistrations: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#E5233D]"
                      />
                    </label>
                    {!settingsDraft.allowRegistrations && (
                      <input
                        type="text"
                        value={settingsDraft.registrationClosedMessage}
                        onChange={(e) =>
                          setSettingsDraft((s) => ({
                            ...s,
                            registrationClosedMessage: e.target.value,
                          }))
                        }
                        placeholder="Registration paused message"
                        className="w-full min-h-[40px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3 text-xs"
                      />
                    )}
                    <label className="flex items-center justify-between gap-3 cursor-pointer">
                      <div>
                        <div className="text-sm font-medium">Enable Voice Input (Mic)</div>
                        <div className="text-xs text-zinc-500">Allow speech-to-text in story chat.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsDraft.enableVoiceInput}
                        onChange={(e) =>
                          setSettingsDraft((s) => ({ ...s, enableVoiceInput: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#E5233D]"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 cursor-pointer">
                      <div>
                        <div className="text-sm font-medium">Enable AI Suggested Replies</div>
                        <div className="text-xs text-zinc-500">Show lightbulb suggestion ideas in chat.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsDraft.enableAiSuggestions}
                        onChange={(e) =>
                          setSettingsDraft((s) => ({ ...s, enableAiSuggestions: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#E5233D]"
                      />
                    </label>
                  </section>

                  <section className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-5 space-y-4">
                    <h2 className="font-display text-base font-bold">Appearance Settings</h2>
                    <div className="grid grid-cols-2 gap-2">
                      {(['dark', 'light'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setSettingsDraft((s) => ({ ...s, themeMode: mode }))}
                          className={`min-h-[42px] rounded-xl border text-xs font-semibold capitalize transition ${
                            settingsDraft.themeMode === mode
                              ? 'border-[#E5233D] bg-[#E5233D]/10 text-[#E5233D]'
                              : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          {mode} Mode
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-zinc-500">Primary Accent Color</div>
                      <div className="flex flex-wrap items-center gap-2">
                        {ACCENT_COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() =>
                              setSettingsDraft((s) => ({ ...s, accentColor: preset.value }))
                            }
                            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                              settingsDraft.accentColor.toLowerCase() === preset.value.toLowerCase()
                                ? 'border-zinc-900 dark:border-white font-semibold'
                                : 'border-zinc-200 dark:border-white/10'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: preset.value }}
                            />
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* 6. CONTENT MANAGEMENT */}
          {activeSection === 'content' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">Content Management</h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Edit welcome notices, homepage titles, help text, and manage custom stories.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowContentPreview((v) => !v)}
                    className="min-h-[38px] px-3.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold"
                  >
                    {showContentPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentDraft(appContent)}
                    className="min-h-[38px] px-3.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetContentOpen(true)}
                    className="min-h-[38px] px-3.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSaveContent()}
                    disabled={savingContent}
                    className="min-h-[38px] px-4 rounded-xl bg-[#E5233D] text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" /> {savingContent ? 'Saving...' : 'Save Content'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-5 space-y-3.5">
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Welcome Heading</label>
                    <input
                      type="text"
                      value={contentDraft.welcomeHeading}
                      onChange={(e) =>
                        setContentDraft((c) => ({ ...c, welcomeHeading: e.target.value }))
                      }
                      maxLength={140}
                      className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Welcome Subheading</label>
                    <textarea
                      rows={2}
                      value={contentDraft.welcomeSubheading}
                      onChange={(e) =>
                        setContentDraft((c) => ({ ...c, welcomeSubheading: e.target.value }))
                      }
                      maxLength={400}
                      className="mt-1 w-full rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 p-3 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-zinc-500">Hero Label</label>
                      <input
                        type="text"
                        value={contentDraft.heroBadgeText}
                        onChange={(e) =>
                          setContentDraft((c) => ({ ...c, heroBadgeText: e.target.value }))
                        }
                        maxLength={80}
                        className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-zinc-500">Featured Section Title</label>
                      <input
                        type="text"
                        value={contentDraft.homeFeaturedTitle}
                        onChange={(e) =>
                          setContentDraft((c) => ({ ...c, homeFeaturedTitle: e.target.value }))
                        }
                        maxLength={100}
                        className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Guest Prompt Title</label>
                    <input
                      type="text"
                      value={contentDraft.guestPromptTitle}
                      onChange={(e) =>
                        setContentDraft((c) => ({ ...c, guestPromptTitle: e.target.value }))
                      }
                      maxLength={140}
                      className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Guest Prompt Subtitle</label>
                    <textarea
                      rows={2}
                      value={contentDraft.guestPromptSubtitle}
                      onChange={(e) =>
                        setContentDraft((c) => ({ ...c, guestPromptSubtitle: e.target.value }))
                      }
                      maxLength={400}
                      className="mt-1 w-full rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Help & Support Guide</label>
                    <textarea
                      rows={3}
                      value={contentDraft.helpGuideText}
                      onChange={(e) =>
                        setContentDraft((c) => ({ ...c, helpGuideText: e.target.value }))
                      }
                      maxLength={1500}
                      className="mt-1 w-full rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 p-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Footer Note</label>
                    <input
                      type="text"
                      value={contentDraft.footerNote}
                      onChange={(e) =>
                        setContentDraft((c) => ({ ...c, footerNote: e.target.value }))
                      }
                      maxLength={300}
                      className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                    />
                  </div>
                </div>

                {showContentPreview && (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-5 space-y-4">
                      <div className="text-xs font-semibold text-[#E5233D] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Live Preview
                      </div>
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-zinc-500">
                          {contentDraft.heroBadgeText}
                        </div>
                        <h3 className="font-display text-lg font-bold">
                          {contentDraft.welcomeHeading}
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {contentDraft.welcomeSubheading}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-zinc-200 dark:border-white/10 space-y-1">
                        <div className="text-xs font-semibold">{contentDraft.guestPromptTitle}</div>
                        <p className="text-xs text-zinc-500">{contentDraft.guestPromptSubtitle}</p>
                      </div>
                      <div className="pt-3 border-t border-zinc-200 dark:border-white/10 space-y-1">
                        <div className="text-xs font-semibold">Help Guide</div>
                        <p className="text-xs text-zinc-500">{contentDraft.helpGuideText}</p>
                      </div>
                      <div className="pt-3 border-t border-zinc-200 dark:border-white/10 text-[11px] text-zinc-500">
                        {contentDraft.footerNote}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-5 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-display text-sm font-bold">Story Catalog Studio</div>
                        <p className="text-xs text-zinc-500">
                          Create or update custom cloud stories ({customStories.length} published).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStoryStudioOpen(true)}
                        className="px-4 py-2 rounded-xl bg-[#E5233D] text-white text-xs font-semibold shrink-0"
                      >
                        Manage Stories
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. ANNOUNCEMENTS */}
          {activeSection === 'announcements' && (
            <div className="space-y-5 max-w-3xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight">
                    Announcements & Maintenance
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Publish live announcement banners or activate Maintenance Mode across the app.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSaveSettings()}
                  disabled={savingSettings}
                  className="min-h-[38px] px-4 rounded-xl bg-[#E5233D] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> {savingSettings ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <section className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-5 space-y-4">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold">Show Announcement Banner</div>
                    <div className="text-xs text-zinc-500">
                      Visible on the Home and Profile screens for all users.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.announcementEnabled}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({ ...s, announcementEnabled: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#E5233D]"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Banner Title</label>
                    <input
                      type="text"
                      value={settingsDraft.announcementTitle}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({ ...s, announcementTitle: e.target.value }))
                      }
                      maxLength={120}
                      className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Banner Style</label>
                    <select
                      value={settingsDraft.announcementType}
                      onChange={(e) =>
                        setSettingsDraft((s) => ({
                          ...s,
                          announcementType: e.target.value as AnnouncementType,
                        }))
                      }
                      className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                    >
                      <option value="info">Info Notice</option>
                      <option value="success">Release / Success</option>
                      <option value="warning">Important Warning</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-500">Announcement Message</label>
                  <textarea
                    rows={2}
                    value={settingsDraft.announcementMessage}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({ ...s, announcementMessage: e.target.value }))
                    }
                    maxLength={500}
                    className="mt-1 w-full rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 p-3 text-sm"
                  />
                </div>
              </section>

              <section className="rounded-2xl bg-white dark:bg-[#141419] border border-amber-500/30 p-5 space-y-4">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold">Maintenance Mode</div>
                      <div className="text-xs text-zinc-500">
                        Temporarily blocks non-admin AI story turns & displays maintenance notice.
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.maintenanceMode}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({ ...s, maintenanceMode: e.target.checked }))
                    }
                    className="w-4 h-4 accent-[#E5233D]"
                  />
                </label>

                <div>
                  <label className="text-xs font-medium text-zinc-500">Maintenance Message</label>
                  <textarea
                    rows={2}
                    value={settingsDraft.maintenanceMessage}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({ ...s, maintenanceMessage: e.target.value }))
                    }
                    maxLength={500}
                    className="mt-1 w-full rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 p-3 text-sm"
                  />
                </div>
              </section>
            </div>
          )}

          {/* 8. ADMIN PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight">Main Admin Profile</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Verified administrator identity and credential management.
                </p>
              </div>

              <section className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#E5233D] text-white font-display text-xl font-bold flex items-center justify-center">
                    {(adminDisplayName || user.email || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-display text-base font-bold">{user.email}</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" /> Verified Main Admin · Protected Account
                    </div>
                    <div className="text-[11px] text-zinc-500 tabular-nums">
                      UID: {user.uid}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveAdminProfile} className="flex gap-2.5 pt-2">
                  <input
                    type="text"
                    value={adminDisplayName}
                    onChange={(e) => setAdminDisplayName(e.target.value)}
                    placeholder="Admin display name"
                    maxLength={64}
                    className="flex-1 min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={savingAdminName}
                    className="min-h-[42px] px-4 rounded-xl bg-[#E5233D] text-white text-xs font-semibold"
                  >
                    {savingAdminName ? 'Saving...' : 'Update Name'}
                  </button>
                </form>
              </section>

              <section className="rounded-2xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#E5233D]" />
                  <h2 className="font-display text-base font-bold">Change Password</h2>
                </div>
                <form onSubmit={handleAdminPasswordChange} className="space-y-3">
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      placeholder="Current password"
                      required
                      className="w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((p) => !p)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="New password (minimum 6 characters)"
                    required
                    className="w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                  />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3.5 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={changingPw}
                    className="min-h-[42px] px-5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold"
                  >
                    {changingPw ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* User Details Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">User Details</h3>
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="min-w-[36px] min-h-[36px] rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between gap-4 py-1.5 border-b border-zinc-100 dark:border-white/[0.06]">
                <span className="text-zinc-500">Display Name</span>
                <span className="font-semibold">{selectedUserDetail.username}</span>
              </div>
              <div className="flex justify-between gap-4 py-1.5 border-b border-zinc-100 dark:border-white/[0.06]">
                <span className="text-zinc-500">Email</span>
                <span className="font-semibold">{selectedUserDetail.email}</span>
              </div>
              <div className="flex justify-between gap-4 py-1.5 border-b border-zinc-100 dark:border-white/[0.06]">
                <span className="text-zinc-500">UID</span>
                <span className="font-mono text-[11px]">{selectedUserDetail.uid}</span>
              </div>
              <div className="flex justify-between gap-4 py-1.5 border-b border-zinc-100 dark:border-white/[0.06]">
                <span className="text-zinc-500">Role</span>
                <span className="font-semibold">
                  {isMainAdminEmail(selectedUserDetail.email) ? 'Main Admin' : 'User'}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-1.5 border-b border-zinc-100 dark:border-white/[0.06]">
                <span className="text-zinc-500">Account Status</span>
                <span
                  className={`font-semibold ${
                    selectedUserDetail.status === 'blocked' ? 'text-red-500' : 'text-emerald-500'
                  }`}
                >
                  {selectedUserDetail.status === 'blocked' ? 'Blocked' : 'Active'}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-1.5 border-b border-zinc-100 dark:border-white/[0.06]">
                <span className="text-zinc-500">Language</span>
                <span className="capitalize">{selectedUserDetail.preferredLanguage}</span>
              </div>
              <div className="flex justify-between gap-4 py-1.5 border-b border-zinc-100 dark:border-white/[0.06]">
                <span className="text-zinc-500">Registered</span>
                <span className="tabular-nums">{formatDateTimeLabel(selectedUserDetail.createdAt)}</span>
              </div>
              <div className="flex justify-between gap-4 py-1.5">
                <span className="text-zinc-500">Last Login</span>
                <span className="tabular-nums">
                  {formatDateTimeLabel(selectedUserDetail.lastLoginAt || selectedUserDetail.updatedAt)}
                </span>
              </div>
              {selectedUserDetail.blockedReason && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-500">
                  Block Reason: {selectedUserDetail.blockedReason}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Block / Unblock Confirmation Modal */}
      {blockModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-6 space-y-4">
            <h3 className="font-display text-lg font-bold">
              {blockModalTarget.shouldBlock ? 'Block User Account?' : 'Unblock User Account?'}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {blockModalTarget.shouldBlock
                ? `Blocking ${blockModalTarget.user.email} immediately prevents them from playing stories, writing to Firestore, or calling backend AI APIs.`
                : `Unblocking ${blockModalTarget.user.email} will restore normal user access immediately.`}
            </p>
            {blockModalTarget.shouldBlock && (
              <div>
                <label className="text-xs font-medium text-zinc-500">Reason (shown to user)</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  maxLength={300}
                  className="mt-1 w-full min-h-[42px] rounded-xl bg-zinc-50 dark:bg-[#0C0C10] border border-zinc-200 dark:border-white/10 px-3 text-sm"
                />
              </div>
            )}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setBlockModalTarget(null)}
                className="flex-1 min-h-[42px] rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingBlock}
                onClick={() => void handleConfirmBlockAction()}
                className={`flex-1 min-h-[42px] rounded-xl text-xs font-semibold text-white ${
                  blockModalTarget.shouldBlock ? 'bg-red-600' : 'bg-emerald-600'
                }`}
              >
                {processingBlock
                  ? 'Applying...'
                  : blockModalTarget.shouldBlock
                  ? 'Confirm Block'
                  : 'Confirm Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Settings */}
      {confirmResetSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-6 space-y-4">
            <h3 className="font-display text-lg font-bold">Reset App Settings?</h3>
            <p className="text-xs text-zinc-500">
              This restores default Dark theme, Crimson Red accent, and open registrations.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmResetSettingsOpen(false)}
                className="flex-1 min-h-[40px] rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmResetSettingsOpen(false);
                  setSettingsDraft(DEFAULT_APP_SETTINGS);
                  void handleSaveSettings(DEFAULT_APP_SETTINGS);
                }}
                className="flex-1 min-h-[40px] rounded-xl bg-[#E5233D] text-white text-xs font-semibold"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Reset Content */}
      {confirmResetContentOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#141419] border border-zinc-200 dark:border-white/10 p-6 space-y-4">
            <h3 className="font-display text-lg font-bold">Reset Content Copy?</h3>
            <p className="text-xs text-zinc-500">
              This restores default welcome text, guest prompt copy, and help guide text.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmResetContentOpen(false)}
                className="flex-1 min-h-[40px] rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmResetContentOpen(false);
                  setContentDraft(DEFAULT_APP_CONTENT);
                  void handleSaveContent(DEFAULT_APP_CONTENT);
                }}
                className="flex-1 min-h-[40px] rounded-xl bg-[#E5233D] text-white text-xs font-semibold"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}

      {storyStudioOpen && (
        <AdminStudioModal
          user={user}
          customStories={customStories}
          onClose={() => setStoryStudioOpen(false)}
          onSaved={onStoriesUpdated}
        />
      )}
    </div>
  );
};
