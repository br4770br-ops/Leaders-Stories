import type { StoryCharacter, StoryDefinition } from '../types/story';

const STORAGE_KEY_PREFIX = 'leaders_custom_chars_v1_';

export interface PortraitPreset {
  id: string;
  label: string;
  url: string;
  gender: 'Female' | 'Male';
  ageBand: 'young' | 'adult' | 'mature';
  keywords: string[];
}

export const CHARACTER_PORTRAIT_PRESETS: PortraitPreset[] = [
  // Female characters across diverse vibes & roles
  {
    id: 'priya',
    label: 'Sweet Kurti',
    url: '/src/assets/images/priya_coaching_portrait_1795616640809.jpg',
    gender: 'Female',
    ageBand: 'young',
    keywords: ['shy', 'sweet', 'kurti', 'white', 'coaching', 'college', 'student', 'innocent', 'introvert', 'diary', 'kind'],
  },
  {
    id: 'isha',
    label: 'Campus Lead',
    url: '/src/assets/images/portrait_isha_heroine_1795460773662.jpg',
    gender: 'Female',
    ageBand: 'young',
    keywords: ['campus', 'college', 'rival', 'sharp', 'fierce', 'smart', 'classmate', 'student', 'proud', 'bold'],
  },
  {
    id: 'mehak',
    label: 'Warm Crush',
    url: '/src/assets/images/mehak_crush_portrait_1795516088891.jpg',
    gender: 'Female',
    ageBand: 'young',
    keywords: ['warm', 'smile', 'crush', 'caring', 'best friend', 'friendly', 'soft', 'romantic', 'cheerful'],
  },
  {
    id: 'roshni',
    label: 'Playful Flatmate',
    url: '/src/assets/images/roshni_flatmate_portrait_1795516088415.jpg',
    gender: 'Female',
    ageBand: 'adult',
    keywords: ['flatmate', 'roommate', 'funny', 'teasing', 'playful', 'witty', 'friend', 'mumbai', 'party'],
  },
  {
    id: 'sana_c',
    label: 'Campus Rebel',
    url: '/src/assets/images/sana_campus_portrait_1795516088958.jpg',
    gender: 'Female',
    ageBand: 'young',
    keywords: ['rebel', 'confident', 'fashion', 'popular', 'sarcastic', 'cool', 'college'],
  },
  {
    id: 'riya_s',
    label: 'School Sweetheart',
    url: '/src/assets/images/riya_school_portrait_1795516147210.jpg',
    gender: 'Female',
    ageBand: 'young',
    keywords: ['school', 'teen', 'young', 'bench', 'notebook', 'crush', 'uniform', 'cute'],
  },
  {
    id: 'tara',
    label: 'Mafia Queen',
    url: '/src/assets/images/tara_mafia_portrait_1795516087170.jpg',
    gender: 'Female',
    ageBand: 'adult',
    keywords: ['mafia', 'boss', 'queen', 'dangerous', 'power', 'crime', 'gun', 'leather', 'villain', 'ruthless', 'gangster'],
  },
  {
    id: 'natasha',
    label: 'Corporate Boss',
    url: '/src/assets/images/natasha_boss_portrait_1795516089566.jpg',
    gender: 'Female',
    ageBand: 'adult',
    keywords: ['ceo', 'boss', 'executive', 'office', 'corporate', 'strict', 'luxury', 'rich', 'lawyer', 'manager'],
  },
  {
    id: 'alina_v',
    label: 'Dark Mystery',
    url: '/src/assets/images/alina_vampire_portrait_1795516147518.jpg',
    gender: 'Female',
    ageBand: 'adult',
    keywords: ['vampire', 'gothic', 'dark', 'supernatural', 'shadow', 'magic', 'witch', 'fantasy', 'horror', 'mysterious'],
  },
  {
    id: 'niharika',
    label: 'Intense Obsession',
    url: '/src/assets/images/niharika_obsessed_portrait_1795516146132.jpg',
    gender: 'Female',
    ageBand: 'adult',
    keywords: ['obsessed', 'jealous', 'intense', 'possessive', 'thriller', 'secret', 'spy', 'psych'],
  },
  {
    id: 'devika',
    label: 'Royal Princess',
    url: '/src/assets/images/devika_royal_portrait_1795516087327.jpg',
    gender: 'Female',
    ageBand: 'adult',
    keywords: ['princess', 'royal', 'queen', 'palace', 'historical', 'rajkumari', 'traditional', 'noble', 'king'],
  },
  {
    id: 'kiara',
    label: 'Graceful Bride',
    url: '/src/assets/images/kiara_bride_portrait_1795516146637.jpg',
    gender: 'Female',
    ageBand: 'adult',
    keywords: ['bride', 'marriage', 'wedding', 'wife', 'fiancee', 'saree', 'lehenga', 'family', 'arranged'],
  },
  {
    id: 'meera_pod',
    label: 'Journalist / Podcaster',
    url: '/src/assets/images/meera_podcaster_portrait_1795516149082.jpg',
    gender: 'Female',
    ageBand: 'adult',
    keywords: ['journalist', 'reporter', 'detective', 'investigator', 'podcaster', 'rj', 'radio', 'crime'],
  },
  {
    id: 'maya_c',
    label: 'Mature Counselor',
    url: '/src/assets/images/maya_counselor_portrait_1795516090021.jpg',
    gender: 'Female',
    ageBand: 'mature',
    keywords: ['teacher', 'professor', 'counselor', 'doctor', 'mentor', 'sister', 'didi', 'mature', 'wise', 'calm', 'principal', 'boss'],
  },
  {
    id: 'kavita_m',
    label: 'Warm Elder',
    url: '/src/assets/images/kavita_mother_portrait_1795516091317.jpg',
    gender: 'Female',
    ageBand: 'mature',
    keywords: ['mother', 'mom', 'mummy', 'maa', 'ammi', 'aunt', 'aunty', 'chachi', 'maasi', 'bua', 'dadi', 'nani', 'saas', 'elder', 'guardian', 'caring', 'home', 'family', 'traditional'],
  },
  {
    id: 'lavanya_y',
    label: 'Glamorous Muse',
    url: '/src/assets/images/alaina_ceo_portrait_1795873567048.jpg',
    gender: 'Female',
    ageBand: 'adult',
    keywords: ['glam', 'rich', 'luxury', 'penthouse', 'hot', 'seductive', 'bold', 'model', 'confident', 'flirty'],
  },
  {
    id: 'alina_y',
    label: 'Velvet Siren',
    url: '/src/assets/images/tara_indie_portrait_1795873527266.jpg',
    gender: 'Female',
    ageBand: 'adult',
    keywords: ['singer', 'night', 'lounge', 'romantic', 'deep', 'poetry', 'sensual', 'artistic'],
  },
  {
    id: 'tania_y',
    label: 'Festive Charm',
    url: '/src/assets/images/diya_garba_portrait_1795873525637.jpg',
    gender: 'Female',
    ageBand: 'adult',
    keywords: ['designer', 'vacation', 'goa', 'sunny', 'charming', 'flirty', 'free-spirited'],
  },
  {
    id: 'zoya_y',
    label: 'Cyber Rebel',
    url: '/src/assets/images/sora_cyber_portrait_1795873526448.jpg',
    gender: 'Female',
    ageBand: 'adult',
    keywords: ['racer', 'driver', 'bike', 'car', 'dj', 'edgy', 'jacket', 'rebel', 'nightlife'],
  },
  {
    id: 'samaira_y',
    label: 'Stage Star',
    url: '/src/assets/images/haewon_kpop_portrait_1795873525293.jpg',
    gender: 'Female',
    ageBand: 'young',
    keywords: ['idol', 'celebrity', 'actress', 'singer', 'star', 'famous', 'stage', 'spotlight'],
  },

  // Male characters across diverse vibes & roles
  {
    id: 'kabir_c',
    label: 'College Rival',
    url: '/src/assets/images/kabir_coaching_portrait_1795616640551.jpg',
    gender: 'Male',
    ageBand: 'young',
    keywords: ['college', 'coaching', 'student', 'rival', 'crush', 'jealous', 'classmate', 'cute', 'boy'],
  },
  {
    id: 'vivaan',
    label: 'Campus Heartthrob',
    url: '/src/assets/images/portrait_vivaan_rival_1795460852271.jpg',
    gender: 'Male',
    ageBand: 'young',
    keywords: ['rich', 'arrogant', 'rival', 'campus', 'confident', 'handsome', 'popular', 'charismatic'],
  },
  {
    id: 'aarav',
    label: 'Loyal Wingman',
    url: '/src/assets/images/aarav_friend_portrait_1795516089434.jpg',
    gender: 'Male',
    ageBand: 'young',
    keywords: ['friend', 'best friend', 'wingman', 'funny', 'loyal', 'chill', 'brother', 'teasing'],
  },
  {
    id: 'rohan_w',
    label: 'Playful Bro',
    url: '/src/assets/images/rohan_wingman_portrait_1795516090991.jpg',
    gender: 'Male',
    ageBand: 'young',
    keywords: ['funny', 'friend', 'hostel', 'party', 'trip', 'companion', 'warm'],
  },
  {
    id: 'dev_c',
    label: 'Urban Lead',
    url: '/src/assets/images/dev_companion_portrait_1795516148313.jpg',
    gender: 'Male',
    ageBand: 'adult',
    keywords: ['smart', 'coder', 'tech', 'neon', 'hacker', 'modern', 'calm', 'gentle'],
  },
  {
    id: 'aryan_h',
    label: 'Shadow Fighter',
    url: '/src/assets/images/aryan_hunter_portrait_1795516146597.jpg',
    gender: 'Male',
    ageBand: 'adult',
    keywords: ['hunter', 'dark', 'cold', 'powerful', 'anime', 'assassin', 'supernatural', 'brooding', 'loner'],
  },
  {
    id: 'raghav_r',
    label: 'Dangerous Antagonist',
    url: '/src/assets/images/raghav_rival_portrait_1795516146457.jpg',
    gender: 'Male',
    ageBand: 'adult',
    keywords: ['mafia', 'villain', 'rival', 'ruthless', 'intense', 'suit', 'enemy', 'boss'],
  },
  {
    id: 'kabir_e',
    label: 'Mafia Enforcer',
    url: '/src/assets/images/kabir_enforcer_portrait_1795516087491.jpg',
    gender: 'Male',
    ageBand: 'adult',
    keywords: ['enforcer', 'bodyguard', 'mafia', 'protector', 'loyal', 'gangster', 'strong'],
  },
  {
    id: 'vikram',
    label: 'Sharp Detective',
    url: '/src/assets/images/vikram_cop_portrait_1795516148481.jpg',
    gender: 'Male',
    ageBand: 'adult',
    keywords: ['detective', 'cop', 'police', 'inspector', 'agent', 'thriller', 'crime', 'investigator'],
  },
  {
    id: 'shinde',
    label: 'Senior Officer',
    url: '/src/assets/images/shinde_officer_portrait_1795516149253.jpg',
    gender: 'Male',
    ageBand: 'mature',
    keywords: ['officer', 'police', 'strict', 'chief', 'senior', 'crime', 'serious', 'inspector', 'father', 'dad', 'papa', 'uncle'],
  },
  {
    id: 'arjun',
    label: 'Royal Warrior',
    url: '/src/assets/images/arjun_warrior_portrait_1795516087468.jpg',
    gender: 'Male',
    ageBand: 'adult',
    keywords: ['warrior', 'prince', 'soldier', 'knight', 'historical', 'mythology', 'sword', 'hero'],
  },
  {
    id: 'zafar',
    label: 'Royal Strategist',
    url: '/src/assets/images/zafar_wazir_portrait_1795516148205.jpg',
    gender: 'Male',
    ageBand: 'mature',
    keywords: ['wazir', 'minister', 'royal', 'palace', 'cunning', 'mentor', 'strategist', 'beard', 'abbu', 'dada', 'nana'],
  },
  {
    id: 'sanjay',
    label: 'Street Broker',
    url: '/src/assets/images/sanjay_broker_portrait_1795516089945.jpg',
    gender: 'Male',
    ageBand: 'mature',
    keywords: ['broker', 'informant', 'mentor', 'father', 'dad', 'papa', 'chacha', 'mama', 'tau', 'uncle', 'professor', 'doctor', 'dealer', 'wise', 'older', 'waiter', 'driver'],
  },
  {
    id: 'harish',
    label: 'Night Watchman',
    url: '/src/assets/images/harish_watchman_portrait_1795516146598.jpg',
    gender: 'Male',
    ageBand: 'mature',
    keywords: ['watchman', 'guard', 'horror', 'caretaker', 'old', 'spooky', 'haveli', 'servant'],
  },
];

