import { useEffect, useState } from "react";
import type { GameDetailsResponse, GameListItem, GameState } from "../types";
import { getGame, getGames } from "../utils/games";
import { getTheme } from "../utils/themes";

interface GameHistoryProps {
  onBack: () => void;
  onResumeGame: (gameState: GameState, gameId: number) => void;
  onViewGameDetails?: (gameId: number) => void;
}

export default function GameHistory({
  onBack,
  onResumeGame,
  onViewGameDetails,
}: GameHistoryProps) {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameDetailsResponse | null>(
    null
  );

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        // Get all games (both ended and ongoing), ordered by creation date descending
        const response = await getGames(
          1,
          50,
          undefined,
          undefined,
          undefined,
          "id",
          true
        );
        setGames(response.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load games");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleViewDetails = async (game: GameListItem) => {
    if (onViewGameDetails) {
      onViewGameDetails(game.id);
    } else {
      // Fallback: load game details inline
      try {
        const gameDetails = await getGame(game.id);
        setSelectedGame(gameDetails);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load game details"
        );
      }
    }
  };

  const handleResumeGame = async (game: GameDetailsResponse) => {
    // Check if we have the required data to resume the game
    if (!game.info?.teams || game.info.teams.length === 0) {
      setError("Cannot resume game: missing teams data");
      return;
    }

    try {
      // Fetch the full theme data including words
      const fullTheme = await getTheme(game.theme_id);

      // Convert API game data to local GameState format
      const gameState: GameState = {
        settings: {
          theme: fullTheme,
          selectedTeams: game.info.teams.map((team) => team.name),
          pointsRequired: game.points,
          roundTimer: game.round,
          skipPenalty: game.skip_penalty,
        },
        currentTeamIndex: game.info.current_team_index || 0,
        currentRound: game.info.current_round || game.round,
        teamScores: Object.fromEntries(
          game.info.teams.map((team) => [team.name, team.score])
        ),
        wordsUsed: [...game.words_guessed, ...game.words_skipped],
        currentWordIndex: game.words_guessed.length + game.words_skipped.length,
        roundStartTime: null,
        roundEndTime: null,
        isRoundActive: false, // API doesn't track this
        isPaused: false, // Default to not paused for resumed games
        roundResults: [
          ...game.words_guessed.map((word) => ({ word, guessed: true })),
          ...game.words_skipped.map((word) => ({ word, guessed: false })),
        ],
      };

      onResumeGame(gameState, game.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load theme data"
      );
    }
  };

  const handleBackToList = () => {
    setSelectedGame(null);
  };

  if (selectedGame) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToList}
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
          >
            ← Back to Games
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Game Details</h1>
            <div className="flex items-center gap-4 text-white/80">
              <span>Theme: {selectedGame.theme.name}</span>
              <span>Language: {selectedGame.theme.language.toUpperCase()}</span>
              <span>Points Required: {selectedGame.points}</span>
              <span>
                Skip Penalty: {selectedGame.skip_penalty ? "Yes" : "No"}
              </span>
            </div>
            <div className="text-white/60 mt-2">
              Started: {formatDate(selectedGame.started_at)}
              {selectedGame.ended_at && (
                <span className="ml-4">
                  Ended: {formatDate(selectedGame.ended_at)}
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Teams</h2>
              <div className="bg-white/10 rounded-lg p-4">
                {selectedGame.info?.teams &&
                selectedGame.info.teams.length > 0 ? (
                  selectedGame.info.teams.map((team, index) => (
                    <div key={index} className="text-white/80 mb-2">
                      {team.name}: {team.score} points
                    </div>
                  ))
                ) : (
                  <div className="text-white/60">No teams data available</div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Game Status
              </h2>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-white/80 mb-2">
                  Current Round:{" "}
                  {selectedGame.info?.current_round || selectedGame.round}
                </div>
                <div className="text-white/80 mb-2">
                  Current Team:{" "}
                  {selectedGame.info?.teams &&
                  selectedGame.info.current_team_index !== undefined
                    ? selectedGame.info.teams[
                        selectedGame.info.current_team_index
                      ]?.name || "Unknown"
                    : "Unknown"}
                </div>
                <div className="text-white/80 mb-2">
                  Status: {selectedGame.ended_at ? "Completed" : "In Progress"}
                </div>
              </div>
            </div>
          </div>

          {!selectedGame.ended_at && (
            <div className="flex justify-center">
              <button
                onClick={() => handleResumeGame(selectedGame)}
                className="px-6 py-2 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
              >
                Resume Game
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl w-full mx-auto">
        <div className="text-center text-white">Loading game history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl w-full mx-auto">
        <div className="text-center text-red-400 mb-4">{error}</div>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-4xl w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Game History</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
        >
          ← Back
        </button>
      </div>

      {games.length === 0 ? (
        <p className="text-white/60 text-center py-8">
          No games found. Start playing to see your game history!
        </p>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition cursor-pointer"
              onClick={() => handleViewDetails(game)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-semibold mb-2">
                    {game.theme.name}
                  </h3>
                  <div className="text-white/60 text-sm mb-2">
                    Language: {game.theme.language.toUpperCase()}
                  </div>
                  <div className="text-white/60 text-sm">
                    Started: {formatDate(game.started_at)}
                    {game.ended_at && (
                      <span className="ml-4">
                        Ended: {formatDate(game.ended_at)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-sm">
                    Points Required: {game.points}
                  </div>
                  <div className="text-white/80 text-sm">
                    Round Time: {game.round}
                  </div>
                  <div className="text-white/80 text-sm">
                    Skip Penalty: {game.skip_penalty ? "Yes" : "No"}
                  </div>
                  <div
                    className={`text-sm ${
                      game.ended_at ? "text-green-400" : "text-yellow-400"
                    }`}
                  >
                    {game.ended_at ? "Completed" : "In Progress"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
