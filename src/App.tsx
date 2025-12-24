import { useEffect, useState } from "react";
import CreateTheme from "./components/CreateTheme";
import GameHistory from "./components/GameHistory";
import GamePlay from "./components/GamePlay";
import GameSetup from "./components/GameSetup";
import Login from "./components/Login";
import RoundResults from "./components/RoundResults";
import ThemeDetails from "./components/ThemeDetails";
import ThemeSelection from "./components/ThemeSelection";
import type { GameSettings, GameState, Theme, User } from "./types";
import { checkWinCondition, initializeGameState } from "./utils/game";
import { createGame, updateGame } from "./utils/games";
import {
  clearOAuthCallback,
  clearStoredToken,
  exchangeOAuthCode,
  getCurrentUser,
} from "./utils/oauth";
import { storage } from "./utils/storage";

type AppScreen =
  | "login"
  | "theme-selection"
  | "theme-details"
  | "game-setup"
  | "game-play"
  | "round-results"
  | "game-history"
  | "create-theme";

function App() {
  const initialUser = storage.getUser();
  const [screen, setScreen] = useState<AppScreen>(() => {
    // Require authentication - if no user, always show login
    if (!initialUser) return "login";
    const savedState = storage.getGameState();
    if (savedState) return "game-play";
    return "theme-selection";
  });
  const [user, setUser] = useState<User | null>(initialUser);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [themeFilters, setThemeFilters] = useState<URLSearchParams | null>(
    null
  );
  const [gameState, setGameState] = useState<GameState | null>(() => {
    // Only restore game state if user is authenticated
    return initialUser ? storage.getGameState() : null;
  });
  const [, setGameId] = useState<string | null>(() => {
    // Generate or restore game ID
    const saved = localStorage.getItem("tag_current_game_id");
    return saved || null;
  });

  // Hide header buttons during round results confirmation and active rounds, but show before rounds start
  const hideHeaderButtons =
    screen === "round-results" ||
    (screen === "game-play" && gameState?.isRoundActive);

  // Helper function to update game via API
  const updateGameViaAPI = async (gameState: GameState) => {
    try {
      const gameId = localStorage.getItem("tag_current_game_id");
      if (!gameId) return;

      const gameIdNum = parseInt(gameId);
      if (isNaN(gameIdNum)) return; // Skip for local games

      // Convert round results to words_guessed and words_skipped arrays
      const wordsGuessed: string[] = [];
      const wordsSkipped: string[] = [];

      gameState.roundResults.forEach((result) => {
        if (result.guessed) {
          wordsGuessed.push(result.word);
        } else {
          wordsSkipped.push(result.word);
        }
      });

      const updateData = {
        info: {
          teams: Object.entries(gameState.teamScores).map(([name, score]) => ({
            name,
            score,
          })),
          current_team_index: gameState.currentTeamIndex,
          current_round: gameState.currentRound,
        },
        words_guessed: wordsGuessed,
        words_skipped: wordsSkipped,
      };

      await updateGame(gameIdNum, updateData);
    } catch (error) {
      console.error("Failed to update game via API:", error);
      // Don't block gameplay if API update fails
    }
  };

  useEffect(() => {
    // Handle OAuth callback from backend redirect
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        // No code, check if we have a stored token
        const userData = getCurrentUser();
        if (userData) {
          storage.saveUser(userData);
          setUser(userData);
        }
        return;
      }

      try {
        await exchangeOAuthCode(code);
        clearOAuthCallback();
        // Get user data from the new token
        const userData = getCurrentUser();
        if (userData) {
          storage.saveUser(userData);
          setUser(userData);
          setScreen("theme-selection");
        }
      } catch (err) {
        console.error("OAuth exchange failed:", err);
        // Redirect back to login on error
        setScreen("login");
      }
    };

    handleOAuthCallback();
  }, []);

  useEffect(() => {
    // Lock body scrolling when a game is in progress to prevent iOS bouncing/scroll
    if (hideHeaderButtons) {
      const scrollY = window.scrollY || window.pageYOffset;
      // Fix body to prevent scrolling/bounce on iOS
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      return () => {
        // restore
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
    return;
  }, [hideHeaderButtons]);

  useEffect(() => {
    // Enforce authentication - redirect to login if user is not logged in
    if (!user && screen !== "login") {
      // Schedule state update asynchronously to avoid cascading renders
      setTimeout(() => setScreen("login"), 0);
    }
  }, [user, screen]);

  useEffect(() => {
    // Sync game state if it exists and user is authenticated
    if (user) {
      const savedState = storage.getGameState();
      if (savedState && !gameState) {
        // Schedule state updates asynchronously to avoid cascading renders
        setTimeout(() => {
          setGameState(savedState);
          setScreen("game-play");
        }, 0);
      }
    }
  }, [gameState, user]);

  useEffect(() => {
    if (gameState) {
      storage.saveGameState(gameState);
      // TODO: Save to backend via API when backend is ready
    }
  }, [gameState]);

  const handleLogout = () => {
    clearStoredToken();
    storage.clearUser();
    storage.clearGameState();
    localStorage.removeItem("tag_current_game_id");
    setUser(null);
    setGameState(null);
    setScreen("login");
  };

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setScreen("game-setup");
  };

  const handleGameStart = async (settings: GameSettings) => {
    try {
      // Create game via API with correct payload structure
      const gameData = {
        theme_id: settings.theme.id,
        started_at: new Date().toISOString(),
        ended_at: null,
        points: settings.pointsRequired,
        round: settings.roundTimer,
        skip_penalty: settings.skipPenalty,
        info: {
          teams: settings.selectedTeams.map((team) => ({
            name: team,
            score: 0,
          })),
          current_team_index: 0,
          current_round: 0,
        },
      };

      const createdGame = await createGame(gameData);

      // Use API game ID
      const gameId = createdGame.id.toString();
      setGameId(gameId);
      localStorage.setItem("tag_current_game_id", gameId);

      // Ensure round timer respects minimum (15s) and coerce skipPenalty to boolean
      const safeSettings = {
        ...settings,
        roundTimer: Math.max(settings.roundTimer, 15),
        skipPenalty: !!settings.skipPenalty,
      };
      const newGameState = initializeGameState(safeSettings);
      setGameState(newGameState);
      setScreen("game-play");
    } catch (error) {
      console.error("Failed to create game:", error);
      // Fallback to local game creation if API fails
      const newGameId = `local_game_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setGameId(newGameId);
      localStorage.setItem("tag_current_game_id", newGameId);

      const safeSettings = {
        ...settings,
        roundTimer: Math.max(settings.roundTimer, 15),
        skipPenalty: !!settings.skipPenalty,
      };
      const newGameState = initializeGameState(safeSettings);
      setGameState(newGameState);
      setScreen("game-play");
    }
  };

  const handleRoundEnd = (results: { word: string; guessed: boolean }[]) => {
    if (!gameState) return;
    // Ignore late or duplicate end signals if the game already has a winner
    // (for example a pending timeout firing after the round was already
    // confirmed) — in that case the game should have stopped.
    const existingWinner = checkWinCondition(gameState);
    if (existingWinner) return;

    // (previous duplicate-guard removed) process incoming results

    // If no words were processed this round, advance to the next team
    // immediately so the same team does not keep playing.
    if (results.length === 0) {
      const updatedState = { ...gameState };
      // advance team
      updatedState.currentTeamIndex =
        (updatedState.currentTeamIndex + 1) %
        updatedState.settings.selectedTeams.length;
      if (updatedState.currentTeamIndex === 0) {
        updatedState.currentRound += 1;
      }
      updatedState.roundResults = [];
      updatedState.isRoundActive = false;
      updatedState.roundStartTime = null;
      updatedState.currentWordIndex = 0;

      setGameState(updatedState);
      updateGameViaAPI(updatedState);
      setScreen("game-play");
      return;
    }

    // Otherwise, show round results for the team to confirm their answers.
    // The winner check must run only after the team confirms in
    // `handleRoundResultsConfirm`.
    setGameState({ ...gameState, roundResults: results });
    setScreen("round-results");
  };

  const handleRoundResultsConfirm = (
    finalResults: { word: string; guessed: boolean }[]
  ) => {
    if (!gameState) return;

    const updatedState = { ...gameState };
    const currentTeam =
      gameState.settings.selectedTeams[gameState.currentTeamIndex];
    let scoreChange = 0;

    finalResults.forEach((result) => {
      if (result.guessed) {
        scoreChange += 1;
      } else if (gameState.settings.skipPenalty) {
        // coerce to boolean in case settings were stored with non-boolean values
        scoreChange -= 1;
      }
    });

    updatedState.teamScores[currentTeam] += scoreChange;
    updatedState.wordsUsed.push(...finalResults.map((r) => r.word));

    // Update game via API with the round results BEFORE clearing them
    const tempStateForAPI = { ...updatedState, roundResults: finalResults };
    updateGameViaAPI(tempStateForAPI);

    // Check if win condition is reached after updating score
    const winner = checkWinCondition(updatedState);

    if (winner) {
      // Game ends - show winner screen immediately
      storage.clearGameState();
      setGameState(updatedState);
      setScreen("game-play"); // Will show winner screen
      return;
    }

    // Move to next team
    updatedState.currentTeamIndex =
      (updatedState.currentTeamIndex + 1) %
      updatedState.settings.selectedTeams.length;

    // Only increment round when all teams have had their turn (back to first team)
    if (updatedState.currentTeamIndex === 0) {
      updatedState.currentRound += 1;
    }

    updatedState.roundResults = [];
    updatedState.isRoundActive = false;
    updatedState.roundStartTime = null;
    updatedState.currentWordIndex = 0;

    setGameState(updatedState);
    setScreen("game-play");
  };

  const handleGameEnd = async () => {
    if (gameState) {
      // Mark game as ended via API
      try {
        const gameId = localStorage.getItem("tag_current_game_id");
        if (gameId && !isNaN(parseInt(gameId))) {
          // Convert final team scores to the expected format
          const teams = Object.entries(gameState.teamScores).map(
            ([name, score]) => ({
              name,
              score,
            })
          );

          // Convert round results to words_guessed and words_skipped
          const wordsGuessed: string[] = [];
          const wordsSkipped: string[] = [];

          gameState.roundResults.forEach((result) => {
            if (result.guessed) {
              wordsGuessed.push(result.word);
            } else {
              wordsSkipped.push(result.word);
            }
          });

          await updateGame(parseInt(gameId), {
            info: {
              teams,
              current_team_index: gameState.currentTeamIndex,
              current_round: gameState.currentRound,
            },
            words_guessed: wordsGuessed,
            words_skipped: wordsSkipped,
            ended_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Failed to end game via API:", error);
      }
    }

    storage.clearGameState();
    localStorage.removeItem("tag_current_game_id");
    setGameState(null);
    setGameId(null);
    setSelectedTheme(null);
    setScreen("theme-selection");
  };

  return (
    <div
      className={`${
        hideHeaderButtons ? "h-screen overflow-hidden p-2" : "min-h-screen p-4"
      } w-full bg-[#223164] flex items-center justify-center`}
    >
      <div
        className={`w-full max-w-4xl mx-auto ${
          hideHeaderButtons ? "h-full" : ""
        }`}
      >
        {user && (
          <div className="mb-4 text-white text-center">
            <div className="flex items-center justify-center gap-4">
              {user.picture && (
                <img
                  src={user.picture}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-white/20"
                />
              )}
              <div className="text-sm">{user.email}</div>
            </div>

            {!hideHeaderButtons && (
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setScreen("theme-selection");
                    setSelectedTheme(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    screen === "theme-selection"
                      ? "bg-white/20 text-white cursor-default"
                      : "bg-[#ECACAE] text-[#223164] hover:opacity-90"
                  }`}
                  disabled={screen === "theme-selection"}
                >
                  Home
                </button>

                <button
                  onClick={() => setScreen("game-history")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    screen === "game-history"
                      ? "bg-white/20 text-white cursor-default"
                      : "bg-[#ECACAE] text-[#223164] hover:opacity-90"
                  }`}
                  disabled={screen === "game-history"}
                >
                  History
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {screen === "login" && <Login />}
        {screen === "theme-selection" && user && (
          <ThemeSelection
            user={user}
            onThemeSelect={handleThemeSelect}
            onCreateTheme={() => setScreen("create-theme")}
            onThemeDetails={(themeId, filters) => {
              setSelectedThemeId(themeId);
              setThemeFilters(filters || null);
              setScreen("theme-details");
            }}
          />
        )}
        {screen === "theme-details" && user && selectedThemeId && (
          <ThemeDetails
            user={user}
            themeId={selectedThemeId}
            filters={themeFilters || undefined}
            onBack={(filters) => {
              // Restore filters to URL if provided
              if (filters) {
                const url = new URL(window.location.href);
                url.search = filters.toString();
                window.history.replaceState({}, "", url.toString());
              }
              setScreen("theme-selection");
            }}
            onThemeSelect={handleThemeSelect}
          />
        )}
        {screen === "create-theme" && user && (
          <CreateTheme
            user={user}
            onBack={() => setScreen("theme-selection")}
            onThemeCreated={(theme) => {
              // Theme will be registered on backend (verified=false)
              console.log("Theme created and registered:", theme);
              setScreen("theme-selection");
            }}
          />
        )}
        {screen === "game-setup" && user && selectedTheme && (
          <GameSetup
            theme={selectedTheme}
            onStart={handleGameStart}
            onBack={() => setScreen("theme-selection")}
          />
        )}
        {screen === "game-play" && user && gameState && (
          <GamePlay
            gameState={gameState}
            setGameState={setGameState}
            onRoundEnd={handleRoundEnd}
            onGameEnd={handleGameEnd}
            onRoundStart={updateGameViaAPI}
          />
        )}
        {screen === "round-results" && user && gameState && (
          <RoundResults
            results={gameState.roundResults}
            skipPenalty={Boolean(gameState.settings.skipPenalty)}
            onConfirm={handleRoundResultsConfirm}
            onBack={() => setScreen("game-play")}
          />
        )}
        {screen === "game-history" && user && (
          <GameHistory
            onBack={() => setScreen("theme-selection")}
            onResumeGame={(gameState, gameId) => {
              setGameId(gameId.toString());
              localStorage.setItem("tag_current_game_id", gameId.toString());
              setGameState(gameState);
              setScreen("game-play");
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
