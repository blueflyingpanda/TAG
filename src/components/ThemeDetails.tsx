import { useEffect, useState } from "react";
import type { Theme, User } from "../types";
import {
  addThemeToFavorites,
  getTheme,
  removeThemeFromFavorites,
} from "../utils/themes";

interface ThemeDetailsProps {
  user: User;
  themeId: number;
  onBack: (filters?: URLSearchParams) => void;
  onThemeSelect?: (theme: Theme) => void;
  filters?: URLSearchParams;
}

function renderDifficultyStars(difficulty: number): string {
  const stars = "⭐".repeat(difficulty);
  const emptyStars = "☆".repeat(5 - difficulty);
  return stars + emptyStars;
}

function renderVerificationStatus(verified: boolean): string {
  return verified ? "✅ Verified" : "❌ Unverified";
}

export default function ThemeDetails({
  user,
  themeId,
  onBack,
  onThemeSelect,
  filters,
}: ThemeDetailsProps) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    const fetchThemeDetails = async () => {
      try {
        setLoading(true);
        const themeData = await getTheme(themeId);
        setTheme(themeData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch theme details:", err);
        setError("Failed to load theme details");
      } finally {
        setLoading(false);
      }
    };

    fetchThemeDetails();
  }, [themeId]);

  const handleToggleFavorite = async () => {
    if (!theme || isTogglingFavorite) return;

    try {
      setIsTogglingFavorite(true);
      if (theme.is_favorited) {
        await removeThemeFromFavorites(theme.id);
        setTheme({
          ...theme,
          is_favorited: false,
          likes_count: (theme.likes_count || 0) - 1,
        });
      } else {
        await addThemeToFavorites(theme.id);
        setTheme({
          ...theme,
          is_favorited: true,
          likes_count: (theme.likes_count || 0) + 1,
        });
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setError("Failed to update favorite status");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-8 shadow-sm">
        <div className="text-center text-text/80">Loading theme details...</div>
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-8 shadow-sm">
        <div className="mb-4 text-center text-error">
          {error || "Theme not found"}
        </div>
        <button
          type="button"
          onClick={() => onBack(filters)}
          className="rounded-game bg-success px-6 py-2 font-semibold text-white transition hover:opacity-90"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onBack(filters)}
          className="rounded-game border border-text/15 bg-text/[0.06] px-4 py-2 font-semibold text-text transition hover:bg-text/10"
        >
          ← Back
        </button>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {user && (
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              className={`flex items-center gap-2 rounded-game px-4 py-2 font-semibold transition ${
                theme.is_favorited
                  ? "bg-error text-white hover:opacity-90"
                  : "border border-text/15 bg-text/[0.06] text-text hover:bg-text/10"
              } disabled:opacity-50`}
            >
              {theme.is_favorited ? "❤️" : "🤍"} {theme.likes_count || 0}
            </button>
          )}

          {onThemeSelect && (
            <button
              type="button"
              onClick={() => onThemeSelect(theme)}
              className="rounded-game bg-success px-6 py-2 font-semibold text-white transition hover:opacity-90"
            >
              Select Theme
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-text">{theme.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-text/80">
            <span>Language: {theme.language.toUpperCase()}</span>
            <span>Difficulty: {renderDifficultyStars(theme.difficulty)}</span>
            <span>Status: {renderVerificationStatus(theme.verified)}</span>
            <span>Visibility: {theme.public ? "Public" : "Private"}</span>
          </div>
          {theme.creator && (
            <div className="mt-2 text-text/60">
              Created by: {theme.creator.email}
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-semibold text-text">
              Teams ({theme.description.teams.length})
            </h2>
            <div className="max-h-64 overflow-y-auto rounded-game border border-text/10 bg-text/[0.04] p-4">
              <div className="grid grid-cols-2 gap-2">
                {theme.description.teams.map((team, index) => (
                  <div
                    key={index}
                    className="rounded-game bg-card p-2 text-sm text-text/80"
                  >
                    {team}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-text">
              Words ({theme.description.words.length})
            </h2>
            <div className="max-h-64 overflow-y-auto rounded-game border border-text/10 bg-text/[0.04] p-4">
              <div className="grid grid-cols-3 gap-2">
                {theme.description.words.slice(0, 50).map((word, index) => (
                  <div
                    key={index}
                    className="rounded-game bg-card p-2 text-sm text-text/80"
                  >
                    {word}
                  </div>
                ))}
                {theme.description.words.length > 50 && (
                  <div className="col-span-3 p-2 text-center text-sm text-text/60">
                    ... and {theme.description.words.length - 50} more words
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {theme.played_count !== undefined && (
          <div className="text-text/60">
            Played {theme.played_count} times
            {theme.last_played &&
              ` • Last played: ${new Date(
                theme.last_played,
              ).toLocaleDateString()}`}
          </div>
        )}
      </div>
    </div>
  );
}
