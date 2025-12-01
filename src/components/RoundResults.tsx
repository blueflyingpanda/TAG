import { useState } from 'react';

interface RoundResultsProps {
  results: { word: string; guessed: boolean }[];
  onConfirm: (results: { word: string; guessed: boolean }[]) => void;
  onBack: () => void;
}

export default function RoundResults({ results, onConfirm, onBack }: RoundResultsProps) {
  const [finalResults, setFinalResults] = useState(results);

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

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-2xl w-full mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2 text-center">Round Results</h1>
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
          <div className="text-2xl font-bold text-green-400">{guessedCount}</div>
          <div className="text-white/60 text-sm">Guessed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{skippedCount}</div>
          <div className="text-white/60 text-sm">Skipped</div>
        </div>
      </div>


      <div className="space-y-2 max-h-[400px] overflow-y-auto mb-6">
        {finalResults.map((result, index) => (
          <button
            key={index}
            onClick={() => toggleWord(index)}
            className={`w-full p-4 rounded-lg text-left transition ${
              result.guessed
                ? 'bg-green-500/20 text-green-200'
                : 'bg-red-500/20 text-red-200'
            } hover:opacity-80`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{result.word}</span>
              <span className="text-2xl">{result.guessed ? '✅' : '❌'}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:opacity-90 transition"
        >
          Back
        </button>
        <button
          onClick={() => onConfirm(finalResults)}
          className="flex-1 px-6 py-3 bg-[#ECACAE] text-[#223164] rounded-lg font-semibold hover:opacity-90 transition"
        >
          Confirm & Next Round
        </button>
      </div>
    </div>
  );
}

