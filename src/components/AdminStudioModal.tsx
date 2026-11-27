import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { Plus, Save, X } from 'lucide-react';
import { STORY_CATEGORIES } from '../data/stories';
import { saveAdminStory } from '../lib/firestoreService';
import type { StoryDefinition } from '../types/story';

interface AdminStudioModalProps {
  user: User;
  customStories: StoryDefinition[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export const AdminStudioModal: React.FC<AdminStudioModalProps> = ({
  user,
  customStories,
  onClose,
  onSaved,
}) => {
  const [storyId, setStoryId] = useState('');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [about, setAbout] = useState('');
  const [category, setCategory] = useState('Drama');
  const [tagsText, setTagsText] = useState('Roleplay, Drama');
  const [coverImage, setCoverImage] = useState('/src/assets/images/scene_campus_corridor_1795460773005.jpg');
  const [openingScene, setOpeningScene] = useState('');
  const [charName, setCharName] = useState('');
  const [charRole, setCharRole] = useState('Lead Character');
  const [charPersonality, setCharPersonality] = useState('');
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadExisting = (s: StoryDefinition) => {
    setStoryId(s.id);
    setTitle(s.title);
    setTagline(s.tagline);
    setAbout(s.about);
    setCategory(s.primaryCategory);
    setTagsText(s.tags.join(', '));
    setCoverImage(s.coverImage);
    setOpeningScene(s.openingScene);
    setCharName(s.characters[0]?.name || '');
    setCharRole(s.characters[0]?.role || 'Lead');
    setCharPersonality(s.characters[0]?.personality || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const cleanId =
        storyId.trim() ||
        title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .slice(0, 48);

      await saveAdminStory(user, {
        id: cleanId,
        title,
        tagline,
        about,
        primaryCategory: category,
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        coverImage,
        openingScene: openingScene || tagline,
        published,
        characters: [
          {
            id: `${cleanId}_lead`,
            name: charName.trim() || 'Aarav',
            role: charRole.trim() || 'Lead',
            personality: charPersonality.trim() || 'Charismatic and guarded.',
            speakingStyle: 'Natural conversational Hinglish/English',
            relationshipToUser: 'Central character',
            portrait: coverImage,
          },
        ],
      });
      setStatusMsg('Story saved and published to Firestore.');
      await onSaved();
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Unable to save story.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-3xl bg-[#14141A] border border-white/[0.12] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white">Story Admin Studio</h2>
            <p className="text-xs text-zinc-400">
              Server-verified Firestore story management ({user.email})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full bg-white/5 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {customStories.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-400">Edit Existing Cloud Stories</div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {customStories.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => loadExisting(s)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-200 whitespace-nowrap"
                >
                  {s.title}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setStoryId('');
                  setTitle('');
                  setTagline('');
                  setAbout('');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#E5233D]/20 text-xs text-[#F43F5E] inline-flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" /> New Story
              </button>
            </div>
          </div>
        )}

        {statusMsg && (
          <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-zinc-200">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Story Title"
              required
              className="w-full min-h-[44px] rounded-xl bg-[#0C0C10] border border-white/10 px-3.5 text-sm text-white"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full min-h-[44px] rounded-xl bg-[#0C0C10] border border-white/10 px-3.5 text-sm text-white"
            >
              {STORY_CATEGORIES.filter((c) => !['For You', 'New', 'By Fans', 'Top 50'].includes(c)).map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                )
              )}
            </select>
          </div>

          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Short Tagline"
            required
            className="w-full min-h-[44px] rounded-xl bg-[#0C0C10] border border-white/10 px-3.5 text-sm text-white"
          />

          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Story Description / Plot"
            rows={3}
            required
            className="w-full rounded-xl bg-[#0C0C10] border border-white/10 p-3.5 text-sm text-white"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Cover Image URL"
              required
              className="w-full min-h-[44px] rounded-xl bg-[#0C0C10] border border-white/10 px-3.5 text-sm text-white"
            />
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Comma-separated tags"
              className="w-full min-h-[44px] rounded-xl bg-[#0C0C10] border border-white/10 px-3.5 text-sm text-white"
            />
          </div>

          <input
            type="text"
            value={openingScene}
            onChange={(e) => setOpeningScene(e.target.value)}
            placeholder="Opening Scene Setting"
            className="w-full min-h-[44px] rounded-xl bg-[#0C0C10] border border-white/10 px-3.5 text-sm text-white"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              placeholder="Main Character Name"
              className="w-full min-h-[44px] rounded-xl bg-[#0C0C10] border border-white/10 px-3.5 text-sm text-white"
            />
            <input
              type="text"
              value={charRole}
              onChange={(e) => setCharRole(e.target.value)}
              placeholder="Character Role"
              className="w-full min-h-[44px] rounded-xl bg-[#0C0C10] border border-white/10 px-3.5 text-sm text-white"
            />
          </div>

          <input
            type="text"
            value={charPersonality}
            onChange={(e) => setCharPersonality(e.target.value)}
            placeholder="Character Personality"
            className="w-full min-h-[44px] rounded-xl bg-[#0C0C10] border border-white/10 px-3.5 text-sm text-white"
          />

          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="accent-[#E5233D]"
            />
            Publish story immediately in catalog
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[46px] rounded-xl bg-[#E5233D] hover:bg-[#cc1e35] font-semibold text-sm text-white inline-flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Story'}
          </button>
        </form>
      </div>
    </div>
  );
};
