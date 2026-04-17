import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { GameState } from "../types";
import { Button } from "../ui/Button";
import { Countdown } from "../ui/Countdown";
import { Counter } from "../ui/Counter";
import {
  checkWinCondition,
  getAvailableWords,
  getCurrentTeam,
  shuffleArray,
} from "../utils/game";
import { storage } from "../utils/storage";
import { GamePlayCardStack } from "./GamePlayCardStack";

interface GamePlayProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onRoundEnd: (results: { word: string; guessed: boolean }[]) => void;
  onGameEnd: () => void;
}

export default function GamePlay({
  gameState,
  setGameState,
  onRoundEnd,
  onGameEnd,
}: GamePlayProps) {
  const [currentWord, setCurrentWord] = useState("");
  const [roundWords, setRoundWords] = useState<string[]>([]);
  const [roundResults, setRoundResults] = useState<
    { word: string; guessed: boolean }[]
  >([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [pausedRemainingTime, setPausedRemainingTime] = useState<number | null>(
    null,
  );
  const [roundPausedOnce, setRoundPausedOnce] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);
  const roundResultsRef = useRef<{ word: string; guessed: boolean }[]>([]);
  const [roundEndedByTimeout, setRoundEndedByTimeout] = useState(false);

  const [cardExitX, setCardExitX] = useState(0);
  const [isCardExiting, setIsCardExiting] = useState(false);

  // Cheating detection
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const roundStartTimeRef = useRef<number | null>(null);

  const availableWords = getAvailableWords(
    gameState.settings.theme,
    gameState.wordsUsed,
    gameState.settings.difficulty,
  );
  const currentTeam = getCurrentTeam(gameState);

  const remainingTime =
    gameState.isRoundActive && gameState.roundStartTime && !gameState.isPaused
      ? Math.max(
          0,
          Math.ceil(
            (gameState.settings.roundTimer * 1000 -
              (Date.now() - gameState.roundStartTime)) /
              1000,
          ),
        )
      : gameState.isPaused
        ? pausedRemainingTime || 0
        : 0;

  // Auto-start next round if previous round ended by timeout
  useEffect(() => {
    if (
      roundEndedByTimeout &&
      !gameState.isRoundActive &&
      availableWords.length > 0
    ) {
      setRoundEndedByTimeout(false);
      startRound();
    }
  }, [roundEndedByTimeout, gameState.isRoundActive, availableWords.length]);

  const startRound = () => {
    if (availableWords.length === 0) {
      // When no words remain, find team(s) with highest score
      const maxScore = Math.max(...Object.values(gameState.teamScores));
      const winners = Object.entries(gameState.teamScores)
        .filter(([, score]) => score === maxScore)
        .map(([team]) => team);

      if (winners.length > 0) {
        // Don't call onGameEnd - let the winner display handle it
        return;
      }

      // No teams (shouldn't happen) - end the game
      onGameEnd();
      return;
    }

    const shuffled = shuffleArray([...availableWords]);
    setRoundWords(shuffled);
    const firstWord = shuffled[0] || "";
    setCurrentWord(firstWord);
    setRoundResults([]);
    roundResultsRef.current = [];
    setCheatingDetected(false);
    setRoundPausedOnce(false); // Reset pause tracking for new round
    roundStartTimeRef.current = Date.now();

    setGameState({
      ...gameState,
      isRoundActive: true,
      isPaused: false,
      roundStartTime: Date.now(),
      currentWordIndex: 0,
    });
  };

  const endRound = (timedOut = false) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // Capture results IMMEDIATELY before any async operations
    const roundEndResults = [...roundResultsRef.current];

    setRoundEndedByTimeout(timedOut);
    setGameState({
      ...gameState,
      isRoundActive: false,
      roundEndTime: Date.now(),
    });

    // Reset cheating detection for next round
    setCheatingDetected(false);
    roundStartTimeRef.current = null;

    // Get the latest results - don't count the last word if timer ended
    setTimeout(() => {
      setRoundResults(roundEndResults);
      onRoundEnd(roundEndResults);
    }, 100);
  };

  const endRoundRef = useRef(endRound);
  endRoundRef.current = endRound;

  useEffect(() => {
    if (
      gameState.isRoundActive &&
      gameState.roundStartTime !== null &&
      !gameState.isPaused
    ) {
      const startTime = gameState.roundStartTime;
      const roundTimer = gameState.settings.roundTimer;

      const tick = () => {
        if (startTime === null) return;

        const time = Math.max(
          0,
          Math.ceil((roundTimer * 1000 - (Date.now() - startTime)) / 1000),
        );
        setCurrentTime(time);

        if (time <= 0) {
          endRoundRef.current(true);
        }
      };

      tick();
      timerIntervalRef.current = window.setInterval(tick, 1000);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    } else {
      setCurrentTime(0);
    }
  }, [
    gameState.isRoundActive,
    gameState.roundStartTime,
    gameState.isPaused,
    gameState.settings.roundTimer,
  ]);

  const stopRound = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // Capture current remaining time before pausing
    const currentRemaining = Math.max(
      0,
      Math.ceil(
        (gameState.settings.roundTimer * 1000 -
          (Date.now() - (gameState.roundStartTime || 0))) /
          1000,
      ),
    );
    setPausedRemainingTime(currentRemaining);

    // Shuffle all remaining words including current word as penalty
    const remainingWords = roundWords.slice(roundResults.length);
    const shuffledRemaining = shuffleArray(remainingWords);
    const newRoundWords = [
      ...roundWords.slice(0, roundResults.length),
      ...shuffledRemaining,
    ];

    setRoundWords(newRoundWords);
    // Update current word to the new shuffled word
    const newCurrentWord = shuffledRemaining[0] || "";
    setCurrentWord(newCurrentWord);

    setRoundPausedOnce(true); // Mark that round has been paused once

    // Update game state
    const updatedState = {
      ...gameState,
      isPaused: true,
      roundStartTime: null, // Stop the timer
    };

    setGameState(updatedState);

    // Save to local storage (but don't send to API)
    storage.saveGameState(updatedState);
  };

  const resumeRound = () => {
    // Calculate new start time to preserve remaining time
    const remainingSeconds = pausedRemainingTime || 0;
    const newStartTime =
      Date.now() - (gameState.settings.roundTimer - remainingSeconds) * 1000;

    const updatedState = {
      ...gameState,
      isPaused: false,
      roundStartTime: newStartTime,
    };

    setGameState(updatedState);
    setPausedRemainingTime(null); // Clear paused time

    // Clear saved state since we're resuming
    storage.clearGameState();
  };

  const checkForCheating = (guessedWordsCount: number): boolean => {
    if (!roundStartTimeRef.current) return false;

    const elapsedSeconds = Math.floor(
      (Date.now() - roundStartTimeRef.current) / 1000,
    );

    // Cheating if guessed words exceed elapsed seconds
    return guessedWordsCount > elapsedSeconds;
  };

  /** Same cadence as alias-main card-deck (100ms) so the next card rises under the exiting one */
  const CARD_ADVANCE_MS = 100;

  const handleWordAction = (guessed: boolean) => {
    if (!currentWord || isCardExiting || cheatingDetected) return;

    setIsCardExiting(true);
    setCardExitX(guessed ? 250 : -250);

    window.setTimeout(() => {
      const newResults = [...roundResults, { word: currentWord, guessed }];
      setRoundResults(newResults);
      roundResultsRef.current = newResults;

      const guessedCount = newResults.filter((r) => r.guessed).length;
      const isCheating = checkForCheating(guessedCount);

      if (isCheating) {
        setCheatingDetected(true);
        setIsCardExiting(false);
        setCardExitX(0);
        setCurrentWord("");
        return;
      }

      const nextIndex = gameState.currentWordIndex + 1;

      if (nextIndex >= roundWords.length) {
        setIsCardExiting(false);
        setCardExitX(0);
        endRound();
        return;
      }

      const nextWordValue = roundWords[nextIndex];
      setCurrentWord(nextWordValue);
      setGameState({
        ...gameState,
        currentWordIndex: nextIndex,
      });
      setIsCardExiting(false);
      setCardExitX(0);
    }, CARD_ADVANCE_MS);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !gameState.isRoundActive ||
        gameState.isPaused ||
        cheatingDetected ||
        isCardExiting
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleWordAction(false);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleWordAction(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    gameState.isRoundActive,
    gameState.isPaused,
    cheatingDetected,
    isCardExiting,
    currentWord,
    roundResults,
    roundWords,
  ]);

  // Check for winners: either reached target score or no words left
  let winners: string[] = [];

  // First check if anyone reached the target score
  const targetWinners = checkWinCondition(gameState);
  if (targetWinners.length > 0) {
    winners = targetWinners;
  } else if (availableWords.length === 0) {
    // No words left - find team(s) with highest score
    const maxScore = Math.max(...Object.values(gameState.teamScores));
    winners = Object.entries(gameState.teamScores)
      .filter(([, score]) => score === maxScore)
      .map(([team]) => team);
  }

  const displaySeconds = currentTime || remainingTime;
  const timerWarning =
    displaySeconds <= 5 && displaySeconds > 0 && !gameState.isPaused;
  const guessedThisRound = roundResults.filter((r) => r.guessed).length;
  const skippedThisRound = roundResults.filter((r) => !r.guessed).length;

  const backWord =
    gameState.isRoundActive &&
    !gameState.isPaused &&
    gameState.currentWordIndex + 1 < roundWords.length
      ? roundWords[gameState.currentWordIndex + 1]
      : null;

  if (winners.length > 0) {
    return (
      <div className="fixed inset-0 flex flex-col bg-transparent p-4">
        <div className="flex-1 overflow-y-auto pb-20">
          <motion.div
            className="mx-auto w-full max-w-2xl space-y-6 rounded-game border border-text/10 bg-card p-8 text-center shadow-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 text-5xl">🎉</div>
            <h1 className="mb-4 text-4xl font-bold text-text">Game Over!</h1>
            <h2 className="mb-6 text-2xl font-semibold text-success">
              {winners.length === 1
                ? `${winners[0]} Wins!`
                : `${winners.join(" & ")} Win!`}
            </h2>

            <div className="space-y-3">
              {Object.entries(gameState.teamScores).map(([team, score]) => (
                <div
                  key={team}
                  className="flex items-center justify-between rounded-game border border-text/10 bg-text/[0.04] p-3"
                >
                  <span className="truncate text-base font-semibold text-text">
                    {team}
                  </span>
                  <span className="ml-2 text-lg font-bold text-success">
                    {score}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="pointer-events-none fixed bottom-4 left-0 right-0 flex justify-center">
          <button
            type="button"
            onClick={onGameEnd}
            className="pointer-events-auto rounded-game bg-success px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            New Game
          </button>
        </div>
      </div>
    );
  }

  if (!gameState.isRoundActive) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-transparent p-4">
        <motion.div
          className="w-full max-w-md space-y-6 rounded-game border border-text/10 bg-card p-8 text-center shadow-sm"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h2 className="text-3xl font-bold text-text">
            Round {gameState.currentRound}
          </h2>
          <div className="mx-auto max-w-[200px] truncate text-2xl font-bold text-success">
            {currentTeam}
          </div>

          <div className="space-y-4 rounded-game border border-text/10 bg-text/[0.04] p-6">
            <h3 className="text-lg font-semibold text-text">Current Scores</h3>
            {Object.entries(gameState.teamScores).map(([team, score]) => (
              <div
                key={team}
                className="flex items-center justify-between text-text"
              >
                <span>{team}</span>
                <span className="font-bold">
                  {score} / {gameState.settings.pointsRequired}
                </span>
              </div>
            ))}
          </div>

          <p className="text-text/70">
            {availableWords.length} words remaining
          </p>

          <motion.button
            type="button"
            onClick={() => startRound()}
            className="w-full rounded-game bg-success px-8 py-4 text-xl font-semibold text-white shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Round
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-transparent p-2 md:p-4">
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-1 md:p-6">
        <div className="text-base font-semibold text-text md:text-lg">
          Round {gameState.currentRound}
        </div>
        <div className="max-w-xs truncate text-base font-bold text-success md:text-lg">
          {currentTeam}
        </div>
      </div>

      <div className="absolute left-0 right-0 top-10 flex flex-col items-center gap-2 md:top-12">
        <Countdown
          seconds={displaySeconds}
          isWarning={timerWarning}
          suffix="s"
        />
        <div className="flex items-center gap-6 text-text/60">
          <div className="flex flex-col items-center gap-0.5">
            <Counter variant="error" value={skippedThisRound} />
            <span className="text-xs">Skipped</span>
          </div>
          <span className="pt-1 text-xs">
            {roundResults.length} / {roundWords.length}
          </span>
          <div className="flex flex-col items-center gap-0.5">
            <Counter variant="success" value={guessedThisRound} />
            <span className="text-xs">Guessed</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {cheatingDetected && (
          <motion.div
            className="absolute left-4 right-4 top-28 z-10 rounded-game border border-error/40 bg-card px-4 py-3 text-center text-sm font-semibold text-error shadow-md md:top-40 md:text-base"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            Cheating detected — wait for round to end
          </motion.div>
        )}

        {gameState.isPaused && (
          <motion.div
            className="absolute left-4 right-4 top-32 z-10 rounded-game border border-text/20 bg-card px-4 py-3 text-center text-sm font-semibold text-text shadow-md md:top-44 md:text-base"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            Round paused — finish the round so data can be saved
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mt-20 flex w-full flex-col items-center gap-4 md:mt-36 md:gap-6">
        <GamePlayCardStack
          currentIndex={gameState.currentWordIndex}
          currentWord={currentWord}
          backWord={backWord}
          cardExitX={cardExitX}
          interactionLocked={isCardExiting}
          cheatingDetected={cheatingDetected}
          isPaused={gameState.isPaused}
          onSwipeCommit={handleWordAction}
        />

        {/* Action Buttons */}
        {!gameState.isPaused ? (
          <div className="mt-12 flex w-full max-w-[min(290px,calc(100vw-2rem))] flex-col gap-2 px-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:gap-3 md:pb-0">
            <div className="flex w-full gap-3">
              <Button
                type="button"
                variant="error"
                disabled={cheatingDetected}
                onClick={() => handleWordAction(false)}
                className="!flex-1 !py-3 text-sm md:!py-4 md:text-base"
              >
                Skip ❌
              </Button>
              <Button
                type="button"
                variant="success"
                disabled={cheatingDetected}
                onClick={() => handleWordAction(true)}
                className="!flex-1 !py-3 text-sm md:!py-4 md:text-base"
              >
                Guessed ✅
              </Button>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="muted"
                disabled={cheatingDetected || roundPausedOnce}
                onClick={stopRound}
                className="!w-auto !px-5 !py-2.5 text-sm md:!py-3 md:text-base"
              >
                ⏸️ {roundPausedOnce ? "Paused" : "Pause"}
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-text/50 hidden md:block">
              Desktop shortcut: ← Skip, → Guessed
            </p>
          </div>
        ) : (
          <div className="flex w-full justify-center pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-0">
            <Button
              type="button"
              variant="success"
              onClick={resumeRound}
              className="!w-auto !px-6 !py-2.5 text-sm md:!py-3 md:text-base"
            >
              ▶️ Resume
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
