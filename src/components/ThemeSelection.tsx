import { useEffect, useState } from "react";
import type { Theme, ThemeListItem, ThemeOrderByType, User } from "../types";
import { ThemeOrderBy } from "../types";
import { createTheme, getTheme, getThemes } from "../utils/themes";

interface ThemeSelectionProps {
  user: User | null;
  onThemeSelect: (theme: Theme) => void;
  onCreateTheme?: () => void;
  onThemeDetails?: (themeId: number, filters?: URLSearchParams) => void;
}

function renderDifficultyStars(difficulty: number): string {
  const stars = "⭐".repeat(difficulty);
  const emptyStars = "☆".repeat(5 - difficulty);
  return stars + emptyStars;
}

function renderVerificationStatus(verified: boolean): string {
  return verified ? "✅" : "❌";
}

// URL parameter management
function getFiltersFromURL(): {
  selectedLang: string;
  selectedDifficulty: number | undefined;
  searchTerm: string;
  orderBy: ThemeOrderByType;
  orderDescending: boolean;
  onlyMyThemes: boolean;
  onlyFavorites: boolean;
  showUnverified: boolean;
} {
  const urlParams = new URLSearchParams(window.location.search);

  return {
    selectedLang: urlParams.get("lang") || "en",
    selectedDifficulty: urlParams.get("difficulty")
      ? parseInt(urlParams.get("difficulty")!)
      : undefined,
    searchTerm: urlParams.get("search") || "",
    orderBy: (urlParams.get("order") as ThemeOrderByType) || ThemeOrderBy.ID,
    orderDescending: urlParams.get("descending") === "true",
    onlyMyThemes: urlParams.get("mine") === "true",
    onlyFavorites: urlParams.get("favourites") === "true",
    showUnverified: urlParams.get("unverified") === "true",
  };
}

function updateURLWithFilters(filters: {
  selectedLang: string;
  selectedDifficulty: number | undefined;
  searchTerm: string;
  orderBy: ThemeOrderByType;
  orderDescending: boolean;
  onlyMyThemes: boolean;
  onlyFavorites: boolean;
  showUnverified: boolean;
}) {
  const url = new URL(window.location.href);

  // Clear existing params
  url.search = "";

  // Set new params
  if (filters.selectedLang !== "en")
    url.searchParams.set("lang", filters.selectedLang);
  if (filters.selectedDifficulty)
    url.searchParams.set("difficulty", filters.selectedDifficulty.toString());
  if (filters.searchTerm) url.searchParams.set("search", filters.searchTerm);
  if (filters.orderBy !== ThemeOrderBy.ID)
    url.searchParams.set("order", filters.orderBy);
  if (filters.orderDescending) url.searchParams.set("descending", "true");
  if (filters.onlyMyThemes) url.searchParams.set("mine", "true");
  if (filters.onlyFavorites) url.searchParams.set("favourites", "true");
  if (filters.showUnverified) url.searchParams.set("unverified", "true");

  // Update URL without triggering page reload
  window.history.replaceState({}, "", url.toString());
}

