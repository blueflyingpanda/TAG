import type { PanInfo } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { GameState } from "../types";
import {
  checkWinCondition,
  getAvailableWords,
  getCurrentTeam,
  shuffleArray,
} from "../utils/game";
import { storage } from "../utils/storage";

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
    null
  );
  const [roundPausedOnce, setRoundPausedOnce] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);
  const roundResultsRef = useRef<{ word: string; guessed: boolean }[]>([]);
  const [roundEndedByTimeout, setRoundEndedByTimeout] = useState(false);

  // Animation states
  const [cardExitX, setCardExitX] = useState(0);
  const [isCardExiting, setIsCardExiting] = useState(false);
  const [nextWord, setNextWord] = useState("");

  // Cheating detection
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const roundStartTimeRef = useRef<number | null>(null);

  const availableWords = getAvailableWords(
    gameState.settings.theme,
    gameState.wordsUsed
  );
  const currentTeam = getCurrentTeam(gameState);

  const remainingTime =
    gameState.isRoundActive && gameState.roundStartTime && !gameState.isPaused
      ? Math.max(
          0,
          Math.ceil(
            (gameState.settings.roundTimer * 1000 -
              (Date.now() - gameState.roundStartTime)) /
              1000
          )
        )
      : gameState.isPaused
      ? pausedRemainingTime || 0
      : 0;

  // Update timer display every second
  useEffect(() => {
    if (
      gameState.isRoundActive &&
      gameState.roundStartTime !== null &&
      !gameState.isPaused
    ) {
      timerIntervalRef.current = window.setInterval(() => {
        const startTime = gameState.roundStartTime;
        if (startTime === null) return;

        const time = Math.max(
          0,
          Math.ceil(
            (gameState.settings.roundTimer * 1000 - (Date.now() - startTime)) /
              1000
          )
        );
        setCurrentTime(time);

        if (time <= 0) {
          endRound(true); // Pass true to indicate timeout
        }
      }, 100);

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
    gameState.settings.roundTimer,
  ]);

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
          1000
      )
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
      (Date.now() - roundStartTimeRef.current) / 1000
    );

    // Cheating if guessed words exceed elapsed seconds
    return guessedWordsCount > elapsedSeconds;
  };

  const handleWordAction = (guessed: boolean) => {
    if (!currentWord || isCardExiting || cheatingDetected) return;

    // Set animation direction based on action
    setIsCardExiting(true);
    setCardExitX(guessed ? 300 : -300);

    // Process the word action after animation starts
    setTimeout(() => {
      const newResults = [...roundResults, { word: currentWord, guessed }];
      setRoundResults(newResults);
      roundResultsRef.current = newResults;

      // Check for cheating after adding the new result
      const guessedCount = newResults.filter((r) => r.guessed).length;
      const isCheating = checkForCheating(guessedCount);

      if (isCheating) {
        setCheatingDetected(true);
        setIsCardExiting(false);
        setCardExitX(0);
        setCurrentWord("");
        setNextWord("");
        return;
      }

      const nextIndex = gameState.currentWordIndex + 1;

      if (nextIndex >= roundWords.length) {
        // No more words - end round
        setIsCardExiting(false);
        setCardExitX(0);
        endRound();
        return;
      }

      const nextWordValue = roundWords[nextIndex];
      setNextWord(nextWordValue);
      setCurrentWord(nextWordValue);

      setGameState({
        ...gameState,
        currentWordIndex: nextIndex,
      });

      // Reset animation state
      setTimeout(() => {
        setIsCardExiting(false);
        setCardExitX(0);
        setNextWord("");
      }, 150);
    }, 200);
  };

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

  if (winners.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#223164] via-[#1a2651] to-[#223164] flex items-center justify-center p-4">
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 max-w-2xl w-full text-center space-y-8 border border-white/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-5xl font-bold text-white mb-6">Game Over!</h1>
          <h2 className="text-3xl font-semibold text-[#ECACAE] mb-8">
            {winners.length === 1
              ? `${winners[0]} Wins!`
              : `${winners.join(" & ")} Win!`}
          </h2>

          <div className="space-y-4">
            {Object.entries(gameState.teamScores).map(([team, score]) => (
              <div
                key={team}
                className="bg-white/5 rounded-xl p-4 flex justify-between items-center"
              >
                <span className="text-white text-xl font-semibold">{team}</span>
                <span className="text-[#ECACAE] text-2xl font-bold">
                  {score} points
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onGameEnd}
            className="mt-8 px-8 py-4 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold text-xl hover:opacity-90 transition"
          >
            New Game
          </button>
        </motion.div>
      </div>
    );
  }

  if (!gameState.isRoundActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#223164] via-[#1a2651] to-[#223164] flex items-center justify-center p-4">
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center space-y-6 border border-white/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h2 className="text-3xl font-bold text-white">
            Round {gameState.currentRound}
          </h2>
          <div className="text-5xl font-bold text-[#ECACAE]">{currentTeam}</div>

          <div className="bg-white/5 rounded-xl p-6 space-y-4">
            <h3 className="text-white text-lg font-semibold">Current Scores</h3>
            {Object.entries(gameState.teamScores).map(([team, score]) => (
              <div
                key={team}
                className="flex justify-between items-center text-white"
              >
                <span>{team}</span>
                <span className="font-bold">
                  {score} / {gameState.settings.pointsRequired}
                </span>
              </div>
            ))}
          </div>

          <p className="text-white/70">
            {availableWords.length} words remaining
          </p>

          <button
            onClick={() => startRound()}
            className="px-8 py-4 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold text-xl hover:opacity-90 transition"
          >
            Start Round
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#223164] via-[#1a2651] to-[#223164] flex flex-col items-center justify-center p-4 relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <div className="text-white text-xl font-semibold">
          Round {gameState.currentRound}
        </div>
        <div className="text-[#ECACAE] text-2xl font-bold">{currentTeam}</div>
      </div>

      {/* Timer */}
      <div className="absolute top-24 flex flex-col items-center gap-2">
        <div className="text-white/70 text-sm font-medium">Time</div>
        <motion.div
          className="text-6xl font-bold text-white"
          animate={{
            scale:
              (currentTime || remainingTime) <= 5 &&
              (currentTime || remainingTime) > 0
                ? [1, 1.2, 1]
                : 1,
            opacity:
              (currentTime || remainingTime) <= 5 &&
              (currentTime || remainingTime) > 0
                ? [1, 0.5, 1]
                : 1,
          }}
          transition={{
            duration: 0.5,
            repeat:
              (currentTime || remainingTime) <= 5 &&
              (currentTime || remainingTime) > 0
                ? Infinity
                : 0,
            repeatType: "loop",
          }}
        >
          {currentTime || remainingTime}s
        </motion.div>
        <div className="text-white/50 text-sm">
          {roundResults.length} / {roundWords.length} words
        </div>
      </div>

      {/* Cheating Detection Banner */}
      <AnimatePresence>
        {cheatingDetected && (
          <motion.div
            className="absolute top-48 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold shadow-lg border border-red-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            ⚠️ Cheating Detected - Wait for round to end
          </motion.div>
        )}

        {/* Pause Warning Banner */}
        {gameState.isPaused && (
          <motion.div
            className="absolute top-48 bg-yellow-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold shadow-lg border border-yellow-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            ⚠️ Round Paused - Current data may not be saved if round is not
            finished
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Stack */}
      <div className="relative w-full max-w-md h-96 flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {/* Next card (preview) */}
          {nextWord && (
            <motion.div
              key={`next-${nextWord}`}
              className="absolute w-full h-80 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 0.95, opacity: 0.5 }}
              style={{ zIndex: 1 }}
            >
              <div className="h-full flex items-center justify-center p-8">
                <p className="text-white text-4xl font-bold text-center">
                  {nextWord}
                </p>
              </div>
            </motion.div>
          )}

          {/* Current card */}
          {currentWord && !cheatingDetected && !gameState.isPaused && (
            <motion.div
              key={currentWord}
              className="absolute w-full h-80 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/30 shadow-2xl cursor-grab active:cursor-grabbing"
              style={{ zIndex: 2 }}
              initial={{ scale: 1, opacity: 1, x: 0, rotate: 0 }}
              exit={{
                x: cardExitX,
                opacity: 0,
                scale: 0.8,
                rotate: cardExitX > 0 ? 15 : cardExitX < 0 ? -15 : 0,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(_, info: PanInfo) => {
                const swipeThreshold = 100;
                if (info.offset.x > swipeThreshold) {
                  handleWordAction(true); // Swipe right = guessed
                } else if (info.offset.x < -swipeThreshold) {
                  handleWordAction(false); // Swipe left = skip
                }
              }}
              whileDrag={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="h-full flex items-center justify-center p-8">
                <p className="text-white text-5xl font-bold text-center leading-tight">
                  {currentWord}
                </p>
              </div>
            </motion.div>
          )}

          {/* Cheating placeholder card */}
          {cheatingDetected && (
            <motion.div
              key="cheating-placeholder"
              className="absolute w-full h-80 bg-red-500/20 backdrop-blur-lg rounded-3xl border border-red-400/50 shadow-2xl"
              style={{ zIndex: 2 }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="text-6xl">⚠️</div>
                  <p className="text-white text-2xl font-bold">
                    Cheating Detected
                  </p>
                  <p className="text-white/70 text-sm">
                    Too many words guessed too quickly
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Paused card */}
          {gameState.isPaused && (
            <motion.div
              key="paused-placeholder"
              className="absolute w-full h-80 bg-yellow-500/20 backdrop-blur-lg rounded-3xl border border-yellow-400/50 shadow-2xl"
              style={{ zIndex: 2 }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="text-6xl">⏸️</div>
                  <p className="text-white text-2xl font-bold">Round Paused</p>
                  <p className="text-white/70 text-sm">
                    Word is hidden until resumed
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      {!gameState.isPaused ? (
        <>
          {/* Main Action Buttons */}
          <div className="flex gap-4 mt-12 w-full max-w-md">
            <motion.button
              onClick={() => handleWordAction(false)}
              disabled={cheatingDetected}
              className="flex-1 px-6 py-4 bg-red-500/20 text-red-200 rounded-lg font-semibold hover:bg-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={
                !cheatingDetected
                  ? {
                      scale: 0.85,
                      rotate: -2,
                      boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
                    }
                  : {}
              }
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Skip ❌
            </motion.button>

            <motion.button
              onClick={() => handleWordAction(true)}
              disabled={cheatingDetected}
              className="flex-1 px-6 py-4 bg-green-500/20 text-green-200 rounded-lg font-semibold hover:bg-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={
                !cheatingDetected
                  ? {
                      scale: 0.85,
                      rotate: 2,
                      boxShadow: "0 0 20px rgba(34, 197, 94, 0.5)",
                    }
                  : {}
              }
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Guessed ✅
            </motion.button>
          </div>

          {/* Pause Button - Positioned at bottom */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <motion.button
              onClick={stopRound}
              disabled={cheatingDetected || roundPausedOnce}
              className={`px-6 py-4 rounded-lg font-semibold transition ${
                roundPausedOnce
                  ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                  : "bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              whileTap={
                !cheatingDetected && !roundPausedOnce
                  ? {
                      scale: 0.85,
                      boxShadow: "0 0 20px rgba(234, 179, 8, 0.5)",
                    }
                  : {}
              }
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              ⏸️ {roundPausedOnce ? "Paused" : "Pause"}
            </motion.button>
          </div>
        </>
      ) : (
        /* Resume Button - Positioned at bottom when paused */
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <motion.button
            onClick={resumeRound}
            className="px-8 py-4 bg-blue-500/20 text-blue-200 rounded-lg font-semibold hover:bg-blue-500/30 transition"
            whileTap={{
              scale: 0.85,
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            ▶️ Resume Round
          </motion.button>
        </div>
      )}
    </div>
  );
}
