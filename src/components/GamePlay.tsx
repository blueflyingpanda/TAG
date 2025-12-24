import { useEffect, useRef, useState } from "react";
import type { GameState } from "../types";
import {
  checkWinCondition,
  getAvailableWords,
  getCurrentTeam,
  shuffleArray,
} from "../utils/game";

interface GamePlayProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onRoundEnd: (results: { word: string; guessed: boolean }[]) => void;
  onGameEnd: () => void;
  onRoundStart?: (gameState: GameState) => void;
}

export default function GamePlay({
  gameState,
  setGameState,
  onRoundEnd,
  onGameEnd,
  onRoundStart,
}: GamePlayProps) {
  const [currentWord, setCurrentWord] = useState<string>("");
  const [roundWords, setRoundWords] = useState<string[]>([]);
  const [roundResults, setRoundResults] = useState<
    { word: string; guessed: boolean }[]
  >([]);
  const [currentTime, setCurrentTime] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);
  const roundResultsRef = useRef<{ word: string; guessed: boolean }[]>([]);

  const availableWords = getAvailableWords(
    gameState.settings.theme,
    gameState.wordsUsed
  );
  const currentTeam = getCurrentTeam(gameState);
  const remainingTime =
    gameState.isRoundActive && gameState.roundStartTime
      ? Math.max(
          0,
          Math.ceil(
            (gameState.settings.roundTimer * 1000 -
              (Date.now() - gameState.roundStartTime)) /
              1000
          )
        )
      : 0;

  // Update timer display every second
  useEffect(() => {
    if (gameState.isRoundActive && gameState.roundStartTime !== null) {
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
          endRound();
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

  // Remove this useEffect - words are initialized in startRound

  const startRound = () => {
    if (availableWords.length === 0) {
      onGameEnd();
      return;
    }

    const shuffled = shuffleArray([...availableWords]);
    setRoundWords(shuffled);
    const firstWord = shuffled[0] || "";
    setCurrentWord(firstWord);
    setRoundResults([]);
    roundResultsRef.current = [];

    setGameState({
      ...gameState,
      isRoundActive: true,
      roundStartTime: Date.now(),
      currentWordIndex: 0,
    });

    // Notify parent component about round start for API updates
    if (onRoundStart) {
      onRoundStart({
        ...gameState,
        isRoundActive: true,
        roundStartTime: Date.now(),
        currentWordIndex: 0,
      });
    }
  };

  const endRound = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setGameState({
      ...gameState,
      isRoundActive: false,
      roundEndTime: Date.now(),
    });

    // Get the latest results - don't count the last word if timer ended
    setTimeout(() => {
      const currentResults = [...roundResultsRef.current];

      setRoundResults(currentResults);
      onRoundEnd(currentResults);
    }, 100);
  };

  const handleWordAction = (guessed: boolean) => {
    if (!currentWord) return;

    const newResults = [...roundResults, { word: currentWord, guessed }];
    setRoundResults(newResults);
    roundResultsRef.current = newResults;

    const nextIndex = gameState.currentWordIndex + 1;
    if (nextIndex >= roundWords.length) {
      // No more words - end round
      endRound();
      return;
    }

    const nextWord = roundWords[nextIndex];
    setCurrentWord(nextWord);
    setGameState({
      ...gameState,
      currentWordIndex: nextIndex,
    });
  };

  // Swiping removed: guessed/skip via buttons only

  const winner = checkWinCondition(gameState);

  if (winner) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-2xl w-full mx-auto text-center">
        <h1 className="text-4xl font-bold text-white mb-4">🎉 Game Over!</h1>
        <h2 className="text-2xl font-semibold text-[#ECACAE] mb-8">
          {winner} Wins!
        </h2>
        <div className="space-y-2 mb-8">
          {Object.entries(gameState.teamScores).map(([team, score]) => (
            <div key={team} className="flex justify-between text-white text-lg">
              <span>{team}</span>
              <span className="font-semibold">{score} points</span>
            </div>
          ))}
        </div>
        <button
          onClick={onGameEnd}
          className="px-8 py-3 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
        >
          New Game
        </button>
      </div>
    );
  }

  if (!gameState.isRoundActive) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-2xl w-full mx-auto text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Round {gameState.currentRound}
        </h1>
        <h2 className="text-2xl font-semibold text-[#ECACAE] mb-6">
          {currentTeam}
        </h2>

        <div className="mb-6 p-4 bg-white/10 rounded-lg">
          <h3 className="text-white font-semibold mb-3">Current Scores</h3>
          <div className="space-y-2">
            {Object.entries(gameState.teamScores).map(([team, score]) => (
              <div key={team} className="flex justify-between text-white">
                <span
                  className={
                    team === currentTeam ? "font-semibold text-[#ECACAE]" : ""
                  }
                >
                  {team}
                </span>
                <span className="font-semibold">
                  {score} / {gameState.settings.pointsRequired}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/80 mb-8">
          {availableWords.length} words remaining
        </p>
        <button
          onClick={startRound}
          className="px-8 py-4 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold text-xl hover:opacity-90 transition"
        >
          Start Round
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-2xl w-full mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-white/80">
            <div className="text-sm">Round {gameState.currentRound}</div>
            <div className="text-lg font-semibold">{currentTeam}</div>
          </div>
          <div className="text-white/80">
            <div className="text-sm">Time</div>
            <div className="text-2xl font-bold text-[#ECACAE]">
              {currentTime || remainingTime}s
            </div>
          </div>
        </div>
        <div className="text-white/60 text-sm">
          {roundResults.length} / {roundWords.length} words
        </div>
      </div>

      <div className="bg-white/20 rounded-2xl p-12 min-h-[300px] flex items-center justify-center select-none">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center">
          {currentWord}
        </h2>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => handleWordAction(false)}
          className="flex-1 px-6 py-4 bg-red-500/20 text-red-200 rounded-lg font-semibold hover:bg-red-500/30 transition"
        >
          Skip ❌
        </button>
        <button
          onClick={() => handleWordAction(true)}
          className="flex-1 px-6 py-4 bg-green-500/20 text-green-200 rounded-lg font-semibold hover:bg-green-500/30 transition"
        >
          Guessed ✅
        </button>
      </div>
    </div>
  );
}