export interface CharacterPortraitMatchInput {
  name?: string;
  age?: string;
  gender?: string;
  role?: string;
  personality?: string;
  relationshipToUser?: string;
  storySetting?: string;
}

function hasKeywordMatch(textBlob: string, keyword: string): boolean {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return false;
  if (kw.includes(' ') || kw.includes('-')) {
    return textBlob.includes(kw);
  }
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i').test(textBlob);
}

const FEMALE_HINT_TERMS = [
  'mom', 'mother', 'mummy', 'maa', 'ammi', 'sister', 'didi', 'behen', 'behna',
  'aunt', 'aunty', 'chachi', 'maasi', 'bua', 'dadi', 'nani', 'bhabhi', 'saas',
  'girl', 'girlfriend', 'gf', 'wife', 'biwi', 'bride', 'dulhan', 'queen', 'princess',
  'lady', 'madam', 'maam', 'female', 'woman', 'beti', 'daughter', 'she', 'her',
];

const MALE_HINT_TERMS = [
  'dad', 'papa', 'father', 'abbu', 'brother', 'bhaiya', 'bhai', 'chacha', 'mama',
  'tau', 'dada', 'nana', 'uncle', 'sasur', 'boy', 'boyfriend', 'bf', 'husband',
  'pati', 'groom', 'king', 'prince', 'sir', 'male', 'man', 'beta', 'son', 'he', 'him',
];

