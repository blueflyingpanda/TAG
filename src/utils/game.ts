import type { GameSettings, GameState, Theme } from '../types';

export const getAvailableWords = (theme: Theme, wordsUsed: string[]): string[] => {
  return theme.description.words.filter((word) => !wordsUsed.includes(word));
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const initializeGameState = (settings: GameSettings): GameState => {
  const teamScores: Record<string, number> = {};
  settings.selectedTeams.forEach((team) => {
    teamScores[team] = 0;
  });

  return {
    settings,
    currentTeamIndex: 0,
    currentRound: 1,
    teamScores,
    wordsUsed: [],
    currentWordIndex: 0,
    roundStartTime: null,
    roundEndTime: null,
    isRoundActive: false,
    roundResults: [],
  };
};

export const getCurrentTeam = (state: GameState): string => {
  return state.settings.selectedTeams[state.currentTeamIndex];
};

export const getRemainingTime = (state: GameState): number => {
  if (!state.roundStartTime || !state.isRoundActive) return 0;
  const elapsed = (Date.now() - state.roundStartTime) / 1000;
  const remaining = state.settings.roundTimer - elapsed;
  return Math.max(0, Math.ceil(remaining));
};

export const checkWinCondition = (state: GameState): string | null => {
  for (const [team, score] of Object.entries(state.teamScores)) {
    if (score >= state.settings.pointsRequired) {
      return team;
    }
  }
  return null;
};

