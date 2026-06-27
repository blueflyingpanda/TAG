import { useEffect, useState } from "react";
import { useLocale } from "../contexts/LocaleContext";
import type { Theme, User } from "../types";
import { getTheme, patchThemeVisibility, updateTheme } from "../utils/themes";

interface EditThemeProps {
  user: User;
  themeId: number;
  onBack: () => void;
  onSaved: (theme: Theme) => void;
}

export default function EditTheme({ user: _user, themeId, onBack, onSaved }: EditThemeProps) {
  const { t } = useLocale();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [newWords, setNewWords] = useState<{ text: string; difficulty: number }[]>([{ text: "", difficulty: 1 }]);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [error, setError] = useState("");
  const [visibilityError, setVisibilityError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getTheme(themeId);
        if (cancelled) return;
        setTheme(data);
        setName(data.name);
        setIsPublic(data.public);
      } catch {
        if (!cancelled) setError(t.et_errFailed);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [themeId]);

  const handleVisibilityToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!theme || isTogglingVisibility) return;
    const next = e.target.checked;
    setVisibilityError("");
    setIsTogglingVisibility(true);
    try {
      const updated = await patchThemeVisibility(theme.id, { public: next });
      setIsPublic(updated.public);
      setTheme(updated);
    } catch (err) {
      setVisibilityError(
        err instanceof Error && err.message === "forbidden"
          ? t.et_errForbidden
          : t.et_errVisibility,
      );
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const addWord = () => setNewWords([...newWords, { text: "", difficulty: 1 }]);
  const removeWord = (i: number) => setNewWords(newWords.filter((_, idx) => idx !== i));
  const updateWordText = (i: number, val: string) => {
    const next = [...newWords];
    next[i] = { ...next[i], text: val };
    setNewWords(next);
  };
  const updateWordDifficulty = (i: number, difficulty: number) => {
    const next = [...newWords];
    next[i] = { ...next[i], difficulty };
    setNewWords(next);
  };

  const handleSave = async () => {
    if (!theme) return;
    setError("");

    if (!name.trim()) { setError(t.ct_errNameRequired); return; }
    if (name.length > 64) { setError(t.ct_errNameTooLong); return; }
    if (name.trim().split(/\s+/).length > 10) { setError(t.ct_errNameTooManyWords); return; }

    const validNew = newWords.filter((w) => w.text.trim());

    for (const { text } of validNew) {
      if (text.length > 64) { setError(t.ct_errWordTooLong(text)); return; }
      if (text.split(/\s+/).length > 10) { setError(t.ct_errWordTooManyWords(text)); return; }
      if (text.trim().length === 0) continue;
    }

    // Duplicates within new words list
    const newLower = validNew.map((w) => w.text.trim().toLowerCase());
    if (new Set(newLower).size !== newLower.length) {
      const seen = new Set<string>();
      const dupes = newLower.filter((w) => { if (seen.has(w)) return true; seen.add(w); return false; });
      setError(t.ct_errWordsDuplicate([...new Set(dupes)].map((w) => `"${w}"`).join(", ")));
      return;
    }

    // Duplicates against existing words
    const existingLower = new Set(Object.keys(theme.description.words).map((w) => w.toLowerCase()));
    const clashes = validNew.filter((w) => existingLower.has(w.text.trim().toLowerCase()));
    if (clashes.length > 0) {
      setError(t.et_errWordDuplicate(clashes.slice(0, 3).map((w) => `"${w.text.trim()}"`).join(", ")));
      return;
    }

    setIsSaving(true);
    try {
      const mergedWords = {
        ...theme.description.words,
        ...Object.fromEntries(validNew.map((w) => [w.text.trim(), { difficulty: w.difficulty }])),
      };
      const updated = await updateTheme(theme.id, {
        name: name.trim(),
        description: { words: mergedWords, teams: theme.description.teams },
      });
      onSaved(updated);
    } catch (err) {
      setError(
        err instanceof Error && err.message === "forbidden"
          ? t.et_errForbidden
          : t.et_errFailed,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-game border border-text/15 bg-card px-4 py-2 text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-success";

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-8 shadow-sm">
        <div className="text-center text-text/80">{t.td_loading}</div>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-8 shadow-sm">
        <div className="mb-4 text-center text-error">{error || t.td_notFound}</div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-game bg-success px-6 py-2 font-semibold text-white transition hover:opacity-90"
        >
          {t.td_back}
        </button>
      </div>
    );
  }

  const existingWordList = Object.keys(theme.description.words);

  return (
    <div className="mx-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-game bg-card p-6 shadow-sm md:p-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-text">{t.et_title}</h1>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="mb-2 block font-semibold text-text">{t.et_nameLabel}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            maxLength={64}
          />
          <p className="mt-1 text-xs text-text/60">
            {t.ct_nameCounter(name.length, name.trim().split(/\s+/).filter(Boolean).length)}
          </p>
        </div>

        {/* Visibility — calls PATCH immediately on toggle */}
        <div>
          <label className="mb-2 block font-semibold text-text">{t.et_visibilityLabel}</label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-is-public"
              checked={isPublic}
              onChange={handleVisibilityToggle}
              disabled={isTogglingVisibility}
              className="h-4 w-4 accent-success disabled:cursor-not-allowed"
            />
            <label htmlFor="edit-is-public" className="text-text/80">{t.ct_makePublic}</label>
            {isTogglingVisibility && (
              <span className="text-sm text-text/60">{t.et_updatingVisibility}</span>
            )}
          </div>
          {visibilityError && <p className="mt-1 text-sm text-error">{visibilityError}</p>}
        </div>

        {/* Teams (read-only) */}
        <div>
          <label className="mb-2 block font-semibold text-text">{t.et_teamsLabel}</label>
          <div className="grid grid-cols-2 gap-2 rounded-game border border-text/10 bg-text/[0.04] p-4 md:grid-cols-3">
            {theme.description.teams.map((team, i) => (
              <div key={i} className="rounded-game bg-card p-2 text-sm text-text/80">
                {team}
              </div>
            ))}
          </div>
        </div>

        {/* Existing words (read-only) */}
        <div>
          <label className="mb-2 block font-semibold text-text">
            {t.et_existingWords(existingWordList.length)}
          </label>
          <div className="max-h-48 overflow-y-auto rounded-game border border-text/10 bg-text/[0.04] p-4">
            <div className="grid grid-cols-3 gap-2">
              {existingWordList.map((word, i) => (
                <div key={i} className="rounded-game bg-card p-2 text-sm text-text/70">
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* New words to add */}
        <div>
          <label className="mb-1 block font-semibold text-text">{t.et_addWordsLabel}</label>
          <p className="mb-3 text-sm text-text/60">{t.et_addWordsHint}</p>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {newWords.map((word, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={word.text}
                  onChange={(e) => updateWordText(i, e.target.value)}
                  placeholder={t.ct_wordPlaceholder(i + 1)}
                  className={`flex-1 text-sm ${inputClass}`}
                  maxLength={64}
                />
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-text/80">{t.ct_difficulty}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updateWordDifficulty(i, level)}
                        className={`rounded-full px-2 py-1 text-base transition ${
                          level <= word.difficulty ? "text-success" : "text-text/40"
                        }`}
                        aria-label={t.ct_setDifficulty(level)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                {newWords.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWord(i)}
                    className="rounded-game border border-error/30 bg-error/10 px-3 py-2 text-sm font-semibold text-error transition hover:bg-error/20"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addWord}
            className="mt-2 rounded-game bg-success px-4 py-2 font-semibold text-white transition hover:opacity-90"
          >
            {t.ct_addWord}
          </button>

          {/* Error shown here, under the words section */}
          {error && (
            <div className="mt-3 rounded-game border border-error/40 bg-error/10 p-3 text-sm text-error">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isSaving}
            className="flex-1 rounded-game border border-text/15 bg-text/[0.06] px-6 py-3 font-semibold text-text transition hover:bg-text/10 disabled:opacity-50"
          >
            {t.ct_cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 rounded-game bg-success px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? t.et_saving : t.et_save}
          </button>
        </div>
      </div>
    </div>
  );
}
