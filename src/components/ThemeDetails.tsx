import { useEffect, useState } from "react";
import { useLocale } from "../contexts/LocaleContext";
import type { GameSettings, Theme, User } from "../types";
import GameSetup from "./GameSetup";
import { trackEvent } from "../utils/analytics";
import { addThemeToFavorites, getTheme, removeThemeFromFavorites } from "../utils/themes";

interface ThemeDetailsProps {
  user: User | null;
  onLogin?: () => void;
  themeId: number;
  onBack: (filters?: URLSearchParams) => void;
  onStart: (settings: GameSettings) => void;
  onEdit?: () => void;
  filters?: URLSearchParams;
}

export default function ThemeDetails({
  user,
  onLogin,
  themeId,
  onBack,
  onStart,
  onEdit,
  filters,
}: ThemeDetailsProps) {
  const { t } = useLocale();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [copied, setCopied] = useState(false);
  const wordList = theme ? Object.keys(theme.description.words) : [];

  useEffect(() => {
    const fetchThemeDetails = async () => {
      try {
        setLoading(true);
        const themeData = await getTheme(themeId);
        setTheme(themeData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch theme details:", err);
        setError(t.td_failedLoad);
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
        setTheme({ ...theme, is_favorited: false, likes_count: (theme.likes_count || 0) - 1 });
      } else {
        await addThemeToFavorites(theme.id);
        setTheme({ ...theme, is_favorited: true, likes_count: (theme.likes_count || 0) + 1 });
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setError(t.td_failedFavorite);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-8 shadow-sm">
        <div className="text-center text-text/80">{t.td_loading}</div>
      </div>
    );
  }

  if (error || !theme) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-8 shadow-sm">
        <div className="mb-4 text-center text-error">{error || t.td_notFound}</div>
        <button
          type="button"
          onClick={() => onBack(filters)}
          className="rounded-game bg-success px-6 py-2 font-semibold text-white transition hover:opacity-90"
        >
          {t.td_back}
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
          {t.td_back}
        </button>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <button
              type="button"
              onClick={user ? handleToggleFavorite : onLogin}
              disabled={isTogglingFavorite}
              className={`flex items-center gap-2 rounded-game px-4 py-2 font-semibold transition ${
                theme.is_favorited
                  ? "bg-error text-white hover:opacity-90"
                  : "border border-text/15 bg-text/[0.06] text-text hover:bg-text/10"
              } disabled:opacity-50`}
            >
              {theme.is_favorited ? "❤️" : "🤍"} {theme.likes_count || 0}
            </button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(
                `https://blueflyingpanda.github.io/TAG/theme/${theme.id}/`,
              );
              trackEvent("theme_shared", { theme_id: theme.id, method: "copy_link" });
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="rounded-game border border-text/15 bg-text/[0.06] px-4 py-2 font-semibold text-text transition hover:bg-text/10"
          >
            {copied ? t.td_copied : t.td_share}
          </button>

          {onEdit && user && (user.admin || user.email === theme.creator?.email) && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-game border border-text/15 bg-text/[0.06] px-4 py-2 font-semibold text-text transition hover:bg-text/10"
            >
              {t.et_edit}
            </button>
          )}

        </div>
      </div>

      <div className="space-y-6">
        {theme.cover_image_url && (
          <div className="aspect-video w-full max-w-xl overflow-hidden rounded-game border border-text/10">
            <img src={theme.cover_image_url} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div>
          <h1 className="mb-2 text-3xl font-bold text-text">{theme.name}</h1>
          {theme.summary && <p className="mb-2 text-text/80">{theme.summary}</p>}
          <div className="flex flex-wrap items-center gap-4 text-text/80">
            <span>{t.td_language(theme.language.toUpperCase())}</span>
            <span>{theme.verified ? t.td_verified : t.td_unverified}</span>
            <span>{t.td_visibility(theme.public)}</span>
          </div>
          {theme.creator && (
            <div className="mt-2 text-text/60">
              {t.td_createdBy(theme.creator.email ?? theme.creator.username ?? '')}
            </div>
          )}
        </div>

        <GameSetup theme={theme} onStart={onStart} />

        <details className="group rounded-game border border-text/10 bg-text/[0.04] p-4">
          <summary className="cursor-pointer select-none text-lg font-semibold text-text">
            {t.td_words(wordList.length)}
          </summary>
          <div className="mt-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {wordList.slice(0, 50).map((word, index) => (
                <div key={index} className="rounded-game bg-card p-2 text-sm text-text/80">
                  {word}
                </div>
              ))}
              {wordList.length > 50 && (
                <div className="col-span-full p-2 text-center text-sm text-text/60">
                  {t.td_moreWords(wordList.length - 50)}
                </div>
              )}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
