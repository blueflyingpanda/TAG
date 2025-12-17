import type { GameState, Theme, User } from '../types';

const THEMES_STORAGE_KEY = 'tag_themes';
const GAME_STATE_STORAGE_KEY = 'tag_game_state';
const USER_STORAGE_KEY = 'tag_user';

export const storage = {
  // Themes
  getThemes: (): Theme[] => {
    try {
      const stored = localStorage.getItem(THEMES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveTheme: (theme: Theme): void => {
    // Ensure theme has exactly 10 teams before saving
    if (!Array.isArray(theme.description.teams) || theme.description.teams.length !== 10) {
      throw new Error('Theme must contain exactly 10 teams');
    }
    // Ensure team names are unique
    const teamNames = theme.description.teams.map((t) => String(t).trim().toLowerCase());
    if (new Set(teamNames).size !== teamNames.length) {
      throw new Error('Team names must be unique');
    }
    // Ensure words are unique
    const wordValues = theme.description.words.map((w) => String(w).trim().toLowerCase());
    if (new Set(wordValues).size !== wordValues.length) {
      throw new Error('Words must be unique within a theme');
    }
    const themes = storage.getThemes();
    const existingIndex = themes.findIndex(
      (t) => t.name === theme.name && t.language === theme.language
    );
    if (existingIndex >= 0) {
      themes[existingIndex] = theme;
    } else {
      themes.push(theme);
    }
    localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(themes));
  },

  // Game state
  getGameState: (): GameState | null => {
    try {
      const stored = localStorage.getItem(GAME_STATE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveGameState: (state: GameState): void => {
    localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(state));
  },

  clearGameState: (): void => {
    localStorage.removeItem(GAME_STATE_STORAGE_KEY);
  },

  // User
  getUser: (): User | null => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveUser: (user: User): void => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  clearUser: (): void => {
    localStorage.removeItem(USER_STORAGE_KEY);
  },
};

