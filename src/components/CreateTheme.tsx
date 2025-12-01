import { useState } from "react";
import type { Theme } from "../types";

interface CreateThemeProps {
  user: { id: string; email: string; username: string };
  onBack: () => void;
  onThemeCreated?: (theme: Theme) => void;
}

export default function CreateTheme({
  user: _user,
  onBack,
  onThemeCreated,
}: CreateThemeProps) {
  const [lang, setLang] = useState("en");
  const [name, setName] = useState("");
  const [teams, setTeams] = useState<string[]>([""]);
  const [words, setWords] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validateTheme = (): string | null => {
    // Name validation
    if (!name.trim()) {
      return "Theme name is required";
    }
    if (name.length > 64) {
      return "Theme name must be 64 characters or less";
    }
    const nameWords = name.trim().split(/\s+/);
    if (nameWords.length > 10) {
      return "Theme name must be 10 words or less";
    }

    // Teams validation - require exactly 10 teams
    const validTeams = teams.filter((t) => t.trim());
    if (validTeams.length !== 10) {
      return "Theme must contain exactly 10 teams";
    }
    for (const team of validTeams) {
      if (team.length > 64) {
        return `Team name "${team}" must be 64 characters or less`;
      }
      const teamWords = team.trim().split(/\s+/);
      if (teamWords.length > 10) {
        return `Team name "${team}" must be 10 words or less`;
      }
    }

    // Words validation
    const validWords = words.filter((w) => w.trim());
    if (validWords.length < 100) {
      return "Theme must have at least 100 words";
    }
    for (const word of validWords) {
      if (word.length > 64) {
        return `Word "${word}" must be 64 characters or less`;
      }
      const wordWords = word.trim().split(/\s+/);
      if (wordWords.length > 10) {
        return `Word "${word}" must be 10 words or less`;
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    setError("");
    const validationError = validateTheme();
    if (validationError) {
      setError(validationError);
      // Bring validation error into view so user notices it
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {}
      return;
    }

    setIsSubmitting(true);

    const theme: Theme = {
      lang,
      name: name.trim(),
      teams: teams.filter((t) => t.trim()).map((t) => t.trim()),
      words: words.filter((w) => w.trim()).map((w) => w.trim()),
    };

    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/themes', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(theme),
      // });
      // if (!response.ok) throw new Error('Failed to create theme');

      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Theme created (would be sent to backend):", theme);

      if (onThemeCreated) {
        onThemeCreated(theme);
      }

      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create theme");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTeam = () => {
    const newIndex = teams.length;
    setTeams([...teams, ""]);
    // Focus the newly added input after DOM updates
    setTimeout(() => {
      const el = document.getElementById(
        `team-input-${newIndex}`
      ) as HTMLInputElement | null;
      el?.focus();
    }, 0);
  };

  const removeTeam = (index: number) => {
    if (teams.length > 1) {
      setTeams(teams.filter((_, i) => i !== index));
    }
  };

  const updateTeam = (index: number, value: string) => {
    const newTeams = [...teams];
    newTeams[index] = value;
    setTeams(newTeams);
  };

  const addWord = () => {
    setWords([...words, ""]);
  };

  const removeWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const updateWord = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const importWords = (text: string) => {
    const imported = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    setWords([...words.filter((w) => w.trim()), ...imported]);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Create Theme
      </h1>
      <p className="text-white/60 text-sm mb-6 text-center">
        New themes will be marked as unverified until admin review
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="text-white font-semibold mb-2 block">
            Language *
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#ECACAE]"
          >
            <option value="en">English</option>
            <option value="ru">Russian</option>
          </select>
        </div>

        <div>
          <label className="text-white font-semibold mb-2 block">
            Theme Name * (max 64 chars, max 10 words)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Harry Potter"
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#ECACAE]"
            maxLength={64}
          />
          <p className="text-white/60 text-xs mt-1">
            {name.length}/64 characters •{" "}
            {
              name
                .trim()
                .split(/\s+/)
                .filter((w) => w).length
            }
            /10 words
          </p>
        </div>

        <div>
          <label className="text-white font-semibold mb-2 block">
            Teams * (exactly 10 teams, each max 64 chars, max 10 words)
          </label>
          {teams.map((team, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                id={`team-input-${index}`}
                type="text"
                value={team}
                onChange={(e) => updateTeam(index, e.target.value)}
                placeholder={`Team ${index + 1}`}
                className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#ECACAE]"
                maxLength={64}
              />
              {teams.length > 1 && (
                <button
                  onClick={() => removeTeam(index)}
                  className="px-4 py-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <button
              onClick={addTeam}
              className="mt-2 px-4 py-2 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
              disabled={teams.length >= 10}
            >
              + Add Team
            </button>
            <span className="text-white/60 text-sm">
              {teams.filter((t) => t.trim()).length} filled • {teams.length}{" "}
              entries • 10 required
            </span>
          </div>
          {teams.filter((t) => t.trim()).length !== 10 && (
            <p className="text-yellow-300 text-sm mt-2">
              You must provide exactly 10 filled team names to create a theme.
            </p>
          )}
        </div>

        <div>
          <label className="text-white font-semibold mb-2 block">
            Words * (min 100, each max 64 chars, max 10 words)
          </label>
          <div className="mb-2">
            <button
              onClick={() => {
                const text = prompt("Paste words (one per line):");
                if (text) importWords(text);
              }}
              className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition text-sm"
            >
              Import from Text (one per line)
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2 mb-2">
            {words.map((word, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => updateWord(index, e.target.value)}
                  placeholder={`Word ${index + 1}`}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#ECACAE] text-sm"
                  maxLength={64}
                />
                <button
                  onClick={() => removeWord(index)}
                  className="px-3 py-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={addWord}
              className="px-4 py-2 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
            >
              + Add Word
            </button>
            <span className="text-white/60 text-sm">
              {words.filter((w) => w.trim()).length} / 100 words (minimum)
            </span>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:opacity-90 transition"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Create Theme"}
          </button>
        </div>
      </div>
    </div>
  );
}