export function inferGenderFromCharacterHints(input: {
  gender?: string;
  name?: string;
  role?: string;
  relationshipToUser?: string;
}): 'Female' | 'Male' | 'Non-binary' {
  const gLower = (input.gender || '').trim().toLowerCase();
  if (gLower === 'female' || gLower === 'f' || gLower === 'woman') return 'Female';
  if (gLower === 'male' || gLower === 'm' || gLower === 'man') return 'Male';
  if (gLower === 'non-binary' || gLower === 'nonbinary') return 'Non-binary';

  const blob = [input.name, input.role, input.relationshipToUser].filter(Boolean).join(' ').toLowerCase();
  if (FEMALE_HINT_TERMS.some((term) => hasKeywordMatch(blob, term))) return 'Female';
  if (MALE_HINT_TERMS.some((term) => hasKeywordMatch(blob, term))) return 'Male';
  return 'Female';
}

export function getCharacterAccentColor(gender?: string, name = ''): string {
  const femalePalette = ['#FB7185', '#F472B6', '#C084FC', '#38BDF8', '#F59E0B'];
  const malePalette = ['#60A5FA', '#34D399', '#A78BFA', '#38BDF8', '#FBBF24'];
  const seed = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const gLower = (gender || '').trim().toLowerCase();
  const palette = gLower === 'male' ? malePalette : femalePalette;
  return palette[seed % palette.length];
}

