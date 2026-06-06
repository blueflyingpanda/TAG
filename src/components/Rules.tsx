import { useLocale } from "../contexts/LocaleContext";

export default function Rules() {
  const { t } = useLocale();

  return (
    <div className="mx-auto w-full max-w-4xl rounded-game bg-card p-6 shadow-sm md:p-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-text md:text-4xl">
        {t.rules_title}
      </h1>

      <div className="space-y-6 text-text">
        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">{t.rules_basicGameplay}</h2>
          <p className="mb-3 text-text/80">
            <strong>Alias</strong> {t.rules_intro}
          </p>
          <ul className="list-inside list-disc space-y-2 text-text/80">
            <li>{t.rules_rule1}</li>
            <li>{t.rules_rule2}</li>
            <li>{t.rules_rule3}</li>
            <li>{t.rules_rule4}</li>
            <li>{t.rules_rule5}</li>
            <li>{t.rules_rule6}</li>
          </ul>
        </div>

        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">{t.rules_scoring}</h2>
          <ul className="space-y-2 text-text/80">
            <li><strong>{t.rules_score1.split(":")[0]}:</strong>{t.rules_score1.split(":")[1]}</li>
            <li><strong>{t.rules_score2.split(":")[0]}:</strong>{t.rules_score2.split(":")[1]}</li>
            <li><strong>{t.rules_score3.split(":")[0]}:</strong>{t.rules_score3.split(":")[1]}</li>
            <li><strong>{t.rules_score4.split(":")[0]}:</strong>{t.rules_score4.split(":")[1]}</li>
          </ul>
        </div>

        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">{t.rules_config}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-text">{t.rules_pointsRequired}</h3>
              <p className="text-sm text-text/70">{t.rules_pointsDesc}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-text">{t.rules_roundTimer}</h3>
              <p className="text-sm text-text/70">{t.rules_roundTimerDesc}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-text">{t.rules_skipPenalty}</h3>
              <p className="text-sm text-text/70">{t.rules_skipPenaltyDesc}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-text">{t.rules_teamsLabel}</h3>
              <p className="text-sm text-text/70">{t.rules_teamsDesc}</p>
            </div>
          </div>
        </div>

        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">{t.rules_themeManagement}</h2>
          <div className="space-y-3 text-text/80">
            {[t.rules_feat1, t.rules_feat2, t.rules_feat3, t.rules_feat4, t.rules_feat5].map((feat, i) => {
              const [bold, ...rest] = feat.split(":");
              return (
                <p key={i}><strong>{bold}:</strong>{rest.join(":")}</p>
              );
            })}
          </div>
        </div>

        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">{t.rules_gameFeatures}</h2>
          <div className="grid gap-4 text-text/80 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-text">{t.rules_gameHistory}</h3>
              <p className="text-sm">{t.rules_gameHistoryDesc}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-text">{t.rules_gameResumption}</h3>
              <p className="text-sm">{t.rules_gameResumptionDesc}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-text">{t.rules_cheatingDetection}</h3>
              <p className="text-sm">{t.rules_cheatingDetectionDesc}</p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-text">{t.rules_resultConfirmation}</h3>
              <p className="text-sm">{t.rules_resultConfirmationDesc}</p>
            </div>
          </div>
        </div>

        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">{t.rules_howToPlay}</h2>
          <ol className="list-inside list-decimal space-y-2 text-text/80">
            <li>{t.rules_step1}</li>
            <li>{t.rules_step2}</li>
            <li>{t.rules_step3}</li>
            <li>{t.rules_step4}</li>
            <li>{t.rules_step5}</li>
            <li>{t.rules_step6}</li>
          </ol>
        </div>

        <div className="rounded-game bg-text/[0.06] p-6">
          <h2 className="mb-4 text-2xl font-semibold text-success">{t.rules_difficultyLevels}</h2>
          <div className="grid grid-cols-2 gap-2 text-center md:grid-cols-5">
            <div className="rounded-game bg-success/15 px-3 py-2 text-success">{t.rules_veryEasy}</div>
            <div className="rounded-game bg-success/25 px-3 py-2 text-success">{t.rules_easy}</div>
            <div className="rounded-game bg-text/10 px-3 py-2 text-text">{t.rules_medium}</div>
            <div className="rounded-game bg-error/20 px-3 py-2 text-error">{t.rules_hard}</div>
            <div className="rounded-game bg-error/15 px-3 py-2 text-error">{t.rules_veryHard}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
