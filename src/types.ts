export const ThemeOrderBy = {
  ID: 'id',
  NAME: 'name',
  PLAYED_COUNT: 'played_count',
  LAST_PLAYED: 'last_played',
  LIKES: 'likes',
} as const;

export type ThemeOrderByType = typeof ThemeOrderBy[keyof typeof ThemeOrderBy];

export interface Theme {
  id: number;
  name: string;
  language: string; // ISO 639 alpha-2
  difficulty: number; // 1-5
  public: boolean;
  verified: boolean;
  description: {
    words: string[];
    teams: string[];
  };
  played_count?: number;
  last_played?: string | null;
  likes_count?: number;
  is_favorited?: boolean;
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
  public: boolean;
  verified: boolean;
  likes_count?: number;
  creator?: {
    email: string;
    picture?: string;
    admin?: boolean;
  };
}

export interface ThemePayload {
  name: string;
  language?: string;
  difficulty?: number;
  public?: boolean;
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
  isPaused: boolean;
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

export const GameOrderBy = {
  ID: 'id',
} as const;

export type GameOrderByType = typeof GameOrderBy[keyof typeof GameOrderBy];

export interface GameListItem {
  id: number;
  theme_id: number;
  started_at: string;
  ended_at: string | null;
  points: number;
  round: number;
  skip_penalty: boolean;
  theme: {
    name: string;
    language: string;
    difficulty: number;
    verified: boolean;
  };
}

export interface GameDetailsResponse {
  id: number;
  theme_id: number;
  started_at: string;
  ended_at: string | null;
  points: number;
  round: number;
  skip_penalty: boolean;
  info: {
    teams: {
      name: string;
      score: number;
    }[];
    current_team_index?: number;
    current_round?: number;
  };
  words_guessed: string[];
  words_skipped: string[];
  theme: Theme;
}

export interface GameCreatePayload {
  theme_id: number;
  started_at: string;
  ended_at: string | null;
  points: number;
  round: number;
  skip_penalty: boolean;
  info: {
    teams: {
      name: string;
      score: number;
    }[];
    current_team_index: number;
    current_round: number;
  };
}

export interface GameUpdatePayload {
  info: {
    teams: {
      name: string;
      score: number;
    }[];
    current_team_index: number;
    current_round: number;
  };
  words_guessed: string[];
  words_skipped: string[];
  ended_at?: string | null;
}

export interface PaginatedGames {
  items: GameListItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