export default function ThemeSelection({
  user,
  onThemeSelect,
  onCreateTheme,
  onThemeDetails,
}: ThemeSelectionProps) {
  // Initialize state from URL parameters
  const initialFilters = getFiltersFromURL();

  const [themes, setThemes] = useState<ThemeListItem[]>([]);
  const [selectedLang, setSelectedLang] = useState(initialFilters.selectedLang);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    number | undefined
  >(initialFilters.selectedDifficulty);
  const [onlyMyThemes, setOnlyMyThemes] = useState(initialFilters.onlyMyThemes);
  const [onlyFavorites, setOnlyFavorites] = useState(
    initialFilters.onlyFavorites,
  );
  const [showUnverified, setShowUnverified] = useState(
    initialFilters.showUnverified,
  );
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm);
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState("");
  const [orderBy, setOrderBy] = useState<ThemeOrderByType>(
    initialFilters.orderBy,
  );
  const [orderDescending, setOrderDescending] = useState(
    initialFilters.orderDescending,
  );

  const fetchThemes = async () => {
    try {
      const response = await getThemes(
        1,
        50,
        selectedLang,
        selectedDifficulty,
        searchTerm || undefined,
        onlyMyThemes,
        showUnverified ? false : undefined, // verified - false when showing unverified, undefined otherwise
        onlyFavorites,
        orderBy,
        orderDescending,
      );
      setThemes(response.items);
    } catch (err) {
      console.error("Failed to fetch themes:", err);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [
    selectedLang,
    selectedDifficulty,
    onlyMyThemes,
    onlyFavorites,
    showUnverified,
    orderBy,
    orderDescending,
  ]);

  // Update URL when filters change
  useEffect(() => {
    updateURLWithFilters({
      selectedLang,
      selectedDifficulty,
      searchTerm,
      orderBy,
      orderDescending,
      onlyMyThemes,
      onlyFavorites,
      showUnverified,
    });
  }, [
    selectedLang,
    selectedDifficulty,
    searchTerm,
    orderBy,
    orderDescending,
    onlyMyThemes,
    onlyFavorites,
    showUnverified,
  ]);

  const handleThemeSelect = async (themeItem: ThemeListItem) => {
    try {
      const fullTheme = await getTheme(themeItem.id);
      onThemeSelect(fullTheme);
    } catch (err) {
      console.error("Failed to load theme details:", err);
    }
  };

  const handleImport = async () => {
    try {
      // Parse the API format theme
      const themeData = JSON.parse(importJson);

      // Basic validation for API format
      if (
        !themeData.name ||
        !themeData.language ||
        typeof themeData.difficulty !== "number" ||
        !themeData.description ||
        !Array.isArray(themeData.description.teams) ||
        !Array.isArray(themeData.description.words)
      ) {
        throw new Error(
          "Invalid theme format. Expected API format with name, language, difficulty, and description object",
        );
      }

      // Set default public to true if not specified
      if (themeData.public === undefined) {
        themeData.public = true;
      }

      if (themeData.description.words.length < 100) {
        throw new Error("Theme must have at least 100 words");
      }

      // Enforce exactly 10 teams
      if (themeData.description.teams.length !== 10) {
        throw new Error("Theme must contain exactly 10 teams");
      }

      // Ensure team names are unique
      const teamNames = themeData.description.teams.map((t: any) =>
        String(t).trim().toLowerCase(),
      );
      const uniqueTeamNames = new Set(teamNames);
      if (uniqueTeamNames.size !== teamNames.length) {
        const duplicates = themeData.description.teams.filter(
          (t: any, index: number) =>
            teamNames.indexOf(String(t).trim().toLowerCase()) !== index,
        );
        throw new Error(
          `Team names must be unique. Duplicates found: ${duplicates
            .map((t: any) => `"${t}"`)
            .join(", ")}`,
        );
      }

      // Ensure words are unique
      const wordValues = themeData.description.words.map((w: any) =>
        String(w).trim().toLowerCase(),
      );
      const uniqueWords = new Set(wordValues);
      if (uniqueWords.size !== wordValues.length) {
        const duplicates = themeData.description.words.filter(
          (w: any, index: number) =>
            wordValues.indexOf(String(w).trim().toLowerCase()) !== index,
        );
        throw new Error(
          `Words must be unique within a theme. Duplicates found: ${duplicates
            .slice(0, 5)
            .map((w: any) => `"${w}"`)
            .join(", ")}${duplicates.length > 5 ? "..." : ""}`,
        );
      }

      // Create theme via API
      await createTheme(themeData);

      setShowImportDialog(false);
      setImportJson("");
      setImportError("");

      // Optionally refresh the theme list
      fetchThemes();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Invalid JSON");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-6 shadow-sm md:p-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-text">
        Select Theme
      </h1>

      <div className="mb-6 space-y-4">
        {/* Row 1: Filtering */}
        <div className="flex flex-wrap gap-4 items-end justify-center">
          <div>
            <label className="mb-2 block text-text/80">Language</label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="rounded-game border border-text/15 bg-white px-4 py-2 text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-success"
            >
              <option value="en">English</option>
              <option value="ru">Russian</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-text/80">Difficulty</label>
            <select
              value={selectedDifficulty || ""}
              onChange={(e) =>
                setSelectedDifficulty(
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              className="rounded-game border border-text/15 bg-white px-4 py-2 text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-success"
            >
              <option value="">All</option>
              <option value="1">1 - Very Easy</option>
              <option value="2">2 - Easy</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - Hard</option>
              <option value="5">5 - Very Hard</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-text/80">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search themes..."
                className="rounded-game border border-text/15 bg-white px-4 py-2 text-text shadow-sm placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-success"
              />
              <button
                type="button"
                onClick={fetchThemes}
                className="rounded-game bg-success px-4 py-2 font-semibold text-white transition hover:opacity-90"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Ordering */}
        <div className="flex flex-wrap gap-4 items-end justify-center">
          <div>
            <label className="mb-2 block text-text/80">Order By</label>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value as ThemeOrderByType)}
              className="rounded-game border border-text/15 bg-white px-4 py-2 text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-success"
            >
              <option value={ThemeOrderBy.ID}>Creation Date</option>
              <option value={ThemeOrderBy.NAME}>Name</option>
              <option value={ThemeOrderBy.PLAYED_COUNT}>Popularity</option>
              <option value={ThemeOrderBy.LAST_PLAYED}>Last Played</option>
              <option value={ThemeOrderBy.LIKES}>Likes</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-text/80">Order Direction</label>
            <select
              value={orderDescending ? "desc" : "asc"}
              onChange={(e) => setOrderDescending(e.target.value === "desc")}
              className="rounded-game border border-text/15 bg-white px-4 py-2 text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-success"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Row 3: Modifiers */}
        {user && (
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-unverified"
                checked={showUnverified}
                onChange={(e) => setShowUnverified(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="show-unverified" className="text-text/80">
                Show unverified themes
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="only-my-themes"
                checked={onlyMyThemes}
                onChange={(e) => setOnlyMyThemes(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="only-my-themes" className="text-text/80">
                Only my themes
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="only-favorites"
                checked={onlyFavorites}
                onChange={(e) => setOnlyFavorites(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="only-favorites" className="text-text/80">
                Only favorites
              </label>
            </div>
          </div>
        )}

        {/* Row 4: Action buttons */}
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <button
            type="button"
            onClick={() => setShowImportDialog(true)}
            className="rounded-game bg-success px-6 py-2 font-semibold text-white transition hover:opacity-90"
          >
            Import Theme
          </button>

          {user && (
            <button
              type="button"
              onClick={() => onCreateTheme?.()}
              className="rounded-game bg-success px-6 py-2 font-semibold text-white transition hover:opacity-90"
            >
              Create Theme
            </button>
          )}
        </div>
      </div>

      {showUnverified && (
        <div className="mb-4 rounded-game border border-text/20 bg-card p-4 text-sm text-text">
          Unverified themes may contain inappropriate content
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => {
              if (onThemeDetails) {
                const filters = new URLSearchParams();
                if (selectedLang !== "en") filters.set("lang", selectedLang);
                if (selectedDifficulty)
                  filters.set("difficulty", selectedDifficulty.toString());
                if (searchTerm) filters.set("search", searchTerm);
                if (orderBy !== ThemeOrderBy.ID) filters.set("order", orderBy);
                if (orderDescending) filters.set("descending", "true");
                if (onlyMyThemes) filters.set("mine", "true");
                if (onlyFavorites) filters.set("favourites", "true");
                if (showUnverified) filters.set("unverified", "true");
                onThemeDetails(theme.id, filters);
              } else {
                handleThemeSelect(theme);
              }
            }}
            type="button"
            className="rounded-game border border-text/10 bg-text/[0.04] p-4 text-left transition hover:border-success/40 hover:bg-text/[0.08]"
          >
            <h3 className="mb-2 font-semibold text-text">{theme.name}</h3>
            <p className="mb-1 text-sm text-text/60">
              Difficulty: {renderDifficultyStars(theme.difficulty)}
            </p>
            <p className="text-sm text-text/60">
              Status: {renderVerificationStatus(theme.verified)}
            </p>
          </button>
        ))}
      </div>

      {themes.length === 0 && (
        <p className="py-8 text-center text-text/60">
          No themes available. Import or Create a theme to get started.
        </p>
      )}

      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-game border border-text/15 bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold text-text">Import Theme</h2>
            <textarea
              value={importJson}
              onChange={(e) => {
                setImportJson(e.target.value);
                setImportError("");
              }}
              placeholder={`Paste theme JSON here...

Example format:
{
  "name": "Harry Potter",
  "language": "en",
  "difficulty": 3,
  "description": {
    "teams": [
      "Gryffindor",
      "Dumbledore's Army",
      "Order of the Phoenix",
      ...
    ],
    "words": [
      "Tom Marvolo Riddle",
      "Alohomora",
      "Elder Wand",
      "Deluminator",
      ...
    ]
  }
}`}
              className="h-64 w-full rounded-game border border-text/15 bg-white p-4 font-mono text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-success"
            />
            {importError && (
              <p className="mt-2 text-sm text-error">{importError}</p>
            )}
            <div className="mt-4 flex gap-4">
              <button
                type="button"
                onClick={handleImport}
                className="rounded-game bg-success px-6 py-2 font-semibold text-white transition hover:opacity-90"
              >
                Import
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowImportDialog(false);
                  setImportJson("");
                  setImportError("");
                }}
                className="rounded-game border border-text/15 bg-text/[0.06] px-6 py-2 font-semibold text-text transition hover:bg-text/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
