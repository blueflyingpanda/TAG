import { useEffect, useState } from "react";
import type { Theme, ThemeListItem, ThemeOrderByType, User } from "../types";
import { ThemeOrderBy } from "../types";
import { createTheme, getTheme, getThemes } from "../utils/themes";

interface ThemeSelectionProps {
  user: User | null;
  onThemeSelect: (theme: Theme, difficulty?: number) => void;
  onCreateTheme?: () => void;
  onThemeDetails?: (themeId: number, filters?: URLSearchParams) => void;
}

function renderVerificationStatus(verified: boolean): string {
  return verified ? "✅" : "❌";
}

// URL parameter management
function getFiltersFromURL(): {
  selectedLang: string;
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
  const [importIsPublic, setImportIsPublic] = useState(true);
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
      searchTerm,
      orderBy,
      orderDescending,
      onlyMyThemes,
      onlyFavorites,
      showUnverified,
    });
  }, [
    selectedLang,
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
        !themeData.description ||
        !Array.isArray(themeData.description.teams) ||
        (!Array.isArray(themeData.description.words) &&
          typeof themeData.description.words !== "object")
      ) {
        throw new Error(
          "Invalid theme format. Expected API format with name, language, and description object",
        );
      }

      // Normalize word format to API dictionary shape
      const rawWords = themeData.description.words;
      let wordsMap: Record<string, { difficulty: number }>;

      if (Array.isArray(rawWords)) {
        wordsMap = Object.fromEntries(
          rawWords.map((word: any) => [String(word).trim(), { difficulty: 1 }]),
        );
      } else {
        wordsMap = Object.fromEntries(
          Object.entries(rawWords as Record<string, any>).map(
            ([word, meta]) => {
              const difficulty = meta?.difficulty ?? 1;
              return [String(word).trim(), { difficulty }];
            },
          ),
        );
      }

      if (Object.keys(wordsMap).length < 30) {
        throw new Error("Theme must have at least 30 words");
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
      const wordValues = Array.isArray(rawWords)
        ? rawWords.map((w: any) => String(w).trim().toLowerCase())
        : Object.keys(rawWords).map((w) => String(w).trim().toLowerCase());
      const uniqueWords = new Set(wordValues);
      if (uniqueWords.size !== wordValues.length) {
        const duplicates = wordValues.filter(
          (word, index) => wordValues.indexOf(word) !== index,
        );
        throw new Error(
          `Words must be unique within a theme. Duplicates found: ${[
            ...new Set(duplicates),
          ]
            .slice(0, 5)
            .map((w) => `"${w}"`)
            .join(", ")}${duplicates.length > 5 ? "..." : ""}`,
        );
      }

      const payload = {
        ...themeData,
        public: importIsPublic,
        description: {
          teams: themeData.description.teams.map((t: any) => String(t).trim()),
          words: wordsMap,
        },
      };

      // Create theme via API
      await createTheme(payload);

      setShowImportDialog(false);
      setImportJson("");
      setImportError("");
      setImportIsPublic(true);

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

          <div className="w-full">
            <label className="mb-2 block text-text/80">Search</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search themes..."
                className="w-full rounded-game border border-text/15 bg-white px-4 py-2 text-text shadow-sm placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-success"
              />
              <button
                type="button"
                onClick={fetchThemes}
                className="w-full rounded-game bg-success px-4 py-2 font-semibold text-white transition hover:opacity-90 sm:w-auto"
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
  "description": {
    "teams": [
      "Gryffindor",
      "Dumbledore's Army",
      "Order of the Phoenix",
      ...
    ],
    "words": {
      "Tom Marvolo Riddle": { "difficulty": 1 },
      "Alohomora": { "difficulty": 1 },
      "Elder Wand": { "difficulty": 1 },
      "Deluminator": { "difficulty": 1 },
      ...
    }
  }
}`}
              className="h-64 w-full rounded-game border border-text/15 bg-white p-4 font-mono text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-success"
            />
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="import-public"
                checked={importIsPublic}
                onChange={(e) => setImportIsPublic(e.target.checked)}
                className="h-4 w-4 accent-success"
              />
              <label htmlFor="import-public" className="text-text/80">
                Public
              </label>
            </div>
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
                  setImportIsPublic(true);
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
