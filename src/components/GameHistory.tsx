import { useState, useEffect } from 'react';
import type { GameHistoryEntry, GameState } from '../types';

interface GameHistoryProps {
  onBack: () => void;
  onResumeGame: (gameState: GameState) => void;
}

export default function GameHistory({ onBack, onResumeGame }: GameHistoryProps) {
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch game history from backend API when backend is ready
    // For now, show empty state
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // const response = await fetch('/api/games/history');
        // if (!response.ok) throw new Error('Failed to fetch history');
        // const data = await response.json();
        // setHistory(data);

        // Placeholder - no data from localStorage
        setHistory([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleResume = async (entry: GameHistoryEntry) => {
    if (entry.gameState) {
      // TODO: Fetch full game state from backend if needed
      // const response = await fetch(`/api/games/${entry.id}/state`);
      // const gameState = await response.json();
      onResumeGame(entry.gameState);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Delete game from backend via API
      // await fetch(`/api/games/${id}`, { method: 'DELETE' });
      setHistory(history.filter((h) => h.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete game');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Game History</h1>
        <p className="text-white/60 text-center py-8">Loading...</p>
        <button
          onClick={onBack}
          className="mt-6 w-full px-6 py-3 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
        >
          Back
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Game History</h1>
        <p className="text-red-400 text-center py-8">{error}</p>
        <button
          onClick={onBack}
          className="mt-6 w-full px-6 py-3 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl w-full mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">Game History</h1>

      {history.length === 0 ? (
        <p className="text-white/60 text-center py-8">
          No games in history. Game history is only available for authorized users.
        </p>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-semibold text-lg">{entry.themeName}</h3>
                  <p className="text-white/60 text-sm">
                    {entry.themeLang.toUpperCase()} • {formatDate(entry.createdAt)}
                  </p>
                  {entry.endedAt && (
                    <p className="text-white/60 text-sm">
                      Completed: {formatDate(entry.endedAt)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {entry.gameState && (
                    <button
                      onClick={() => handleResume(entry)}
                      className="px-4 py-2 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition text-sm"
                    >
                      Resume
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="px-4 py-2 bg-red-500/20 text-red-200 rounded-lg hover:bg-red-500/30 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <div className="text-white/80 text-sm">
                  Teams: {entry.teams.join(', ')}
                </div>
                <div className="text-white/80 text-sm">
                  Target: {entry.pointsRequired} points
                </div>
                <div className="flex gap-4 mt-2">
                  {Object.entries(entry.finalScores).map(([team, score]) => (
                    <div key={team} className="text-white">
                      <span className={entry.winner === team ? 'font-bold text-[#ECACAE]' : ''}>
                        {team}: {score}
                      </span>
                    </div>
                  ))}
                </div>
                {entry.winner && (
                  <div className="text-[#ECACAE] font-semibold mt-2">
                    🏆 Winner: {entry.winner}
                  </div>
                )}
                {entry.gameState && (
                  <div className="text-yellow-400 text-sm mt-2">
                    ⏸️ In Progress
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-6 w-full px-6 py-3 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
      >
        Back
      </button>
    </div>
  );
}
