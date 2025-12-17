export interface Theme {
  id: number;
  name: string;
  language: string; // ISO 639 alpha-2
  difficulty: number; // 1-5
  description: {
    words: string[];
    teams: string[];
  };
  played_count?: number;
  last_played?: string | null;
  creator?: {
    email: string;
    picture?: string;
    admin?: boolean;
  };
}

export interface ThemeListItem {
  id: number;
  name: string;
  language: string;
  difficulty: number;
}

export interface ThemePayload {
  name: string;
  language?: string;
  difficulty?: number;
  description: {
    words: string[];
    teams: string[];
  };
}

export interface PaginatedThemes {
  items: ThemeListItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface GameSettings {
  theme: Theme;
  selectedTeams: string[];
  pointsRequired: number; // 10-100
  roundTimer: number; // 15-120, step 15
  skipPenalty: boolean;
}

export interface GameState {
  settings: GameSettings;
  currentTeamIndex: number;
  currentRound: number;
  teamScores: Record<string, number>;
  wordsUsed: string[];
  currentWordIndex: number;
  roundStartTime: number | null;
  roundEndTime: number | null;
  isRoundActive: boolean;
  roundResults: {
    word: string;
    guessed: boolean;
  }[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  picture?: string;
  admin: boolean;
}

export interface GameHistoryEntry {
  id: string;
  createdAt: number;
  endedAt: number | null;
  themeName: string;
  themeLang: string;
  teams: string[];
  finalScores: Record<string, number>;
  pointsRequired: number;
  winner: string | null;
  gameState: GameState | null; // null if game is completed, otherwise contains state to resume
}

