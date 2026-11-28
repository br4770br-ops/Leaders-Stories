import React, { useEffect, useRef, useState } from 'react';
import { Expand, Loader2, Plus, RefreshCw, Sparkles, UserPlus, X } from 'lucide-react';
import { matchCharacterPortraitUrl } from '../lib/customCharacters';
import type { StoryCharacter } from '../types/story';
import { PortraitLightboxModal } from './PortraitLightboxModal';
import { StoryImage } from './StoryImage';

interface AddCharacterModalProps {
  storyTitle: string;
  storySetting?: string;
  onClose: () => void;
  onAdd: (character: Omit<StoryCharacter, 'id' | 'isCustom'>) => void;
}

type CharacterGender = 'Female' | 'Male' | 'Non-binary';

const GENDER_ACCENT_MAP: Record<CharacterGender, string> = {
  Female: '#FB7185',
  Male: '#38BDF8',
  'Non-binary': '#A78BFA',
};

export const AddCharacterModal: React.FC<AddCharacterModalProps> = ({
  storyTitle,
  storySetting,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<CharacterGender>('Female');
  const [role, setRole] = useState('');
  const [personality, setPersonality] = useState('');
  const [speakingStyle, setSpeakingStyle] = useState('');
  const [relationshipToUser, setRelationshipToUser] = useState('');
  const [generatedPortraitUrl, setGeneratedPortraitUrl] = useState<string | null>(null);
  const [generatingPortrait, setGeneratingPortrait] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const generateMatchedPortrait = async (nextCycle = cycleCount): Promise<string> => {
    setGeneratingPortrait(true);
    setErrorMsg(null);
    await new Promise((resolve) => setTimeout(resolve, 260));
    const url = matchCharacterPortraitUrl(
      {
        name: name.trim(),
        age: age.trim(),
        gender,
        role: role.trim(),
        personality: personality.trim(),
        relationshipToUser: relationshipToUser.trim(),
        storySetting: storySetting || storyTitle,
      },
      nextCycle
    );
    if (mountedRef.current) {
      setGeneratedPortraitUrl(url);
      setCycleCount(nextCycle + 1);
      setGeneratingPortrait(false);
    }
    return url;
  };

  const handleGenerateClick = async () => {
    if (!name.trim() && !role.trim() && !personality.trim()) {
      setErrorMsg('Please enter Name, Role, or Personality traits before generating a portrait.');
      return;
    }
    await generateMatchedPortrait(cycleCount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanRole = role.trim();
    if (!cleanName) {
      setErrorMsg('Please enter the character name.');
      return;
    }
    if (!cleanRole) {
      setErrorMsg('Please enter a short role (e.g., Best Friend, Rival, Detective).');
      return;
    }

    const finalPortrait = generatedPortraitUrl || (await generateMatchedPortrait(0));

    onAdd({
      name: cleanName,
      age: age.trim() || undefined,
      gender,
      role: cleanRole,
      personality:
        personality.trim() ||
        'Expressive, sharp-minded, and reacts vividly to every choice you make in the scene.',
      speakingStyle:
        speakingStyle.trim() || 'Natural expressive Hinglish with strong emotion.',
      relationshipToUser:
        relationshipToUser.trim() || 'Newly entered into your story world',
      portrait: finalPortrait,
      accentColor: GENDER_ACCENT_MAP[gender] || '#38BDF8',
    });
    onClose();
  };

  const accentColor = GENDER_ACCENT_MAP[gender];

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#12131B] text-zinc-950 dark:text-white border border-zinc-200 dark:border-white/[0.12] shadow-2xl p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.12] text-rose-400 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold leading-tight">Add Character</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[230px]">
                  Into {storyTitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="min-w-[40px] min-h-[40px] rounded-full bg-zinc-100 dark:bg-white/[0.06] border border-zinc-300 dark:border-white/[0.12] flex items-center justify-center text-zinc-600 dark:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl bg-red-500/10 border-[1.5px] border-red-500/50 px-3 py-2 text-xs text-red-500 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Auto-Matched Portrait Card */}
            <div
              className="rounded-2xl bg-zinc-50 dark:bg-[#0B0C12] border border-zinc-200 dark:border-white/[0.12] p-3.5 flex items-center gap-4 shadow-inner transition-colors"
            >
              <button
                type="button"
                disabled={!generatedPortraitUrl}
                onClick={() => generatedPortraitUrl && setPreviewOpen(true)}
                aria-label="Preview character portrait fullscreen"
                className={`relative w-20 h-26 shrink-0 rounded-2xl overflow-hidden border border-zinc-300 dark:border-white/[0.18] flex items-center justify-center bg-[#151722] transition ${
                  generatedPortraitUrl ? 'cursor-pointer hover:scale-[1.03]' : 'cursor-default'
                }`}
              >
                {generatingPortrait ? (
                  <div className="flex flex-col items-center gap-1.5 text-sky-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-[10px] font-semibold">Matching...</span>
                  </div>
                ) : generatedPortraitUrl ? (
                  <>
                    <StoryImage
                      src={generatedPortraitUrl}
                      alt={name || 'Generated portrait'}
                      className="w-full h-full object-cover object-top"
                    />
                    <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-black/70 border border-white/25 flex items-center justify-center text-white">
                      <Expand className="w-3 h-3" />
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-zinc-400 px-1 text-center">
                    <Sparkles className="w-5 h-5 text-zinc-400" />
                    <span className="text-[9.5px] leading-tight font-medium">Auto Look</span>
                  </div>
                )}
              </button>

              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white">
                    Character Portrait
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                    Enter Name, Age, Gender, Role & Personality below, then tap Generate to apply a matching look automatically.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={generatingPortrait}
                  onClick={() => void handleGenerateClick()}
                  className="min-h-[38px] px-3.5 rounded-xl bg-zinc-900 dark:bg-[#1E293B] border border-sky-400/35 hover:border-sky-300/60 disabled:opacity-55 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition"
                >
                  {generatingPortrait ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : generatedPortraitUrl ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate Portrait
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      Generate Portrait
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  Character Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Simran Verma"
                  maxLength={40}
                  className="w-full min-h-[44px] rounded-xl bg-zinc-100 dark:bg-[#191A24] border border-zinc-300 dark:border-white/[0.12] px-3 text-sm focus:outline-none focus:border-rose-400/60"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  Age
                </label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="21"
                  maxLength={10}
                  className="w-full min-h-[44px] rounded-xl bg-zinc-100 dark:bg-[#191A24] border border-zinc-300 dark:border-white/[0.12] px-3 text-sm focus:outline-none focus:border-rose-400/60"
                />
              </div>
            </div>

            {/* Gender Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                Gender *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Female', 'Male', 'Non-binary'] as CharacterGender[]).map((opt) => {
                  const active = gender === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setGender(opt);
                        setCycleCount(0);
                      }}
                      className={`min-h-[40px] rounded-xl text-xs font-semibold border transition ${
                        active
                          ? 'bg-zinc-900 dark:bg-white/15 text-white border-rose-400/60 shadow-sm'
                          : 'bg-zinc-100 dark:bg-[#191A24] text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-white/[0.12] hover:border-zinc-400 dark:hover:border-white/25'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                Role in Story *
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Secret Rival, Childhood Friend, Undercover Agent"
                maxLength={60}
                className="w-full min-h-[44px] rounded-xl bg-zinc-100 dark:bg-[#191A24] border border-zinc-300 dark:border-white/[0.12] px-3 text-sm focus:outline-none focus:border-rose-400/60"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                Relationship To You
              </label>
              <input
                type="text"
                value={relationshipToUser}
                onChange={(e) => setRelationshipToUser(e.target.value)}
                placeholder="e.g. Always teases you but secretly has your back"
                maxLength={80}
                className="w-full min-h-[44px] rounded-xl bg-zinc-100 dark:bg-[#191A24] border border-zinc-300 dark:border-white/[0.12] px-3 text-sm focus:outline-none focus:border-rose-400/60"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                Personality & Traits
              </label>
              <textarea
                rows={2}
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="e.g. Witty, bold, wearing black kurti with long dark hair, gets shy around you..."
                maxLength={180}
                className="w-full rounded-xl bg-zinc-100 dark:bg-[#191A24] border border-zinc-300 dark:border-white/[0.12] p-3 text-sm resize-none focus:outline-none focus:border-rose-400/60"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                Speaking Style (Optional)
              </label>
              <input
                type="text"
                value={speakingStyle}
                onChange={(e) => setSpeakingStyle(e.target.value)}
                placeholder="e.g. Sarcastic Hinglish with playful nicknames"
                maxLength={100}
                className="w-full min-h-[44px] rounded-xl bg-zinc-100 dark:bg-[#191A24] border border-zinc-300 dark:border-white/[0.12] px-3 text-sm focus:outline-none focus:border-rose-400/60"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[46px] rounded-xl bg-zinc-200/80 dark:bg-white/10 border border-zinc-300 dark:border-white/15 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generatingPortrait}
                className="flex-[1.5] min-h-[46px] rounded-xl bg-[#BE123C] hover:bg-[#9F1239] disabled:opacity-60 text-white text-sm font-bold inline-flex items-center justify-center gap-1.5 shadow-lg transition"
              >
                {generatingPortrait ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Matching...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add To Story
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {generatedPortraitUrl && (
        <PortraitLightboxModal
          items={[
            {
              character: {
                id: 'preview',
                name: name.trim() || 'New Character',
                age: age.trim() || undefined,
                gender,
                role: role.trim() || 'Custom Story Role',
                personality:
                  personality.trim() || 'Expressive custom character tailored to your story.',
                speakingStyle: speakingStyle.trim() || 'Natural Hinglish',
                relationshipToUser: relationshipToUser.trim() || 'Entering your story',
                portrait: generatedPortraitUrl,
                accentColor,
              },
              subtitle: storyTitle,
            },
          ]}
          activeIndex={previewOpen ? 0 : null}
          onClose={() => setPreviewOpen(false)}
          onChangeIndex={() => {}}
        />
      )}
    </>
  );
};