export function matchCharacterPortraitUrl(
  input: CharacterPortraitMatchInput,
  cycleOffset = 0,
  excludedUrls: string[] = []
): string {
  const resolvedGender = input.gender
    ? inferGenderFromCharacterHints(input)
    : inferGenderFromCharacterHints({
        name: input.name,
        role: input.role,
        relationshipToUser: input.relationshipToUser,
      });
  const gLower = resolvedGender.toLowerCase();
  const basePool =
    gLower === 'male'
      ? CHARACTER_PORTRAIT_PRESETS.filter((p) => p.gender === 'Male')
      : gLower === 'female'
      ? CHARACTER_PORTRAIT_PRESETS.filter((p) => p.gender === 'Female')
      : CHARACTER_PORTRAIT_PRESETS;

  const excludedSet = new Set(excludedUrls);
  const filteredPool = basePool.filter((p) => !excludedSet.has(p.url));
  const pool = filteredPool.length > 0 ? filteredPool : basePool;

  const parsedAge = Number.parseInt((input.age || '').replace(/\D+/g, ''), 10);
  const desiredAgeBand: 'young' | 'adult' | 'mature' | null = Number.isFinite(parsedAge)
    ? parsedAge <= 22
      ? 'young'
      : parsedAge >= 34
      ? 'mature'
      : 'adult'
    : null;

  const textBlob = [
    input.role,
    input.personality,
    input.relationshipToUser,
    input.storySetting,
    input.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const nameSeed = (input.name || 'character')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const scored = pool.map((preset, idx) => {
    let score = 0;
    if (desiredAgeBand && preset.ageBand === desiredAgeBand) {
      score += 4;
    }
    for (const kw of preset.keywords) {
      if (hasKeywordMatch(textBlob, kw)) {
        score += 5;
      }
    }
    return {
      preset,
      score,
      tieBreak: (idx + nameSeed) % pool.length,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.tieBreak - b.tieBreak;
  });

  const topBucket = scored.slice(0, Math.min(5, scored.length));
  return topBucket[cycleOffset % topBucket.length]?.preset.url || pool[0].url;
}

export function pickFallbackPortraitUrl(gender?: string): string {
  return matchCharacterPortraitUrl({ gender }, Math.floor(Math.random() * 4));
}

export type CustomCharactersMap = Record<string, StoryCharacter[]>;

export function loadCustomCharactersMap(uid?: string | null): CustomCharactersMap {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${uid || 'guest'}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as CustomCharactersMap;
  } catch {
    return {};
  }
}

export function saveCustomCharactersMap(uid: string | null | undefined, map: CustomCharactersMap): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${uid || 'guest'}`, JSON.stringify(map));
  } catch {
    // ignore storage quota restrictions
  }
}

export function addCustomCharacterToMap(
  uid: string | null | undefined,
  storyId: string,
  character: Omit<StoryCharacter, 'id' | 'isCustom'>
): CustomCharactersMap {
  const current = loadCustomCharactersMap(uid);
  const existing = current[storyId] || [];
  const normalizedName = character.name.trim().toLowerCase();
  if (existing.some((c) => c.name.trim().toLowerCase() === normalizedName)) {
    return current;
  }
  const newChar: StoryCharacter = {
    ...character,
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    isCustom: true,
  };
  const next: CustomCharactersMap = {
    ...current,
    [storyId]: [...existing, newChar],
  };
  saveCustomCharactersMap(uid, next);
  return next;
}

export function removeCustomCharacterFromMap(
  uid: string | null | undefined,
  storyId: string,
  characterId: string
): CustomCharactersMap {
  const current = loadCustomCharactersMap(uid);
  const existing = current[storyId] || [];
  const filtered = existing.filter((c) => c.id !== characterId);
  const next: CustomCharactersMap = {
    ...current,
    [storyId]: filtered,
  };
  if (filtered.length === 0) {
    delete next[storyId];
  }
  saveCustomCharactersMap(uid, next);
  return next;
}

export function mergeStoryWithCustomCharacters(
  story: StoryDefinition,
  customMap: CustomCharactersMap
): StoryDefinition {
  const extras = customMap[story.id];
  if (!extras || extras.length === 0) return story;
  return {
    ...story,
    characters: [...story.characters, ...extras],
  };
}
