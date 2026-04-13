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
    null,
  );

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const response = await getGames(
          1,
          50,
          undefined,
          undefined,
          undefined,
          "id",
          true,
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
      try {
        const gameDetails = await getGame(game.id);
        setSelectedGame(gameDetails);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load game details",
        );
      }
    }
  };

  const handleResumeGame = async (game: GameDetailsResponse) => {
    if (!game.info?.teams || game.info.teams.length === 0) {
      setError("Cannot resume game: missing teams data");
      return;
    }

    try {
      const fullTheme = await getTheme(game.theme_id);

      const gameState: GameState = {
        settings: {
          theme: fullTheme,
          selectedTeams: game.info.teams.map((team) => team.name),
          difficulty: game.difficulty ?? 5,
          pointsRequired: game.points,
          roundTimer: game.round,
          skipPenalty: game.skip_penalty,
        },
        currentTeamIndex: game.info.current_team_index || 0,
        currentRound: game.info.current_round || game.round,
        teamScores: Object.fromEntries(
          game.info.teams.map((team) => [team.name, team.score]),
        ),
        wordsUsed: [...game.words_guessed, ...game.words_skipped],
        currentWordIndex: game.words_guessed.length + game.words_skipped.length,
        roundStartTime: null,
        roundEndTime: null,
        isRoundActive: false,
        isPaused: false,
        roundResults: [
          ...game.words_guessed.map((word) => ({ word, guessed: true })),
          ...game.words_skipped.map((word) => ({ word, guessed: false })),
        ],
      };

      onResumeGame(gameState, game.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load theme data",
      );
    }
  };

  const handleBackToList = () => {
    setSelectedGame(null);
  };

  if (selectedGame) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToList}
            className="rounded-game border border-text/15 bg-text/[0.06] px-4 py-2 font-semibold text-text transition hover:bg-text/10"
          >
            ← Back to Games
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-text">Game Details</h1>
            <div className="flex flex-wrap items-center gap-4 text-text/80">
              <span>Theme: {selectedGame.theme.name}</span>
              <span>Language: {selectedGame.theme.language.toUpperCase()}</span>
              <span>Points Required: {selectedGame.points}</span>
              <span>
                Skip Penalty: {selectedGame.skip_penalty ? "Yes" : "No"}
              </span>
            </div>
            <div className="mt-2 text-text/60">
              Started: {formatDate(selectedGame.started_at)}
              {selectedGame.ended_at && (
                <span className="ml-4">
                  Ended: {formatDate(selectedGame.ended_at)}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-text">Teams</h2>
              <div className="rounded-game border border-text/10 bg-text/[0.04] p-4">
                {selectedGame.info?.teams &&
                selectedGame.info.teams.length > 0 ? (
                  selectedGame.info.teams.map((team, index) => (
                    <div key={index} className="mb-2 text-text/80">
                      {team.name}: {team.score} points
                    </div>
                  ))
                ) : (
                  <div className="text-text/60">No teams data available</div>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold text-text">
                Game Status
              </h2>
              <div className="rounded-game border border-text/10 bg-text/[0.04] p-4">
                <div className="mb-2 text-text/80">
                  Current Round:{" "}
                  {selectedGame.info?.current_round || selectedGame.round}
                </div>
                <div className="mb-2 text-text/80">
                  Current Team:{" "}
                  {selectedGame.info?.teams &&
                  selectedGame.info.current_team_index !== undefined
                    ? selectedGame.info.teams[
                        selectedGame.info.current_team_index
                      ]?.name || "Unknown"
                    : "Unknown"}
                </div>
                <div className="mb-2 text-text/80">
                  Status: {selectedGame.ended_at ? "Completed" : "In Progress"}
                </div>
              </div>
            </div>
          </div>

          {!selectedGame.ended_at && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => handleResumeGame(selectedGame)}
                className="rounded-game bg-success px-6 py-2 font-semibold text-white transition hover:opacity-90"
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
      <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-8 shadow-sm">
        <div className="text-center text-text/80">Loading game history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-8 shadow-sm">
        <div className="mb-4 text-center text-error">{error}</div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-game bg-success px-6 py-2 font-semibold text-white transition hover:opacity-90"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-text">Game History</h1>
        <button
          type="button"
          onClick={onBack}
          className="rounded-game border border-text/15 bg-text/[0.06] px-4 py-2 font-semibold text-text transition hover:bg-text/10"
        >
          ← Back
        </button>
      </div>

      {games.length === 0 ? (
        <p className="py-8 text-center text-text/60">
          No games found. Start playing to see your game history!
        </p>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <div
              key={game.id}
              role="button"
              tabIndex={0}
              className="cursor-pointer rounded-game border border-text/10 bg-text/[0.04] p-4 transition hover:border-success/40 hover:bg-text/[0.07]"
              onClick={() => handleViewDetails(game)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleViewDetails(game);
                }
              }}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h3 className="mb-2 font-semibold text-text">
                    {game.theme.name}
                  </h3>
                  <div className="mb-2 text-sm text-text/60">
                    Language: {game.theme.language.toUpperCase()}
                  </div>
                  <div className="text-sm text-text/60">
                    Started: {formatDate(game.started_at)}
                    {game.ended_at && (
                      <span className="ml-4">
                        Ended: {formatDate(game.ended_at)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm text-text/80">
                    Points Required: {game.points}
                  </div>
                  <div className="text-sm text-text/80">
                    Round Time: {game.round}
                  </div>
                  <div className="text-sm text-text/80">
                    Skip Penalty: {game.skip_penalty ? "Yes" : "No"}
                  </div>
                  <div
                    className={`text-sm ${
                      game.ended_at ? "text-success" : "text-error"
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
