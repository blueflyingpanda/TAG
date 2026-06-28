import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocale } from "./contexts/LocaleContext";
import { useTheme } from "./hooks/useTheme";
import CreateTheme from "./components/CreateTheme";
import EditTheme from "./components/EditTheme";
import GameHistory from "./components/GameHistory";
import GamePlay from "./components/GamePlay";
import GameSetup from "./components/GameSetup";
import Login from "./components/Login";
import RoundResults from "./components/RoundResults";
import Rules from "./components/Rules";
import ThemeDetails from "./components/ThemeDetails";
import ThemeSelection from "./components/ThemeSelection";
import type { GameSettings, GameState, Theme, User } from "./types";
import { checkWinCondition, initializeGameState } from "./utils/game";
import { createGame, updateGame } from "./utils/games";
import {
  clearOAuthCallback,
  clearStoredToken,
  exchangeOAuthCode,
  exchangeTelegramInitData,
  getCurrentUser,
  setUnauthorizedHandler,
} from "./utils/oauth";
import { storage } from "./utils/storage";

const screenTransition = { ease: "easeInOut" as const, duration: 0.2 };

function getDeepLinkThemeId(): number | null {
  // GitHub Pages 404 hack: direct URL gets redirected to /?redirect=%2FTAG%2Ftheme%2F29%2F
  const redirect = new URLSearchParams(window.location.search).get('redirect');
  const pathToCheck = redirect ?? window.location.pathname;
  const match = pathToCheck.match(/\/theme\/(\d+)\/?$/);
  return match ? parseInt(match[1], 10) : null;
}

const PENDING_THEME_KEY = 'tag_pending_theme_id';

function consumePendingThemeId(): number | null {
  const stored = sessionStorage.getItem(PENDING_THEME_KEY);
  if (stored) {
    sessionStorage.removeItem(PENDING_THEME_KEY);
    const id = parseInt(stored, 10);
    return isNaN(id) ? null : id;
  }
  return null;
}

type AppScreen =
  | "login"
  | "theme-selection"
  | "theme-details"
  | "edit-theme"
  | "game-setup"
  | "game-play"
  | "round-results"
  | "game-history"
  | "create-theme"
  | "rules";

