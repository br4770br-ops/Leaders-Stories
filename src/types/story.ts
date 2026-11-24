export type LanguageCode = 'hinglish' | 'hindi' | 'english';

export type StoryCategory =
  | 'For You'
  | 'New'
  | 'By Fans'
  | 'Top 50'
  | 'Fantasy'
  | 'Crime'
  | 'Anime'
  | 'Horror'
  | 'Thriller'
  | 'Drama'
  | 'Romance'
  | 'College'
  | 'School'
  | 'Mafia'
  | 'Adventure'
  | 'Historical'
  | 'Mythology'
  | 'Supernatural';

export interface StoryCharacter {
  id: string;
  name: string;
  age?: string;
  role: string;
  personality: string;
  speakingStyle: string;
  relationshipToUser: string;
  portrait: string;
  accentColor?: string;
}

export interface RelationshipMeterDef {
  id: string;
  label: string;
  emoji: string;
  initialValue: number;
  min: number;
  max: number;
  tone: 'love' | 'trust' | 'friendship' | 'hate' | 'jealousy' | 'fear' | 'respect';
}

export interface RelationshipMeterValue extends RelationshipMeterDef {
  value: number;
}

export interface StoryBeat {
  type: 'narration' | 'dialogue';
  speakerName?: string;
  text: string;
}

export interface StoryDefinition {
  id: string;
  title: string;
  tagline: string;
  about: string;
  primaryCategory: StoryCategory;
  categories: StoryCategory[];
  tags: string[];
  visualStyle: string;
  rating: number;
  chatCountLabel: string;
  chatCountNumeric: number;
  rank?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  isByFans?: boolean;
  isTrending?: boolean;
  coverImage: string;
  bannerImage?: string;
  mediaGallery: {
    id: string;
    url: string;
    caption: string;
  }[];
  setting: string;
  characters: StoryCharacter[];
  relationshipMeters: RelationshipMeterDef[];
  openingScene: string;
  openingBeats: Record<LanguageCode, StoryBeat[]>;
  initialChoices: Record<LanguageCode, string[]>;
  possibleEndings: string[];
}

export interface ChatTurnMessage {
  id: string;
  uid: string;
  conversationId: string;
  role: 'user' | 'story';
  userText?: string;
  sceneSummary?: string;
  beats?: StoryBeat[];
  metersSnapshot?: { id: string; label: string; emoji: string; value: number }[];
  sequence: number;
  createdAt?: unknown;
  localTimestamp?: number;
}

export interface ConversationSummary {
  uid: string;
  conversationId: string;
  storyId: string;
  storyTitle: string;
  coverImage?: string;
  lastMessage: string;
  lastSpeaker?: string;
  messageCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
  localUpdatedAt?: number;
}

export interface StoryProgressRecord {
  uid: string;
  storyId: string;
  currentScene: string;
  sceneIndex: number;
  status: 'active' | 'completed';
  endingReached?: string;
  choicesMade: string[];
  savedCharacterIds: string[];
  startedAt?: unknown;
  updatedAt?: unknown;
}

export interface StoryMemoryRecord {
  id: string;
  uid: string;
  storyId: string;
  summary: string;
  importance: number;
  charactersInvolved?: string[];
  createdAt?: unknown;
}

export interface FavoriteRecord {
  uid: string;
  storyId: string;
  title: string;
  coverImage?: string;
  genre?: string;
  createdAt?: unknown;
}

export interface UserProfileRecord {
  uid: string;
  username: string;
  email: string;
  avatarUrl?: string;
  preferredLanguage: LanguageCode;
  role?: 'user' | 'admin';
  status?: 'active' | 'blocked';
  blockedReason?: string;
  blockedAt?: unknown;
  blockedBy?: string;
  lastLoginAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}
