/** One colour per team, picked by the team's position in the game so web and mobile match */
const TEAM_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
];

export const teamColor = (index: number): string => TEAM_COLORS[index % TEAM_COLORS.length];
