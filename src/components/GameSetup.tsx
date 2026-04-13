import { useState } from "react";
import type { GameSettings, Theme } from "../types";

interface GameSetupProps {
  theme: Theme;
  initialDifficulty?: number;
  onStart: (settings: GameSettings) => void;
  onBack: () => void;
}

export default function GameSetup({
  theme,
  initialDifficulty = 3,
  onStart,
  onBack,
}: GameSetupProps) {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([
    theme.description.teams[0],
    theme.description.teams[1] || theme.description.teams[0],
  ]);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [pointsRequired, setPointsRequired] = useState(50);
  const [roundTimer, setRoundTimer] = useState(60);
  const [skipPenalty, setSkipPenalty] = useState(true);

  const toggleTeam = (team: string) => {
    if (selectedTeams.includes(team)) {
      if (selectedTeams.length > 2) {
        setSelectedTeams(selectedTeams.filter((t) => t !== team));
      }
    } else {
      if (selectedTeams.length < 10) {
        setSelectedTeams([...selectedTeams, team]);
      }
    }
  };

  const handleStart = () => {
    if (selectedTeams.length < 2) return;

    onStart({
      theme,
      selectedTeams,
      difficulty,
      pointsRequired,
      roundTimer,
      skipPenalty,
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-game bg-card p-6 shadow-sm md:p-8">
      <h1 className="mb-2 text-center text-3xl font-bold text-text">
        {theme.name}
      </h1>
      <p className="mb-6 text-center text-text/60">
        {Object.keys(theme.description.words).length} words •{" "}
        {theme.description.teams.length} teams available
      </p>

      <div className="space-y-6">
        <div>
          <label className="mb-3 block font-semibold text-text">
            Select Teams
          </label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {theme.description.teams.map((team) => (
              <button
                key={team}
                type="button"
                onClick={() => toggleTeam(team)}
                className={`rounded-game p-3 font-semibold transition ${
                  selectedTeams.includes(team)
                    ? "bg-success text-white"
                    : "border border-text/15 bg-text/[0.06] text-text hover:bg-text/10"
                }`}
              >
                {team}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-text/60">
            Selected: {selectedTeams.length} / {theme.description.teams.length}
          </p>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-text">
            Difficulty
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDifficulty(value)}
                className={`rounded-full px-3 py-2 text-2xl transition focus:outline-none ${
                  value <= difficulty
                    ? "text-success"
                    : "text-text/40 hover:text-success"
                }`}
                aria-label={`Set difficulty to ${value}`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-text/60">
            Show words with difficulty {difficulty} or lower
          </p>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-text">
            Points Required: {pointsRequired}
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={pointsRequired}
            onChange={(e) => setPointsRequired(Number(e.target.value))}
            className="w-full accent-success"
          />
          <div className="mt-1 flex justify-between text-sm text-text/60">
            <span>10</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block font-semibold text-text">
            Round Timer: {roundTimer}s
          </label>
          <input
            type="range"
            min="15"
            max="120"
            step="15"
            value={roundTimer}
            onChange={(e) => setRoundTimer(Number(e.target.value))}
            className="w-full accent-success"
          />
          <div className="mt-1 flex justify-between text-sm text-text/60">
            <span>15s</span>
            <span>120s</span>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 font-semibold text-text">
            <input
              type="checkbox"
              checked={skipPenalty}
              onChange={(e) => setSkipPenalty(e.target.checked)}
              className="h-5 w-5 accent-success"
            />
            Skip Penalty
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-game border border-text/15 bg-text/[0.06] px-6 py-3 font-semibold text-text transition hover:bg-text/10"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleStart}
            disabled={selectedTeams.length < 2}
            className="flex-1 rounded-game bg-success px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
