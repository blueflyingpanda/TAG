export interface Theme {
  lang: string; // ISO 639 alpha-2
  name: string;
  teams: string[];
  words: string[];
}

export interface GameSettings {
  theme: Theme;
  selectedTeams: string[];
  pointsRequired: number; // 10-100
  roundTimer: number; // 30-120, step 15
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

