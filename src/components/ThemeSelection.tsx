import { useEffect, useState } from "react";
import type { Theme, ThemeListItem, User } from "../types";
import { createTheme, getTheme, getThemes } from "../utils/themes";

interface ThemeSelectionProps {
  user: User | null;
  onThemeSelect: (theme: Theme) => void;
  onCreateTheme?: () => void;
}

export default function ThemeSelection({
  user,
  onThemeSelect,
  onCreateTheme,
}: ThemeSelectionProps) {
  const [themes, setThemes] = useState<ThemeListItem[]>([]);
  const [selectedLang, setSelectedLang] = useState("en");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    number | undefined
  >(undefined);
  const [showUnverified, setShowUnverified] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState("");

  const fetchThemes = async () => {
    try {
      const response = await getThemes(
        1,
        50,
        selectedLang,
        selectedDifficulty,
        searchTerm || undefined
      );
      setThemes(response.items);
    } catch (err) {
      console.error("Failed to fetch themes:", err);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

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
          "Invalid theme format. Expected API format with name, language, difficulty, and description object"
        );
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
        String(t).trim().toLowerCase()
      );
      const uniqueTeamNames = new Set(teamNames);
      if (uniqueTeamNames.size !== teamNames.length) {
        const duplicates = themeData.description.teams.filter(
          (t: any, index: number) =>
            teamNames.indexOf(String(t).trim().toLowerCase()) !== index
        );
        throw new Error(
          `Team names must be unique. Duplicates found: ${duplicates
            .map((t: any) => `"${t}"`)
            .join(", ")}`
        );
      }

      // Ensure words are unique
      const wordValues = themeData.description.words.map((w: any) =>
        String(w).trim().toLowerCase()
      );
      const uniqueWords = new Set(wordValues);
      if (uniqueWords.size !== wordValues.length) {
        const duplicates = themeData.description.words.filter(
          (w: any, index: number) =>
            wordValues.indexOf(String(w).trim().toLowerCase()) !== index
        );
        throw new Error(
          `Words must be unique within a theme. Duplicates found: ${duplicates
            .slice(0, 5)
            .map((w: any) => `"${w}"`)
            .join(", ")}${duplicates.length > 5 ? "..." : ""}`
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
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl w-full mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">
        Select Theme
      </h1>

      <div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
        <div>
          <label className="text-white/80 mb-2 block">Language</label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#ECACAE]"
          >
            <option value="en">English</option>
            <option value="ru">Russian</option>
          </select>
        </div>

        <div>
          <label className="text-white/80 mb-2 block">Difficulty</label>
          <select
            value={selectedDifficulty || ""}
            onChange={(e) =>
              setSelectedDifficulty(
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            className="px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#ECACAE]"
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
          <label className="text-white/80 mb-2 block">Search</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search themes..."
              className="px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-[#ECACAE] placeholder-white/50"
            />
            <button
              onClick={fetchThemes}
              className="px-4 py-2 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
            >
              Search
            </button>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-unverified"
              checked={showUnverified}
              onChange={(e) => setShowUnverified(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="show-unverified" className="text-white/80">
              Show unverified themes
            </label>
          </div>
        )}

        <button
          onClick={() => setShowImportDialog(true)}
          className="px-6 py-2 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
        >
          Import Theme
        </button>

        {user && (
          <button
            onClick={() => onCreateTheme?.()}
            className="px-6 py-2 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
          >
            Create Theme
          </button>
        )}
      </div>

      {showUnverified && (
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-100 text-sm">
          ⚠️ Unverified themes may contain inappropriate content
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme)}
            className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition text-left"
          >
            <h3 className="text-white font-semibold mb-2">{theme.name}</h3>
            <p className="text-white/60 text-sm">
              Difficulty: {theme.difficulty}
            </p>
          </button>
        ))}
      </div>

      {themes.length === 0 && (
        <p className="text-white/60 text-center py-8">
          No themes available. Import or Create a theme to get started.
        </p>
      )}

      {showImportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#223164] border-2 border-[#ECACAE] rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Import Theme</h2>
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
              className="w-full h-64 p-4 bg-white/10 text-white rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#ECACAE] placeholder-white/60"
            />
            {importError && (
              <p className="text-red-400 mt-2 text-sm">{importError}</p>
            )}
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleImport}
                className="px-6 py-2 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
              >
                Import
              </button>
              <button
                onClick={() => {
                  setShowImportDialog(false);
                  setImportJson("");
                  setImportError("");
                }}
                className="px-6 py-2 bg-white/20 text-white rounded-lg font-semibold hover:opacity-90 transition"
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
