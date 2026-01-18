import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RoundResultsProps {
  results: { word: string; guessed: boolean }[];
  onConfirm: (results: { word: string; guessed: boolean }[]) => void;
  skipPenalty?: boolean;
}

export default function RoundResults({
  results,
  onConfirm,
  skipPenalty = true,
}: RoundResultsProps) {
  const [finalResults, setFinalResults] = useState(results);

  // Update finalResults when results prop changes
  useEffect(() => {
    setFinalResults(results);
  }, [results]);

  const toggleWord = (index: number) => {
    const updated = [...finalResults];
    updated[index] = {
      ...updated[index],
      guessed: !updated[index].guessed,
    };
    setFinalResults(updated);
  };

  const guessedCount = finalResults.filter((r) => r.guessed).length;
  const skippedCount = finalResults.length - guessedCount;
  const earned = skipPenalty ? guessedCount - skippedCount : guessedCount;
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // trigger a small scale pulse when earned changes
    // schedule the state update to avoid synchronous setState in effect
    const start = setTimeout(() => setPulse(true), 0);
    const end = setTimeout(() => setPulse(false), 300);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [earned]);

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-[#223164] via-[#1a2651] to-[#223164] flex flex-col p-4"
      initial={{ y: "100vh", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100vh", opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.6,
      }}
    >
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-2xl w-full mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Round Results
          </h1>
          <p className="text-white/60 mb-6 text-center">
            Tap words to toggle between ✅ and ❌
          </p>
          {results.length === 0 && (
            <p className="text-white/60 text-center mb-6">
              No words were processed in this round.
            </p>
          )}

          <div className="mb-6 flex justify-center gap-6">
            <div className="text-center">
              <motion.div
                className="text-2xl font-bold text-green-400"
                key={guessedCount}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                {guessedCount}
              </motion.div>
              <div className="text-white/60 text-sm">Guessed</div>
            </div>
            <div className="text-center">
              <motion.div
                className={`text-2xl font-bold ${
                  earned > 0
                    ? "text-yellow-300"
                    : earned < 0
                      ? "text-red-300"
                      : "text-white/80"
                }`}
                key={earned}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: pulse ? 1.2 : 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                  duration: 0.3,
                }}
              >
                ⭐ {earned}
              </motion.div>
              <div className="text-white/60 text-sm">Earned</div>
            </div>
            <div className="text-center">
              <motion.div
                className="text-2xl font-bold text-red-400"
                key={skippedCount}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                {skippedCount}
              </motion.div>
              <div className="text-white/60 text-sm">Skipped</div>
            </div>
          </div>

          <div className="space-y-2">
            {finalResults.map((result, index) => (
              <button
                key={index}
                onClick={() => toggleWord(index)}
                className={`w-full p-4 rounded-lg text-left transition ${
                  result.guessed
                    ? "bg-green-500/20 text-green-200"
                    : "bg-red-500/20 text-red-200"
                } hover:opacity-80`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{result.word}</span>
                  <span className="text-2xl">
                    {result.guessed ? "✅" : "❌"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Button at Bottom */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <button
          onClick={() => onConfirm(finalResults)}
          className="px-6 py-3 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition pointer-events-auto"
        >
          Confirm
        </button>
      </div>
    </motion.div>
  );
}