function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { t, locale, setLocale } = useLocale();
  const initialUser = storage.getUser();
  const [screen, setScreen] = useState<AppScreen>(() => {
    if (!initialUser) return "login";
    const savedState = storage.getGameState();
    if (savedState) return "game-play";
    if (getDeepLinkThemeId()) return "theme-details";
    return "theme-selection";
  });
  const [user, setUser] = useState<User | null>(initialUser);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(
    initialUser ? getDeepLinkThemeId() : null,
  );
  const [themeFilters, setThemeFilters] = useState<URLSearchParams | null>(
    null,
  );
  const [gameState, setGameState] = useState<GameState | null>(() => {
    // Only restore game state if user is authenticated
    return initialUser ? storage.getGameState() : null;
  });
  const [roundLastWord, setRoundLastWord] = useState<string | null>(null);
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

  // Replace ?redirect=/TAG/theme/29/ with the clean canonical URL on first load.
  // Also persist the theme ID to sessionStorage so it survives the OAuth redirect.
  useEffect(() => {
    const deepId = getDeepLinkThemeId();
    if (deepId && !initialUser) {
      sessionStorage.setItem(PENDING_THEME_KEY, String(deepId));
    }

    const redirect = new URLSearchParams(window.location.search).get('redirect');
    if (redirect) {
      const match = redirect.match(/\/theme\/(\d+)\/?$/);
      if (match) {
        window.history.replaceState({}, '', `/TAG/theme/${match[1]}/`);
      }
    }
  }, []);

  useEffect(() => {
    const handleAuthStartup = async () => {
      const telegram = (window as any).Telegram?.WebApp;
      const initData = telegram?.initData;

      if (initData) {
        try {
          telegram.ready();
          telegram.expand();

          await exchangeTelegramInitData(initData);
          const userData = getCurrentUser();
          if (userData) {
            storage.saveUser(userData);
            setUser(userData);
            const pendingId = consumePendingThemeId() ?? getDeepLinkThemeId();
            if (pendingId) {
              window.history.replaceState({}, '', `/TAG/theme/${pendingId}/`);
              setSelectedThemeId(pendingId);
              setScreen("theme-details");
            } else setScreen("theme-selection");
          }
          return;
        } catch (err) {
          console.error("Telegram auth failed:", err);
          setScreen("login");
          return;
        }
      }

      // Handle OAuth callback from backend redirect
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
        const userData = getCurrentUser();
        if (userData) {
          storage.saveUser(userData);
          setUser(userData);
          const pendingId = consumePendingThemeId() ?? getDeepLinkThemeId();
          if (pendingId) {
            window.history.replaceState({}, '', `/TAG/theme/${pendingId}/`);
            setSelectedThemeId(pendingId);
            setScreen("theme-details");
          } else setScreen("theme-selection");
        }
      } catch (err) {
        console.error("OAuth exchange failed:", err);
        // Redirect back to login on error
        setScreen("login");
      }
    };

    handleAuthStartup();
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
    sessionStorage.removeItem(PENDING_THEME_KEY);
    window.history.pushState({}, '', '/TAG/');
    setUser(null);
    setGameState(null);
    setScreen("login");
  };

  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setScreen("game-setup");
  };

  const handleGameStart = async (settings: GameSettings) => {
    try {
      // Create game via API with correct payload structure
      const gameData = {
        theme_id: settings.theme.id,
        difficulty: settings.difficulty,
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

      // Ensure round timer respects minimum (15s), clamp difficulty, and coerce skipPenalty to boolean
      const safeSettings = {
        ...settings,
        roundTimer: Math.max(settings.roundTimer, 15),
        difficulty: Math.max(1, Math.min(settings.difficulty, 5)),
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
        difficulty: Math.max(1, Math.min(settings.difficulty, 5)),
        skipPenalty: !!settings.skipPenalty,
      };
      const newGameState = initializeGameState(safeSettings);
      setGameState(newGameState);
      setScreen("game-play");
    }
  };

  const handleRoundEnd = (results: { word: string; guessed: boolean }[], lastWord?: string) => {
    if (!gameState) return;
    // Ignore late or duplicate end signals if the game already has a winner
    // (for example a pending timeout firing after the round was already
    // confirmed) — in that case the game should have stopped.
    const existingWinners = checkWinCondition(gameState);
    if (existingWinners.length > 0) return;

    // (previous duplicate-guard removed) process incoming results

    // If no words were processed and there's no last word to credit,
    // advance to the next team immediately so the same team does not keep playing.
    if (results.length === 0 && !lastWord) {
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
    setRoundLastWord(lastWord ?? null);
    setGameState({ ...gameState, roundResults: results });
    setScreen("round-results");
  };

  const handleRoundResultsConfirm = (
    finalResults: { word: string; guessed: boolean }[],
    lastWordGuessed: boolean | null,
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

    // Last word: +1 if guessed, no penalty and not tracked if not guessed
    const resultsForAPI = [...finalResults];
    if (lastWordGuessed && roundLastWord) {
      scoreChange += 1;
      updatedState.wordsUsed.push(roundLastWord);
      resultsForAPI.push({ word: roundLastWord, guessed: true });
    }
    setRoundLastWord(null);

    updatedState.teamScores[currentTeam] += scoreChange;
    updatedState.wordsUsed.push(...finalResults.map((r) => r.word));

    // Check if win condition is reached after updating score
    const winners = checkWinCondition(updatedState);

    if (winners.length > 0) {
      // Game ends - show winner screen immediately
      // Update API with final state before clearing
      const tempStateForAPI = { ...updatedState, roundResults: resultsForAPI };
      updateGameViaAPI(tempStateForAPI);

      storage.clearGameState();
      setGameState(updatedState);
      setScreen("game-play"); // Will show winner screen
      return;
    }

    // Move to next team BEFORE updating API
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

    // Update game via API with the round results AFTER moving to next team
    const tempStateForAPI = { ...updatedState, roundResults: resultsForAPI };
    updateGameViaAPI(tempStateForAPI);

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
            }),
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
        hideHeaderButtons ? "h-dvh overflow-hidden p-2" : "min-h-dvh p-4"
      } w-full flex items-center justify-center bg-transparent`}
    >
      <div
        className={`w-full max-w-4xl mx-auto ${
          hideHeaderButtons ? "h-full" : ""
        }`}
      >
        {user && (
          <div className="mb-4 text-text">
            <div className="flex items-center justify-between gap-2">
              {/* Language pill — left */}
              <button
                type="button"
                onClick={() => setLocale(locale === "en" ? "ru" : "en")}
                aria-label="Switch language"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-text/15 bg-text/[0.07] text-base transition-colors hover:bg-text/[0.12]"
              >
                {locale === "en" ? "🇬🇧" : "🇷🇺"}
              </button>

              {/* User info — center */}
              <div className="flex items-center gap-3">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={t.nav_profileAlt}
                    className="h-8 w-8 rounded-full border-2 border-text/15"
                  />
                )}
                <div className="text-left">
                  <div className="text-sm font-semibold text-text">
                    {user.username}
                  </div>
                  {user.email ? (
                    <div className="text-sm text-text/80">{user.email}</div>
                  ) : null}
                </div>
              </div>

              {/* Dark mode toggle — right */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={t.nav_toggleDark}
                className="relative flex h-7 w-14 items-center rounded-full border border-text/15 bg-text/[0.07] px-1 transition-colors hover:bg-text/[0.12]"
              >
                <span className="absolute left-1.5 text-xs">☀️</span>
                <span className="absolute right-1.5 text-xs">🌙</span>
                <span
                  className={`relative z-10 h-5 w-5 rounded-full bg-card shadow transition-transform duration-300 ${
                    theme === "dark" ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {!hideHeaderButtons && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    window.history.pushState({}, '', '/TAG/');
                    setScreen("theme-selection");
                    setSelectedTheme(null);
                  }}
                  className={`rounded-game px-4 py-2 text-sm font-semibold transition md:text-base ${
                    screen === "theme-selection"
                      ? "cursor-default bg-success text-white"
                      : "border border-text/15 bg-card text-text shadow-sm hover:border-success/40"
                  }`}
                  disabled={screen === "theme-selection"}
                >
                  {t.nav_home}
                </button>

                <button
                  type="button"
                  onClick={() => { window.history.pushState({}, '', '/TAG/'); setScreen("game-history"); }}
                  className={`rounded-game px-4 py-2 text-sm font-semibold transition md:text-base ${
                    screen === "game-history"
                      ? "cursor-default bg-success text-white"
                      : "border border-text/15 bg-card text-text shadow-sm hover:border-success/40"
                  }`}
                  disabled={screen === "game-history"}
                >
                  {t.nav_history}
                </button>

                <button
                  type="button"
                  onClick={() => { window.history.pushState({}, '', '/TAG/'); setScreen("rules"); }}
                  className={`rounded-game px-4 py-2 text-sm font-semibold transition md:text-base ${
                    screen === "rules"
                      ? "cursor-default bg-success text-white"
                      : "border border-text/15 bg-card text-text shadow-sm hover:border-success/40"
                  }`}
                  disabled={screen === "rules"}
                >
                  {t.nav_rules}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-game bg-error px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 md:text-base"
                >
                  {t.nav_logout}
                </button>
              </div>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            className={hideHeaderButtons ? "h-full" : ""}
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={screenTransition}
          >
            {screen === "login" && <Login />}
            {screen === "theme-selection" && user && (
              <ThemeSelection
                user={user}
                onThemeSelect={handleThemeSelect}
                onCreateTheme={() => setScreen("create-theme")}
                onThemeDetails={(themeId, filters) => {
                  setSelectedThemeId(themeId);
                  setThemeFilters(filters || null);
                  window.history.pushState({}, '', `/TAG/theme/${themeId}/`);
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
                  const search = filters?.toString() ? `?${filters.toString()}` : '';
                  window.history.pushState({}, '', `/TAG/${search}`);
                  setScreen("theme-selection");
                }}
                onThemeSelect={handleThemeSelect}
                onEdit={() => setScreen("edit-theme")}
              />
            )}
            {screen === "edit-theme" && user && selectedThemeId && (
              <EditTheme
                user={user}
                themeId={selectedThemeId}
                onBack={() => setScreen("theme-details")}
                onSaved={() => setScreen("theme-details")}
              />
            )}
            {screen === "create-theme" && user && (
              <CreateTheme
                user={user}
                onBack={() => setScreen("theme-selection")}
                onThemeCreated={(theme) => {
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
              />
            )}
            {screen === "round-results" && user && gameState && (
              <RoundResults
                results={gameState.roundResults}
                skipPenalty={Boolean(gameState.settings.skipPenalty)}
                lastWord={roundLastWord ?? undefined}
                onConfirm={handleRoundResultsConfirm}
              />
            )}
            {screen === "game-history" && user && (
              <GameHistory
                onBack={() => setScreen("theme-selection")}
                onResumeGame={(gameState, gameId) => {
                  setGameId(gameId.toString());
                  localStorage.setItem(
                    "tag_current_game_id",
                    gameId.toString(),
                  );
                  setGameState(gameState);
                  setScreen("game-play");
                }}
              />
            )}
            {screen === "rules" && <Rules />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
