import { useState } from "react";
import { useLocale } from "../contexts/LocaleContext";
import type { Theme, User } from "../types";
import { createTheme } from "../utils/themes";

interface CreateThemeProps {
  user: User;
  onBack: () => void;
  onThemeCreated?: (theme: Theme) => void;
}

export default function CreateTheme({ user: _user, onBack, onThemeCreated }: CreateThemeProps) {
  const { t } = useLocale();
  const [lang, setLang] = useState("en");
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [teams, setTeams] = useState<string[]>([""]);
  const [words, setWords] = useState<{ text: string; difficulty: number }[]>([{ text: "", difficulty: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validateTheme = (): string | null => {
    if (!name.trim()) return t.ct_errNameRequired;
    if (name.length > 64) return t.ct_errNameTooLong;
    const nameWords = name.trim().split(/\s+/);
    if (nameWords.length > 10) return t.ct_errNameTooManyWords;

    const validTeams = teams.filter((t) => t.trim());
    if (validTeams.length !== 10) return t.ct_errTeamsCount;

    const teamNameMap = new Map<string, string[]>();
    for (const team of validTeams) {
      const lower = team.trim().toLowerCase();
      if (!teamNameMap.has(lower)) teamNameMap.set(lower, []);
      teamNameMap.get(lower)!.push(team.trim());
    }
    const duplicateTeams = Array.from(teamNameMap.entries())
      .filter(([, originals]) => originals.length > 1)
      .map(([_lower, originals]) => `"${originals[0]}"`);
    if (duplicateTeams.length > 0) return t.ct_errTeamsDuplicate(duplicateTeams.join(", "));

    for (const team of validTeams) {
      if (team.length > 64) return t.ct_errTeamNameTooLong(team);
      if (team.trim().split(/\s+/).length > 10) return t.ct_errTeamNameTooManyWords(team);
    }

    const validWords = words.filter((w) => w.text.trim());
    const difficultyOneWords = validWords.filter((w) => w.difficulty === 1);
    if (difficultyOneWords.length < 30) return t.ct_errWordsMin;

    const wordMap = new Map<string, string[]>();
    for (const word of validWords) {
      const lower = word.text.trim().toLowerCase();
      if (!wordMap.has(lower)) wordMap.set(lower, []);
      wordMap.get(lower)!.push(word.text.trim());
    }
    const duplicateWords = Array.from(wordMap.entries())
      .filter(([, originals]) => originals.length > 1)
      .map(([_lower, originals]) => `"${originals[0]}"`);
    if (duplicateWords.length > 0) return t.ct_errWordsDuplicate(duplicateWords.join(", "));

    for (const word of validWords) {
      if (word.text.length > 64) return t.ct_errWordTooLong(word.text);
      if (word.text.trim().split(/\s+/).length > 10) return t.ct_errWordTooManyWords(word.text);
      if (word.difficulty < 1 || word.difficulty > 5) return t.ct_errWordDifficulty(word.text);
    }

    return null;
  };

  const handleSubmit = async () => {
    setError("");
    const validationError = validateTheme();
    if (validationError) {
      setError(validationError);
      try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
      return;
    }

    setIsSubmitting(true);
    const themePayload = {
      name: name.trim(),
      language: lang,
      public: isPublic,
      description: {
        words: Object.fromEntries(
          words.filter((w) => w.text.trim()).map((w) => [w.text.trim(), { difficulty: w.difficulty }]),
        ),
        teams: teams.filter((t) => t.trim()).map((t) => t.trim()),
      },
    };

    try {
      const createdTheme = await createTheme(themePayload);
      if (onThemeCreated) onThemeCreated(createdTheme);
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.ct_errFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTeam = () => {
    const newIndex = teams.length;
    setTeams([...teams, ""]);
    setTimeout(() => {
      (document.getElementById(`team-input-${newIndex}`) as HTMLInputElement | null)?.focus();
    }, 0);
  };

  const removeTeam = (index: number) => {
    if (teams.length > 1) setTeams(teams.filter((_, i) => i !== index));
  };

  const updateTeam = (index: number, value: string) => {
    const newTeams = [...teams];
    newTeams[index] = value;
    setTeams(newTeams);
  };

  const addWord = () => setWords([...words, { text: "", difficulty: 1 }]);
  const removeWord = (index: number) => setWords(words.filter((_, i) => i !== index));

  const updateWord = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], text: value };
    setWords(newWords);
  };

  const updateWordDifficulty = (index: number, difficulty: number) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], difficulty };
    setWords(newWords);
  };

  const importWords = (text: string) => {
    const imported = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0).map((line) => ({ text: line, difficulty: 1 }));
    setWords([...words.filter((w) => w.text.trim()), ...imported]);
  };

  const inputClass = "w-full rounded-game border border-text/15 bg-card px-4 py-2 text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-success";

  return (
    <div className="mx-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-game bg-card p-6 shadow-sm md:p-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-text">{t.ct_title}</h1>
      <p className="mb-6 text-center text-sm text-text/60">{t.ct_unverifiedNote}</p>

      {error && (
        <div className="mb-4 rounded-game border border-error/40 bg-error/10 p-4 text-sm text-error">{error}</div>
      )}

      <div className="space-y-6">
        <div>
          <label className="mb-2 block font-semibold text-text">{t.ct_language}</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className={inputClass}>
            <option value="en">{t.ts_langEnglish}</option>
            <option value="ru">{t.ts_langRussian}</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-text">{t.ct_public}</label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-public"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 accent-success"
            />
            <label htmlFor="is-public" className="text-text/80">{t.ct_makePublic}</label>
          </div>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-text">{t.ct_nameLabel}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.ct_namePlaceholder}
            className={inputClass}
            maxLength={64}
          />
          <p className="mt-1 text-xs text-text/60">
            {t.ct_nameCounter(name.length, name.trim().split(/\s+/).filter((w) => w).length)}
          </p>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-text">{t.ct_teamsLabel}</label>
          {teams.map((team, index) => (
            <div key={index} className="mb-2 flex gap-2">
              <input
                id={`team-input-${index}`}
                type="text"
                value={team}
                onChange={(e) => updateTeam(index, e.target.value)}
                placeholder={t.ct_teamPlaceholder(index + 1)}
                className={`flex-1 ${inputClass}`}
                maxLength={64}
              />
              {teams.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTeam(index)}
                  className="rounded-game border border-error/30 bg-error/10 px-4 py-2 text-sm font-semibold text-error transition hover:bg-error/20"
                >
                  {t.ct_removeTeam}
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addTeam}
              className="mt-2 rounded-game bg-success px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={teams.length >= 10}
            >
              {t.ct_addTeam}
            </button>
            <span className="text-sm text-text/60">
              {t.ct_teamsCounter(teams.filter((t) => t.trim()).length, teams.length)}
            </span>
          </div>
          {teams.filter((t) => t.trim()).length !== 10 && (
            <p className="mt-2 text-sm text-error">{t.ct_teamsError}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block font-semibold text-text">{t.ct_wordsLabel}</label>
          <div className="mb-2">
            <button
              type="button"
              onClick={() => {
                const text = prompt(t.ct_importFromText);
                if (text) importWords(text);
              }}
              className="rounded-game border border-text/15 bg-text/[0.06] px-4 py-2 text-sm font-semibold text-text transition hover:bg-text/10"
            >
              {t.ct_importFromText}
            </button>
          </div>
          <div className="mb-2 max-h-64 space-y-2 overflow-y-auto">
            {words.map((word, index) => (
              <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={word.text}
                  onChange={(e) => updateWord(index, e.target.value)}
                  placeholder={t.ct_wordPlaceholder(index + 1)}
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
                        onClick={() => updateWordDifficulty(index, level)}
                        className={`rounded-full px-2 py-1 text-base transition ${level <= word.difficulty ? "text-success" : "text-text/40"}`}
                        aria-label={t.ct_setDifficulty(level)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeWord(index)}
                  className="rounded-game border border-error/30 bg-error/10 px-3 py-2 text-sm font-semibold text-error transition hover:bg-error/20"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addWord}
              className="rounded-game bg-success px-4 py-2 font-semibold text-white transition hover:opacity-90"
            >
              {t.ct_addWord}
            </button>
            <span className="text-sm text-text/60">
              {t.ct_wordsCounter(words.filter((w) => w.text.trim() && w.difficulty === 1).length)}
            </span>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-game border border-text/15 bg-text/[0.06] px-6 py-3 font-semibold text-text transition hover:bg-text/10 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {t.ct_cancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-game bg-success px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t.ct_submitting : t.ct_submit}
          </button>
        </div>
      </div>
    </div>
  );
}
