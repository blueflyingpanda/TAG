import { useState } from "react";
import type { GameSettings, Theme } from "../types";

interface GameSetupProps {
  theme: Theme;
  onStart: (settings: GameSettings) => void;
  onBack: () => void;
}

export default function GameSetup({ theme, onStart, onBack }: GameSetupProps) {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([
    theme.teams[0],
    theme.teams[1] || theme.teams[0],
  ]);
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
      pointsRequired,
      roundTimer,
      skipPenalty,
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-2xl w-full mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2 text-center">
        {theme.name}
      </h1>
      <p className="text-white/60 mb-6 text-center">
        {theme.words.length} words • {theme.teams.length} teams available
      </p>

      <div className="space-y-6">
        <div>
          <label className="text-white font-semibold mb-3 block">
            Select Teams
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {theme.teams.map((team) => (
              <button
                key={team}
                onClick={() => toggleTeam(team)}
                className={`p-3 rounded-lg font-semibold transition ${
                  selectedTeams.includes(team)
                    ? "bg-[#ECACAE] text-[#223164]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {team}
              </button>
            ))}
          </div>
          <p className="text-white/60 text-sm mt-2">
            Selected: {selectedTeams.length} / {theme.teams.length}
          </p>
        </div>

        <div>
          <label className="text-white font-semibold mb-2 block">
            Points Required: {pointsRequired}
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={pointsRequired}
            onChange={(e) => setPointsRequired(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-white/60 text-sm mt-1">
            <span>10</span>
            <span>100</span>
          </div>
        </div>

        <div>
          <label className="text-white font-semibold mb-2 block">
            Round Timer: {roundTimer}s
          </label>
          <input
            type="range"
            min="30"
            max="120"
            step="15"
            value={roundTimer}
            onChange={(e) => setRoundTimer(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-white/60 text-sm mt-1">
            <span>30s</span>
            <span>120s</span>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 text-white font-semibold">
            <input
              type="checkbox"
              checked={skipPenalty}
              onChange={(e) => setSkipPenalty(e.target.checked)}
              className="w-5 h-5"
            />
            Skip Penalty
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            Back
          </button>
          <button
            onClick={handleStart}
            disabled={selectedTeams.length < 2}
            className="flex-1 px-6 py-3 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
