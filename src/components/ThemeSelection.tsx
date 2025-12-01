import { useEffect, useState } from "react";
import type { Theme, User } from "../types";
import { storage } from "../utils/storage";

interface ThemeSelectionProps {
  user: User | null;
  onThemeSelect: (theme: Theme) => void;
  onImportTheme: (theme: Theme) => void;
  onCreateTheme?: () => void;
}

export default function ThemeSelection({
  user,
  onThemeSelect,
  onImportTheme,
  onCreateTheme,
}: ThemeSelectionProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedLang, setSelectedLang] = useState("en");
  const [showUnverified, setShowUnverified] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importError, setImportError] = useState("");

  useEffect(() => {
    const localThemes = storage.getThemes();
    setThemes(localThemes);
  }, []);

  const handleImport = () => {
    try {
      const theme: Theme = JSON.parse(importJson);

      // Basic validation
      if (
        !theme.lang ||
        !theme.name ||
        !Array.isArray(theme.teams) ||
        !Array.isArray(theme.words)
      ) {
        throw new Error("Invalid theme format");
      }

      if (theme.words.length < 100) {
        throw new Error("Theme must have at least 100 words");
      }

      // Enforce exactly 10 teams
      if (!Array.isArray(theme.teams) || theme.teams.length !== 10) {
        throw new Error("Theme must contain exactly 10 teams");
      }

      onImportTheme(theme);
      setShowImportDialog(false);
      setImportJson("");
      setImportError("");
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Invalid JSON");
    }
  };

  const filteredThemes = themes.filter((theme) => {
    if (theme.lang !== selectedLang) return false;
    // TODO: Filter by verified/public when backend is ready
    return true;
  });

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
        {filteredThemes.map((theme, index) => (
          <button
            key={index}
            onClick={() => onThemeSelect(theme)}
            className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition text-left"
          >
            <h3 className="text-white font-semibold mb-2">{theme.name}</h3>
            <p className="text-white/60 text-sm">
              {theme.words.length} words • {theme.teams.length} teams
            </p>
          </button>
        ))}
      </div>

      {filteredThemes.length === 0 && (
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
              placeholder="Paste theme JSON here..."
              className="w-full h-64 p-4 bg-white/10 text-white rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#ECACAE]"
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
