export default function Rules() {
  return (
    <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-6 shadow-sm md:p-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-text md:text-4xl">
        Alias Game Rules
      </h1>

      <div className="space-y-6 text-text">
        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">
            Basic Gameplay
          </h2>
          <p className="mb-3 text-text/80">
            <strong>Alias</strong> is a fun word-guessing game where teams
            compete to guess as many words as possible within a time limit.
          </p>
          <ul className="list-inside list-disc space-y-2 text-text/80">
            <li>Players are divided into teams</li>
            <li>One team player plays at a time while others guess</li>
            <li>
              The playing team gets a word and must describe it without saying
              the word itself
            </li>
            <li>Teammates try to guess the word</li>
            <li>Points are awarded for correct guesses</li>
            <li>The round ends when time runs out or all words are used</li>
          </ul>
        </div>

        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">Scoring</h2>
          <ul className="space-y-2 text-text/80">
            <li>
              <strong>Correct guess</strong>: +1 point
            </li>
            <li>
              <strong>Skip penalty</strong>: -1 point (if enabled)
            </li>
            <li>
              <strong>Win condition</strong>: First team to reach the target
              score wins
            </li>
            <li>
              <strong>Tiebreaker</strong>: If no team reaches the target when
              words run out, the team with highest score wins
            </li>
          </ul>
        </div>

        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">
            Game Configuration
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-text">Points Required</h3>
              <p className="text-sm text-text/70">
                Set the target score to win the game (default: 50 points)
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-text">Round Timer</h3>
              <p className="text-sm text-text/70">
                Time limit for each round (15-300 seconds, default: 60)
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-text">Skip Penalty</h3>
              <p className="text-sm text-text/70">
                Enable/disable point deduction for skipped words
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-text">Teams</h3>
              <p className="text-sm text-text/70">
                2-10 teams can play simultaneously
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">
            Theme Management
          </h2>
          <div className="space-y-3 text-text/80">
            <p>
              <strong>Theme Creation:</strong> Create custom word themes with
              your own word lists
            </p>
            <p>
              <strong>Theme Import:</strong> Import themes from external sources
              in JSON format
            </p>
            <p>
              <strong>Filtering:</strong> Filter by difficulty, language, your
              themes, favorites, verified status
            </p>
            <p>
              <strong>Search:</strong> Find themes by name or description
            </p>
            <p>
              <strong>Minimum words:</strong> Each theme must have at least 30
              words
            </p>
          </div>
        </div>

        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">
            Game Features
          </h2>
          <div className="grid gap-4 text-text/80 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-text">Game History</h3>
              <p className="text-sm">
                View all completed games and track statistics
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-text">Game Resumption</h3>
              <p className="text-sm">
                Resume unfinished games from where you left off
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-text">
                Cheating Detection
              </h3>
              <p className="text-sm">
                Monitors round start times to prevent unfair play
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-text">
                Result Confirmation
              </h3>
              <p className="text-sm">
                Review and confirm round results before scoring
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">
            How to Play
          </h2>
          <ol className="list-inside list-decimal space-y-2 text-text/80">
            <li>Choose a theme with words to guess</li>
            <li>Configure game settings (points, timer, teams)</li>
            <li>Take turns describing words to your team</li>
            <li>
              Click &quot;Guessed&quot; for correct answers, &quot;Skip&quot;
              for difficult words
            </li>
            <li>Review and confirm results after each round</li>
            <li>Continue until a team reaches the target score</li>
          </ol>
        </div>

        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">
            Difficulty Levels
          </h2>
          <div className="grid grid-cols-2 gap-2 text-center md:grid-cols-5">
            <div className="rounded-game bg-success/15 px-3 py-2 text-success">
              Very Easy
            </div>
            <div className="rounded-game bg-success/25 px-3 py-2 text-success">
              Easy
            </div>
            <div className="rounded-game bg-text/10 px-3 py-2 text-text">
              Medium
            </div>
            <div className="rounded-game bg-error/20 px-3 py-2 text-error">
              Hard
            </div>
            <div className="rounded-game bg-error/15 px-3 py-2 text-error">
              Very Hard
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
