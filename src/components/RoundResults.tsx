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
    const start = setTimeout(() => setPulse(true), 0);
    const end = setTimeout(() => setPulse(false), 300);
    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [earned]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-transparent p-4"
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
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="mx-auto w-full max-w-2xl rounded-game bg-card p-6 shadow-sm md:p-8">
          <h1 className="mb-2 text-center text-3xl font-bold text-text">
            Round Results
          </h1>
          <p className="mb-6 text-center text-text/60">
            Tap words to toggle between ✅ and ❌
          </p>
          {results.length === 0 && (
            <p className="mb-6 text-center text-text/60">
              No words were processed in this round.
            </p>
          )}

          <div className="mb-6 flex justify-center gap-6">
            <div className="text-center">
              <motion.div
                className="text-2xl font-bold text-success"
                key={guessedCount}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                {guessedCount}
              </motion.div>
              <div className="text-sm text-text/60">Guessed</div>
            </div>
            <div className="text-center">
              <motion.div
                className={`text-2xl font-bold ${
                  earned > 0
                    ? "text-success"
                    : earned < 0
                      ? "text-error"
                      : "text-text/80"
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
              <div className="text-sm text-text/60">Earned</div>
            </div>
            <div className="text-center">
              <motion.div
                className="text-2xl font-bold text-error"
                key={skippedCount}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                {skippedCount}
              </motion.div>
              <div className="text-sm text-text/60">Skipped</div>
            </div>
          </div>

          <div className="space-y-2">
            {finalResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleWord(index)}
                className={`w-full rounded-game p-4 text-left transition hover:opacity-90 ${
                  result.guessed
                    ? "border border-success/30 bg-success/15 text-text"
                    : "border border-error/30 bg-error/10 text-text"
                }`}
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

      <div className="pointer-events-none fixed bottom-4 left-0 right-0 flex justify-center">
        <button
          type="button"
          onClick={() => onConfirm(finalResults)}
          className="pointer-events-auto rounded-game bg-success px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          Confirm
        </button>
      </div>
    </motion.div>
  );
}
