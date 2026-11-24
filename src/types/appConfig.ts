export type ThemeMode = 'dark' | 'light';
export type AnnouncementType = 'info' | 'warning' | 'success';

export interface AppSettingsConfig {
  appName: string;
  appSubtitle: string;
  logoUrl: string;
  supportEmail: string;
  supportNote: string;
  allowRegistrations: boolean;
  registrationClosedMessage: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  announcementEnabled: boolean;
  announcementTitle: string;
  announcementMessage: string;
  announcementType: AnnouncementType;
  themeMode: ThemeMode;
  accentColor: string;
  enableVoiceInput: boolean;
  enableAiSuggestions: boolean;
  updatedBy?: string;
  updatedAt?: unknown;
}

export interface AppContentConfig {
  welcomeHeading: string;
  welcomeSubheading: string;
  heroBadgeText: string;
  homeFeaturedTitle: string;
  guestPromptTitle: string;
  guestPromptSubtitle: string;
  helpGuideText: string;
  footerNote: string;
  updatedBy?: string;
  updatedAt?: unknown;
}

export const ACCENT_COLOR_PRESETS = [
  { label: 'Crimson Red', value: '#E5233D' },
  { label: 'Ruby Rose', value: '#E11D48' },
  { label: 'Amber Flame', value: '#EA580C' },
  { label: 'Cobalt Blue', value: '#2563EB' },
  { label: 'Emerald', value: '#059669' },
] as const;

export const DEFAULT_APP_SETTINGS: AppSettingsConfig = {
  appName: 'LEADERS STORIES',
  appSubtitle: 'Interactive Multi-Character AI Story World',
  logoUrl: '',
  supportEmail: 'prabhuaj8@gmail.com',
  supportNote: 'Need help with your story sync or account? Reach out via our support email anytime.',
  allowRegistrations: true,
  registrationClosedMessage:
    'New user registrations are temporarily paused by the administrator. Existing accounts can still sign in.',
  maintenanceMode: false,
  maintenanceMessage:
    'LEADERS STORIES is currently undergoing scheduled maintenance. Please check back shortly.',
  announcementEnabled: false,
  announcementTitle: 'Welcome to LEADERS STORIES',
  announcementMessage:
    'All 20+ interactive multi-character stories are 100% free to play with permanent cloud save.',
  announcementType: 'info',
  themeMode: 'dark',
  accentColor: '#E5233D',
  enableVoiceInput: true,
  enableAiSuggestions: true,
};

export const DEFAULT_APP_CONTENT: AppContentConfig = {
  welcomeHeading: 'Welcome back to LEADERS STORIES',
  welcomeSubheading: 'Step into cinematic multi-character stories where every dialogue shapes the plot.',
  heroBadgeText: 'Featured Interactive Story',
  homeFeaturedTitle: 'Recommended Stories',
  guestPromptTitle: 'Sign in to save your story universe',
  guestPromptSubtitle:
    'All stories are 100% free. Sign in with Email & Password to sync chats, choices, and relationships across devices.',
  helpGuideText:
    'Tap any story cover to inspect characters and media, then tap Chat now to enter the scene. Switch between Hinglish, Hindi, and English anytime from the top menu or your Profile.',
  footerNote: 'LEADERS STORIES · Interactive AI Storytelling Platform · 100% Free Access',
};
