import type { Theme, GameState } from '../types';

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
    const themes = storage.getThemes();
    const existingIndex = themes.findIndex(
      (t) => t.name === theme.name && t.lang === theme.lang
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
  getUser: (): { id: string; email: string; username: string } | null => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveUser: (user: { id: string; email: string; username: string }): void => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  clearUser: (): void => {
    localStorage.removeItem(USER_STORAGE_KEY);
  },
};

